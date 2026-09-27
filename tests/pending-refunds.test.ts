import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The money-back retry queue.
 *
 * An instant refund can be refused by Paystack for reasons that resolve on
 * their own — "Insufficient balance to process refund" being the classic,
 * since live refunds are deducted from the settlement balance which refills
 * on the T+1–2 business-day cycle. These tests pin the contract that lets a
 * learner cancel once and simply receive their money:
 *
 *  - a refused refund lands in pending_refunds exactly once per charge;
 *  - an already-settled row is never resurrected back to 'queued';
 *  - each cron pass retries once, recording failures without giving up;
 *  - success marks the row refunded and revokes the tier ONLY while the
 *    subscription still names that charge as its most recent payment —
 *    someone who re-subscribed while their old refund sat queued keeps the
 *    new tier they paid for;
 *  - after REFUND_MAX_ATTEMPTS the row fails closed and support is pointed
 *    at the manual fix;
 *  - support hears after REFUND_ESCALATE_AFTER_ATTEMPTS failed retries, once,
 *    rather than only when the queue gives up;
 *  - /admin/refunds can retry a row, stop its retries, and record an EFT
 *    repayment, and never lets an EFT be recorded while the cron could still
 *    refund the same charge through Paystack.
 */

vi.mock("@/lib/paystack/client", () => ({
  refundTransaction: vi.fn(),
  verifyTransaction: vi.fn(),
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
// Email is off by default; the escalation and EFT tests switch it on.
const mail = vi.hoisted(() => ({ on: false }));
vi.mock("@/lib/notify/email", () => ({
  get isEmailConfigured() {
    return mail.on;
  },
  sendEmail: vi.fn(async () => true),
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));

import { createAdminClient } from "@/lib/supabase/admin";
import { refundTransaction, verifyTransaction } from "@/lib/paystack/client";
import { sendEmail } from "@/lib/notify/email";
import { SUPPORT_EMAIL } from "@/lib/constants";
import {
  REFUND_ESCALATE_AFTER_ATTEMPTS,
  REFUND_MAX_ATTEMPTS,
  processPendingRefunds,
  queuePendingRefund,
  recordManualRefund,
  refundsForAdmin,
  retryRefundNow,
  stopRefundRetries,
} from "@/lib/billing/pending-refunds";

type Row = Record<string, unknown>;
type Entry = {
  table: string;
  op: string;
  values?: Row;
  filters: Record<string, unknown>;
  /** `.update(...).select()` — resolve with the rows the update touched. */
  returning?: boolean;
};

/** Filters are stored as `col`, `col__neq`, `col__in` or `col__gte`. */
function matchesFilters(r: Row, filters: Record<string, unknown>): boolean {
  return Object.entries(filters).every(([k, v]) => {
    if (k.endsWith("__neq")) return r[k.slice(0, -5)] !== v;
    if (k.endsWith("__in")) return (v as unknown[]).includes(r[k.slice(0, -4)]);
    if (k.endsWith("__gte")) return String(r[k.slice(0, -5)] ?? "") >= String(v);
    return r[k] === v;
  });
}

/**
 * Fluent Supabase double. Entries record every operation with its accumulated
 * filters; rows mutate like Postgres would (insert-ignore respects the unique
 * transaction_reference).
 */
function makeFakeAdmin(initial: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = structuredClone(initial);
  const entries: Entry[] = [];

  function build(table: string, op: string, values?: Row) {
    const entry: Entry = { table, op, values, filters: {} };
    entries.push(entry);
    const chain: Record<string, unknown> = {};
    const applyUpdate = (): Row[] => {
      const touched = (tables[table] ?? []).filter((r) => matchesFilters(r, entry.filters));
      for (const r of touched) if (entry.values) Object.assign(r, entry.values);
      return touched;
    };
    Object.assign(chain, {
      eq(col: string, val: unknown) {
        entry.filters[col] = val;
        return chain;
      },
      neq(col: string, val: unknown) {
        entry.filters[`${col}__neq`] = val;
        return chain;
      },
      in(col: string, vals: unknown[]) {
        entry.filters[`${col}__in`] = vals;
        return chain;
      },
      gte(col: string, val: unknown) {
        entry.filters[`${col}__gte`] = val;
        return chain;
      },
      order() {
        return chain;
      },
      limit() {
        return chain;
      },
      select(_cols?: string) {
        if (entry.op === "update") entry.returning = true;
        return chain;
      },
      update(vals: Row) {
        entry.op = "update";
        entry.values = vals;
        return chain;
      },
      upsert(vals: Row, options?: { ignoreDuplicates?: boolean }) {
        entry.op = "insert";
        entry.values = vals;
        const list = (tables[table] ??= []);
        // Production uses upsert + ignoreDuplicates + onConflict, which is
        // ON CONFLICT DO NOTHING: an existing row wins untouched.
        const exists = list.some(
          (r) => r["transaction_reference"] === vals["transaction_reference"],
        );
        if (!exists) {
          list.push({
            id: `pr-${entries.length}`,
            status: "queued",
            attempts: 0,
            last_error: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...vals,
          });
        }
        void options;
        return Promise.resolve({ data: null, error: null });
      },
      maybeSingle: async () => ({ data: rowMatchesList()[0] ?? null, error: null }),
      then(resolve?: (v: { data: Row[] | null; error: null }) => unknown) {
        let data: Row[] | null = null;
        if (entry.op === "update") {
          const touched = applyUpdate();
          if (entry.returning) data = touched;
        } else if (entry.op === "select") {
          data = rowMatchesList();
        }
        return Promise.resolve({ data, error: null }).then(resolve);
      },
    });
    function rowMatchesList(): Row[] {
      return (tables[table] ?? []).filter((r) => matchesFilters(r, entry.filters));
    }
    return chain as unknown as SupabaseClient;
  }

  const client = {
    from(table: string) {
      return build(table, "select") as never;
    },
  } as unknown as SupabaseClient;

  // Re-derive entries after mutations for assertions.
  return {
    client,
    entries,
    tables,
    updatesOn(table: string) {
      return entries.filter((e) => e.table === table && e.op === "update");
    },
  };
}

const queuedRow = (over: Row = {}): Row => ({
  id: "pr-1",
  user_id: "user-1",
  transaction_reference: "ref_owed",
  status: "queued",
  attempts: 0,
  last_error: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...over,
});

const subscriptionRow = (over: Row = {}): Row => ({
  user_id: "user-1",
  tier: "premium",
  status: "active",
  last_charge_reference: "ref_owed",
  ...over,
});

beforeEach(() => {
  delete process.env.RESEND_API_KEY; // keep every email path inert
  mail.on = false;
  vi.mocked(sendEmail).mockClear();
  vi.mocked(refundTransaction).mockReset();
  vi.mocked(verifyTransaction).mockReset();
  vi.mocked(createAdminClient).mockReset().mockReturnValue(null as never);
});

describe("queuePendingRefund", () => {
  it("inserts a queued row for the charge", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [] });
    const out = await queuePendingRefund(fake.client, {
      userId: "user-1",
      reference: "ref_owed",
      lastError: "Insufficient balance",
    });
    expect(out).toEqual({ ok: true, rowStatus: "queued" });
    expect(fake.tables.pending_refunds).toHaveLength(1);
    expect(fake.tables.pending_refunds[0]).toMatchObject({
      transaction_reference: "ref_owed",
      user_id: "user-1",
      status: "queued",
    });
  });

  it("never resurrects a settled row back to 'queued'", async () => {
    const fake = makeFakeAdmin({
      pending_refunds: [queuedRow({ status: "refunded", refunded_at: new Date().toISOString() })],
    });
    const out = await queuePendingRefund(fake.client, { userId: "user-1", reference: "ref_owed" });
    // The existing row wins untouched — re-queueing it would re-fire the refund.
    expect(out).toEqual({ ok: true, rowStatus: "refunded" });
    expect(fake.tables.pending_refunds[0].status).toBe("refunded");
  });

  it("reports failure when the write itself fails", async () => {
    const failing = {
      from: () => ({
        upsert: async () => ({ data: null, error: { message: "db down" } }),
      }),
    } as unknown as SupabaseClient;
    const out = await queuePendingRefund(failing, { userId: "u", reference: "r" });
    expect(out).toEqual({ ok: false });
  });
});

describe("processPendingRefunds", () => {
  it("records a refusal and keeps the row queued for the next pass", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [queuedRow()] });
    vi.mocked(createAdminClient).mockReturnValue(fake.client as never);
    vi.mocked(refundTransaction).mockRejectedValue(
      new Error("Paystack /refund: Insufficient balance to process refund"),
    );

    const summary = await processPendingRefunds(fake.client);
    expect(summary).toEqual({ attempted: 1, refunded: 0, failed: 0, waiting: 1, recovered: 0 });
    expect(fake.tables.pending_refunds[0].status).toBe("queued");
    expect(fake.tables.pending_refunds[0].attempts).toBe(1);
    expect(String(fake.tables.pending_refunds[0].last_error)).toContain("Insufficient balance");
  });

  it("on success marks the row refunded and downgrades the matching subscription", async () => {
    const fake = makeFakeAdmin({
      pending_refunds: [queuedRow()],
      subscriptions: [subscriptionRow()],
    });
    vi.mocked(createAdminClient).mockReturnValue(fake.client as never);
    vi.mocked(refundTransaction).mockResolvedValue(undefined as never);

    const summary = await processPendingRefunds(fake.client);
    expect(summary.refunded).toBe(1);

    const row = fake.tables.pending_refunds[0];
    expect(row.status).toBe("refunded");
    expect(row.refunded_at).toBeTruthy();

    // The revoke must be GUARDED: only the subscription whose most recent
    // charge IS the refunded one may lose its tier.
    const downgrade = fake.updatesOn("subscriptions").find((e) => e.values?.tier === "free");
    expect(downgrade).toBeDefined();
    expect(downgrade!.filters.user_id).toBe("user-1");
    expect(downgrade!.filters.last_charge_reference).toBe("ref_owed");

    expect(fake.tables.subscriptions[0]).toMatchObject({ tier: "free", status: "canceled" });
  });

  it("a learner who re-subscribed keeps their NEW tier when the old refund clears", async () => {
    const fake = makeFakeAdmin({
      pending_refunds: [queuedRow()],
      // last_charge_reference has moved on: this is a fresh paid plan.
      subscriptions: [subscriptionRow({ last_charge_reference: "ref_newer", tier: "premium_plus" })],
    });
    vi.mocked(createAdminClient).mockReturnValue(fake.client as never);
    vi.mocked(refundTransaction).mockResolvedValue(undefined as never);

    const summary = await processPendingRefunds(fake.client);
    expect(summary.refunded).toBe(1);
    expect(fake.tables.pending_refunds[0].status).toBe("refunded");
    // Old money went back, but the new plan survives untouched.
    expect(fake.tables.subscriptions[0]).toMatchObject({ tier: "premium_plus" });
  });

  it("gives up after REFUND_MAX_ATTEMPTS without calling Paystack again", async () => {
    const fake = makeFakeAdmin({
      pending_refunds: [queuedRow({ attempts: REFUND_MAX_ATTEMPTS, last_error: "still empty" })],
    });
    vi.mocked(createAdminClient).mockReturnValue(fake.client as never);
    vi.mocked(refundTransaction).mockRejectedValue(new Error("Insufficient balance"));

    const summary = await processPendingRefunds(fake.client);
    expect(summary.failed).toBe(1);
    expect(summary.attempted).toBe(0);
    expect(vi.mocked(refundTransaction)).not.toHaveBeenCalled();
    expect(fake.tables.pending_refunds[0].status).toBe("failed");
  });

  it("an empty queue is a no-op", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [] });
    const summary = await processPendingRefunds(fake.client);
    expect(summary).toEqual({ attempted: 0, refunded: 0, failed: 0, waiting: 0, recovered: 0 });
    expect(refundTransaction).not.toHaveBeenCalled();
  });

  it("recovers an old claimed cancellation with no queue row", async () => {
    const fake = makeFakeAdmin({
      pending_refunds: [],
      subscriptions: [
        subscriptionRow({ money_back_used: true, cancel_at_period_end: true }),
      ],
    });
    vi.mocked(createAdminClient).mockReturnValue(fake.client as never);
    vi.mocked(refundTransaction).mockRejectedValue(new Error("Insufficient balance"));

    const summary = await processPendingRefunds(fake.client);

    expect(summary).toEqual({ attempted: 1, refunded: 0, failed: 0, waiting: 1, recovered: 1 });
    expect(fake.tables.pending_refunds).toHaveLength(1);
    expect(fake.tables.pending_refunds[0]).toMatchObject({
      transaction_reference: "ref_owed",
      status: "queued",
      attempts: 1,
    });
  });
});

