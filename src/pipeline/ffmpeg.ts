// Low-level ffmpeg/ffprobe process helpers shared by providers and compose.ts.
// Kept dependency-free (no imports from providers/) so providers can safely
// import these without creating a circular module graph.
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CaptionCue } from "@/providers/types";

const STDERR_TAIL_CHARS = 4000;

let filterListCache: Set<string> | null = null;

/**
 * Some ffmpeg builds (notably Homebrew's default `ffmpeg` formula, as opposed
 * to `ffmpeg-full`) are compiled without libass/libfreetype, so `subtitles`
 * and `drawtext` are unavailable. compose.ts feature-detects via this helper
 * and degrades gracefully (skips burned text) instead of failing the render.
 */
export async function filterAvailable(name: string): Promise<boolean> {
  if (!filterListCache) {
    try {
      const out = await run("ffmpeg", ["-hide_banner", "-filters"]);
      filterListCache = new Set(
        out
          .split("\n")
          .map((line) => line.trim().match(/^[.TSC]{2,3}\s+(\S+)\s/)?.[1])
          .filter((n): n is string => Boolean(n)),
      );
    } catch {
      filterListCache = new Set();
    }
  }
  return filterListCache.has(name);
}

/** Escape a filesystem path for safe embedding as an ffmpeg filter option
 * value (e.g. `subtitles=<path>`). This is filtergraph escaping, unrelated
 * to shell escaping — args are passed to spawn() as an array, never a shell. */
export function escapeFfmpegFilterPath(filePath: string): string {
  return filePath.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

/**
 * Spawn a binary (ffmpeg/ffprobe/say/...), collect stderr, and reject with a
 * useful error (including the tail of stderr) on non-zero exit.
 */
export function run(bin: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to spawn ${bin}: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      const tail = stderr.slice(-STDERR_TAIL_CHARS);
      reject(new Error(`${bin} ${args.join(" ")} exited with code ${code}:\n${tail}`));
    });
  });
}

/** Probe a media file's duration in milliseconds via ffprobe. */
export async function probeDurationMs(filePath: string): Promise<number> {
  const out = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  const seconds = parseFloat(out.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`ffprobe returned an invalid duration for ${filePath}: "${out.trim()}"`);
  }
  return Math.round(seconds * 1000);
}

/** Probe basic video stream info (width/height) via ffprobe. */
export async function probeVideoSize(filePath: string): Promise<{ width: number; height: number }> {
  const out = await run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=s=x:p=0",
    filePath,
  ]);
  const [w, h] = out.trim().split("x").map((n) => parseInt(n, 10));
  if (!w || !h) {
    throw new Error(`ffprobe returned no video stream for ${filePath}`);
  }
  return { width: w, height: h };
}

function formatAssTime(ms: number): string {
  const totalCentiseconds = Math.round(ms / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
}

/** Escape text for safe embedding inside an ASS dialogue line. */
function escapeAssText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}").replace(/\n/g, "\\N");
}

export interface AssCaptionOptions {
  width: number;
  height: number;
}

/**
 * Write an ASS subtitle file with large, bold, centered lower-third captions
 * (thick outline + drop shadow for legibility over any background). One cue
 * is visible at a time to create a karaoke-style "pop" effect.
 */
export async function writeAssCaptions(
  cues: CaptionCue[],
  outPath: string,
  opts: AssCaptionOptions,
): Promise<void> {
  const { width, height } = opts;
  // Font size scales with frame width so captions read clearly at both
  // 720p and 1080p vertical resolutions.
  const fontSize = Math.round(width * 0.072);
  const marginV = Math.round(height * 0.16); // lift captions above the very bottom edge

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
ScaledBorderAndShadow: yes
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Arial,${fontSize},&H00FFFFFF,&H00FFFFFF,&H00101010,&H00000000,-1,0,0,0,100,100,0,0,1,${Math.round(
    width * 0.008,
  )},${Math.round(width * 0.004)},2,40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const lines = cues.map((cue) => {
    const start = formatAssTime(cue.startMs);
    const end = formatAssTime(cue.endMs);
    return `Dialogue: 0,${start},${end},Caption,,0,0,0,,${escapeAssText(cue.text)}`;
  });

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, header + lines.join("\n") + "\n", "utf8");
}
