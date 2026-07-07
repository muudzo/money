"use client";

import { useState } from "react";
import { IconCopy, IconGift, IconCheck } from "@/components/ui/icons";

type Props = {
  inviteUrl: string;
  bonus: number;
};

export function ReferralCard({ inviteUrl, bonus }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context) — select fallback below.
    }
  }

  return (
    <div className="surface-card p-7">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        <IconGift className="size-4 text-accent" />
        Invite &amp; earn
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Share your link. When a brand signs up through it, you{" "}
        <strong className="font-semibold text-fg">both get +{bonus} credits</strong>{" "}
        — free ads for spreading the word.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="referral-link">
          Your referral link
        </label>
        <input
          id="referral-link"
          type="text"
          readOnly
          value={inviteUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
        >
          {copied ? (
            <>
              <IconCheck className="size-4" /> Copied
            </>
          ) : (
            <>
              <IconCopy className="size-4" /> Copy link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
