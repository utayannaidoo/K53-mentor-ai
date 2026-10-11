import { describe, expect, it } from "vitest";
import { drillsRemaining, mocksRemaining } from "@/lib/plan";
import { dailyCap } from "@/lib/billing/plans";
import { defaultUserState, todayKey } from "@/lib/store/local-store";
import type { MockExamAttempt, SubscriptionTier, UserState } from "@/types";

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
const TIERS: SubscriptionTier[] = ["free", "premium", "premium_plus"];

/**
 * The free tier is paid for by ads, not by a trial clock or daily caps. These
 * pin that: no amount of studying, and no account age, takes study away from
 * anyone. The AI tutor is the one pool with a real number.
 */
describe("study is unmetered on every plan", () => {
  it.each(TIERS)("%s: mocks, mini mocks and drills never run out", (tier) => {
    const s: UserState = { ...defaultUserState(), tier };
    s.mockExams = [
      ...Array.from({ length: 20 }, () => mock(TODAY)),
      ...Array.from({ length: 20 }, () => mock(TODAY, true)),
    ];
    expect(mocksRemaining(s, "full")).toBe(Infinity);
    expect(mocksRemaining(s, "mini")).toBe(Infinity);
    expect(drillsRemaining(s)).toBe(Infinity);
  });

  it.each(TIERS)("%s: questions and flashcards have no daily cap", (tier) => {
    expect(dailyCap(tier, "questionsPerDay")).toBe(Infinity);
    expect(dailyCap(tier, "flashcardsPerDay")).toBe(Infinity);
  });

  it("a free account from long ago is not walled off — there is no clock", () => {
    const old = new Date(Date.now() - 400 * 86_400_000).toISOString();
    const s: UserState = {
      ...defaultUserState(),
      profile: { id: "u", name: "Learner", email: "l@example.com", createdAt: old },
    };
    expect(mocksRemaining(s, "full")).toBe(Infinity);
  });
});

describe("the AI tutor is the paid pool", () => {
  it("free has no tutor messages; paid plans have a daily number", () => {
    expect(dailyCap("free", "tutorPerDay")).toBe(0);
    expect(dailyCap("premium", "tutorPerDay")).toBeGreaterThan(0);
    expect(dailyCap("premium_plus", "tutorPerDay")).toBeGreaterThan(dailyCap("premium", "tutorPerDay"));
  });
});
