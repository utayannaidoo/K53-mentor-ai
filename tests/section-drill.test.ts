import { describe, expect, it } from "vitest";
import { SECTION_DRILL, SECTION_OF, sampleSectionDrill, type ExamSection } from "@/lib/diagnostic/select";
import { EXAM_FORMAT } from "@/lib/constants";
import { drillsRemaining, mocksRemaining } from "@/lib/plan";
import { defaultUserState, todayKey } from "@/lib/store/local-store";
import type { MockExamAttempt, UserState } from "@/types";

const SECTIONS = Object.keys(EXAM_FORMAT.sections) as ExamSection[];

describe("SECTION_DRILL config", () => {
  it.each(SECTIONS)("%s mirrors the real exam section", (s) => {
    expect(SECTION_DRILL[s].total).toBe(EXAM_FORMAT.sections[s].questions);
    expect(SECTION_DRILL[s].passMark).toBe(EXAM_FORMAT.sections[s].pass);
    // Same per-question pace as the real 60-minute, 64-question paper (±30s rounding).
    const exact = (EXAM_FORMAT.sections[s].questions / EXAM_FORMAT.totalQuestions) * 3600;
    expect(Math.abs(SECTION_DRILL[s].seconds - exact)).toBeLessThanOrEqual(15);
  });
});

describe("sampleSectionDrill", () => {
  it.each(SECTIONS)("%s: full size, single section, unique questions", (s) => {
    const qs = sampleSectionDrill(s, [], "8");
    expect(qs).toHaveLength(SECTION_DRILL[s].total);
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
    for (const q of qs) expect(SECTION_OF[q.categoryId]).toBe(s);
  });
});

describe("drillsRemaining", () => {
  function drillAttempt(at: string, drill: MockExamAttempt["drill"] = "signs"): MockExamAttempt {
    return { id: `d_${at}_${drill}`, at, score: 23, total: 28, passed: true, perCategory: {}, durationSeconds: 900, drill };
  }
  const TODAY = `${todayKey()}T10:00:00.000Z`;
  const LAST_WEEK = "2026-07-01T10:00:00.000Z";

  it("free: one lifetime drill — an old drill still counts", () => {
    const s = defaultUserState();
    expect(drillsRemaining(s)).toBe(1);
    s.mockExams = [drillAttempt(LAST_WEEK)];
    expect(drillsRemaining(s)).toBe(0);
  });

  it("premium: 5 per day, resetting daily", () => {
    const s: UserState = { ...defaultUserState(), tier: "premium" };
    s.mockExams = [drillAttempt(TODAY), drillAttempt(TODAY, "controls"), drillAttempt(LAST_WEEK)];
    expect(drillsRemaining(s)).toBe(3);
  });

  it("premium_plus: unlimited", () => {
    const s: UserState = { ...defaultUserState(), tier: "premium_plus" };
    expect(drillsRemaining(s)).toBe(Infinity);
  });

  it("drills never eat the full or mini mock allowance", () => {
    const s: UserState = { ...defaultUserState(), tier: "premium" };
    s.mockExams = [drillAttempt(TODAY), drillAttempt(TODAY), drillAttempt(TODAY)];
    expect(mocksRemaining(s, "full")).toBe(3);
    expect(mocksRemaining(s, "mini")).toBe(5);
  });
});
