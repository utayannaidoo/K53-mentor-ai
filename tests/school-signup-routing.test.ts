import { describe, expect, it } from "vitest";
import { isSchoolWorkspacePath } from "@/lib/auth/safe-next";
import { postAuthFirstRunDestination } from "@/lib/onboarding/first-run";

/**
 * A driving-school owner who signs up from /for-driving-schools must land in
 * the school workspace — not in LEARNER onboarding. Before this, /continue
 * made a brand-new school owner pick a licence code and sit the learner's
 * starting diagnostic before they could set up their school.
 */

const brandNewAccount = {
  hasOnboarded: false,
  hasDiagnostic: false,
  diagnosticSkippedAt: null,
  guidedDone: false,
  nonDiagnosticSessions: 0,
};

describe("school sign-up routing", () => {
  it("sends a new account heading for the workspace straight there", () => {
    expect(postAuthFirstRunDestination({ ...brandNewAccount, next: "/schools/start" })).toBe("/schools/start");
    expect(postAuthFirstRunDestination({ ...brandNewAccount, next: "/schools/join/abc" })).toBe(
      "/schools/join/abc",
    );
    expect(postAuthFirstRunDestination({ ...brandNewAccount, next: "/schools" })).toBe("/schools");
  });

  it("still puts a new LEARNER through onboarding, as before", () => {
    expect(postAuthFirstRunDestination({ ...brandNewAccount, next: "/study/questions" })).toBe("/onboarding");
    expect(postAuthFirstRunDestination({ ...brandNewAccount, next: null })).toBe("/onboarding");
  });
});

describe("isSchoolWorkspacePath", () => {
  it("matches the workspace and everything under it", () => {
    expect(isSchoolWorkspacePath("/schools")).toBe(true);
    expect(isSchoolWorkspacePath("/schools/start")).toBe(true);
    expect(isSchoolWorkspacePath("/schools/learners/abc?tab=money")).toBe(true);
  });

  it("is not fooled by lookalikes or a query string", () => {
    expect(isSchoolWorkspacePath("/schoolsfoo")).toBe(false);
    expect(isSchoolWorkspacePath("/for-driving-schools")).toBe(false);
    expect(isSchoolWorkspacePath("/dashboard?next=/schools")).toBe(false);
    expect(isSchoolWorkspacePath("")).toBe(false);
    expect(isSchoolWorkspacePath(null)).toBe(false);
  });
});
