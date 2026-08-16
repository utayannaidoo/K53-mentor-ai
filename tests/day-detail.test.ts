import { describe, expect, it } from "vitest";
import { summariseDay } from "@/lib/dashboard/day-detail";
import { dayKey } from "@/lib/dashboard/day-strip";
import type { CardState, MockExamAttempt, QuestionAttempt, ScenarioAttempt, StudySession } from "@/types";

/**
 * Opening a day on the strip has to report what actually happened on it —
 * which means picking the right rows out of five differently-shaped lists,
 * and not counting the two things that would flatter the number.
 */

const DAY = new Date(2026, 7, 12, 14, 0);
const KEY = dayKey(DAY);
const OTHER = new Date(2026, 7, 11, 14, 0);

const q = (correct: boolean, selectedIndex: number, at: Date): QuestionAttempt => ({
  id: `q${at.getTime()}${selectedIndex}${correct}`,
  questionId: "q1",
  categoryId: "signs",
  correct,
  selectedIndex,
  context: "practice",
  at: at.toISOString(),
});

const empty = {
  attempts: [] as QuestionAttempt[],
  sessions: [] as StudySession[],
  mockExams: [] as MockExamAttempt[],
  scenarioAttempts: [] as ScenarioAttempt[],
  cardStates: {} as Record<string, CardState>,
  readinessHistory: [] as { date: string; readiness: number }[],
};

const card = (id: string, lastReviewed: string | null): CardState => ({
  cardId: id,
  reps: 1,
  lapses: 0,
  ease: 2.5,
  intervalDays: 1,
  due: new Date().toISOString(),
  lastReviewed,
  mastery: 50,
});

const mock = (score: number, total: number, passed: boolean, at: Date): MockExamAttempt => ({
  id: `m${score}`,
  at: at.toISOString(),
  score,
  total,
  passed,
  perCategory: {},
  durationSeconds: 1200,
});

describe("summariseDay", () => {
  it("reports an untouched day as empty rather than as zeros", () => {
    const d = summariseDay(empty, KEY);
    expect(d.isEmpty).toBe(true);
    expect(d.questions.accuracy).toBeNull();
  });

  it("counts only the chosen day", () => {
    const d = summariseDay(
      { ...empty, attempts: [q(true, 1, DAY), q(false, 2, DAY), q(true, 0, OTHER)] },
      KEY,
    );
    expect(d.questions.answered).toBe(2);
    expect(d.questions.correct).toBe(1);
    expect(d.questions.accuracy).toBe(50);
  });

  it("ignores blanks left in a timed mock", () => {
    // -1 is the mock's "never answered" sentinel. Counting those here would
    // report questions the learner never even saw the options for.
    const d = summariseDay(
      { ...empty, attempts: [q(true, 1, DAY), q(false, -1, DAY), q(false, -1, DAY)] },
      KEY,
    );
    expect(d.questions.answered).toBe(1);
    expect(d.questions.accuracy).toBe(100);
  });

  it("sums study time and counts cards last reviewed that day", () => {
    const d = summariseDay(
      {
        ...empty,
        sessions: [
          { id: "s1", type: "questions", startedAt: DAY.toISOString(), endedAt: DAY.toISOString(), durationSeconds: 300 },
          { id: "s2", type: "flashcards", startedAt: DAY.toISOString(), endedAt: DAY.toISOString(), durationSeconds: 450 },
          { id: "s3", type: "questions", startedAt: OTHER.toISOString(), endedAt: OTHER.toISOString(), durationSeconds: 999 },
        ],
        cardStates: {
          a: card("a", DAY.toISOString()),
          b: card("b", DAY.toISOString()),
          c: card("c", OTHER.toISOString()),
          d: card("d", null),
        },
      },
      KEY,
    );
    expect(d.studiedSeconds).toBe(750);
    expect(d.flashcards).toBe(2);
    expect(d.isEmpty).toBe(false);
  });

  it("reports the best mock of the day, not the last", () => {
    const d = summariseDay(
      { ...empty, mockExams: [mock(31, 64, false, DAY), mock(54, 64, true, DAY), mock(60, 64, true, OTHER)] },
      KEY,
    );
    expect(d.mocks.count).toBe(2);
    expect(d.mocks.bestScore).toBe(54);
    expect(d.mocks.total).toBe(64);
    expect(d.mocks.passed).toBe(1);
  });

  it("compares mocks by ratio, so a mini mock cannot beat a full one on raw score", () => {
    // 14/15 is a better performance than 40/64 even though 40 is the bigger number.
    const d = summariseDay({ ...empty, mockExams: [mock(40, 64, false, DAY), mock(14, 15, true, DAY)] }, KEY);
    expect(d.mocks.bestScore).toBe(14);
    expect(d.mocks.total).toBe(15);
  });

  it("carries the readiness recorded that day", () => {
    const d = summariseDay({ ...empty, readinessHistory: [{ date: KEY, readiness: 68 }] }, KEY);
    expect(d.readiness).toBe(68);
    // A snapshot alone is not activity — it should not make the day look worked.
    expect(d.isEmpty).toBe(true);
  });
});
