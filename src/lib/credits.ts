// NOTE: no `server-only` here — the render worker (plain Node via tsx) imports
// this module, and `server-only` throws outside the React Server bundler.
import { db } from "./db";

export type CreditReason =
  | "signup_bonus"
  | "referral_bonus"
  | "plan_grant"
  | "render_debit"
  | "render_refund"
  | "pack_purchase";

export class InsufficientCreditsError extends Error {
  constructor(
    public balance: number,
    public required: number,
  ) {
    super(`Insufficient credits: have ${balance}, need ${required}.`);
    this.name = "InsufficientCreditsError";
  }
}

export async function getBalance(userId: string): Promise<number> {
  const agg = await db.creditLedger.aggregate({
    where: { userId },
    _sum: { delta: true },
  });
  return agg._sum.delta ?? 0;
}

export async function grantCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  jobId?: string,
): Promise<void> {
  if (amount <= 0) return;
  await db.creditLedger.create({
    data: { userId, delta: Math.abs(amount), reason, jobId },
  });
}

/**
 * Atomically spend credits: re-reads the balance inside the transaction and
 * refuses if it would go negative. Throws InsufficientCreditsError otherwise.
 */
export async function spendCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  jobId?: string,
): Promise<number> {
  return db.$transaction(async (tx) => {
    const agg = await tx.creditLedger.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    const balance = agg._sum.delta ?? 0;
    if (balance < amount) throw new InsufficientCreditsError(balance, amount);
    await tx.creditLedger.create({
      data: { userId, delta: -Math.abs(amount), reason, jobId },
    });
    return balance - amount;
  });
}

/** Refund a previously debited amount for a failed job (idempotent per job). */
export async function refundCredits(
  userId: string,
  amount: number,
  jobId: string,
): Promise<void> {
  const already = await db.creditLedger.findFirst({
    where: { userId, jobId, reason: "render_refund" },
  });
  if (already) return;
  await db.creditLedger.create({
    data: { userId, delta: Math.abs(amount), reason: "render_refund", jobId },
  });
}
