import "server-only";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { db } from "./db";
import { getSession } from "./session";
import { SIGNUP_BONUS_CREDITS } from "./plans";

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export class AuthError extends Error {}

/**
 * Create a user with their free subscription and one-time signup credit grant,
 * all in a single transaction so we never leave a half-provisioned account.
 */
export async function createUser(
  email: string,
  password: string,
  name?: string,
): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email: normalized } });
  if (existing) {
    throw new AuthError("An account with that email already exists.");
  }
  const passwordHash = await hashPassword(password);
  return db.user.create({
    data: {
      email: normalized,
      passwordHash,
      name: name?.trim() || null,
      subscription: { create: { plan: "free", status: "active" } },
      creditEntries: {
        create: { delta: SIGNUP_BONUS_CREDITS, reason: "signup_bonus" },
      },
    },
  });
}

export async function authenticate(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return null;
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