describe("early escalation", () => {
  const sent = () => vi.mocked(sendEmail).mock.calls.map(([msg]) => msg);

  it(`pages support once, on failed retry ${REFUND_ESCALATE_AFTER_ATTEMPTS}`, async () => {
    mail.on = true;
    const fake = makeFakeAdmin({
      pending_refunds: [queuedRow({ attempts: REFUND_ESCALATE_AFTER_ATTEMPTS - 1 })],
    });
    vi.mocked(refundTransaction).mockRejectedValue(new Error("Insufficient balance to process refund"));

    await processPendingRefunds(fake.client);

    expect(sent()).toHaveLength(1);
    expect(sent()[0]).toMatchObject({ to: SUPPORT_EMAIL });
    expect(sent()[0].subject).toContain("Refund stuck");
    expect(sent()[0].text).toContain("/admin/refunds");
    expect(fake.tables.pending_refunds[0]).toMatchObject({
      status: "queued",
      attempts: REFUND_ESCALATE_AFTER_ATTEMPTS,
    });
  });

  it("stays quiet on the retries before and after", async () => {
    mail.on = true;
    vi.mocked(refundTransaction).mockRejectedValue(new Error("Insufficient balance"));
    for (const attempts of [0, REFUND_ESCALATE_AFTER_ATTEMPTS, REFUND_ESCALATE_AFTER_ATTEMPTS + 3]) {
      const fake = makeFakeAdmin({ pending_refunds: [queuedRow({ attempts })] });
      await processPendingRefunds(fake.client);
    }
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("admin: retryRefundNow", () => {
  it("records a refusal without spending the cron's attempt budget", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [queuedRow({ attempts: 3 })] });
    vi.mocked(refundTransaction).mockRejectedValue(new Error("Insufficient balance to process refund"));

    const out = await retryRefundNow(fake.client, "pr-1");

    expect(out.ok).toBe(false);
    expect(out.message).toContain("Insufficient balance");
    expect(fake.tables.pending_refunds[0]).toMatchObject({ status: "queued", attempts: 3 });
    expect(String(fake.tables.pending_refunds[0].last_error)).toContain("Insufficient balance");
  });

  it("settles a stopped row once Paystack accepts, with the guarded downgrade", async () => {
    const fake = makeFakeAdmin({
      pending_refunds: [queuedRow({ status: "failed", attempts: REFUND_MAX_ATTEMPTS })],
      subscriptions: [subscriptionRow()],
    });
    vi.mocked(refundTransaction).mockResolvedValue(undefined as never);

    const out = await retryRefundNow(fake.client, "pr-1");

    expect(out.ok).toBe(true);
    expect(fake.tables.pending_refunds[0].status).toBe("refunded");
    expect(fake.tables.subscriptions[0]).toMatchObject({ tier: "free", status: "canceled" });
  });

  it("never asks Paystack to refund a row that is already refunded", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [queuedRow({ status: "refunded" })] });
    const out = await retryRefundNow(fake.client, "pr-1");
    expect(out.ok).toBe(false);
    expect(refundTransaction).not.toHaveBeenCalled();
  });
});

