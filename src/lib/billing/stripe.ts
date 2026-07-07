import Stripe from "stripe";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { getPlan, type BillingInterval, type PlanId } from "@/lib/plans";
import type { BillingProvider, CheckoutResult, PortalResult } from "./index";

/** Lazily-constructed Stripe client (only used when BILLING_PROVIDER=stripe). */
export function stripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export class StripeBillingProvider implements BillingProvider {
  readonly name = "stripe";
  private stripe = stripeClient();

  async createCheckout(
    userId: string,
    planId: PlanId,
    interval: BillingInterval,
  ): Promise<CheckoutResult> {
    const plan = getPlan(planId);
    // Pick the price id for the requested interval, falling back to monthly if
    // an annual price hasn't been configured in Stripe yet.
    const priceEnv =
      interval === "year"
        ? (plan.stripePriceEnvYearly ?? plan.stripePriceEnv)
        : plan.stripePriceEnv;
    if (!priceEnv) {
      return { error: "That plan isn't purchasable." };
    }
    const priceId = env[priceEnv];
    if (!priceId) {
      return { error: "This plan isn't configured for checkout yet." };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) return { error: "Account not found." };

    let customerId = user.subscription?.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await db.subscription.upsert({
        where: { userId },
        update: { stripeCustomerId: customerId },
        create: { userId, stripeCustomerId: customerId },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      metadata: { userId, planId, interval },
      subscription_data: { metadata: { userId, planId, interval } },
      allow_promotion_codes: true,
      success_url: `${env.APP_URL}/dashboard/billing?success=1`,
      cancel_url: `${env.APP_URL}/pricing?canceled=1`,
    });

    return { url: session.url ?? undefined };
  }

  async createPortal(userId: string): Promise<PortalResult> {
    const sub = await db.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) {
      return { error: "No billing account yet — upgrade to a paid plan first." };
    }
    const portal = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${env.APP_URL}/dashboard/billing`,
    });
    return { url: portal.url };
  }
}
