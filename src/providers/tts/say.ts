import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { run, probeDurationMs } from "@/pipeline/ffmpeg";
import type { TtsProvider, TtsRequest, TtsResult } from "@/providers/types";

const DEFAULT_VOICE = "Samantha";
/** Used only for the silent-audio fallback on non-macOS hosts. */
const WORDS_PER_SECOND = 2.6;

let availableVoicesCache: Set<string> | null = null;

/** List installed macOS voices via `say -v '?'`. Cached for the process lifetime.
 * Exported so prisma/seed.ts can validate/resolve avatar voice mappings using
 * the exact same logic the TTS provider uses at render time. */
export async function getAvailableVoices(): Promise<Set<string>> {
  if (availableVoicesCache) return availableVoicesCache;
  try {
    const out = await run("say", ["-v", "?"]);
    const voices = new Set<string>();
    for (const line of out.split("\n")) {
      const match = line.match(/^(\S+)\s+\S+\s+#/);
      if (match) voices.add(match[1]);
    }
    availableVoicesCache = voices;
  } catch {
    availableVoicesCache = new Set();
  }
  return availableVoicesCache;
}

/** Resolve a requested voice name to one actually installed, falling back to
 * a sane default (and finally to whatever the first installed voice is). */
export async function resolveVoice(requested: string): Promise<string> {
  const voices = await getAvailableVoices();
  if (voices.size === 0) return requested; // can't verify (say missing) — try anyway
  if (voices.has(requested)) return requested;
  if (voices.has(DEFAULT_VOICE)) return DEFAULT_VOICE;
  const first = voices.values().next().value;
  return first ?? requested;
}

async function isSayAvailable(): Promise<boolean> {
  try {
    await run("say", ["-v", "?"]);
    return true;
  } catch {
    return false;
  }
}

function estimateSpokenSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, words / WORDS_PER_SECOND);
}

async function synthesizeWithSay(text: string, voice: string, outPath: string): Promise<void> {
  const tmpAiff = path.join(os.tmpdir(), `adreel-tts-${Date.now()}-${Math.random().toString(36).slice(2)}.aiff`);
  try {
    const resolvedVoice = await resolveVoice(voice);
    await run("say", ["-v", resolvedVoice, "-o", tmpAiff, text]);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await run("ffmpeg", [
      "-y",
      "-i", tmpAiff,
      "-ar", "44100",
      "-ac", "2",
      "-b:a", "192k",
      outPath,
    ]);
  } finally {
    await fs.unlink(tmpAiff).catch(() => {});
  }
}

/** Non-macOS (or `say`-missing) fallback: an estimated-length silent mp3 so
 * the pipeline never hard-fails just because TTS is unavailable. */
async function synthesizeSilence(estimatedSec: number, outPath: string): Promise<void> {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await run("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", "anullsrc=r=44100:cl=stereo",
    "-t", estimatedSec.toFixed(2),
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "192k",
    outPath,
  ]);
}

export class SayTtsProvider implements TtsProvider {
  readonly name = "say";

  async synthesize(req: TtsRequest): Promise<TtsResult> {
    const sayReady = await isSayAvailable();

    if (sayReady) {
      await synthesizeWithSay(req.text, req.voice, req.outPath);
    } else {
      await synthesizeSilence(estimateSpokenSeconds(req.text), req.outPath);
    }

    const durationMs = await probeDurationMs(req.outPath);
    return {
      audioPath: req.outPath,
      durationMs,
      provider: sayReady ? "say" : "say-silent-fallback",
    };
  }
}
