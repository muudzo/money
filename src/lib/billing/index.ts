import { env } from "@/lib/env";
import type { PlanId } from "@/lib/plans";

export interface CheckoutResult {
  url?: string;
  error?: string;
  /** True when the mock provider fulfilled the upgrade locally (no Stripe). */
  mock?: boolean;
}

export interface PortalResult {
  url?: string;
  error?: string;
}

export interface BillingProvider {
  readonly name: string;
  createCheckout(userId: string, planId: PlanId): Promise<CheckoutResult>;
  createPortal(userId: string): Promise<PortalResult>;
}

/**
 * Returns the active billing provider. Defaults to the mock provider so the
 * full upgrade flow works locally with zero Stripe configuration; set
 * BILLING_PROVIDER=stripe (+ keys) to switch to real payments.
 */
export async function getBilling(): Promise<BillingProvider> {
  if (env.BILLING_PROVIDER === "stripe" && env.STRIPE_SECRET_KEY) {
    const { StripeBillingProvider } = await import("./stripe");
    return new StripeBillingProvider();
  }
  const { MockBillingProvider } = await import("./mock");
  return new MockBillingProvider();
}
