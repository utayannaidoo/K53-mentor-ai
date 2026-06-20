import type { CategoryId, Question } from "@/types";
import { QUESTIONS } from "@/lib/content/questions";
import { CATEGORIES } from "@/lib/content/categories";
import { shuffle } from "@/lib/utils";

/** Target question count per category for the 15-question diagnostic. */
const DIAGNOSTIC_PLAN: Record<CategoryId, number> = {
  signs: 3,
  rules: 3,
  controls: 2,
  intersections: 2,
  parking: 1,
  following_distance: 2,
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

/** Build a full 68-question mock exam (repeats sampling as needed). */
export function sampleMockExam(total = 68): Question[] {
  const all = shuffle(QUESTIONS);
  if (all.length >= total) return all.slice(0, total);
  // Not enough unique questions in the seed — repeat to reach the real format.
  const out: Question[] = [];
  let i = 0;
  while (out.length < total) {
    out.push(all[i % all.length]);
    i++;
  }
  return out;
}
