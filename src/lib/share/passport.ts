import { CATEGORIES } from "@/lib/content/categories";
import { categoryMastery } from "@/lib/dashboard/mastery";
import { activeDaysFrom } from "@/lib/dashboard/day-strip";
import { studyCodeOf } from "@/lib/billing/plans";
import { licenceHeld } from "@/lib/licence/test-day";
import { RANKS, LICENCE_RANK_INDEX } from "@/lib/engagement";
import { SITE_DOMAIN } from "@/lib/constants";
import { clamp } from "@/lib/utils";
import type { ReadinessBreakdown } from "@/lib/diagnostic/scoring";
import type { CategoryId, UserState, VehicleCode } from "@/types";

/**
 * The Driving Passport — everything the share card says, derived once, in one
 * pure function so it can be tested without a canvas.
 *
 * The card this replaced printed three equal numbers (readiness, streak, CP)
 * and nothing else, which is why nobody sent it: a report of three figures with
 * no claim attached is not a thing anyone posts, and the first of those figures
 * is a *low* percentage for most of a learner's life. What people share is a
 * credential — a verdict, the receipts that back it, and a shape that is
 * theirs. So this module answers three questions in order:
 *
 * 1. **What is the strongest true thing about this learner right now?**
 *    `pickHero` walks a ladder — licence, predicted pass, readiness, streak —
 *    and stops at the first rung that clears its bar, so the card never leads
 *    with 19% when a 9-day streak is the real story. Nothing is invented: every
 *    rung is a number the app already computes and shows elsewhere.
 * 2. **What proves it?** `work` is the receipts strip: cards, questions, mocks,
 *    study days. Volume, which a screenshot can't fake and a friend can read.
 * 3. **What makes this card mine and not yours?** The seven-category skyline.
 *    It is this product's route map: same axes for everyone, a different shape
 *    for every learner, legible as a silhouette at thumbnail size.
 *
 * Confidence Points are deliberately absent. CP means something to the learner
 * and nothing at all to the person in the group chat receiving the card, and
 * every line here has to earn its place with the *receiver*.
 */

/** Three-letter codes for the skyline. Long enough to identify, short enough to fit under an 86px bar. */
const CATEGORY_CODE: Record<CategoryId, string> = {
  signs: "SGN",
  rules: "RUL",
  controls: "CTL",
  intersections: "JCT",
  parking: "PRK",
  following_distance: "FOL",
  hazard_awareness: "HAZ",
};

/** Predicted pass is a product of three binomials, so it clears this bar only when it's genuinely a flex. */
const PASS_HERO_AT = 60;
/** Below this, readiness is not the best thing that is true — try the streak instead. */
const READINESS_HERO_AT = 40;
const STREAK_HERO_AT = 3;
/** The streak ring fills against a fortnight; two weeks is a real habit, not an unreachable bar. */
const STREAK_RING_TARGET = 14;

export type PassportTone = "success" | "warning" | "gold";

export interface PassportHero {
  /** Eyebrow under the ring, e.g. "PREDICTED PASS". */
  label: string;
  /** 0–100 ring sweep. */
  pct: number;
  /** What is printed inside the ring. */
  value: string;
  /** Rendered a step smaller, hard against the value ("%" or nothing). */
  unit: string;
  tone: PassportTone;
}

export interface PassportBar {
  id: CategoryId;
  code: string;
  name: string;
  /** 0–100 competence. */
  value: number;
  /** The mark this category's exam section actually has to clear. */
  required: number;
  clearing: boolean;
}

export interface PassportStamp {
  /** The word pressed across the stamp. */
  title: string;
  /** The qualifying line under it. */
  detail: string;
  tone: PassportTone;
}

export interface Passport {
  /** They hold the real licence — every forecast on the card is moot. */
  licensed: boolean;
  name: string;
  /** Licence code being studied for, e.g. "08". */
  code: string;
  rank: string;
  hero: PassportHero;
  /** The claim, in a sentence. */
  headline: string;
  /** The numbers that back the claim, already joined. */
  qualifier: string;
  stamp: PassportStamp | null;
  streak: number;
  work: { cards: number; questions: number; mocks: number; days: number };
  readiness: number;
  passProbability: number;
  bestMock: { score: number; total: number; passed: boolean } | null;
  /** Category order, not ranked — the skyline has to keep the same axes for everyone. */
  bars: PassportBar[];
  strongest: PassportBar | null;
  weakest: PassportBar | null;
  /** Right-hand footer line: the invite code where there is one, else the issue date. */
  issued: string;
  referralCode: string | null;
  /** Where the card sends whoever sees it. */
  link: string;
}

