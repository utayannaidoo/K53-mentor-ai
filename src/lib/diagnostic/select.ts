import type { CategoryId, Question, QuestionAttempt, VehicleCode } from "@/types";
import { QUESTIONS } from "@/lib/content/questions";
import { forCode } from "@/lib/content/vehicle";
import { CATEGORIES } from "@/lib/content/categories";
import { EXAM_FORMAT } from "@/lib/constants";
import { shuffle } from "@/lib/utils";

/**
 * Reorder a question's answer options at random and remap the correct index,
 * so the correct answer is not always in the same slot. Call once when an
 * attempt is prepared (not on every render) so the layout stays stable while
 * the learner reads it.
 */
export function withShuffledOptions(q: Question): Question {
  const order = shuffle(q.options.map((_, i) => i));
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correctIndex: order.indexOf(q.correctIndex),
  };
}

/**
 * Order a pool so the questions the learner has seen least recently come first
 * (unseen first, then oldest), with random order within each tier. This lets a
 * mode cycle through the whole bank before repeating anything.
 */
export function orderByFreshness(pool: Question[], attempts: QuestionAttempt[] = []): Question[] {
  const lastSeen = new Map<string, number>();
  for (const a of attempts) {
    const t = Date.parse(a.at) || 0;
    if (t > (lastSeen.get(a.questionId) ?? 0)) lastSeen.set(a.questionId, t);
  }
  // shuffle first so ties (e.g. all-unseen) are randomised; sort is stable in V8.
  return shuffle(pool).sort((a, b) => (lastSeen.get(a.id) ?? 0) - (lastSeen.get(b.id) ?? 0));
}

/** Target question count per category for the 15-question diagnostic. */
const DIAGNOSTIC_PLAN: Record<CategoryId, number> = {
  signs: 4,
  rules: 3,
  controls: 2,
  intersections: 2,
  parking: 1,
  following_distance: 1,
  hazard_awareness: 2,
};

/**
 * Per-category counts for a diagnostic, tilted toward what the learner said
 * worries them (onboarding step 5): +1 question for each of the top two worry
 * categories, taken from the largest non-worry categories so the total stays
 * the same. Exported for unit tests.
 */
export function diagnosticPlanFor(worryCategories: CategoryId[] = []): Record<CategoryId, number> {
  const plan = { ...DIAGNOSTIC_PLAN };
  const worries = worryCategories.slice(0, 2).filter((c) => c in plan);
  for (const worry of worries) {
    // Donor: the non-worry category with the most questions and at least 2,
    // so no category drops to zero coverage.
    const donor = (Object.keys(plan) as CategoryId[])
      .filter((c) => !worries.includes(c) && plan[c] >= 2)
      .sort((a, b) => plan[b] - plan[a])[0];
    if (!donor) break;
    plan[donor] -= 1;
    plan[worry] += 1;
  }
  return plan;
}

/**
 * Sample a diagnostic covering every category, preferring fresh questions,
 * with shuffled order and shuffled options. If the learner told us what
 * worries them, those categories get extra weight.
 */
export function sampleDiagnostic(
  attempts: QuestionAttempt[] = [],
  code?: VehicleCode,
  worryCategories: CategoryId[] = [],
): Question[] {
  const bank = forCode(QUESTIONS, code);
  const plan = diagnosticPlanFor(worryCategories);
  const picked: Question[] = [];
  for (const cat of CATEGORIES) {
    const pool = orderByFreshness(bank.filter((q) => q.categoryId === cat.id), attempts);
    picked.push(...pool.slice(0, plan[cat.id] ?? 2));
  }
  return shuffle(picked).map(withShuffledOptions);
}

/**
 * For self-declared beginners' very first session: easy questions first so the
 * opening minutes build confidence instead of bruising it. Stable within tiers.
 */
export function easyFirst(pool: Question[]): Question[] {
  return [...pool].sort((a, b) => a.difficulty - b.difficulty);
}

