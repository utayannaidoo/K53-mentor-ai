import { describe, expect, it } from "vitest";
import {
  collectedIn,
  formatRand,
  learnerBalance,
  packageUsage,
  parseRand,
  type ChargeableLesson,
  type PackageRow,
  type PaymentRow,
} from "@/lib/schools/money";

/**
 * The school's ledger arithmetic. The database proves payments are
 * append-only (supabase/tests/school_money.sql); this proves the numbers a
 * school sees are computed correctly from those rows.
 */

describe("parseRand", () => {
  it("reads the ways South Africans write an amount", () => {
    expect(parseRand("450")).toBe(45000);
    expect(parseRand("R450")).toBe(45000);
    expect(parseRand("r 450")).toBe(45000);
    expect(parseRand("450,50")).toBe(45050);
    expect(parseRand("450.50")).toBe(45050);
    expect(parseRand("450,5")).toBe(45050);
    expect(parseRand("R 1 200")).toBe(120000);
    expect(parseRand("1 200,00")).toBe(120000);
    expect(parseRand("1,200")).toBe(120000);
    expect(parseRand("1.200")).toBe(120000);
    expect(parseRand("1,200.00")).toBe(120000);
    expect(parseRand("4.505")).toBe(450500); // same rule as "1.200": three digits after means thousands
    expect(parseRand("1.200,00")).toBe(120000);
    expect(parseRand("12,345,678")).toBeNull(); // over the ceiling
  });

  it("refuses anything that isn't clearly an amount", () => {
    expect(parseRand("")).toBeNull();
    expect(parseRand("abc")).toBeNull();
    expect(parseRand("-50")).toBeNull();
    expect(parseRand("4.5055")).toBeNull(); // four digits after a lone separator: neither reading fits
    expect(parseRand("1,20,0")).toBeNull();
    expect(parseRand("R")).toBeNull();
  });
});

describe("formatRand", () => {
  it("shows whole rands without cents and part-rands with both digits", () => {
    expect(formatRand(45000)).toBe("R450");
    expect(formatRand(45050)).toBe("R450,50");
    expect(formatRand(45005)).toBe("R450,05");
    expect(formatRand(0)).toBe("R0");
  });

  it("groups thousands", () => {
    expect(formatRand(120000).replace(/\s/g, " ")).toBe("R1 200");
  });

  it("keeps the sign on a credit", () => {
    expect(formatRand(-5000)).toBe("-R50");
  });
});

const pkg = (over: Partial<PackageRow> = {}): PackageRow => ({
  id: "p1",
  learner_id: "thabo",
  name: "10 lessons",
  lessons_included: 10,
  price_cents: 250000,
  status: "active",
  sold_on: "2026-09-01",
  expires_on: null,
  ...over,
});
const pay = (over: Partial<PaymentRow> = {}): PaymentRow => ({
  id: "pay1",
  learner_id: "thabo",
  package_id: null,
  amount_cents: 100000,
  method: "cash",
  reference: null,
  received_on: "2026-09-02",
  received_by: "u",
  note: null,
  voided_at: null,
  void_reason: null,
  created_at: "2026-09-02T08:00:00Z",
  ...over,
});
const lesson = (over: Partial<ChargeableLesson> = {}): ChargeableLesson => ({
  id: "l1",
  learner_id: "thabo",
  package_id: null,
  price_cents: 30000,
  status: "completed",
  ...over,
});

describe("learnerBalance", () => {
  it("owes the package price less what's been paid", () => {
    expect(learnerBalance("thabo", [pkg()], [pay()], [])).toEqual({
      chargedCents: 250000,
      paidCents: 100000,
      balanceCents: 150000,
    });
  });

  it("charges a pay-as-you-go lesson once it happened or was missed, never before or when cancelled", () => {
    const lessons = [
      lesson({ id: "done", status: "completed" }),
      lesson({ id: "missed", status: "no_show" }),
      lesson({ id: "future", status: "scheduled" }),
      lesson({ id: "off", status: "cancelled_school" }),
      lesson({ id: "unpriced", price_cents: null }),
    ];
    expect(learnerBalance("thabo", [], [], lessons).chargedCents).toBe(60000);
  });

  it("does not charge a package lesson on top of the package", () => {
    const lessons = [lesson({ package_id: "p1", price_cents: null })];
    expect(learnerBalance("thabo", [pkg()], [], lessons).chargedCents).toBe(250000);
  });

  it("ignores a voided payment and a refunded package", () => {
    const result = learnerBalance(
      "thabo",
      [pkg({ status: "refunded" })],
      [pay({ voided_at: "2026-09-03T08:00:00Z", void_reason: "counted twice" })],
      [],
    );
    expect(result).toEqual({ chargedCents: 0, paidCents: 0, balanceCents: 0 });
  });

  it("nets a refund recorded as a negative payment", () => {
    const result = learnerBalance(
      "thabo",
      [pkg({ status: "refunded" })],
      [pay({ amount_cents: 250000 }), pay({ id: "back", amount_cents: -250000 })],
      [],
    );
    expect(result.balanceCents).toBe(0);
  });

  it("shows a learner who paid ahead as in credit", () => {
    expect(learnerBalance("thabo", [], [pay({ amount_cents: 50000 })], []).balanceCents).toBe(-50000);
  });

  it("never mixes up two learners' ledgers", () => {
    expect(
      learnerBalance("thabo", [pkg({ learner_id: "ayanda" })], [pay({ learner_id: "ayanda" })], [
        lesson({ learner_id: "ayanda" }),
      ]),
    ).toEqual({ chargedCents: 0, paidCents: 0, balanceCents: 0 });
  });
});

describe("packageUsage", () => {
  it("counts used, booked and left", () => {
    const lessons = [
      lesson({ id: "a", package_id: "p1", price_cents: null, status: "completed" }),
      lesson({ id: "b", package_id: "p1", price_cents: null, status: "no_show" }),
      lesson({ id: "c", package_id: "p1", price_cents: null, status: "scheduled" }),
      lesson({ id: "d", package_id: "p1", price_cents: null, status: "cancelled_learner" }),
      lesson({ id: "e", package_id: "other", price_cents: null, status: "completed" }),
    ];
    expect(packageUsage(pkg(), lessons)).toEqual({ used: 2, booked: 1, left: 7 });
  });

  it("has no 'left' for an open package", () => {
    expect(packageUsage(pkg({ lessons_included: null }), []).left).toBeNull();
  });
});

describe("collectedIn", () => {
  it("adds up one month's money in, without voids", () => {
    const payments = [
      pay({ received_on: "2026-09-02", amount_cents: 100000 }),
      pay({ id: "2", received_on: "2026-09-30", amount_cents: 45000 }),
      pay({ id: "3", received_on: "2026-10-01", amount_cents: 99900 }),
      pay({ id: "4", received_on: "2026-09-15", amount_cents: 50000, voided_at: "x", void_reason: "y" }),
    ];
    expect(collectedIn("2026-09", payments)).toBe(145000);
  });
});
