"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createUser, authenticate, AuthError } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";

export interface AuthState {
  error?: string | null;
}

export const initialAuthState: AuthState = { error: null };

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
  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "Incorrect email or password." };
  }
  await createSession({ userId: user.id, email: user.email });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
