"use client";

import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { IconAlert } from "@/components/ui/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[oklch(from_var(--danger)_l_c_h_/_0.12)] text-danger">
        <IconAlert className="size-6" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-fg">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        An unexpected error interrupted the take. Try again — if it keeps
        happening, head back to your dashboard.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-subtle">
          Error ref: {error.digest}
        </p>
      )}
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/dashboard" className={buttonClasses("secondary", "md")}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
