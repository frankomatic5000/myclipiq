import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { analyzeVideo } from "@/lib/ai/analyze-video";
import { z } from "zod";

const analyzeSchema = z.object({
  uploadId: z.string().uuid(),
  r2Key: z.string().min(1).max(1024),
  filename: z.string().min(1).max(255).optional().default("upload.mp4"),
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

    const parsed = analyzeSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { uploadId, r2Key, filename } = parsed.data;
    const expectedPrefix = `uploads/${session.user.id}/`;
    if (!r2Key.startsWith(expectedPrefix) || r2Key.includes("..")) {
      return NextResponse.json({ error: "Invalid upload key" }, { status: 400 });
    }

    const { data: upload, error: uploadError } = await supabase
      .from("video_uploads")
      .select("id")
      .eq("id", uploadId)
      .eq("user_id", session.user.id)
      .eq("r2_key", r2Key)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    await supabase
      .from("video_uploads")
      .update({ status: "processing" })
      .eq("id", uploadId)
      .eq("user_id", session.user.id);

    const { data: analysis, error } = await supabase
      .from("ai_analyses")
      .insert({
        upload_id: uploadId,
        user_id: session.user.id,
        status: "processing",
      })
      .select("id")
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { error: "Failed to create analysis record" },
        { status: 500 }
      );
    }

    // Trigger async analysis in background (fire-and-forget)
    processAnalysis(uploadId, r2Key, filename, analysis.id, session.user.id).catch(
      (err) => console.error("Background analysis failed:", err)
    );

    return NextResponse.json({
      analysisId: analysis.id,
      status: "processing",
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Failed to start analysis" },
      { status: 500 }
    );
  }
}

async function processAnalysis(
  uploadId: string,
  r2Key: string,
  filename: string,
  analysisId: string,
  userId: string
) {
  const { GetObjectCommand, S3Client } = await import("@aws-sdk/client-s3");
  const { r2Client, R2_BUCKET } = await import("@/lib/r2/client");
  const { createClient } = await import("@supabase/supabase-js");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: r2Key,
    });
    const response = await r2Client.send(getCommand);
    const videoBuffer = await response.Body!.transformToByteArray();

    const result = await analyzeVideo(Buffer.from(videoBuffer), filename);

    await supabase
      .from("ai_analyses")
      .update({
        status: "completed",
        engagement_score: result.engagement_score,
        clip_suggestions: result.clip_suggestions,
        results: {
          summary: result.summary,
          sentiment: result.sentiment,
          pacing: result.pacing,
          key_moments: result.key_moments,
        },
      })
      .eq("id", analysisId)
      .eq("user_id", userId);

    await supabase
      .from("video_uploads")
      .update({ status: "completed" })
      .eq("id", uploadId)
      .eq("user_id", userId);
  } catch (err) {
    await supabase
      .from("ai_analyses")
      .update({ status: "failed" })
      .eq("id", analysisId)
      .eq("user_id", userId);

    await supabase
      .from("video_uploads")
      .update({ status: "failed" })
      .eq("id", uploadId)
      .eq("user_id", userId);

    throw err;
  }
}
