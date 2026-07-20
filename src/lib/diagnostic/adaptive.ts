import type { CategoryId, Question, QuestionAttempt } from "@/types";
import { orderByFreshness } from "@/lib/diagnostic/select";
import { clamp } from "@/lib/utils";

/**
 * IRT-lite adaptive engine for the diagnostic (Rasch / 1-parameter model).
 *
 * Each question's authored difficulty (1–3) maps to an item parameter `b`;
 * the learner's ability θ is re-estimated after every answer (MAP over a
 * grid with a standard-normal prior — exact enough for ≤15 items and cheap
 * enough to run per keystroke). The next question is the unseen item, in the
 * category that still needs coverage, whose difficulty carries the most
 * information at the current θ (|b − θ| minimal).
 *
 * Category coverage is preserved so the per-category breakdown stays valid:
 * adaptivity chooses WHICH item within a category slot, never whether a
 * category is tested.
 */

/** Item difficulty parameter per authored difficulty level. */
const B_OF_DIFFICULTY: Record<1 | 2 | 3, number> = { 1: -1.1, 2: 0, 3: 1.1 };

export function itemB(q: Question): number {
  return B_OF_DIFFICULTY[q.difficulty];
}

/** Rasch response probability. */
function pCorrect(theta: number, b: number): number {
  return 1 / (1 + Math.exp(-(theta - b)));
}

export interface AdaptiveResponse {
  b: number;
  correct: boolean;
}

/**
 * MAP estimate of θ over a grid, prior N(0, 1). Returns 0 with no data (the
 * prior mean), so the first item is always medium difficulty.
 */
export function estimateTheta(responses: AdaptiveResponse[]): number {
  if (!responses.length) return 0;
  let best = 0;
  let bestLp = -Infinity;
  for (let t = -3; t <= 3.0001; t += 0.05) {
    let lp = -0.5 * t * t; // log prior (unit normal, constant dropped)
    for (const r of responses) {
      const p = pCorrect(t, r.b);
      lp += Math.log(r.correct ? p : 1 - p);
    }
    if (lp > bestLp) {
      bestLp = lp;
      best = t;
    }
  }
  return Math.round(best * 100) / 100;
}

/** θ mapped onto the 0–100 readiness scale (θ=0 ≈ 50). */
export function thetaToScale(theta: number): number {
  return clamp(Math.round(50 + 18 * theta));
}

export interface AdaptiveState {
  /** Remaining question count needed per category. */
  needs: Partial<Record<CategoryId, number>>;
  /** Categories in serve order (rotates for interleaving). */
  order: CategoryId[];
  responses: AdaptiveResponse[];
  theta: number;
}

export function initAdaptive(plan: Record<CategoryId, number>): AdaptiveState {
  const order = (Object.keys(plan) as CategoryId[]).filter((c) => plan[c] > 0);
  return { needs: { ...plan }, order, responses: [], theta: 0 };
}

/**
 * Pick the next question: rotate to the next category still owed coverage,
 * then take the freshest unseen item whose difficulty sits closest to θ.
 * Returns null when the plan is satisfied or the pool is exhausted.
 */
export function nextQuestion(
  state: AdaptiveState,
  pool: Question[],
  askedIds: Set<string>,
  attempts: QuestionAttempt[] = [],
): Question | null {
  const remaining = state.order.filter((c) => (state.needs[c] ?? 0) > 0);
  for (const category of remaining) {
    const candidates = pool.filter((q) => q.categoryId === category && !askedIds.has(q.id));
    if (!candidates.length) {
      state.needs[category] = 0; // category exhausted — skip it from now on
      continue;
    }
    // Freshness-ordered, then stable-sorted by information at current θ.
    const ranked = orderByFreshness(candidates, attempts).sort(
      (a, b) => Math.abs(itemB(a) - state.theta) - Math.abs(itemB(b) - state.theta),
    );
    return ranked[0];
  }
  return null;
}

/** Record an answer and advance the adaptive state (mutates + returns it). */
export function recordAdaptive(
  state: AdaptiveState,
  question: Question,
  correct: boolean,
): AdaptiveState {
  state.responses.push({ b: itemB(question), correct });
  state.theta = estimateTheta(state.responses);
  const c = question.categoryId;
  state.needs[c] = Math.max(0, (state.needs[c] ?? 0) - 1);
  // Rotate the category order so coverage interleaves.
  const idx = state.order.indexOf(c);
  if (idx >= 0) state.order.push(...state.order.splice(idx, 1));
  return state;
}

/** Total questions the plan still owes. */
export function remainingCount(state: AdaptiveState): number {
  return Object.values(state.needs).reduce((s, n) => s + (n ?? 0), 0);
}
