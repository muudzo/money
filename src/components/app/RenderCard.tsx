import Link from "next/link";
import type { Asset, Avatar, Project, RenderJob } from "@prisma/client";
import { formatDate, formatDuration } from "@/lib/utils";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { IconClapper, IconPlay } from "@/components/ui/icons";

export type JobWithRelations = RenderJob & {
  project: Project;
  avatar: Avatar | null;
  asset: Asset | null;
};

const STATUS_META: Record<string, { label: string; tone: BadgeTone; pulse?: boolean }> = {
  queued: { label: "Queued", tone: "warning" },
  rendering: { label: "Rendering", tone: "accent", pulse: true },
  done: { label: "Ready", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

/** Deterministic gradient placeholder for jobs without a thumbnail. */
const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(160deg, oklch(42% 0.15 300), oklch(22% 0.05 280))",
  "linear-gradient(160deg, oklch(44% 0.11 210), oklch(22% 0.05 250))",
  "linear-gradient(160deg, oklch(45% 0.1 60), oklch(23% 0.04 40))",
  "linear-gradient(160deg, oklch(43% 0.12 350), oklch(22% 0.05 320))",
];

function gradientFor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
}

export function RenderCard({ job }: { job: JobWithRelations }) {
  const status = STATUS_META[job.status] ?? STATUS_META.queued;
  const thumbUrl = job.asset?.thumbPath
    ? `/api/media/${job.asset.thumbPath}`
    : null;

  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      className="group block rounded-xl transition-transform duration-300 ease-out-expo hover:-translate-y-1"
      aria-label={`${job.project.name} — ${status.label}`}
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-border shadow-[var(--shadow-sm)] transition-[box-shadow,border-color] duration-300 group-hover:border-border-strong group-hover:shadow-[var(--shadow)]">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt={`Thumbnail for ${job.project.name}`}
            width={270}
            height={480}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: gradientFor(job.id) }}
          >
            <IconClapper className="size-8 text-white/45" />
          </div>
        )}

        {/* Legibility scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,oklch(0%_0_0/0.55),transparent)]"
        />

        <div className="absolute left-2.5 top-2.5">
          <Badge tone={status.tone} pulse={status.pulse}>
            {status.label}
          </Badge>
        </div>

        {job.asset && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/55 px-1.5 py-0.5 font-mono text-[0.65rem] font-medium text-white backdrop-blur-sm">
            {formatDuration(job.asset.durationMs)}
          </span>
        )}

        {job.status === "done" && (
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-300 ease-spring group-hover:scale-100 group-hover:opacity-100"
          >
            <IconPlay className="ml-0.5 size-4" />
          </span>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <p className="truncate text-sm font-medium text-fg transition-colors group-hover:text-accent">
          {job.project.name}
        </p>
        <p className="mt-0.5 text-xs text-subtle">
          {job.project.brand} · {formatDate(job.createdAt)}
        </p>
      </div>
    </Link>
  );
}
