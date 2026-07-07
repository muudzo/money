// Provider registry: selects the configured implementation for each pipeline
// stage, with graceful fallback to the free/local default so a render never
// hard-fails just because an optional upgrade isn't configured.
import { env } from "@/lib/env";
import { NotConfiguredError } from "@/providers/errors";
import { OllamaScriptProvider } from "@/providers/script/ollama";
import { TemplateScriptProvider } from "@/providers/script/template";
import { SayTtsProvider } from "@/providers/tts/say";
import { PiperTtsProvider } from "@/providers/tts/piper";
import { KokoroTtsProvider } from "@/providers/tts/kokoro";
import { EstimateCaptionProvider } from "@/providers/captions/estimate";
import { WhisperCaptionProvider } from "@/providers/captions/whisper";
import { KenBurnsAvatarProvider } from "@/providers/avatar/kenburns";
import { LipsyncAvatarProvider } from "@/providers/avatar/lipsync";
import type {
  AvatarProvider,
  CaptionProvider,
  ScriptProvider,
  ScriptRequest,
  ScriptResult,
  TtsProvider,
} from "@/providers/types";

const templateScriptProvider = new TemplateScriptProvider();
const sayTtsProvider = new SayTtsProvider();
const estimateCaptionProvider = new EstimateCaptionProvider();
const kenBurnsAvatarProvider = new KenBurnsAvatarProvider();

/** script: configured provider → ollama → template (template never throws). */
export function getScriptProvider(): ScriptProvider {
  if (env.SCRIPT_PROVIDER === "template") return templateScriptProvider;
  return new OllamaScriptProvider();
}

/** tts: configured provider → say (say itself falls back to silent audio). */
export function getTtsProvider(): TtsProvider {
  switch (env.TTS_PROVIDER) {
    case "piper":
      return new PiperTtsProvider();
    case "kokoro":
      return new KokoroTtsProvider();
    case "say":
    default:
      return sayTtsProvider;
  }
}

/** captions: configured provider → estimate. */
export function getCaptionProvider(): CaptionProvider {
  if (env.CAPTIONS_PROVIDER === "whisper") return new WhisperCaptionProvider();
  return estimateCaptionProvider;
}

/** avatar: configured provider → kenburns. */
export function getAvatarProvider(): AvatarProvider {
  if (env.AVATAR_PROVIDER === "lipsync") return new LipsyncAvatarProvider();
  return kenBurnsAvatarProvider;
}

/** Always-available fallback instances, regardless of env selection — used
 * by render.ts (via withFallback) when an optional upgrade provider throws
 * NotConfiguredError. */
export const defaultTtsProvider = sayTtsProvider;
export const defaultCaptionProvider = estimateCaptionProvider;
export const defaultAvatarProvider = kenBurnsAvatarProvider;

/**
 * Resolve a script for the render, trying the configured/Ollama provider
 * first and silently falling back to the deterministic template provider on
 * any failure (network down, model missing, bad parse, timeout, ...). This
 * is the one script entry point renderJob should call — it never throws.
 */
export async function resolveScript(req: ScriptRequest): Promise<ScriptResult> {
  const primary = getScriptProvider();
  if (primary.name === "template") {
    return templateScriptProvider.generate(req);
  }

  try {
    return await primary.generate(req);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[providers] ${primary.name} script provider failed, falling back to template: ${reason}`);
    return templateScriptProvider.generate(req);
  }
}

/**
 * Run any optional-upgrade provider (tts/captions/avatar) and fall back to a
 * supplied default implementation when it throws NotConfiguredError. Other
 * errors are re-thrown so genuine failures (e.g. a misbehaving GPU server)
 * still surface instead of silently degrading output quality.
 */
export async function withFallback<T>(
  attempt: () => Promise<T>,
  fallback: () => Promise<T>,
  providerName: string,
): Promise<T> {
  try {
    return await attempt();
  } catch (err) {
    if (err instanceof NotConfiguredError) {
      console.warn(`[providers] ${providerName} not configured, using fallback: ${err.message}`);
      return fallback();
    }
    throw err;
  }
}
