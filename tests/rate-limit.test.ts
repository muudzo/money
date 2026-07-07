import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  resetRateLimit,
  retryAfterSeconds,
} from "../src/lib/rate-limit";

describe("rate limiter", () => {
  beforeEach(() => resetRateLimit());

  it("allows hits up to the limit, then blocks", () => {
    const opts = { limit: 3, windowMs: 60_000 };
    expect(checkRateLimit("ip:a", opts).ok).toBe(true); // 1
    expect(checkRateLimit("ip:a", opts).ok).toBe(true); // 2
    const third = checkRateLimit("ip:a", opts);
    expect(third.ok).toBe(true); // 3 — the last allowed hit
    expect(third.remaining).toBe(0);
    expect(checkRateLimit("ip:a", opts).ok).toBe(false); // 4 — over budget
  });

  it("keeps separate budgets per key", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    expect(checkRateLimit("ip:a", opts).ok).toBe(true);
    expect(checkRateLimit("ip:a", opts).ok).toBe(false);
    // A different key is unaffected.
    expect(checkRateLimit("ip:b", opts).ok).toBe(true);
  });

  it("resets after the window elapses", () => {
    const opts = { limit: 1, windowMs: 20 };
    expect(checkRateLimit("ip:c", opts).ok).toBe(true);
    expect(checkRateLimit("ip:c", opts).ok).toBe(false);
    // Wait out the window.
    const until = Date.now() + 30;
    while (Date.now() < until) {
      /* busy-wait a few ms so the fixed window rolls over deterministically */
    }
    expect(checkRateLimit("ip:c", opts).ok).toBe(true);
  });

  it("reports retry-after in whole seconds", () => {
    const result = checkRateLimit("ip:d", { limit: 1, windowMs: 5_000 });
    expect(retryAfterSeconds(result)).toBeGreaterThan(0);
    expect(retryAfterSeconds(result)).toBeLessThanOrEqual(5);
  });

  it("resetRateLimit(key) clears only that key", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    checkRateLimit("ip:e", opts);
    checkRateLimit("ip:f", opts);
    resetRateLimit("ip:e");
    expect(checkRateLimit("ip:e", opts).ok).toBe(true); // cleared
    expect(checkRateLimit("ip:f", opts).ok).toBe(false); // still counted
  });
});
