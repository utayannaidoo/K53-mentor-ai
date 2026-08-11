import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { refundEligible, MONEY_BACK_DAYS } from "@/lib/billing/subscription-cancel";

export const runtime = "nodejs";

/**
 * What the billing page needs to describe a subscription truthfully: does it
 * renew, when does access run out, and would cancelling right now be refunded.
 *
 * A dedicated route rather than new fields on the study store, because this is
 * the only screen that asks and the store is client state persisted to
 * localStorage — renewal dates are server truth with a deadline attached, and
 * a stale cached copy telling someone their access ends on the wrong day is
 * worse than a fetch.
 *
 * Read-only. Nothing here is a permission check: the tier that actually gates
 * content is resolved server-side per request in entitlements.server.ts.
 */
export async function GET() {
  if (!isSupabaseConfigured) {
    return Response.json({ demo: true }, { status: 501 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("subscriptions")
    .select(
      "tier, status, cancel_at_period_end, current_period_end, paid_at, last_charge_reference, money_back_used",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const sub = data as {
    tier: string | null;
    status: string | null;
    cancel_at_period_end: boolean | null;
    current_period_end: string | null;
    paid_at: string | null;
    last_charge_reference: string | null;
    money_back_used: boolean | null;
  } | null;

  if (!sub || sub.tier === "free" || !sub.tier) {
    return Response.json({ tier: "free", hasBillingAccount: false });
  }

  const endsAt = sub.current_period_end ? Date.parse(sub.current_period_end) : NaN;
  const expired = Boolean(sub.cancel_at_period_end) && Number.isFinite(endsAt) && Date.now() >= endsAt;

  return Response.json({
    // Mirrors the expiry rule in entitlements.server.ts so the page cannot
    // claim a tier the API would refuse to serve.
    tier: expired ? "free" : sub.tier,
    status: sub.status,
    hasBillingAccount: true,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    currentPeriodEnd: sub.current_period_end,
    /** Cancelling now would reverse the first charge and end access immediately. */
    refundEligible: refundEligible({
      tier: sub.tier,
      lastChargeReference: sub.last_charge_reference,
      paidAt: sub.paid_at,
      moneyBackUsed: sub.money_back_used,
    }),
    moneyBackDays: MONEY_BACK_DAYS,
  });
}
