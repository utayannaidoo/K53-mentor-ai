import { describe, expect, it } from "vitest";
import { buildTutorOpener } from "@/lib/ai/tutor-opener";
import { defaultUserState } from "@/lib/store/local-store";
import { QUESTIONS } from "@/lib/content/questions";
import type { CategoryId, QuestionAttempt, UserState } from "@/types";

const NOW = new Date("2026-07-10T09:00:00Z");
const inDays = (n: number) => new Date(NOW.getTime() + n * 86_400_000).toISOString().slice(0, 10);

/** The opener takes the learner's pool, exactly as the tutor page passes it. */
const POOL = QUESTIONS;

let seq = 0;
function wrong(questionId: string, categoryId: CategoryId, chose = 0): QuestionAttempt {
  seq += 1;
  return {
    id: `a${seq}`,
    questionId,
    categoryId,
    correct: false,
    selectedIndex: chose,
    at: `2026-07-0${(seq % 8) + 1}T09:00:00.000Z`,
    context: "practice",
  };
}

function state(attempts: QuestionAttempt[], testDate: string | null = null): UserState {
  const s = defaultUserState();
  s.attempts = attempts;
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
    completedAt: "2026-07-01T09:00:00.000Z",
  };
  return s;
}

const signsQs = QUESTIONS.filter((q) => q.categoryId === "signs").slice(0, 4);

describe("tutor opener", () => {
  it("says nothing when there is nothing specific to say", () => {
    // An opener that fires on every visit with nothing behind it is noise.
    expect(buildTutorOpener(state([]), POOL, NOW)).toBeNull();
  });

  it("leads with the test when it's imminent", () => {
    const s = state([wrong(signsQs[0].id, "signs")], inDays(1));
    const opener = buildTutorOpener(s, POOL, NOW)!;
    expect(opener.line).toMatch(/test is tomorrow/i);
    expect(opener.prompt.length).toBeGreaterThan(10);
  });

  it("names a repeated pattern rather than a single slip", () => {
    const s = state(signsQs.slice(0, 3).map((q) => wrong(q.id, "signs")));
    const opener = buildTutorOpener(s, POOL, NOW)!;
    expect(opener.line).toMatch(/3 unresolved road signs questions/i);
    expect(opener.line).toMatch(/one idea being misread/i);
  });

  it("quotes the answer actually given on a stubborn question", () => {
    const q = signsQs[0];
    const chose = (q.correctIndex + 1) % q.options.length;
    const s = state([wrong(q.id, "signs", chose), wrong(q.id, "signs", chose)]);
    const opener = buildTutorOpener(s, POOL, NOW)!;
    expect(opener.line).toContain(q.options[chose]);
    expect(opener.prompt).toContain(q.options[chose]);
  });

  it("stays quiet for a single first-time miss — that's not a pattern", () => {
    expect(buildTutorOpener(state([wrong(signsQs[0].id, "signs")]), POOL, NOW)).toBeNull();
  });

  it("says nothing once the mistakes are resolved", () => {
    const q = signsQs[0];
    const s = state([
      wrong(q.id, "signs"),
      { ...wrong(q.id, "signs"), correct: true, at: "2026-07-08T09:00:00.000Z" },
      { ...wrong(q.id, "signs"), correct: true, at: "2026-07-09T09:00:00.000Z" },
    ]);
    expect(buildTutorOpener(s, POOL, NOW)).toBeNull();
  });

  it("stays quiet when the pool can't resolve the questions", () => {
    // A free learner on the starter pack may have missed questions that aren't
    // in their pool. Better silence than an opener quoting nothing.
    const s = state(signsQs.slice(0, 3).map((q) => wrong(q.id, "signs")));
    const opener = buildTutorOpener(s, [], NOW);
    // The category-pattern branch needs no question text, so it still speaks —
    // but the stubborn-question branch, which quotes an option, must not.
    if (opener) expect(opener.line).toMatch(/unresolved road signs questions/i);
  });
});