describe("admin: stopRefundRetries", () => {
  it("takes a queued row away from the cron and keeps Paystack's reason", async () => {
    const fake = makeFakeAdmin({
      pending_refunds: [queuedRow({ last_error: "Insufficient balance to process refund" })],
    });

    const out = await stopRefundRetries(fake.client, "pr-1", "owner@example.com");

    expect(out.ok).toBe(true);
    const row = fake.tables.pending_refunds[0];
    expect(row.status).toBe("failed");
    expect(String(row.last_error)).toContain("owner@example.com");
    expect(String(row.last_error)).toContain("Insufficient balance");

    // The cron now leaves it alone.
    vi.mocked(refundTransaction).mockResolvedValue(undefined as never);
    const summary = await processPendingRefunds(fake.client);
    expect(summary.attempted).toBe(0);
    expect(refundTransaction).not.toHaveBeenCalled();
  });

  it("refuses a row that is not retrying", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [queuedRow({ status: "refunded" })] });
    const out = await stopRefundRetries(fake.client, "pr-1", "owner@example.com");
    expect(out.ok).toBe(false);
    expect(fake.tables.pending_refunds[0].status).toBe("refunded");
  });
});

describe("admin: recordManualRefund", () => {
  const eft = { reference: "FNB 2026-10-01", by: "owner@example.com" };

  it("refuses while the cron could still refund the charge through Paystack", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [queuedRow()] });
    const out = await recordManualRefund(fake.client, "pr-1", eft);
    expect(out.ok).toBe(false);
    expect(out.message).toContain("Stop the automatic retries first");
    expect(fake.tables.pending_refunds[0].status).toBe("queued");
    expect(fake.updatesOn("pending_refunds")).toHaveLength(0);
  });

  it("settles a stopped row, ends the plan and tells the learner it went by EFT", async () => {
    mail.on = true;
    const fake = makeFakeAdmin({
      pending_refunds: [queuedRow({ status: "failed" })],
      subscriptions: [subscriptionRow()],
      profiles: [{ id: "user-1", email: "learner@example.com", full_name: "Thandi Mokoena" }],
    });
    vi.mocked(createAdminClient).mockReturnValue(fake.client as never);
    vi.mocked(verifyTransaction).mockResolvedValue({ amount: 6000 } as never);

    const out = await recordManualRefund(fake.client, "pr-1", eft);

    expect(out.ok).toBe(true);
    expect(out.message).toContain("The learner has been emailed");
    expect(fake.tables.pending_refunds[0]).toMatchObject({
      status: "refunded",
      manual_reference: "FNB 2026-10-01",
      manual_recorded_by: "owner@example.com",
    });
    expect(fake.tables.pending_refunds[0].refunded_at).toBeTruthy();
    expect(fake.tables.subscriptions[0]).toMatchObject({ tier: "free", status: "canceled" });
    expect(refundTransaction).not.toHaveBeenCalled();

    const [learnerMail] = vi.mocked(sendEmail).mock.calls.map(([msg]) => msg);
    expect(learnerMail).toMatchObject({ to: "learner@example.com", subject: "Your refund has been paid" });
    expect(learnerMail.text).toContain("R 60");
    expect(learnerMail.text).toContain("EFT");
    expect(learnerMail.text).not.toContain("card");
  });

  it("says so when no email could go to the learner", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [queuedRow({ status: "failed" })] });
    const out = await recordManualRefund(fake.client, "pr-1", eft);
    expect(out.ok).toBe(true);
    expect(out.message).toContain("let the learner know yourself");
  });

  it("records a repayment once", async () => {
    const fake = makeFakeAdmin({ pending_refunds: [queuedRow({ status: "failed" })] });
    await recordManualRefund(fake.client, "pr-1", eft);
    const again = await recordManualRefund(fake.client, "pr-1", { ...eft, reference: "second" });
    expect(again.ok).toBe(false);
    expect(fake.tables.pending_refunds[0].manual_reference).toBe("FNB 2026-10-01");
  });
});

