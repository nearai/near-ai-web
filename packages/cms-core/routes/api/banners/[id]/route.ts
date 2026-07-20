export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@cms/lib/auth";
import { prisma } from "@cms/lib/prisma";
import { z } from "zod";
import { bannerBaseSchema, refineBannerRules, findConflictingBanner } from "../route";

const updateBannerSchema = refineBannerRules(bannerBaseSchema.partial());

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const banner = await prisma.banner.findUnique({ where: { id } });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateBannerSchema.parse(body);

    const resolvedType = data.type ?? banner.type;
    const resolvedPaths = data.paths ?? banner.paths;
    const resolvedEnabled = data.enabled ?? banner.enabled;

    if (resolvedEnabled) {
      const conflict = await findConflictingBanner(resolvedType, resolvedPaths, id);
      if (conflict) {
        return NextResponse.json(
          {
            error: `Another enabled ${resolvedType} banner ("${conflict.name}") already targets an overlapping page. Disable it or narrow the pages before enabling this one.`,
          },
          { status: 409 }
        );
      }
    }

    const resolvedContentMode = data.contentMode ?? banner.contentMode;

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
        content: resolvedContentMode === "EDITOR" ? (data.content ?? undefined) : data.contentMode ? null : undefined,
        htmlContent: resolvedContentMode === "HTML" ? (data.htmlContent ?? undefined) : data.contentMode ? null : undefined,
        startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
        endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
      },
    });

    try {
      await (prisma as any).auditLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email ?? "",
          action: "UPDATE",
          entityType: "BANNER",
          entityId: updatedBanner.id,
          entityTitle: updatedBanner.name,
        },
      });
    } catch (auditError) {
      console.error("Audit log failed:", auditError);
    }

    revalidatePath("/", "layout");

    return NextResponse.json(updatedBanner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          ...(process.env.NODE_ENV === "development" && { details: error.issues }),
        },
        { status: 400 }
      );
    }

    console.error("Error updating banner:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    await prisma.banner.delete({ where: { id } });

    try {
      await (prisma as any).auditLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email ?? "",
          action: "DELETE",
          entityType: "BANNER",
          entityId: banner.id,
          entityTitle: banner.name,
        },
      });
    } catch (auditError) {
      console.error("Audit log failed:", auditError);
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
