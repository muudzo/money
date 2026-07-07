import { env } from "@/lib/env";
import { run, probeDurationMs } from "@/pipeline/ffmpeg";
import { NotConfiguredError } from "@/providers/errors";
import type { TtsProvider, TtsRequest, TtsResult } from "@/providers/types";

/**
 * Kokoro (https://github.com/hexgrad/kokoro) TTS adapter. Kokoro ships as a
 * local HTTP server in most self-hosted setups; reuse PIPER_BIN's sibling
 * env var pattern by pointing PIPER_BIN at a small CLI wrapper, or swap this
 * for a fetch() call to a Kokoro server once one is configured. Kept as a
 * thin, clearly-marked upgrade slot rather than guessing at an API shape.
 */
export class KokoroTtsProvider implements TtsProvider {
  readonly name = "kokoro";

  async synthesize(req: TtsRequest): Promise<TtsResult> {
    if (!env.PIPER_BIN) {
      throw new NotConfiguredError(
        "kokoro",
        "no local Kokoro endpoint wired up yet — set PIPER_BIN to a Kokoro-compatible CLI wrapper to enable this provider",
      );
    }

    await run(env.PIPER_BIN, ["--text", req.text, "--voice", req.voice, "--out", req.outPath]);
    const durationMs = await probeDurationMs(req.outPath);
    return { audioPath: req.outPath, durationMs, provider: "kokoro" };
  }
}
