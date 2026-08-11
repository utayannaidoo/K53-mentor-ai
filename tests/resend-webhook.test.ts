import { describe, expect, it } from "vitest";
import { createHmac, randomBytes } from "node:crypto";
import { verifyResendSignature } from "@/lib/notify/resend-signature";
import { buildWelcomeEmail } from "@/lib/notify/templates";
import { SITE_URL } from "@/lib/constants";

/**
 * Resend signs with Svix. Two mistakes silently produce a signature that never
 * matches — re-stringifying the body, and forgetting to base64-decode the
 * secret — and a third (no replay window) produces one that matches forever.
 */

const SECRET_B64 = randomBytes(24).toString("base64");
const SECRET = `whsec_${SECRET_B64}`;

function sign(body: string, id: string, ts: number, secret = SECRET_B64) {
  return createHmac("sha256", Buffer.from(secret, "base64"))
    .update(`${id}.${ts}.${body}`)
    .digest("base64");
}

function delivery(overrides: Partial<Parameters<typeof verifyResendSignature>[0]> = {}) {
  const body = JSON.stringify({ type: "email.bounced", data: { to: ["x@example.com"] } });
  const id = "msg_2abc";
  const ts = Math.floor(Date.now() / 1000);
  return {
    rawBody: body,
    svixId: id,
    svixTimestamp: String(ts),
    svixSignature: `v1,${sign(body, id, ts)}`,
    secret: SECRET,
    ...overrides,
  };
}

describe("verifyResendSignature", () => {
  it("accepts a correctly signed delivery", () => {
    expect(verifyResendSignature(delivery())).toBe(true);
  });

  it("rejects a tampered body", () => {
    const d = delivery();
    expect(verifyResendSignature({ ...d, rawBody: d.rawBody.replace("x@", "attacker@") })).toBe(
      false,
    );
  });

  it("rejects a signature computed over a different message id", () => {
    expect(verifyResendSignature({ ...delivery(), svixId: "msg_other" })).toBe(false);
  });

  it("rejects a wrong secret", () => {
    const other = randomBytes(24).toString("base64");
    expect(verifyResendSignature({ ...delivery(), secret: `whsec_${other}` })).toBe(false);
  });

  it("treats the secret as base64, not as a literal string", () => {
    // The classic implementation bug: HMAC keyed on "whsec_AbC…" verbatim.
    // It produces a perfectly well-formed signature that never matches.
    const d = delivery();
    const naive = createHmac("sha256", SECRET)
      .update(`${d.svixId}.${d.svixTimestamp}.${d.rawBody}`)
      .digest("base64");
    expect(verifyResendSignature({ ...d, svixSignature: `v1,${naive}` })).toBe(false);
  });

  it("rejects a replay from outside the tolerance window", () => {
    const body = JSON.stringify({ type: "email.bounced" });
    const id = "msg_old";
    const ts = Math.floor(Date.now() / 1000) - 3600;
    expect(
      verifyResendSignature({
        rawBody: body,
        svixId: id,
        svixTimestamp: String(ts),
        svixSignature: `v1,${sign(body, id, ts)}`,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("accepts when any of several signatures matches — secret rotation", () => {
    const d = delivery();
    const stale = randomBytes(32).toString("base64");
    expect(
      verifyResendSignature({ ...d, svixSignature: `v1,${stale} ${d.svixSignature}` }),
    ).toBe(true);
  });

  it("ignores signature tokens of an unknown version", () => {
    // Signed correctly, but labelled v2. Built from scratch rather than by
    // string surgery on delivery()'s output: that helper spreads a Partial of
    // the argument type, so its svixSignature widens to `string | null` and
    // calling .replace on it does not typecheck.
    const body = JSON.stringify({ type: "email.bounced" });
    const id = "msg_v2";
    const ts = Math.floor(Date.now() / 1000);
    expect(
      verifyResendSignature({
        rawBody: body,
        svixId: id,
        svixTimestamp: String(ts),
        svixSignature: `v2,${sign(body, id, ts)}`,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects missing headers rather than throwing", () => {
    for (const missing of ["svixId", "svixTimestamp", "svixSignature"] as const) {
      expect(verifyResendSignature({ ...delivery(), [missing]: null })).toBe(false);
    }
  });
});

describe("buildWelcomeEmail", () => {
  // Free signups previously got no email at all — the only welcome in the
  // system was bundled into the payment receipt, so the people still deciding
  // whether to pay heard from us least.
  it("points at the diagnostic, which is the first thing worth doing", () => {
    const mail = buildWelcomeEmail({ firstName: "Sam", trialDays: 7 });
    expect(mail.text).toMatch(/diagnostic/i);
    expect(mail.html).toContain(`href="${SITE_URL}/dashboard"`);
  });

  it("says how long the free week lasts, using the real number", () => {
    const mail = buildWelcomeEmail({ firstName: "Sam", trialDays: 7 });
    expect(mail.text).toContain("7 days");
  });

  it("copes with no name", () => {
    const mail = buildWelcomeEmail({ firstName: "", trialDays: 7 });
    expect(mail.text).toContain("Hi there");
    expect(mail.html).toContain("Hi there");
  });

  it("escapes the name — it is whatever the user typed", () => {
    const mail = buildWelcomeEmail({ firstName: '<img src=x onerror=alert(1)>', trialDays: 7 });
    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("&lt;img");
  });
});
