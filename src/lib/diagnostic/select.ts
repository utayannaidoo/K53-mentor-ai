import type { CategoryId, Question } from "@/types";
import { QUESTIONS } from "@/lib/content/questions";
import { CATEGORIES } from "@/lib/content/categories";
import { EXAM_FORMAT } from "@/lib/constants";
import { shuffle } from "@/lib/utils";

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

/** Sample a diagnostic that covers every category, then shuffle the order. */
export function sampleDiagnostic(): Question[] {
  const picked: Question[] = [];
  for (const cat of CATEGORIES) {
    const pool = shuffle(QUESTIONS.filter((q) => q.categoryId === cat.id));
    picked.push(...pool.slice(0, DIAGNOSTIC_PLAN[cat.id] ?? 2));
  }
  return shuffle(picked);
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
 * 28 rules questions (64 total), each section filled with unique questions and
 * the final order shuffled. Falls back gracefully if a section is short.
 */
export function sampleMockExam(): Question[] {
  const bySection: Record<ExamSection, Question[]> = {
    controls: [],
    signs: [],
    rules: [],
  };
  for (const q of QUESTIONS) bySection[SECTION_OF[q.categoryId]].push(q);

  const out: Question[] = [];
  for (const section of Object.keys(EXAM_FORMAT.sections) as ExamSection[]) {
    const need = EXAM_FORMAT.sections[section].questions;
    out.push(...shuffle(bySection[section]).slice(0, need));
  }
  return shuffle(out);
}
