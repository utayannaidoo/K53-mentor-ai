import type { RoadSign } from "@/types";
import { VERIFIED_SIGNS } from "./signs";

/**
 * The public, indexable page for each hand-verified road sign.
 *
 * Built on VERIFIED_SIGNS for the reason given on that export: a derived name
 * is often an OCR fragment and a composite crop shows several signs under one
 * caption. Either would be the page's title here, so only verified signs get
 * a URL.
 *
 * Slugs come from the verified name, not the catalogue id — "no-entry" is what
 * someone types, "regulatory-008-01" is not. tests/seo.test.ts pins them
 * unique, because a collision would silently drop a sign from the site.
 */
export function signSlug(sign: Pick<RoadSign, "name">): string {
  return sign.name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SIGN_PAGES: { slug: string; sign: RoadSign }[] = VERIFIED_SIGNS.map((sign) => ({
  slug: signSlug(sign),
  sign,
}));

/**
 * Words a sign page must say about its own sign before it is submitted for
 * indexing: roughly as much as the copy every sign page shares (family rule,
 * category blurb, the test-section paragraph and the call to action, about 200
 * words). Below that, most of the page is the same as 150 others.
 */
export const MIN_OWN_WORDS = 150;

/**
 * Whether a sign's page says enough to deserve a place in the index.
 *
 * AdSense rejected the site as "low-value content" on 2026-11-01, when 152 sign
 * pages were 80% of the sitemap. Writing a real meaning for every sign (PR #128)
 * did not change the shape: a crawl on 2026-11-08 found a median of 36 words
 * unique to each page, inside about 200 words shared with all the others, and
 * the meaning is the only per-sign text a page has. So no sign page qualifies
 * today, and all of them are left out of the index until one says more.
 *
 * Thin pages stay up for visitors and keep their links; they are left out of
 * the sitemap and marked noindex. To re-admit one, give the sign more content
 * of its own (what it is confused with, the exam trap, where you meet it),
 * sourced like any other fact, and count it in `ownWords` below.
 */
export function isIndexableSign(sign: Pick<RoadSign, "name" | "meaning">): boolean {
  const meaning = sign.meaning.trim();
  // A whole sentence: starts on a capital and ends on a full stop, not a
  // lowercase tail of the previous caption or a cut-off clause.
  const whole = /^[A-Z0-9]/.test(meaning) && /[.!?)]$/.test(meaning);
  return whole && ownWords(sign) >= MIN_OWN_WORDS;
}

/** Words this sign's page says that no other sign page does, not counting its name. */
export function ownWords(sign: Pick<RoadSign, "name" | "meaning">): number {
  const words = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const name = new Set(words(sign.name));
  return words(sign.meaning).filter((w) => !name.has(w)).length;
}

/** The sign pages submitted in the sitemap and open to indexing. */
export const INDEXED_SIGN_PAGES = SIGN_PAGES.filter((p) => isIndexableSign(p.sign));

const BY_SLUG = new Map(SIGN_PAGES.map((p) => [p.slug, p.sign]));

export function signBySlug(slug: string): RoadSign | undefined {
  return BY_SLUG.get(slug);
}

export function signPath(sign: Pick<RoadSign, "name">): string {
  return `/road-signs/${signSlug(sign)}`;
}

/**
 * What the sign's family obliges a driver to do — the part of the answer that
 * is the same for every sign in the group, and the part learners skip.
 */
export const SIGN_FAMILY_COPY: Record<
  RoadSign["category"],
  { noun: string; rule: string }
> = {
  regulatory: {
    noun: "regulatory sign",
    rule: "Regulatory signs are orders, not advice. Ignoring one is an offence, and on the driving test failing to obey a road sign ends the test immediately.",
  },
  warning: {
    noun: "warning sign",
    rule: "Warning signs tell you about a hazard or a change in the road ahead. They do not order you to do anything specific — you are expected to slow down, look for the hazard and be ready to stop.",
  },
  information: {
    noun: "information sign",
    rule: "Information signs help you read the road ahead and plan your lane use. They carry no penalty by themselves, but the test still expects you to know what they are telling you.",
  },
  guidance: {
    noun: "guidance sign",
    rule: "Guidance signs point you to routes, destinations and services. They direct rather than command.",
  },
  marking: {
    noun: "road marking",
    rule: "Road markings are examined in the same section of the learner's test as road signs, and a regulatory marking is as binding as a regulatory sign.",
  },
};
