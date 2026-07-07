import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request nonce-based Content-Security-Policy plus transport hardening.
 *
 * Why middleware: a strong `script-src` can't use `'unsafe-inline'`, but Next's
 * App Router injects inline bootstrap/streaming scripts. The supported fix is a
 * per-request nonce — Next reads it from the incoming request's CSP header and
 * stamps it onto its own scripts; we also read it in the root layout for our
 * pre-paint theme script. This forces dynamic rendering on nonce'd pages, which
 * we accept as the cost of a real CSP.
 */
export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const isDev = process.env.NODE_ENV !== "production";

  // React refresh / HMR needs eval in development only; production stays strict.
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    // Tailwind and next/font emit inline styles; documented CSS tradeoff.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `media-src 'self' blob:`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  // Pass the nonce and CSP forward on the request so Next can nonce its scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
  return response;
}

export const config = {
  // Run on everything except Next's own static assets and the favicon.
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
    },
  ],
};
