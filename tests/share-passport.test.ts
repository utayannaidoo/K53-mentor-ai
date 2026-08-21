import { describe, expect, it } from "vitest";
import { buildPassport, formatCount, passportMessage } from "@/lib/share/passport";
import { computeReadiness } from "@/lib/diagnostic/scoring";
import { defaultUserState } from "@/lib/store/local-store";
import { LICENCE_RANK_INDEX } from "@/lib/engagement";
// The domain is derived from NEXT_PUBLIC_SITE_URL, which is unset under test —
// asserting the production host here would only prove the env var's default.
import { SITE_DOMAIN } from "@/lib/constants";
import type { CategoryId, MockExamAttempt, QuestionAttempt, UserState } from "@/types";

const NOW = new Date("2026-08-17T10:00:00.000Z");

function stateWith(patch: Partial<UserState>): UserState {
  return { ...defaultUserState(), ...patch };
}

function attempts(n: number, correct: boolean, categoryId: CategoryId = "signs"): QuestionAttempt[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `att-${categoryId}-${i}`,
    at: new Date(NOW.getTime() - i * 3_600_000).toISOString(),
    questionId: `q-${categoryId}-${i}`,
    categoryId,
    correct,
    selectedIndex: 0,
    context: "practice" as const,
  }));
}

function mock(patch: Partial<MockExamAttempt> = {}): MockExamAttempt {
  return {
    id: "mock-1",
    at: NOW.toISOString(),
    score: 58,
    total: 64,
    passed: true,
    perCategory: {},
    durationSeconds: 1800,
    ...patch,
  };
}

/** Every category answered correctly `correct` times out of `total`. */
function spread(correct: number, total: number): QuestionAttempt[] {
  const categories: CategoryId[] = [
    "signs",
    "rules",
    "controls",
    "intersections",
    "parking",
    "following_distance",
    "hazard_awareness",
  ];
  return categories.flatMap((c) => [
    ...attempts(correct, true, c),
    ...attempts(total - correct, false, c).map((a, i) => ({ ...a, id: `wrong-${c}-${i}`, questionId: `qw-${c}-${i}` })),
  ]);
}

function build(state: UserState, referralCode: string | null = null) {
  return buildPassport(state, computeReadiness(state), { referralCode, now: NOW });
}

describe("Driving Passport — the numbers", () => {
  it("counts only answered questions, so mock blanks can't inflate the receipts", () => {
    const answered = attempts(6, true);
    const blanks = attempts(4, false).map((a, i) => ({
      ...a,
      id: `blank-${i}`,
      questionId: `qb-${i}`,
      selectedIndex: -1,
      context: "mock" as const,
    }));
    const p = build(stateWith({ attempts: [...answered, ...blanks] }));
    expect(p.work.questions).toBe(6);
  });

  it("counts a flashcard once however often it was reviewed, and only once studied", () => {
    const p = build(
      stateWith({
        cardStates: {
          a: { cardId: "a", reps: 9, lapses: 0, ease: 2.5, intervalDays: 20, due: "", lastReviewed: null, mastery: 80 },
          b: { cardId: "b", reps: 0, lapses: 2, ease: 2.5, intervalDays: 1, due: "", lastReviewed: null, mastery: 10 },
          c: { cardId: "c", reps: 0, lapses: 0, ease: 2.5, intervalDays: 0, due: "", lastReviewed: null, mastery: 0 },
        },
      }),
    );
    expect(p.work.cards).toBe(2);
  });

  it("counts every mock in the receipts but only a full one can claim a pass", () => {
    const p = build(
      stateWith({ mockExams: [mock({ id: "m1", mini: true, score: 14, total: 15 }), mock({ id: "m2" })] }),
    );
    expect(p.work.mocks).toBe(2);
    expect(p.bestMock).toEqual({ score: 58, total: 64, passed: true });
  });

  it("takes the best full mock by ratio, not by raw score", () => {
    const p = build(
      stateWith({
        mockExams: [
          mock({ id: "m1", score: 40, total: 64, passed: false }),
          mock({ id: "m2", score: 30, total: 32, passed: true }),
        ],
      }),
    );
    expect(p.bestMock).toEqual({ score: 30, total: 32, passed: true });
  });

  it("keeps the skyline in category order with each section's own pass mark", () => {
    const p = build(stateWith({ attempts: spread(9, 10) }));
    expect(p.bars.map((b) => b.id)).toEqual([
      "signs",
      "rules",
      "controls",
      "intersections",
      "parking",
      "following_distance",
      "hazard_awareness",
    ]);
    // Signs is judged against 23/28; rules against 22/28. A single bar height
    // means different things in those two columns, which is the whole point of
    // drawing the mark.
    expect(p.bars.find((b) => b.id === "signs")!.required).toBe(82);
    expect(p.bars.find((b) => b.id === "rules")!.required).toBe(79);
  });
});

