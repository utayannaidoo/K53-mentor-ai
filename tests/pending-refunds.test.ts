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
 *    at the manual fix.
 */

vi.mock("@/lib/paystack/client", () => ({
  refundTransaction: vi.fn(),
  verifyTransaction: vi.fn(),
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
vi.mock("@/lib/notify/email", () => ({ isEmailConfigured: false, sendEmail: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));

import { createAdminClient } from "@/lib/supabase/admin";
import { refundTransaction } from "@/lib/paystack/client";
import {
  REFUND_MAX_ATTEMPTS,
  processPendingRefunds,
  queuePendingRefund,
} from "@/lib/billing/pending-refunds";

type Row = Record<string, unknown>;
type Entry = {
  table: string;
  op: string;
  values?: Row;
  filters: Record<string, unknown>;
};

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
    const rowMatches = (r: Row) =>
      Object.entries(entry.filters).every(([k, v]) => {
        if (typeof k === "string" && k.endsWith("__neq")) {
          return r[k.slice(0, -5)] !== v;
        }
        return r[k] === v;
      });
    const chain: Record<string, unknown> = {};
    const applyUpdate = () => {
      for (const r of tables[table] ?? []) {
        if (rowMatches(r) && entry.values) Object.assign(r, entry.values);
      }
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
      order() {
        return chain;
      },
      limit() {
        return chain;
      },
      select(_cols?: string) {
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
        if (entry.op === "update") applyUpdate();
        const data = entry.op === "select" ? rowMatchesList() : null;
        return Promise.resolve({ data, error: null }).then(resolve);
      },
    });
    function rowMatchesList(): Row[] {
      return (tables[table] ?? []).filter((r) =>
        Object.entries(entry.filters).every(([k, v]) => {
          if (typeof k === "string" && k.endsWith("__neq")) {
            return r[k.slice(0, -5)] !== v;
          }
          return r[k] === v;
        }),
      );
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
  vi.mocked(refundTransaction).mockReset();
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
    expect(summary).toEqual({ attempted: 1, refunded: 0, failed: 0, waiting: 1 });
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
    expect(summary).toEqual({ attempted: 0, refunded: 0, failed: 0, waiting: 0 });
    expect(refundTransaction).not.toHaveBeenCalled();
  });
});
