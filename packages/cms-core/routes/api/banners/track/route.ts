export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cms/lib/prisma";
import { z } from "zod";

const trackSchema = z.object({
  id: z.string().min(1),
  event: z.enum(["VIEW", "CLICK", "DISMISS"]),
});

const COUNTER_FIELD = {
  VIEW: "viewCount",
  CLICK: "clickCount",
  DISMISS: "dismissCount",
} as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, event } = trackSchema.parse(body);

    await prisma.banner.update({
      where: { id },
      data: { [COUNTER_FIELD[event]]: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch {
    // Best-effort — never surface an error to anonymous site visitors.
    return NextResponse.json({ success: true });
  }
}
