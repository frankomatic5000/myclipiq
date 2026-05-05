import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { analyzeVideoFromStream } from "@/lib/ai/analyze-video";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const analyzeSchema = z.object({
  uploadId: z.string().uuid(),
  r2Key: z.string().min(1).max(1024),
  filename: z.string().min(1).max(255).optional().default("upload.mp4"),
});

function isValidR2Key(key: string, userId: string): boolean {
  const expectedPrefix = `uploads/${userId}/`;
  if (!key.startsWith(expectedPrefix)) return false;
  if (key.includes("..")) return false;
  if (/[\x00-\x1f\x7f\\]/.test(key)) return false;
  return true;
}

// POST /api/ai/analyze — queues a background analysis job via pgmq
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

    if (!isValidR2Key(r2Key, session.user.id)) {
      return NextResponse.json({ error: "Invalid upload key" }, { status: 400 });
    }

    // Verify upload exists and belongs to user
    const { data: upload, error: uploadError } = await supabase
      .from("video_uploads")
      .select("id, status, content_type")
      .eq("id", uploadId)
      .eq("user_id", session.user.id)
      .eq("r2_key", r2Key)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Extra safety: verify content-type matches a known video MIME
    const ALLOWED_VIDEO_TYPES = new Set([
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-msvideo",
    ]);
    if (!ALLOWED_VIDEO_TYPES.has(upload.content_type || "")) {
      return NextResponse.json(
        { error: "Unsupported video content type" },
        { status: 400 }
      );
    }

    // Prevent double-analysis if already processing or completed
    if (upload.status === "processing" || upload.status === "completed") {
      return NextResponse.json(
        { error: `Upload already ${upload.status}` },
        { status: 409 }
      );
    }

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from("ai_analyses")
      .insert({
        upload_id: uploadId,
        user_id: session.user.id,
        status: "processing",
      })
      .select("id")
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: "Failed to create analysis record" },
        { status: 500 }
      );
    }

    // Create job record with retry metadata
    const { data: job, error: jobError } = await supabase
      .from("analysis_jobs")
      .insert({
        upload_id: uploadId,
        user_id: session.user.id,
        analysis_id: analysis.id,
        status: "queued",
        retry_count: 0,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Failed to create job record" },
        { status: 500 }
      );
    }

    // Enqueue job into pgmq — this is the background processing mechanism
    const svcClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: enqueueError } = await svcClient.rpc("pgmq_send", {
      queue_name: "analysis_queue",
      message: JSON.stringify({
        job_id: job.id,
        upload_id: uploadId,
        analysis_id: analysis.id,
        user_id: session.user.id,
        r2_key: r2Key,
        filename,
      }),
    });

    if (enqueueError) {
      // Fallback: try direct SQL via pgmq
      const { error: fallbackError } = await svcClient.rpc("pgmq_enqueue", {
        v_queue_name: "analysis_queue",
        v_message: JSON.stringify({
          job_id: job.id,
          upload_id: uploadId,
          analysis_id: analysis.id,
          user_id: session.user.id,
          r2_key: r2Key,
          filename,
        }),
      });

      if (fallbackError) {
        // Mark job as failed if we can't queue it
        await supabase
          .from("analysis_jobs")
          .update({ status: "failed", error_message: "Failed to enqueue job" })
          .eq("id", job.id);

        await supabase
          .from("ai_analyses")
          .update({ status: "failed" })
          .eq("id", analysis.id);

        return NextResponse.json(
          { error: "Failed to queue background job" },
          { status: 500 }
        );
      }
    }

    // Update upload status to processing
    await supabase
      .from("video_uploads")
      .update({ status: "processing" })
      .eq("id", uploadId)
      .eq("user_id", session.user.id);

    return NextResponse.json({
      jobId: job.id,
      analysisId: analysis.id,
      status: "queued",
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

    const result = await analyzeVideoFromStream(
      response.Body as ReadableStream<Uint8Array>,
      filename
    );

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
