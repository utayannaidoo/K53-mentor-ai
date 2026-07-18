import { describe, expect, it } from "vitest";
import { GENERATED_SIGN_QUESTIONS } from "@/lib/content/signs-generated";
import { QUESTIONS } from "@/lib/content/questions";
import { SIGNS_BY_ID, hasVerifiedName } from "@/lib/content/signs";
import type { Question } from "@/types";

/**
 * The generated signs pack recombines catalogue text rather than authoring it,
 * so the risk it carries is not "is this fact right" but "did a bad slice of
 * OCR reach a learner as an answer". These tests guard that boundary.
 */
describe("generated sign questions", () => {
  it("produces a meaningful number of questions", () => {
    expect(GENERATED_SIGN_QUESTIONS.length).toBeGreaterThan(120);
  });

  it("gives every question exactly four distinct options", () => {
    for (const q of GENERATED_SIGN_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
    }
  });

  it("points correctIndex at a real option", () => {
    for (const q of GENERATED_SIGN_QUESTIONS) {
      expect(q.options[q.correctIndex]).toBeTruthy();
    }
  });

  it("never uses an OCR caption fragment as an option", () => {
    // These strings appear in the catalogue's name field as artefacts of the
    // manual's layout. None of them is a road sign, so none may be an answer.
    const junk = /^(examples?|may not|or under certain conditions|applies\b|note:|in this case)/i;
    const offenders = GENERATED_SIGN_QUESTIONS.filter((q) =>
      q.options.some((o) => junk.test(o.trim())),
    );
    expect(offenders.map((q) => q.id)).toEqual([]);
  });

  it("only asks a learner to name signs whose name is hand-verified", () => {
    const naming = GENERATED_SIGN_QUESTIONS.filter(
      (q) => q.id.endsWith("-name") || q.id.endsWith("-reverse"),
    );
    expect(naming.length).toBeGreaterThan(0);
    for (const q of naming) {
      const signId = q.id.replace(/^gen-sign-/, "").replace(/-(name|reverse)$/, "");
      expect(hasVerifiedName({ id: signId })).toBe(true);
      // Every option is a name, so every option must be verified too.
      const verifiedNames = new Set(
        Object.values(SIGNS_BY_ID)
          .filter(hasVerifiedName)
          .map((s) => s.name),
      );
      for (const opt of q.options) expect(verifiedNames.has(opt)).toBe(true);
    }
  });

  it("shows an image for recognition forms and withholds it for recall", () => {
    for (const q of GENERATED_SIGN_QUESTIONS) {
      if (q.id.endsWith("-reverse")) expect(q.image).toBeUndefined();
      else expect(q.image).toMatch(/^\/signs\//);
    }
  });

  it("is deterministic across evaluations", async () => {
    const again = (await import("@/lib/content/signs-generated")).GENERATED_SIGN_QUESTIONS;
    expect(again.map((q) => q.id + q.options.join("|"))).toEqual(
      GENERATED_SIGN_QUESTIONS.map((q) => q.id + q.options.join("|")),
    );
  });

  it("spreads difficulty rather than grading everything hard", () => {
    // A beginner's first session is sorted easyFirst(), so if these all landed
    // on difficulty 3 they would be invisible to exactly the learner who most
    // needs sign practice. Guard the shape, not exact counts.
    const spread = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
    for (const q of GENERATED_SIGN_QUESTIONS) spread[q.difficulty]++;
    expect(spread[1]).toBeGreaterThan(20);
    expect(spread[2]).toBeGreaterThan(20);
    // No single band may swallow the pack.
    for (const band of [1, 2, 3]) {
      expect(spread[band] / GENERATED_SIGN_QUESTIONS.length).toBeLessThan(0.75);
    }
  });

  it("grades the image-less recall form as the hardest", () => {
    for (const q of GENERATED_SIGN_QUESTIONS) {
      if (q.id.endsWith("-reverse")) expect(q.difficulty).toBe(3);
    }
  });

  it("introduces no duplicate ids into the bank", () => {
    const ids = QUESTIONS.map((q: Question) => q.id);
    expect(ids.length).toBe(new Set(ids).size);
  });
});
