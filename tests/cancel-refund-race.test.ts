import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The 7-day money-back guarantee must refund EXACTLY ONCE.
 *
 * Two taps of "Yes, cancel" (or a retry behind a flaky connection) used to
 * race: both requests read `money_back_used = false`, both passed
 * refundEligible, both called Paystack's refund API for the same charge. The
 * route now claims the slot with a conditional UPDATE first; these tests pin
 * that only the claim winner refunds, while the loser finishes the
 * cancellation down the ordinary outside-window path.
 */

vi.mock("@/lib/env", () => ({
  isPaystackConfigured: true,
  isSupabaseConfigured: true,
}));
vi.mock("@/lib/ai/rate-limit", () => ({
  limitCheckout: vi.fn(async () => ({ success: true, retryAfter: 0 })),
  limitUserDaily: vi.fn(async () => ({ success: true, retryAfter: 0 })),
  clientIp: vi.fn(() => "test-ip"),
  ACCOUNT_DAILY_LIMIT: { cancel: 5 },
}));
vi.mock("@/lib/paystack/client", () => ({
  refundTransaction: vi.fn(),
  verifyTransaction: vi.fn(),
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
vi.mock("@/lib/notify/email", () => ({ isEmailConfigured: false, sendEmail: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));

import { POST } from "@/app/api/billing/cancel/route";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundTransaction, fetchCustomer } from "@/lib/paystack/client";

/** Fresh row per request-read, inside the 7-day window, guarantee unused. */
const readableRow = () => ({
  tier: "premium",
  provider_customer_id: "CUS_1",
  last_charge_reference: "ref_first_charge",
  paid_at: new Date().toISOString(),
  money_back_used: false,
  current_period_end: new Date(Date.now() + 20 * 86_400_000).toISOString(),
  created_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
});

function makeServerClient() {
  return {
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
    from(table: string) {
      void table;
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({ data: readableRow(), error: null }),
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
}

/**
 * Admin double carrying the SHARED claim state across concurrent requests:
 * the conditional `.update({money_back_used:true}).eq(money_back_used,false)`
 * succeeds exactly once, like Postgres would. Also serves a `pending_refunds`
 * table so the queue path (a failed instant refund) can be exercised.
 */
function makeAdminSharedState() {
  const writes: Record<string, unknown>[] = [];
  const inserts: Record<string, unknown>[] = [];
  const queuedRows: Record<string, unknown>[] = [];
  let moneyBackUsed = false;
  return {
    writes,
    inserts,
    client: {
      from(table: string) {
        if (table === "pending_refunds") {
          return {
            upsert(values: Record<string, unknown>) {
              inserts.push(values);
              queuedRows.push({
                id: `pr-${queuedRows.length + 1}`,
                attempts: 0,
                status: "queued",
                created_at: new Date().toISOString(),
                ...values,
              });
              return Promise.resolve({ data: null, error: null });
            },
            update(values: Record<string, unknown>) {
              const chain = {
                eq(_col: string, _val: unknown) {
                  return chain;
                },
                then(resolve?: (v: { data: null; error: null }) => unknown) {
                  writes.push({ table, values });
                  return Promise.resolve({ data: null, error: null }).then(resolve);
                },
              };
              return chain;
            },
            select() {
              return {
                eq(_col: string, val: unknown) {
                  return {
                    maybeSingle: async () => ({
                      data: queuedRows.find((r) => r.transaction_reference === val) ?? null,
                      error: null,
                    }),
                  };
                },
              };
            },
          };
        }
        return {
          update(values: Record<string, unknown>) {
            const filters: Record<string, unknown> = {};
            const chain = {
              eq(col: string, val: unknown) {
                filters[col] = val;
                return chain;
              },
              select() {
                const isClaim =
                  values.money_back_used === true && filters.money_back_used === false;
                if (isClaim) {
                  if (!moneyBackUsed) {
                    moneyBackUsed = true;
                    writes.push({ claim: true });
                    return Promise.resolve({ data: [{ user_id: "user-1" }], error: null });
                  }
                  return Promise.resolve({ data: [], error: null });
                }
                writes.push({ values });
                return Promise.resolve({ data: null, error: null });
              },
              then(resolve: (v: { error: null }) => unknown) {
                writes.push({ values });
                return Promise.resolve({ error: null }).then(resolve);
              },
            };
            return chain;
          },
        };
      },
    } as unknown as SupabaseClient,
  };
}

function send() {
  return POST(new Request("https://k53mentorai.co.za/api/billing/cancel", { method: "POST" }));
}

beforeEach(() => {
  vi.mocked(createClient).mockReset();
  vi.mocked(createAdminClient).mockReset();
  vi.mocked(refundTransaction).mockReset().mockResolvedValue(undefined as never);
  // One live subscription at Paystack, so the disable step succeeds (count 1).
  vi.mocked(fetchCustomer).mockReset().mockResolvedValue({
    customer_code: "CUS_1",
    email: "learner@example.com",
    subscriptions: [
      {
        subscription_code: "SUB_1",
        email_token: "tok_1",
        status: "active",
        plan: { plan_code: "PLN_premium_monthly" },
      },
    ],
  } as never);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("the money-back refund races itself exactly once", () => {
  it("two concurrent cancels produce ONE Paystack refund and one immediate revoke", async () => {
    const { client, writes } = makeAdminSharedState();
    vi.mocked(createClient).mockResolvedValue(makeServerClient() as never);
    // createAdminClient is SYNC in production code (returns SupabaseClient | null),
    // so the mock must use mockReturnValue — a promise here breaks `admin.from`.
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const [a, b] = await Promise.all([send(), send()]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);

    expect(refundTransaction).toHaveBeenCalledTimes(1);
    // Notes ride along so the refund is identifiable on Paystack's dashboard.
    expect(refundTransaction).toHaveBeenCalledWith("ref_first_charge", {
      merchantNote: "K53 Mentor 7-day money-back cancellation",
      customerNote: "Full refund of your most recent K53 Mentor payment.",
    });

    const bodyA = (await a.json()) as { refunded?: boolean; endsNow?: boolean };
    const bodyB = (await b.json()) as { refunded?: boolean; endsNow?: boolean };
    const winners = [bodyA, bodyB].filter((r) => r.refunded === true);
    expect(winners).toHaveLength(1);
    expect(winners[0].endsNow).toBe(true);

    // Exactly one claim succeeded, and the revoke wrote free/canceled once.
    expect(writes.filter((w) => w.claim)).toHaveLength(1);
    expect(
      writes.some((w) => {
        const v = w.values as Record<string, unknown> | undefined;
        return v?.tier === "free" && v?.status === "canceled" && v?.money_back_used !== false;
      }),
    ).toBe(true);
  });

  it("a failed refund is QUEUED for automatic retry and the claim stays latched", async () => {
    const { client, writes, inserts } = makeAdminSharedState();
    vi.mocked(createClient).mockResolvedValue(makeServerClient() as never);
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    vi.mocked(refundTransaction).mockRejectedValue(
      new Error("Paystack /refund: Insufficient balance to process refund"),
    );

    const res = await send();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      refunded?: boolean;
      refundError?: boolean;
      refundQueued?: boolean;
      endsNow?: boolean;
    };

    expect(body.refunded).toBe(false);
    // A queued refund is not an error from the learner's point of view.
    expect(body.refundError).toBe(false);
    expect(body.refundQueued).toBe(true);
    expect(body.endsNow).toBe(false);

    // The charge went into the retry queue…
    expect(inserts).toHaveLength(1);
    expect(inserts[0].transaction_reference).toBe("ref_first_charge");
    // …and the money-back claim STAYS latched: the cron now owns exactly this
    // refund, and a latched slot is what stops a later manual cancel from
    // racing it into a double refund.
    expect(writes.filter((w) => w.claim)).toHaveLength(1);
    expect(writes.some((w) => (w.values as Record<string, unknown>)?.money_back_used === false)).toBe(
      false,
    );
  });
});
