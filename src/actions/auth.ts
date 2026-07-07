"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createUser, authenticate, AuthError } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";
import { getClientIp } from "@/lib/request";
import {
  checkRateLimit,
  resetRateLimit,
  retryAfterSeconds,
} from "@/lib/rate-limit";

export interface AuthState {
  error?: string | null;
}

export const initialAuthState: AuthState = { error: null };

const FIFTEEN_MIN = 15 * 60 * 1000;
// Signups and logins are the prime targets for bot abuse (free-credit farming,
// credential stuffing). Cap them per IP, and additionally per targeted email on
// login so one account can't be brute-forced from a rotating IP pool.
const SIGNUP_PER_IP = { limit: 5, windowMs: FIFTEEN_MIN };
const LOGIN_PER_IP = { limit: 10, windowMs: FIFTEEN_MIN };
const LOGIN_PER_EMAIL = { limit: 5, windowMs: FIFTEEN_MIN };

function tooManyMessage(retryAfterS: number): string {
  const mins = Math.max(1, Math.ceil(retryAfterS / 60));
  return `Too many attempts. Please try again in about ${mins} minute${mins === 1 ? "" : "s"}.`;
}

const signupSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const ip = await getClientIp();
  const limited = checkRateLimit(`signup:ip:${ip}`, SIGNUP_PER_IP);
  if (!limited.ok) {
    return { error: tooManyMessage(retryAfterSeconds(limited)) };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }
  try {
    const user = await createUser(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name,
    );
    await createSession({ userId: user.id, email: user.email });
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    return { error: "Could not create your account. Please try again." };
  }
  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const ip = await getClientIp();
  const emailKey = `login:email:${parsed.data.email.trim().toLowerCase()}`;
  const byIp = checkRateLimit(`login:ip:${ip}`, LOGIN_PER_IP);
  const byEmail = checkRateLimit(emailKey, LOGIN_PER_EMAIL);
  if (!byIp.ok || !byEmail.ok) {
    const wait = Math.max(retryAfterSeconds(byIp), retryAfterSeconds(byEmail));
    return { error: tooManyMessage(wait) };
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "Incorrect email or password." };
  }
  // A successful login clears the per-email counter so a returning user who
  // fat-fingered a few times isn't left locked out after they get it right.
  resetRateLimit(emailKey);
  await createSession({ userId: user.id, email: user.email });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
