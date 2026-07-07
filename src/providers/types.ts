/**
 * Provider contracts — the swappable AI layer. Each stage of the pipeline
 * (script, TTS, captions, avatar motion) is an interface with a free/local
 * default implementation and room for paid/GPU upgrades behind the same shape.
 */

export type Tone = "energetic" | "calm" | "authoritative" | "friendly";

// ── Script ──────────────────────────────────────────────────────────────
export interface ScriptRequest {
  brand: string;
  product: string;
  audience?: string;
  tone: Tone;
  /** Target voiceover length; drives word budget. */
  durationSec: number;
}

export interface ScriptResult {
  hook: string;
  body: string;
  cta: string;
  /** Full narration text (hook + body + cta) fed to TTS. */
  full: string;
  /** Provider identifier used ("ollama" | "template"). */
  provider: string;
}

export interface ScriptProvider {
  readonly name: string;
  generate(req: ScriptRequest): Promise<ScriptResult>;
}

// ── Text-to-speech ──────────────────────────────────────────────────────
export interface TtsRequest {
  text: string;
  /** System/voice identifier meaningful to the provider. */
  voice: string;
  /** Absolute output path for the produced mp3. */
  outPath: string;
}

export interface TtsResult {
  audioPath: string;
  durationMs: number;
  provider: string;
}

export interface TtsProvider {
  readonly name: string;
  synthesize(req: TtsRequest): Promise<TtsResult>;
}

// ── Captions ────────────────────────────────────────────────────────────
export interface CaptionCue {
  text: string;
  startMs: number;
  endMs: number;
}

export interface CaptionRequest {
  text: string;
  audioPath: string;
  durationMs: number;
}

export interface CaptionProvider {
  readonly name: string;
  align(req: CaptionRequest): Promise<CaptionCue[]>;
}

// ── Avatar motion ───────────────────────────────────────────────────────
export interface AvatarRequest {
  /** Absolute path to the avatar still image. */
  imagePath: string;
  audioPath: string;
  durationMs: number;
  width: number;
  height: number;
  /** Absolute output path for the produced clip. */
  outPath: string;
}

export interface AvatarResult {
  /** Path to a video clip (lipsync) OR the still image to Ken-Burns downstream. */
  clipPath: string;
  /** True when the provider produced a finished video (skip Ken-Burns). */
  isVideo: boolean;
  provider: string;
}

export interface AvatarProvider {
  readonly name: string;
  render(req: AvatarRequest): Promise<AvatarResult>;
}
