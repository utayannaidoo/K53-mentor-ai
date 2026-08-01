import { describe, expect, it } from "vitest";
import { orderByFreshness, subjectOf, takeDistinctSubjects } from "@/lib/diagnostic/select";
import { dueMistakes } from "@/lib/learning/mistakes";
import { abilityByCategory, interleave, withinReach } from "@/lib/learning/ability";
import { defaultUserState } from "@/lib/store/local-store";
import { QUESTIONS } from "@/lib/content/questions";
import { forCode } from "@/lib/content/vehicle";
import type { Question, QuestionAttempt, UserState } from "@/types";

/**
 * Mirrors buildQueue() in question-practice.tsx. Kept in the test rather than
 * exported from the component so the component stays a component — but the
 * ordering contract it encodes is the point of the Mistake Loop, so it is
 * asserted here rather than left to a browser click-through.
 *
 * Takes the pool as an argument, exactly like the component does now that
 * content is fetched rather than bundled.
 */
const MISTAKES_PER_SESSION = 3;

function buildQueue(state: UserState, pool: Question[], limit: number): Question[] {
  const byId = new Map(pool.map((q) => [q.id, q]));
  const mistakes = dueMistakes(state)
    .map((m) => byId.get(m.questionId))
    .filter((q): q is Question => Boolean(q))
    .slice(0, Math.min(MISTAKES_PER_SESSION, Math.max(0, limit - 1)));
  const mistakeIds = new Set(mistakes.map((q) => q.id));
  const ability = abilityByCategory(state.attempts);
  const ordered = orderByFreshness(
    withinReach(
      pool.filter((q) => !mistakeIds.has(q.id)),
      ability,
    ),
    state.attempts,
  );
  const seen = new Set(mistakes.map(subjectOf));
  const fresh = takeDistinctSubjects(ordered, Math.max(0, limit - mistakes.length), seen);
  return interleave([...mistakes, ...fresh]);
}

let seq = 0;
function wrongAt(q: Question, day: string): QuestionAttempt {
  return {
    id: `att_${seq++}`,
    questionId: q.id,
    categoryId: q.categoryId,
    correct: false,
    selectedIndex: (q.correctIndex + 1) % q.options.length,
    at: `${day}T09:00:00.000Z`,
    context: "practice",
  };
}

const pool = forCode(QUESTIONS, "8");

describe("mistakes lead the practice queue", () => {
  it("a missed question comes back in the very next session", () => {
    // The regression this whole feature exists to prevent: orderByFreshness
    // sorts least-recently-seen FIRST, so a question you just answered sinks to
    // the back of the pool — the one item you've proven you don't know.
    const missed = pool[42];
    const state: UserState = {
      ...defaultUserState(),
      attempts: [wrongAt(missed, "2026-07-01")],
    };

    const queue = buildQueue(state, pool, 12);
    expect(queue[0].id).toBe(missed.id);

    // ...and without the mistake pass it would NOT be there at all.
    const freshOnly = takeDistinctSubjects(orderByFreshness(pool, state.attempts), 12);
    expect(freshOnly.map((q) => q.id)).not.toContain(missed.id);
  });

  it("leads with at most MISTAKES_PER_SESSION, so sessions still teach new material", () => {
    const missed = pool.slice(0, 8);
    const state: UserState = {
      ...defaultUserState(),
      attempts: missed.map((q) => wrongAt(q, "2026-07-01")),
    };
    const queue = buildQueue(state, pool, 12);
    const missedIds = new Set(missed.map((q) => q.id));
    expect(queue.filter((q) => missedIds.has(q.id))).toHaveLength(MISTAKES_PER_SESSION);
    expect(queue).toHaveLength(12);
  });

  it("never fills a session entirely with mistakes, even at a tiny cap", () => {
    const missed = pool.slice(0, 8);
    const state: UserState = {
      ...defaultUserState(),
      attempts: missed.map((q) => wrongAt(q, "2026-07-01")),
    };
    // Free tier near its daily limit: 2 questions left.
    const queue = buildQueue(state, pool, 2);
    expect(queue).toHaveLength(2);
    const missedIds = new Set(missed.map((q) => q.id));
    expect(queue.filter((q) => missedIds.has(q.id)).length).toBeLessThan(2);
  });

  it("does not ask about the same road sign twice in one session", () => {
    const withSign = pool.filter((q) => q.image)[0];
    const state: UserState = {
      ...defaultUserState(),
      attempts: [wrongAt(withSign, "2026-07-01")],
    };
    const subjects = buildQueue(state, pool, 12).map(subjectOf);
    expect(new Set(subjects).size).toBe(subjects.length);
  });

  it("a retired mistake stops leading", () => {
    const missed = pool[7];
    const base = wrongAt(missed, "2026-07-01");
    const state: UserState = {
      ...defaultUserState(),
      attempts: [
        base,
        { ...base, id: "c1", correct: true, at: "2026-07-02T09:00:00.000Z" },
        { ...base, id: "c2", correct: true, at: "2026-07-03T09:00:00.000Z" },
      ],
    };
    expect(dueMistakes(state)).toEqual([]);
    expect(buildQueue(state, pool, 12)[0].id).not.toBe(missed.id);
  });

  it("mixed sessions come out interleaved, not blocked by category", () => {
    const state = defaultUserState();
    const queue = buildQueue(state, pool, 12);
    let streak = 1;
    for (let i = 1; i < queue.length; i++) {
      streak = queue[i].categoryId === queue[i - 1].categoryId ? streak + 1 : 1;
      expect(streak).toBeLessThanOrEqual(2);
    }
  });
});
