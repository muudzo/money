/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
