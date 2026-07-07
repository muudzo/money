"use server";

import { requireUser, AuthError } from "@/lib/auth";
import { getBilling } from "@/lib/billing";
import { PLANS, type BillingInterval, type PlanId } from "@/lib/plans";

export interface BillingActionResult {
  url?: string;
  error?: string;
}

export async function checkoutAction(
  planId: PlanId,
  interval: BillingInterval = "month",
): Promise<BillingActionResult> {
  if (!(planId in PLANS) || planId === "free") {
    return { error: "Choose a paid plan to upgrade." };
  }
  // Never trust the client-supplied interval — coerce to a known value.
  const safeInterval: BillingInterval = interval === "year" ? "year" : "month";
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof AuthError) return { error: "Please sign in first." };
    throw err;
  }
  const billing = await getBilling();
  return billing.createCheckout(user.id, planId, safeInterval);
}

export async function portalAction(): Promise<BillingActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof AuthError) return { error: "Please sign in first." };
    throw err;
  }
  const billing = await getBilling();
  return billing.createPortal(user.id);
}
