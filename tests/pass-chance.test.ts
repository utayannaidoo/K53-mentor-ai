import { describe, expect, it } from "vitest";
import { passChanceLift, passChanceStage, passChanceStory } from "@/lib/diagnostic/pass-chance";
import { passProbabilityFromSections } from "@/lib/diagnostic/scoring";
import type { CategoryId } from "@/types";

const ALL: CategoryId[] = [
  "signs",
  "rules",
  "controls",
  "intersections",
  "parking",
  "following_distance",
  "hazard_awareness",
];
const flat = (v: number) => Object.fromEntries(ALL.map((c) => [c, v])) as Record<CategoryId, number>;

describe("pass chance stages", () => {
  it("maps the curve to four encouraging stages", () => {
    expect(passChanceStage(0)).toBe("early");
    expect(passChanceStage(9)).toBe("early");
    expect(passChanceStage(10)).toBe("climbing");
    expect(passChanceStage(50)).toBe("on_track");
    expect(passChanceStage(80)).toBe("ready");
  });

  it("never paints a low chance in a warning colour", () => {
    expect(passChanceStory(0, flat(20)).tone).toBe("text-primary");
    expect(passChanceStory(85, flat(95)).tone).toBe("text-success");
  });

  it("never uses discouraging wording at any stage", () => {
    for (const v of [10, 40, 70, 85, 95]) {
      const perCategory = flat(v);
      const story = passChanceStory(passProbabilityFromSections(perCategory), perCategory);
      const copy = `${story.headline} ${story.detail} ${story.liftLine ?? ""}`;
      expect(copy).not.toMatch(/\b(fail|hopeless|unlikely|won't pass|bad)\b/i);
    }
  });
});

describe("the lift", () => {
  it("names the blocking section and a higher number", () => {
    const perCategory = { ...flat(88), signs: 70 };
    const pct = passProbabilityFromSections(perCategory);
    const lift = passChanceLift(perCategory);
    expect(lift?.section).toBe("signs");
    expect(lift!.to).toBeGreaterThan(pct);
    expect(passChanceStory(pct, perCategory).liftLine).toMatch(/signs .* rises to about \d+%/i);
  });

  it("has nothing to lift once every section clears", () => {
    expect(passChanceLift(flat(95))).toBeNull();
    expect(passChanceStory(90, flat(95)).liftLine).toBeNull();
  });

  it("still points at a section when the quoted gain would be negligible", () => {
    const perCategory = flat(15);
    const story = passChanceStory(passProbabilityFromSections(perCategory), perCategory);
    expect(story.stage).toBe("early");
    expect(story.liftLine).toMatch(/section to work on first/);
  });
});
