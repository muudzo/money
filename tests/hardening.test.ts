import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * DB-backed checks for the abuse/robustness guarantees: the per-plan concurrent
 * render cap, Stripe webhook idempotency at the storage layer, and referral
 * code generation. Uses its own SQLite file so it never races the credits test.
 *
 * Note: createUser lives in a `server-only` module and can't be imported here,
 * so its referral orchestration is proven by the live signup in end-to-end
 * verification; this file covers the enforceable primitives underneath it.
 */

let db: typeof import("../src/lib/db").db;
let credits: typeof import("../src/lib/credits");
let jobs: typeof import("../src/lib/jobs");
let referral: typeof import("../src/lib/referral");

function baseInput(name: string): import("../src/lib/jobs").StartRenderInput {
  return {
    name,
    brand: "Lumen",
    product: "a self-cleaning water bottle",
    tone: "energetic",
    durationSec: 15,
  };
}

async function makeUser(): Promise<string> {
  const rand = Math.random().toString(36).slice(2);
  const user = await db.user.create({
    data: {
      email: `h_${rand}@test.dev`,
      passwordHash: "x",
      referralCode: referral.generateReferralCode(),
    },
  });
  return user.id;
}

beforeAll(async () => {
  process.env.DATABASE_URL = "file:./test-hardening.db";
  process.env.AUTH_SECRET = "test-secret-value-1234567890";

  const testDb = path.join(process.cwd(), "prisma", "test-hardening.db");
  for (const f of [testDb, `${testDb}-journal`]) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* not present */
    }
  }

  execSync(
    "npx prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss",
    { stdio: "ignore", env: { ...process.env } },
  );

  db = (await import("../src/lib/db")).db;
  credits = await import("../src/lib/credits");
  jobs = await import("../src/lib/jobs");
  referral = await import("../src/lib/referral");
});

describe("concurrent render cap", () => {
  it("blocks a second in-flight render on the free plan (limit 1)", async () => {
    const userId = await makeUser();
    await credits.grantCredits(userId, 5, "signup_bonus");

    // First enqueue succeeds and leaves a queued (in-flight) job.
    const first = await jobs.enqueueRender(userId, "free", baseInput("Ad 1"));
    expect(first.status).toBe("queued");

    // Second enqueue is over the free plan's concurrency limit.
    await expect(
      jobs.enqueueRender(userId, "free", baseInput("Ad 2")),
    ).rejects.toBeInstanceOf(jobs.TooManyActiveJobsError);

    // The rejected enqueue must not have charged a credit (still 4 left).
    expect(await credits.getBalance(userId)).toBe(4);
  });

  it("allows more concurrency on a higher plan", async () => {
    const userId = await makeUser();
    await credits.grantCredits(userId, 10, "plan_grant");
    // growth allows 3 concurrent — three enqueues should all succeed.
    await jobs.enqueueRender(userId, "growth", baseInput("G1"));
    await jobs.enqueueRender(userId, "growth", baseInput("G2"));
    await jobs.enqueueRender(userId, "growth", baseInput("G3"));
    await expect(
      jobs.enqueueRender(userId, "growth", baseInput("G4")),
    ).rejects.toBeInstanceOf(jobs.TooManyActiveJobsError);
  });
});

describe("priority queue", () => {
  it("claims a paid-tier job before an older free-tier job", async () => {
    // Isolate: park any queued jobs from earlier tests so they can't win the claim.
    await db.renderJob.updateMany({
      where: { status: "queued" },
      data: { status: "failed" },
    });

    const freeUser = await makeUser();
    const scaleUser = await makeUser();
    await credits.grantCredits(freeUser, 3, "signup_bonus");
    await credits.grantCredits(scaleUser, 3, "plan_grant");

    // Free job enqueued FIRST (older createdAt)…
    const freeJob = await jobs.enqueueRender(freeUser, "free", baseInput("Free ad"));
    // …then a scale job arrives.
    const scaleJob = await jobs.enqueueRender(scaleUser, "scale", baseInput("Scale ad"));

    // The worker must pick the scale job despite it being newer.
    const first = await jobs.claimNextQueuedJob();
    expect(first?.id).toBe(scaleJob.id);
    const second = await jobs.claimNextQueuedJob();
    expect(second?.id).toBe(freeJob.id);
  });
});

describe("stale job recovery", () => {
  it("re-queues rendering jobs older than the threshold, leaves fresh ones", async () => {
    const userId = await makeUser();
    await credits.grantCredits(userId, 5, "plan_grant");
    const stale = await jobs.enqueueRender(userId, "growth", baseInput("Stale"));
    const fresh = await jobs.enqueueRender(userId, "growth", baseInput("Fresh"));

    await db.renderJob.update({
      where: { id: stale.id },
      data: { status: "rendering", startedAt: new Date(Date.now() - 60 * 60 * 1000) },
    });
    await db.renderJob.update({
      where: { id: fresh.id },
      data: { status: "rendering", startedAt: new Date() },
    });

    const recovered = await jobs.requeueStaleJobs(15 * 60 * 1000);
    expect(recovered).toBe(1);
    const staleAfter = await db.renderJob.findUnique({ where: { id: stale.id } });
    const freshAfter = await db.renderJob.findUnique({ where: { id: fresh.id } });
    expect(staleAfter?.status).toBe("queued");
    expect(freshAfter?.status).toBe("rendering");
  });
});

describe("webhook idempotency", () => {
  it("rejects a duplicate Stripe event id", async () => {
    await db.webhookEvent.create({
      data: { id: "evt_dup_1", type: "checkout.session.completed" },
    });
    await expect(
      db.webhookEvent.create({
        data: { id: "evt_dup_1", type: "checkout.session.completed" },
      }),
    ).rejects.toBeTruthy();
  });
});

describe("referral codes", () => {
  it("generates codes of the right shape from an unambiguous alphabet", () => {
    const code = referral.generateReferralCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[2-9A-HJ-NP-Z]+$/); // no 0/O/1/I/L
  });

  it("is overwhelmingly likely to produce distinct codes", () => {
    const set = new Set(
      Array.from({ length: 200 }, () => referral.generateReferralCode()),
    );
    expect(set.size).toBe(200);
  });

  it("normalizes user-supplied codes", () => {
    expect(referral.normalizeReferralCode("  7qp4kx9m ")).toBe("7QP4KX9M");
  });
});
