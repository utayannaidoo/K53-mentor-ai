import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { QUESTION_PAGES } from "@/lib/content/question-pages";
import { SIGN_PAGES } from "@/lib/content/sign-pages";
import { GUIDES } from "./guides/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  });

  // No `lastModified` on the static pages: this function re-renders on every
  // build, so stamping `now` claimed every page had changed on every deploy — a
  // fake date search engines learn to ignore at best. Guides are the exception
  // because they carry a real one: the catalogue's `updated` is the same date
  // the article displays, so the sitemap and the page cannot disagree.
  return [
    page("/", 1),
    page("/pricing", 0.9),
    // Ungated and evergreen: both are link-in-bio destinations for social, and
    // both answer searches ("free K53 test", "South African road signs") that
    // run all year, so they rank alongside pricing rather than below the guides.
    page("/free-quiz", 0.9),
    page("/road-signs", 0.9),
    page("/k53-questions", 0.9),
    ...QUESTION_PAGES.map((p) => page(`/k53-questions/${p.slug}`, 0.8)),
    page("/guides", 0.8),
    // The school product page: software for driving schools.
    page("/for-driving-schools", 0.7),
    ...GUIDES.map((g) => ({ ...page(`/guides/${g.slug}`, 0.8), lastModified: g.updated })),
    // One page per verified sign, each with its image so the sign can surface
    // in image search — where "what does this sign mean" is often asked.
    ...SIGN_PAGES.map(({ slug, sign }) => ({
      ...page(`/road-signs/${slug}`, 0.6),
      images: [`${SITE_URL}${sign.image}`],
    })),
    page("/signup", 0.7),
    page("/login", 0.4),
    page("/sources", 0.4),
    page("/contact", 0.3),
    page("/privacy", 0.2),
    page("/terms", 0.2),
    page("/refunds", 0.2),
  ];
}
