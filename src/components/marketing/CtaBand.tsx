import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="pb-[var(--space-section)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grain relative overflow-hidden rounded-xl bg-[linear-gradient(120deg,oklch(30%_0.09_285),oklch(22%_0.05_265)_45%,oklch(30%_0.08_220))] px-7 py-16 text-center shadow-[var(--shadow-lg)] sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(60%_0.2_285/0.35),transparent)]"
          />
          <h2
            id="cta-heading"
            className="relative mx-auto max-w-2xl font-display text-[length:var(--text-display)] font-bold tracking-tight text-white"
          >
            Your next winning ad is a brief away.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-[0.98rem] leading-relaxed text-white/70">
            Sign up, describe your product, and download your first three
            renders free. No credit card, no shoot day, no editor.
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className={buttonClasses(
                "primary",
                "lg",
                "bg-white text-[oklch(22%_0.05_275)] shadow-none hover:bg-white/90 hover:shadow-[0_12px_40px_-8px_oklch(100%_0_0/0.35)]",
              )}
            >
              Start free
              <IconArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className={buttonClasses(
                "ghost",
                "lg",
                "text-white/85 hover:bg-white/10 hover:text-white",
              )}
            >
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
