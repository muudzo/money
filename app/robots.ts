import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.APP_URL.replace(/\/$/, "");
  return {
    rules: [
      // The app shell and APIs are private; marketing pages are the product's face.
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
