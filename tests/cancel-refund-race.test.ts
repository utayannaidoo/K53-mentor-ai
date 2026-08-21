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
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
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
 * succeeds exactly once, like Postgres would.
 */
function makeAdminSharedState() {
  const writes: Record<string, unknown>[] = [];
  let moneyBackUsed = false;
  return {
    writes,
    client: {
      from(table: string) {
        void table;
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
    expect(refundTransaction).toHaveBeenCalledWith("ref_first_charge");

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

  it("a failed refund releases the claim so a retry inside the window stays possible", async () => {
    const { client, writes } = makeAdminSharedState();
    vi.mocked(createClient).mockResolvedValue(makeServerClient() as never);
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    vi.mocked(refundTransaction).mockRejectedValue(new Error("paystack 502"));

    const res = await send();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { refunded?: boolean; refundError?: boolean; endsNow?: boolean };

    expect(body.refunded).toBe(false);
    expect(body.refundError).toBe(true);
    expect(body.endsNow).toBe(false);
    // Claim released: the learner keeps access AND can retry the refund later.
    expect(writes.some((w) => (w.values as Record<string, unknown>)?.money_back_used === false)).toBe(true);
  });
});
