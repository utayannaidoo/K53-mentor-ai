import { describe, expect, it } from "vitest";
import { defaultUserState } from "@/lib/store/local-store";
import { mergeAdoptedTabState } from "@/lib/store/cross-tab-merge";
import type { QuestionAttempt, StudySession, TutorThread, UserState } from "@/types";

/**
 * Cross-tab adoption used to be a whole-blob replace, so any mutation this
 * tab had made inside the 250ms save debounce was silently discarded when the
 * other tab wrote — answers, CP and streak days lost in a window two active
 * tabs genuinely hit. mergeAdoptedTabState merges instead; these tests pin
 * each field's monotonicity rule.
 */

const base = (): UserState => defaultUserState();

let seq = 0;
function attempt(id: string, at: string): QuestionAttempt {
  return {
    id,
    questionId: `q-${id}`,
    categoryId: "signs",
    correct: true,
    selectedIndex: 0,
    at,
    context: "practice",
  };
}

describe("progress collections union (nothing from either side is lost)", () => {
  it("keeps this tab's unflushed answer alongside the other tab's", () => {
    const local = base();
    local.attempts = [attempt("mine", "2026-08-01T10:00:00Z")];
    const incoming = base();
    incoming.attempts = [attempt("theirs", "2026-08-01T09:00:00Z")];

    const merged = mergeAdoptedTabState(local, incoming);
    expect(merged.attempts.map((a) => a.id).sort()).toEqual(["mine", "theirs"]);
  });

  it("prefers the local copy when an id collides (same rule as account hydration)", () => {
    const local = base();
    const mine = attempt("shared", "2026-08-01T10:00:00Z");
    mine.selectedIndex = 2;
    local.attempts = [mine];
    const incoming = base();
    incoming.attempts = [attempt("shared", "2026-08-01T10:00:00Z")];

    expect(mergeAdoptedTabState(local, incoming).attempts[0].selectedIndex).toBe(2);
  });

  it("unions study sessions by id", () => {
    const session = (id: string, endedAt: string): StudySession => ({
      id,
      type: "questions",
      startedAt: endedAt,
      endedAt,
      durationSeconds: 60,
    });
    const local = base();
    local.sessions = [session("a", "2026-08-01T10:05:00Z")];
    const incoming = base();
    incoming.sessions = [session("b", "2026-08-01T10:15:00Z")];

    expect(mergeAdoptedTabState(local, incoming).sessions.map((s) => s.id).sort()).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("counters and high-water marks take the maximum", () => {
  it("cp and rank never regress via adoption", () => {
    const local = base();
    local.cp = 120;
    local.rankAchieved = 3;
    const incoming = base();
    incoming.cp = 200;
    incoming.rankAchieved = 2;

    const merged = mergeAdoptedTabState(local, incoming);
    expect(merged.cp).toBe(200);
    expect(merged.rankAchieved).toBe(3);
  });

  it("achievement tiers keep their highest earned value per id", () => {
    const local = base();
    local.achievements = { streak_3: 1, signs_master: 1 };
    const incoming = base();
    incoming.achievements = { streak_3: 2, mock_pass: 1 };

    expect(mergeAdoptedTabState(local, incoming).achievements).toEqual({
      streak_3: 2,
      signs_master: 1,
      mock_pass: 1,
    });
  });

  it("daily usage counters take the per-day maximum", () => {
    const local = base();
    local.dailyUsage = {
      "2026-08-01": { date: "2026-08-01", flashcards: 8, questions: 5, tutor: 1, scenarios: 0 },
    };
    const incoming = base();
    incoming.dailyUsage = {
      "2026-08-01": { date: "2026-08-01", flashcards: 3, questions: 9, tutor: 0, scenarios: 2 },
      "2026-08-02": { date: "2026-08-02", flashcards: 4, questions: 0, tutor: 0, scenarios: 0 },
    };

    expect(mergeAdoptedTabState(local, incoming).dailyUsage["2026-08-01"]).toEqual({
      date: "2026-08-01",
      flashcards: 8,
      questions: 9,
      tutor: 1,
      scenarios: 2,
    });
    expect(mergeAdoptedTabState(local, incoming).dailyUsage["2026-08-02"]).toBeDefined();
  });
});

describe("streak keeps the healthier run", () => {
  it("prefers the longer current run", () => {
    const local = base();
    local.streak = { ...local.streak, current: 7, longest: 9 };
    const incoming = base();
    incoming.streak = { ...incoming.streak, current: 3, longest: 12 };

    // Current wins first: an alive 7-day run must not be replaced by a 3.
    expect(mergeAdoptedTabState(local, incoming).streak.current).toBe(7);
    expect(mergeAdoptedTabState(local, incoming).streak.longest).toBe(12);
  });

  it("breaks a current-run tie toward fresher study date", () => {
    const local = base();
    local.streak = { ...local.streak, current: 4, longest: 4, lastStudyDate: "2026-08-01" };
    const incoming = base();
    incoming.streak = { ...incoming.streak, current: 4, longest: 4, lastStudyDate: "2026-07-30" };

    expect(mergeAdoptedTabState(local, incoming).streak.lastStudyDate).toBe("2026-08-01");
  });
});

describe("collections that need their own shape rules", () => {
  it("unions driver-progress step numbers in order", () => {
    const local = base();
    local.driverProgress = { mod_1: [1, 3] };
    const incoming = base();
    incoming.driverProgress = { mod_1: [2], mod_2: [1] };

    expect(mergeAdoptedTabState(local, incoming).driverProgress).toEqual({
      mod_1: [1, 2, 3],
      mod_2: [1],
    });
  });

  it("merges tutor threads by id with messages deduped oldest-first", () => {
    const thread = (overrides: Partial<TutorThread>): TutorThread => ({
      id: "t1",
      title: "Chat",
      contextLabel: null,
      contextQuestionId: null,
      createdAt: "2026-08-01T09:00:00Z",
      updatedAt: "2026-08-01T09:10:00Z",
      messages: [],
      ...overrides,
    });
    const local = base();
    local.tutorThreads = [
      thread({
        messages: [
          { id: "m1", role: "user", content: "hi", createdAt: "2026-08-01T09:01:00Z" },
        ],
        updatedAt: "2026-08-01T09:11:00Z",
      }),
    ];
    const incoming = base();
    incoming.tutorThreads = [
      thread({
        messages: [
          { id: "m1", role: "user", content: "hi", createdAt: "2026-08-01T09:01:00Z" },
          { id: "m2", role: "assistant", content: "hello", createdAt: "2026-08-01T09:02:00Z" },
        ],
        updatedAt: "2026-08-01T09:12:00Z",
      }),
    ];

    const merged = mergeAdoptedTabState(local, incoming);
    expect(merged.tutorThreads).toHaveLength(1);
    expect(merged.tutorThreads[0].messages.map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(merged.tutorThreads[0].updatedAt).toBe("2026-08-01T09:12:00Z");
  });
});

describe("flags, queues and dates", () => {
  it("guidedDone sticks once either tab has seen it", () => {
    const local = base();
    const incoming = base();
    incoming.guidedDone = true;
    expect(mergeAdoptedTabState(local, incoming).guidedDone).toBe(true);
  });

  it("planBonusDate takes the later claim so a bonus isn't re-granted", () => {
    const local = base();
    local.planBonusDate = "2026-08-01";
    const incoming = base();
    incoming.planBonusDate = null;
    expect(mergeAdoptedTabState(local, incoming).planBonusDate).toBe("2026-08-01");
  });

  it("keeps whichever celebration queue exists so toasts survive", () => {
    const local = base();
    local.pendingRankUp = 2;
    const incoming = base();
    incoming.pendingAchievements = [{ id: "signs_master", tier: 1 }];

    const merged = mergeAdoptedTabState(local, incoming);
    expect(merged.pendingRankUp).toBe(2);
    expect(merged.pendingAchievements).toEqual([{ id: "signs_master", tier: 1 }]);
  });

  it("licence results prefer a recorded entry but accept the other tab's", () => {
    const local = base();
    local.licence = {
      learners: { result: "passed", at: "2026-08-01T10:00:00Z", testDate: "2026-08-01" },
    } as UserState["licence"];
    const incoming = base();

    const merged = mergeAdoptedTabState(local, incoming);
    expect(merged.licence.learners?.result).toBe("passed");

    const otherWay = mergeAdoptedTabState(incoming, local);
    expect(otherWay.licence.learners?.result).toBe("passed");
  });

  it("identity fields come from the writer tab", () => {
    const local = base();
    local.profile = { id: "u1", name: "Local", email: "a@x.co", createdAt: "2026-01-01" };
    const incoming = base();
    incoming.profile = { id: "u1", name: "Renamed", email: "a@x.co", createdAt: "2026-01-01" };

    expect(mergeAdoptedTabState(local, incoming).profile?.name).toBe("Renamed");
  });
});
