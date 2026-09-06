import { describe, expect, it } from "vitest";
import { bestQuestionFor } from "@/lib/ai/keyword-search";
import { retrieveRelated } from "@/lib/ai/retrieve";
import { localTutorReply } from "@/lib/ai/fallback";
import type { Question } from "@/types";

const amber: Question = {
  id: "amber",
  categoryId: "rules",
  prompt: "What should you do at an amber traffic light?",
  options: ["Stop if safe", "Accelerate", "Turn around", "Park"],
  correctIndex: 0,
  explanation: "Stop unless stopping would be unsafe.",
  difficulty: 1,
  scope: "learners",
};

const fourWayStop: Question = {
  id: "four-way-stop",
  categoryId: "intersections",
  prompt: "How should you approach a four-way stop?",
  options: ["Stop and give way when required", "Accelerate", "Ignore traffic", "Park"],
  correctIndex: 0,
  explanation: "Approach slowly, stop, observe and proceed only when safe.",
  difficulty: 1,
  scope: "learners",
};

describe("bestQuestionFor", () => {
  it("does not answer a four-way-stop question with amber-light advice", () => {
    expect(bestQuestionFor("How do I safely approach a four-way stop?", [amber])).toBeNull();
  });

  it("returns a question only when prompt and topic match", () => {
    expect(bestQuestionFor("How do I safely approach a four-way stop?", [amber, fourWayStop])?.id).toBe(
      "four-way-stop",
    );
  });

  it("grounds a four-way-stop prompt in intersection facts, not generic vehicle-walk wording", () => {
    const grounding = retrieveRelated("How do four-way stops work?");

    expect(grounding).toMatch(/four-way stop/i);
    expect(grounding).not.toContain("fixed direction is a memory aid");
    expect(grounding).not.toContain("yard-test sheet");
  });

  it("answers the exact production quick prompt instead of using the generic fallback", () => {
    const reply = localTutorReply("How do four-way stops work?");

    expect(reply).toMatch(/four-way stop|order they arrived|vehicle on the right/i);
    expect(reply).not.toContain("What would you like to understand better?");
  });
});
