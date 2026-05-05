import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { S3Client, GetObjectCommand } from "jsr:@aws-sdk/client-s3";
import { OpenAI } from "jsr:@openai/openai";

// ─── Constants ───────────────────────────────────────────────
const ORPHAN_TIMEOUT_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_RETRIES = 3;

// Initialize clients lazily to avoid build issues
function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: Deno.env.get("R2_ENDPOINT")!,
    credentials: {
      accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
      secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
    },
  });
}

function getOpenAIClient(): OpenAI {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (apiKey) {
    return new OpenAI({ apiKey });
  }
  const ollamaUrl = Deno.env.get("OLLAMA_BASE_URL") || "http://localhost:11434";
  return new OpenAI({ baseURL: `${ollamaUrl}/v1`, apiKey: "ollama" });
}

function getVisionModel(): string {
  return Deno.env.get("OPENAI_API_KEY") ? "gpt-4o" : "llava";
}

function safeTempFilename(filename: string): string {
  return (filename || "upload.mp4").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "upload.mp4";
}

// ─── Supabase REST helpers ───────────────────────────────────
function sbHeaders(supabaseKey: string) {
  return {
    Authorization: `Bearer ${supabaseKey}`,
    apikey: supabaseKey,
    "Content-Type": "application/json",
  };
}

async function sbPatch(
  supabaseUrl: string,
  supabaseKey: string,
  table: string,
  id: string,
  payload: Record<string, unknown>
) {
  return fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...sbHeaders(supabaseKey), Prefer: "return=minimal" },
    body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
  });
}

// ─── Frame extraction ────────────────────────────────────────
async function extractFramesFromR2(
  r2Client: S3Client,
  bucket: string,
  r2Key: string,
  frameDir: string
): Promise<string[]> {
  const tempPath = `/tmp/analysis-${Date.now()}-${safeTempFilename(r2Key)}`;

  const command = new GetObjectCommand({ Bucket: bucket, Key: r2Key });
  const response = await r2Client.send(command);
  const body = response.Body;
  if (!body) throw new Error("Empty R2 response body");

  const chunks: Uint8Array[] = [];
  // @ts-ignore - ReadableStream is not typed in Deno global scope
  const reader = body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const videoBuffer = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  let offset = 0;
  for (const chunk of chunks) {
    videoBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  Deno.writeFileSync(tempPath, videoBuffer, { mode: 0o600 });

  try {
    const ffmpegProcess = new Deno.Command("ffmpeg", {
      args: [
        "-hide_banner", "-loglevel", "error",
        "-i", tempPath,
        "-vf", "fps=1/5,scale=512:-1",
        "-frames:v", "6",
        `${frameDir}/frame_%03d.jpg`,
      ],
    });

    const { code, stderr } = await ffmpegProcess.output();
    if (code !== 0) {
      const errText = new TextDecoder().decode(stderr);
      throw new Error(`ffmpeg failed: ${errText}`);
    }

    const frames: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const framePath = `${frameDir}/frame_${String(i).padStart(3, "0")}.jpg`;
      try {
        const frameData = await Deno.readFile(framePath);
        frames.push(`data:image/jpeg;base64,${btoa(String.fromCharCode(...frameData))}`);
      } catch {
        break;
      }
    }
    return frames;
  } finally {
    try { await Deno.remove(tempPath); } catch {}
  }
}

// ─── AI Analysis ─────────────────────────────────────────────
async function analyzeFrames(frames: string[]): Promise<{
  engagement_score: number;
  summary: string;
  clip_suggestions: Array<{ start: number; end: number; platform: string; hook_text: string }>;
  sentiment: string;
  pacing: string;
  key_moments: string[];
}> {
  const client = getOpenAIClient();
  const model = getVisionModel();

  const messages = [
    {
      role: "system" as const,
      content:
        "You are a video content analyst. Analyze the provided video frames for social media engagement potential. Return a JSON object with: engagement_score (0-100), summary (string), clip_suggestions (array of {start_seconds, end_seconds, platform, hook_text}), sentiment (string), pacing (string), key_moments (array of strings).",
    },
    {
      role: "user" as const,
      content: [
        { type: "text" as const, text: "Analyze these video frames for engagement potential." },
        ...frames.map((f) => ({ type: "image_url" as const, image_url: { url: f } })),
      ],
    },
  ];

  const response = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 2048,
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const cleaned = raw.replace(/```json\s?/gi, "").replace(/```\s?/gi, "").trim();
  return JSON.parse(cleaned);
}

