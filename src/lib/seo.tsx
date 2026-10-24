import { APP_NAME, SITE_URL } from "@/lib/constants";

/**
 * Structured-data helpers shared by the public, indexable pages.
 *
 * One place for the things every schema block repeats — the publisher node and
 * the breadcrumb shape — so a page cannot drift into naming the organisation
 * differently from its neighbours, which is how an entity graph fragments.
 */

/**
 * Inlined on every page rather than referenced by "@id": the full Organization
 * node lives in the homepage's JSON-LD, and a dangling cross-page reference is
 * a parse risk for scrapers that read one page alone.
 */
export const PUBLISHER = {
  "@type": "Organization",
  name: APP_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
} as const;

/** Absolute URL for a site path ("/road-signs" → "https://…/road-signs"). */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** BreadcrumbList from Home down to the current page, in order. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** ItemList of internal pages — hubs use it to declare what they index. */
export function itemListSchema(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/**
 * One JSON-LD script per schema object.
 *
 * `<` is escaped because the payload is interpolated into a script element:
 * content containing "</script>" would otherwise close it early. Everything
 * serialised today is first-party copy, but the question bank reaches this
 * through the public question pages and is far too large to eyeball.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
