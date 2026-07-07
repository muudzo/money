"use client";

import { IconClock, IconPhone } from "@/components/ui/icons";
import {
  DURATION_MAX,
  DURATION_MIN,
  wordsForDuration,
  type WizardData,
} from "./types";

interface StepFormatProps {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

const MARKS = [10, 20, 30, 45, 60];

export function StepFormat({ data, onChange }: StepFormatProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <label
            htmlFor="wiz-duration"
            className="flex items-center gap-2 text-sm font-medium text-fg"
          >
            <IconClock className="size-4 text-subtle" />
            Ad length
          </label>
          <span className="font-display text-3xl font-bold tabular-nums text-accent">
            {data.durationSec}
            <span className="ml-0.5 text-base font-medium text-subtle">s</span>
          </span>
        </div>

        <input
          id="wiz-duration"
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={1}
          value={data.durationSec}
          onChange={(e) => onChange({ durationSec: Number(e.target.value) })}
          aria-valuetext={`${data.durationSec} seconds`}
          className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-3 [accent-color:var(--accent)]"
        />
        <div
          className="mt-2 flex justify-between font-mono text-[0.65rem] text-subtle"
          aria-hidden="true"
        >
          {MARKS.map((m) => (
            <span key={m}>{m}s</span>
          ))}
        </div>

        <p className="mt-5 rounded-lg bg-surface-2 px-4 py-3 text-xs leading-relaxed text-muted">
          ≈ <span className="font-semibold text-fg">{wordsForDuration(data.durationSec)} words</span>{" "}
          of voiceover at UGC pacing. 15–30s is the sweet spot for hook
          testing; go longer for demos and explainers.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-6">
        <span className="flex h-16 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-accent bg-accent-soft">
          <IconPhone className="size-4 text-accent" />
        </span>
        <div>
          <p className="text-sm font-semibold text-fg">9:16 vertical · fixed</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Native full-screen for TikTok, Reels and Shorts. Exports at your
            plan&apos;s max resolution — up to 1080×1920.
          </p>
        </div>
      </div>
    </div>
  );
}
