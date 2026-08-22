import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChargeSuccessData } from "@/lib/paystack/apply";

/**
 * MONEY-BACK ANCHOR — the policy contract pinned here (documented atop
 * `refundEligible` in src/lib/billing/subscription-cancel.ts, published on
 * /refunds §2):
 *
 *   a. The anchor `paid_at` is the MOST RECENT PLAN payment. A renewal charge
 *      re-points it, so the 7-day window legitimately restarts — the
 *      documented generous policy. `last_charge_reference` moves in the SAME
 *      write, so the automatic refund always targets exactly that charge.
 *   b. A tutor TOP-UP is not a plan payment: buying credits must never move
 *      `paid_at` nor `last_charge_reference` — no window extension, no
 *      re-pointing of the refundable charge.
 *   c. `money_back_used` latches once ever; nothing in the charge path
 *      re-arms eligibility afterwards.
 *   d. Eligibility requires `last_charge_reference` REGARDLESS of dates —
 *      a window check without a refund target must fail closed.
 *   e. Legacy rows (paid_at present, newer columns NULL) behave exactly as
 *      today: matching stays customer-code based, eligibility needs only the
 *      four contract fields.
 *
 * Every entry path (webhook, callback verify, reconciliation cron) funnels
 * through `applyChargeSuccess`, so pinning it here covers them all.
 */

vi.mock("@/lib/paystack/client", () => ({
  fetchCustomer: vi.fn(),
  disableSubscription: vi.fn(),
}));
vi.mock("@/lib/notify/email", () => ({
  isEmailConfigured: false,
  sendEmail: vi.fn(),
}));

import { applyChargeSuccess } from "@/lib/paystack/apply";
import { fetchCustomer } from "@/lib/paystack/client";
import { refundEligible } from "@/lib/billing/subscription-cancel";

interface UpdateCall {
  table: string;
  values: Record<string, unknown>;
  /** Filters in application order; `.neq` columns are prefixed "!". */
  filters: Array<[string, unknown]>;
}

/**
 * Admin double recording every subscriptions write. The update chain must
 * support `.eq().neq()` because the renewal branch filters non-free tiers.
 */
function fakeAdmin() {
  const updates: UpdateCall[] = [];
  const upserts: Record<string, unknown>[] = [];
  const rpcs: Array<{ fn: string; args: Record<string, unknown> }> = [];

  const admin = {
    from(table: string) {
      return {
        upsert(values: Record<string, unknown>) {
          upserts.push(values);
          return Promise.resolve({ error: null });
        },
        update(values: Record<string, unknown>) {
          const call: UpdateCall = { table, values, filters: [] };
          type Filter = (col: string, val: unknown) => typeof chain;
          const chain: { eq: Filter; neq: Filter } = {
            eq(col, val) {
              call.filters.push([col, val]);
              return chain;
            },
            neq(col, val) {
              call.filters.push([`!${col}`, val]);
              return chain;
            },
          };
          updates.push(call);
          return chain;
        },
      };
    },
    rpc(fn: string, args: Record<string, unknown>) {
      rpcs.push({ fn, args });
      return Promise.resolve({ error: null });
    },
  } as unknown as SupabaseClient;

  return { admin, updates, upserts, rpcs };
}

/** An OWNERLESS charge — how Paystack delivers auto-renewals (no checkout metadata). */
const renewal = (id: number, reference: string): ChargeSuccessData => ({
  id,
  reference,
  amount: 6000,
  customer: { customer_code: "CUS_anchor", email: "learner@example.com", first_name: "" },
  metadata: null,
  plan: { plan_code: "PLN_premium_monthly" },
});

const checkoutGrant = (reference: string, overrides: Partial<ChargeSuccessData> = {}): ChargeSuccessData => ({
  id: 7000,
  reference,
  amount: 6000,
  customer: { customer_code: "CUS_anchor", email: "learner@example.com", first_name: "" },
  metadata: { kind: "subscription", plan: "premium", cycle: "monthly", user_id: "user-anchor" },
  plan: { plan_code: "PLN_premium_monthly" },
  ...overrides,
});

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

