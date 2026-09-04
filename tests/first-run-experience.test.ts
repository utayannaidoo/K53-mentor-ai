import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { postAuthFirstRunDestination } from "@/lib/onboarding/first-run";
import { generateTodayPlan } from "@/lib/plan";
import { defaultUserState } from "@/lib/store/local-store";
import { computeReadiness } from "@/lib/diagnostic/scoring";
import type { QuestionAttempt } from "@/types";

function destination(overrides: Partial<Parameters<typeof postAuthFirstRunDestination>[0]> = {}) {
  return postAuthFirstRunDestination({
    hasOnboarded: true,
    hasDiagnostic: false,
    diagnosticSkippedAt: null,
    guidedDone: false,
    nonDiagnosticSessions: 0,
    next: null,
    ...overrides,
  });
}

describe("first-run routing", () => {
  it("sends a completed starting check directly to Today", () => {
    expect(destination({ hasDiagnostic: true })).toBe("/dashboard");
  });

  it("preserves a validated deep link after the starting check", () => {
    expect(destination({ hasDiagnostic: true, next: "/study" })).toBe("/study");
  });

  it("gives a skipper the hands-on Navi introduction", () => {
    expect(destination({ diagnosticSkippedAt: "2026-09-04T08:00:00.000Z" })).toBe("/welcome");
  });

  it("does not repeat the introduction after it is done", () => {
    expect(
      destination({
        diagnosticSkippedAt: "2026-09-04T08:00:00.000Z",
        guidedDone: true,
      }),
    ).toBe("/dashboard");
  });

  it("keeps an undecided learner at the starting check", () => {
    expect(destination()).toBe("/diagnostic");
  });
});

describe("first Today experience", () => {
  it("arms the navigator only when a learner completes onboarding", () => {
    expect(defaultUserState().firstRunTourDone).toBe(true);
  });

  it("names the concrete first task and count", () => {
    const state = defaultUserState();
    const first = generateTodayPlan(state, computeReadiness(state))[0];
    expect(first.actionLabel).toBe("Start 6 starter flashcards");
  });

  it("uses one real answer to choose practice without presenting a fake score", () => {
    const state = defaultUserState();
    const attempt: QuestionAttempt = {
      id: "practice_rules",
      questionId: "rules_1",
      categoryId: "rules",
      correct: true,
      selectedIndex: 0,
      context: "practice",
      at: "2026-09-04T10:00:00.000Z",
    };
    state.attempts = [attempt];

    const questionTask = generateTodayPlan(state, computeReadiness(state)).find(
      (task) => task.type === "questions",
    )!;
    expect(questionTask.categoryId).toBe("rules");
    expect(questionTask.subtitle).toContain("Your practice has pointed us here");
    expect(questionTask.subtitle).not.toMatch(/\d+%/);
  });

  it("contains no mandatory paywall in the skipper introduction", () => {
    const src = readFileSync(
      path.resolve(__dirname, "../src/components/onboarding/guided-session.tsx"),
      "utf8",
    );
    expect(src).not.toContain("<Paywall");
    expect(src).toContain("one real question and one flashcard");
    expect(src).toContain("Explore Study with Navi");
    expect(src).toContain("GuidedFlashcard");
  });

  it("has a short interactive navigator rather than a static first-run hint", () => {
    const src = readFileSync(
      path.resolve(__dirname, "../src/components/onboarding/tutor-navigator.tsx"),
      "utf8",
    );
    expect(src).toContain("Your daily route");
    expect(src).toContain("data-tutorial='tutor-nav'");
    expect(src).toContain("Ask Navi anything");
    expect(src).toContain("study-nav");
    expect(src).toContain("Explore Study");
    expect(src).toContain("<NaviGuide");
    const guide = readFileSync(
      path.resolve(__dirname, "../src/components/onboarding/navi-guide.tsx"),
      "utf8",
    );
    expect(guide).toContain("<NaviAvatar");
    expect(guide).toContain("Skip tour");
  });
});

describe("Navi Study tour", () => {
  it("explains the main study tools and ends in a real practice session", () => {
    const src = readFileSync(
      path.resolve(__dirname, "../src/components/onboarding/study-navigator.tsx"),
      "utf8",
    );
    const study = readFileSync(
      path.resolve(__dirname, "../src/app/(app)/study/page.tsx"),
      "utf8",
    );

    expect(src).toContain("Use flashcards and questions differently");
    expect(src).toContain("signs, scenarios and controls");
    expect(src).toContain("Mock exam is the full 64-question paper");
    expect(src).toContain('router.push("/study/questions")');
    expect(study).toContain('"study-flashcards"');
    expect(study).toContain("StudyNavigator");
  });
});

describe("Navi tutor identity", () => {
  it("uses the selected companion consistently in the tutor experience", () => {
    const src = readFileSync(
      path.resolve(__dirname, "../src/components/tutor/tutor-chat.tsx"),
      "utf8",
    );
    const avatar = readFileSync(
      path.resolve(__dirname, "../src/components/shared/navi-avatar.tsx"),
      "utf8",
    );

    expect(src).toContain(">Navi</h1>");
    expect(src).toContain("Your K53 driving tutor");
    expect(src).toContain("Ask Navi...");
    expect(src).toContain("NaviAvatar");
    expect(avatar).toContain('src="/mascots/navi.png"');
  });
});
