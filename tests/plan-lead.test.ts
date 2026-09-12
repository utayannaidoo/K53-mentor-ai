import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LEAD_EMAIL_MAX, planLeadSchema } from "@/lib/leads/plan-lead";
import { buildPlanEmail } from "@/lib/notify/templates";

const valid = {
  email: "Thandi@Example.CO.ZA",
  consent: true as const,
  score: 47,
  correct: 7,
  total: 15,
  weakCategories: ["signs", "rules"] as const,
  vehicleCode: "8" as const,
};

describe("plan lead validation", () => {
  it("accepts a consented request and normalises the address", () => {
    const parsed = planLeadSchema.safeParse({ ...valid, weakCategories: ["signs", "rules"] });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.email).toBe("thandi@example.co.za");
  });

  it("refuses anything but an explicit consent tick", () => {
    for (const consent of [false, undefined, "true", 1, null]) {
      expect(planLeadSchema.safeParse({ ...valid, consent }).success).toBe(false);
    }
  });

  it("refuses a malformed or oversized address", () => {
    expect(planLeadSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(
      planLeadSchema.safeParse({ ...valid, email: `${"a".repeat(LEAD_EMAIL_MAX)}@example.com` })
        .success,
    ).toBe(false);
  });

  it("only accepts real categories and licence codes", () => {
    expect(planLeadSchema.safeParse({ ...valid, weakCategories: ["yard"] }).success).toBe(false);
    expect(planLeadSchema.safeParse({ ...valid, vehicleCode: "Z" }).success).toBe(false);
    expect(planLeadSchema.safeParse({ ...valid, vehicleCode: "A1" }).success).toBe(true);
  });

  it("bounds the score so a tampered client can't mail nonsense", () => {
    expect(planLeadSchema.safeParse({ ...valid, score: 101 }).success).toBe(false);
    expect(planLeadSchema.safeParse({ ...valid, total: 0 }).success).toBe(false);
  });
});

describe("the plan email", () => {
  const mail = buildPlanEmail({
    score: 47,
    correct: 7,
    total: 15,
    weakCategories: ["signs", "rules", "parking", "controls"],
    unsubscribeUrl: "https://k53.test/api/unsubscribe?e=a%40b.com&t=abc",
  });

  it("leads with the weakest area and quotes the real score", () => {
    expect(mail.subject).toContain("Road signs");
    expect(mail.text).toContain("7 of 15 (47%)");
  });

  it("names at most three focus areas, worst first", () => {
    expect(mail.text).toMatch(/Road signs, Rules of the road, Parking/);
    // The fourth is left out: a list of everything is not a plan.
    expect(mail.text).not.toContain("Vehicle controls");
  });

  it("carries a working unsubscribe link, because there is no account page", () => {
    expect(mail.html).toContain("https://k53.test/api/unsubscribe?e=a%40b.com&t=abc");
    expect(mail.html).toContain("Unsubscribe");
  });

  it("puts the opt-out in the TEXT part too, not just the HTML", () => {
    // A text-only client used to get a marketing email with no way to stop
    // it; the footer lived only in the HTML alternative.
    expect(mail.text).toContain("Unsubscribe: https://k53.test/api/unsubscribe?e=a%40b.com&t=abc");
  });

  it("advertises List-Unsubscribe so the mail client shows its own control", () => {
    expect(mail.headers?.["List-Unsubscribe"]).toBe(
      "<https://k53.test/api/unsubscribe?e=a%40b.com&t=abc>",
    );
    // One-Click means the provider POSTs the URL itself — /api/unsubscribe
    // answers POST for exactly this reason.
    expect(mail.headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("advertises nothing it cannot honour when there is no link", () => {
    const noLink = buildPlanEmail({
      score: 40,
      correct: 6,
      total: 15,
      weakCategories: ["rules"],
      unsubscribeUrl: null,
    });
    expect(noLink.headers).toBeUndefined();
    expect(noLink.text).toMatch(/reply with "stop"/i);
  });

  it("falls back to a reply-to-stop line when no secret is configured", () => {
    const noLink = buildPlanEmail({
      score: 40,
      correct: 6,
      total: 15,
      weakCategories: ["rules"],
      unsubscribeUrl: null,
    });
    expect(noLink.html).not.toContain("/api/unsubscribe");
    expect(noLink.html).toMatch(/Reply with/i);
  });

  it("still reads sensibly when no category stood out", () => {
    const even = buildPlanEmail({
      score: 80,
      correct: 12,
      total: 15,
      weakCategories: [],
      unsubscribeUrl: null,
    });
    expect(even.subject).toBe("Your K53 plan");
    expect(even.text).toMatch(/even across the categories/i);
  });
});

describe("unsubscribe tokens", () => {
  const OLD = process.env.UNSUBSCRIBE_SECRET;
  beforeAll(() => {
    process.env.UNSUBSCRIBE_SECRET = "test-unsubscribe-secret";
  });
  afterAll(() => {
    if (OLD === undefined) delete process.env.UNSUBSCRIBE_SECRET;
    else process.env.UNSUBSCRIBE_SECRET = OLD;
  });

  it("round-trips the address it was minted for, case-insensitively", async () => {
    const { unsubscribeToken, verifyUnsubscribe } = await import("@/lib/leads/unsubscribe-token");
    const token = unsubscribeToken("Thandi@Example.co.za");
    expect(token).toBeTruthy();
    expect(verifyUnsubscribe("thandi@example.co.za", token!)).toBe(true);
  });

  it("refuses another address, a wrong token and an empty one", async () => {
    const { unsubscribeToken, verifyUnsubscribe } = await import("@/lib/leads/unsubscribe-token");
    const token = unsubscribeToken("thandi@example.co.za")!;
    expect(verifyUnsubscribe("someone@else.com", token)).toBe(false);
    expect(verifyUnsubscribe("thandi@example.co.za", "not-the-token")).toBe(false);
    expect(verifyUnsubscribe("thandi@example.co.za", "")).toBe(false);
  });

  it("builds a link carrying both the address and its token", async () => {
    const { unsubscribeUrl } = await import("@/lib/leads/unsubscribe-token");
    const url = unsubscribeUrl("thandi@example.co.za")!;
    expect(url).toContain("/api/unsubscribe?e=thandi%40example.co.za&t=");
  });
});
