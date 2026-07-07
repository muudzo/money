import { env } from "@/lib/env";
import type { ScriptProvider, ScriptRequest, ScriptResult } from "@/providers/types";

const OLLAMA_TIMEOUT_MS = 20_000;
/** Roughly matches natural spoken pace so TTS duration lands near the target. */
const WORDS_PER_SECOND = 2.6;

function buildPrompt(req: ScriptRequest): string {
  const wordBudget = Math.max(20, Math.round(req.durationSec * WORDS_PER_SECOND));
  const audience = req.audience?.trim() || "everyday shoppers scrolling social media";

  return `You are a top-tier UGC (user-generated content) ad copywriter. Write a short, punchy,
scroll-stopping vertical video ad script for a real person to read straight to camera.

Brand: ${req.brand}
Product: ${req.product}
Target audience: ${audience}
Tone: ${req.tone}
Total spoken length budget: about ${wordBudget} words (${req.durationSec} seconds spoken aloud).

Structure the script in exactly three labeled parts:
HOOK: one scroll-stopping opening line (a bold claim, a question, or a pattern interrupt) that grabs attention in the first 2 seconds.
BODY: 2-4 sentences that describe one concrete, specific benefit of the product (not vague hype) and build desire.
CTA: one short, strong call to action telling the viewer exactly what to do next.

Rules:
- Sound like a real person talking, not an ad voiceover or a press release.
- Be concrete and specific to "${req.product}" — no generic filler.
- Match the "${req.tone}" tone throughout.
- Do not use hashtags, emojis, or camera directions.
- Output ONLY in this exact format, nothing else:
HOOK: <text>
BODY: <text>
CTA: <text>`;
}

interface OllamaGenerateResponse {
  response?: string;
}

function parseSections(raw: string): { hook: string; body: string; cta: string } {
  // Tolerant line-based parser: find the HOOK/BODY/CTA labels wherever they
  // appear and gather following lines into that section until the next label.
  const lines = raw.split("\n").map((l) => l.trim());
  const sections: Record<"hook" | "body" | "cta", string[]> = { hook: [], body: [], cta: [] };
  let current: "hook" | "body" | "cta" | null = null;

  for (const line of lines) {
    const match = line.match(/^(HOOK|BODY|CTA)\s*:\s*(.*)$/i);
    if (match) {
      current = match[1].toLowerCase() as "hook" | "body" | "cta";
      if (match[2]) sections[current].push(match[2]);
      continue;
    }
    if (current && line) sections[current].push(line);
  }

  const hook = sections.hook.join(" ").trim();
  const body = sections.body.join(" ").trim();
  const cta = sections.cta.join(" ").trim();

  if (!hook || !body || !cta) {
    throw new Error("Ollama script response missing HOOK/BODY/CTA sections");
  }

  return { hook, body, cta };
}

export class OllamaScriptProvider implements ScriptProvider {
  readonly name = "ollama";

  async generate(req: ScriptRequest): Promise<ScriptResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    try {
      const res = await fetch(`${env.OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OLLAMA_MODEL,
          prompt: buildPrompt(req),
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Ollama request failed: ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as OllamaGenerateResponse;
      if (!data.response) {
        throw new Error("Ollama response had no `response` field");
      }

      const { hook, body, cta } = parseSections(data.response);
      const full = `${hook} ${body} ${cta}`.replace(/\s+/g, " ").trim();

      return { hook, body, cta, full, provider: "ollama" };
    } finally {
      clearTimeout(timeout);
    }
  }
}
