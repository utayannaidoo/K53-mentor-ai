import { describe, expect, it } from "vitest";
import { bestQuestionFor } from "@/lib/ai/keyword-search";
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
});
