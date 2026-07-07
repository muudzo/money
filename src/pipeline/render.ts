// Orchestrates one render job end-to-end: script -> TTS -> captions -> avatar
// motion -> compose. Pure orchestration — the actual work lives in the
// providers (src/providers/) and the ffmpeg compositor (compose.ts).
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import type { ClaimedJob, CompletedAsset, RenderConfig } from "@/lib/jobs";
import { updateJobProgress } from "@/lib/jobs";
import { assetPath, ensureDir, jobDir } from "@/lib/storage";
import { run } from "@/pipeline/ffmpeg";
import { compose } from "@/pipeline/compose";
import {
  defaultAvatarProvider,
  defaultCaptionProvider,
  defaultTtsProvider,
  getAvatarProvider,
  getCaptionProvider,
  getTtsProvider,
  resolveScript,
  withFallback,
} from "@/providers";
import type { CaptionCue, ScriptRequest } from "@/providers/types";

const DEFAULT_VOICE = "Samantha";
const FALLBACK_AVATAR_SIZE = "1080x1350";

/** Pick the first available background music bed in assets/music, if any. */
async function pickMusicAsset(): Promise<string | undefined> {
  const musicDir = assetPath("music");
  try {
    const entries = await fs.readdir(musicDir);
    const track = entries.find((f) => /\.(mp3|wav|m4a)$/i.test(f));
    return track ? path.join(musicDir, track) : undefined;
  } catch {
    return undefined; // assets/music doesn't exist or is empty — music is optional
  }
}

/** Generate a simple gradient portrait via ffmpeg when no avatar image is
 * available at all (no seeded avatars, nothing referenced on the job). */
async function generateFallbackAvatar(jobId: string): Promise<string> {
  const outPath = path.join(jobDir(jobId), "fallback_avatar.png");
  await ensureDir(jobDir(jobId));
  await run("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `gradients=s=${FALLBACK_AVATAR_SIZE}:c0=0x3a3f8f:c1=0x9c6bd6:x0=0:y0=0:x1=1080:y1=1350`,
    "-frames:v",
    "1",
    "-vf",
    "vignette",
    outPath,
  ]);
  return outPath;
}

/** Resolve the absolute avatar still-image path for this job, in priority
 * order: job-level avatar -> project-level avatar -> first seeded avatar ->
 * a generated fallback gradient portrait. */
async function resolveAvatarImagePath(job: ClaimedJob): Promise<string> {
  const relPath = job.avatar?.imagePath ?? job.project?.avatar?.imagePath;
  if (relPath) return assetPath(relPath);

  const firstAvatar = await db.avatar.findFirst({ orderBy: { createdAt: "asc" } });
  if (firstAvatar) return assetPath(firstAvatar.imagePath);

  return generateFallbackAvatar(job.id);
}

/** Obtain the narration text: prefer a pre-written/edited script already on
 * the job, otherwise generate one (Ollama with a template fallback). */
async function resolveNarrationText(job: ClaimedJob, config: RenderConfig): Promise<string> {
  if (job.scriptText && job.scriptText.trim().length > 0) {
    return job.scriptText.trim();
  }
  if (config.script && config.script.trim().length > 0) {
    return config.script.trim();
  }

  const scriptReq: ScriptRequest = {
    brand: config.brand,
    product: config.product,
    audience: config.audience,
    tone: config.tone,
    durationSec: config.durationSec,
  };
  const result = await resolveScript(scriptReq);
  return result.full;
}

export async function renderJob(job: ClaimedJob): Promise<CompletedAsset> {
  if (!job.config) {
    throw new Error(`Render job ${job.id} has no config snapshot`);
  }
  const config = JSON.parse(job.config) as RenderConfig;

  await ensureDir(jobDir(job.id));

  // ── 1. Script ────────────────────────────────────────────────────────────
  const fullNarration = await resolveNarrationText(job, config);
  await updateJobProgress(job.id, { stage: "script", progress: 15, scriptText: fullNarration });

  // ── 2. Text-to-speech ────────────────────────────────────────────────────
  const voiceName = job.avatar?.voice ?? job.project?.avatar?.voice ?? DEFAULT_VOICE;
  const audioOutPath = path.join(jobDir(job.id), "voice.mp3");
  const ttsProvider = getTtsProvider();
  const ttsResult = await withFallback(
    () => ttsProvider.synthesize({ text: fullNarration, voice: voiceName, outPath: audioOutPath }),
    () => defaultTtsProvider.synthesize({ text: fullNarration, voice: voiceName, outPath: audioOutPath }),
    ttsProvider.name,
  );
  await updateJobProgress(job.id, { stage: "tts", progress: 45 });

  // ── 3. Captions ──────────────────────────────────────────────────────────
  const captionProvider = getCaptionProvider();
  const captionReq = { text: fullNarration, audioPath: ttsResult.audioPath, durationMs: ttsResult.durationMs };
  const cues: CaptionCue[] = await withFallback(
    () => captionProvider.align(captionReq),
    () => defaultCaptionProvider.align(captionReq),
    captionProvider.name,
  );
  await updateJobProgress(job.id, { stage: "captions", progress: 62 });

  // ── 4. Avatar motion ─────────────────────────────────────────────────────
  const avatarImagePath = await resolveAvatarImagePath(job);
  const avatarOutPath = path.join(jobDir(job.id), "avatar_clip.mp4");
  const avatarProvider = getAvatarProvider();
  const avatarReq = {
    imagePath: avatarImagePath,
    audioPath: ttsResult.audioPath,
    durationMs: ttsResult.durationMs,
    width: config.width,
    height: config.height,
    outPath: avatarOutPath,
  };
  const avatarResult = await withFallback(
    () => avatarProvider.render(avatarReq),
    () => defaultAvatarProvider.render(avatarReq),
    avatarProvider.name,
  );

  // ── 5. Compose ───────────────────────────────────────────────────────────
  const musicPath = await pickMusicAsset();
  const asset = await compose({
    jobId: job.id,
    avatarClipPath: avatarResult.clipPath,
    isAvatarVideo: avatarResult.isVideo,
    audioPath: ttsResult.audioPath,
    voiceDurationMs: ttsResult.durationMs,
    cues,
    width: config.width,
    height: config.height,
    watermark: config.watermark,
    musicPath,
  });
  await updateJobProgress(job.id, { stage: "compose", progress: 90 });

  return asset;
}
