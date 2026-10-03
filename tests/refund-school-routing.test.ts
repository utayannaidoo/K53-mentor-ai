import { beforeEach, expect, it, vi } from "vitest";
import { refundDb, refundRow, paidRow } from "./refund-db";
vi.mock("@/lib/paystack/client", async (original) => ({ ...await original<typeof import("@/lib/paystack/client")>(), verifyTransaction: vi.fn() }));
vi.mock("@/lib/notify/email", () => ({ sendEmail: vi.fn(async () => true), isEmailConfigured: true }));
vi.mock("@/lib/billing/school-billing", () => ({ routeSchoolEvent: vi.fn() }));
import { verifyTransaction } from "@/lib/paystack/client";
import { routeSchoolEvent } from "@/lib/billing/school-billing";
import { applyRefundEvent } from "@/lib/billing/refund-lifecycle";

const schoolCharge = { id: 1, status: "success", reference: "ref_old", amount: 6000, customer: { customer_code: "CUS_1", email: "owner@example.com" }, plan: { plan_code: "PLN_school" } };
const setup = () => refundDb({ pending_refunds: [refundRow({ status: "processing" })], subscriptions: [paidRow()], profiles: [{ id: "user-1", email: "owner@example.com", full_name: "Owner" }] });
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(verifyTransaction).mockResolvedValue(schoolCharge as never);
  vi.mocked(routeSchoolEvent).mockResolvedValue("learner");
});

// A school's older charge is not findable by reference alone; without the
// charge's plan and customer its refund would leave the school plan running.
it("routes a processed refund to schools with the charge's plan and customer", async () => {
  vi.mocked(routeSchoolEvent).mockResolvedValue("school");
  const db = setup();
  await applyRefundEvent(db.client, "refund.processed", { transaction_reference: "ref_old", amount: 6000 });
  expect(routeSchoolEvent).toHaveBeenCalledWith(db.client, "refund.processed", { reference: "ref_old", planCode: "PLN_school", customerCode: "CUS_1" });
  expect(db.tables.subscriptions[0].tier).toBe("premium");
  expect(db.tables.pending_refunds[0].status).toBe("refunded");
});
it("looks the charge up when the event carries no amount", async () => {
  const db = setup();
  await applyRefundEvent(db.client, "refund.processed", { transaction_reference: "ref_old" });
  expect(verifyTransaction).toHaveBeenCalledTimes(1);
  expect(vi.mocked(routeSchoolEvent).mock.calls[0][2]).toMatchObject({ planCode: "PLN_school", customerCode: "CUS_1" });
});
it("falls back to the reference when Paystack can't be reached, and still settles a learner refund", async () => {
  vi.mocked(verifyTransaction).mockRejectedValue(new Error("paystack down"));
  const db = setup();
  await applyRefundEvent(db.client, "refund.processed", { transaction_reference: "ref_old" });
  expect(vi.mocked(routeSchoolEvent).mock.calls[0][2]).toEqual({ reference: "ref_old" });
  expect(db.tables.subscriptions[0].tier).toBe("free");
  expect(db.tables.pending_refunds[0].status).toBe("refunded");
});
