// Renders caption cues to transparent PNG "pill" cards (satori → SVG →
// resvg → PNG). The compositor overlays them with ffmpeg's `overlay` filter,
// which every build ships — so burned-in captions no longer depend on the
// ffmpeg being compiled with libass/libfreetype (the 2026 Homebrew formula
// ships with neither). Bonus: full CSS styling, so the cards look better than
// drawtext ever did.
import { promises as fs } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { CaptionCue } from "@/providers/types";

/** Candidate system fonts, tried in order. macOS first, then common Linux. */
const FONT_CANDIDATES = [
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
];

let cachedFont: Buffer | null | undefined;

async function loadFont(): Promise<Buffer | null> {
  if (cachedFont !== undefined) return cachedFont;
  for (const candidate of FONT_CANDIDATES) {
    try {
      cachedFont = await fs.readFile(candidate);
      return cachedFont;
    } catch {
      /* try next */
    }
  }
  cachedFont = null;
  return null;
}

/** Height of each caption card canvas relative to video width. */
const CARD_HEIGHT_RATIO = 0.24;

export interface RenderedCaption {
  cue: CaptionCue;
  pngPath: string;
}

/**
 * Render every cue to a transparent PNG sized to the video width. Returns null
 * when no usable system font exists (caller falls back to drawtext/skip).
 * Files land in `dir` as caption_000.png, caption_001.png, …
 */
export async function renderCaptionImages(
  cues: CaptionCue[],
  dir: string,
  videoWidth: number,
): Promise<RenderedCaption[] | null> {
  const font = await loadFont();
  if (!font) return null;

  const height = Math.round(videoWidth * CARD_HEIGHT_RATIO);
  const baseFontSize = Math.round(videoWidth * 0.052);
  const out: RenderedCaption[] = [];

  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    const text = cue.text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    // Shrink very long cues so the pill always fits the frame.
    const fontSize = Math.min(
      baseFontSize,
      Math.floor((videoWidth * 1.6) / Math.max(1, text.length)),
    );

    const svg = await satori(
      createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        createElement(
          "div",
          {
            style: {
              display: "flex",
              maxWidth: "92%",
              padding: `${Math.round(fontSize * 0.38)}px ${Math.round(fontSize * 0.7)}px`,
              background: "rgba(12,10,18,0.55)",
              borderRadius: Math.round(fontSize * 0.45),
              color: "#ffffff",
              fontSize,
              fontWeight: 700,
              lineHeight: 1.25,
              textAlign: "center",
              letterSpacing: "-0.5px",
            },
          },
          text,
        ),
      ),
      {
        width: videoWidth,
        height,
        fonts: [{ name: "Caption", data: font, weight: 700, style: "normal" }],
      },
    );

    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: videoWidth },
    }).render().asPng();

    const pngPath = path.join(dir, `caption_${String(i).padStart(3, "0")}.png`);
    await fs.writeFile(pngPath, png);
    out.push({ cue, pngPath });
  }

  return out;
}