beforeEach(() => {
  vi.mocked(fetchCustomer).mockReset().mockResolvedValue({
    customer_code: "CUS_anchor",
    email: "learner@example.com",
    subscriptions: [
      {
        subscription_code: "SUB_current",
        email_token: "tok_SUB_current",
        status: "active",
        plan: { plan_code: "PLN_premium_monthly" },
        next_payment_date: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      },
    ],
  } as never);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("(a) a RENEWAL charge re-anchors the money-back window", () => {
  it("writes paid_at AND last_charge_reference in one update, scoped to live paid rows", async () => {
    const { admin, updates, upserts } = fakeAdmin();
    await applyChargeSuccess(admin, renewal(9001, "ref_renew_aug"));

    // Renewals are handled by the ownerless branch — never the checkout upsert.
    expect(upserts).toHaveLength(0);
    expect(updates).toHaveLength(1);

    // Both anchor columns move TOGETHER, or the contract splits apart.
    expect(updates[0].values).toMatchObject({
      status: "active",
      cancel_at_period_end: false,
      last_charge_reference: "ref_renew_aug",
    });
    const paidAt = new Date(updates[0].values.paid_at as string);
    expect(Number.isFinite(paidAt.getTime())).toBe(true);
    expect(Date.now() - paidAt.getTime()).toBeLessThan(60_000); // anchored to NOW

    // Scope unchanged: the customer's live, non-free row(s) only — which is
    // also what keeps pre-0008 rows covered (they have no subscription id).
    expect(updates[0].filters).toContainEqual(["provider_customer_id", "CUS_anchor"]);
    expect(updates[0].filters).toContainEqual(["!tier", "free"]);
  });

  it("RESTARTS a window that the first payment had already closed", async () => {
    // Anchor as it sat before the renewal: 40 days stale → guarantee gone.
    const staleCtx = {
      tier: "premium",
      lastChargeReference: "ref_first_purchase",
      paidAt: daysAgo(40),
      moneyBackUsed: false,
    };
    expect(refundEligible(staleCtx)).toBe(false);

    // Renewal lands; the cancel route reads back exactly what was written.
    const { admin, updates } = fakeAdmin();
    await applyChargeSuccess(admin, renewal(9002, "ref_renew_today"));
    const refreshed = {
      tier: "premium",
      lastChargeReference: updates[0].values.last_charge_reference as string,
      paidAt: updates[0].values.paid_at as string,
      moneyBackUsed: false,
    };
    expect(refundEligible(refreshed)).toBe(true);
    // …and the refundable charge is the renewal itself, not the old one.
    expect(refreshed.lastChargeReference).toBe("ref_renew_today");
  });

  it("each later renewal advances the pair to the LATEST charge", async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-08-01T09:00:00Z"));
      const { admin, updates } = fakeAdmin();
      await applyChargeSuccess(admin, renewal(9101, "ref_renew_aug01"));
      const first = { ...updates[0].values };

      vi.setSystemTime(new Date("2026-08-29T09:00:00Z"));
      await applyChargeSuccess(admin, renewal(9102, "ref_renew_aug29"));

      // The anchor moved forward to the newest charge…
      expect(new Date(updates[1].values.paid_at as string).getTime()).toBeGreaterThan(
        new Date(first.paid_at as string).getTime(),
      );
      expect(updates[1].values.last_charge_reference).toBe("ref_renew_aug29");
      expect(updates[1].values.last_charge_reference).not.toBe(first.last_charge_reference);
    } finally {
      vi.useRealTimers();
    }
  });

  it("checkout grants (first buy, resubscribe, plan change) re-anchor too", async () => {
    const { admin, upserts } = fakeAdmin();
    await applyChargeSuccess(admin, checkoutGrant("ref_resubscribe"));

    expect(upserts).toHaveLength(1);
    expect(upserts[0]).toMatchObject({
      tier: "premium",
      last_charge_reference: "ref_resubscribe",
    });
    expect(new Date(upserts[0].paid_at as string).getTime()).toBeGreaterThan(
      Date.now() - 60_000,
    );
  });
});

