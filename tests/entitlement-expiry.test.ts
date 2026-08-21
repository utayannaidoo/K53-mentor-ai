import { describe, expect, it } from "vitest";
import {
  EXPIRY_GRACE_MS,
  tierFromSubscriptionRow,
  type SubscriptionRowLike,
} from "@/lib/billing/entitlements.server";

/**
 * The expiry backstop. Before `tierFromSubscriptionRow` existed as a pure
 * function, the date check ran only when `cancel_at_period_end` was set — so
 * an `active` row whose disable webhook was lost resolved paid forever. These
 * pin both paths: flagged rows expire exactly at period end; unflagged rows
 * expire after the grace window.
 */

const NOW = Date.parse("2026-08-21T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();
const daysAhead = (n: number) => new Date(NOW + n * 86_400_000).toISOString();

const row = (over: Partial<SubscriptionRowLike> = {}): SubscriptionRowLike => ({
  tier: "premium",
  status: "active",
  cancel_at_period_end: false,
  current_period_end: daysAhead(10),
  ...over,
});

describe("tierFromSubscriptionRow", () => {
  it("keeps an actively-renewing subscription paid", () => {
    expect(tierFromSubscriptionRow(row(), NOW)).toBe("premium");
  });

  it("expires a cancelled row the moment its period ends — no grace", () => {
    const r = row({ cancel_at_period_end: true, current_period_end: daysAgo(0.1) });
    expect(tierFromSubscriptionRow(r, NOW)).toBe("free");
  });

  it("keeps a cancelled row paid until the period actually ends", () => {
    const r = row({ cancel_at_period_end: true, current_period_end: daysAhead(2) });
    expect(tierFromSubscriptionRow(r, NOW)).toBe("premium");
  });

  it("expires an UNFLAGGED active row once the grace window has passed", () => {
    // The missed-disable hole: Paystack stopped renewing, no event arrived,
    // and the stored end date quietly went stale.
    const stale = row({ current_period_end: daysAgo(4) });
    expect(tierFromSubscriptionRow(stale, NOW)).toBe("free");
  });

  it("gives an unflagged row the full grace window before expiring", () => {
    // A renewal charge can land on/after the stored end date while the
    // customer is still current — the grace exists so they aren't locked out.
    const justPast = row({
      current_period_end: new Date(NOW - EXPIRY_GRACE_MS + 60_000).toISOString(),
    });
    expect(tierFromSubscriptionRow(justPast, NOW)).toBe("premium");

    const beyondGrace = row({
      current_period_end: new Date(NOW - EXPIRY_GRACE_MS - 60_000).toISOString(),
    });
    expect(tierFromSubscriptionRow(beyondGrace, NOW)).toBe("free");
  });

  it("expires a past_due row whose dunning window has clearly closed", () => {
    const r = row({ status: "past_due", current_period_end: daysAgo(6) });
    expect(tierFromSubscriptionRow(r, NOW)).toBe("free");
  });

  it("honours past_due inside the retry window", () => {
    const r = row({ status: "past_due", current_period_end: daysAgo(1) });
    expect(tierFromSubscriptionRow(r, NOW)).toBe("premium");
  });

  it("never grants a tier from a non-active status", () => {
    expect(tierFromSubscriptionRow(row({ status: "canceled" }), NOW)).toBe("free");
  });

  it("treats a missing row as free", () => {
    expect(tierFromSubscriptionRow(null, NOW)).toBe("free");
  });

  it("cannot act on an unparseable date — keeps the tier rather than guessing", () => {
    const r = row({ current_period_end: "not-a-date" });
    expect(tierFromSubscriptionRow(r, NOW)).toBe("premium");
  });

  it("passes premium_plus through unchanged while valid", () => {
    expect(tierFromSubscriptionRow(row({ tier: "premium_plus" }), NOW)).toBe("premium_plus");
  });
});
