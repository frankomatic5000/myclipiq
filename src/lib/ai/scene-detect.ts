import { exec } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, unlink } from "fs/promises";

const execAsync = promisify(exec);

export interface SceneChange {
  timestamp: number;
  pts_time: string;
}

export async function detectScenes(videoBuffer: Buffer, filename: string): Promise<SceneChange[]> {
  const tempPath = join(tmpdir(), `scene-${Date.now()}-${filename}`);
  await writeFile(tempPath, videoBuffer);

  try {
    const { stdout } = await execAsync(
      `ffmpeg -i "${tempPath}" -filter_complex "select='gt(scene,0.6)',showinfo" -f null - 2>&1`,
      { timeout: 120000 }
    );

    const scenes: SceneChange[] = [];
    const lines = stdout.split("\n");

    for (const line of lines) {
      if (line.includes("pts_time:")) {
        const match = line.match(/pts_time:([\d.]+)/);
        if (match) {
          const ts = parseFloat(match[1]);
          scenes.push({ timestamp: ts, pts_time: match[1] });
        }
      }
    }

    return scenes;
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}
