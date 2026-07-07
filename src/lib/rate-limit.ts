// In-memory fixed-window rate limiter. Pure and dependency-free so it can be
// unit-tested and imported by server actions without pulling in `server-only`.
//
// Scope: this guards a SINGLE app node (the launch topology). When you scale to
// multiple nodes, swap the `store` for a shared backend (Redis INCR + EXPIRE,
// or Upstash) behind the same `checkRateLimit` signature — no caller changes.

interface Window {
  count: number;
  /** Epoch ms at which this window resets and the counter starts over. */
  resetAt: number;
}

export interface RateLimitOptions {
  /** Max allowed hits within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Hits remaining in the current window (never negative). */
  remaining: number;
  /** Milliseconds until the window resets. */
  retryAfterMs: number;
}

const store = new Map<string, Window>();

// Opportunistic sweep so keys for idle clients don't accumulate forever. Runs
// at most once per SWEEP_INTERVAL_MS, piggy-backed on regular calls (no timer
// to leak in serverless/edge or to keep the process alive).
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, window] of store) {
    if (now > window.resetAt) store.delete(key);
  }
}

/**
 * Record one hit against `key` and report whether it is within budget.
 * Fixed-window semantics: the first hit starts a window of `windowMs`; the
 * counter resets when that window elapses.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = store.get(key);
  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterMs: windowMs };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    ok: existing.count <= limit,
    remaining,
    retryAfterMs: Math.max(0, existing.resetAt - now),
  };
}

/** Clear a key (or the whole store) — used by tests and after a successful
 * login to avoid penalizing a user who then legitimately retries. */
export function resetRateLimit(key?: string): void {
  if (key === undefined) store.clear();
  else store.delete(key);
}

/** Human-friendly seconds for user-facing "try again in N" messaging. */
export function retryAfterSeconds(result: RateLimitResult): number {
  return Math.ceil(result.retryAfterMs / 1000);
}