describe("Driving Passport — the claim", () => {
  it("never leads with a low readiness when a streak is the better true thing", () => {
    const p = build(
      stateWith({
        streak: { current: 6, longest: 6, lastStudyDate: "2026-08-17", freezesRemaining: 1, freezeRefreshedWeek: null, regainsUsed: 0 },
      }),
    );
    expect(p.hero.label).toBe("DAY STREAK");
    expect(p.hero.value).toBe("6");
    // …and the numbers it passed over are still on the card.
    expect(p.qualifier).toContain("Readiness");
    expect(p.qualifier).toContain("Predicted pass");
  });

  it("leads with readiness once there is real competence behind it", () => {
    // 70% everywhere: a respectable readiness, and a predicted pass still in the
    // teens because signs alone needs 23 of 28. Readiness is the honest lead.
    const p = build(stateWith({ attempts: spread(7, 10) }));
    expect(p.passProbability).toBeLessThan(60);
    expect(p.hero.label).toBe("TEST READINESS");
    expect(p.hero.unit).toBe("%");
    expect(Number(p.hero.value)).toBe(p.readiness);
    expect(p.qualifier).not.toContain("Readiness");
  });

  it("promotes predicted pass to the hero only when it clears 60", () => {
    const strong = build(stateWith({ attempts: spread(10, 10) }));
    expect(strong.passProbability).toBeGreaterThanOrEqual(60);
    expect(strong.hero.label).toBe("PREDICTED PASS");
    expect(strong.qualifier).toContain("Readiness");
  });

  it("stamps a passed full mock and says so in the headline", () => {
    const p = build(stateWith({ attempts: spread(8, 10), mockExams: [mock()] }));
    expect(p.stamp).toEqual({ title: "PASSED", detail: "58/64 MOCK", tone: "success" });
    expect(p.headline).toBe("Passed a full 64-question mock exam.");
  });

  it("does not stamp a failed mock", () => {
    const p = build(stateWith({ mockExams: [mock({ passed: false, score: 30 })] }));
    expect(p.stamp).toBeNull();
  });

  it("goes gold for the licence, which no in-app number can reach", () => {
    const p = build(stateWith({ rankAchieved: LICENCE_RANK_INDEX }));
    expect(p.hero).toMatchObject({ tone: "gold", value: "★", pct: 100 });
    expect(p.stamp?.title).toBe("LICENSED");
    expect(p.rank).toBe("LICENCE ACHIEVED");
  });

  it("prints the licence code the way the real card does", () => {
    const car = build(stateWith({}));
    expect(car.code).toBe("08");
    const bike = build(
      stateWith({
        onboarding: {
          goal: "learners",
          vehicleCode: "A",
          testDate: null,
          driversTestDate: null,
          confidence: 3,
          worryCategories: [],
          knowledgeLevel: "beginner",
          studyFrequency: "steady",
          priorAttempts: 0,
          completedAt: NOW.toISOString(),
        },
      }),
    );
    expect(bike.code).toBe("A");
  });
});

describe("Driving Passport — the message", () => {
  it("carries the invite link, the receipts and a bar whose colour is the verdict", () => {
    const p = build(stateWith({ attempts: spread(10, 10), mockExams: [mock()] }), "AB12");
    const text = passportMessage(p);

    expect(text).toContain(`${SITE_DOMAIN}/signup?ref=AB12`);
    expect(text).toContain(`${formatCount(p.work.questions)} questions`);
    expect(text).toContain("Best mock: 58/64 ✅");
    expect(text).toContain("🟩");
    // Short enough that a WhatsApp group reads it without expanding.
    expect(text.split("\n").length).toBeLessThanOrEqual(11);
  });

  it("never states the hero's own figure twice", () => {
    const readinessLed = build(stateWith({ attempts: spread(7, 10) }));
    expect(readinessLed.hero.label).toBe("TEST READINESS");
    const text = passportMessage(readinessLed);
    expect(text).toContain(`Test readiness: ${readinessLed.readiness}%`);
    expect(text).not.toContain(`Readiness ${readinessLed.readiness}%`);
    expect(text).toContain("Predicted pass");
  });

  it("falls back to the bare domain when there is no referral code", () => {
    const p = build(stateWith({}));
    expect(p.referralCode).toBeNull();
    expect(passportMessage(p)).toContain(SITE_DOMAIN);
    expect(passportMessage(p)).not.toContain("?ref=");
  });

  it("drops the mock line entirely rather than printing a zero", () => {
    const text = passportMessage(build(stateWith({})));
    expect(text).not.toContain("Best mock");
    expect(text).toContain("0 mocks");
  });

  it("spaces thousands the way South Africa writes them", () => {
    expect(formatCount(1240)).toBe("1 240");
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1000000)).toBe("1 000 000");
  });
});
