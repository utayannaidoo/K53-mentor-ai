import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // App surfaces are behind auth/local state — nothing useful to index.
        disallow: ["/api/", "/dashboard", "/study", "/tutor", "/account", "/onboarding", "/diagnostic"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