describe("(b) a TUTOR TOP-UP never touches the anchor", () => {
  const topup = (id: number, reference: string): ChargeSuccessData => ({
    id,
    reference,
    amount: 4900,
    customer: { customer_code: "CUS_anchor", email: "learner@example.com", first_name: "" },
    metadata: { kind: "tutor_topup", credits: "100", user_id: "user-anchor" },
    plan: null, // one-off charge — no Paystack Plan attached
  });

  it("banks credits and stops before any subscriptions write", async () => {
    const { admin, updates, upserts, rpcs } = fakeAdmin();
    await applyChargeSuccess(admin, topup(9201, "ref_topup_1"));

    expect(rpcs).toEqual([
      { fn: "grant_tutor_credits", args: { p_user: "user-anchor", p_credits: 100 } },
    ]);
    expect(updates).toHaveLength(0);
    expect(upserts).toHaveLength(0);
    // Not even the best-effort reconciliation round-trip happens.
    expect(fetchCustomer).not.toHaveBeenCalled();
  });

  it("cannot reach the renewal branch even if metadata were lost", async () => {
    // Defence in depth: the ownerless branch requires a PLAN code, and a
    // top-up has none — so even an unattributed top-up charge is inert
    // against paid_at/last_charge_reference.
    const { admin, updates, upserts, rpcs } = fakeAdmin();
    await applyChargeSuccess(admin, { ...topup(9202, "ref_topup_2"), metadata: null });
    expect(updates).toHaveLength(0);
    expect(upserts).toHaveLength(0);
    expect(rpcs).toHaveLength(0);
  });

  it("a plan-less charge carrying our metadata isn't ours either", async () => {
    const { admin, updates, upserts } = fakeAdmin();
    await applyChargeSuccess(admin, checkoutGrant("ref_bogus", { plan: null }));
    expect(updates).toHaveLength(0);
    expect(upserts).toHaveLength(0);
  });
});

describe("(c) the money-back latch never re-arms", () => {
  it("eligibility stays dead after money_back_used, however fresh the anchor", async () => {
    expect(
      refundEligible({
        tier: "premium_plus",
        lastChargeReference: "ref_recent",
        paidAt: daysAgo(0.01), // ~15 minutes old
        moneyBackUsed: true,
      }),
    ).toBe(false);
  });

  it("neither the renewal branch nor the checkout grant resets the latch", async () => {
    const { admin, updates, upserts } = fakeAdmin();
    await applyChargeSuccess(admin, renewal(9301, "ref_renew_after_use"));
    await applyChargeSuccess(admin, checkoutGrant("ref_resubscribe_after_use"));

    // Unspecified columns survive an UPSERT (onConflict: user_id), and the
    // renewal UPDATE must not name the flag either — the latch can only be
    // claimed/released by the cancellation flow's atomic claim.
    expect(Object.keys(upserts[0])).not.toContain("money_back_used");
    expect(updates[0].values).not.toHaveProperty("money_back_used");
    // And the written state still reads as used-up through the gate.
    expect(
      refundEligible({
        tier: "premium",
        lastChargeReference: "ref_renew_after_use",
        paidAt: daysAgo(0),
        moneyBackUsed: true,
      }),
    ).toBe(false);
  });
});

describe("(d) eligibility requires a refund TARGET regardless of dates", () => {
  const base = {
    tier: "premium",
    paidAt: daysAgo(1),
    moneyBackUsed: false,
  };

  it("fails closed with no reference even inside a fresh window", () => {
    expect(refundEligible({ ...base, lastChargeReference: null })).toBe(false);
    expect(refundEligible({ ...base, lastChargeReference: "" })).toBe(false);
  });

  it("still requires the window even with a reference in hand", () => {
    expect(refundEligible({ ...base, lastChargeReference: "ref_old", paidAt: daysAgo(8) })).toBe(
      false,
    );
  });
});

describe("(e) legacy rows behave exactly as today", () => {
  it("eligibility needs ONLY the four contract fields", () => {
    // A pre-0013-era row carries paid_at + a reference and nothing else;
    // newer columns being NULL adds no condition and blocks nothing.
    const legacy = { tier: "premium", lastChargeReference: "ref_legacy", paidAt: daysAgo(2), moneyBackUsed: null };
    expect(refundEligible(legacy)).toBe(true);
    expect(refundEligible({ ...legacy, moneyBackUsed: true })).toBe(false);
    expect(refundEligible({ ...legacy, paidAt: daysAgo(30) })).toBe(false);
    expect(refundEligible({ ...legacy, tier: "free" })).toBe(false);
  });

  it("renewal matching stays customer-code based, so pre-0008 rows are covered", async () => {
    // No provider_subscription_id anywhere in play — the WHERE clause never
    // references one, which is precisely how legacy rows kept working.
    const { admin, updates } = fakeAdmin();
    await applyChargeSuccess(admin, renewal(9401, "ref_renew_legacy_row"));
    expect(updates[0].filters).toEqual([
      ["provider_customer_id", "CUS_anchor"],
      ["!tier", "free"],
    ]);
  });
});
