import { describe, expect, it } from "vitest";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { questionFeedbackHref } from "@/lib/content/question-feedback";

const question = {
  id: "qr_feedback_001",
  categoryId: "rules" as const,
  prompt: "Who has right of way at this intersection?",
};

describe("questionFeedbackHref", () => {
  it("addresses support and carries immutable item context", () => {
    const href = questionFeedbackHref(question, "practice");
    const [address, query] = href.slice("mailto:".length).split("?");
    const params = new URLSearchParams(query);

    expect(address).toBe(SUPPORT_EMAIL);
    expect(params.get("subject")).toBe("Question correction: qr_feedback_001");
    expect(params.get("body")).toContain("Question ID: qr_feedback_001");
    expect(params.get("body")).toContain("Study area: Rules of the road");
    expect(params.get("body")).toContain("Seen in: practice");
    expect(params.get("body")).toContain(question.prompt);
    expect(params.get("body")).toContain("What seems wrong?");
  });

  it("identifies mock-review reports separately", () => {
    const href = questionFeedbackHref(question, "mock review");
    expect(decodeURIComponent(href)).toContain("Seen in: mock review");
  });
});
