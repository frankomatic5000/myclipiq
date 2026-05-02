import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { generatePresignedUrl } from "@/lib/r2/presigned-url";
import { z } from "zod";

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
]);

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().refine((type) => ALLOWED_VIDEO_TYPES.has(type), {
    message: "Unsupported video content type",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res }, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = presignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { filename, contentType } = parsed.data;
    const { url, key } = await generatePresignedUrl(
      session.user.id,
      filename,
      contentType
    );

    const { data: upload, error: uploadError } = await supabase
      .from("video_uploads")
      .insert({
        user_id: session.user.id,
        r2_key: key,
        filename,
        content_type: contentType,
        status: "uploaded",
      })
      .select("id")
      .single();

    if (uploadError || !upload) {
      console.error("Upload record error:", uploadError);
      return NextResponse.json(
        { error: "Failed to create upload record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url, key, uploadId: upload.id });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
