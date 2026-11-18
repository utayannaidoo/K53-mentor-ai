/**
 * When each public page last changed in substance, as ISO dates.
 *
 * The sitemap's lastmod reads this, and so does the "Last updated" line on the
 * info pages, so the two cannot disagree. Guides keep theirs in the guide
 * catalogue (src/app/guides/guides.ts) for the same reason.
 *
 * Change a date when you change what a page says: new or corrected content, or
 * a policy change. Not for restyling, a new ad slot or a refactor. A lastmod
 * that moves without the content is one search engines learn to ignore, and a
 * stale one is a page that looks unmaintained.
 *
 * Dates were set on 2026-11-08 from each page's last content commit on main.
 */
export const PAGE_UPDATED = {
  "/": "2026-11-18",
  "/pricing": "2026-10-24",
  "/free-quiz": "2026-11-12",
  // The hub shows the information signs in full and links the three family
  // pages; all four change with the signs' meanings.
  "/road-signs": "2026-11-18",
  "/road-signs/regulatory-signs": "2026-11-18",
  "/road-signs/warning-signs": "2026-11-18",
  "/road-signs/road-markings": "2026-11-18",
  // The index and each topic page are built from the starter question pack.
  "/k53-questions": "2026-11-07",
  "/guides": "2026-10-24",
  "/for-driving-schools": "2026-10-11",
  "/about": "2026-11-18",
  "/sources": "2026-11-18",
  "/contact": "2026-09-05",
  "/privacy": "2026-11-18",
  "/terms": "2026-08-08",
  "/refunds": "2026-08-08",
} as const satisfies Record<string, string>;

export type DatedPage = keyof typeof PAGE_UPDATED;
