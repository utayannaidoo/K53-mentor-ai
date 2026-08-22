import { describe, expect, it } from "vitest";
import {
  MAX_DRAFT_AGE_MS,
  MOCK_DRAFT_KEY,
  clearMockDraft,
  loadDiagnosticDraft,
  loadMockDraft,
  saveDiagnosticDraft,
  saveMockDraft,
  scaledPassMark,
  validateDiagnosticDraft,
  validateMockDraft,
  type DiagnosticDraft,
  type ExamDraft,
} from "@/lib/study/exam-draft";

/**
 * Node-env stand-in for window.localStorage — same pattern as
 * local-store.test.ts's withStoredBlob, but with set/remove so the
 * save/load/clear round-trip can be exercised against real code paths.
 */
function withLocalStorage(fn: () => void): void {
  const store = new Map<string, string>();
  const prevWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
  };
  try {
    fn();
  } finally {
    (globalThis as { window?: unknown }).window = prevWindow;
  }
}

/** Corrupt whatever key holds — simulates a truncated/interrupted write. */
function seedRaw(key: string, raw: string): void {
  // Runs inside withLocalStorage; writes through its stub.
  window.localStorage.setItem(key, raw);
}

let seq = 0;
function mockDraft(overrides: Partial<ExamDraft> = {}): ExamDraft {
  seq += 1;
  return {
    kind: "mock",
    savedAt: new Date().toISOString(),
    ownerProfileId: "user_1",
    mode: "mini",
    drillSection: null,
    questionIds: [`q_${seq}_a`, `q_${seq}_b`, `q_${seq}_c`],
    answers: [0, -1, 2],
    index: 1,
    deadlineMs: Date.now() + 10 * 60 * 1000,
    secondsAllotted: 12 * 60,
    ...overrides,
  };
}

const BANK = ["q_a", "q_b", "q_c", "q_d"];

function mockOpts(overrides: Partial<Parameters<typeof validateMockDraft>[1]> = {}) {
  return {
    profileId: "user_1" as string | null,
    mode: "mini" as ExamDraft["mode"],
    drillSection: null as string | null,
    secondsAllotted: 12 * 60,
    bankQuestionIds: new Set(BANK),
    maxAgeMs: MAX_DRAFT_AGE_MS,
    ...overrides,
  };
}

describe("mock draft storage", () => {
  it("round-trips through localStorage", () => {
    withLocalStorage(() => {
      const d = mockDraft();
      saveMockDraft(d);
      expect(loadMockDraft()).toEqual(d);
      clearMockDraft();
      expect(loadMockDraft()).toBeNull();
    });
  });

  it("treats corrupt JSON as no draft at all", () => {
    withLocalStorage(() => {
      seedRaw(MOCK_DRAFT_KEY, '{"kind":"mock","questionIds":[');
      expect(loadMockDraft()).toBeNull();
    });
  });

  it("refuses a structurally wrong blob instead of crashing validation", () => {
    withLocalStorage(() => {
      seedRaw(MOCK_DRAFT_KEY, JSON.stringify({ kind: "mock", questionIds: "nope" }));
      expect(loadMockDraft()).toBeNull();
    });
  });
});

