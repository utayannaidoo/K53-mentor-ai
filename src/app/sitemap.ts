import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { PAGE_UPDATED, type DatedPage } from "@/lib/page-dates";
import { QUESTION_PAGES } from "@/lib/content/question-pages";
import { INDEXED_SIGN_PAGES } from "@/lib/content/sign-pages";
import { GUIDES } from "./guides/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number, lastModified: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  });
  const page = (path: DatedPage, priority: number) => entry(path, priority, PAGE_UPDATED[path]);

  // Every entry carries the date its content last changed, never the build
  // time: this function re-renders on every deploy, and stamping `now` claimed
  // every page had changed every time. Dates live in PAGE_UPDATED and the guide
  // catalogue, which the pages' own "Last updated" lines read too.
  return [
    page("/", 1),
    page("/pricing", 0.9),
    // Ungated and evergreen: both are link-in-bio destinations for social, and
    // both answer searches ("free K53 test", "South African road signs") that
    // run all year, so they rank alongside pricing rather than below the guides.
    page("/free-quiz", 0.9),
    page("/road-signs", 0.9),
    page("/k53-questions", 0.9),
    ...QUESTION_PAGES.map((p) =>
      entry(`/k53-questions/${p.slug}`, 0.8, PAGE_UPDATED["/k53-questions"]),
    ),
    page("/guides", 0.8),
    // The school product page: software for driving schools.
    page("/for-driving-schools", 0.7),
    ...GUIDES.map((g) => entry(`/guides/${g.slug}`, 0.8, g.updated)),
    // Only sign pages that say enough about their own sign, each with its image
    // for image search. None qualify today; the library above links them all.
    // See isIndexableSign.
    ...INDEXED_SIGN_PAGES.map(({ slug, sign }) => ({
      ...entry(`/road-signs/${slug}`, 0.6, PAGE_UPDATED["/road-signs"]),
      images: [`${SITE_URL}${sign.image}`],
    })),
    // No /login or /signup: a form is not content, and both are noindex.
    page("/about", 0.5),
    page("/sources", 0.4),
    page("/contact", 0.3),
    page("/privacy", 0.2),
    page("/terms", 0.2),
    page("/refunds", 0.2),
  ];
}
