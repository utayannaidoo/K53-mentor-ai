import { CATEGORIES } from "@/lib/content/categories";
import { EXAM_FORMAT, SECTION_OF, type ExamSection } from "@/lib/constants";
import type { CategoryId } from "@/types";

/**
 * Every category, ranked weakest first, with the one fact that makes the number
 * actionable: whether it clears the bar its exam section has to clear.
 *
 * The dashboard used to show four "weak areas" and nothing else, which answers
 * "what is worst" but never "am I there yet" — and on this exam those are
 * different questions. Each section carries its own minimum (23 of 28 on signs,
 * 22 of 28 on rules, 6 of 8 on controls), so 70% is comfortable in one place and
 * a fail in another. A bar with no mark on it cannot say that.
 *
 * `required` is that minimum as a percentage, so the same 82% reads as short on
 * signs and clear on rules — which is exactly what the learner needs to know
 * before choosing what to study.
 */
export interface CategoryMastery {
  id: CategoryId;
  name: string;
  section: ExamSection;
  /** Current competence, 0–100. */
  value: number;
  /** What this category's section needs, 0–100. */
  required: number;
  /** At or above the section's own mark. */
  clearing: boolean;
}

export function categoryMastery(
  perCategory: Record<CategoryId, number>,
): CategoryMastery[] {
  return CATEGORIES.map((c) => {
    const section = SECTION_OF[c.id];
    const { questions, pass } = EXAM_FORMAT.sections[section];
    const required = Math.round((pass / questions) * 100);
    const value = Math.round(perCategory[c.id] ?? 0);
    return { id: c.id, name: c.name, section, value, required, clearing: value >= required };
  }).sort((a, b) => a.value - b.value);
}
