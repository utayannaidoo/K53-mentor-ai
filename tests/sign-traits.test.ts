import { describe, expect, it } from "vitest";
import { SIGNS, SIGNS_BY_ID } from "@/lib/content/signs";
import {
  traitsFor,
  describeAppearance,
  looksLike,
  findSignByName,
  similarSigns,
} from "@/lib/content/sign-traits";
import { signQuestionAlt } from "@/lib/content/sign-alt";
import { GENERATED_SIGN_QUESTIONS } from "@/lib/content/signs-generated";

describe("sign traits", () => {
  it("classifies the signs every learner meets", () => {
    expect(traitsFor(SIGNS_BY_ID["regulatory-006-01"])).toMatchObject({
      shape: "octagon",
      colour: "red",
      confident: true,
    });
    expect(traitsFor(SIGNS_BY_ID["regulatory-006-02"])).toMatchObject({
      shape: "inverted-triangle",
      colour: "red",
    });
  });

  it("reads yield by name, not by meaning — its own wording says 'stop'", () => {
    // "You need not stop if the way is clear" matches /stop/, which is exactly
    // how a meaning-based rule turns a triangular yield sign into an octagon.
    const yieldSign = SIGNS_BY_ID["regulatory-006-02"];
    expect(yieldSign.meaning.toLowerCase()).toContain("stop");
    expect(traitsFor(yieldSign).shape).toBe("inverted-triangle");
  });

  it("makes permanent warning signs red triangles", () => {
    const warning = SIGNS.find(
      (s) => s.category === "warning" && !/hazard marker/i.test(s.subcategory),
    )!;
    expect(traitsFor(warning)).toMatchObject({ shape: "triangle", colour: "red" });
  });

  it("refuses to guess where a family genuinely mixes presentations", () => {
    // Guidance colour encodes road class and the catalogue doesn't record it —
    // asserting "blue" would be inventing a visual fact, which is the same
    // failure mode as inventing a sign meaning.
    const guidance = SIGNS.find(
      (s) => s.category === "guidance" && !/tourism/i.test(s.subcategory),
    )!;
    const t = traitsFor(guidance);
    expect(t.colour).toBe("varies");
    expect(t.confident).toBe(false);
    expect(describeAppearance(guidance)).toBeNull();
  });

  it("covers a majority of the catalogue confidently", () => {
    const confident = SIGNS.filter((s) => traitsFor(s).confident);
    expect(confident.length).toBeGreaterThan(SIGNS.length / 2);
  });
});

describe("findSignByName", () => {
  it("matches a scanner result back to the catalogue", () => {
    expect(findSignByName("Stop", SIGNS)?.id).toBe("regulatory-006-01");
  });

  it("returns null rather than a wrong match", () => {
    // A wrong match would show a learner the wrong sign as "similar", which is
    // worse than showing nothing.
    expect(findSignByName("qz", SIGNS)).toBeNull();
    expect(findSignByName("definitely not a road sign at all", SIGNS)).toBeNull();
  });

  it("never offers a sign as similar to itself", () => {
    const stop = SIGNS_BY_ID["regulatory-006-01"];
    expect(similarSigns(stop, SIGNS).map((s) => s.id)).not.toContain(stop.id);
  });
});

describe("alt text", () => {
  it("describes shape and colour without naming the sign or its meaning", () => {
    const stop = SIGNS_BY_ID["regulatory-006-01"];
    const alt = signQuestionAlt(stop.image, "signs");
    expect(alt).toMatch(/eight-sided/);
    expect(alt).toMatch(/red/);
    // Must not answer the question it accompanies.
    expect(alt.toLowerCase()).not.toContain("stop");
    expect(alt).not.toContain(stop.meaning.slice(0, 20));
  });

  it("falls back to the family when the exact sign isn't known", () => {
    expect(signQuestionAlt("/signs/warning/does-not-exist.png", "signs")).toMatch(/warning sign/);
  });

  it("still says something useful with no image at all", () => {
    expect(signQuestionAlt(undefined, "hazard_awareness")).toMatch(/hazard awareness/);
  });
});

describe("confusion pairs in generated questions", () => {
  const byName = new Map(SIGNS.map((s) => [s.name, s]));
  const nameQuestions = GENERATED_SIGN_QUESTIONS.filter((q) => q.prompt === "Which sign is this?");

  it("still generates the same breadth of questions", () => {
    expect(nameQuestions.length).toBeGreaterThan(30);
    GENERATED_SIGN_QUESTIONS.forEach((q) => expect(q.options).toHaveLength(4));
  });

  it("mostly answers a sign against others that look like it", () => {
    // The whole point: a red triangle should be drilled against other red
    // triangles, not against an octagon nobody would confuse it with.
    let sameLook = 0;
    let total = 0;
    for (const q of nameQuestions) {
      const answer = byName.get(q.options[q.correctIndex]);
      if (!answer || !traitsFor(answer).confident) continue;
      q.options.forEach((opt, i) => {
        if (i === q.correctIndex) return;
        const d = byName.get(opt);
        if (!d) return;
        total += 1;
        if (looksLike(answer, d)) sameLook += 1;
      });
    }
    expect(total).toBeGreaterThan(50);
    expect(sameLook / total).toBeGreaterThan(0.7);
  });

  it("never offers the answer twice", () => {
    for (const q of GENERATED_SIGN_QUESTIONS) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});