describe("admin: refundsForAdmin", () => {
  it("lists what is owed with the learner and amount, and recent settlements", async () => {
    const fake = makeFakeAdmin({
      pending_refunds: [
        queuedRow(),
        queuedRow({ id: "pr-2", transaction_reference: "ref_stopped", status: "failed" }),
        queuedRow({
          id: "pr-3",
          transaction_reference: "ref_paid",
          status: "refunded",
          refunded_at: new Date().toISOString(),
          manual_reference: "FNB 1",
        }),
        queuedRow({
          id: "pr-4",
          transaction_reference: "ref_old",
          status: "refunded",
          refunded_at: "2020-01-01T00:00:00.000Z",
        }),
      ],
      profiles: [{ id: "user-1", email: "learner@example.com", full_name: "Thandi Mokoena" }],
    });
    vi.mocked(verifyTransaction).mockImplementation(async (reference: string) => {
      if (reference === "ref_stopped") throw new Error("paystack down");
      return { amount: 6000 } as never;
    });

    const out = await refundsForAdmin(fake.client);

    if (!out.ok) throw new Error(out.message);
    expect(out.open.map((row) => [row.id, row.amountCents])).toEqual([
      ["pr-1", 6000],
      ["pr-2", null],
    ]);
    expect(out.open[0]).toMatchObject({ email: "learner@example.com", name: "Thandi Mokoena" });
    expect(out.settled.map((row) => row.id)).toEqual(["pr-3"]);
  });
});
