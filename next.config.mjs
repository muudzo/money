import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing root to this project. Without it, Next can infer the
  // wrong workspace root when an unrelated lockfile exists higher up the tree.
  outputFileTracingRoot: projectRoot,
  // Rendered videos/thumbnails are served from /storage via a route handler,
  // so we keep the build output lean and don't try to statically optimize them.
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  eslint: {
    // Lint is run explicitly via `npm run lint`; don't block production builds on it.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
