import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/content/questions";
import { FLASHCARDS } from "@/lib/content/flashcards";
import { SCENARIOS } from "@/lib/content/scenarios";
import { DRIVER_MODULES } from "@/lib/content/driver-modules";
import { QUESTION_DIFFICULTY, FLASHCARD_META, SCENARIO_META, MODULE_META } from "@/lib/content/meta";

/**
 * meta.ts is generated (scripts/gen-content-meta.mjs) and is what the study
 * store plans from, so the bank itself stays out of every route that mounts the
 * store. A generated file that nobody checks is a file that silently goes stale:
 * add a content pack, forget to regenerate, and the new cards are simply never
 * scheduled — no error, no failing build, just a study plan quietly missing
 * material a learner paid for.
 *
 * So assert parity in both directions, and assert the projection stays narrow:
 * the moment an answer or an explanation appears in meta.ts, the leak this
 * whole split exists to prevent is back.
 */

const codesOf = (i: { codes?: readonly string[] }) =>
  Array.isArray(i.codes) && i.codes.length ? [...i.codes] : undefined;

describe("content meta index", () => {
  it("covers every question, with the same difficulty", () => {
    expect(Object.keys(QUESTION_DIFFICULTY)).toHaveLength(QUESTIONS.length);
    for (const q of QUESTIONS) {
      expect(QUESTION_DIFFICULTY[q.id], `question ${q.id} missing from meta`).toBe(q.difficulty ?? 1);
    }
  });

  it("covers every flashcard, with the same category and licence codes", () => {
    expect(FLASHCARD_META).toHaveLength(FLASHCARDS.length);
    const byId = new Map(FLASHCARD_META.map((m) => [m.id, m]));
    for (const f of FLASHCARDS) {
      const m = byId.get(f.id);
      expect(m, `flashcard ${f.id} missing from meta`).toBeDefined();
      expect(m!.categoryId).toBe(f.categoryId);
      expect(codesOf(m!)).toEqual(codesOf(f));
    }
  });

  it("covers every scenario, with the same category, codes and title", () => {
    expect(SCENARIO_META).toHaveLength(SCENARIOS.length);
    const byId = new Map(SCENARIO_META.map((m) => [m.id, m]));
    for (const s of SCENARIOS) {
      const m = byId.get(s.id);
      expect(m, `scenario ${s.id} missing from meta`).toBeDefined();
      expect(m!.categoryId).toBe(s.categoryId);
      expect(codesOf(m!)).toEqual(codesOf(s));
      // generateTodayPlan renders this as the task subtitle.
      expect(m!.title).toBe(s.title);
    }
  });

  it("has no stale entries pointing at content that no longer exists", () => {
    const qIds = new Set(QUESTIONS.map((q) => q.id));
    const fIds = new Set(FLASHCARDS.map((f) => f.id));
    const sIds = new Set(SCENARIOS.map((s) => s.id));
    for (const id of Object.keys(QUESTION_DIFFICULTY)) expect(qIds.has(id), `stale question ${id}`).toBe(true);
    for (const m of FLASHCARD_META) expect(fIds.has(m.id), `stale flashcard ${m.id}`).toBe(true);
    for (const m of SCENARIO_META) expect(sIds.has(m.id), `stale scenario ${m.id}`).toBe(true);
  });

  it("covers every yard-test module, with the fields the locked page shows", () => {
    expect(MODULE_META).toHaveLength(DRIVER_MODULES.length);
    const byId = new Map(MODULE_META.map((m) => [m.id, m]));
    for (const mod of DRIVER_MODULES) {
      const m = byId.get(mod.id);
      expect(m, `module ${mod.id} missing from meta`).toBeDefined();
      expect(m!.name).toBe(mod.name);
      expect(m!.summary).toBe(mod.summary);
      expect(m!.difficulty).toBe(mod.difficulty);
      expect(m!.estMinutes).toBe(mod.estMinutes);
      // The teaser shows "N steps" and an N-denominated progress bar.
      expect(m!.stepCount).toBe(mod.steps.length);
      expect(m!.group).toBe(mod.group);
    }
  });

  it("carries no yard-test instructions — those are the paid part", () => {
    for (const m of MODULE_META as unknown as Record<string, unknown>[]) {
      for (const banned of ["steps", "commonFaults", "instruction", "tip"]) {
        expect(m[banned], `module meta ${String(m.id)} exposes "${banned}"`).toBeUndefined();
      }
    }
  });

  it("leaks nothing a learner is paying to see", () => {
    // The whole point of the split: shape only, never the material.
    const entries = [...FLASHCARD_META, ...SCENARIO_META] as unknown as Record<string, unknown>[];
    for (const m of entries) {
      for (const banned of ["prompt", "options", "correctIndex", "explanation", "front", "back", "choices", "debrief", "situation"]) {
        expect(m[banned], `meta entry ${String(m.id)} exposes "${banned}"`).toBeUndefined();
      }
    }
  });
});
