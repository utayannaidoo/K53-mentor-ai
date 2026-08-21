import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { GUIDES } from "./guides/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  });

  // No `lastModified`: this function re-renders on every build, so stamping
  // `now` claimed every page had changed on every deploy — a fake date search
  // engines learn to ignore at best. Omitting it is the honest default; they
  // fall back to their own crawl signals.
  return [
    page("/", 1),
    page("/pricing", 0.9),
    page("/guides", 0.8),
    ...GUIDES.map((g) => page(`/guides/${g.slug}`, 0.8)),
    page("/signup", 0.7),
    page("/login", 0.4),
    page("/sources", 0.4),
    page("/contact", 0.3),
    page("/privacy", 0.2),
    page("/terms", 0.2),
    page("/refunds", 0.2),
  ];
}
