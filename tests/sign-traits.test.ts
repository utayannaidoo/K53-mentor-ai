import { describe, expect, it } from "vitest";
import { SIGNS, SIGNS_BY_ID } from "@/lib/content/signs";
import { traitsFor, describeAppearance, looksLike } from "@/lib/content/sign-traits";
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
    // Warning signs are red-bordered triangles.
    expect(traitsFor(SIGNS_BY_ID["warning-037-03"])).toMatchObject({
      shape: "triangle",
      colour: "red",
    });
  });

  it("refuses to guess where a family genuinely mixes presentations", () => {
    // Guidance colour encodes road class and the catalogue doesn't record it —
    // asserting "blue" would be inventing a visual fact, which is the same
    // failure mode as inventing a sign meaning.
    const guidance = SIGNS.find((s) => s.category === "guidance" && !/tourism/i.test(s.subcategory))!;
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
