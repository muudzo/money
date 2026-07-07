"use client";

import { titleCase } from "@/lib/utils";
import { CREDITS_PER_RENDER } from "@/lib/plans";
import { IconBolt } from "@/components/ui/icons";
import type { AvatarOption, WizardData } from "./types";

interface StepReviewProps {
  data: WizardData;
  avatar: AvatarOption | null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wider text-subtle">
        {label}
      </dt>
      <dd className="min-w-0 text-sm leading-relaxed text-fg">{value}</dd>
    </div>
  );
}

export function StepReview({ data, avatar }: StepReviewProps) {
  return (
    <div className="flex flex-col gap-5">
      <dl className="divide-y divide-border rounded-xl border border-border bg-surface px-5">
        <Row label="Ad name" value={data.name} />
        <Row label="Brand" value={data.brand} />
        <Row
          label="Product"
          value={
            data.product.length > 180
              ? `${data.product.slice(0, 180)}…`
              : data.product
          }
        />
        {data.audience.trim() && <Row label="Audience" value={data.audience} />}
        <Row label="Tone" value={titleCase(data.tone)} />
        <Row
          label="Script"
          value={
            data.scriptMode === "own"
              ? `Your own script (${data.script.trim().length.toLocaleString()} characters)`
              : "AI-written at render time"
          }
        />
        <Row
          label="Presenter"
          value={
            avatar
              ? `${avatar.name} — ${avatar.voice}${avatar.tone ? ` · ${titleCase(avatar.tone)}` : ""}`
              : "Voiceover + captions (no avatar)"
          }
        />
        <Row label="Format" value={`${data.durationSec}s · 9:16 vertical`} />
      </dl>

      <p className="flex items-center gap-2.5 rounded-xl bg-accent-soft px-4 py-3.5 text-sm text-accent">
        <IconBolt className="size-4 shrink-0" />
        <span>
          This render uses{" "}
          <strong className="font-semibold">
            {CREDITS_PER_RENDER} credit
          </strong>
          . If it fails, the credit is refunded automatically.
        </span>
      </p>
    </div>
  );
}
