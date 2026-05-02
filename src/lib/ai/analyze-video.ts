import { OpenAI } from "openai";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, readFile, unlink } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface ClipSuggestion {
  start: number;
  end: number;
  platform: string;
  hook_text: string;
}

export interface AnalysisResult {
  engagement_score: number;
  summary: string;
  clip_suggestions: ClipSuggestion[];
  sentiment: string;
  pacing: string;
  key_moments: string[];
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    return new OpenAI({ apiKey });
  }
  const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  return new OpenAI({
    baseURL: `${ollamaUrl}/v1`,
    apiKey: "ollama",
  });
}

function getVisionModel(): string {
  return process.env.OPENAI_API_KEY ? "gpt-4o" : "llava";
}

async function extractFrames(videoPath: string): Promise<string[]> {
  const frameDir = join(tmpdir(), `frames-${Date.now()}`);
  await execAsync(`mkdir -p "${frameDir}"`);

  await execAsync(
    `ffmpeg -i "${videoPath}" -vf "fps=1/5,scale=512:-1" -frames:v 6 "${frameDir}/frame_%03d.jpg"`,
    { timeout: 120000 }
  );

  const frames: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const framePath = join(frameDir, `frame_${String(i).padStart(3, "0")}.jpg`);
    try {
      const buf = await readFile(framePath);
      frames.push(`data:image/jpeg;base64,${buf.toString("base64")}`);
    } catch {
      break;
    }
  }

  return frames;
}

export async function analyzeVideo(
  videoBuffer: Buffer,
  filename: string
): Promise<AnalysisResult> {
  const client = getOpenAIClient();
  const model = getVisionModel();

  const tempPath = join(tmpdir(), `analyze-${Date.now()}-${filename}`);
  await writeFile(tempPath, videoBuffer);

  try {
    const frames = await extractFrames(tempPath);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a video content analyst. Analyze the provided video frames for social media engagement potential. Return a JSON object with: engagement_score (0-100), summary (string), clip_suggestions (array of {start_seconds, end_seconds, platform, hook_text}), sentiment (string), pacing (string), key_moments (array of strings).",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze these video frames for engagement potential." },
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
    const parsed = JSON.parse(cleaned);

    return {
      engagement_score: parsed.engagement_score || 50,
      summary: parsed.summary || "",
      clip_suggestions: (parsed.clip_suggestions || []).map((c: any) => ({
        start: c.start_seconds || 0,
        end: c.end_seconds || 15,
        platform: c.platform || "TikTok",
        hook_text: c.hook_text || "",
      })),
      sentiment: parsed.sentiment || "neutral",
      pacing: parsed.pacing || "medium",
      key_moments: parsed.key_moments || [],
    };
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}