// ─── Main handler ────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("job_id");

  if (!jobId) {
    return new Response(JSON.stringify({ error: "job_id required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Fetch job with current retry_count
  const dbResp = await fetch(
    `${supabaseUrl}/rest/v1/analysis_jobs?id=eq.${jobId}&select=*,retry_count`,
    { headers: sbHeaders(supabaseKey) }
  );

  const jobs = await dbResp.json();
  if (!jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ error: "Job not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const job = jobs[0];

  // ── Idempotency: already completed ──────────────────────────
  if (job.status === "completed") {
    return new Response(JSON.stringify({ success: true, job_id: jobId, idempotent: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Idempotency: already failed ───────────────────────────
  if (job.status === "failed") {
    return new Response(JSON.stringify({ error: "Job already failed", job_id: jobId, idempotent: true }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Timeout / orphan detection ─────────────────────────────
  if (job.status === "processing" && job.updated_at) {
    const lastUpdated = new Date(job.updated_at).getTime();
    const now = Date.now();
    const elapsed = now - lastUpdated;

    if (elapsed > ORPHAN_TIMEOUT_MS) {
      const currentRetries = job.retry_count || 0;
      if (currentRetries >= MAX_RETRIES) {
        // Dead-letter
        await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, {
          status: "failed",
          error_message: "Job timed out and exceeded max retries (dead-letter)",
          completed_at: new Date().toISOString(),
        });
        if (job.analysis_id) {
          await sbPatch(supabaseUrl, supabaseKey, "ai_analyses", job.analysis_id, { status: "failed" });
        }
        if (job.upload_id) {
          await sbPatch(supabaseUrl, supabaseKey, "video_uploads", job.upload_id, { status: "failed" });
        }
        return new Response(JSON.stringify({ error: "Job dead-lettered after max retries" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // Retry: reset to queued and bump retry_count
        await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, {
          status: "queued",
          retry_count: currentRetries + 1,
          started_at: null,
          error_message: `Timeout detected after ${Math.round(elapsed / 1000)}s. Retry #${currentRetries + 1}.`,
        });
        return new Response(JSON.stringify({
          retry_scheduled: true,
          job_id: jobId,
          retry_count: currentRetries + 1,
          note: "Job re-queued due to timeout",
        }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  // ── Only proceed if actually queued ────────────────────────
  if (job.status !== "queued") {
    return new Response(JSON.stringify({ error: "Job not in queued state", current_status: job.status }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Mark as processing
  await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, {
    status: "processing",
    started_at: new Date().toISOString(),
  });

  const r2Client = getR2Client();
  const bucket = Deno.env.get("R2_BUCKET") || "myclipiq-assets";

  try {
    // Get upload record for R2 key
    const uploadResp = await fetch(
      `${supabaseUrl}/rest/v1/video_uploads?id=eq.${job.upload_id}&select=r2_key,filename&limit=1`,
      { headers: sbHeaders(supabaseKey) }
    );
    const uploads = await uploadResp.json();
    if (!uploads || uploads.length === 0) throw new Error("Upload not found");

    const { r2_key, filename } = uploads[0];

    const frameDir = await Deno.makeTempDir({ prefix: "myclipiq-frames-" });
    let frames: string[] = [];

    try {
      await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, { progress_pct: 20 });

      frames = await extractFramesFromR2(r2Client, bucket, r2_key, frameDir);
      if (frames.length === 0) throw new Error("No frames extracted");

      await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, { progress_pct: 50 });

      const analysis = await analyzeFrames(frames);

      await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, { progress_pct: 80 });

      // Update analysis record if exists
      if (job.analysis_id) {
        await sbPatch(supabaseUrl, supabaseKey, "ai_analyses", job.analysis_id, {
          status: "completed",
          engagement_score: analysis.engagement_score,
          clip_suggestions: analysis.clip_suggestions,
          results: {
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            pacing: analysis.pacing,
            key_moments: analysis.key_moments,
          },
        });
      }

      // Update upload status
      await sbPatch(supabaseUrl, supabaseKey, "video_uploads", job.upload_id, { status: "completed" });

      // Mark job complete
      await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, {
        status: "completed",
        progress_pct: 100,
        completed_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true, job_id: jobId }), {
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      try { await Deno.remove(frameDir, { recursive: true }); } catch {}
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const currentRetries = job.retry_count || 0;

    if (currentRetries >= MAX_RETRIES) {
      // Dead-letter
      await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, {
        status: "failed",
        error_message: `${errorMessage} | Max retries exceeded (dead-letter)`,
        completed_at: new Date().toISOString(),
      });
    } else {
      // Re-queue for retry
      await sbPatch(supabaseUrl, supabaseKey, "analysis_jobs", jobId, {
        status: "queued",
        retry_count: currentRetries + 1,
        error_message: `${errorMessage} | Retry #${currentRetries + 1} scheduled.`,
        started_at: null,
      });
    }

    if (job.analysis_id) {
      await sbPatch(supabaseUrl, supabaseKey, "ai_analyses", job.analysis_id, { status: "failed" });
    }
    if (job.upload_id) {
      await sbPatch(supabaseUrl, supabaseKey, "video_uploads", job.upload_id, { status: "failed" });
    }

    return new Response(JSON.stringify({ error: errorMessage, retry_count: currentRetries + 1 }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