/**
 * Mini mock: a 15-question pressure check with the real test's pass ratio
 * (12/15 ≈ the official 77%). Weighted toward the learner's weakest
 * categories so it doubles as targeted revision.
 */
export const MINI_MOCK = { total: 15, passMark: 12, seconds: 12 * 60 };

export function sampleMiniMock(
  attempts: QuestionAttempt[] = [],
  code?: VehicleCode,
  weakCategories: CategoryId[] = [],
): Question[] {
  const bank = forCode(QUESTIONS, code);
  const weakSet = new Set(weakCategories.slice(0, 3));
  const weakPool = bank.filter((q) => weakSet.has(q.categoryId));
  const restPool = bank.filter((q) => !weakSet.has(q.categoryId));
  // ~60% weak-category questions, the rest spread across everything else.
  const targetWeak = weakSet.size > 0 ? Math.min(9, weakPool.length) : 0;
  const picked = orderByFreshness(weakPool, attempts).slice(0, targetWeak);
  picked.push(...orderByFreshness(restPool, attempts).slice(0, MINI_MOCK.total - picked.length));
  return shuffle(picked).map(withShuffledOptions);
}

/** Maps the seven study categories onto the three official exam sections. */
export type ExamSection = keyof typeof EXAM_FORMAT.sections;
export const SECTION_OF: Record<CategoryId, ExamSection> = {
  controls: "controls",
  signs: "signs",
  rules: "rules",
  intersections: "rules",
  parking: "rules",
  following_distance: "rules",
  hazard_awareness: "rules",
};

/**
 * Section drills: one exam section on its own, at the real section size, pass
 * mark and a proportional share of the real 60-minute clock. Passing every
 * section individually is exactly what the real test requires, so drilling a
 * single section against its true pass mark is the highest-fidelity practice
 * short of a full mock.
 */
export const SECTION_DRILL: Record<
  ExamSection,
  { total: number; passMark: number; seconds: number }
> = Object.fromEntries(
  (Object.keys(EXAM_FORMAT.sections) as ExamSection[]).map((s) => [
    s,
    {
      total: EXAM_FORMAT.sections[s].questions,
      passMark: EXAM_FORMAT.sections[s].pass,
      // The real paper gives 60 min for 64 questions — same pace per question.
      seconds:
        Math.round((EXAM_FORMAT.sections[s].questions / EXAM_FORMAT.totalQuestions) * 3600 / 30) *
        30,
    },
  ]),
) as Record<ExamSection, { total: number; passMark: number; seconds: number }>;

export function sampleSectionDrill(
  section: ExamSection,
  attempts: QuestionAttempt[] = [],
  code?: VehicleCode,
): Question[] {
  const pool = forCode(QUESTIONS, code).filter((q) => SECTION_OF[q.categoryId] === section);
  return shuffle(orderByFreshness(pool, attempts).slice(0, SECTION_DRILL[section].total)).map(
    withShuffledOptions,
  );
}

/**
 * Build a full mock exam in the official format: 8 controls, 28 signs and
 * 28 rules questions (64 total). Each section is filled with unique questions,
 * preferring ones the learner has seen least recently; the order is shuffled
 * and every question's options are shuffled.
 */
export function sampleMockExam(
  attempts: QuestionAttempt[] = [],
  code?: VehicleCode,
): Question[] {
  const bySection: Record<ExamSection, Question[]> = {
    controls: [],
    signs: [],
    rules: [],
  };
  for (const q of forCode(QUESTIONS, code)) bySection[SECTION_OF[q.categoryId]].push(q);

  const out: Question[] = [];
  for (const section of Object.keys(EXAM_FORMAT.sections) as ExamSection[]) {
    const need = EXAM_FORMAT.sections[section].questions;
    out.push(...orderByFreshness(bySection[section], attempts).slice(0, need));
  }
  return shuffle(out).map(withShuffledOptions);
}
