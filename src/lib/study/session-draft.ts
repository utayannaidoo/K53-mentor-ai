/**
 * Reload insurance for the short, non-timed study surfaces.
 *
 * Attempts and card reviews are persisted by the study store as they happen,
 * but the sampled queue is intentionally component-local. Without this small
 * companion draft, a refresh creates a different queue at question/card one
 * even though the learner's completed work is safely recorded.
 */
import type { Question } from "@/types";

const PRACTICE_KEY = "k53mentor.draft.practice.v1";
const FLASHCARD_KEY = "k53mentor.draft.flashcards.v1";
export const MAX_SESSION_DRAFT_AGE_MS = 12 * 60 * 60 * 1000;

export interface PracticeDraft {
  kind: "practice";
  savedAt: string;
  ownerProfileId: string | null;
  signature: string;
  questions: Question[];
  answers: (number | null)[];
  index: number;
}

export interface FlashcardDraft {
  kind: "flashcards";
  savedAt: string;
  ownerProfileId: string | null;
  signature: string;
  cardIds: string[];
  index: number;
}

function read(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Best effort: private mode/quota must not interrupt study. */
  }
}

function clear(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function current(d: { savedAt: string; ownerProfileId: string | null; signature: string }, owner: string | null, signature: string): boolean {
  const age = Date.now() - Date.parse(d.savedAt);
  return Number.isFinite(age) && age >= 0 && age <= MAX_SESSION_DRAFT_AGE_MS && d.ownerProfileId === owner && d.signature === signature;
}

function isPracticeDraft(value: unknown): value is PracticeDraft {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Partial<PracticeDraft>;
  return d.kind === "practice" && typeof d.savedAt === "string" && typeof d.signature === "string" && Array.isArray(d.questions) && d.questions.every((q) => typeof q === "object" && q !== null && typeof q.id === "string") && Array.isArray(d.answers) && d.answers.every((a) => a === null || typeof a === "number") && typeof d.index === "number";
}

function isFlashcardDraft(value: unknown): value is FlashcardDraft {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Partial<FlashcardDraft>;
  return d.kind === "flashcards" && typeof d.savedAt === "string" && typeof d.signature === "string" && Array.isArray(d.cardIds) && d.cardIds.every((id) => typeof id === "string") && typeof d.index === "number";
}

export function loadPracticeDraft(owner: string | null, signature: string, bankIds: Set<string>): PracticeDraft | null {
  const raw = read(PRACTICE_KEY);
  if (!isPracticeDraft(raw) || !current(raw, owner, signature) || raw.questions.length === 0 || raw.answers.length !== raw.questions.length || raw.index < 0 || raw.index >= raw.questions.length || raw.questions.some((q) => !bankIds.has(q.id))) return null;
  return raw;
}

export function savePracticeDraft(draft: PracticeDraft): void { write(PRACTICE_KEY, draft); }
export function clearPracticeDraft(): void { clear(PRACTICE_KEY); }

export function loadFlashcardDraft(owner: string | null, signature: string, bankIds: Set<string>): FlashcardDraft | null {
  const raw = read(FLASHCARD_KEY);
  if (!isFlashcardDraft(raw) || !current(raw, owner, signature) || raw.cardIds.length === 0 || raw.index < 0 || raw.index >= raw.cardIds.length || raw.cardIds.some((id) => !bankIds.has(id))) return null;
  return raw;
}

export function saveFlashcardDraft(draft: FlashcardDraft): void { write(FLASHCARD_KEY, draft); }
export function clearFlashcardDraft(): void { clear(FLASHCARD_KEY); }
