import { IconClapper, IconMic, IconWand } from "@/components/ui/icons";

const STEPS = [
  {
    icon: IconWand,
    kicker: "01 · Describe",
    title: "Tell us what you're selling",
    body: "Brand, product, audience and tone. AdReel turns it into a hook-first UGC script — or paste your own and keep full control.",
  },
  {
    icon: IconMic,
    kicker: "02 · Cast",
    title: "Pick an avatar & voice",
    body: "Choose from a library of AI presenters, each with a distinct voice, tone and delivery. Your ad, fronted by a face people trust.",
  },
  {
    icon: IconClapper,
    kicker: "03 · Render",
    title: "Get a ready-to-post ad",
    body: "Voiceover recorded, captions synced word-by-word, composed to 9:16 at up to 1080p. Download and post — TikTok, Reels, Shorts.",
  },
];

export function Steps() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="scroll-mt-24 py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            How it works
          </p>
          <h2
            id="how-heading"
            className="mt-3 font-display text-[length:var(--text-display)] font-bold tracking-tight text-fg"
          >
            From product brief to posted ad
            <span className="text-muted"> — three steps.</span>
          </h2>
        </div>

        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.kicker}
              className="group relative flex flex-col rounded-xl border border-border bg-surface p-7 shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-5 right-6 font-display text-[4.5rem] font-bold leading-none text-surface-3 transition-colors duration-300 group-hover:text-accent-soft"
              >
                {i + 1}
              </span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <step.icon className="size-5" />
              </span>
              <p className="mt-6 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-subtle">
                {step.kicker}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-fg">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
