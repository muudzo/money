/**
 * Plans, pricing, and credit economics — the single source of truth shared by
 * the pricing page, billing, and the credit ledger. Edit numbers here only.
 */

export type PlanId = "free" | "starter" | "growth" | "scale";

export const CREDITS_PER_RENDER = 1;
export const SIGNUP_BONUS_CREDITS = 3;

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD/month
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
  /** Which env var holds this plan's Stripe price id (undefined for free). */
  stripePriceEnv?:
    | "STRIPE_PRICE_STARTER"
    | "STRIPE_PRICE_GROWTH"
    | "STRIPE_PRICE_SCALE";
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
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
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 99,
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
  },
  scale: {
    id: "scale",
    name: "Scale",
    priceMonthly: 299,
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
