/**
 * Plans, pricing, and credit economics — the single source of truth shared by
 * the pricing page, billing, and the credit ledger. Edit numbers here only.
 */

export type PlanId = "free" | "starter" | "growth" | "scale";

export type BillingInterval = "month" | "year";

export const CREDITS_PER_RENDER = 1;
export const SIGNUP_BONUS_CREDITS = 3;
/** Annual plans bill 10× the monthly rate — i.e. two months free. */
export const ANNUAL_MONTHS_BILLED = 10;

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD/month
  priceYearly: number; // USD/year (10× monthly ⇒ 2 months free)
  monthlyCredits: number; // renders granted each billing period
  maxResolution: "720p" | "1080p";
  watermark: boolean;
  seats: number;
  priority: boolean;
  /** Max renders a user on this plan may have in-flight (queued+rendering) at
   * once. Protects the shared worker from being monopolized by one account. */
  maxConcurrentRenders: number;
  highlight: boolean;
  tagline: string;
  features: string[];
  /** Which env var holds this plan's monthly Stripe price id (undefined for free). */
  stripePriceEnv?:
    | "STRIPE_PRICE_STARTER"
    | "STRIPE_PRICE_GROWTH"
    | "STRIPE_PRICE_SCALE";
  /** Which env var holds this plan's annual Stripe price id. */
  stripePriceEnvYearly?:
    | "STRIPE_PRICE_STARTER_YEARLY"
    | "STRIPE_PRICE_GROWTH_YEARLY"
    | "STRIPE_PRICE_SCALE_YEARLY";
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    monthlyCredits: 0,
    maxResolution: "720p",
    watermark: true,
    seats: 1,
    priority: false,
    maxConcurrentRenders: 1,
    highlight: false,
    tagline: "Kick the tires. 3 render credits on signup.",
    features: [
      "3 render credits (one-time)",
      "720p vertical export",
      "AdReel watermark",
      "Full generator wizard",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 39,
    priceYearly: 390,
    monthlyCredits: 30,
    maxResolution: "1080p",
    watermark: false,
    seats: 1,
    priority: false,
    maxConcurrentRenders: 2,
    highlight: false,
    tagline: "For solo founders shipping ads every week.",
    features: [
      "30 render credits / month",
      "1080p HD export",
      "No watermark",
      "Full avatar & voice library",
      "Script rewriting",
    ],
    stripePriceEnv: "STRIPE_PRICE_STARTER",
    stripePriceEnvYearly: "STRIPE_PRICE_STARTER_YEARLY",
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 99,
    priceYearly: 990,
    monthlyCredits: 120,
    maxResolution: "1080p",
    watermark: false,
    seats: 3,
    priority: false,
    maxConcurrentRenders: 3,
    highlight: true,
    tagline: "For brands running always-on creative testing.",
    features: [
      "120 render credits / month",
      "1080p HD export",
      "No watermark",
      "3 team seats",
      "Brand kits & saved presets",
      "Priority render queue",
    ],
    stripePriceEnv: "STRIPE_PRICE_GROWTH",
    stripePriceEnvYearly: "STRIPE_PRICE_GROWTH_YEARLY",
  },
  scale: {
    id: "scale",
    name: "Scale",
    priceMonthly: 299,
    priceYearly: 2990,
    monthlyCredits: 1000,
    maxResolution: "1080p",
    watermark: false,
    seats: 10,
    priority: true,
    maxConcurrentRenders: 5,
    highlight: false,
    tagline: "For agencies producing at volume.",
    features: [
      "1,000 render credits / month",
      "1080p HD export",
      "No watermark",
      "10 team seats",
      "Top-priority queue",
      "Bulk generation",
      "API access (coming soon)",
    ],
    stripePriceEnv: "STRIPE_PRICE_SCALE",
    stripePriceEnvYearly: "STRIPE_PRICE_SCALE_YEARLY",
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "growth", "scale"];

export function getPlan(id: string | null | undefined): Plan {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return PLANS.free;
}

export function isPaidPlan(id: string | null | undefined): boolean {
  return getPlan(id).priceMonthly > 0;
}

/** Price for a plan at the chosen billing interval. */
export function priceForInterval(plan: Plan, interval: BillingInterval): number {
  return interval === "year" ? plan.priceYearly : plan.priceMonthly;
}

/** Effective monthly price when paying annually (used for "$X/mo billed yearly"). */
export function effectiveMonthly(plan: Plan): number {
  return Math.round((plan.priceYearly / 12) * 100) / 100;
}

/** Dollars saved per year by choosing annual over monthly. */
export function annualSavings(plan: Plan): number {
  return plan.priceMonthly * 12 - plan.priceYearly;
}
