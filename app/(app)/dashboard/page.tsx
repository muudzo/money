import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBalance } from "@/lib/credits";
import { countActiveJobs, listJobsForUser } from "@/lib/jobs";
import { getPlan } from "@/lib/plans";
import { buttonClasses } from "@/components/ui/Button";
import {
  IconArrowRight,
  IconBolt,
  IconClapper,
  IconPlus,
  IconTrendingUp,
  IconVideo,
} from "@/components/ui/icons";
import { RenderCard } from "@/components/app/RenderCard";

export const metadata: Metadata = { title: "Dashboard" };

function greetingForHour(hour: number): string {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [credits, jobs, activeJobs] = await Promise.all([
    getBalance(user.id),
    listJobsForUser(user.id),
    countActiveJobs(user.id),
  ]);

  const plan = getPlan(user.subscription?.plan);
  const doneCount = jobs.filter((j) => j.status === "done").length;
  const recent = jobs.slice(0, 6);
  const firstName = user.name?.trim().split(/\s+/)[0];
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm text-muted">
            {greeting}
            {firstName ? `, ${firstName}` : ""}.
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-fg">
            Your studio
          </h1>
        </div>
        <Link href="/dashboard/new" className={buttonClasses("primary", "lg")}>
          <IconPlus className="size-4" />
          Create new ad
        </Link>
      </header>

      {/* Stat bento */}
      <section aria-label="Account overview" className="mt-9 grid gap-5 md:grid-cols-4">
        <div className="grain relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,oklch(30%_0.09_285),oklch(22%_0.05_260)_60%,oklch(28%_0.08_220))] p-6 text-white shadow-[var(--shadow)] md:col-span-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
            <IconBolt className="size-4" />
            Render credits
          </p>
          <p className="relative mt-3 font-display text-5xl font-bold tabular-nums">
            {credits.toLocaleString()}
          </p>
          <div className="relative mt-4 flex flex-wrap items-center gap-3 text-sm text-white/75">
            <span className="rounded-full bg-white/12 px-2.5 py-0.5 text-xs font-semibold text-white/90">
              {plan.name} plan
            </span>
            <span>1 credit = 1 finished ad</span>
          </div>
          <Link
            href="/dashboard/billing"
            className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
          >
            {plan.id === "free" ? "Upgrade for monthly credits" : "Manage plan"}
            <IconArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="surface-card flex flex-col justify-between p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
            <IconTrendingUp className="size-4" />
            Renders made
          </p>
          <p className="mt-3 font-display text-4xl font-bold tabular-nums text-fg">
            {doneCount}
          </p>
          <p className="mt-2 text-xs text-subtle">finished & ready to post</p>
        </div>

        <div className="surface-card flex flex-col justify-between p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
            <IconClapper className="size-4" />
            In the pipeline
          </p>
          <p className="mt-3 font-display text-4xl font-bold tabular-nums text-fg">
            {activeJobs}
          </p>
          <p className="mt-2 text-xs text-subtle">
            {activeJobs === 0 ? "queue is clear" : "rendering right now"}
          </p>
        </div>
      </section>

      {/* Recent renders */}
      <section aria-labelledby="recent-heading" className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="recent-heading"
            className="font-display text-xl font-semibold text-fg"
          >
            Recent renders
          </h2>
          {jobs.length > 0 && (
            <Link
              href="/dashboard/library"
              className="text-sm font-medium text-accent transition-opacity hover:opacity-80"
            >
              View library →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <IconVideo className="size-6" />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-fg">
              No renders yet — your first ad is 5 steps away
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Describe your product, pick a presenter, choose a length. The
              pipeline handles script, voice and captions.
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
          <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {recent.map((job) => (
              <li key={job.id}>
                <RenderCard job={job} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
