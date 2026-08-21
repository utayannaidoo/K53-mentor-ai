import { describe, expect, it } from "vitest";
import { computeReadiness, MIN_EVIDENCE_FOR_CONFIDENCE } from "@/lib/diagnostic/scoring";
import { defaultUserState } from "@/lib/store/local-store";
import type { QuestionAttempt } from "@/types";

/**
 * The readiness model must not mistake a lucky answer for mastery — but it
 * must also let a long perfect run clear real thresholds. Both directions are
 * pinned here; either one regressing silently corrupts every number a learner
 * is shown.
 */

let seq = 0;
function attempt(correct: boolean, categoryId: Category = "signs"): QuestionAttempt {
  seq += 1;
  return {
    id: `a${seq}`,
    questionId: `q${seq}`,
    categoryId,
    selectedIndex: correct ? 0 : 1,
    correct,
    context: "practice",
    at: new Date(Date.UTC(2026, 7, 1)).toISOString(),
  };
}
type Category = QuestionAttempt["categoryId"];

function stateWith(attempts: QuestionAttempt[]) {
  return { ...defaultUserState(), attempts };
}

describe("readiness evidence handling", () => {
  it("one lucky answer does not read as mastery", () => {
    // The old raw average scored this category 100%, and the predicted-pass
    // figure built on it followed. It must land well short of that now.
    const r = computeReadiness(stateWith([attempt(true)]));
    expect(r.perCategory.signs).toBeLessThan(60);
    expect(r.passProbability).toBeLessThan(10);
  });

  it("is still not measured on a couple of answers", () => {
    const r = computeReadiness(stateWith([attempt(true), attempt(false), attempt(true)]));
    expect(r.measured).toBe(false);
  });

  it("becomes measured once enough questions have real answers", () => {
    const attempts = Array.from({ length: MIN_EVIDENCE_FOR_CONFIDENCE }, () => attempt(true));
    const r = computeReadiness(stateWith(attempts));
    expect(r.measured).toBe(true);
  });

  it("a long perfect run clears promotion thresholds without hitting certainty", () => {
    // Ten correct per category — the shape the share passport treats as a
    // strong learner. Shrunk accuracy must sit high enough to promote the
    // predicted pass, while staying visibly below guaranteed.
    const cats = ["signs", "rules", "controls", "intersections", "parking", "following_distance", "hazard_awareness"] as const;
    const attempts = cats.flatMap((c) => Array.from({ length: 10 }, () => attempt(true, c)));
    const r = computeReadiness(stateWith(attempts));

    for (const c of cats) expect(r.perCategory[c]).toBeGreaterThan(80);
    expect(r.perCategory.signs).toBeLessThan(100);
    expect(r.passProbability).toBeGreaterThanOrEqual(60);
    expect(r.passProbability).toBeLessThan(95);
  });

  it("blanks still never count as wrong answers", () => {
    // Guard from session-sync-and-blanks, re-pinned against the shrunk model.
    const untouched = computeReadiness(defaultUserState()).perCategory.signs;
    const onlyBlanks = computeReadiness(
      stateWith([attempt(false)].map((a) => ({ ...a, selectedIndex: -1, correct: false }))),
    ).perCategory.signs;
    expect(onlyBlanks).toBe(untouched);
  });
});

describe("evidence-aware weakness ranking", () => {
  const CATS = ["signs", "rules", "controls", "intersections", "parking", "following_distance", "hazard_awareness"] as const;

  it("ranks a proven-weak category above untouched ones", () => {
    // The failure mode this fixes: every untouched category sits at the
    // baseline (18%), which sorted ahead of a category the learner had
    // actually attempted and failed — so the daily plan sent them to drill
    // something they had never tried.
    const attempts = [
      ...Array.from({ length: 8 }, () => attempt(false, "parking" as Category)),
      ...Array.from({ length: 8 }, () => attempt(true, "signs" as Category)),
    ];
    const r = computeReadiness(stateWith(attempts));

    expect(r.perCategoryEvidence.parking).toBe(8);
    expect(r.perCategory.parking).toBeLessThan(70);
    expect(r.weakCategories[0]).toBe("parking");
    // Untouched categories may follow, but never displace the measured one.
    expect(r.weakCategories).not.toContain("signs");
  });

  it("an untouched category floors near zero, a measured one does not", () => {
    // A mediocre-but-real record (half right): its floor must sit clearly
    // above the untouched categories', whose only content is the prior.
    const attempts = [
      ...Array.from({ length: 5 }, () => attempt(true, "rules" as Category)),
      ...Array.from({ length: 5 }, () => attempt(false, "rules" as Category)),
    ];
    const r = computeReadiness(stateWith(attempts));
    expect(r.perCategoryFloor.rules).toBeGreaterThan(0);
    for (const c of CATS) {
      if (c === "rules") continue;
      expect(r.perCategoryEvidence[c as Category]).toBe(0);
      expect(r.perCategoryFloor[c as Category]).toBeLessThan(r.perCategoryFloor.rules);
    }
  });

  it("orders multiple measured-weak categories by competence", () => {
    const attempts = [
      ...Array.from({ length: 6 }, () => attempt(false, "hazard_awareness" as Category)),
      ...Array.from({ length: 6 }, () => attempt(true, "controls" as Category)),
      ...Array.from({ length: 2 }, () => attempt(true, "intersections" as Category)),
      ...Array.from({ length: 4 }, () => attempt(false, "intersections" as Category)),
      ...Array.from({ length: 6 }, () => attempt(true, "rules" as Category)),
    ];
    const r = computeReadiness(stateWith(attempts));
    // hazard_awareness (0/6) is weaker than intersections (2/6); both measured.
    expect(r.weakCategories.indexOf("hazard_awareness")).toBeLessThan(
      r.weakCategories.indexOf("intersections"),
    );
  });

  it("still lists unmeasured categories after the measured ones, not before", () => {
    const attempts = Array.from({ length: 3 }, () => attempt(false, "parking" as Category));
    const r = computeReadiness(stateWith(attempts));
    // parking has evidence but below the ability threshold — it must still
    // lead the list, because it is the only category with any signal at all.
    expect(r.weakCategories[0]).toBe("parking");
  });
});
