import type { Question } from "@/types";
import { SECTION_OF, type ExamSection } from "@/lib/constants";
import { shuffle } from "@/lib/utils";
import { withShuffledOptions } from "./shuffle-options";

export const QUIZ_SIZE = 10;

/** Roughly the real paper's shape (28 signs / 28 rules / 8 controls), at 1/6 scale. */
const MIX: Record<ExamSection, number> = { signs: 4, rules: 4, controls: 2 };

export function pickQuestions(pool: Question[]): Question[] {
  const bySection = new Map<ExamSection, Question[]>();
  for (const q of pool) {
    const section = SECTION_OF[q.categoryId];
    const arr = bySection.get(section) ?? [];
    arr.push(q);
    bySection.set(section, arr);
  }

  const picked: Question[] = [];
  for (const [section, want] of Object.entries(MIX) as [ExamSection, number][]) {
    picked.push(...shuffle(bySection.get(section) ?? []).slice(0, want));
  }

  // Top up from whatever is left if a section came up short, so the quiz is
  // always QUIZ_SIZE long even as the starter pack changes shape.
  if (picked.length < QUIZ_SIZE) {
    const taken = new Set(picked.map((q) => q.id));
    picked.push(...shuffle(pool.filter((q) => !taken.has(q.id))).slice(0, QUIZ_SIZE - picked.length));
  }
  return shuffle(picked).slice(0, QUIZ_SIZE).map(withShuffledOptions);
}

