import { env } from "@/lib/env";
import { run } from "@/pipeline/ffmpeg";
import { NotConfiguredError } from "@/providers/errors";
import type { CaptionCue, CaptionProvider, CaptionRequest } from "@/providers/types";

interface WhisperJsonSegment {
  start: number;
  end: number;
  text: string;
}

interface WhisperJsonOutput {
  segments?: WhisperJsonSegment[];
}

/**
 * whisper.cpp-style adapter: runs a local `WHISPER_BIN` against the rendered
 * voiceover to get real word/segment-level timing instead of estimating it.
 * Expects the binary to support `--output-json --output-file <path>` and
 * print (or write) segments with `start`/`end` in seconds.
 */
export class WhisperCaptionProvider implements CaptionProvider {
  readonly name = "whisper";

  async align(req: CaptionRequest): Promise<CaptionCue[]> {
    if (!env.WHISPER_BIN) {
      throw new NotConfiguredError(
        "whisper",
        "set WHISPER_BIN to a whisper.cpp-compatible binary to enable real audio alignment",
      );
    }

    const jsonPath = `${req.audioPath}.whisper.json`;
    await run(env.WHISPER_BIN, [
      "-f", req.audioPath,
      "-oj",
      "-of", jsonPath.replace(/\.json$/, ""),
    ]);

    const { promises: fs } = await import("node:fs");
    const raw = await fs.readFile(jsonPath, "utf8");
    const parsed = JSON.parse(raw) as WhisperJsonOutput;
    const segments = parsed.segments ?? [];

    if (segments.length === 0) {
      throw new Error("whisper produced no segments");
    }

    return segments.map((seg) => ({
      text: seg.text.trim(),
      startMs: Math.round(seg.start * 1000),
      endMs: Math.round(seg.end * 1000),
    }));
  }
}
