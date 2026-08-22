/**
 * Mid-exam crash/reload insurance.
 *
 * A mock exam or diagnostic is the longest uninterrupted surface in the app —
 * up to 60 minutes for a full paper. Until now, a closed tab, dead battery or
 * accidental refresh threw the whole paper away, along with everything that
 * was about to happen because of it (the score row, CP, readiness update).
 * These helpers persist just enough state to put the paper back on the desk
 * exactly where the learner left it.
 *
 * Deliberately NOT stored: the sampled Question objects themselves. Only ids
 * travel through localStorage — the paper is rebuilt by mapping those ids
 * through whatever bank is loaded when the learner returns (see the resume
 * paths in mock-exam.tsx / diagnostic-runner.tsx). One consequence worth
 * naming: options are re-shuffled at sample time with Math.random, so a
 * resumed question shows its options in a different order than before the
 * reload. Grading stays internally consistent (displayed options and
 * correctIndex both come from the same rebuilt object), which is what matters.
 *
 * All storage access is wrapped like local-store.ts: private mode and quota
 * errors must never break the exam itself — persistence here is best-effort.
 */

/** Draft of an in-progress mock exam / mini / drill (kinds share one key). */
export interface ExamDraft {
  kind: "mock";
  savedAt: string; // ISO
  /** profile.id of the learner who started the paper, or null in demo mode. */
  ownerProfileId: string | null;
  mode: "full" | "mini" | "drill";
  drillSection: string | null;
  questionIds: string[];
  /** -1 = unanswered, same convention as the exam component's answers array. */
  answers: number[];
  index: number;
  /** Absolute epoch ms when the paper expires. */
  deadlineMs: number;
  secondsAllotted: number;
}

/** Draft of an in-progress placement diagnostic. No timer, so no deadline. */
export interface DiagnosticDraft {
  kind: "diagnostic";
  savedAt: string; // ISO
  ownerProfileId: string | null;
  questionIds: string[];
  responses: { questionId: string; selectedIndex: number }[];
  index: number;
}

export const MOCK_DRAFT_KEY = "k53mentor.draft.mock.v1";
export const DIAGNOSTIC_DRAFT_KEY = "k53mentor.draft.diagnostic.v1";

/**
 * A draft older than half a day is not "an unfinished paper", it is debris —
 * deadlines have long expired and the bank has probably moved on. Cleared on
 * load rather than offered as a resume nobody can use.
 */
export const MAX_DRAFT_AGE_MS = 12 * 60 * 60 * 1000;

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null; // corrupt JSON — treated exactly like no draft at all
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Structural guard between JSON.parse and typed land. A hand-edited or
 * partially-written blob must fail validation cleanly instead of crashing a
 * render with `answers.map is not a function`.
 */
function isExamDraftLike(v: unknown): v is ExamDraft {
  if (typeof v !== "object" || v === null) return false;
  const d = v as Partial<ExamDraft>;
  return (
    d.kind === "mock" &&
    typeof d.savedAt === "string" &&
    typeof d.mode === "string" &&
    Array.isArray(d.questionIds) &&
    d.questionIds.every((id) => typeof id === "string") &&
    Array.isArray(d.answers) &&
    d.answers.every((a) => typeof a === "number") &&
    typeof d.index === "number" &&
    Number.isFinite(d.deadlineMs) &&
    typeof d.secondsAllotted === "number"
  );
}

function isDiagnosticDraftLike(v: unknown): v is DiagnosticDraft {
  if (typeof v !== "object" || v === null) return false;
  const d = v as Partial<DiagnosticDraft>;
  return (
    d.kind === "diagnostic" &&
    typeof d.savedAt === "string" &&
    Array.isArray(d.questionIds) &&
    d.questionIds.every((id) => typeof id === "string") &&
    Array.isArray(d.responses) &&
    d.responses.every(
      (r) =>
        typeof r === "object" &&
        r !== null &&
        typeof r.questionId === "string" &&
        typeof r.selectedIndex === "number",
    ) &&
    typeof d.index === "number"
  );
}

// ── Mock exam ────────────────────────────────────────────────────────────────

export function loadMockDraft(): ExamDraft | null {
  const raw = readJson(MOCK_DRAFT_KEY);
  return isExamDraftLike(raw) ? raw : null;
}

export function saveMockDraft(d: ExamDraft): void {
  writeJson(MOCK_DRAFT_KEY, d);
}

export function clearMockDraft(): void {
  removeKey(MOCK_DRAFT_KEY);
}

export type MockDraftOwner = { profileId: string | null };
type MockDraftVerdict =
  | { ok: true; draft: ExamDraft }
  | { ok: false; reason: "missing" | "stale" | "owner" | "mode" | "shape" | "bank" };

/**
 * Decide whether a saved draft may be offered back to the learner.
 *
 * Every rule exists because localStorage outlives context the draft depends
 * on: the account signed in, the URL parameters that picked this paper, and —
 * critically — the content bank itself, which may still be the bundled starter
 * pack when the resume check runs (the full pack arrives asynchronously). A
 * draft whose questions aren't all resolvable is refused rather than silently
 * shortened: sitting 58 of the 64 questions you started is worse than starting
 * over.
 */
