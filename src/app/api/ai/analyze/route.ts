import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const analyzeSchema = z.object({
  uploadId: z.string().uuid(),
  r2Key: z.string().min(1).max(1024),
  filename: z.string().min(1).max(255).optional().default("upload.mp4"),
});

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

    const expectedPrefix = `uploads/${session.user.id}/`;
    if (!r2Key.startsWith(expectedPrefix) || r2Key.includes("..")) {
      return NextResponse.json({ error: "Invalid upload key" }, { status: 400 });
    }

    // Verify upload exists and belongs to user
    const { data: upload, error: uploadError } = await supabase
      .from("video_uploads")
      .select("id, status")
      .eq("id", uploadId)
      .eq("user_id", session.user.id)
      .eq("r2_key", r2Key)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
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

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from("analysis_jobs")
      .insert({
        upload_id: uploadId,
        user_id: session.user.id,
        analysis_id: analysis.id,
        status: "queued",
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