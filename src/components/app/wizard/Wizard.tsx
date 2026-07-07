"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startRenderAction } from "@/actions/render";
import { formatDuration } from "@/lib/utils";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import {
  IconAlert,
  IconArrowRight,
  IconBolt,
  IconChevronLeft,
  IconSparkles,
} from "@/components/ui/icons";
import { PhoneMock } from "@/components/marketing/PhoneMock";
import { StepBrief } from "./StepBrief";
import { StepScript } from "./StepScript";
import { StepAvatar } from "./StepAvatar";
import { StepFormat } from "./StepFormat";
import { StepReview } from "./StepReview";
import {
  INITIAL_DATA,
  STEP_LABELS,
  validateStep,
  type AvatarOption,
  type StepErrors,
  type WizardData,
} from "./types";

interface WizardProps {
  avatars: AvatarOption[];
  credits: number;
}

export function Wizard({ avatars, credits }: WizardProps) {
  const router = useRouter();
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isOutOfCredits, setIsOutOfCredits] = useState(credits < 1);
  const [isPending, startTransition] = useTransition();

  const hasAvatars = avatars.length > 0;
  const selectedAvatar = useMemo(
    () => avatars.find((a) => a.id === data.avatarId) ?? null,
    [avatars, data.avatarId],
  );

  function update(patch: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...patch }));
    setErrors({});
  }

  function goTo(target: number) {
    if (target <= maxReached) {
      setStep(target);
      setErrors({});
    }
  }

  function next() {
    const stepErrors = validateStep(step, data, hasAvatars);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    const target = Math.min(step + 1, STEP_LABELS.length - 1);
    setStep(target);
    setMaxReached((m) => Math.max(m, target));
  }

  function submit() {
    setSubmitError(null);
    startTransition(async () => {
      const res = await startRenderAction({
        name: data.name.trim(),
        brand: data.brand.trim(),
        product: data.product.trim(),
        audience: data.audience.trim() || undefined,
        tone: data.tone,
        avatarId: data.avatarId ?? undefined,
        durationSec: data.durationSec,
        script:
          data.scriptMode === "own" && data.script.trim()
            ? data.script.trim()
            : undefined,
      });
      if (res.ok) {
        router.push(`/dashboard/jobs/${res.jobId}`);
        return;
      }
      if (res.code === "NO_CREDITS") {
        setIsOutOfCredits(true);
        return;
      }
      setSubmitError(res.error);
    });
  }

  const isLast = step === STEP_LABELS.length - 1;

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <Stepper
          steps={STEP_LABELS}
          current={step}
          maxReached={maxReached}
          onStepClick={goTo}
        />

        <div key={step} className="animate-fade-up mt-8 [animation-duration:300ms]">
          {step === 0 && <StepBrief data={data} errors={errors} onChange={update} />}
          {step === 1 && <StepScript data={data} errors={errors} onChange={update} />}
          {step === 2 && (
            <StepAvatar data={data} errors={errors} avatars={avatars} onChange={update} />
          )}
          {step === 3 && <StepFormat data={data} onChange={update} />}
          {step === 4 && (
            <>
              <StepReview data={data} avatar={selectedAvatar} />
              <div className="mt-6 flex justify-center xl:hidden">
                <WizardPreview data={data} avatar={selectedAvatar} />
              </div>
            </>
          )}
        </div>

        {isOutOfCredits && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-4 rounded-xl border border-transparent bg-[oklch(from_var(--warning)_l_c_h_/_0.12)] p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <IconBolt className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-sm leading-relaxed text-fg">
                <span className="font-semibold">You&apos;re out of render credits.</span>{" "}
                Upgrade to keep creating — plans start at 30 renders a month.
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className={buttonClasses("primary", "sm", "shrink-0")}
            >
              View plans
            </Link>
          </div>
        )}

        {submitError && (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-[oklch(from_var(--danger)_l_c_h_/_0.08)] px-4 py-3.5 text-sm text-danger"
          >
            <IconAlert className="mt-0.5 size-4 shrink-0" />
            {submitError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="ghost"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || isPending}
          >
            <IconChevronLeft className="size-4" />
            Back
          </Button>

          {isLast ? (
            <Button
              size="lg"
              onClick={submit}
              isLoading={isPending}
              disabled={isOutOfCredits}
            >
              <IconSparkles className="size-4" />
              {isPending ? "Starting render…" : "Generate ad · 1 credit"}
            </Button>
          ) : (
            <Button size="lg" onClick={next}>
              Continue
              <IconArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Live preview rail */}
      <aside className="hidden xl:block" aria-label="Live ad preview">
        <div className="sticky top-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-subtle">
            Live preview
          </p>
          <WizardPreview data={data} avatar={selectedAvatar} />
        </div>
      </aside>
    </div>
  );
}

function WizardPreview({
  data,
  avatar,
}: {
  data: WizardData;
  avatar: AvatarOption | null;
}) {
  const scriptLines = data.script
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3);

  const captions =
    data.scriptMode === "own" && scriptLines.length > 0
      ? scriptLines
      : [
          data.product.trim()
            ? data.product.trim().slice(0, 42)
            : "your product, in the wild",
          `for ${data.audience.trim() || "people who scroll fast"}`,
          "link below — thank me later 👇",
        ];

  return (
    <div className="flex flex-col items-center">
      <PhoneMock
        className="w-[240px]"
        brand={data.brand.trim() || "yourbrand"}
        hook={data.name.trim() || "Your hook goes here"}
        captions={captions}
        avatarUrl={avatar ? `/api/asset/${avatar.imagePath}` : null}
        avatarName={avatar?.name ?? "AI voice"}
        toneLabel={data.tone.charAt(0).toUpperCase() + data.tone.slice(1)}
        durationLabel={formatDuration(data.durationSec * 1000)}
      />
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-[0.65rem] font-medium text-subtle">
        <span className="rounded-full border border-border px-2.5 py-1">
          {data.durationSec}s
        </span>
        <span className="rounded-full border border-border px-2.5 py-1">9:16</span>
        <span className="rounded-full border border-border px-2.5 py-1">
          {avatar ? avatar.voice : "auto voice"}
        </span>
      </div>
    </div>
  );
}