/** Licence codes as printed on the card — "8" is written "08" on the real thing. */
function codeLabel(code: VehicleCode): string {
  return code === "8" ? "08" : code;
}

/** "1 240" — SA thousands separator is a space, and a canvas can't do `tabular-nums`. */
export function formatCount(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * The strongest true claim, in order of how much a learner wants to post it.
 *
 * The ladder matters more than any single rung. A learner three days in has a
 * readiness in the twenties and a predicted pass near zero — both real, neither
 * worth sending — but a 4-day streak is a genuine thing to be pleased about.
 * Leading with whichever is strongest is what makes the card shareable on day 4
 * as well as on day 90, and it costs nothing in honesty: the numbers the hero
 * passed over are still printed in `qualifier` a few centimetres away.
 */
function pickHero(input: {
  licensed: boolean;
  readiness: number;
  passProbability: number;
  streak: number;
}): PassportHero {
  if (input.licensed) {
    return { label: "LICENCE ACHIEVED", pct: 100, value: "★", unit: "", tone: "gold" };
  }
  if (input.passProbability >= PASS_HERO_AT) {
    return {
      label: "PREDICTED PASS",
      pct: input.passProbability,
      value: String(input.passProbability),
      unit: "%",
      tone: "success",
    };
  }
  if (input.readiness >= READINESS_HERO_AT) {
    return {
      label: "TEST READINESS",
      pct: input.readiness,
      value: String(input.readiness),
      unit: "%",
      tone: input.readiness >= 70 ? "success" : "warning",
    };
  }
  if (input.streak >= STREAK_HERO_AT) {
    return {
      label: "DAY STREAK",
      pct: clamp(Math.round((input.streak / STREAK_RING_TARGET) * 100)),
      value: String(input.streak),
      unit: "",
      tone: "warning",
    };
  }
  return {
    label: "TEST READINESS",
    pct: input.readiness,
    value: String(input.readiness),
    unit: "%",
    tone: "warning",
  };
}

export function buildPassport(
  state: UserState,
  readiness: ReadinessBreakdown,
  options: { referralCode?: string | null; now?: Date } = {},
): Passport {
  const now = options.now ?? new Date();
  // Which licence, not just whether — a driver's licence is a bigger thing than
  // the learner's it was built on, and a card that cannot tell them apart makes
  // the larger one look like the smaller. `rankAchieved` is the fallback for a
  // pass granted before the record existed.
  const held = licenceHeld(state.licence);
  const licensed = held !== null || state.rankAchieved >= LICENCE_RANK_INDEX;

  // Blanks are excluded for the same reason the readiness model excludes them:
  // a mock that ran out of time writes a row per unanswered question, and
  // counting those as "questions answered" inflates the one number on the card
  // whose whole job is to be checkable.
  const answered = state.attempts.filter((a) => a.selectedIndex >= 0);
  const fullMocks = state.mockExams.filter((m) => !m.mini && !m.drill);
  const best = fullMocks.reduce<(typeof fullMocks)[number] | null>(
    (top, m) => (top === null || m.score / m.total > top.score / top.total ? m : top),
    null,
  );

  const ranked = categoryMastery(readiness.perCategory);
  const byId = new Map(ranked.map((r) => [r.id, r]));
  const bars: PassportBar[] = CATEGORIES.map((c) => {
    const row = byId.get(c.id)!;
    return {
      id: c.id,
      code: CATEGORY_CODE[c.id],
      name: c.name,
      value: row.value,
      required: row.required,
      clearing: row.clearing,
    };
  });
  const weakest = bars.length > 0 ? bars.reduce((a, b) => (b.value < a.value ? b : a)) : null;
  const strongest = bars.length > 0 ? bars.reduce((a, b) => (b.value > a.value ? b : a)) : null;

  const hero = pickHero({
    licensed,
    readiness: readiness.readiness,
    passProbability: readiness.passProbability,
    streak: state.streak.current,
  });

  let headline: string;
  if (held === "drivers") headline = "Driver's licence. See you on the road.";
  else if (licensed) headline = "Learner's licence in hand. On to the driving.";
  else if (best?.passed) headline = `Passed a full ${best.total}-question mock exam.`;
  else headline = RANKS[Math.min(state.rankAchieved, LICENCE_RANK_INDEX)].tagline;

  // Everything the hero didn't say, so no number the card is built on is hidden
  // behind the one it chose to lead with.
  //
  // Except once they are licensed, when predicted pass is dropped outright:
  // it forecasts an exam this learner has already sat and passed, and "LICENCE
  // ACHIEVED" printed above "Predicted pass 11%" reads as the card arguing with
  // itself. Readiness stays — it is a fair account of what they knew — but a
  // forecast about a settled matter is not a fact, it is a leftover.
  const qualifier = [
    hero.label !== "TEST READINESS" ? `Readiness ${readiness.readiness}%` : null,
    !licensed && hero.label !== "PREDICTED PASS"
      ? `Predicted pass ${readiness.passProbability}%`
      : null,
    best ? `Best mock ${best.score}/${best.total}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  let stamp: PassportStamp | null = null;
  if (licensed)
    stamp = {
      title: "LICENSED",
      detail: held === "drivers" ? "DRIVER'S LICENCE" : "LEARNER'S LICENCE",
      tone: "gold",
    };
  else if (best?.passed)
    stamp = { title: "PASSED", detail: `${best.score}/${best.total} MOCK`, tone: "success" };

  const cards = Object.values(state.cardStates).filter((c) => c.reps > 0 || c.lapses > 0).length;
  const referralCode = options.referralCode ?? null;

  return {
    licensed,
    name: (state.profile?.name?.trim().split(/\s+/)[0] || "Learner").toUpperCase(),
    code: codeLabel(studyCodeOf(state)),
    rank: RANKS[Math.min(state.rankAchieved, LICENCE_RANK_INDEX)].name.toUpperCase(),
    hero,
    headline,
    qualifier,
    stamp,
    streak: state.streak.current,
    work: {
      cards,
      questions: answered.length,
      // Every mock counts here, mini included — a 15-question mock is still a
      // mock the learner sat. Only the pass claim above insists on a full one.
      mocks: state.mockExams.length,
      days: activeDaysFrom([state.sessions, answered]).size,
    },
    readiness: readiness.readiness,
    passProbability: readiness.passProbability,
    bestMock: best ? { score: best.score, total: best.total, passed: best.passed } : null,
    bars,
    strongest,
    weakest,
    issued: new Intl.DateTimeFormat("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(now)
      .toUpperCase()
      .replace(/\./g, ""),
    referralCode,
    // Bare domain, no scheme: the card is read, and WhatsApp linkifies it in
    // the message either way.
    link: referralCode ? `${SITE_DOMAIN}/signup?ref=${referralCode}` : SITE_DOMAIN,
  };
}

/** Blocks for the copyable message — the colour carries the verdict, Wordle-style. */
function emojiBar(pct: number, tone: PassportTone): string {
  const filled = clamp(Math.round(pct / 10), 0, 10);
  const block = tone === "gold" ? "🟨" : tone === "success" ? "🟩" : "🟧";
  return block.repeat(filled) + "⬜".repeat(10 - filled);
}

/**
 * The card's other half: a message that survives being pasted.
 *
 * Wordle's grid is the proof that the *text* is the viral object — it needs no
 * download, no image permission and no tap to read, it renders identically in
 * every chat app, and the coloured squares make a score legible to someone
 * scrolling past. An image can be ignored in a thumbnail; six lines of text in
 * a WhatsApp group cannot. So both ship, and the button next to Share is Copy.
 */
export function passportMessage(p: Passport): string {
  const lines: string[] = [
    `🚗 My K53 Driving Passport`,
    ``,
    `${p.hero.label.charAt(0) + p.hero.label.slice(1).toLowerCase()}: ${p.hero.value}${p.hero.unit}`,
    emojiBar(p.hero.pct, p.hero.tone),
    ``,
  ];

  const facts = [
    `${formatCount(p.work.questions)} questions`,
    `${formatCount(p.work.cards)} flashcards`,
    `${formatCount(p.work.mocks)} mock${p.work.mocks === 1 ? "" : "s"}`,
  ];
  lines.push(facts.join(" · "));

  // Same omission rule the card's `qualifier` uses: the hero already said one
  // of these three, and repeating it two lines later reads as padding.
  const standing = [
    p.hero.label !== "TEST READINESS" ? `Readiness ${p.readiness}%` : null,
    !p.licensed && p.hero.label !== "PREDICTED PASS"
      ? `Predicted pass ${p.passProbability}%`
      : null,
    p.hero.label !== "DAY STREAK" && p.streak >= 2 ? `${p.streak}-day streak 🔥` : null,
  ].filter(Boolean);
  if (standing.length > 0) lines.push(standing.join(" · "));

  if (p.bestMock) {
    lines.push(`Best mock: ${p.bestMock.score}/${p.bestMock.total}${p.bestMock.passed ? " ✅" : ""}`);
  }

  lines.push(``, `Come pass with me 👉 ${p.link}`);
  return lines.join("\n");
}
