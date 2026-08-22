import { describe, expect, it } from "vitest";
import {
  openMistakes,
  dueMistakes,
  mistakeStats,
  CORRECTIONS_TO_RETIRE,
} from "@/lib/learning/mistakes";
import { defaultUserState, todayKey } from "@/lib/store/local-store";
import type { CategoryId, QuestionAttempt, UserState } from "@/types";

let seq = 0;
function attempt(
  questionId: string,
  correct: boolean,
  day: string,
  selectedIndex = 0,
  categoryId: CategoryId = "signs",
): QuestionAttempt {
  return {
    id: `att_${seq++}`,
    questionId,
    categoryId,
    correct,
    selectedIndex,
    at: `${day}T10:00:00.000Z`,
    context: "practice",
  };
}

function withAttempts(...attempts: QuestionAttempt[]): UserState {
  return { ...defaultUserState(), attempts };
}

const TODAY = todayKey();

describe("openMistakes", () => {
  it("a question answered correctly first time is not a mistake", () => {
    const s = withAttempts(attempt("q1", true, "2026-07-01"));
    expect(openMistakes(s)).toEqual([]);
  });

  it("a wrong answer opens a mistake and records the distractor chosen", () => {
    // selectedIndex IS the misconception — it's what makes the tutor able to
    // say "you picked X" rather than "you got signs wrong".
    const s = withAttempts(attempt("q1", false, "2026-07-01", 2));
    const [m] = openMistakes(s);
    expect(m.questionId).toBe("q1");
    expect(m.chosenIndex).toBe(2);
    expect(m.wrongCount).toBe(1);
    expect(m.correctDays).toEqual([]);
  });

  it("stays open after one correct answer", () => {
    const s = withAttempts(attempt("q1", false, "2026-07-01"), attempt("q1", true, "2026-07-02"));
    expect(openMistakes(s)).toHaveLength(1);
    expect(openMistakes(s)[0].correctDays).toEqual(["2026-07-02"]);
  });

  it("retires after two correct answers on separate days", () => {
    const s = withAttempts(
      attempt("q1", false, "2026-07-01"),
      attempt("q1", true, "2026-07-02"),
      attempt("q1", true, "2026-07-03"),
    );
    expect(openMistakes(s)).toEqual([]);
  });

  it("two correct answers on the SAME day do not retire it", () => {
    // Answering right twice in one sitting is recognition, not recall.
    const s = withAttempts(
      attempt("q1", false, "2026-07-01"),
      attempt("q1", true, "2026-07-02"),
      attempt("q1", true, "2026-07-02"),
    );
    expect(openMistakes(s)).toHaveLength(1);
    expect(CORRECTIONS_TO_RETIRE).toBe(2);
  });

  it("a later wrong answer reopens a retired mistake and resets the count", () => {
    const s = withAttempts(
      attempt("q1", false, "2026-07-01"),
      attempt("q1", true, "2026-07-02"),
      attempt("q1", true, "2026-07-03"),
      attempt("q1", false, "2026-07-10", 3),
    );
    const [m] = openMistakes(s);
    expect(m.chosenIndex).toBe(3);
    expect(m.wrongCount).toBe(2);
    expect(m.correctDays).toEqual([]);
  });

  it("orders most-missed first, then oldest unresolved", () => {
    const s = withAttempts(
      attempt("often", false, "2026-07-05"),
      attempt("often", false, "2026-07-06"),
      attempt("old", false, "2026-07-01"),
      attempt("recent", false, "2026-07-09"),
    );
    expect(openMistakes(s).map((m) => m.questionId)).toEqual(["often", "old", "recent"]);
  });

  it("is not confused by attempts arriving out of order (multi-device merge)", () => {
    const s = withAttempts(
      attempt("q1", true, "2026-07-03"),
      attempt("q1", false, "2026-07-01"),
      attempt("q1", true, "2026-07-02"),
    );
    // Sorted, this is wrong → correct → correct on separate days: retired.
    expect(openMistakes(s)).toEqual([]);
  });

  it("a timed-out blank is silence, not a mistake", () => {
    // A mock submitted with unanswered slots used to seed phantom mistakes:
    // a question the learner never answered opened an entry with chosenIndex
    // -1, got drilled first in practice and deep-linked into the tutor with a
    // misconception that did not exist.
    const s = withAttempts(attempt("q1", true, "2026-07-01"), attempt("q2", false, "2026-07-01", -1));
    expect(openMistakes(s).map((m) => m.questionId)).toEqual([]);
    expect(mistakeStats(s)).toEqual({ open: 0, retired: 0, everMissed: 0 });
  });

  it("blanks neither reopen nor extend a real mistake", () => {
    const s = withAttempts(
      attempt("q1", false, "2026-07-01", 2),
      attempt("q1", false, "2026-07-02", -1), // timed out on the re-test
      attempt("q1", true, "2026-07-03"),
    );
    const [m] = openMistakes(s);
    expect(m.chosenIndex).toBe(2); // the real distractor, not the blank
    expect(m.wrongCount).toBe(1);
  });
});

describe("dueMistakes", () => {
  it("holds back a mistake already answered today, so one miss can't dominate", () => {
    const s = withAttempts(attempt("q1", false, "2026-07-01"), attempt("q1", true, TODAY));
    expect(openMistakes(s)).toHaveLength(1);
    expect(dueMistakes(s)).toEqual([]);
  });

  it("surfaces a mistake that hasn't been touched today", () => {
    const s = withAttempts(attempt("q1", false, "2026-07-01"));
    expect(dueMistakes(s).map((m) => m.questionId)).toEqual(["q1"]);
  });
});

describe("mistakeStats", () => {
  it("counts open vs retired — the honest health metric", () => {
    const s = withAttempts(
      attempt("fixed", false, "2026-07-01"),
      attempt("fixed", true, "2026-07-02"),
      attempt("fixed", true, "2026-07-03"),
      attempt("stillWrong", false, "2026-07-04"),
      attempt("neverMissed", true, "2026-07-05"),
    );
    expect(mistakeStats(s)).toEqual({ open: 1, retired: 1, everMissed: 2 });
  });
});
