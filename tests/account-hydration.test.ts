import { describe, expect, it } from "vitest";
import { hydrateAccountState } from "@/lib/store/account-hydrate";
import { defaultUserState } from "@/lib/store/local-store";
import type { RemoteProgress } from "@/lib/supabase/progress";
import type { QuestionAttempt, UserState } from "@/types";

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

/** Local state that already belongs to account A, with some progress. */
function accountAState(): UserState {
  const s = defaultUserState();
  s.ownerEmail = "alice@example.com";
  s.attempts = [attempt("a1", "2026-07-01T10:00:00Z")];
  s.cp = 100;
  return s;
}

describe("hydrateAccountState — cross-account isolation", () => {
  it("does NOT carry account A's progress when account B signs in", () => {
    const remoteB: RemoteProgress = {
      ...emptyRemote,
      attempts: [attempt("b1", "2026-07-05T10:00:00Z")],
    };
    const next = hydrateAccountState(
      accountAState(),
      { tier: "free", cp: 20 },
      remoteB,
      "bob@example.com",
    );
    // Alice's attempt must be gone; only Bob's remains.
    expect(next.attempts.map((a) => a.id)).toEqual(["b1"]);
    // CP is Bob's own, not max(100, 20) — a different account starts fresh.
    expect(next.cp).toBe(20);
    expect(next.ownerEmail).toBe("bob@example.com");
  });

  it("keeps and merges progress when the SAME account signs in again", () => {
    const remoteA: RemoteProgress = {
      ...emptyRemote,
      attempts: [attempt("a2", "2026-07-03T10:00:00Z")],
    };
    const next = hydrateAccountState(
      accountAState(),
      { tier: "free", cp: 50 },
      remoteA,
      "alice@example.com",
    );
    // Union of local (a1) + server (a2), nothing dropped.
    expect(next.attempts.map((a) => a.id).sort()).toEqual(["a1", "a2"]);
    // CP only grows for the same account: max(100, 50).
    expect(next.cp).toBe(100);
    expect(next.ownerEmail).toBe("alice@example.com");
  });

  it("is case-insensitive on the owner email", () => {
    const next = hydrateAccountState(
      accountAState(),
      { tier: "free", cp: 0 },
      emptyRemote,
      "ALICE@example.com",
    );
    // Same person despite casing — data kept.
    expect(next.attempts.map((a) => a.id)).toEqual(["a1"]);
  });

  it("adopts the account cleanly on a first sign-in (no prior owner)", () => {
    const fresh = defaultUserState(); // ownerEmail null
    const next = hydrateAccountState(fresh, { tier: "premium", cp: 5 }, emptyRemote, "new@example.com");
    expect(next.ownerEmail).toBe("new@example.com");
    expect(next.tier).toBe("premium");
    expect(next.cp).toBe(5);
  });
});
