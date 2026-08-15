import { describe, expect, it } from "vitest";
import { buildLearnerProfile } from "@/lib/ai/learner-profile";
import { defaultUserState } from "@/lib/store/local-store";
import { QUESTIONS } from "@/lib/content/questions";
import type { CategoryId, QuestionAttempt, UserState } from "@/types";

let seq = 0;
function att(
  categoryId: CategoryId,
  correct: boolean,
  opts: { ms?: number; questionId?: string; selectedIndex?: number } = {},
): QuestionAttempt {
  seq += 1;
  return {
    id: `a${seq}`,
    questionId: opts.questionId ?? `q${seq}`,
    categoryId,
    correct,
    selectedIndex: opts.selectedIndex ?? 0,
    at: new Date(Date.UTC(2026, 6, 1, 0, 0, seq)).toISOString(),
    context: "practice",
    ...(opts.ms !== undefined ? { ms: opts.ms } : {}),
  };
}

const run = (c: CategoryId, correct: boolean, n: number, o = {}) =>
  Array.from({ length: n }, () => att(c, correct, o));

const withState = (attempts: QuestionAttempt[], extra: Partial<UserState> = {}): UserState => ({
  ...defaultUserState(),
  attempts,
  ...extra,
});

describe("learner profile", () => {
  it("stays silent until there's enough signal", () => {
    expect(buildLearnerProfile(withState(run("signs", true, 3)))).toBeNull();
  });

  it("names both the weakest and strongest area", () => {
    const p = buildLearnerProfile(
      withState([...run("signs", false, 8), ...run("rules", true, 8)]),
    )!;
    expect(p).toMatch(/Weakest: Road signs/);
    expect(p).toMatch(/Strongest: Rules of the road/);
  });

  it("reports improvement rather than a flat average", () => {
    // A flat lifetime accuracy hides the one thing worth saying out loud.
    const p = buildLearnerProfile(
      withState([...run("signs", false, 15), ...run("signs", true, 15)]),
    )!;
    expect(p).toMatch(/Improving: \d+% → \d+% recently/);
  });

  it("reports slipping too", () => {
    const p = buildLearnerProfile(
      withState([...run("signs", true, 15), ...run("signs", false, 15)]),
    )!;
    expect(p).toMatch(/Slipping/);
  });

  it("calls out rushing, which is a different problem from not knowing", () => {
    const p = buildLearnerProfile(
      withState([...run("signs", true, 4, { ms: 9000 }), ...run("signs", false, 6, { ms: 900 })]),
    )!;
    expect(p).toMatch(/rushing rather than not knowing/);
  });

  it("does not accuse a slow, careful learner of rushing", () => {
    const p = buildLearnerProfile(
      withState([...run("signs", true, 4, { ms: 9000 }), ...run("signs", false, 6, { ms: 12000 })]),
    )!;
    expect(p).not.toMatch(/rushing/);
  });

  it("hands over recent misses WITH the wrong answer the learner gave", () => {
    // The whole point: "you keep reading yield as stop" beats "you struggle
    // with signs".
    const q = QUESTIONS[0];
    const wrong = (q.correctIndex + 1) % q.options.length;
    const p = buildLearnerProfile(
      withState([
        ...run("rules", true, 5),
        att(q.categoryId, false, { questionId: q.id, selectedIndex: wrong }),
      ]),
      // The pool is a parameter rather than an import, so the clause can only
      // render when it is passed — as the real caller does (tutor-chat.tsx).
      QUESTIONS,
    )!;
    expect(p).toContain("Unresolved mistakes");
    expect(p).toContain(q.options[wrong].slice(0, 30));
  });

  it("includes the test countdown when one is set", () => {
    const testDate = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
    const s = withState(run("signs", true, 6));
    s.onboarding = {
      goal: "learners",
      vehicleCode: "8",
      testDate,
      driversTestDate: null,
      confidence: 3,
      worryCategories: [],
      knowledgeLevel: "some",
      studyFrequency: "steady",
      priorAttempts: 0,
      completedAt: new Date().toISOString(),
    };
    expect(buildLearnerProfile(s)!).toMatch(/Test in \d+ days?\./);
  });

  it("stays within the API's 900-character cap even for a heavy user", () => {
    const s = withState(
      QUESTIONS.slice(0, 60).map((q, i) =>
        att(q.categoryId, false, { questionId: q.id, selectedIndex: (q.correctIndex + 1) % q.options.length, ms: 500 + i }),
      ),
      { streak: { ...defaultUserState().streak, current: 12 } },
    );
    expect(buildLearnerProfile(s)!.length).toBeLessThanOrEqual(900);
  });
});
