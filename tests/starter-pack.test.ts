import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { STARTER_QUESTIONS, STARTER_FLASHCARDS, STARTER_SCENARIOS } from "@/lib/content/starter";
import { CONTENT_VERSION } from "@/lib/content/meta";
import {
  sampleDiagnostic,
  sampleMiniMock,
  sampleSectionDrill,
  SECTION_DRILL,
  SECTION_OF,
  type ExamSection,
} from "@/lib/diagnostic/select";
import { selectFlashcardQueue } from "@/lib/plan.queue";
import { forCode } from "@/lib/content/vehicle";
import { defaultUserState } from "@/lib/store/local-store";
import type { CategoryId, VehicleCode } from "@/types";

/**
 * The starter pack is the only content that reaches a browser without a paid
 * entitlement, so it has two jobs and both need holding:
 *
 *  1. It must be a faithful subset of the bank — it is generated, and a
 *     generated file nobody checks goes stale silently.
 *  2. It must be big enough that the entire free journey works from it alone,
 *     offline. If it is not, the free tier breaks in ways no unit test of the
 *     samplers would catch, because the samplers happily return short papers.
 */

const CODES: VehicleCode[] = ["8", "A", "14"];
const subjectOf = (q: { image?: string; sign?: string; id: string }) =>
  q.image ?? (q.sign ? `sign:${q.sign}` : `id:${q.id}`);

describe("starter pack — faithful subset", () => {
  it("every question matches the bank entry with the same id", () => {
    const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
    for (const q of STARTER_QUESTIONS) {
      const real = byId.get(q.id);
      expect(real, `starter question ${q.id} is not in the bank`).toBeDefined();
      expect(q).toEqual(real);
    }
  });

  it("every flashcard matches the bank entry with the same id", () => {
    const byId = new Map(FLASHCARDS.map((f) => [f.id, f]));
    for (const f of STARTER_FLASHCARDS) {
      const real = byId.get(f.id);
      expect(real, `starter flashcard ${f.id} is not in the bank`).toBeDefined();
      expect(f).toEqual(real);
    }
  });

  it("contains no duplicates", () => {
    expect(new Set(STARTER_QUESTIONS.map((q) => q.id)).size).toBe(STARTER_QUESTIONS.length);
    expect(new Set(STARTER_FLASHCARDS.map((f) => f.id)).size).toBe(STARTER_FLASHCARDS.length);
  });

  it("ships no scenarios — they are a paid feature", () => {
    expect(STARTER_SCENARIOS).toHaveLength(0);
  });

  it("is universal, so every licence code sees the same pack", () => {
    for (const code of CODES) {
      expect(forCode(STARTER_QUESTIONS, code)).toHaveLength(STARTER_QUESTIONS.length);
      expect(forCode(STARTER_FLASHCARDS, code)).toHaveLength(STARTER_FLASHCARDS.length);
    }
  });

  it("stays a small fraction of the bank", () => {
    // The whole point: most of the product is not in the bundle.
    expect(STARTER_QUESTIONS.length / QUESTIONS.length).toBeLessThan(0.2);
  });

  it("exposes a content version to key the cache on", () => {
    expect(CONTENT_VERSION).toMatch(/^[0-9a-f]{12}$/);
  });
});

describe("starter pack — the whole free journey works from it", () => {
  it("produces a full 15-question diagnostic covering every category", () => {
    for (const code of CODES) {
      const qs = sampleDiagnostic(STARTER_QUESTIONS, [], code);
      expect(qs).toHaveLength(15);
      const cats = new Set(qs.map((q) => q.categoryId));
      expect(cats.size, `code ${code} diagnostic covered only ${cats.size} categories`).toBe(7);
    }
  });

  it("produces a full 15-question mini mock", () => {
    for (const code of CODES) {
      expect(sampleMiniMock(STARTER_QUESTIONS, [], code)).toHaveLength(15);
    }
  });

  it("produces every section drill at full exam size", () => {
    for (const section of Object.keys(SECTION_DRILL) as ExamSection[]) {
      const qs = sampleSectionDrill(STARTER_QUESTIONS, section, [], "8");
      expect(qs, `${section} drill was short`).toHaveLength(SECTION_DRILL[section].total);
      // A drill that asks about the same road sign repeatedly feels shallow.
      expect(new Set(qs.map(subjectOf)).size).toBe(qs.length);
    }
  });

  it("fills a flashcard session", () => {
    const state = { ...defaultUserState(), onboarding: null };
    expect(selectFlashcardQueue(STARTER_FLASHCARDS, state, { limit: 12 })).toHaveLength(12);
  });

  it("has headroom so the free tier's three papers do not collide", () => {
    // Free lifetime allowance: one diagnostic (15) + one mini mock (15) + one
    // drill (up to 28). Comfortably distinct pools per exam section.
    for (const section of Object.keys(SECTION_DRILL) as ExamSection[]) {
      const pool = STARTER_QUESTIONS.filter((q) => SECTION_OF[q.categoryId] === section);
      expect(pool.length, `${section} has no rotation headroom`).toBeGreaterThanOrEqual(
        SECTION_DRILL[section].total * 2,
      );
    }
  });

  it("covers every category the diagnostic plan asks for", () => {
    const cats: CategoryId[] = [
      "signs",
      "rules",
      "controls",
      "intersections",
      "hazard_awareness",
      "parking",
      "following_distance",
    ];
    for (const c of cats) {
      expect(
        STARTER_QUESTIONS.filter((q) => q.categoryId === c).length,
        `category ${c} is thin in the starter pack`,
      ).toBeGreaterThanOrEqual(10);
    }
  });
});
