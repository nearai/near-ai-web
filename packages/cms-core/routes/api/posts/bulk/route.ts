export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@cms/lib/auth";
import { prisma } from "@cms/lib/prisma";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required"),
  action: z.enum(["publish", "archive", "delete"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { ids, action } = parsed.data;
  const userRole = (session.user as any)?.role;
  const userId = session.user.id;

  // Editors can only act on their own posts
  const where =
    userRole === "ADMIN"
      ? { id: { in: ids } }
      : { id: { in: ids }, authorId: userId };

  if (action === "delete") {
    await prisma.post.deleteMany({ where });
  } else if (action === "publish") {
    // Only stamp publishedAt for posts being published for the first time —
    // republishing (e.g. an archived post) must keep its original date.
    await prisma.post.updateMany({
      where: { ...where, publishedAt: null },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    await prisma.post.updateMany({
      where: { ...where, publishedAt: { not: null } },
      data: { status: "PUBLISHED" },
    });
  } else {
    await prisma.post.updateMany({ where, data: { status: "ARCHIVED" } });
  }

  return NextResponse.json({ success: true });
}
