import { describe, expect, it } from "vitest";
import { mocksRemaining } from "@/lib/plan";
import { poolRemaining, trialExhausted } from "@/lib/billing/trial";
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

describe("mocksRemaining", () => {
  it("free: full mocks are locked outright", () => {
    const s = defaultUserState();
    expect(mocksRemaining(s, "full")).toBe(0);
  });

  it("free: exactly one mini mock, lifetime — an old mini still counts", () => {
    const s = defaultUserState();
    expect(mocksRemaining(s, "mini")).toBe(1);
    s.mockExams = [mock(LAST_WEEK, true)];
    expect(mocksRemaining(s, "mini")).toBe(0); // lifetime, no daily reset
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

describe("trialExhausted — only when EVERY pool is spent", () => {
  function withUsage(questions: number, flashcards: number, tutor: number): UserState {
    const s = defaultUserState();
    s.dailyUsage = {
      [todayKey()]: { date: todayKey(), questions, flashcards, tutor, scenarios: 0 },
    };
    return s;
  }

  it("questions used up alone is NOT trial-done", () => {
    const s = withUsage(15, 0, 0);
    expect(poolRemaining(s, "questions")).toBe(0);
    expect(poolRemaining(s, "flashcards")).toBe(12);
    expect(trialExhausted(s)).toBe(false);
  });

  it("all three pools spent IS trial-done", () => {
    expect(trialExhausted(withUsage(15, 12, 3))).toBe(true);
  });

  it("paid tiers are never trial-exhausted", () => {
    const s = { ...withUsage(15, 12, 3), tier: "premium" as const };
    expect(trialExhausted(s)).toBe(false);
  });
});
