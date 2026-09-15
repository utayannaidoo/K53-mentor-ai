import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The statement link is a school's only credential — there is no login behind
 * it — so these cover the three ways a token system usually leaks: a token that
 * validates without a secret, a token that validates for the wrong subject, and
 * a token that survives a secret rotation.
 */
const ORIGINAL = { ...process.env };

async function load() {
  vi.resetModules();
  return import("@/lib/partners/statement-token");
}

beforeEach(() => {
  process.env.PARTNER_SECRET = "test-partner-secret";
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe("partner statement tokens", () => {
  it("round-trips a code and is case- and whitespace-insensitive", async () => {
    const { statementToken, verifyStatementToken } = await load();
    const token = statementToken("kasi-driving");
    expect(token).toBeTruthy();
    expect(verifyStatementToken("kasi-driving", token!)).toBe(true);
    // The same school, typed differently, must not be locked out of its link.
    expect(verifyStatementToken("  KASI-DRIVING  ", token!)).toBe(true);
  });

  it("refuses another school's token", async () => {
    const { statementToken, verifyStatementToken } = await load();
    const mine = statementToken("kasi-driving")!;
    expect(verifyStatementToken("other-school", mine)).toBe(false);
  });

  it("refuses an empty or malformed token", async () => {
    const { verifyStatementToken } = await load();
    expect(verifyStatementToken("kasi-driving", "")).toBe(false);
    expect(verifyStatementToken("kasi-driving", "not-a-real-token")).toBe(false);
  });

  it("issues nothing when no secret is configured, and validates nothing either", async () => {
    delete process.env.PARTNER_SECRET;
    delete process.env.CRON_SECRET;
    const { statementToken, statementUrl, verifyStatementToken } = await load();
    expect(statementToken("kasi-driving")).toBeNull();
    expect(statementUrl("kasi-driving")).toBeNull();
    // Fails closed: without a secret every token is refused rather than accepted.
    expect(verifyStatementToken("kasi-driving", "anything")).toBe(false);
  });

  it("invalidates old links when the secret rotates", async () => {
    const { statementToken } = await load();
    const before = statementToken("kasi-driving")!;
    process.env.PARTNER_SECRET = "rotated-secret";
    const { verifyStatementToken } = await load();
    expect(verifyStatementToken("kasi-driving", before)).toBe(false);
  });

  it("falls back to CRON_SECRET so a deployment without PARTNER_SECRET still works", async () => {
    delete process.env.PARTNER_SECRET;
    process.env.CRON_SECRET = "cron-secret";
    const { statementToken, verifyStatementToken } = await load();
    const token = statementToken("kasi-driving")!;
    expect(verifyStatementToken("kasi-driving", token)).toBe(true);
  });
});
