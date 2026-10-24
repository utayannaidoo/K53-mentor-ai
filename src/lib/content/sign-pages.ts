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
