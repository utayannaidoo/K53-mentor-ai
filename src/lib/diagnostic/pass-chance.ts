import type { CategoryId } from "@/types";
import { SECTION_LABEL, SECTION_OF, type ExamSection } from "@/lib/constants";
import {
  blockingSection,
  formatPassProbability,
  passProbabilityFromSections,
} from "@/lib/diagnostic/scoring";

/**
 * Pass chance, told so it motivates instead of deflating.
 *
 * The number is the same honest model it always was (three section binomials
 * multiplied — see `passProbabilityFromSections`). What changed is everything
 * around it. A bare "<1%" beside a learner's first real readiness score read as
 * "you are hopeless" and was removed outright; this puts it back with:
 *
 *  - a stage that says where they are on the curve, not how far from done;
 *  - the one section that moves the number most, and by how much — so a low
 *    figure always arrives with the next step attached;
 *  - no warning or danger colour. Low is primary, high is success.
 *
 * The copy may be warm; it may not be false. Every claim here follows from the
 * model: the product of three section probabilities really does start near
 * zero and rise steeply once each section nears its mark.
 */

export type PassChanceStage = "early" | "climbing" | "on_track" | "ready";

export interface PassChanceStory {
  pct: number;
  display: string;
  stage: PassChanceStage;
  headline: string;
  detail: string;
  /** Pass chance if the blocking section gained LIFT_POINTS, when one exists. */
  lift: { section: ExamSection; to: number } | null;
  /** One sentence naming the lift, or null when every section already clears. */
  liftLine: string | null;
  tone: "text-primary" | "text-success";
}

/** Competence points the "what moves this" sentence adds to the blocking section. */
export const LIFT_POINTS = 10;
/** Below this gain the lift is not worth quoting as a number. */
const MIN_GAIN_TO_QUOTE = 3;

export function passChanceLift(
  perCategory: Record<CategoryId, number>,
): { section: ExamSection; to: number } | null {
  const section = blockingSection(perCategory);
  if (!section) return null;
  const lifted = { ...perCategory };
  for (const id of Object.keys(lifted) as CategoryId[]) {
    if (SECTION_OF[id] === section) lifted[id] = Math.min(100, lifted[id] + LIFT_POINTS);
  }
  return { section, to: passProbabilityFromSections(lifted) };
}

export function passChanceStage(pct: number): PassChanceStage {
  if (pct >= 80) return "ready";
  if (pct >= 50) return "on_track";
  if (pct >= 10) return "climbing";
  return "early";
}

const COPY: Record<PassChanceStage, { headline: string; detail: string }> = {
  early: {
    headline: "Early days — this climbs fast.",
    detail:
      "The test needs a pass in all three sections, so this starts low and rises quickly as each one reaches its mark.",
  },
  climbing: {
    headline: "Climbing.",
    detail: "You're building real ground. Keep going where it counts most.",
  },
  on_track: {
    headline: "On track.",
    detail:
      "You'd more likely pass than not if you sat it today. A full mock will show whether it holds under time pressure.",
  },
  ready: {
    headline: "Test-ready territory.",
    detail: "Keep it here — a mock every few days keeps the edge until test day.",
  },
};

export function passChanceStory(
  pct: number,
  perCategory: Record<CategoryId, number>,
): PassChanceStory {
  const stage = passChanceStage(pct);
  const lift = passChanceLift(perCategory);
  const sectionName = lift ? SECTION_LABEL[lift.section].toLowerCase() : "";
  const liftLine = !lift
    ? null
    : lift.to - pct >= MIN_GAIN_TO_QUOTE
      ? `Add ${LIFT_POINTS} points to ${sectionName} and it rises to about ${formatPassProbability(lift.to)}.`
      : `${SECTION_LABEL[lift.section]} is the section to work on first — it moves this the most.`;
  return {
    pct,
    display: formatPassProbability(pct),
    stage,
    ...COPY[stage],
    lift,
    liftLine,
    tone: stage === "on_track" || stage === "ready" ? "text-success" : "text-primary",
  };
}
