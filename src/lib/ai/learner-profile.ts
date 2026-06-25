import type { UserState } from "@/types";
import { categoryName } from "@/lib/content/categories";

/**
 * Build a short, non-PII learner profile from local study history, to be sent
 * with tutor requests so the AI can personalise (lean into weak areas, pitch to
 * the right level). Kept to one line and capped — it's a hint, not a dossier.
 *
 * Runs on the client because progress lives in localStorage. It is advisory
 * only (user-supplied, so never trusted for anything security-sensitive).
 */
export function buildLearnerProfile(state: UserState): string | null {
  const attempts = state.attempts ?? [];
  if (attempts.length < 5) return null; // too little signal to personalise

  const byCat: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    const k = a.categoryId as string;
    (byCat[k] ??= { correct: 0, total: 0 }).total += 1;
    if (a.correct) byCat[k].correct += 1;
  }

  const cats = Object.entries(byCat)
    .filter(([, v]) => v.total >= 3)
    .map(([k, v]) => ({ k, pct: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => a.pct - b.pct);

  const overall = Math.round(
    (attempts.filter((a) => a.correct).length / attempts.length) * 100,
  );

  const weakest = cats[0];
  const weak = weakest
    ? ` Weakest area: ${categoryName(weakest.k as never)} (~${weakest.pct}%).`
    : "";

  return `Overall practice accuracy ~${overall}% over ${attempts.length} questions.${weak} Plan tier: ${state.tier}.`.slice(0, 400);
}
