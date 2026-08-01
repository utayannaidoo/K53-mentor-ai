import { describe, expect, it } from "vitest";
import { resolveContext, defaultTutorPrompt } from "@/lib/ai/tutor-prompt";
import { localTutorReply } from "@/lib/ai/fallback";
import { QUESTIONS } from "@/lib/content/questions";

const q = QUESTIONS[0];
const wrongIndex = (q.correctIndex + 1) % q.options.length;

describe("the tutor is told which answer the learner actually gave", () => {
  it("puts the chosen distractor in the grounding text", () => {
    const ctx = resolveContext({ type: "question", id: q.id, chosenIndex: wrongIndex });
    expect(ctx?.text).toContain("THE LEARNER ANSWERED");
    expect(ctx?.text).toContain(q.options[wrongIndex]);
  });

  it("says nothing about a choice when there wasn't one", () => {
    const ctx = resolveContext({ type: "question", id: q.id });
    expect(ctx?.text).not.toContain("THE LEARNER ANSWERED");
  });

  it("ignores a chosen index that is actually the correct answer", () => {
    // Reaching the tutor from a question you got right is a legitimate path —
    // don't tell the model they were wrong.
    const ctx = resolveContext({ type: "question", id: q.id, chosenIndex: q.correctIndex });
    expect(ctx?.text).not.toContain("THE LEARNER ANSWERED");
  });

  it("ignores an out-of-range index rather than rendering undefined", () => {
    const ctx = resolveContext({ type: "question", id: q.id, chosenIndex: 99 });
    expect(ctx?.text).not.toContain("THE LEARNER ANSWERED");
    expect(ctx?.text).not.toContain("undefined");
  });

  it("opens the conversation on the misconception, not a generic question", () => {
    const prompt = defaultTutorPrompt("question", q.id, null, wrongIndex);
    expect(prompt).toContain(q.options[wrongIndex]);
    expect(prompt).toMatch(/why is that answer wrong/i);
  });
});

describe("the offline tutor names the wrong answer too", () => {
  it("calls out the chosen distractor before explaining", () => {
    const reply = localTutorReply("why is this wrong?", {
      type: "question",
      id: q.id,
      chosenIndex: wrongIndex,
    });
    expect(reply).toContain(q.options[wrongIndex]);
    expect(reply).toContain(q.explanation);
  });

  it("still works with no choice supplied", () => {
    const reply = localTutorReply("explain this", { type: "question", id: q.id });
    expect(reply).toContain(q.explanation);
    expect(reply).not.toContain("You picked");
  });
});
