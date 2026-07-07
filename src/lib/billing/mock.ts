import { env } from "@/lib/env";
import type { PlanId } from "@/lib/plans";
import type { BillingProvider, CheckoutResult, PortalResult } from "./index";
import { activatePlan } from "./grant";

/**
 * Local, keyless billing. "Checkout" fulfills the upgrade immediately and grants
 * the plan's monthly credits, then bounces back to the billing page. Lets you
 * demo the entire paywall + credit economy before wiring Stripe.
 */
export class MockBillingProvider implements BillingProvider {
  readonly name = "mock";

  async createCheckout(userId: string, planId: PlanId): Promise<CheckoutResult> {
    await activatePlan(userId, planId, { grantCreditsNow: true });
    return {
      url: `${env.APP_URL}/dashboard/billing?upgraded=${planId}`,
      mock: true,
    };
  }

  async createPortal(): Promise<PortalResult> {
    return { url: `${env.APP_URL}/dashboard/billing?portal=mock` };
  }
}
