"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Card } from "@/components/ui/Card";
import {
  IconAlert,
  IconCaptions,
  IconCheck,
  IconClapper,
  IconCopy,
  IconDownload,
  IconMic,
  IconPlus,
  IconSparkles,
} from "@/components/ui/icons";
import { VideoPlayer } from "./VideoPlayer";

export interface JobSnapshot {
  id: string;
  status: "queued" | "rendering" | "done" | "failed";
  progress: number;
  stage: string | null;
  error: string | null;
  scriptText: string | null;
  projectName: string;
  asset: {
    videoUrl: string;
    thumbUrl: string | null;
    width: number;
    height: number;
    durationMs: number;
  } | null;
}

const POLL_MS = 1500;

const STAGES = [
  { id: "script", label: "Script", icon: IconSparkles, copy: "Writing a hook people can't scroll past…" },
  { id: "tts", label: "Voiceover", icon: IconMic, copy: "Recording the voiceover take…" },
  { id: "captions", label: "Captions", icon: IconCaptions, copy: "Timing every word to the voice…" },
  { id: "compose", label: "Compose", icon: IconClapper, copy: "Compositing the final 9:16 cut…" },
] as const;

function stageIndex(stage: string | null): number {
  const i = STAGES.findIndex((s) => s.id === stage);
  return i === -1 ? 0 : i;
}

export function JobProgress({ initial }: { initial: JobSnapshot }) {
  const [job, setJob] = useState<JobSnapshot>(initial);
  const [copied, setCopied] = useState(false);
  const isActive = job.status === "queued" || job.status === "rendering";

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${initial.id}`, { cache: "no-store" });
        if (!res.ok) return; // transient error — keep polling
        const next = (await res.json()) as JobSnapshot;
        setJob(next);
      } catch {
        // network hiccup — next tick retries
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [initial.id, isActive]);

  if (job.status === "done" && job.asset) {
    return <DoneView job={job} copied={copied} setCopied={setCopied} />;
  }
  if (job.status === "failed") {
    return <FailedView error={job.error} />;
  }
  return <ActiveView job={job} />;
}

function ActiveView({ job }: { job: JobSnapshot }) {
  const current = job.status === "queued" ? -1 : stageIndex(job.stage);
  const copy =
    job.status === "queued"
      ? "Waiting in the render queue — first in, first out."
      : (STAGES[current]?.copy ?? "Rendering…");

  return (
    <Card className="mx-auto max-w-2xl p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-semibold text-fg">
          {job.status === "queued" ? "Queued" : "Rendering your ad"}
        </h2>
        <span className="font-display text-3xl font-bold tabular-nums text-accent">
          {Math.round(job.progress)}%
        </span>
      </div>

      <Progress value={job.progress} className="mt-5 h-2.5" label="Render progress" />

      <p aria-live="polite" className="mt-4 text-sm text-muted">
        {copy}
      </p>

      <ol className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {STAGES.map((stage, i) => {
          const isDone = current > i || job.progress >= 100;
          const isCurrent = current === i;
          return (
            <li
              key={stage.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-medium transition-colors duration-300",
                isCurrent && "border-transparent bg-accent-soft text-accent",
                isDone && "border-border bg-surface-2 text-muted",
                !isCurrent && !isDone && "border-border text-subtle",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full",
                  isCurrent && "bg-accent text-accent-fg motion-safe:animate-pulse",
                  isDone && "bg-[oklch(from_var(--success)_l_c_h_/_0.15)] text-success",
                  !isCurrent && !isDone && "bg-surface-2",
                )}
              >
                {isDone ? <IconCheck className="size-4" /> : <stage.icon className="size-4" />}
              </span>
              {stage.label}
            </li>
          );
        })}
      </ol>

      <p className="mt-7 rounded-lg bg-surface-2 px-4 py-3 text-xs leading-relaxed text-subtle">
        You can safely leave this page — the render continues in the
        background and will be waiting in your library.
      </p>
    </Card>
  );
}

function DoneView({
  job,
  copied,
  setCopied,
}: {
  job: JobSnapshot;
  copied: boolean;
  setCopied: (v: boolean) => void;
}) {
  const asset = job.asset!;

  async function copyScript() {
    if (!job.scriptText) return;
    try {
      await navigator.clipboard.writeText(job.scriptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
      <VideoPlayer videoUrl={asset.videoUrl} thumbUrl={asset.thumbUrl} />

      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-[oklch(from_var(--success)_l_c_h_/_0.14)] px-3.5 py-1.5 text-xs font-semibold text-success">
          <IconCheck className="size-3.5" />
          Render complete · {asset.width}×{asset.height}
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-fg">
          Ready to post.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your vertical ad is rendered with voiceover and synced captions baked
          in. Download it and upload natively for the best reach.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={asset.videoUrl}
            download={`${job.projectName.replace(/[^\w-]+/g, "-")}.mp4`}
            className={buttonClasses("primary", "md")}
          >
            <IconDownload className="size-4" />
            Download MP4
          </a>
          <Link href="/dashboard/new" className={buttonClasses("secondary", "md")}>
            <IconPlus className="size-4" />
            Create another
          </Link>
          {job.scriptText && (
            <Button variant="ghost" onClick={copyScript}>
              <IconCopy className="size-4" />
              {copied ? "Copied!" : "Copy script"}
            </Button>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-surface-2 p-5">
          <h3 className="text-sm font-semibold text-fg">
            Posting tip — TikTok · Reels · Shorts
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Upload the file directly in each app rather than cross-posting —
            native uploads keep full resolution and score better distribution.
            Paste the script as your caption and put the hook in the first
            line.
          </p>
        </div>

        {job.scriptText && (
          <details className="group mt-5">
            <summary className="cursor-pointer list-none text-sm font-medium text-accent transition-opacity hover:opacity-80 [&::-webkit-details-marker]:hidden">
              View full script
            </summary>
            <p className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-bg p-4 font-mono text-xs leading-relaxed text-muted">
              {job.scriptText}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}

function FailedView({ error }: { error: string | null }) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[oklch(from_var(--danger)_l_c_h_/_0.12)] text-danger">
        <IconAlert className="size-5" />
      </span>
      <h2 className="mt-5 font-display text-xl font-semibold text-fg">
        This render didn&apos;t make it
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {error || "Something went wrong in the pipeline."} Your credit has been
        refunded automatically.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link href="/dashboard/new" className={buttonClasses("primary", "md")}>
          Try again
        </Link>
        <Link href="/dashboard/library" className={buttonClasses("secondary", "md")}>
          Back to library
        </Link>
      </div>
    </Card>
  );
}
