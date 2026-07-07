// Shared job-queue API used by BOTH the Next app (enqueue/read) and the render
// worker (claim/update/complete/fail). No `server-only` — the worker imports it.
import { db } from "./db";
import { CREDITS_PER_RENDER, getPlan } from "./plans";
import { spendCredits, refundCredits } from "./credits";
import type { Tone } from "@/providers/types";

export interface StartRenderInput {
  name: string;
  brand: string;
  product: string;
  audience?: string;
  tone: Tone;
  avatarId?: string;
  durationSec: number;
  /** Optional pre-written/edited script. If absent, the pipeline writes one. */
  script?: string;
}

/** Snapshot of everything the worker needs, stored on RenderJob.config as JSON. */
export interface RenderConfig {
  brand: string;
  product: string;
  audience?: string;
  tone: Tone;
  durationSec: number;
  width: number;
  height: number;
  watermark: boolean;
  maxResolution: "720p" | "1080p";
  script?: string;
}

export interface CompletedAsset {
  videoPath: string;
  thumbPath?: string;
  width: number;
  height: number;
  durationMs: number;
  sizeBytes?: number;
}

const RESOLUTIONS = {
  "720p": { width: 720, height: 1280 },
  "1080p": { width: 1080, height: 1920 },
} as const;

/**
 * Create the project + queued render job and reserve credits atomically.
 * Credits are spent up-front and refunded by the worker if the render fails.
 * Throws InsufficientCreditsError when the balance is too low.
 */
export async function enqueueRender(
  userId: string,
  planId: string,
  input: StartRenderInput,
) {
  const plan = getPlan(planId);
  const res = RESOLUTIONS[plan.maxResolution];

  const project = await db.project.create({
    data: {
      userId,
      name: input.name,
      brand: input.brand,
      product: input.product,
      audience: input.audience ?? null,
      tone: input.tone,
      script: input.script ?? null,
      avatarId: input.avatarId ?? null,
      aspect: "9:16",
    },
  });

  const config: RenderConfig = {
    brand: input.brand,
    product: input.product,
    audience: input.audience,
    tone: input.tone,
    durationSec: input.durationSec,
    width: res.width,
    height: res.height,
    watermark: plan.watermark,
    maxResolution: plan.maxResolution,
    script: input.script,
  };

  const job = await db.renderJob.create({
    data: {
      userId,
      projectId: project.id,
      avatarId: input.avatarId ?? null,
      status: "queued",
      cost: CREDITS_PER_RENDER,
      scriptText: input.script ?? null,
      config: JSON.stringify(config),
    },
  });

  try {
    await spendCredits(userId, CREDITS_PER_RENDER, "render_debit", job.id);
  } catch (err) {
    // Roll back the job (and its project) so we never leave an unpaid job queued.
    await db.renderJob.delete({ where: { id: job.id } }).catch(() => {});
    await db.project.delete({ where: { id: project.id } }).catch(() => {});
    throw err;
  }

  return job;
}

export type ClaimedJob = NonNullable<Awaited<ReturnType<typeof claimNextQueuedJob>>>;

/** Atomically claim the oldest queued job. Returns null if the queue is empty. */
export async function claimNextQueuedJob() {
  const next = await db.renderJob.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!next) return null;

  const claim = await db.renderJob.updateMany({
    where: { id: next.id, status: "queued" },
    data: { status: "rendering", startedAt: new Date(), progress: 2, stage: "script" },
  });
  if (claim.count === 0) return null; // another worker grabbed it

  return db.renderJob.findUnique({
    where: { id: next.id },
    include: {
      project: { include: { avatar: true } },
      avatar: true,
      user: true,
    },
  });
}

export async function updateJobProgress(
  jobId: string,
  data: { stage?: string; progress?: number; scriptText?: string },
) {
  await db.renderJob.update({ where: { id: jobId }, data });
}

export async function completeJob(jobId: string, asset: CompletedAsset) {
  await db.$transaction([
    db.asset.create({
      data: {
        jobId,
        videoPath: asset.videoPath,
        thumbPath: asset.thumbPath ?? null,
        width: asset.width,
        height: asset.height,
        durationMs: asset.durationMs,
        sizeBytes: asset.sizeBytes ?? null,
      },
    }),
    db.renderJob.update({
      where: { id: jobId },
      data: { status: "done", progress: 100, stage: "done", finishedAt: new Date() },
    }),
  ]);
}

/** Mark a job failed and refund the reserved credits (idempotent per job). */
export async function failJob(jobId: string, message: string) {
  const job = await db.renderJob.findUnique({ where: { id: jobId } });
  if (!job) return;
  await db.renderJob.update({
    where: { id: jobId },
    data: { status: "failed", error: message.slice(0, 500), finishedAt: new Date() },
  });
  await refundCredits(job.userId, job.cost, jobId);
}

// ── Read helpers for the app ──────────────────────────────────────────────
export function listJobsForUser(userId: string) {
  return db.renderJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { project: true, avatar: true, asset: true },
  });
}

export function getJobForUser(userId: string, jobId: string) {
  return db.renderJob.findFirst({
    where: { id: jobId, userId },
    include: { project: true, avatar: true, asset: true },
  });
}

export function listAvatars() {
  return db.avatar.findMany({ orderBy: { createdAt: "asc" } });
}

export function countActiveJobs(userId: string) {
  return db.renderJob.count({
    where: { userId, status: { in: ["queued", "rendering"] } },
  });
}
