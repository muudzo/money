import "server-only";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { db } from "./db";
import { getSession } from "./session";
import { grantCredits } from "./credits";
import { SIGNUP_BONUS_CREDITS, REFERRAL_BONUS_CREDITS } from "./plans";
import { generateReferralCode, normalizeReferralCode } from "./referral";

const BCRYPT_ROUNDS = 12;

// A valid throwaway hash at the same cost factor. When a login targets an email
// that doesn't exist, we still run bcrypt against this so the response time is
// indistinguishable from a wrong password for a real account — closing the
// timing side channel that would otherwise let an attacker enumerate accounts.
const DUMMY_HASH = bcrypt.hashSync("account-enumeration-guard", BCRYPT_ROUNDS);

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export class AuthError extends Error {}

/** True when a Prisma create failed specifically on the referralCode unique
 * constraint (so we can retry with a fresh code rather than failing signup). */
function isReferralCodeCollision(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("code" in err)) return false;
  if ((err as { code?: string }).code !== "P2002") return false;
  const target = JSON.stringify((err as { meta?: unknown }).meta ?? "");
  return target.includes("referralCode");
}

/**
 * Create a user with their free subscription, a unique referral code, and their
 * one-time signup credit grant — all in a single write so we never leave a
 * half-provisioned account. When `referredByCode` matches an existing user,
 * both the new user and the referrer receive REFERRAL_BONUS_CREDITS (the viral
 * loop). Referral bonuses are best-effort: they never block account creation.
 */
export async function createUser(
  email: string,
  password: string,
  name?: string,
  referredByCode?: string,
): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email: normalized } });
  if (existing) {
    throw new AuthError("An account with that email already exists.");
  }
  const passwordHash = await hashPassword(password);

  // Resolve the referrer (if any) up front; a self-referral or unknown code is
  // simply ignored so a bad link never breaks signup.
  const code = referredByCode ? normalizeReferralCode(referredByCode) : "";
  const referrer = code
    ? await db.user.findUnique({ where: { referralCode: code } })
    : null;

  const creditEntries: { delta: number; reason: string }[] = [
    { delta: SIGNUP_BONUS_CREDITS, reason: "signup_bonus" },
  ];
  if (referrer) {
    creditEntries.push({ delta: REFERRAL_BONUS_CREDITS, reason: "referral_bonus" });
  }

  let user: User | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      user = await db.user.create({
        data: {
          email: normalized,
          passwordHash,
          name: name?.trim() || null,
          referralCode: generateReferralCode(),
          referredById: referrer?.id ?? null,
          subscription: { create: { plan: "free", status: "active" } },
          creditEntries: { create: creditEntries },
        },
      });
      break;
    } catch (err) {
      if (isReferralCodeCollision(err) && attempt < 4) continue; // fresh code, retry
      throw err;
    }
  }
  if (!user) {
    throw new AuthError("Could not create your account. Please try again.");
  }

  // Reward the referrer now that the referee exists. Best-effort: a failure
  // here must not undo an otherwise-successful signup.
  if (referrer) {
    await grantCredits(referrer.id, REFERRAL_BONUS_CREDITS, "referral_bonus").catch(
      () => {},
    );
  }
  return user;
}

export async function authenticate(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) {
    // Spend the same work as a real comparison, then fail. Do NOT short-circuit.
    await verifyPassword(password, DUMMY_HASH);
    return null;
  }
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    include: { subscription: true },
  });
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** For server actions / route handlers that must have an authenticated user. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHORIZED");
  return user;
}
