import { describe, it, expect } from "vitest";
import {
  PLANS,
  PLAN_ORDER,
  getPlan,
  isPaidPlan,
  CREDITS_PER_RENDER,
} from "../src/lib/plans";

describe("plans", () => {
  it("orders exactly the four known tiers", () => {
    expect(PLAN_ORDER).toEqual(["free", "starter", "growth", "scale"]);
    for (const id of PLAN_ORDER) {
      expect(PLANS[id]).toBeDefined();
      expect(PLANS[id].id).toBe(id);
    }
  });

  it("marks exactly one plan as the highlighted recommendation", () => {
    const highlighted = PLAN_ORDER.filter((id) => PLANS[id].highlight);
    expect(highlighted).toEqual(["growth"]);
  });

  it("prices increase monotonically across tiers", () => {
    const prices = PLAN_ORDER.map((id) => PLANS[id].priceMonthly);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });

  it("grants more monthly credits on higher paid tiers", () => {
    expect(PLANS.growth.monthlyCredits).toBeGreaterThan(
      PLANS.starter.monthlyCredits,
    );
    expect(PLANS.scale.monthlyCredits).toBeGreaterThan(
      PLANS.growth.monthlyCredits,
    );
  });

  it("keeps a watermark only on the free tier", () => {
    expect(PLANS.free.watermark).toBe(true);
    expect(PLANS.starter.watermark).toBe(false);
    expect(PLANS.growth.watermark).toBe(false);
    expect(PLANS.scale.watermark).toBe(false);
  });

  it("falls back to the free plan for unknown ids", () => {
    expect(getPlan("nonsense").id).toBe("free");
    expect(getPlan(null).id).toBe("free");
    expect(getPlan(undefined).id).toBe("free");
  });

  it("classifies paid vs free plans", () => {
    expect(isPaidPlan("free")).toBe(false);
    expect(isPaidPlan("growth")).toBe(true);
    expect(CREDITS_PER_RENDER).toBeGreaterThan(0);
  });
});
