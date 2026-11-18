import type { RoadSign, SignCategory } from "@/types";
import { SIGN_PAGES } from "./sign-pages";

/**
 * The public road-sign pages: one per family, every sign on it in full.
 *
 * These replace the 151 single-sign pages at /road-signs/<sign>. Each of those
 * was one meaning inside about 200 words shared with all the others, and
 * AdSense rejected the site as "low-value content" twice while they were up
 * (2026-11-01 and 2026-11-17). Google's advice for near-duplicate pages is to
 * expand or consolidate them, so the signs now sit together, grouped the way
 * the manual groups them, and each old URL redirects to its sign's anchor here
 * (see sign-redirects.json and next.config.mjs).
 *
 * The information signs and plates are too few for a page of their own (eight
 * of them), so they are a section of the /road-signs hub instead:
 * INFORMATION_GROUP below.
 *
 * Every sentence of copy here restates a fact already recorded in
 * docs/content/facts/signs.md; the section "Category page copy (November
 * 2026)" there maps each one to its source.
 */

export type SignSection = {
  /** The catalogue's subcategory, exactly as signs.catalog.json spells it. */
  subcategory: string;
  heading: string;
  intro: string;
};

export type SignGroup = {
  category: SignCategory;
  /** Lower-case plural, for running text: "regulatory signs". */
  noun: string;
  intro: string[];
  sections: SignSection[];
  /** Pairs learners confuse, from the fact file's confusion list. */
  mixUps: { pair: string; detail: string }[];
};

export type SignCategoryPage = SignGroup & {
  slug: "regulatory-signs" | "warning-signs" | "road-markings";
  /** Card and breadcrumb label. */
  label: string;
  h1: string;
  title: string;
  /** Meta description, without the sign count the page adds. */
  summary: string;
};

