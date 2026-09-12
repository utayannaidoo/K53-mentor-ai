import { describe, expect, it } from "vitest";
import { DISPLAY_NAME_MAX, TESTIMONIAL_MAX, TESTIMONIAL_MIN, testimonialSchema } from "@/lib/testimonial";

const valid = {
  quote: "I failed twice before. The section scores showed rules was my problem, not signs.",
  displayName: "Thandi",
  consent: true as const,
  kind: "learners" as const,
};

/**
 * Publishing someone's words beside their name is its own use of their
 * personal information, so POPIA needs an active opt-in for it. The literal
 * `true` is the part worth pinning: an unticked box must fail, never default.
 */
describe("testimonial validation", () => {
  it("accepts a consented quote", () => {
    expect(testimonialSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses anything but an explicit consent tick", () => {
    for (const consent of [false, undefined, "true", 1, null]) {
      expect(testimonialSchema.safeParse({ ...valid, consent }).success).toBe(false);
    }
  });

  it("holds the quote to a usable length", () => {
    expect(testimonialSchema.safeParse({ ...valid, quote: "Great app" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...valid, quote: "x".repeat(TESTIMONIAL_MIN) }).success).toBe(true);
    expect(testimonialSchema.safeParse({ ...valid, quote: "x".repeat(TESTIMONIAL_MAX + 1) }).success).toBe(false);
  });

  it("makes the display name optional and bounded", () => {
    const { displayName: _omitted, ...anon } = valid;
    expect(testimonialSchema.safeParse(anon).success).toBe(true);
    expect(
      testimonialSchema.safeParse({ ...valid, displayName: "n".repeat(DISPLAY_NAME_MAX + 1) }).success,
    ).toBe(false);
  });

  it("only knows the two real tests", () => {
    expect(testimonialSchema.safeParse({ ...valid, kind: "yard" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...valid, kind: "drivers" }).success).toBe(true);
  });

  it("trims surrounding whitespace before measuring", () => {
    const padded = testimonialSchema.safeParse({ ...valid, quote: `   ${valid.quote}   ` });
    expect(padded.success && padded.data.quote).toBe(valid.quote);
  });
});
