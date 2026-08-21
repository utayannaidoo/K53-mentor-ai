import { describe, expect, it } from "vitest";
import { webhookLedgerId } from "@/lib/paystack/ledger";

/**
 * The ledger id must be unique per event INSTANCE. The previous scheme keyed
 * every event as `${event}:${data.id ?? data.reference ?? ""}` — and most
 * lifecycle events carry neither field, so every customer's refund/disable/
 * payment-failed collapsed onto one shared id and only the first ever applied.
 * These tests pin the per-instance keys that fixed that.
 */
describe("webhookLedgerId", () => {
  it("keys charge.success on the transaction id", () => {
    expect(webhookLedgerId("charge.success", { id: 12345 })).toBe("charge.success:12345");
  });

  it("refuses to claim charge.success without a transaction id", () => {
    // charge.success is the one event whose double-apply grants real money —
    // no identity, no apply.
    expect(webhookLedgerId("charge.success", { reference: "r" })).toBeNull();
    expect(webhookLedgerId("charge.success", null)).toBeNull();
  });

  it("keys refund.processed on the refund/transaction reference, not the empty string", () => {
    expect(
      webhookLedgerId("refund.processed", {
        refund_reference: "RREF_1",
        transaction: { reference: "ref_x" },
      }),
    ).toBe("refund.processed:RREF_1");
    expect(
      webhookLedgerId("refund.processed", { transaction: { reference: "ref_y" } }),
    ).toBe("refund.processed:ref_y");
    expect(webhookLedgerId("refund.processed", { transaction_reference: "ref_z" })).toBe(
      "refund.processed:ref_z",
    );
    // Two different customers' refunds must never share an id (the old bug:
    // both produced "refund.processed:").
    const a = webhookLedgerId("refund.processed", { transaction: { reference: "a" } });
    const b = webhookLedgerId("refund.processed", { transaction: { reference: "b" } });
    expect(a).not.toEqual(b);
  });

  it("keys subscription lifecycle events on the subscription code", () => {
    expect(
      webhookLedgerId("subscription.disable", {
        subscription_code: "SUB_1",
        customer: { customer_code: "CUS_1" },
      }),
    ).toBe("subscription.disable:SUB_1");
    expect(
      webhookLedgerId("subscription.not_renew", {
        customer: { customer_code: "CUS_2" },
      }),
    ).toBe("subscription.not_renew:CUS_2");
  });

  it("keys invoice.payment_failed on the subscription and failure time", () => {
    expect(
      webhookLedgerId("invoice.payment_failed", {
        subscription_code: "SUB_3",
        paid_at: "2026-08-21T00:00:00Z",
      }),
    ).toBe("invoice.payment_failed:SUB_3:2026-08-21T00:00:00Z");
  });

  it("returns null when an event offers no stable identity", () => {
    // Callers apply these unclaimed — safe because the handlers are
    // idempotent state writes.
    expect(webhookLedgerId("subscription.disable", {})).toBeNull();
    expect(webhookLedgerId("invoice.payment_failed", { paid_at: "x" })).toBeNull();
    expect(webhookLedgerId("some.future.event", { id: 1 })).toBeNull();
  });
});
