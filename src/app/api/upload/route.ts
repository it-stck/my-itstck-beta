import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2 MB" },
        { status: 400 }
      );
    }

    // Check storage configuration
    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!accountId || !bucketName || !accessKeyId || !secretAccessKey || !publicUrl) {
      // Fallback: use dicebear avatar if no storage configured
      return NextResponse.json({
        error: "Storage not configured. Set R2_* environment variables.",
      }, { status: 503 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.type.split("/")[1];
    const filename = `avatars/${session.user.id}-${Date.now()}.${ext}`;

    // Upload to R2 via S3-compatible API
    const r2Endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    const uploadUrl = `${r2Endpoint}/${bucketName}/${filename}`;

    // Simple presigned PUT (or direct PUT with AWS Sig V4)
    // For simplicity, we use a direct PUT with the R2 API
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const s3 = new S3Client({
      region: "auto",
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000",
      })
    );

    const imageUrl = `${publicUrl}/${filename}`;

    // Update user avatar
    await db.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ data: { url: imageUrl } });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
