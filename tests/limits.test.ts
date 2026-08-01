import { describe, expect, it } from "vitest";
import { mocksRemaining } from "@/lib/plan";
import { poolRemaining, trialExhausted, trialDaysRemaining } from "@/lib/billing/trial";
import { defaultUserState, todayKey } from "@/lib/store/local-store";
import type { MockExamAttempt, UserState } from "@/types";

function mock(at: string, mini = false): MockExamAttempt {
  return {
    id: `m_${at}_${mini}`,
    at,
    score: 12,
    total: mini ? 15 : 64,
    passed: true,
    perCategory: {},
    durationSeconds: 600,
    mini,
  };
}

const TODAY = `${todayKey()}T10:00:00.000Z`;
const LAST_WEEK = "2026-07-01T10:00:00.000Z";

/** Onboarding stamped now, so the free trial week is open in these fixtures. */
const ONBOARDED = {
  goal: "learners" as const,
  vehicleCode: "8" as const,
  testDate: null,
  driversTestDate: null,
  confidence: 3 as const,
  worryCategories: [],
  knowledgeLevel: "some" as const,
  studyFrequency: "steady" as const,
  priorAttempts: 0,
  completedAt: new Date().toISOString(),
};

describe("mocksRemaining", () => {
  it("free: full mocks are locked outright", () => {
    const s = defaultUserState();
    expect(mocksRemaining(s, "full")).toBe(0);
  });

  it("free: one mini mock a day during the trial week — last week's doesn't count", () => {
    const s = defaultUserState();
    expect(mocksRemaining(s, "mini")).toBe(1);
    s.mockExams = [mock(LAST_WEEK, true)];
    expect(mocksRemaining(s, "mini")).toBe(1); // refills daily, unlike the old lifetime pool
    s.mockExams = [mock(TODAY, true)];
    expect(mocksRemaining(s, "mini")).toBe(0); // today's is spent
  });

  it("free: nothing left once the trial week has elapsed", () => {
    const s = defaultUserState();
    s.onboarding = { ...ONBOARDED, completedAt: "2026-01-01T10:00:00.000Z" };
    expect(mocksRemaining(s, "mini")).toBe(0);
  });

  it("premium: 3 full + 5 mini per day, resetting daily", () => {
    const s: UserState = { ...defaultUserState(), tier: "premium" };
    s.mockExams = [mock(TODAY), mock(TODAY), mock(LAST_WEEK), mock(TODAY, true)];
    expect(mocksRemaining(s, "full")).toBe(1); // 2 today of 3 (old one ignored)
    expect(mocksRemaining(s, "mini")).toBe(4); // 1 today of 5
  });

  it("premium_plus: unlimited", () => {
    const s: UserState = { ...defaultUserState(), tier: "premium_plus" };
    s.mockExams = Array.from({ length: 20 }, () => mock(TODAY));
    expect(mocksRemaining(s, "full")).toBe(Infinity);
    expect(mocksRemaining(s, "mini")).toBe(Infinity);
  });
});

describe("free trial — daily allowances across a 7-day window", () => {
  function withUsage(questions: number, flashcards: number, tutor: number): UserState {
    const s = defaultUserState();
    s.onboarding = { ...ONBOARDED };
    s.dailyUsage = {
      [todayKey()]: { date: todayKey(), questions, flashcards, tutor, scenarios: 0 },
    };
    return s;
  }

  it("spending a pool empties it for today only — the others are untouched", () => {
    const s = withUsage(10, 0, 0);
    expect(poolRemaining(s, "questions")).toBe(0);
    expect(poolRemaining(s, "flashcards")).toBe(10);
    expect(poolRemaining(s, "tutor")).toBe(2);
  });

  it("spending every pool is NOT the end of the trial — it refills tomorrow", () => {
    // The whole point of the change: hitting today's cap must not read as a
    // permanent wall, or the daily habit never forms.
    const s = withUsage(10, 10, 2);
    expect(trialExhausted(s)).toBe(false);
    expect(trialDaysRemaining(s)).toBe(7);
  });

  it("yesterday's usage doesn't count against today", () => {
    const s = withUsage(0, 0, 0);
    s.dailyUsage = {
      "2026-07-01": { date: "2026-07-01", questions: 10, flashcards: 10, tutor: 2, scenarios: 0 },
    };
    expect(poolRemaining(s, "questions")).toBe(10);
  });

  it("the trial ends when the week elapses, whatever is left unspent", () => {
    const s = withUsage(0, 0, 0);
    s.onboarding = { ...ONBOARDED, completedAt: "2026-01-01T10:00:00.000Z" };
    expect(trialDaysRemaining(s)).toBe(0);
    expect(trialExhausted(s)).toBe(true);
    expect(poolRemaining(s, "questions")).toBe(0);
  });

  it("counts down day by day", () => {
    const s = withUsage(0, 0, 0);
    const start = Date.parse(ONBOARDED.completedAt);
    expect(trialDaysRemaining(s, start + 0)).toBe(7);
    expect(trialDaysRemaining(s, start + 3 * 86_400_000)).toBe(4);
    expect(trialDaysRemaining(s, start + 7 * 86_400_000)).toBe(0);
  });

  it("never expires a learner we can't date — no anchor means a full week", () => {
    const s = defaultUserState(); // no onboarding, no diagnostic, no profile
    expect(trialDaysRemaining(s)).toBe(7);
    expect(trialExhausted(s)).toBe(false);
  });

  it("paid tiers are never trial-exhausted", () => {
    const s = { ...withUsage(10, 10, 2), tier: "premium" as const };
    expect(trialExhausted(s)).toBe(false);
    expect(trialDaysRemaining(s)).toBe(Infinity);
  });
});