describe("validateMockDraft", () => {
  it("accepts a draft that matches the current session", () => {
    const d = mockDraft({ questionIds: BANK.slice(0, 3), answers: [0, -1, 2], index: 1 });
    expect(validateMockDraft(d, mockOpts())).toEqual({ ok: true, draft: d });
  });

  it("rejects a draft older than the max age", () => {
    const old = mockDraft({
      savedAt: new Date(Date.now() - MAX_DRAFT_AGE_MS - 60_000).toISOString(),
    });
    expect(validateMockDraft(old, mockOpts())).toMatchObject({ ok: false, reason: "stale" });
  });

  it("rejects an unparseable savedAt rather than guessing", () => {
    const d = mockDraft({ savedAt: "not-a-date" });
    expect(validateMockDraft(d, mockOpts())).toMatchObject({ ok: false, reason: "stale" });
  });

  it("rejects an owner mismatch in both directions", () => {
    const otherUser = mockDraft({ ownerProfileId: "user_2" });
    expect(validateMockDraft(otherUser, mockOpts())).toMatchObject({ ok: false, reason: "owner" });
    // A guest-started paper offered to a signed-in profile is just as foreign.
    const guest = mockDraft({ ownerProfileId: null });
    expect(
      validateMockDraft(guest, mockOpts({ profileId: "user_1" })),
    ).toMatchObject({ ok: false, reason: "owner" });
  });

  it("rejects a mode mismatch", () => {
    const full = mockDraft({ mode: "full" });
    expect(validateMockDraft(full, mockOpts())).toMatchObject({ ok: false, reason: "mode" });
  });

  it("rejects a drill-section mismatch", () => {
    const signs = mockDraft({ mode: "drill", drillSection: "signs", secondsAllotted: 1560 });
    expect(
      validateMockDraft(
        signs,
        mockOpts({ mode: "drill", drillSection: "rules", secondsAllotted: 1560 }),
      ),
    ).toMatchObject({ ok: false, reason: "mode" });
  });

  it("rejects two minis of different lengths sharing one mode", () => {
    // ?mode=mini&n=20 vs ?mode=mini&n=15 — same mode, different clock. Without
    // the allotment check the resumed paper would run on the wrong deadline.
    const long = mockDraft({ secondsAllotted: 20 * 48 });
    expect(validateMockDraft(long, mockOpts())).toMatchObject({ ok: false, reason: "mode" });
  });

  it("rejects a draft referencing questions outside the loaded bank", () => {
    const d = mockDraft({ questionIds: [...BANK.slice(0, 2), "ghost_question"] });
    expect(validateMockDraft(d, mockOpts())).toMatchObject({ ok: false, reason: "bank" });
  });

  it("rejects answers/index that do not fit the question list", () => {
    const shortAnswers = mockDraft({ questionIds: BANK.slice(0, 3), answers: [0, -1] });
    expect(validateMockDraft(shortAnswers, mockOpts())).toMatchObject({
      ok: false,
      reason: "shape",
    });
    const badIndex = mockDraft({ questionIds: BANK.slice(0, 3), index: 3 });
    expect(validateMockDraft(badIndex, mockOpts())).toMatchObject({ ok: false, reason: "shape" });
    const empty = mockDraft({ questionIds: [], answers: [], index: 0 });
    expect(validateMockDraft(empty, mockOpts())).toMatchObject({ ok: false, reason: "shape" });
  });
});

describe("diagnostic draft storage + validation", () => {
  function diagDraft(overrides: Partial<DiagnosticDraft> = {}): DiagnosticDraft {
    seq += 1;
    return {
      kind: "diagnostic",
      savedAt: new Date().toISOString(),
      ownerProfileId: "user_1",
      questionIds: [`d_${seq}_a`, `d_${seq}_b`],
      responses: [{ questionId: `d_${seq}_a`, selectedIndex: 1 }],
      index: 1,
      ...overrides,
    };
  }

  it("round-trips through localStorage", () => {
    withLocalStorage(() => {
      const d = diagDraft();
      saveDiagnosticDraft(d);
      expect(loadDiagnosticDraft()).toEqual(d);
    });
  });

  it("applies the same age/owner/bank rules", () => {
    withLocalStorage(() => {
      const opts = { profileId: "user_1", bankQuestionIds: new Set(BANK), maxAgeMs: MAX_DRAFT_AGE_MS };
      const fresh = diagDraft({ questionIds: BANK.slice(0, 2), responses: [{ questionId: BANK[0], selectedIndex: 1 }] });
      expect(validateDiagnosticDraft(fresh, opts)).toEqual({ ok: true, draft: fresh });
      expect(
        validateDiagnosticDraft(fresh, { ...opts, profileId: "someone_else" }),
      ).toMatchObject({ ok: false, reason: "owner" });
      expect(
        validateDiagnosticDraft(fresh, { ...opts, bankQuestionIds: new Set(["other"]) }),
      ).toMatchObject({ ok: false, reason: "bank" });
      const stray = diagDraft({
        questionIds: BANK.slice(0, 2),
        responses: [{ questionId: "stray", selectedIndex: 0 }],
      });
      expect(validateDiagnosticDraft(stray, opts)).toMatchObject({ ok: false, reason: "shape" });
    });
  });
});

describe("scaledPassMark", () => {
  it("scales proportionally when the paper comes up short", () => {
    // 16/20 asked of a 15-question bank → ceil(15 × 16 / 20).
    expect(scaledPassMark(20, 16, 15)).toBe(12);
  });

  it("leaves papers at or above the requested size untouched", () => {
    expect(scaledPassMark(20, 16, 20)).toBe(16);
    expect(scaledPassMark(20, 16, 25)).toBe(16);
  });

  it("never scales below 1", () => {
    expect(scaledPassMark(20, 16, 1)).toBe(1);
    expect(scaledPassMark(64, 30, 1)).toBe(1);
  });

  it("lands exactly on whole-number ratios without drift", () => {
    expect(scaledPassMark(15, 12, 5)).toBe(4); // 5 × 12/15
    expect(scaledPassMark(10, 5, 4)).toBe(2);
    expect(scaledPassMark(28, 22, 14)).toBe(11);
  });
});
