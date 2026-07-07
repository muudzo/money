import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { grantCredits } from "@/lib/credits";

interface ActivateOpts {
  stripeCustomerId?: string;
  stripeSubId?: string;
  currentPeriodEnd?: Date;
  /** When true, also grant the plan's monthly credit allotment. */
  grantCreditsNow?: boolean;
}

/**
 * Activate/upgrade a user's plan and (optionally) grant its monthly credits.
 * Shared by the mock provider (grants immediately) and the Stripe webhook
 * (grants on checkout completion and on each paid renewal invoice).
 */
export async function activatePlan(
  userId: string,
  planId: string,
  opts: ActivateOpts = {},
): Promise<void> {
  const plan = getPlan(planId);
  await db.subscription.upsert({
    where: { userId },
    update: {
      plan: plan.id,
      status: "active",
      stripeCustomerId: opts.stripeCustomerId,
      stripeSubId: opts.stripeSubId,
      currentPeriodEnd: opts.currentPeriodEnd,
    },
    create: {
      userId,
      plan: plan.id,
      status: "active",
      stripeCustomerId: opts.stripeCustomerId ?? null,
      stripeSubId: opts.stripeSubId ?? null,
      currentPeriodEnd: opts.currentPeriodEnd ?? null,
    },
  });

  if (opts.grantCreditsNow && plan.monthlyCredits > 0) {
    await grantCredits(userId, plan.monthlyCredits, "plan_grant");
  }
}

export async function markSubscriptionStatus(
  stripeCustomerId: string,
  status: "active" | "canceled" | "past_due",
  planId?: string,
): Promise<void> {
  const sub = await db.subscription.findFirst({ where: { stripeCustomerId } });
  if (!sub) return;
  await db.subscription.update({
    where: { userId: sub.userId },
    data: {
      status,
      plan: status === "canceled" ? "free" : (planId ?? sub.plan),
    },
  });
}
