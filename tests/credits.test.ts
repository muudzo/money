import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Exercises the real credit-ledger money path against a throwaway SQLite db:
 * grants, atomic spend-with-gating, insufficient-balance rejection, and
 * idempotent refunds. This is the flow that protects revenue, so it uses the
 * actual Prisma-backed implementation rather than mocks.
 */

// Populated in beforeAll after the test db exists and env is set.
let db: typeof import("../src/lib/db").db;
let credits: typeof import("../src/lib/credits");

async function makeUser(): Promise<string> {
  const rand = Math.random().toString(36).slice(2);
  const user = await db.user.create({
    data: {
      email: `u_${rand}@test.dev`,
      passwordHash: "x",
      referralCode: `R${rand.toUpperCase().slice(0, 8)}`,
    },
  });
  return user.id;
}

beforeAll(async () => {
  process.env.DATABASE_URL = "file:./test.db";
  process.env.AUTH_SECRET = "test-secret-value-1234567890";

  const testDb = path.join(process.cwd(), "prisma", "test.db");
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
});

describe("credit ledger", () => {
  it("starts at zero and reflects grants", async () => {
    const userId = await makeUser();
    expect(await credits.getBalance(userId)).toBe(0);
    await credits.grantCredits(userId, 30, "plan_grant");
    expect(await credits.getBalance(userId)).toBe(30);
  });

  it("spends atomically and lowers the balance", async () => {
    const userId = await makeUser();
    await credits.grantCredits(userId, 5, "signup_bonus");
    const remaining = await credits.spendCredits(userId, 2, "render_debit", "job1");
    expect(remaining).toBe(3);
    expect(await credits.getBalance(userId)).toBe(3);
  });

  it("refuses to spend more than the balance", async () => {
    const userId = await makeUser();
    await credits.grantCredits(userId, 1, "signup_bonus");
    await expect(
      credits.spendCredits(userId, 2, "render_debit", "jobX"),
    ).rejects.toBeInstanceOf(credits.InsufficientCreditsError);
    // Balance is untouched after a rejected spend.
    expect(await credits.getBalance(userId)).toBe(1);
  });

  it("refunds a failed render and is idempotent per job", async () => {
    const userId = await makeUser();
    await credits.grantCredits(userId, 3, "plan_grant");
    await credits.spendCredits(userId, 1, "render_debit", "job42");
    expect(await credits.getBalance(userId)).toBe(2);

    await credits.refundCredits(userId, 1, "job42");
    expect(await credits.getBalance(userId)).toBe(3);

    // A duplicate refund for the same job must NOT double-credit.
    await credits.refundCredits(userId, 1, "job42");
    expect(await credits.getBalance(userId)).toBe(3);
  });
});
