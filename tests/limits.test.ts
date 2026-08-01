import { describe, expect, it } from "vitest";
import { mocksRemaining } from "@/lib/plan";
import { poolRemaining, trialDaysRemaining, trialExhausted } from "@/lib/billing/trial";
import { FREE_TRIAL_DAYS, PLAN_MAP } from "@/lib/billing/plans";
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

/** A free account whose week started `daysAgo` days ago. */
function startedDaysAgo(daysAgo: number): UserState {
  const at = new Date(Date.now() - daysAgo * 86_400_000).toISOString();
  return {
    ...defaultUserState(),
    onboarding: {
      goal: "learners",
      vehicleCode: "8",
      testDate: null,
      driversTestDate: null,
      confidence: 3,
      worryCategories: [],
      knowledgeLevel: "some",
      studyFrequency: "steady",
      priorAttempts: 0,
      completedAt: at,
    },
  };
}

describe("mocksRemaining", () => {
  it("free: full mocks are locked outright", () => {
    expect(mocksRemaining(defaultUserState(), "full")).toBe(0);
  });

  it("free: one mini mock a day, refilling — an old one no longer counts", () => {
    const s = startedDaysAgo(1);
    expect(mocksRemaining(s, "mini")).toBe(1);
    s.mockExams = [mock(LAST_WEEK, true)];
    expect(mocksRemaining(s, "mini")).toBe(1); // last week's doesn't spend today's
    s.mockExams = [mock(TODAY, true)];
    expect(mocksRemaining(s, "mini")).toBe(0);
  });

  it("free: nothing is left once the week is up", () => {
    expect(mocksRemaining(startedDaysAgo(FREE_TRIAL_DAYS + 1), "mini")).toBe(0);
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

describe("the free week", () => {
  function withUsage(state: UserState, questions: number, flashcards: number, tutor: number) {
    return {
      ...state,
      dailyUsage: {
        [todayKey()]: { date: todayKey(), questions, flashcards, tutor, scenarios: 0 },
      },
    };
  }

  it("counts down from seven and stops at zero", () => {
    expect(trialDaysRemaining(startedDaysAgo(0))).toBe(FREE_TRIAL_DAYS);
    expect(trialDaysRemaining(startedDaysAgo(3))).toBe(FREE_TRIAL_DAYS - 3);
    expect(trialDaysRemaining(startedDaysAgo(FREE_TRIAL_DAYS))).toBe(0);
    expect(trialDaysRemaining(startedDaysAgo(90))).toBe(0);
  });

  it("never walls a learner it can't date — an unanchored account gets the full week", () => {
    // Fresh device, wizard not finished: there is nothing to measure from, and
    // guessing "expired" would lock someone out of a product they just opened.
    expect(trialDaysRemaining(defaultUserState())).toBe(FREE_TRIAL_DAYS);
    expect(trialExhausted(defaultUserState())).toBe(false);
  });

  it("spending today's allowance is NOT the end of the trial", () => {
    // The whole point of the change: a daily cap must not read as a permanent
    // wall, or the learner churns on day one.
    const caps = PLAN_MAP.free.caps;
    const spent = withUsage(
      startedDaysAgo(1),
      caps.questionsPerDay,
      caps.flashcardsPerDay,
      caps.tutorPerDay,
    );
    expect(poolRemaining(spent, "questions")).toBe(0);
    expect(poolRemaining(spent, "flashcards")).toBe(0);
    expect(trialExhausted(spent)).toBe(false);
    expect(trialDaysRemaining(spent)).toBeGreaterThan(0);
  });

  it("the allowance is full again tomorrow", () => {
    const caps = PLAN_MAP.free.caps;
    // Usage is keyed by day, so a new day simply has no entry to count.
    const yesterdayOnly: UserState = {
      ...startedDaysAgo(1),
      dailyUsage: {
        "2026-07-01": {
          date: "2026-07-01",
          questions: caps.questionsPerDay,
          flashcards: caps.flashcardsPerDay,
          tutor: caps.tutorPerDay,
          scenarios: 0,
        },
      },
    };
    expect(poolRemaining(yesterdayOnly, "questions")).toBe(caps.questionsPerDay);
  });

  it("running out of days IS the end, whatever today's usage says", () => {
    const expired = startedDaysAgo(FREE_TRIAL_DAYS + 1);
    expect(trialExhausted(expired)).toBe(true);
    expect(poolRemaining(expired, "questions")).toBe(0);
    expect(poolRemaining(expired, "flashcards")).toBe(0);
    expect(poolRemaining(expired, "tutor")).toBe(0);
  });

  it("paid tiers are never on a clock", () => {
    const s: UserState = { ...startedDaysAgo(400), tier: "premium" };
    expect(trialDaysRemaining(s)).toBe(Infinity);
    expect(trialExhausted(s)).toBe(false);
    expect(poolRemaining(s, "questions")).toBeGreaterThan(0);
  });
});
