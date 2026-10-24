import { EXAM_FORMAT, SECTION_OF, type ExamSection } from "@/lib/constants";
import type { UserState } from "@/types";

/**
 * When has a learner done enough to be shown a readiness score?
 *
 * This used to be "after the 15-question starting check". The check is gone —
 * onboarding asks what the learner finds hard and drops them straight into
 * study — so the baseline now comes from ordinary practice. The bar keeps the
 * check's one property that mattered: evidence from every exam section. The
 * test is passed or failed per section, and a score built only from the
 * section someone chose to practise would describe a test that does not exist.
 *
 * A learner who did take the old check keeps their measured baseline.
 */
export const BASELINE_ANSWERS = 15;
export const BASELINE_PER_SECTION = 3;

const SECTIONS = Object.keys(EXAM_FORMAT.sections) as ExamSection[];

export interface BaselineStatus {
  measured: boolean;
  /** Answers still needed before readiness is shown; 0 once measured. */
  remaining: number;
  /** Sections that still need answers, in exam order. */
  missingSections: ExamSection[];
}

export function baselineStatus(state: Pick<UserState, "diagnostics" | "attempts">): BaselineStatus {
  if (state.diagnostics.length > 0) return { measured: true, remaining: 0, missingSections: [] };

  const perSection: Record<ExamSection, number> = { controls: 0, signs: 0, rules: 0 };
  let answered = 0;
  for (const attempt of state.attempts) {
    // A blank (timed-out) answer is not evidence of anything.
    if (attempt.selectedIndex < 0) continue;
    perSection[SECTION_OF[attempt.categoryId]] += 1;
    answered += 1;
  }

  const missingSections = SECTIONS.filter((s) => perSection[s] < BASELINE_PER_SECTION);
  const sectionShortfall = missingSections.reduce(
    (sum, s) => sum + (BASELINE_PER_SECTION - perSection[s]),
    0,
  );
  const remaining = Math.max(BASELINE_ANSWERS - answered, sectionShortfall, 0);
  return { measured: remaining === 0, remaining, missingSections };
}
