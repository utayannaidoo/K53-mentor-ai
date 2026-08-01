import { describe, expect, it } from "vitest";
import { isCramWindow, daysUntilTest, cramQueue, CRAM_WINDOW_DAYS } from "@/lib/learning/cram";
import { defaultUserState } from "@/lib/store/local-store";
import { CATEGORY_WEIGHTS } from "@/lib/diagnostic/scoring";
import { QUESTIONS } from "@/lib/content/questions";
import type { CategoryId, QuestionAttempt, UserState } from "@/types";

const NOW = new Date("2026-07-10T09:00:00Z");
const inDays = (n: number) => new Date(NOW.getTime() + n * 86_400_000).toISOString().slice(0, 10);

function withTest(testDate: string | null, attempts: QuestionAttempt[] = []): UserState {
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

let seq = 0;
function wrong(questionId: string, categoryId: CategoryId): QuestionAttempt {
  seq += 1;
  return {
    id: `a${seq}`,
    questionId,
    categoryId,
    correct: false,
    selectedIndex: 0,
    at: "2026-07-08T09:00:00.000Z",
    context: "practice",
  };
}

describe("cram window", () => {
  it("opens only in the final stretch", () => {
    expect(isCramWindow(withTest(inDays(7)), NOW)).toBe(false);
    expect(isCramWindow(withTest(inDays(CRAM_WINDOW_DAYS)), NOW)).toBe(true);
    expect(isCramWindow(withTest(inDays(1)), NOW)).toBe(true);
    expect(isCramWindow(withTest(inDays(0)), NOW)).toBe(true);
  });

  it("closes once the test has passed — no cramming for an exam you've sat", () => {
    expect(isCramWindow(withTest(inDays(-1)), NOW)).toBe(false);
  });

  it("stays shut for a learner with no test booked", () => {
    expect(isCramWindow(withTest(null), NOW)).toBe(false);
    expect(daysUntilTest(withTest(null), NOW)).toBeNull();
  });
});

describe("cram queue", () => {
  const pool = QUESTIONS.filter((q) => q.scope === "learners");
  const pick = (cat: CategoryId) => pool.find((q) => q.categoryId === cat)!;

  it("puts the heaviest-weighted sections first", () => {
    // Signs and rules carry 56 of the 64 marks; a shaky parking question is not
    // where the last hour before the test goes.
    const parking = pick("parking");
    const signs = pick("signs");
    const rules = pick("rules");
    expect(CATEGORY_WEIGHTS.signs).toBeGreaterThan(CATEGORY_WEIGHTS.parking);

    const state = withTest(inDays(1), [
      wrong(parking.id, "parking"),
      wrong(signs.id, "signs"),
      wrong(rules.id, "rules"),
    ]);
    const queue = cramQueue(state, pool, 10);
    expect(queue[queue.length - 1].id).toBe(parking.id);
    expect(queue.slice(0, 2).map((q) => q.id)).toContain(signs.id);
  });

  it("serves only unresolved mistakes — no new material on test eve", () => {
    const signs = pick("signs");
    const state = withTest(inDays(1), [wrong(signs.id, "signs")]);
    const queue = cramQueue(state, pool, 12);
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe(signs.id);
  });

  it("ignores the once-a-day spacing rule — drilling twice today is correct now", () => {
    const signs = pick("signs");
    const state = withTest(inDays(0), [
      { ...wrong(signs.id, "signs"), at: new Date().toISOString() },
    ]);
    // dueMistakes would hold this back as "already answered today"; cram does not.
    expect(cramQueue(state, pool, 12).map((q) => q.id)).toEqual([signs.id]);
  });

  it("returns nothing when there is nothing left to fix", () => {
    expect(cramQueue(withTest(inDays(1)), pool, 12)).toEqual([]);
  });
});
