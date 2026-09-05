import { describe, expect, it } from "vitest";
import {
  MAX_SESSION_DRAFT_AGE_MS,
  clearFlashcardDraft,
  clearPracticeDraft,
  loadFlashcardDraft,
  loadPracticeDraft,
  saveFlashcardDraft,
  savePracticeDraft,
} from "@/lib/study/session-draft";
import type { Question } from "@/types";

function withLocalStorage(fn: () => void): void {
  const store = new Map<string, string>();
  const previous = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
    },
  };
  try {
    fn();
  } finally {
    (globalThis as { window?: unknown }).window = previous;
  }
}

const question = {
  id: "q_1",
  categoryId: "signs",
  prompt: "What does this sign mean?",
  options: ["A", "B", "C", "D"],
  correctIndex: 2,
  explanation: "C is correct.",
  difficulty: 1,
  scope: "learners",
} satisfies Question;

describe("short study session drafts", () => {
  it("restores the exact shuffled practice paper, answer and cursor", () => {
    withLocalStorage(() => {
      savePracticeDraft({
        kind: "practice",
        savedAt: new Date().toISOString(),
        ownerProfileId: "learner",
        signature: "category=signs;cram=false",
        questions: [question],
        answers: [1],
        index: 0,
      });
      expect(loadPracticeDraft("learner", "category=signs;cram=false", new Set(["q_1"]))).toMatchObject({
        questions: [question],
        answers: [1],
        index: 0,
      });
      expect(loadPracticeDraft("other", "category=signs;cram=false", new Set(["q_1"]))).toBeNull();
      clearPracticeDraft();
      expect(loadPracticeDraft("learner", "category=signs;cram=false", new Set(["q_1"]))).toBeNull();
    });
  });

  it("restores a flashcard cursor only for its owner, route and current deck", () => {
    withLocalStorage(() => {
      saveFlashcardDraft({
        kind: "flashcards",
        savedAt: new Date().toISOString(),
        ownerProfileId: null,
        signature: "category=all",
        cardIds: ["card_1", "card_2"],
        index: 1,
      });
      expect(loadFlashcardDraft(null, "category=all", new Set(["card_1", "card_2"]))).toMatchObject({
        cardIds: ["card_1", "card_2"],
        index: 1,
      });
      expect(loadFlashcardDraft(null, "category=signs", new Set(["card_1", "card_2"]))).toBeNull();
      expect(loadFlashcardDraft(null, "category=all", new Set(["card_1"]))).toBeNull();
      clearFlashcardDraft();
    });
  });

  it("rejects and removes expired or invalid-timestamp drafts", () => {
    withLocalStorage(() => {
      savePracticeDraft({
        kind: "practice",
        savedAt: new Date(Date.now() - MAX_SESSION_DRAFT_AGE_MS - 1).toISOString(),
        ownerProfileId: "learner",
        signature: "category=all;cram=false",
        questions: [question],
        answers: [null],
        index: 0,
      });
      expect(loadPracticeDraft("learner", "category=all;cram=false", new Set(["q_1"]))).toBeNull();
      expect(window.localStorage.getItem("k53mentor.draft.practice.v1")).toBeNull();

      saveFlashcardDraft({
        kind: "flashcards",
        savedAt: "not-a-date",
        ownerProfileId: null,
        signature: "category=all",
        cardIds: ["card_1"],
        index: 0,
      });
      expect(loadFlashcardDraft(null, "category=all", new Set(["card_1"]))).toBeNull();
      expect(window.localStorage.getItem("k53mentor.draft.flashcards.v1")).toBeNull();
    });
  });

  it("rejects and removes fractional cursors before they reach the UI", () => {
    withLocalStorage(() => {
      savePracticeDraft({
        kind: "practice",
        savedAt: new Date().toISOString(),
        ownerProfileId: "learner",
        signature: "category=all;cram=false",
        questions: [question],
        answers: [null],
        index: 0.5,
      });
      expect(loadPracticeDraft("learner", "category=all;cram=false", new Set(["q_1"]))).toBeNull();

      saveFlashcardDraft({
        kind: "flashcards",
        savedAt: new Date().toISOString(),
        ownerProfileId: null,
        signature: "category=all",
        cardIds: ["card_1"],
        index: 0.5,
      });
      expect(loadFlashcardDraft(null, "category=all", new Set(["card_1"]))).toBeNull();
    });
  });
});
