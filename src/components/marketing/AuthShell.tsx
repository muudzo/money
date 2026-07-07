import type { ReactNode } from "react";
import { IconCheck } from "@/components/ui/icons";
import { PhoneMock } from "./PhoneMock";

interface AuthShellProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  /** Small line under the form, e.g. link to the other auth page. */
  footer: ReactNode;
}

/**
 * Premium split-screen auth layout: form left, branded studio panel right.
 * Rendered inside the marketing layout (nav above, footer below), so it sizes
 * to the viewport minus the 4rem nav.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[1fr_1fr]">
      {/* Form column */}
      <main className="relative flex flex-col px-5 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
            {title}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">{subtitle}</p>
          <div className="mt-9">{children}</div>
        </div>

        <p className="mx-auto w-full max-w-sm text-center text-sm text-muted">
          {footer}
        </p>
      </main>

      {/* Brand panel */}
      <aside
        aria-hidden="true"
        className="grain relative hidden items-center justify-center overflow-hidden bg-[linear-gradient(155deg,oklch(26%_0.07_285),oklch(19%_0.04_270)_55%,oklch(24%_0.06_225))] lg:flex"
      >
        <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,oklch(60%_0.2_285/0.3),transparent)]" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,oklch(70%_0.14_210/0.22),transparent)]" />

        <div className="relative flex max-w-md flex-col items-center px-10">
          <PhoneMock className="-rotate-2" />
          <figure className="mt-12">
            <blockquote className="text-center font-display text-xl font-medium leading-relaxed text-white/90">
              &ldquo;We swapped a $6k/month UGC retainer for AdReel and our
              hook-testing velocity tripled.&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center justify-center gap-3 text-sm text-white/60">
              <span className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(140deg,oklch(62%_0.2_290),oklch(72%_0.15_215))] font-display text-sm font-semibold text-white">
                MR
              </span>
              <span>
                <span className="block font-medium text-white/85">Maya Reyes</span>
                Head of Growth, Peakform
              </span>
            </figcaption>
          </figure>
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/55">
            {["3 free renders", "No credit card", "Cancel anytime"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <IconCheck className="size-3.5 text-white/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