export const SIGN_CATEGORY_PAGES: SignCategoryPage[] = [
  {
    slug: "regulatory-signs",
    category: "regulatory",
    label: "Regulatory signs",
    noun: "regulatory signs",
    h1: "Regulatory road signs and what they mean",
    title: "South African regulatory road signs: what each K53 sign means",
    summary:
      "Every K53 regulatory sign from the official manual, with what it orders you to do: control, command, prohibition, reservation and de-restriction signs, and the robots.",
    intro: [
      "Regulatory signs are orders, not advice. A red ring prohibits, a blue circle commands, and both are compulsory: ignoring one is an offence, and on the driving test failing to obey a road sign ends the test immediately.",
      "A plate fitted below the main sign can qualify it with times, a distance or a class of vehicle. A sign with a yellow background is the temporary version, used at roadworks and incidents, and it carries the same legal force as the permanent one.",
    ],
    sections: [
      {
        subcategory: "Control Signs",
        heading: "Control signs: stop, yield and who goes first",
        intro:
          "Control signs decide priority. A stop sign means a complete stop behind the line every time, then go only when it is safe. A yield sign means give way, and stop only if you have to. At a three-way or four-way stop, the first vehicle to stop is the first to go.",
      },
      {
        subcategory: "Command Signs",
        heading: "Command signs: the blue circles",
        intro:
          "A blue circle tells you what you must do: keep to the side shown, go in the direction of the arrow, switch your headlights on. Some name a class of road user, such as taxis, buses or cyclists, who must use a road or lane that others may not.",
      },
      {
        subcategory: "Prohibition Signs",
        heading: "Prohibition signs: the red rings",
        intro:
          "A red ring bans whatever it shows: a turn, overtaking, stopping, parking, or a class of road user. Read the plate below it too: it can limit the ban to certain hours, a distance or a class of vehicle.",
      },
      {
        subcategory: "Reservation Signs",
        heading: "Reservation signs: the R",
        intro:
          "A large R beside a vehicle symbol sets a road, lane or parking area aside for that class of vehicle. It does not ban that class; it keeps everyone else out. A parking reservation may carry a time limit on its plate.",
      },
      {
        subcategory: "Comprehensive Signs",
        heading: "Comprehensive signs: a set of rules at once",
        intro:
          "A comprehensive sign brings a whole set of rules into force, and they apply until the matching end sign. In a residential area that means 30 km/h, pedestrians have right of way, and no driving through without stopping to break the journey. Where a freeway begins, so do its rules, including the road users who may not use it.",
      },
      {
        subcategory: "De-Restriction Signs",
        heading: "De-restriction signs: where a rule ends",
        intro:
          "The same sign with a red cross or a diagonal band through it means the restriction, command or set of rules no longer applies from that point on.",
      },
      {
        subcategory: "Traffic Signals",
        heading: "Traffic signals (robots)",
        intro:
          "A steady red means stop behind the line. A steady amber means stop, unless you are already too close to stop safely. Green means go, but only if the intersection is clear.",
      },
    ],
    mixUps: [
      {
        pair: "Stop or yield",
        detail:
          "A stop sign needs a full stop every time, even when the road is empty. A yield sign needs you to give way, and to stop only if you must.",
      },
      {
        pair: "No parking or no stopping",
        detail:
          "Under a no-parking sign you may still stop briefly, for example to load or to let a passenger off. No stopping bans even a brief halt.",
      },
      {
        pair: "Reserved or prohibited",
        detail:
          "An R sign sets a lane or bay aside for the vehicle shown. A red ring around the same symbol bans it.",
      },
      {
        pair: "Speed limit or recommended speed",
        detail:
          "A speed limit is the legal maximum for ideal conditions, never a target. A recommended-speed plate is advice for the hazard ahead, set by road engineers.",
      },
    ],
  },
  {
    slug: "warning-signs",
    category: "warning",
    label: "Warning signs",
    noun: "warning signs",
    h1: "Warning road signs and what they mean",
    title: "South African warning road signs: what each K53 sign means",
    summary:
      "Every K53 warning sign from the official manual, with what it warns you of and what to do: road situations, junctions, moving hazards and hazard markers.",
    intro: [
      "Warning signs are red-bordered triangles. They tell you about a hazard or a change in the road ahead, and they do not order you to do anything specific: you are expected to slow down, look for the hazard and be ready to stop. They stand some way back from the hazard on purpose, to give you time.",
      "A warning triangle with a yellow background is the temporary version, used at roadworks and incidents. It has the same force as the white one; the yellow says that conditions have changed from normal.",
    ],
    sections: [
      {
        subcategory: "Road Situations Ahead",
        heading: "The road ahead",
        intro:
          "Most of these describe the road itself: gradients, surface changes, narrow sections, gates, drifts and tunnels. A triangle carrying a height, width or length figure warns that a restriction is coming. The red ring further on is the restriction itself, and passing it is the offence.",
      },
      {
        subcategory: "Road Layout Changes Ahead",
        heading: "Junctions ahead",
        intro:
          "On a junction warning, the thicker limb is the priority road. Thick through your road means you have priority over a lesser road crossing it; thick across your road means the crossing road has priority, and you must be ready to give way. Staggered junctions, two side roads close together rather than opposite each other, are a poor place to overtake.",
      },
      {
        subcategory: "Moving Hazards Ahead",
        heading: "People, animals and vehicles",
        intro:
          "These warn of people, animals or slow vehicles that may be on the road or crossing it. With animals, expect more than one, and brake rather than swerve. At road works, slow down early and expect workers you cannot see yet.",
      },
      {
        subcategory: "Hazard Marker Plates",
        heading: "Hazard markers",
        intro:
          "Hazard markers stand at the hazard itself rather than before it. Black-and-yellow markers show which side of an obstruction to pass, and the X-shaped cross marks the railway crossing itself.",
      },
    ],
    mixUps: [
      {
        pair: "A restriction warning or the restriction",
        detail:
          "A red triangle with a height, width or length figure warns that a limit is coming. The red ring with the same figure is the limit, and passing it is the offence.",
      },
      {
        pair: "White or yellow",
        detail:
          "The yellow version of a sign is temporary, not weaker. It carries the same legal force as the permanent white one.",
      },
      {
        pair: "Which road has priority",
        detail:
          "On a junction triangle, the thick limb is the priority road. Check whether it runs through your road or across it.",
      },
    ],
  },
  {
    slug: "road-markings",
    category: "marking",
    label: "Road markings",
    noun: "road markings",
    h1: "Road markings and what they mean",
    title: "South African road markings: what each K53 marking means",
    summary:
      "Every K53 road marking from the official manual, with what it means: stop and yield lines, no-overtaking lines, kerb lines, lane arrows and warning markings.",
    intro: [
      "Road markings are examined in the same section of the learner's test as road signs, and a regulatory marking is as binding as a regulatory sign. Crossing a solid barrier line is an offence, not just poor driving.",
      "Colour carries meaning. A red line along the edge of the road means no stopping, and a yellow line beside the kerb means no parking. A solid line applies at all times; a broken one applies during the hours on the sign that goes with it.",
    ],
    sections: [
      {
        subcategory: "Regulatory Markings",
        heading: "Regulatory markings",
        intro:
          "A solid line across your lane is a stop line, and a broken one is a yield line. On a no-overtaking line, no part of your vehicle may cross, except to reach a property or to pass a stationary obstruction. Where a solid and a broken line run side by side, obey the one nearest you. Lane arrows are compulsory.",
      },
      {
        subcategory: "Warning And Guidance Markings",
        heading: "Warning and guidance markings",
        intro:
          "These warn of what is coming rather than order you: a railway crossing, a yield line or a no-overtaking line ahead. Arrows show where lanes divide or end, so choose your lane in good time.",
      },
    ],
    mixUps: [
      {
        pair: "Stop line or yield line",
        detail:
          "A solid line across the lane means stop. A broken line across the lane means give way, and stop only if you must.",
      },
      {
        pair: "Red or yellow",
        detail:
          "A red line means no stopping, not even briefly. A yellow line beside the kerb means no parking.",
      },
      {
        pair: "Broken or solid centre line",
        detail:
          "You may cross a broken centre line to overtake when it is safe. You may not cross a solid line on your side.",
      },
    ],
  },
];

