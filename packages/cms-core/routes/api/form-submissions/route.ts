export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@cms/lib/auth";
import { prisma } from "@cms/lib/prisma";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [submissions, total] = await Promise.all([
    (prisma as any).formSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    (prisma as any).formSubmission.count({ where }),
  ]);

  return NextResponse.json({ submissions, total });
}
