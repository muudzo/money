// Builds the final vertical MP4: Ken-Burns avatar motion, a bottom gradient
// scrim, burned-in captions (when the ffmpeg build supports it), mixed
// voice+music audio, and an optional watermark. Designed to degrade
// gracefully rather than fail: text-rendering filters (`subtitles`,
// `drawtext`) require libass/libfreetype, which not every ffmpeg build
// includes (notably Homebrew's default `ffmpeg` formula, as opposed to
// `ffmpeg-full`) — compose.ts detects this at runtime and skips those two
// steps rather than throwing, so a render always produces a valid MP4.
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CompletedAsset } from "@/lib/jobs";
import { ensureDir, jobDir, STORAGE_ROOT } from "@/lib/storage";
import { escapeFfmpegFilterPath, filterAvailable, probeVideoSize, run, writeAssCaptions } from "@/pipeline/ffmpeg";
import { renderCaptionImages, type RenderedCaption } from "@/pipeline/caption-images";
import type { CaptionCue } from "@/providers/types";

const FPS = 30;
const MAX_ZOOM = 1.12;
const TAIL_SEC = 0.4;
const MUSIC_VOLUME = 0.12;
/** Gradient scrim: stacked semi-transparent bands from this fraction of the
 * frame height down to the bottom, ramping opacity for a smooth-looking
 * gradient using only the `drawbox` filter (no alpha-gradient filter needed). */
const SCRIM_START_FRACTION = 0.55;
const SCRIM_MAX_ALPHA = 0.6;
const SCRIM_BANDS = 14;

export interface ComposeInput {
  jobId: string;
  /** Absolute path to the avatar still image, or a video clip if isAvatarVideo. */
  avatarClipPath: string;
  isAvatarVideo: boolean;
  /** Absolute path to the synthesized voiceover mp3. */
  audioPath: string;
  /** Measured duration of the voiceover in ms. */
  voiceDurationMs: number;
  cues: CaptionCue[];
  width: number;
  height: number;
  watermark: boolean;
  /** Absolute path to an optional looping background music bed. */
  musicPath?: string;
}

/** Sanitize cue text for a drawtext `text='…'` value. Inside single quotes the
 * ffmpeg filtergraph treats content literally, so the only real hazards are
 * quotes/backslashes themselves and %{ expansion triggers. Apostrophes become
 * typographic ’ (renders identically, avoids quoting hell entirely). */
function sanitizeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "")
    .replace(/'/g, "’")
    .replace(/%\{/g, "%​{")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Caption fallback for ffmpeg builds without libass: one timed drawtext per
 * cue (enable=between), centered in the scrim zone. Long cues shrink to fit
 * the frame width. Visually simpler than the ASS path (no karaoke styling),
 * but it means captions work on the stock Homebrew ffmpeg.
 */
function buildDrawtextCaptionFilters(
  cues: CaptionCue[],
  prevLabel: string,
  width: number,
  height: number,
): { filters: string[]; label: string } {
  const filters: string[] = [];
  const baseFontSize = Math.round(width * 0.052);
  const y = Math.round(height * 0.72);

  let label = prevLabel;
  cues.forEach((cue, i) => {
    const text = sanitizeDrawtext(cue.text);
    if (!text) return;
    // Shrink long lines so a 5-word cue can never overflow the frame.
    const fontSize = Math.min(baseFontSize, Math.floor((width * 1.7) / text.length));
    const start = (cue.startMs / 1000).toFixed(3);
    const end = (cue.endMs / 1000).toFixed(3);
    const next = `cap${i}`;
    filters.push(
      `[${label}]drawtext=text='${text}':fontsize=${fontSize}:fontcolor=white:` +
        `borderw=3:bordercolor=black@0.85:x=(w-tw)/2:y=${y}:` +
        `enable='between(t,${start},${end})'[${next}]`,
    );
    label = next;
  });
  return { filters, label };
}

function buildGradientScrimFilters(prevLabel: string, width: number, height: number): { filters: string[]; label: string } {
  const filters: string[] = [];
  const scrimStartY = Math.round(height * SCRIM_START_FRACTION);
  const totalScrimHeight = height - scrimStartY;
  const bandHeight = Math.ceil(totalScrimHeight / SCRIM_BANDS);

  let label = prevLabel;
  for (let i = 0; i < SCRIM_BANDS; i++) {
    const y = scrimStartY + i * bandHeight;
    const alpha = (SCRIM_MAX_ALPHA * (i + 1)) / SCRIM_BANDS;
    const next = `scrim${i}`;
    filters.push(
      `[${label}]drawbox=x=0:y=${y}:w=${width}:h=${bandHeight + 2}:color=black@${alpha.toFixed(3)}:t=fill[${next}]`,
    );
    label = next;
  }
  return { filters, label };
}

export async function compose(input: ComposeInput): Promise<CompletedAsset> {
  const { width, height } = input;
  const dir = jobDir(input.jobId);
  await ensureDir(dir);

  const outPath = path.join(dir, "output.mp4");
  const thumbPath = path.join(dir, "thumb.jpg");
  const assPath = path.join(dir, "captions.ass");

  await writeAssCaptions(input.cues, assPath, { width, height });

  const [hasSubtitles, hasDrawtext] = await Promise.all([
    filterAvailable("subtitles"),
    filterAvailable("drawtext"),
  ]);
  // Caption strategy ladder: ASS subtitles (best, needs libass) → satori PNG
  // overlays (works on ANY ffmpeg, needs a system font) → drawtext (needs
  // libfreetype) → skip. The PNG path is what makes captions reliable on the
  // minimal Homebrew ffmpeg, which ships with no text-rendering libs at all.
  let captionMode: "ass" | "png" | "drawtext" | "none" = "none";
  let captionImages: RenderedCaption[] = [];
  if (hasSubtitles) {
    captionMode = "ass";
  } else {
    const rendered = await renderCaptionImages(input.cues, dir, width).catch(
      (err) => {
        console.warn(
          `[compose] caption image rendering failed (${err instanceof Error ? err.message : err}) — trying drawtext`,
        );
        return null;
      },
    );
    if (rendered && rendered.length > 0) {
      captionMode = "png";
      console.warn(
        "[compose] no `subtitles` filter (libass) — compositing satori-rendered caption cards via `overlay` instead.",
      );
    } else if (hasDrawtext) {
      captionMode = "drawtext";
      console.warn(
        "[compose] no libass and no usable system font for caption cards — falling back to drawtext captions.",
      );
    } else {
      console.warn(
        "[compose] no libass, no usable system font, and no drawtext — captions cannot be burned into this video.",
      );
    }
    if (rendered) captionImages = rendered;
  }
  if (input.watermark && !hasDrawtext) {
    console.warn(
      "[compose] ffmpeg build lacks the `drawtext` filter (no libfreetype) — the watermark will be skipped. Install an ffmpeg build with --enable-libfreetype to enable this.",
    );
  }

  const totalSec = input.voiceDurationMs / 1000 + TAIL_SEC;
  const totalFrames = Math.max(1, Math.round(totalSec * FPS));
  const zoomRate = (MAX_ZOOM - 1) / totalFrames;

  const args: string[] = ["-y"];

  // ── Inputs ────────────────────────────────────────────────────────────
  if (input.isAvatarVideo) {
    args.push("-stream_loop", "-1", "-i", input.avatarClipPath);
  } else {
    args.push("-loop", "1", "-r", String(FPS), "-i", input.avatarClipPath);
  }
  args.push("-i", input.audioPath); // input 1: voice
  const hasMusic = Boolean(input.musicPath);
  if (hasMusic) {
    args.push("-stream_loop", "-1", "-i", input.musicPath as string); // input 2: music
  }
  // Caption card PNGs (looped stills so each stays available for its window).
  const captionInputBase = hasMusic ? 3 : 2;
  if (captionMode === "png") {
    for (const card of captionImages) {
      args.push("-loop", "1", "-i", card.pngPath);
    }
  }

  // ── Video filter chain ──────────────────────────────────────────────────
  const filters: string[] = [];

  filters.push(`[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}[cov]`);
  let videoLabel = "cov";

  if (!input.isAvatarVideo) {
    // Comma inside the single-quoted `z` expression is safe: ffmpeg's
    // filtergraph tokenizer respects quote grouping when scanning for the
    // next filter separator (verified empirically against this ffmpeg build).
    filters.push(
      `[${videoLabel}]zoompan=z='min(zoom+${zoomRate.toFixed(8)},${MAX_ZOOM})':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${FPS}[zoomed]`,
    );
    videoLabel = "zoomed";
  }

  filters.push(`[${videoLabel}]format=yuv420p[fmt]`);
  videoLabel = "fmt";

  const scrim = buildGradientScrimFilters(videoLabel, width, height);
  filters.push(...scrim.filters);
  videoLabel = scrim.label;

  if (captionMode === "ass") {
    filters.push(`[${videoLabel}]subtitles=${escapeFfmpegFilterPath(assPath)}[caps]`);
    videoLabel = "caps";
  } else if (captionMode === "png") {
    captionImages.forEach((card, i) => {
      const start = (card.cue.startMs / 1000).toFixed(3);
      const end = (card.cue.endMs / 1000).toFixed(3);
      const next = `ovl${i}`;
      filters.push(
        `[${videoLabel}][${captionInputBase + i}:v]overlay=` +
          `x=(main_w-overlay_w)/2:y=main_h*0.76-overlay_h/2:` +
          `enable='between(t,${start},${end})'[${next}]`,
      );
      videoLabel = next;
    });
  } else if (captionMode === "drawtext") {
    const captionChain = buildDrawtextCaptionFilters(input.cues, videoLabel, width, height);
    filters.push(...captionChain.filters);
    videoLabel = captionChain.label;
  }

  if (input.watermark && hasDrawtext) {
    const fontSize = Math.round(width * 0.032);
    const margin = Math.round(width * 0.03);
    filters.push(
      `[${videoLabel}]drawtext=text='AdReel':fontsize=${fontSize}:fontcolor=white@0.85:` +
        `x=w-tw-${margin}:y=h-th-${margin}:box=1:boxcolor=black@0.35:boxborderw=8[wm]`,
    );
    videoLabel = "wm";
  }

  // ── Audio filter chain ───────────────────────────────────────────────────
  filters.push(`[1:a]apad=pad_dur=${TAIL_SEC}[vpad]`);
  let audioLabel = "vpad";

  if (hasMusic) {
    filters.push(`[2:a]volume=${MUSIC_VOLUME}[music]`);
    filters.push(`[${audioLabel}][music]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[amixed]`);
    audioLabel = "amixed";
  }

  args.push(
    "-filter_complex",
    filters.join(";"),
    "-map",
    `[${videoLabel}]`,
    "-map",
    `[${audioLabel}]`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    String(FPS),
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    "-shortest",
    outPath,
  );

  await run("ffmpeg", args);

  // ── Thumbnail ────────────────────────────────────────────────────────────
  const thumbSeekSec = Math.min(1, Math.max(0, totalSec / 2));
  await run("ffmpeg", [
    "-y",
    "-ss",
    thumbSeekSec.toFixed(2),
    "-i",
    outPath,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    thumbPath,
  ]);

  const [stat, size] = await Promise.all([fs.stat(outPath), probeVideoSize(outPath)]);

  return {
    videoPath: path.relative(STORAGE_ROOT, outPath).split(path.sep).join("/"),
    thumbPath: path.relative(STORAGE_ROOT, thumbPath).split(path.sep).join("/"),
    width: size.width,
    height: size.height,
    durationMs: Math.round(totalSec * 1000),
    sizeBytes: stat.size,
  };
}
