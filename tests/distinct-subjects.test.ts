import { describe, expect, it } from "vitest";
import {
  sampleMockExam,
  sampleMiniMock,
  sampleSectionDrill,
  sampleDiagnostic,
  takeDistinctSubjects,
} from "@/lib/diagnostic/select";
import { EXAM_FORMAT } from "@/lib/constants";
import type { Question, QuestionAttempt } from "@/types";

const subjectOf = (q: Question) => q.image ?? (q.sign ? `sign:${q.sign}` : `id:${q.id}`);
const repeatedSubjects = (qs: Question[]) => qs.length - new Set(qs.map(subjectOf)).size;

/** Answer everything served, so the next paper sees a realistic history. */
function record(attempts: QuestionAttempt[], qs: Question[], from: number): number {
  let t = from;
  for (const q of qs) {
    t += 30_000;
    attempts.push({
      questionId: q.id,
      categoryId: q.categoryId,
      correct: true,
      selectedIndex: 0,
      context: "mock",
      at: new Date(t).toISOString(),
    } as QuestionAttempt);
  }
  return t;
}

describe("takeDistinctSubjects", () => {
  const q = (id: string, image?: string): Question =>
    ({ id, image, categoryId: "signs", options: [], correctIndex: 0 }) as unknown as Question;

  it("prefers one question per subject", () => {
    const picked = takeDistinctSubjects([q("a", "/x.png"), q("b", "/x.png"), q("c", "/y.png")], 2);
    expect(picked.map((p) => p.id)).toEqual(["a", "c"]);
  });

  it("still fills the count when subjects run out", () => {
    // A paper must never come up short — a repeated subject beats a short paper.
    const picked = takeDistinctSubjects([q("a", "/x.png"), q("b", "/x.png"), q("c", "/x.png")], 3);
    expect(picked).toHaveLength(3);
  });

  it("treats subject-less questions as individually distinct", () => {
    const picked = takeDistinctSubjects([q("a"), q("b"), q("c")], 3);
    expect(picked.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
});

describe("paper composition", () => {
  it("builds a full mock at the official size with no repeated subject", () => {
    const mock = sampleMockExam([], "8");
    expect(mock).toHaveLength(EXAM_FORMAT.totalQuestions);
    expect(repeatedSubjects(mock)).toBe(0);
  });

  it("keeps size and distinctness across ten consecutive mocks", () => {
    // Selection shuffles, so a single run proves little — repeat the whole
    // ten-mock arc enough times to catch an order-dependent leak. This caught a
    // real one: sections were deduped independently, so a sign could headline a
    // signs question and a rules question in the same paper.
    for (let run = 0; run < 25; run++) {
      const attempts: QuestionAttempt[] = [];
      let t = Date.parse("2026-07-18T08:00:00Z");
      for (let i = 0; i < 10; i++) {
        const mock = sampleMockExam(attempts, "8");
        expect(mock).toHaveLength(EXAM_FORMAT.totalQuestions);
        expect(repeatedSubjects(mock)).toBe(0);
        t = record(attempts, mock, t);
      }
    }
  });

  it("applies to minis, drills and the diagnostic too", () => {
    expect(repeatedSubjects(sampleMiniMock([], "8"))).toBe(0);
    expect(repeatedSubjects(sampleDiagnostic([], "8"))).toBe(0);
    for (const section of ["controls", "signs", "rules"] as const) {
      const drill = sampleSectionDrill(section, [], "8");
      expect(drill).toHaveLength(EXAM_FORMAT.sections[section].questions);
      expect(repeatedSubjects(drill)).toBe(0);
    }
  });
});
