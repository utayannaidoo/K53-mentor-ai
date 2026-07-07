import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { GUIDES } from "./guides/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  });

  return [
    page("/", 1),
    page("/pricing", 0.9),
    page("/guides", 0.8),
    ...GUIDES.map((g) => page(`/guides/${g.slug}`, 0.8)),
    page("/signup", 0.7),
    page("/login", 0.4),
    page("/sources", 0.4),
    page("/privacy", 0.2),
    page("/terms", 0.2),
  ];
}