/** The /road-signs hub's own section: information signs and plates. */
export const INFORMATION_GROUP: SignGroup = {
  category: "information",
  noun: "information signs and plates",
  intro: [
    "Information signs help you read the road ahead and plan your lane use. They carry no penalty by themselves, but the test still expects you to know what they are telling you.",
  ],
  sections: [
    {
      subcategory: "",
      heading: "Information signs",
      intro:
        "A red bar across the top of a sign means the road ahead is a dead end. On a freeway, the countdown markers before an exit count off the last 300 m, and you should be in the left-hand lane by the time you reach them.",
    },
    {
      subcategory: "Supplementary Information Plates",
      heading: "Supplementary plates",
      intro:
        "A plate fitted below another sign qualifies it, with times, a distance, a class of vehicle or a particular hazard. A recommended-speed plate is advice for the hazard rather than a limit, though driving faster than it can still lead to prosecution after a crash.",
    },
  ],
  mixUps: [],
};

const BY_SLUG = new Map(SIGN_CATEGORY_PAGES.map((p) => [p.slug, p]));

export function signCategoryPageBySlug(slug: string): SignCategoryPage | undefined {
  return BY_SLUG.get(slug as SignCategoryPage["slug"]);
}

export function signCategoryPageFor(
  sign: Pick<RoadSign, "category">,
): SignCategoryPage | undefined {
  return SIGN_CATEGORY_PAGES.find((p) => p.category === sign.category);
}

export type SignEntryData = (typeof SIGN_PAGES)[number];

/**
 * A group's signs, section by section, in catalogue (manual) order.
 *
 * A sign whose subcategory no section names is not shown anywhere, so
 * tests/seo.test.ts checks that every verified sign lands in exactly one
 * section.
 */
export function signsInGroup(group: SignGroup): { section: SignSection; signs: SignEntryData[] }[] {
  const ofCategory = SIGN_PAGES.filter((p) => p.sign.category === group.category);
  return group.sections.map((section) => ({
    section,
    signs: ofCategory.filter((p) => p.sign.subcategory === section.subcategory),
  }));
}

/** How many signs a group shows. */
export function signCount(group: SignGroup): number {
  return signsInGroup(group).reduce((n, s) => n + s.signs.length, 0);
}

/** Where a sign is shown now: its anchor on its family's page, or on the hub. */
export function signHref(sign: Pick<RoadSign, "category">, slug: string): string {
  const page = signCategoryPageFor(sign);
  return page ? `/road-signs/${page.slug}#${slug}` : `/road-signs#${slug}`;
}

/**
 * Old single-sign URL slug → where that sign is shown now.
 *
 * next.config.mjs cannot import TypeScript, so this is written out to
 * sign-redirects.json by `node scripts/sign-redirects.mjs`, and
 * tests/sign-redirects.test.ts fails when the two drift apart.
 */
export function signRedirects(): Record<string, string> {
  return Object.fromEntries(SIGN_PAGES.map((p) => [p.slug, signHref(p.sign, p.slug)]));
}

/** An in-page anchor for a section heading. Prefixed so it can't collide with a sign slug. */
export function sectionAnchor(section: SignSection): string {
  const base = section.heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `group-${base}`;
}
