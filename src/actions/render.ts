"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser, AuthError } from "@/lib/auth";
import { enqueueRender, type StartRenderInput } from "@/lib/jobs";
import { InsufficientCreditsError } from "@/lib/credits";
import { checkRateLimit, retryAfterSeconds } from "@/lib/rate-limit";

export type StartRenderResult =
  | { ok: true; jobId: string }
  | {
      ok: false;
      error: string;
      code?: "NO_CREDITS" | "UNAUTHORIZED" | "RATE_LIMITED";
    };

// Enqueues are cheap but each reserves a credit and a worker slot. Cap the
// burst rate per user so a runaway client (or a compromised session) can't
// spray the queue faster than a human ever would.
const RENDER_BURST = { limit: 12, windowMs: 60 * 1000 };

const schema = z.object({
  name: z.string().trim().min(1, "Give your ad a name.").max(100),
  brand: z.string().trim().min(1, "Enter your brand name.").max(100),
  product: z
    .string()
    .trim()
    .min(1, "Describe your product.")
    .max(600),
  audience: z.string().trim().max(240).optional(),
  tone: z.enum(["energetic", "calm", "authoritative", "friendly"]),
  avatarId: z.string().min(1).optional(),
  durationSec: z.number().int().min(10).max(60),
  script: z.string().trim().max(2400).optional(),
});

export async function startRenderAction(
  input: StartRenderInput,
): Promise<StartRenderResult> {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof AuthError)
      return { ok: false, error: "Please sign in to generate.", code: "UNAUTHORIZED" };
    throw err;
  }

  const burst = checkRateLimit(`render:user:${user.id}`, RENDER_BURST);
  if (!burst.ok) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      error: `You're generating very fast. Try again in ${retryAfterSeconds(burst)}s.`,
    };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const job = await enqueueRender(
      user.id,
      user.subscription?.plan ?? "free",
      parsed.data,
    );
    revalidatePath("/dashboard/library");
    revalidatePath("/dashboard");
    return { ok: true, jobId: job.id };
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return {
        ok: false,
        code: "NO_CREDITS",
        error: "You're out of render credits. Upgrade your plan to keep creating.",
      };
    }
    return { ok: false, error: "Could not start the render. Please try again." };
  }
}
