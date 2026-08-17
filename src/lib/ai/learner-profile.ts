import type { Question, QuestionAttempt, UserState } from "@/types";
import { categoryName } from "@/lib/content/categories";
import { openMistakes } from "@/lib/learning/mistakes";
import { daysUntil } from "@/lib/utils";

/**
 * A short, non-PII picture of the learner, sent with tutor requests.
 *
 * This used to be a single sentence — overall accuracy, weakest category, tier —
 * which let the AI say "let's work on signs" and nothing more. An instructor
 * remembers more than that: what you got wrong last time and *what you said
 * instead*, whether you're improving or stuck, whether you're rushing, and how
 * long you have. All of that already exists in local state; it just wasn't
 * being handed over.
 *
 * Facts, not prose — the model writes the prose. Runs on the client because
 * progress lives in localStorage, and is advisory only (user-supplied, so never
 * trusted for anything security-sensitive).
 *
 * Takes the learner's content pool rather than importing the bank, so this can
 * keep being called from a client component.
 */

/** Attempts before there's enough signal to say anything useful. */
const MIN_ATTEMPTS = 5;
/** Recent-window size used for the improving/stuck read. */
const TREND_WINDOW = 15;
/** Below this, an answer is a guess or a recognition, not reasoning. */
const RUSHED_MS = 3000;

const accuracyOf = (list: readonly QuestionAttempt[]) =>
  list.length ? Math.round((list.filter((a) => a.correct).length / list.length) * 100) : 0;

function trendClause(attempts: readonly QuestionAttempt[]): string | null {
  if (attempts.length < TREND_WINDOW * 2) return null;
  const recent = accuracyOf(attempts.slice(-TREND_WINDOW));
  const earlier = accuracyOf(attempts.slice(-TREND_WINDOW * 2, -TREND_WINDOW));
  const delta = recent - earlier;
  if (Math.abs(delta) < 8) return `Holding steady around ${recent}%`;
  return delta > 0
    ? `Improving: ${earlier}% → ${recent}% recently`
    : `Slipping: ${earlier}% → ${recent}% recently`;
}

/** Rushing is worth naming — it's a different fix from not knowing the material. */
function paceClause(attempts: readonly QuestionAttempt[]): string | null {
  const timed = attempts.filter((a) => typeof a.ms === "number").slice(-TREND_WINDOW);
  if (timed.length < 8) return null;
  const wrong = timed.filter((a) => !a.correct).length;
  const rushedWrong = timed.filter((a) => !a.correct && (a.ms ?? 0) < RUSHED_MS).length;
  if (wrong >= 3 && rushedWrong / wrong >= 0.6) {
    return "Tends to answer wrong questions very fast — likely rushing rather than not knowing";
  }
  return null;
}

/**
 * The last few misses, each with the answer they actually gave. This is the
 * single most useful thing the tutor can know: it turns "you struggle with
 * signs" into "you keep reading yield as stop".
 */
function recentMissClauses(
  state: UserState,
  byId: Map<string, Question>,
  max = 3,
): string[] {
  return openMistakes(state)
    .slice(0, max)
    .map((m) => {
      const q = byId.get(m.questionId);
      if (!q) return null;
      const chose = q.options[m.chosenIndex];
      if (!chose) return null;
      return `“${q.prompt.slice(0, 70)}” → answered “${chose.slice(0, 50)}” (wrong)`;
    })
    .filter((s): s is string => Boolean(s));
}

/** Days left, or null when there is no date or the test has already been sat. */
function daysToTest(state: UserState): number | null {
  const days = daysUntil(state.onboarding?.testDate ?? null);
  return days !== null && days >= 0 ? days : null;
}

export function buildLearnerProfile(
  state: UserState,
  pool: readonly Question[] = [],
): string | null {
  const attempts = state.attempts ?? [];
  if (attempts.length < MIN_ATTEMPTS) return null;

  const byCat: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    const k = a.categoryId as string;
    (byCat[k] ??= { correct: 0, total: 0 }).total += 1;
    if (a.correct) byCat[k].correct += 1;
  }
  const ranked = Object.entries(byCat)
    .filter(([, v]) => v.total >= 3)
    .map(([k, v]) => ({ k, pct: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => a.pct - b.pct);

  const lines: string[] = [
    `Practice accuracy ~${accuracyOf(attempts)}% over ${attempts.length} questions. Plan: ${state.tier}.`,
  ];

  if (ranked[0]) lines.push(`Weakest: ${categoryName(ranked[0].k as never)} (~${ranked[0].pct}%).`);
  if (ranked.length > 1) {
    const best = ranked[ranked.length - 1];
    lines.push(`Strongest: ${categoryName(best.k as never)} (~${best.pct}%).`);
  }

  const trend = trendClause(attempts);
  if (trend) lines.push(`${trend}.`);

  const pace = paceClause(attempts);
  if (pace) lines.push(`${pace}.`);

  const days = daysToTest(state);
  if (days !== null) lines.push(`Test in ${days} day${days === 1 ? "" : "s"}.`);

  if (state.streak.current > 1) lines.push(`${state.streak.current}-day study streak.`);

  const misses = recentMissClauses(state, new Map(pool.map((q) => [q.id, q])));
  if (misses.length) lines.push(`Unresolved mistakes — ${misses.join("; ")}.`);

  return lines.join(" ").slice(0, 900);
}
