import { describe, expect, it } from "vitest";
import { mergeProgress, type RemoteProgress } from "@/lib/supabase/progress";
import { computeReadiness } from "@/lib/diagnostic/scoring";
import { defaultUserState } from "@/lib/store/local-store";
import type { QuestionAttempt, StudySession, UserState } from "@/types";

/**
 * Two defects found from one live account: "Time studied: 0 secs" and a
 * predicted pass of 0% next to 534 answered questions.
 *
 *  - study_sessions was created in 0001 and never wired into the sync, so the
 *    table was empty for every user and durations lived only in localStorage.
 *  - A timed mock seeds its answers with -1 and records every slot at submit,
 *    so questions left blank were written as wrong answers and read back by the
 *    readiness model as demonstrated ignorance. 47% of that account's mock rows
 *    were blanks.
 */

const emptyRemote: RemoteProgress = {
  attempts: [],
  scenarioAttempts: [],
  mockExams: [],
  diagnostics: [],
  cardStates: {},
  sessions: [],
  readinessHistory: [],
};

const session = (id: string, endedAt: string, durationSeconds: number): StudySession => ({
  id,
  type: "questions",
  startedAt: endedAt,
  endedAt,
  durationSeconds,
});

const attempt = (correct: boolean, selectedIndex: number, at: string): QuestionAttempt => ({
  id: `att-${at}-${selectedIndex}`,
  questionId: `q-${at}`,
  categoryId: "signs",
  correct,
  selectedIndex,
  context: "mock",
  at,
});

describe("study sessions survive a new device", () => {
  it("restores server sessions the browser has never seen", () => {
    // The reported bug: hundreds of answered questions, "Time studied: 0 secs",
    // because nothing had ever written to study_sessions.
    const local: UserState = { ...defaultUserState(), sessions: [] };
    const merged = mergeProgress(local, {
      ...emptyRemote,
      sessions: [session("s1", "2026-08-14T10:00:00.000Z", 600)],
    });

    expect(merged.sessions).toHaveLength(1);
    expect(merged.sessions.reduce((n, s) => n + s.durationSeconds, 0)).toBe(600);
  });

  it("unions local and remote without double-counting a re-synced session", () => {
    // Push is idempotent through (user_id, client_id); the merge has to be too,
    // or a re-pull inflates the learner's total time on every sign-in.
    const local: UserState = {
      ...defaultUserState(),
      sessions: [session("s1", "2026-08-14T10:00:00.000Z", 600), session("s2", "2026-08-15T10:00:00.000Z", 300)],
    };
    const merged = mergeProgress(local, {
      ...emptyRemote,
      sessions: [session("s1", "2026-08-14T10:00:00.000Z", 600)],
    });

    expect(merged.sessions.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(merged.sessions.reduce((n, s) => n + s.durationSeconds, 0)).toBe(900);
  });

  it("orders sessions oldest to newest", () => {
    const merged = mergeProgress(defaultUserState(), {
      ...emptyRemote,
      sessions: [
        session("late", "2026-08-15T10:00:00.000Z", 60),
        session("early", "2026-08-13T10:00:00.000Z", 60),
      ],
    });
    expect(merged.sessions.map((s) => s.id)).toEqual(["early", "late"]);
  });
});

describe("blank mock answers are not evidence of what a learner knows", () => {
  const withAttempts = (attempts: QuestionAttempt[]): UserState => ({
    ...defaultUserState(),
    attempts,
  });

  it("ignores unanswered questions when estimating competence", () => {
    // Ten answered, eight right. The five blanks must not turn 80% into 53%.
    const answered = Array.from({ length: 10 }, (_, i) =>
      attempt(i < 8, i % 4, `2026-08-15T10:00:${String(i).padStart(2, "0")}.000Z`),
    );
    const blanks = Array.from({ length: 5 }, (_, i) =>
      attempt(false, -1, `2026-08-15T11:00:${String(i).padStart(2, "0")}.000Z`),
    );

    const clean = computeReadiness(withAttempts(answered));
    const withBlanks = computeReadiness(withAttempts([...answered, ...blanks]));

    expect(withBlanks.perCategory.signs).toBe(clean.perCategory.signs);
    expect(withBlanks.passProbability).toBe(clean.passProbability);
  });

  it("still counts a wrong answer the learner actually gave", () => {
    // The fix keys on "no option chosen", not on "got it wrong" — a real wrong
    // answer is exactly the signal the model is built to read.
    const allRight = Array.from({ length: 10 }, (_, i) =>
      attempt(true, 0, `2026-08-15T10:00:${String(i).padStart(2, "0")}.000Z`),
    );
    const halfWrong = allRight.map((a, i) => (i < 5 ? { ...a, correct: false } : a));

    expect(computeReadiness(withAttempts(halfWrong)).perCategory.signs).toBeLessThan(
      computeReadiness(withAttempts(allRight)).perCategory.signs,
    );
  });

  it("treats a category of nothing but blanks as unstudied, not as failed", () => {
    // Abandoning a mock said "you know nothing about signs". It says nothing.
    const onlyBlanks = Array.from({ length: 6 }, (_, i) =>
      attempt(false, -1, `2026-08-15T10:00:${String(i).padStart(2, "0")}.000Z`),
    );
    const untouched = computeReadiness(defaultUserState());
    expect(computeReadiness(withAttempts(onlyBlanks)).perCategory.signs).toBe(
      untouched.perCategory.signs,
    );
  });
});
