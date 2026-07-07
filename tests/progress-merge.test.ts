import { describe, expect, it } from "vitest";
import { mergeProgress, type RemoteProgress } from "@/lib/supabase/progress";
import { defaultUserState } from "@/lib/store/local-store";
import { initialCardState } from "@/lib/srs/sm2";
import type { QuestionAttempt } from "@/types";

const attempt = (id: string, at: string): QuestionAttempt => ({
  id,
  questionId: "q1",
  categoryId: "signs",
  correct: true,
  selectedIndex: 0,
  context: "practice",
  at,
});

const emptyRemote: RemoteProgress = {
  attempts: [],
  scenarioAttempts: [],
  mockExams: [],
  diagnostics: [],
  cardStates: {},
  readinessHistory: [],
};

describe("mergeProgress", () => {
  it("unions attempts by id — no duplicates, nothing lost, sorted by time", () => {
    const local = defaultUserState();
    local.attempts = [attempt("a", "2026-07-02T10:00:00Z"), attempt("b", "2026-07-03T10:00:00Z")];
    const remote = {
      ...emptyRemote,
      attempts: [attempt("a", "2026-07-02T10:00:00Z"), attempt("c", "2026-07-01T10:00:00Z")],
    };
    const merged = mergeProgress(local, remote);
    expect(merged.attempts.map((a) => a.id)).toEqual(["c", "a", "b"]);
  });

  it("prefers the card state with more reviews behind it", () => {
    const local = defaultUserState();
    const localCard = { ...initialCardState("card1"), reps: 5, due: "2026-08-01T00:00:00Z" };
    const remoteCard = { ...initialCardState("card1"), reps: 2, due: "2026-09-01T00:00:00Z" };
    local.cardStates = { card1: localCard };
    const merged = mergeProgress(local, { ...emptyRemote, cardStates: { card1: remoteCard } });
    expect(merged.cardStates.card1.reps).toBe(5);
  });

  it("restores server-only history onto a fresh device", () => {
    const fresh = defaultUserState();
    const remote = {
      ...emptyRemote,
      attempts: [attempt("srv", "2026-07-01T09:00:00Z")],
      cardStates: { card9: { ...initialCardState("card9"), reps: 3 } },
      readinessHistory: [{ date: "2026-07-01", readiness: 40 }],
    };
    const merged = mergeProgress(fresh, remote);
    expect(merged.attempts).toHaveLength(1);
    expect(merged.cardStates.card9.reps).toBe(3);
    expect(merged.readinessHistory).toEqual([{ date: "2026-07-01", readiness: 40 }]);
  });

  it("readiness history keeps one point per day, local winning", () => {
    const local = defaultUserState();
    local.readinessHistory = [{ date: "2026-07-01", readiness: 55 }];
    const merged = mergeProgress(local, {
      ...emptyRemote,
      readinessHistory: [
        { date: "2026-07-01", readiness: 40 },
        { date: "2026-06-30", readiness: 35 },
      ],
    });
    expect(merged.readinessHistory).toEqual([
      { date: "2026-06-30", readiness: 35 },
      { date: "2026-07-01", readiness: 55 },
    ]);
  });
});
