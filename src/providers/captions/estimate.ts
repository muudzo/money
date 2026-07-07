import type { CaptionCue, CaptionProvider, CaptionRequest } from "@/providers/types";

const MIN_WORDS_PER_CUE = 3;
const MAX_WORDS_PER_CUE = 5;

/** Split narration text into short (3-5 word) caption cues. */
function chunkWords(text: string): string[][] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[][] = [];
  let i = 0;
  while (i < words.length) {
    const remaining = words.length - i;
    // Avoid leaving a tiny orphan chunk at the end: if what's left after this
    // chunk would be smaller than MIN_WORDS_PER_CUE, fold it into this chunk.
    let size = Math.min(MAX_WORDS_PER_CUE, remaining);
    if (remaining - size > 0 && remaining - size < MIN_WORDS_PER_CUE) {
      size = remaining;
    }
    chunks.push(words.slice(i, i + size));
    i += size;
  }
  return chunks;
}

/**
 * Estimates caption timing by distributing `durationMs` across cues
 * proportional to each cue's word count — no audio analysis required.
 * Cues exactly tile the full duration with no gaps or overlaps.
 */
export class EstimateCaptionProvider implements CaptionProvider {
  readonly name = "estimate";

  async align(req: CaptionRequest): Promise<CaptionCue[]> {
    const chunks = chunkWords(req.text);
    if (chunks.length === 0) {
      return [{ text: "", startMs: 0, endMs: req.durationMs }];
    }

    const totalWords = chunks.reduce((sum, c) => sum + c.length, 0);
    const cues: CaptionCue[] = [];
    let cursorMs = 0;

    chunks.forEach((chunk, idx) => {
      const isLast = idx === chunks.length - 1;
      const share = chunk.length / totalWords;
      const endMs = isLast ? req.durationMs : Math.round(cursorMs + share * req.durationMs);
      cues.push({
        text: chunk.join(" "),
        startMs: cursorMs,
        endMs: Math.max(endMs, cursorMs + 1),
      });
      cursorMs = cues[cues.length - 1].endMs;
    });

    return cues;
  }
}
