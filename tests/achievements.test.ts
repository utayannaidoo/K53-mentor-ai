import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_BY_ID,
  achievementInputs,
  achievementViews,
  evaluateAchievements,
  nextUpAchievement,
  tierFor,
  type AchievementInputs,
} from "@/lib/achievements";
import { defaultUserState } from "@/lib/store/local-store";
import { MASTERY_STAMP_AT } from "@/lib/engagement";
import { CATEGORIES } from "@/lib/content/categories";
import type { CategoryId, UserState } from "@/types";

const ZERO: AchievementInputs = {
  fullMocksPassed: 0,
  mocksTaken: 0,
  stamped: 0,
  longestStreak: 0,
  answered: 0,
  perfectSections: 0,
  hardFirstTry: 0,
  longRecall: 0,
  clearSlates: 0,
  comebacks: 0,
  scenariosCorrect: 0,
  categoriesTouched: 0,
  licensed: 0,
};

function emptyPerCategory(): Record<CategoryId, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<CategoryId, number>;
}

describe("the achievement catalogue", () => {
  it("gives every achievement at least one tier, in ascending order", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.tiers.length, `${a.id} has no tiers`).toBeGreaterThan(0);
      const thresholds = a.tiers.map((t) => t.threshold);
      expect(thresholds, `${a.id} tiers are not ascending`).toEqual([...thresholds].sort((x, y) => x - y));
      for (const t of a.tiers) {
        expect(t.name.length, `${a.id} has an unnamed tier`).toBeGreaterThan(0);
      }
    }
  });

  it("has unique ids, and indexes every one of them", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(ACHIEVEMENT_BY_ID[id]).toBeDefined();
  });

  it("measures every achievement — an unmeasured one can never be earned", () => {
    // Everything at once: anything that stays locked here has no measure wired.
    const saturated: AchievementInputs = {
      fullMocksPassed: 999,
      mocksTaken: 999,
      stamped: 999,
      longestStreak: 999,
      answered: 99_999,
      perfectSections: 999,
      hardFirstTry: 999,
      longRecall: 999,
      clearSlates: 999,
      comebacks: 999,
      scenariosCorrect: 999,
      categoriesTouched: 999,
      licensed: 1,
    };
    const { next } = evaluateAchievements(saturated, {});
    for (const a of ACHIEVEMENTS) {
      expect(next[a.id], `${a.id} is never earned`).toBe(a.tiers.length - 1);
    }
  });
});

describe("tierFor", () => {
  const streak = ACHIEVEMENT_BY_ID.streak;

  it("is -1 below the first threshold", () => {
    expect(tierFor(streak, 0)).toBe(-1);
    expect(tierFor(streak, 2)).toBe(-1);
  });

  it("returns the highest tier cleared", () => {
    expect(tierFor(streak, 3)).toBe(0);
    expect(tierFor(streak, 13)).toBe(1);
    expect(tierFor(streak, 30)).toBe(3);
    expect(tierFor(streak, 400)).toBe(3);
  });
});

describe("evaluateAchievements", () => {
  it("reports only newly cleared tiers", () => {
    const first = evaluateAchievements({ ...ZERO, longestStreak: 3 }, {});
    expect(first.newly).toEqual([{ id: "streak", tier: 0 }]);

    const again = evaluateAchievements({ ...ZERO, longestStreak: 5 }, first.next);
    expect(again.newly).toEqual([]);

    const up = evaluateAchievements({ ...ZERO, longestStreak: 7 }, first.next);
    expect(up.newly).toEqual([{ id: "streak", tier: 1 }]);
  });

  it("returns the same object when nothing changed, so callers can skip a write", () => {
    const earned = { streak: 0 };
    expect(evaluateAchievements({ ...ZERO, longestStreak: 3 }, earned).next).toBe(earned);
  });

  it("never revokes a tier when competence dips", () => {
    // The whole reason achievements are banked rather than derived: a mastery
    // stamp un-earns itself when perCategory drops, and a record must not.
    const earned = evaluateAchievements({ ...ZERO, stamped: 6 }, {}).next;
    expect(earned.stamps).toBe(2);

    const afterDip = evaluateAchievements({ ...ZERO, stamped: 0 }, earned);
    expect(afterDip.next.stamps).toBe(2);
    expect(afterDip.newly).toEqual([]);
  });

  it("grants the licence achievement only when it is handed over", () => {
    expect(evaluateAchievements({ ...ZERO }, {}).next.licensed).toBeUndefined();
    expect(evaluateAchievements({ ...ZERO, licensed: 1 }, {}).next.licensed).toBe(0);
  });
});

