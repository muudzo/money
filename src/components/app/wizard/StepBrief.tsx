"use client";

import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { TONES, type StepErrors, type WizardData } from "./types";
import type { Tone } from "@/providers/types";

interface StepBriefProps {
  data: WizardData;
  errors: StepErrors;
  onChange: (patch: Partial<WizardData>) => void;
}

export function StepBrief({ data, errors, onChange }: StepBriefProps) {
  return (
    <div className="flex flex-col gap-5">
      <Field
        label="Ad name"
        htmlFor="wiz-name"
        error={errors.name}
        hint="Internal only — how it shows up in your library."
      >
        <Input
          id="wiz-name"
          value={data.name}
          invalid={Boolean(errors.name)}
          maxLength={100}
          placeholder="Serum launch — hook test #1"
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Brand" htmlFor="wiz-brand" error={errors.brand}>
          <Input
            id="wiz-brand"
            value={data.brand}
            invalid={Boolean(errors.brand)}
            maxLength={100}
            placeholder="Glowlab"
            onChange={(e) => onChange({ brand: e.target.value })}
          />
        </Field>
        <Field label="Audience" htmlFor="wiz-audience" optional>
          <Input
            id="wiz-audience"
            value={data.audience}
            maxLength={240}
            placeholder="Women 20–35 into skincare"
            onChange={(e) => onChange({ audience: e.target.value })}
          />
        </Field>
      </div>

      <Field
        label="What are you selling?"
        htmlFor="wiz-product"
        error={errors.product}
        hint="A couple of sentences: what it is, what it does, why it's different."
      >
        <Textarea
          id="wiz-product"
          value={data.product}
          invalid={Boolean(errors.product)}
          maxLength={600}
          rows={4}
          placeholder="A vitamin-C brightening serum that fades dark spots in 2 weeks. Vegan, fragrance-free, dermatologist tested."
          onChange={(e) => onChange({ product: e.target.value })}
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium text-fg">Tone of voice</legend>
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          {TONES.map((tone) => {
            const checked = data.tone === tone.id;
            return (
              <label
                key={tone.id}
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
                  name="wiz-tone"
                  value={tone.id}
                  checked={checked}
                  onChange={() => onChange({ tone: tone.id as Tone })}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "block text-sm font-semibold",
                    checked ? "text-accent" : "text-fg",
                  )}
                >
                  {tone.label}
                </span>
                <span className="mt-1 block text-xs leading-snug text-muted">
                  {tone.blurb}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
