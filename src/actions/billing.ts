"use server";

import { requireUser, AuthError } from "@/lib/auth";
import { getBilling } from "@/lib/billing";
import { PLANS, type PlanId } from "@/lib/plans";

export interface BillingActionResult {
  url?: string;
  error?: string;
}

export async function checkoutAction(
  planId: PlanId,
): Promise<BillingActionResult> {
  if (!(planId in PLANS) || planId === "free") {
    return { error: "Choose a paid plan to upgrade." };
  }
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof AuthError) return { error: "Please sign in first." };
    throw err;
  }
  const billing = await getBilling();
  return billing.createCheckout(user.id, planId);
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
