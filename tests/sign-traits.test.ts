import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { SIGNS, SIGNS_BY_ID } from "@/lib/content/signs";
import {
  traitsFor,
  describeAppearance,
  looksLike,
  findSignByName,
  similarSigns,
  SHAPE_FILTERS,
} from "@/lib/content/sign-traits";
import { signQuestionAlt } from "@/lib/content/sign-alt";
import { GENERATED_SIGN_QUESTIONS } from "@/lib/content/signs-generated";

/**
 * Share of a crop's pixels that are sign yellow. Every warning crop is an 8-bit
 * RGB PNG, so inflating it and undoing the row filters is all the decoding this
 * needs, and the suite stays free of an image dependency.
 */
function yellowShare(image: string): number {
  const png = readFileSync(new URL(`../public${image}`, import.meta.url));
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  // Bit depth, colour type, interlace.
  expect([png[24], png[25], png[28]], image).toEqual([8, 2, 0]);

  const idat: Buffer[] = [];
  for (let at = 8; at < png.length; at += 12 + png.readUInt32BE(at)) {
    if (png.toString("latin1", at + 4, at + 8) !== "IDAT") continue;
    idat.push(png.subarray(at + 8, at + 8 + png.readUInt32BE(at)));
  }
  const raw = inflateSync(Buffer.concat(idat));

  const stride = width * 3;
  let above = new Uint8Array(stride);
  let yellow = 0;
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    const row = new Uint8Array(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= 3 ? row[i - 3] : 0;
      const b = above[i];
      const c = i >= 3 ? above[i - 3] : 0;
      const pa = Math.abs(b - c);
      const pb = Math.abs(a - c);
      const pc = Math.abs(a + b - 2 * c);
      const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      const predicted = [0, a, b, (a + b) >> 1, paeth][filter];
      row[i] = raw[start + 1 + i] + predicted;
    }
    for (let i = 0; i < stride; i += 3) {
      if (row[i] > 200 && row[i + 1] > 170 && row[i + 2] < 90) yellow += 1;
    }
    above = row;
  }
  return yellow / (width * height);
}

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

  describe("temporary warning signs", () => {
    const triangles = SIGNS.filter(
      (s) => s.category === "warning" && !/hazard marker/i.test(s.subcategory),
    );

    it("are triangles, like every other warning sign", () => {
      expect(triangles.filter((s) => traitsFor(s).shape !== "triangle")).toEqual([]);
      expect(describeAppearance(SIGNS_BY_ID["warning-031-01"])).toBe("triangular and yellow");
    });

    it("are yellow exactly where the picture has a yellow background", () => {
      // The yellow lamp on warning-030-04, a white sign, covers 3% of its crop.
      // The smallest real background is 8%, on a crop shared with a second sign.
      const inPixels = triangles.filter((s) => yellowShare(s.image) > 0.05).map((s) => s.id);
      const inTraits = triangles.filter((s) => traitsFor(s).colour === "yellow").map((s) => s.id);
      expect(inTraits).toEqual(inPixels);
      expect(inTraits).toHaveLength(11);
    });

    it("are not read out of a sign's prose", () => {
      // A meaning rewrite must not recolour a sign, in either direction.
      const white = SIGNS_BY_ID["warning-027-01"];
      const reworded = { ...white, name: `${white.name} (temporary)`, meaning: "A temporary gate." };
      expect(traitsFor(reworded).colour).toBe("red");
      const yellow = SIGNS_BY_ID["warning-039-01"];
      expect(traitsFor({ ...yellow, meaning: "Road works." }).colour).toBe("yellow");
    });
  });

  it("keeps diamond for the two signs that really are diamonds", () => {
    const diamonds = SIGNS.filter((s) => traitsFor(s).shape === "diamond").map((s) => s.id);
    expect(diamonds.sort()).toEqual(["information-043-05", "regulatory-007-04"]);
    expect(describeAppearance(SIGNS_BY_ID["information-043-05"])).toBe("diamond-shaped and yellow");
    expect(describeAppearance(SIGNS_BY_ID["regulatory-007-04"])).toBe("diamond-shaped and red");
  });

  it("offers no shape filter that no sign can match", () => {
    for (const { id } of SHAPE_FILTERS) {
      expect(SIGNS.some((s) => traitsFor(s).shape === id), id).toBe(true);
    }
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
