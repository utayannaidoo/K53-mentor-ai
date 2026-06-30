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
 * Sample a diagnostic covering every category, preferring fresh questions,
 * with shuffled order and shuffled options.
 */
export function sampleDiagnostic(
  attempts: QuestionAttempt[] = [],
  code?: VehicleCode,
): Question[] {
  const bank = forCode(QUESTIONS, code);
  const picked: Question[] = [];
  for (const cat of CATEGORIES) {
    const pool = orderByFreshness(bank.filter((q) => q.categoryId === cat.id), attempts);
    picked.push(...pool.slice(0, DIAGNOSTIC_PLAN[cat.id] ?? 2));
  }
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
