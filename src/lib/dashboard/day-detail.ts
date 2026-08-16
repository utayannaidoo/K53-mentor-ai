import { dayKey } from "@/lib/dashboard/day-strip";
import type { UserState } from "@/types";

/**
 * What a learner actually did on one day.
 *
 * The strip can only say "you worked that day". Clicking a column should answer
 * the question that follows — *what did I do?* — and the store already holds
 * every piece of it, keyed by timestamp, just never assembled per day before.
 *
 * Flashcards are the one honest approximation here. There is no per-review log
 * in local state; a card records only when it was **last** seen, so reviewing
 * the same card twice in a week counts once, on the later day. That undercounts
 * a busy day rather than inflating it, and the label says "reviewed" rather
 * than claiming a session count it cannot know.
 */
export interface DaySummary {
  key: string;
  /** Seconds of recorded study — sessions are the only source that times itself. */
  studiedSeconds: number;
  questions: { answered: number; correct: number; accuracy: number | null };
  /** Cards whose most recent review landed on this day. */
  flashcards: number;
  mocks: { count: number; bestScore: number | null; total: number | null; passed: number };
  scenarios: { count: number; correct: number };
  /** Readiness as recorded that day, if a snapshot exists. */
  readiness: number | null;
  /** Nothing at all happened. */
  isEmpty: boolean;
}

const onDay = (stamp: string | null | undefined, key: string): boolean => {
  if (!stamp) return false;
  const d = new Date(stamp);
  return !Number.isNaN(d.getTime()) && dayKey(d) === key;
};

export function summariseDay(
  state: Pick<
    UserState,
    "attempts" | "sessions" | "mockExams" | "scenarioAttempts" | "cardStates" | "readinessHistory"
  >,
  key: string,
): DaySummary {
  // Blanks left in a timed mock are recorded as attempts but were never
  // answered — counting them here would report questions the learner never saw
  // the options for. Same rule the readiness model uses.
  const attempts = state.attempts.filter((a) => onDay(a.at, key) && a.selectedIndex >= 0);
  const correct = attempts.filter((a) => a.correct).length;

  const mocks = state.mockExams.filter((m) => onDay(m.at, key));
  const scenarios = state.scenarioAttempts.filter((s) => onDay(s.at, key));
  const sessions = state.sessions.filter((s) => onDay(s.endedAt, key));
  const flashcards = Object.values(state.cardStates).filter((c) =>
    onDay(c.lastReviewed, key),
  ).length;

  const studiedSeconds = sessions.reduce((n, s) => n + (s.durationSeconds || 0), 0);
  const best = mocks.reduce<{ score: number; total: number } | null>(
    (acc, m) => (!acc || m.score / m.total > acc.score / acc.total ? { score: m.score, total: m.total } : acc),
    null,
  );

  return {
    key,
    studiedSeconds,
    questions: {
      answered: attempts.length,
      correct,
      accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : null,
    },
    flashcards,
    mocks: {
      count: mocks.length,
      bestScore: best?.score ?? null,
      total: best?.total ?? null,
      passed: mocks.filter((m) => m.passed).length,
    },
    scenarios: { count: scenarios.length, correct: scenarios.filter((s) => s.correct).length },
    readiness: state.readinessHistory.find((h) => h.date === key)?.readiness ?? null,
    isEmpty:
      attempts.length === 0 &&
      mocks.length === 0 &&
      scenarios.length === 0 &&
      flashcards === 0 &&
      studiedSeconds === 0,
  };
}
