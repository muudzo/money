import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CREDITS_PER_RENDER, PLAN_ORDER, PLANS } from "@/lib/plans";
import { PricingCards } from "@/components/marketing/PricingCards";
import { buttonClasses } from "@/components/ui/Button";
import { IconArrowRight, IconBolt } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple render-credit pricing. Start free with 3 renders, scale to 1,000 a month.",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "What exactly is a render credit?",
    a: `One credit = one finished vertical ad video (${CREDITS_PER_RENDER} credit per render): script, voiceover, avatar, captions and the final 9:16 export. If a render fails, the credit is automatically refunded.`,
  },
  {
    q: "Can I write my own script?",
    a: "Yes. Every plan lets you choose between AI-written scripts and pasting your own. You can also edit the AI's draft before rendering.",
  },
  {
    q: "What resolution are the exports?",
    a: "Free renders export at 720×1280 with a small AdReel watermark. All paid plans export watermark-free at up to 1080×1920 — native quality for TikTok, Reels and Shorts.",
  },
  {
    q: "Do unused credits roll over?",
    a: "Plan credits refresh each billing cycle and are designed to be spent — we size the tiers generously so you can test hooks aggressively.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Manage or cancel from the in-app billing portal in two clicks. You keep everything you've already rendered.",
  },
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  const plans = PLAN_ORDER.map((id) => PLANS[id]);

  // Structured data for rich results, derived from the same sources of truth
  // as the visible page (PLANS + FAQ) so it can never drift out of sync.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "AdReel — AI UGC Ad Generator",
        description:
          "Generate ready-to-post vertical UGC ad videos with AI: script, voiceover, avatar and captions.",
        brand: { "@type": "Brand", name: "AdReel" },
        offers: plans
          .filter((p) => p.priceMonthly > 0)
          .map((p) => ({
            "@type": "Offer",
            name: `${p.name} plan`,
            price: p.priceMonthly,
            priceCurrency: "USD",
            description: p.tagline,
          })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="relative overflow-hidden">
      <script
        type="application/ld+json"
        // Safe: serialized from our own typed constants, no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)] opacity-70"
      />

      <section
        aria-labelledby="pricing-heading"
        className="relative mx-auto max-w-6xl px-4 pb-[var(--space-section)] pt-16 sm:px-6 lg:pt-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Pricing
          </p>
          <h1
            id="pricing-heading"
            className="mt-3 font-display text-[length:var(--text-display)] font-bold tracking-tight text-fg"
          >
            Pay per render.
            <span className="text-muted"> Not per creator.</span>
          </h1>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-muted">
            One credit is one finished, ready-to-post vertical ad. Start free
            with three renders — upgrade when your testing velocity does.
          </p>
        </div>

        <div className="mt-16 xl:mt-20">
          <PricingCards
            plans={plans}
            isLoggedIn={Boolean(user)}
            currentPlanId={user?.subscription?.plan}
          />
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-sm text-subtle">
          <IconBolt className="size-4 text-accent" />
          Every plan includes the full generator wizard, avatar library and
          auto-captions.
        </p>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="border-t border-border bg-surface py-[var(--space-section)]"
      >
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2
              id="faq-heading"
              className="font-display text-[length:var(--text-title)] font-bold tracking-tight text-fg"
            >
              Questions, answered.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Anything else? Start free and see the whole pipeline run on your
              own product — it&apos;s the fastest answer we have.
            </p>
            <Link
              href={user ? "/dashboard/new" : "/signup"}
              className={buttonClasses("primary", "md", "mt-7")}
            >
              {user ? "Create an ad" : "Start free"}
              <IconArrowRight className="size-4" />
            </Link>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-bg px-6 shadow-[var(--shadow-sm)]">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-[0.95rem] font-medium text-fg transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-transform duration-300 ease-out-expo group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
