import type {
  CategoryId,
  CategoryScore,
  DiagnosticResult,
  UserState,
} from "@/types";
import { CATEGORIES } from "@/lib/content/categories";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { forCode } from "@/lib/content/vehicle";
import { clamp, uid } from "@/lib/utils";

/**
 * Per-category weighting toward overall readiness. Signs and rules dominate the
 * real test, so they carry the most weight. Weights sum to 1.
 */
export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  signs: 0.22,
  rules: 0.22,
  controls: 0.1,
  intersections: 0.14,
  parking: 0.08,
  following_distance: 0.12,
  hazard_awareness: 0.12,
};

/** Baseline competence for a category with no signal yet (endowed-progress, never 0). */
const BASELINE = 18;

export interface ReadinessBreakdown {
  readiness: number;
  passProbability: number;
  perCategory: Record<CategoryId, number>;
  weakCategories: CategoryId[];
  strongCategories: CategoryId[];
}

/** Logistic map from readiness (0–100) to a pass-probability percentage. */
export function passProbabilityFromReadiness(readiness: number) {
  const p = 1 / (1 + Math.exp(-(readiness - 55) / 9));
  return Math.round(clamp(p * 100));
}

/**
 * Score a single completed diagnostic from its per-question correctness.
 * Used at the moment the diagnostic finishes.
 */
export function scoreDiagnostic(
  responses: { categoryId: CategoryId; correct: boolean }[],
  now = new Date(),
): DiagnosticResult {
  const perCategory: Partial<Record<CategoryId, CategoryScore>> = {};
  for (const cat of CATEGORIES) {
    const subset = responses.filter((r) => r.categoryId === cat.id);
    if (subset.length === 0) continue;
    const correct = subset.filter((r) => r.correct).length;
    perCategory[cat.id] = {
      correct,
      total: subset.length,
      score: Math.round((correct / subset.length) * 100),
    };
  }

  let weightSum = 0;
  let weighted = 0;
  for (const cat of CATEGORIES) {
    const cs = perCategory[cat.id];
    if (!cs) continue;
    weighted += cs.score * CATEGORY_WEIGHTS[cat.id];
    weightSum += CATEGORY_WEIGHTS[cat.id];
  }
  const readiness = weightSum > 0 ? Math.round(weighted / weightSum) : BASELINE;

  const ranked = (Object.keys(perCategory) as CategoryId[]).sort(
    (a, b) => perCategory[a]!.score - perCategory[b]!.score,
  );
  const weakCategories = ranked.filter((c) => perCategory[c]!.score < 70).slice(0, 3);
  const strongCategories = [...ranked]
    .reverse()
    .filter((c) => perCategory[c]!.score >= 75)
    .slice(0, 2);

  const total = responses.length;
  const correct = responses.filter((r) => r.correct).length;

  return {
    id: uid("diag"),
    at: now.toISOString(),
    readiness,
    passProbability: passProbabilityFromReadiness(readiness),
    total,
    correct,
    perCategory,
    weakCategories,
    strongCategories,
  };
}

/** Average flashcard mastery for a category, across cards the user has studied. */
function flashMasteryForCategory(state: UserState, categoryId: CategoryId): number | null {
  const cards = forCode(FLASHCARDS, state.onboarding?.vehicleCode).filter(
    (f) => f.categoryId === categoryId,
  );
  const studied = cards
    .map((c) => state.cardStates[c.id])
    .filter((s): s is NonNullable<typeof s> => Boolean(s) && s.reps > 0);
  if (studied.length === 0) return null;
  const avg = studied.reduce((sum, s) => sum + s.mastery, 0) / studied.length;
  // Scale by coverage so studying more of the deck raises confidence.
  const coverage = Math.sqrt(studied.length / cards.length);
  return avg * coverage;
}

/** Question/diagnostic accuracy for a category. */
function accuracyForCategory(state: UserState, categoryId: CategoryId): number | null {
  const attempts = state.attempts.filter((a) => a.categoryId === categoryId);
  if (attempts.length === 0) return null;
  const correct = attempts.filter((a) => a.correct).length;
  return (correct / attempts.length) * 100;
}

/**
 * The live readiness model that powers the dashboard. It blends diagnostic /
 * practice accuracy with flashcard mastery so the score visibly moves as the
 * user studies — the core retention loop.
 */
export function computeReadiness(state: UserState): ReadinessBreakdown {
  const perCategory = {} as Record<CategoryId, number>;

  for (const cat of CATEGORIES) {
    const acc = accuracyForCategory(state, cat.id);
    const flash = flashMasteryForCategory(state, cat.id);

    let competence: number;
    if (acc !== null && flash !== null) competence = 0.65 * acc + 0.35 * flash;
    else if (acc !== null) competence = acc;
    else if (flash !== null) competence = flash;
    else competence = BASELINE;

    perCategory[cat.id] = clamp(Math.round(competence));
  }

  let weighted = 0;
  for (const cat of CATEGORIES) weighted += perCategory[cat.id] * CATEGORY_WEIGHTS[cat.id];
  const readiness = clamp(Math.round(weighted));

  const ranked = (Object.keys(perCategory) as CategoryId[]).sort(
    (a, b) => perCategory[a] - perCategory[b],
  );

  return {
    readiness,
    passProbability: passProbabilityFromReadiness(readiness),
    perCategory,
    weakCategories: ranked.filter((c) => perCategory[c] < 70).slice(0, 3),
    strongCategories: [...ranked].reverse().filter((c) => perCategory[c] >= 75).slice(0, 3),
  };
}
