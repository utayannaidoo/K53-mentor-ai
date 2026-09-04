import type { CategoryId, DiagnosticResult } from "@/types";
import { CATEGORIES } from "@/lib/content/categories";

/**
 * Categories worth putting in the result's first-action panel.
 *
 * `weakCategories` is intentionally limited to three for ordinary results.
 * That limit must never split a tie: if four categories share the third
 * lowest score, hiding one tells a learner it matters less when it does not.
 * Missing category rows are not filled with a prior here — this surface is a
 * report of the starting check, so it only repeats what the check measured.
 */
export function diagnosticFocusCategories(result: DiagnosticResult): CategoryId[] {
  const rankedWeak = result.weakCategories.filter(
    (categoryId, index, all) =>
      all.indexOf(categoryId) === index && result.perCategory[categoryId] !== undefined,
  );
  if (rankedWeak.length === 0) return [];

  const cutoff = result.perCategory[rankedWeak[rankedWeak.length - 1]]!.score;
  return CATEGORIES.map((category) => category.id)
    .filter((categoryId) => {
      const score = result.perCategory[categoryId]?.score;
      return score !== undefined && score < 70 && score <= cutoff;
    })
    .sort((a, b) => result.perCategory[a]!.score - result.perCategory[b]!.score);
}