describe("achievementInputs", () => {
  function stateWith(patch: Partial<UserState>): UserState {
    return { ...defaultUserState(), ...patch };
  }

  it("ignores blank mock slots when counting answered questions", () => {
    const state = stateWith({
      attempts: [
        { id: "1", questionId: "q1", categoryId: "signs", correct: true, selectedIndex: 0, at: "2026-01-01T09:00:00.000Z", context: "practice" },
        { id: "2", questionId: "q2", categoryId: "signs", correct: false, selectedIndex: -1, at: "2026-01-01T09:01:00.000Z", context: "mock" },
      ],
    });
    expect(achievementInputs(state, emptyPerCategory()).answered).toBe(1);
  });

  it("counts a hard question only on its first ever attempt", () => {
    // q_sign_ped_priority is difficulty 3 in the content index.
    const at = (n: number) => `2026-01-0${n}T09:00:00.000Z`;
    const state = stateWith({
      attempts: [
        { id: "1", questionId: "q_sign_ped_priority", categoryId: "signs", correct: false, selectedIndex: 1, at: at(1), context: "practice" },
        { id: "2", questionId: "q_sign_ped_priority", categoryId: "signs", correct: true, selectedIndex: 0, at: at(2), context: "practice" },
      ],
    });
    // Got it wrong first, so drilling it right afterwards does not count.
    expect(achievementInputs(state, emptyPerCategory()).hardFirstTry).toBe(0);
  });

  it("counts a gap of a week or more as a comeback", () => {
    const state = stateWith({
      attempts: [
        { id: "1", questionId: "q1", categoryId: "signs", correct: true, selectedIndex: 0, at: "2026-01-01T09:00:00.000Z", context: "practice" },
        { id: "2", questionId: "q2", categoryId: "signs", correct: true, selectedIndex: 0, at: "2026-01-03T09:00:00.000Z", context: "practice" },
        { id: "3", questionId: "q3", categoryId: "signs", correct: true, selectedIndex: 0, at: "2026-01-20T09:00:00.000Z", context: "practice" },
      ],
    });
    expect(achievementInputs(state, emptyPerCategory()).comebacks).toBe(1);
  });

  it("reads stamps off the readiness breakdown it is handed", () => {
    const perCategory = emptyPerCategory();
    perCategory[CATEGORIES[0].id] = MASTERY_STAMP_AT;
    perCategory[CATEGORIES[1].id] = MASTERY_STAMP_AT - 1;
    expect(achievementInputs(defaultUserState(), perCategory).stamped).toBe(1);
  });
});

describe("the endowed back-fill", () => {
  it("banks past work without queueing a toast for each of them", () => {
    // What withArrivalEffects does on first open after the upgrade: evaluate
    // against an empty map, keep `next`, drop `newly`.
    const { next, newly } = evaluateAchievements(
      { ...ZERO, answered: 600, longestStreak: 9, mocksTaken: 2, fullMocksPassed: 1 },
      {},
    );
    expect(next.volume).toBe(1); // 500
    expect(next.streak).toBe(1); // 7
    expect(next.first_mock).toBe(0);
    expect(next.mock_pass).toBe(0);
    // The caller discards these; this asserts there IS something to discard.
    expect(newly.length).toBeGreaterThan(3);
  });
});

describe("achievementViews / nextUpAchievement", () => {
  it("reports progress toward the next tier from the current tier's floor", () => {
    const earned = evaluateAchievements({ ...ZERO, longestStreak: 3 }, {}).next;
    const view = achievementViews({ ...ZERO, longestStreak: 5 }, earned).find(
      (v) => v.achievement.id === "streak",
    )!;
    expect(view.tier).toBe(0);
    expect(view.nextTier?.threshold).toBe(7);
    // 5 is two days past the tier-0 floor of 3, out of the four to tier 1.
    expect(view.progress).toBeCloseTo(0.5);
    expect(view.maxed).toBe(false);
  });

  it("maxes out without a next tier", () => {
    const earned = evaluateAchievements({ ...ZERO, longestStreak: 30 }, {}).next;
    const view = achievementViews({ ...ZERO, longestStreak: 30 }, earned).find(
      (v) => v.achievement.id === "streak",
    )!;
    expect(view.maxed).toBe(true);
    expect(view.nextTier).toBeNull();
  });

  it("names the started achievement closest to its next tier", () => {
    const inputs = { ...ZERO, longestStreak: 6, answered: 12 };
    const next = nextUpAchievement(achievementViews(inputs, {}));
    // 6 of 7 days beats 12 of 100 questions.
    expect(next?.achievement.id).toBe("streak");
  });

  it("has nothing to suggest before anything has been started", () => {
    expect(nextUpAchievement(achievementViews(ZERO, {}))).toBeNull();
  });
});
