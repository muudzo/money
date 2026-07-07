import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { IconArrowRight, IconCheck, IconMic, IconSparkles } from "@/components/ui/icons";
import { PhoneMock } from "./PhoneMock";

/** Floating status chip used around the phone visual. */
function FloatChip({
  children,
  className,
  delay = "0s",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={`absolute z-10 flex items-center gap-2 rounded-xl border border-border bg-surface/90 px-3 py-2 text-xs font-medium text-fg shadow-[var(--shadow)] backdrop-blur-md [animation:float-slow_7s_ease-in-out_infinite] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      {/* Atmosphere: faint grid + off-center glows, kept editorial not blobby */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.35] [mask-image:radial-gradient(65%_60%_at_50%_20%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,oklch(56%_0.21_280/0.14),transparent)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-[var(--space-section)] pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-6 lg:pt-20">
        {/* Copy column */}
        <div className="animate-fade-up max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-[var(--shadow-sm)]">
            <IconSparkles className="size-3.5 text-accent" />
            AI UGC Studio
            <span className="h-3 w-px bg-border-strong" aria-hidden="true" />
            <span className="text-accent">3 free renders</span>
          </p>

          <h1
            id="hero-heading"
            className="mt-6 font-display text-[length:var(--text-hero)] font-bold leading-[0.98] tracking-tight text-fg"
          >
            Your product.
            <br />
            <span className="text-gradient">A face, a voice,</span>
            <br />a hook that sells.
          </h1>

          <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-muted">
            AdReel writes the script, records the voiceover, syncs the captions
            and renders a ready-to-post 9:16 video ad — in minutes, not
            shoot days. You just describe the product.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <Link href="/signup" className={buttonClasses("primary", "lg")}>
              Start free
              <IconArrowRight className="size-4" />
            </Link>
            <Link
              href="/#how-it-works"
              className={buttonClasses("secondary", "lg")}
            >
              See how it works
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-subtle">
            {["No credit card", "9:16 vertical, up to 1080p", "Ready in ~3 min"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <IconCheck className="size-3.5 text-success" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Visual column */}
        <div className="animate-fade-up relative mx-auto grain [animation-delay:120ms]">
          <PhoneMock className="rotate-2" />

          <FloatChip className="-left-16 top-16 hidden sm:flex" delay="0.6s">
            <span className="flex size-6 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <IconSparkles className="size-3.5" />
            </span>
            <span>
              Hook written
              <span className="ml-1.5 font-mono text-[0.65rem] text-subtle">0:04</span>
            </span>
          </FloatChip>

          <FloatChip className="-right-12 top-[42%] hidden sm:flex" delay="1.4s">
            <span className="flex size-6 items-center justify-center rounded-lg bg-accent-soft text-accent-2">
              <IconMic className="size-3.5" />
            </span>
            <span>Voiceover · Aria</span>
          </FloatChip>

          <FloatChip className="-left-10 bottom-16 hidden sm:flex" delay="2.2s">
            <span className="flex size-6 items-center justify-center rounded-lg bg-[oklch(from_var(--success)_l_c_h_/_0.15)] text-success">
              <IconCheck className="size-3.5" />
            </span>
            <span>Captions synced · 1080p</span>
          </FloatChip>
        </div>
      </div>
    </section>
  );
}
