// Rewritten presign route using env R2_PUBLIC_URL
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    if (!r2) {
      return NextResponse.json(
        { error: "R2 storage not configured" },
        { status: 503 }
      );
    }

    const { filename, contentType } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    const timestamp = Date.now();
    const key = `uploads/${timestamp}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    // Prefer env-defined public URL over hardcoded
    const base =
      process.env.R2_PUBLIC_URL ||
      process.env.R2_ENDPOINT ||
      `https://${R2_BUCKET}.r2.dev`;

    const publicUrl = `${base.replace(/\/$/, "")}/${key}`;

    return NextResponse.json({ presignedUrl, key, publicUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}