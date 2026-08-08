import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaystackTransaction } from "@/lib/paystack/client";

/**
 * The reconciliation cron is the safety net under the webhook: it grants
 * charges Paystack took that we have no ledger row for. Two properties matter
 * more than anything else here, and both are silent when broken —
 *
 *   1. It must never double-grant. A second grant on a tutor top-up is free
 *      credits, so "already applied" has to be detected from the ledger's
 *      unique violation and stop there.
 *   2. It must not lose the metadata that ties a charge to an account. The
 *      list endpoint hands back `metadata` as a JSON string and `plan` as a
 *      bare code; both differ from the webhook payload, and both failures make
 *      `applyChargeSuccess` quietly decide the charge isn't ours.
 */

vi.mock("@/lib/paystack/client", () => ({
  fetchCustomer: vi.fn().mockResolvedValue({
    customer_code: "CUS_x",
    email: "learner@example.com",
    subscriptions: [],
  }),
  disableSubscription: vi.fn(),
}));
vi.mock("@/lib/notify/email", () => ({
  isEmailConfigured: false,
  sendEmail: vi.fn(),
}));

import { applyChargeOnce, normaliseTransaction, chargeLedgerId } from "@/lib/paystack/apply";

/**
 * Admin double that records ledger inserts/deletes and the grant upsert.
 * `insertError` lets a case simulate the unique violation that means
 * "another path already applied this charge".
 */
function fakeAdmin(opts: { insertError?: { code: string; message: string }; upsertFails?: boolean } = {}) {
  const insert = vi.fn().mockResolvedValue({ error: opts.insertError ?? null });
  const upsert = vi
    .fn()
    .mockResolvedValue({ error: opts.upsertFails ? { message: "db down" } : null });
  const eq = vi.fn().mockResolvedValue({ error: null });
  const del = vi.fn(() => ({ eq }));

  const admin = {
    from: vi.fn((table: string) => {
      if (table === "payment_events") return { insert, delete: del };
      return { upsert };
    }),
  } as unknown as SupabaseClient;

  return { admin, insert, upsert, del, eq };
}

const charge = {
  id: 991,
  reference: "ref_recon",
  amount: 6000,
  customer: { customer_code: "CUS_x", email: "learner@example.com", first_name: "Sam" },
  metadata: { kind: "subscription", plan: "premium", user_id: "user-1" },
  plan: { plan_code: "PLN_prem" },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("applyChargeOnce", () => {
  it("claims the ledger row and grants the tier", async () => {
    const { admin, insert, upsert } = fakeAdmin();
    await expect(applyChargeOnce(admin, charge)).resolves.toBe("applied");
    expect(insert).toHaveBeenCalledWith({ id: "charge.success:991", type: "charge.success" });
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("skips a charge another path already applied, without re-granting", async () => {
    // The unique violation IS the idempotency guarantee — a second grant on a
    // top-up would be free credits.
    const { admin, upsert } = fakeAdmin({ insertError: { code: "23505", message: "duplicate" } });
    await expect(applyChargeOnce(admin, charge)).resolves.toBe("already_applied");
    expect(upsert).not.toHaveBeenCalled();
  });

  it("releases the ledger row when the grant fails, so a retry is not swallowed", async () => {
    // Leaving the row behind would mark a charge as applied that never was —
    // the exact paid-but-never-granted state this whole job exists to repair.
    const { admin, del, eq } = fakeAdmin({ upsertFails: true });
    await expect(applyChargeOnce(admin, charge)).resolves.toBe("failed");
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith("id", "charge.success:991");
  });

  it("does not grant when the ledger itself is unreachable", async () => {
    const { admin, upsert } = fakeAdmin({ insertError: { code: "08006", message: "conn refused" } });
    await expect(applyChargeOnce(admin, charge)).resolves.toBe("failed");
    expect(upsert).not.toHaveBeenCalled();
  });

  it("shares its ledger id shape with the webhook and verify paths", () => {
    // If these ever diverge the two paths stop deduplicating against each
    // other and a charge gets granted twice.
    expect(chargeLedgerId(991)).toBe("charge.success:991");
    expect(chargeLedgerId("991")).toBe(chargeLedgerId(991));
  });
});

describe("cron authorisation", () => {
  // Shared by both crons. An open reconcile endpoint would let anyone drive
  // grant attempts against arbitrary Paystack transactions.
  const req = (auth?: string) =>
    new Request("https://k53mentorai.co.za/api/cron/reconcile-payments", {
      headers: auth ? { authorization: auth } : {},
    });

  it("rejects when CRON_SECRET is unset — unconfigured means nobody, not everybody", async () => {
    delete process.env.CRON_SECRET;
    const { isAuthorizedCron } = await import("@/lib/cron/auth");
    expect(isAuthorizedCron(req("Bearer anything"))).toBe(false);
  });

  it("rejects a missing or wrong bearer", async () => {
    process.env.CRON_SECRET = "s3cret";
    const { isAuthorizedCron } = await import("@/lib/cron/auth");
    expect(isAuthorizedCron(req())).toBe(false);
    expect(isAuthorizedCron(req("Bearer wrong"))).toBe(false);
    expect(isAuthorizedCron(req("s3cret"))).toBe(false); // missing the scheme
  });

  it("accepts the secret Vercel sends", async () => {
    process.env.CRON_SECRET = "s3cret";
    const { isAuthorizedCron } = await import("@/lib/cron/auth");
    expect(isAuthorizedCron(req("Bearer s3cret"))).toBe(true);
  });
});

describe("normaliseTransaction", () => {
  const base: PaystackTransaction = {
    id: 12,
    status: "success",
    reference: "ref_a",
    amount: 6000,
    customer: { customer_code: "CUS_y", email: "a@b.c" },
  };

  it("parses metadata delivered as a JSON string", () => {
    // Losing user_id here turns a real payment into an ownerless renewal.
    const out = normaliseTransaction({
      ...base,
      metadata: JSON.stringify({ user_id: "user-9", plan: "premium", kind: "subscription" }),
    });
    expect(out.metadata).toEqual({ user_id: "user-9", plan: "premium", kind: "subscription" });
  });

  it("passes through metadata already delivered as an object", () => {
    const out = normaliseTransaction({ ...base, metadata: { user_id: "user-9" } });
    expect(out.metadata).toEqual({ user_id: "user-9" });
  });

  it("survives unparseable metadata rather than throwing mid-run", () => {
    const out = normaliseTransaction({ ...base, metadata: "{not json" });
    expect(out.metadata).toBeNull();
  });

  it("lifts a bare plan code into the { plan_code } the grant checks for", () => {
    // Without this the grant decides the charge isn't one of ours and returns
    // silently, leaving a paying subscriber on free.
    const out = normaliseTransaction({ ...base, plan: "PLN_prem" });
    expect(out.plan).toEqual({ plan_code: "PLN_prem" });
  });

  it("keeps an object plan code as-is", () => {
    const out = normaliseTransaction({ ...base, plan: { plan_code: "PLN_prem" } });
    expect(out.plan).toEqual({ plan_code: "PLN_prem" });
  });

  it("reports no plan for a one-off charge", () => {
    expect(normaliseTransaction({ ...base, plan: "" }).plan).toBeNull();
    expect(normaliseTransaction({ ...base, plan: null }).plan).toBeNull();
    expect(normaliseTransaction(base).plan).toBeNull();
  });
});
