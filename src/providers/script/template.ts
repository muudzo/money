import type { ScriptProvider, ScriptRequest, ScriptResult, Tone } from "@/providers/types";

/** Small stable string hash (djb2) so the same inputs always pick the same
 * template variant, but different products/brands feel different. */
function stableHash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

function pick<T>(items: readonly T[], seed: number, salt: number): T {
  return items[(seed + salt) % items.length];
}

const HOOKS: Record<Tone, readonly ((p: { brand: string; product: string }) => string)[]> = {
  energetic: [
    ({ product }) => `Okay I need to stop scrolling and tell you about ${product} right now.`,
    ({ product }) => `Wait — nobody told me ${product} was THIS good?`,
    ({ brand, product }) => `I was today years old when I found ${product} from ${brand}, and I'm obsessed.`,
  ],
  calm: [
    ({ product }) => `I want to tell you about something that actually made my day easier: ${product}.`,
    ({ product }) => `If you're looking for something that just works, let me show you ${product}.`,
    ({ brand }) => `I don't usually talk about products, but ${brand} changed a small part of my routine.`,
  ],
  authoritative: [
    ({ product }) => `Here's why ${product} is worth your attention — and it's not hype.`,
    ({ product }) => `Let's talk facts: ${product} solves a problem most people ignore.`,
    ({ brand, product }) => `${brand} built ${product} to fix something the rest of the market got wrong.`,
  ],
  friendly: [
    ({ product }) => `Hey! Quick one — I have to tell you about ${product}.`,
    ({ product }) => `So a friend put me onto ${product} and now I'm telling you.`,
    ({ brand }) => `Can we talk about ${brand} for a second? Because you need to hear this.`,
  ],
};

const BODY_TEMPLATES: Record<Tone, readonly ((p: {
  brand: string;
  product: string;
  audience: string;
}) => string)[]> = {
  energetic: [
    ({ product, audience }) =>
      `I've tried so many things that promise the world and do nothing, but ${product} actually delivers. It's built for ${audience}, it takes almost no effort to start, and the difference showed up faster than I expected. Honestly the results speak for themselves.`,
    ({ product, audience }) =>
      `${product} fits right into a busy routine, no learning curve, no wasted time. If you're part of ${audience}, this was designed with exactly your day in mind, and it shows in every detail.`,
  ],
  calm: [
    ({ product, audience }) =>
      `${product} is simple, thoughtfully made, and genuinely useful for ${audience}. There's nothing flashy about it — it just does what it's supposed to do, consistently, and that reliability is what won me over.`,
    ({ product, audience }) =>
      `What I appreciate about ${product} is how little friction there is. It was made with ${audience} in mind, and every small choice in how it works reflects that care.`,
  ],
  authoritative: [
    ({ brand, product, audience }) =>
      `${brand} engineered ${product} specifically to address the gaps ${audience} keeps running into with everything else on the market. The difference isn't marketing — it's in how the product actually performs under real conditions.`,
    ({ product, audience }) =>
      `${product} was built around real feedback from ${audience}, not guesswork. That's why it holds up where other options fall short, and why the results are consistent, not lucky.`,
  ],
  friendly: [
    ({ product, audience }) =>
      `${product} has honestly made things easier for me, and I think it'll do the same for ${audience}. It's easy to pick up, it doesn't overcomplicate anything, and it just works the way you'd hope.`,
    ({ brand, product, audience }) =>
      `I know a lot of ${audience} feel like they've tried everything, but ${product} from ${brand} is different in a way that's hard to explain until you try it yourself.`,
  ],
};

const CTAS: Record<Tone, readonly string[]> = {
  energetic: [
    "Tap the link and grab yours before it sells out again.",
    "Go check it out right now — you'll thank me later.",
    "Link's right there. Don't sleep on this one.",
  ],
  calm: [
    "If that sounds like what you need, the link is right here.",
    "Take a look when you have a moment — it's worth it.",
    "You can find it through the link below.",
  ],
  authoritative: [
    "See the details for yourself — link below.",
    "The proof is in the results. Check the link to learn more.",
    "Don't take my word for it — look into it yourself, link below.",
  ],
  friendly: [
    "Go give it a try, I think you'll really like it.",
    "Check the link — let me know what you think!",
    "Tap the link below, I promise it's worth two minutes.",
  ],
};

const WORDS_PER_SECOND = 2.6;

export class TemplateScriptProvider implements ScriptProvider {
  readonly name = "template";

  async generate(req: ScriptRequest): Promise<ScriptResult> {
    const audience = req.audience?.trim() || "people who want better everyday products";
    const seed = stableHash(`${req.brand}|${req.product}|${audience}|${req.tone}`);

    const hookFn = pick(HOOKS[req.tone], seed, 1);
    const bodyFn = pick(BODY_TEMPLATES[req.tone], seed, 2);
    const cta = pick(CTAS[req.tone], seed, 3);

    const hook = hookFn({ brand: req.brand, product: req.product });
    let body = bodyFn({ brand: req.brand, product: req.product, audience });

    // Trim body toward the word budget so longer durationSec still reads at a
    // natural pace instead of racing through a fixed-length paragraph.
    const wordBudget = Math.max(20, Math.round(req.durationSec * WORDS_PER_SECOND));
    const hookWords = hook.split(/\s+/).length;
    const ctaWords = cta.split(/\s+/).length;
    const bodyBudget = Math.max(10, wordBudget - hookWords - ctaWords);
    const bodyWords = body.split(/\s+/);
    if (bodyWords.length > bodyBudget) {
      body = bodyWords.slice(0, bodyBudget).join(" ").replace(/[,;:]$/, "") + ".";
    }

    const full = `${hook} ${body} ${cta}`.replace(/\s+/g, " ").trim();

    return { hook, body, cta, full, provider: "template" };
  }
}
