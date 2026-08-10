import { describe, expect, it } from "vitest";
import { GENERATED_SIGN_QUESTIONS } from "@/lib/content/signs-generated";
import { QUESTIONS } from "@/lib/content/questions";
import {
  SIGNS_BY_ID,
  hasVerifiedName,
  hasCompositeImage,
  COMPOSITE_IMAGE_IDS,
} from "@/lib/content/signs";
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

  it("never lets the prompt give the answer away", () => {
    // A generated question must not be answerable by matching a word in the
    // prompt to a word in an option. This retired an entire framing: asking
    // which sign means "Railway crossing." with "Railway crossing" on the list.
    const STOP = new Set([
      "the", "a", "an", "is", "are", "to", "of", "in", "on", "at", "and", "or", "this", "that",
      "it", "you", "your", "may", "must", "not", "be", "from", "with", "for", "as", "sign",
      "road", "which", "means", "other", "vehicles",
    ]);
    const words = (s: string) =>
      new Set(
        s
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 2 && !STOP.has(w)),
      );
    const guessable = GENERATED_SIGN_QUESTIONS.filter((q) => {
      const p = words(q.prompt);
      const overlap = q.options.map((o) => [...words(o)].filter((w) => p.has(w)).length);
      const correct = overlap[q.correctIndex];
      const best = Math.max(...overlap.filter((_, i) => i !== q.correctIndex));
      return correct > best;
    });
    expect(guessable.map((q) => q.id)).toEqual([]);
  });

  it("only asks a learner to name signs whose name is hand-verified", () => {
    const naming = GENERATED_SIGN_QUESTIONS.filter((q) => q.id.endsWith("-name"));
    expect(naming.length).toBeGreaterThan(0);
    for (const q of naming) {
      const signId = q.id.replace(/^gen-sign-/, "").replace(/-name$/, "");
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

  it("always shows the sign it is asking about", () => {
    for (const q of GENERATED_SIGN_QUESTIONS) expect(q.image).toMatch(/^\/signs\//);
  });

  it("keys both forms of a sign to the same image so a paper can't ask twice", () => {
    // Paper building dedupes on the image path. Both forms must therefore carry
    // the *same* image as any hand-authored question about that sign — keying
    // them on anything else (a sign id, say) silently splits the subject in two
    // and lets both land in one paper.
    const byImage = new Map<string, Set<string>>();
    for (const q of GENERATED_SIGN_QUESTIONS) {
      expect(q.image, q.id).toBeTruthy();
      const signId = q.id.replace(/^gen-sign-/, "").replace(/-(meaning|name)$/, "");
      const set = byImage.get(q.image!) ?? new Set<string>();
      set.add(signId);
      byImage.set(q.image!, set);
    }
    for (const [image, signs] of byImage) {
      expect([...signs], `${image} maps to more than one sign`).toHaveLength(1);
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

  it("introduces no duplicate ids into the bank", () => {
    const ids = QUESTIONS.map((q: Question) => q.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  /**
   * Six catalogue entries pair a multi-sign image with a single sign's meaning,
   * because the extractor sliced a stacked column of signs as one picture. Three
   * of them were reaching learners as "what does this sign mean?" over a picture
   * of two or three different signs — and warning-027-06's stated meaning
   * ("Slow moving vehicles ahead") belongs to neither sign shown.
   *
   * Asked of the whole bank, not just the generated pack, because the same
   * images are reachable through signImg() from a hand-authored question.
   */
  it("never asks about an image that contains more than one sign", () => {
    const bad = QUESTIONS.filter((q: Question) => {
      const sign = q.sign ? SIGNS_BY_ID[q.sign] : undefined;
      if (sign && hasCompositeImage(sign)) return true;
      // Hand-authored items carry the path rather than the id.
      return Boolean(
        q.image &&
          [...COMPOSITE_IMAGE_IDS].some((id) => q.image === SIGNS_BY_ID[id]?.image),
      );
    });
    expect(bad.map((q) => `${q.id} → ${q.sign ?? q.image}`)).toEqual([]);
  });

  it("keeps the composite quarantine documented and non-empty", () => {
    // If this ever empties, it means the images were re-extracted (good) or the
    // set was deleted without fixing them (bad). Either way it deserves a look.
    expect(COMPOSITE_IMAGE_IDS.size).toBeGreaterThan(0);
    for (const id of COMPOSITE_IMAGE_IDS) {
      expect(SIGNS_BY_ID[id], `${id} is quarantined but not in the catalogue`).toBeDefined();
    }
  });
});
