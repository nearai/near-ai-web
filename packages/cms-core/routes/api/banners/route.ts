export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@cms/lib/auth";
import { prisma } from "@cms/lib/prisma";
import { z } from "zod";

const bannerTypeEnum = z.enum(["TOP", "MODAL", "BOTTOM"]);
const bannerFrequencyEnum = z.enum(["ALWAYS", "ONCE_PER_SESSION", "DONT_SHOW_AGAIN"]);
const bannerContentModeEnum = z.enum(["EDITOR", "HTML"]);

export const bannerBaseSchema = z.object({
  name: z.string().min(1),
  type: bannerTypeEnum,
  paths: z.array(z.string().min(1)),
  enabled: z.boolean(),
  frequency: bannerFrequencyEnum,
  contentMode: bannerContentModeEnum,
  content: z.any().optional().nullable(),
  htmlContent: z.string().optional().nullable(),
  modalDelaySeconds: z.number().int().min(0).max(600).optional().nullable(),
  modalScrollPercent: z.number().int().min(0).max(100).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export function refineBannerRules<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .refine((d: any) => d.contentMode !== "EDITOR" || !!d.content, {
      message: "content is required when contentMode is EDITOR",
      path: ["content"],
    })
    .refine((d: any) => d.contentMode !== "HTML" || !!d.htmlContent, {
      message: "htmlContent is required when contentMode is HTML",
      path: ["htmlContent"],
    })
    .refine((d: any) => !d.startDate || !d.endDate || new Date(d.startDate) < new Date(d.endDate), {
      message: "startDate must be before endDate",
      path: ["endDate"],
    });
}

export const createBannerSchema = refineBannerRules(bannerBaseSchema);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.banner.count(),
    ]);

    return NextResponse.json({ banners, total, page, limit });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = createBannerSchema.parse(body);

    const banner = await prisma.banner.create({
      data: {
        ...data,
        content: data.contentMode === "EDITOR" ? data.content : undefined,
        htmlContent: data.contentMode === "HTML" ? data.htmlContent : undefined,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        authorId: session.user.id,
      },
    });

    try {
      await (prisma as any).auditLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email ?? "",
          action: "CREATE",
          entityType: "BANNER",
          entityId: banner.id,
          entityTitle: banner.name,
        },
      });
    } catch (auditError) {
      console.error("Audit log failed:", auditError);
    }

    revalidatePath("/", "layout");

    return NextResponse.json(banner, { status: 201 });
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

    console.error("Error creating banner:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