export function validateMockDraft(
  d: ExamDraft | null,
  opts: {
    profileId: string | null;
    mode: ExamDraft["mode"];
    drillSection: string | null;
    /** Expected allotment for THIS url — catches two minis of different n. */
    secondsAllotted: number;
    bankQuestionIds: Set<string>;
    maxAgeMs: number;
  },
): MockDraftVerdict {
  if (!d) return { ok: false, reason: "missing" };
  // An unparseable savedAt means we can't tell how old it is — refuse.
  const age = Date.now() - Date.parse(d.savedAt);
  if (!Number.isFinite(age) || age > opts.maxAgeMs) return { ok: false, reason: "stale" };
  // Strict equality covers every combination the spec calls a mismatch,
  // including null draft owner vs a signed-in profile (null !== "user_…").
  if (d.ownerProfileId !== opts.profileId) return { ok: false, reason: "owner" };
  // Mode AND its exact configuration must match the current url. Two mini
  // lengths share mode "mini"; comparing allotted seconds is what tells a
  // 20-question draft apart from the 15-question page it was opened on.
  if (
    d.mode !== opts.mode ||
    d.drillSection !== opts.drillSection ||
    d.secondsAllotted !== opts.secondsAllotted
  ) {
    return { ok: false, reason: "mode" };
  }
  if (
    d.questionIds.length === 0 ||
    d.answers.length !== d.questionIds.length ||
    d.index < 0 ||
    d.index >= d.questionIds.length
  ) {
    return { ok: false, reason: "shape" };
  }
  for (const id of d.questionIds) {
    if (!opts.bankQuestionIds.has(id)) return { ok: false, reason: "bank" };
  }
  return { ok: true, draft: d };
}

// ── Diagnostic ───────────────────────────────────────────────────────────────

export function loadDiagnosticDraft(): DiagnosticDraft | null {
  const raw = readJson(DIAGNOSTIC_DRAFT_KEY);
  return isDiagnosticDraftLike(raw) ? raw : null;
}

export function saveDiagnosticDraft(d: DiagnosticDraft): void {
  writeJson(DIAGNOSTIC_DRAFT_KEY, d);
}

export function clearDiagnosticDraft(): void {
  removeKey(DIAGNOSTIC_DRAFT_KEY);
}

type DiagnosticDraftVerdict =
  | { ok: true; draft: DiagnosticDraft }
  | { ok: false; reason: "missing" | "stale" | "owner" | "shape" | "bank" };

/** Same rules as validateMockDraft, minus timer/mode concerns. */
export function validateDiagnosticDraft(
  d: DiagnosticDraft | null,
  opts: {
    profileId: string | null;
    bankQuestionIds: Set<string>;
    maxAgeMs: number;
  },
): DiagnosticDraftVerdict {
  if (!d) return { ok: false, reason: "missing" };
  const age = Date.now() - Date.parse(d.savedAt);
  if (!Number.isFinite(age) || age > opts.maxAgeMs) return { ok: false, reason: "stale" };
  if (d.ownerProfileId !== opts.profileId) return { ok: false, reason: "owner" };
  if (d.questionIds.length === 0 || d.index < 0 || d.index >= d.questionIds.length) {
    return { ok: false, reason: "shape" };
  }
  // Every recorded response must belong to this paper — responses are what
  // gets replayed into the result, so a stray id would poison the scoring.
  const ids = new Set(d.questionIds);
  for (const r of d.responses) {
    if (!ids.has(r.questionId)) return { ok: false, reason: "shape" };
  }
  for (const id of d.questionIds) {
    if (!opts.bankQuestionIds.has(id)) return { ok: false, reason: "bank" };
  }
  return { ok: true, draft: d };
}

// ── Pass-mark scaling ────────────────────────────────────────────────────────

/**
 * The pass mark for a paper shorter than requested.
 *
 * Minis and drills advertise "pass at N correct" computed from their REQUESTED
 * length. When the bank comes up thin (starter pack, narrow licence code) the
 * sampler quietly returns fewer questions — but the mark stayed at the
 * requested one, so a 12/15 could be graded against a 16/20 bar. Scaling keeps
 * the pass RATIO honest: the learner is judged on the proportion they were
 * actually set, not punished for content they were never shown.
 *
 * Ceil (not round) so a scaled mark never rounds down below the ratio, and a
 * floor of 1 means even a single-question paper is passable rather than
 * mathematically impossible.
 */
export function scaledPassMark(requestedTotal: number, requestedMark: number, actualTotal: number): number {
  if (!(requestedTotal > 0)) return Math.max(1, requestedMark);
  // At or above the requested size there is nothing to scale — the advertised
  // mark stands unchanged (this is the path every full 64-question paper takes).
  if (actualTotal >= requestedTotal) return Math.max(1, requestedMark);
  return Math.max(1, Math.ceil((actualTotal * requestedMark) / requestedTotal));
}
