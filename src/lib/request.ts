import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort client IP for rate-limiting keys. Reads the standard proxy
 * headers set by Vercel/Nginx/Cloudflare. Never throws; returns "unknown" when
 * no header is present (e.g. direct local requests) so callers always get a
 * usable bucket key.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    // May be a comma-separated chain "client, proxy1, proxy2" — take the first.
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? "unknown";
}
