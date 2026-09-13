import { describe, expect, it } from "vitest";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { QUESTIONS } from "@/lib/content/questions";
import { STARTER_FLASHCARDS, STARTER_QUESTIONS } from "@/lib/content/starter";
import {
  sampleDiagnostic,
  sampleMiniMock,
  sampleMockExam,
  sampleSectionDrill,
} from "@/lib/diagnostic/select";
import { selectFlashcardQueue } from "@/lib/plan.queue";
import { defaultUserState } from "@/lib/store/local-store";
import type { Flashcard, Question, UserState, VehicleCode } from "@/types";

/**
 * The learner's test is the computerised theory paper. Yard- and road-test
 * items — the examiner's score sheet, manoeuvre attempts, the pre-trip
 * inspection — are driver's practical material. Tagged `learners`, they leaked
 * into the starting check and the 64-question mock, where a yard-scoring
 * question in the 8-question Controls section (6 to pass) measures something
 * the real paper never asks.
 */
const PRACTICAL =
  /\b(yard test|yard manoeuvre|yard movement|yard sequence|yard parking|alley dock\w*|pre-trip inspection|road test|road-test|test sheet|examiner|turn in the road|three-point turn|incline start|practical (driving )?test)\b/i;

/**
 * Read the whole item, not just its prompt.
 *
 * The first version of this gate matched `q.prompt` alone, and
 * `q8_ctrl_two_parts` walked straight through it: "The K53 practical driving
 * test is made up of:" — every giveaway word sat in the options and the
 * explanation. A card is the same shape of problem with `front` and `back`.
 */
function textOf(item: Question | Flashcard): string {
  return "prompt" in item
    ? [item.prompt, ...item.options, item.explanation].join(" ")
    : [item.front, item.back].join(" ");
}

/**
 * Learner's-test items that mention the practical in passing, and stay.
 *
 * Reading the whole item catches the real leaks, and also catches road rules
 * whose explanation adds "…and in the yard test it costs you points", or whose
 * *wrong* answer mentions an examiner. A heuristic decides what a human looks
 * at; it does not decide what ships. Each entry carries the reason it is not a
 * leak, so the next person can disagree with the judgement rather than with a
 * bare id.
 */
const ALLOWED: Record<string, string> = {
  q2_park_kerb_gap: "The 450 mm kerb rule is NRTA parking law; the yard test is an aside in the explanation.",
  fcd_q2_park_kerb_gap: "Derived from q2_park_kerb_gap.",
  qr4_learner_supervision: "The learner-supervision rule. 'Examiner' appears only in a distractor option.",
  qm_handbrake_before_neutral: "Vehicle-control order, asked on the theory paper. 'Examiner' is an aside.",
};

function leaked(pool: (Question | Flashcard)[]): string[] {
  return pool
    .filter(
      (i) => (i.scope ?? "learners") === "learners" && !ALLOWED[i.id] && PRACTICAL.test(textOf(i)),
    )
    .map((i) => i.id);
}

const CODES: VehicleCode[] = ["8", "10", "14", "A1", "A"];

describe("learner's scope — questions", () => {
  it("no learner-scoped question is about the yard or road test", () => {
    expect(leaked(QUESTIONS)).toEqual([]);
  });

  it("the bundled starter pack agrees with the bank", () => {
    expect(leaked(STARTER_QUESTIONS)).toEqual([]);
  });

  /**
   * Every code, not just 8. Retagging shrinks the learner's bank, and the
   * motorcycle codes draw from the smallest Controls pool — a paper that can
   * no longer be filled would otherwise show up as a short mock in production
   * rather than as a failing test here.
   */
  it.each(CODES)("every learner's-test paper for code %s is full and in scope", (code) => {
    const papers: [string, Question[], number][] = [
      ["diagnostic", sampleDiagnostic(QUESTIONS, [], code), 15],
      ["mock", sampleMockExam(QUESTIONS, [], code), 64],
      ["mini mock", sampleMiniMock(QUESTIONS, [], code), 15],
      ["controls drill", sampleSectionDrill(QUESTIONS, "controls", [], code), 8],
      ["signs drill", sampleSectionDrill(QUESTIONS, "signs", [], code), 28],
      ["rules drill", sampleSectionDrill(QUESTIONS, "rules", [], code), 28],
    ];
    for (const [name, paper, size] of papers) {
      expect(paper.length, `${name} is short`).toBe(size);
      expect(paper.filter((q) => q.scope !== "learners").map((q) => q.id)).toEqual([]);
    }
  });
});

describe("learner's scope — flashcards", () => {
  /**
   * The same defect, left open when the questions were fixed: `Flashcard` had
   * no `scope` at all, so 29 yard- and road-test cards sat in the Controls
   * deck — about 15% of the deck a learner sees most of.
   */
  it("no learner-scoped flashcard is about the yard or road test", () => {
    expect(leaked(FLASHCARDS)).toEqual([]);
  });

  it("the bundled starter pack agrees with the deck", () => {
    expect(leaked(STARTER_FLASHCARDS)).toEqual([]);
  });

  function stateFor(goal: "learners" | "drivers" | "both"): UserState {
    const s = defaultUserState();
    return { ...s, onboarding: { ...s.onboarding!, goal } } as UserState;
  }

  it("a learner's-only goal is never served a driver's card", () => {
    const queue = selectFlashcardQueue(FLASHCARDS, stateFor("learners"));
    expect(queue.filter((f) => f.scope === "drivers")).toEqual([]);
    expect(queue.length).toBeGreaterThan(0);
  });

  it.each(["drivers", "both"] as const)("a %s goal still gets them", (goal) => {
    const queue = selectFlashcardQueue(FLASHCARDS, stateFor(goal));
    // Not hidden from the people the material is actually for.
    expect(queue.some((f) => f.scope === "drivers")).toBe(true);
  });
});
