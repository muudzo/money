import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listJobsForUser } from "@/lib/jobs";
import { buttonClasses } from "@/components/ui/Button";
import { IconLayers, IconPlus } from "@/components/ui/icons";
import { RenderCard } from "@/components/app/RenderCard";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jobs = await listJobsForUser(user.id);
  const readyCount = jobs.filter((j) => j.status === "done").length;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
            Library
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {jobs.length === 0
              ? "Every render you make lands here."
              : `${jobs.length} render${jobs.length === 1 ? "" : "s"} · ${readyCount} ready to post`}
          </p>
        </div>
        <Link href="/dashboard/new" className={buttonClasses("primary", "md")}>
          <IconPlus className="size-4" />
          New ad
        </Link>
      </header>

      {jobs.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <IconLayers className="size-6" />
          </span>
          <h2 className="mt-5 font-display text-lg font-semibold text-fg">
            An empty shelf, for now
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Renders live here forever — thumbnails, scripts and the final
            video. Kick off your first one and watch it fill up.
          </p>
          <Link
            href="/dashboard/new"
            className={buttonClasses("primary", "md", "mt-7")}
          >
            <IconPlus className="size-4" />
            Create your first ad
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {jobs.map((job) => (
            <li key={job.id}>
              <RenderCard job={job} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
