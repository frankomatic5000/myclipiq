import { r2Client, R2_BUCKET } from "./client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export async function generatePresignedUrl(
  userId: string,
  filename: string,
  contentType: string,
  folder: string = "uploads/"
): Promise<{ url: string; key: string }> {
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}${userId}/${randomUUID()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  return { url, key };
}
