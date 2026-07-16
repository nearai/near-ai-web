export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@cms/lib/auth";
import { createS3Client } from "@cms/lib/s3";

const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DOWNLOAD_MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface FileTypeConfig {
  ext: string;
  maxSize: number;
  validExtensions: string[];
}

const ALLOWED_TYPES: Record<string, FileTypeConfig> = {
  "image/jpeg": { ext: "jpg", maxSize: IMAGE_MAX_SIZE, validExtensions: ["jpg", "jpeg"] },
  "image/png": { ext: "png", maxSize: IMAGE_MAX_SIZE, validExtensions: ["png"] },
  "image/webp": { ext: "webp", maxSize: IMAGE_MAX_SIZE, validExtensions: ["webp"] },
  "image/gif": { ext: "gif", maxSize: IMAGE_MAX_SIZE, validExtensions: ["gif"] },
  "image/svg+xml": { ext: "svg", maxSize: IMAGE_MAX_SIZE, validExtensions: ["svg"] },
  "application/pdf": { ext: "pdf", maxSize: DOWNLOAD_MAX_SIZE, validExtensions: ["pdf"] },
  "application/zip": { ext: "zip", maxSize: DOWNLOAD_MAX_SIZE, validExtensions: ["zip"] },
  "application/x-zip-compressed": { ext: "zip", maxSize: DOWNLOAD_MAX_SIZE, validExtensions: ["zip"] },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    ext: "docx",
    maxSize: DOWNLOAD_MAX_SIZE,
    validExtensions: ["docx"],
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    ext: "pptx",
    maxSize: DOWNLOAD_MAX_SIZE,
    validExtensions: ["pptx"],
  },
  "video/mp4": { ext: "mp4", maxSize: DOWNLOAD_MAX_SIZE, validExtensions: ["mp4"] },
};

function resolveFileType(file: File): FileTypeConfig | null {
  if (file.type === "application/octet-stream") {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "zip") return ALLOWED_TYPES["application/zip"];
    return null;
  }
  return ALLOWED_TYPES[file.type] ?? null;
}

const uploadRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = uploadRateLimit.get(userId);
  if (!entry || now > entry.resetAt) {
    uploadRateLimit.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json({ error: "Too many uploads. Try again in a minute." }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const config = resolveFileType(file);
  if (!config) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > config.maxSize) {
    const maxMb = config.maxSize / (1024 * 1024);
    return NextResponse.json({ error: `File too large (max ${maxMb}MB)` }, { status: 400 });
  }

  const reportedExt = file.name.split(".").pop()?.toLowerCase();
  if (!reportedExt || !config.validExtensions.includes(reportedExt)) {
    return NextResponse.json(
      { error: "File extension does not match its declared type" },
      { status: 400 }
    );
  }

  const ext = config.ext;
  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const s3 = createS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const url = `${process.env.R2_PUBLIC_URL}/${key}`;

  try {
    const { prisma } = await import("@cms/lib/prisma");
    await prisma.media.create({
      data: { url, filename: file.name, mimeType: file.type, size: file.size },
    });
  } catch (e) {
    console.error("Failed to save media record", e);
  }

  return NextResponse.json({ url }, { status: 201 });
}
