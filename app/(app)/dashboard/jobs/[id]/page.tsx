import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getJobForUser } from "@/lib/jobs";
import { formatDate } from "@/lib/utils";
import { IconChevronLeft } from "@/components/ui/icons";
import { JobProgress, type JobSnapshot } from "@/components/app/JobProgress";

export const metadata: Metadata = { title: "Render" };

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await getJobForUser(user.id, id);
  if (!job) notFound();

  const initial: JobSnapshot = {
    id: job.id,
    status: job.status as JobSnapshot["status"],
    progress: job.progress,
    stage: job.stage,
    error: job.error,
    scriptText: job.scriptText,
    projectName: job.project.name,
    asset: job.asset
      ? {
          videoUrl: `/api/media/${job.asset.videoPath}`,
          thumbUrl: job.asset.thumbPath
            ? `/api/media/${job.asset.thumbPath}`
            : null,
          width: job.asset.width,
          height: job.asset.height,
          durationMs: job.asset.durationMs,
        }
      : null,
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-9">
        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <IconChevronLeft className="size-4" />
          Library
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-fg">
          {job.project.name}
        </h1>
        <p className="mt-1.5 text-sm text-subtle">
          {job.project.brand} · started {formatDate(job.createdAt)}
          {job.avatar ? ` · presented by ${job.avatar.name}` : ""}
        </p>
      </header>

      <JobProgress initial={initial} />
    </div>
  );
}
