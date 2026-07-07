"use client";

import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { IconSparkles, IconWand } from "@/components/ui/icons";
import type { ScriptMode, StepErrors, WizardData } from "./types";

interface StepScriptProps {
  data: WizardData;
  errors: StepErrors;
  onChange: (patch: Partial<WizardData>) => void;
}

const MODES: { id: ScriptMode; title: string; body: string }[] = [
  {
    id: "ai",
    title: "Let AI write it",
    body: "A hook-first UGC script written from your brief at render time — tuned to your tone and length.",
  },
  {
    id: "own",
    title: "Write my own",
    body: "Paste or write the exact narration. We'll record the voiceover and time the captions to it.",
  },
];

export function StepScript({ data, errors, onChange }: StepScriptProps) {
  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="text-sm font-medium text-fg">
          Who writes the script?
        </legend>
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          {MODES.map((mode) => {
            const checked = data.scriptMode === mode.id;
            return (
              <label
                key={mode.id}
                className={cn(
                  "cursor-pointer rounded-xl border p-4 transition-[border-color,background-color,box-shadow] duration-200",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                  checked
                    ? "border-accent bg-accent-soft shadow-[var(--shadow-sm)]"
                    : "border-border bg-surface hover:border-border-strong",
                )}
              >
                <input
                  type="radio"
                  name="wiz-script-mode"
                  value={mode.id}
                  checked={checked}
                  onChange={() => onChange({ scriptMode: mode.id })}
                  className="sr-only"
                />
                <span className="flex items-center gap-2">
                  {mode.id === "ai" ? (
                    <IconSparkles className={cn("size-4", checked ? "text-accent" : "text-subtle")} />
                  ) : (
                    <IconWand className={cn("size-4", checked ? "text-accent" : "text-subtle")} />
                  )}
                  <span className={cn("text-sm font-semibold", checked ? "text-accent" : "text-fg")}>
                    {mode.title}
                  </span>
                </span>
                <span className="mt-1.5 block text-xs leading-snug text-muted">
                  {mode.body}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {data.scriptMode === "own" ? (
        <Field
          label="Your script"
          htmlFor="wiz-script"
          error={errors.script}
          hint={`${data.script.trim().length.toLocaleString()} / 2,400 characters. Structure that works: hook → proof → CTA.`}
        >
          <Textarea
            id="wiz-script"
            value={data.script}
            invalid={Boolean(errors.script)}
            rows={8}
            maxLength={2400}
            placeholder={
              "Okay, I can't gatekeep this anymore…\n\nThis serum cleared my dark spots in two weeks — no filter needed.\n\nLink's below. Your skin will thank you."
            }
            onChange={(e) => onChange({ script: e.target.value })}
          />
        </Field>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
          <IconSparkles className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-muted">
            The script is written fresh at render time from your brief —
            brand, product, audience and{" "}
            <span className="font-medium text-fg">{data.tone}</span> tone. The
            final text is saved with the render so you can reuse it as a
            caption.
          </p>
        </div>
      )}
    </div>
  );
}
