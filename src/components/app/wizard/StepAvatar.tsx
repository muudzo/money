"use client";

import { cn, titleCase } from "@/lib/utils";
import { IconCheck, IconMic, IconUser } from "@/components/ui/icons";
import type { AvatarOption, StepErrors, WizardData } from "./types";

interface StepAvatarProps {
  data: WizardData;
  errors: StepErrors;
  avatars: AvatarOption[];
  onChange: (patch: Partial<WizardData>) => void;
}

export function StepAvatar({ data, errors, avatars, onChange }: StepAvatarProps) {
  if (avatars.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center">
        <IconUser className="size-8 text-subtle" />
        <p className="mt-4 text-sm font-medium text-fg">No avatars available yet</p>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          Your ad will render as a voiceover with captions over a branded
          backdrop. You can continue to the next step.
        </p>
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium text-fg">
        Pick your presenter
      </legend>
      <p className="mt-1 text-xs text-subtle">
        Each avatar pairs a look with a voice and delivery style.
      </p>
      {errors.avatarId && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {errors.avatarId}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        {avatars.map((avatar) => {
          const checked = data.avatarId === avatar.id;
          return (
            <label
              key={avatar.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-xl border transition-[border-color,box-shadow,transform] duration-200 ease-out-expo",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2",
                checked
                  ? "border-accent shadow-[var(--shadow-glow)]"
                  : "border-border hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow)]",
              )}
            >
              <input
                type="radio"
                name="wiz-avatar"
                value={avatar.id}
                checked={checked}
                onChange={() => onChange({ avatarId: avatar.id })}
                className="sr-only"
              />
              <div className="relative aspect-[4/5] bg-surface-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/asset/${avatar.imagePath}`}
                  alt={`${avatar.name} avatar portrait`}
                  width={240}
                  height={300}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,oklch(0%_0_0/0.6),transparent)]"
                />
                {checked && (
                  <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-accent text-accent-fg shadow-[var(--shadow)]">
                    <IconCheck className="size-3.5" />
                  </span>
                )}
                <div className="absolute inset-x-3 bottom-2.5">
                  <p className="font-display text-sm font-semibold text-white">
                    {avatar.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[0.65rem] text-white/75">
                    <IconMic className="size-3" />
                    {avatar.voice}
                    {avatar.tone ? ` · ${titleCase(avatar.tone)}` : ""}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
