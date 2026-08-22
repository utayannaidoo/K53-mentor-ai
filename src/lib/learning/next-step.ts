import type { CategoryId } from "@/types";
import { categoryName } from "@/lib/content/categories";
import { SECTION_LABEL, type ExamSection } from "@/lib/constants";

/**
 * The one thing to do next, computed from what just happened.
 *
 * Every session end (practice, flashcards, mock results) used to offer the same
 * two buttons — "again" and "back" — regardless of what the session revealed.
 * The data to aim the learner somewhere useful was already on screen: which
 * categories they missed, which sections fell under their pass marks. These
 * rules turn that data into a single next action, using surfaces that already
 * exist (category practice, section drills, the mini mock). Nothing here
 * invents intelligence; a dominant miss count or a failed section is arithmetic.
 */

export interface NextStep {
  /** Short instruction, imperative. */
  title: string;
  /** One line of why, citing the session's own numbers. */
  body: string;
  href: string;
  cta: string;
}

/** Miss/failure counts per category for a single session. */
export type CategoryMisses = Partial<Record<CategoryId, number>>;

/** How many misses in one category before it counts as "the weak spot". */
const DOMINANT_MISS_MIN = 2;

/**
 * The category with the most misses this session, if one clearly dominated.
 * Dominance is strict: at least `min` misses AND strictly more than any other
 * category — with two categories tied there is no single weak spot to name,
 * and prescribing either would be noise dressed as insight.
 */
export function dominantCategory(
  misses: CategoryMisses,
  min = DOMINANT_MISS_MIN,
): CategoryId | null {
  let best: CategoryId | null = null;
  let bestCount = 0;
  let tied = false;
  for (const id of Object.keys(misses) as CategoryId[]) {
    const n = misses[id] ?? 0;
    if (n < min) continue;
    if (n > bestCount) {
      best = id;
      bestCount = n;
      tied = false;
    } else if (n === bestCount) {
      tied = true;
    }
  }
  return tied ? null : best;
}

/**
 * What to recommend after a practice session.
 *
 * 1. One category took most of the hits → drill exactly that category.
 * 2. Session was otherwise fine but the pass predictor is stale → re-test.
 * 3. Anything else → nothing; "practice more" and the dashboard remain right.
 */
export function nextStepAfterQuestions({
  wrongByCategory,
  mockRetestDue,
}: {
  wrongByCategory: CategoryMisses;
  /** Whether the predictor is due a recalibration (`mockRetestStatus().due`). */
  mockRetestDue: boolean;
}): NextStep | null {
  const totalWrong = Object.values(wrongByCategory).reduce<number>((n, c) => n + (c ?? 0), 0);
  const dominant = dominantCategory(wrongByCategory);
  if (dominant) {
    const share = wrongByCategory[dominant] ?? 0;
    return {
      title: `Drill ${categoryName(dominant)} next`,
      body:
        totalWrong > share
          ? `${share} of your ${totalWrong} misses were ${categoryName(dominant)} — a short focused set will close that gap fastest.`
          : `${share} ${share === 1 ? "miss" : "misses"} in ${categoryName(dominant)} — a short focused set will lock it in.`,
      href: `/study/questions?category=${dominant}`,
      cta: `Drill ${categoryName(dominant)}`,
    };
  }
  if (mockRetestDue) {
    return {
      title: "See where you stand",
      body:
        "It's been a week since your last mock — a short mini mock keeps your pass prediction honest.",
      href: "/study/mock-exam?mode=mini",
      cta: "Take a mini mock",
    };
  }
  return null;
}

/**
 * What to recommend after a flashcard session: cards rated "Again" are the
 * recall failures, so a cluster of them in one category points at practice
 * questions there rather than more cards.
 */
export function nextStepAfterFlashcards({
  againByCategory,
}: {
  againByCategory: CategoryMisses;
}): NextStep | null {
  const dominant = dominantCategory(againByCategory);
  if (!dominant) return null;
  const count = againByCategory[dominant] ?? 0;
  return {
    title: `Practise ${categoryName(dominant)} questions`,
    body: `${count === 1 ? "One card" : `${count} cards`} from ${categoryName(dominant)} came back "Again" — a few real questions will tell you whether it's stuck.`,
    href: `/study/questions?category=${dominant}`,
    cta: `Practise ${categoryName(dominant)}`,
  };
}

/** A full-mock section that fell under its own pass mark. */
export interface FailedSection {
  section: ExamSection;
  correct: number;
  total: number;
}

/**
 * What to recommend after a full mock that failed one or more sections.
 *
 * The DLTC fails a paper section-by-section, so the remediation is the app's
 * own section drill at that section's real pass mark — unless today's drill
 * allowance is spent, in which case untimed category practice on the weakest
 * measured category carries the same intent without hitting a paywall mid-loop.
 * A passed paper recommends nothing; "take another" can wait.
 */
export function nextStepAfterMock({
  failedSections,
  drillsLeft,
  weakestCategoryId,
}: {
  failedSections: FailedSection[];
  drillsLeft: number;
  weakestCategoryId: CategoryId | null;
}): NextStep | null {
  if (failedSections.length === 0) return null;
  // Worst by how far under its own mark it fell, relative to its size.
  const worst = [...failedSections].sort(
    (a, b) => a.correct / Math.max(1, a.total) - b.correct / Math.max(1, b.total),
  )[0];
  if (drillsLeft > 0) {
    return {
      title: `Close the ${SECTION_LABEL[worst.section]} gap`,
      body: `That section sat furthest under its mark (${worst.correct}/${worst.total}). A timed drill puts you back in it at the real pass mark while it's fresh.`,
      href: `/study/mock-exam?mode=drill&section=${worst.section}`,
      cta: `Drill ${SECTION_LABEL[worst.section]}`,
    };
  }
  if (weakestCategoryId) {
    return {
      title: `Practise ${categoryName(weakestCategoryId)}`,
      body: `${SECTION_LABEL[worst.section]} needs work (${worst.correct}/${worst.total}) — today's drills are done, so untimed practice picks up the same thread.`,
      href: `/study/questions?category=${weakestCategoryId}`,
      cta: `Practise ${categoryName(weakestCategoryId)}`,
    };
  }
  return null;
}
