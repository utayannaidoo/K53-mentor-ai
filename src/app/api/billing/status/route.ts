import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundBlockedReason, MONEY_BACK_DAYS } from "@/lib/billing/subscription-cancel";
import {
  tierFromSubscriptionRow,
  type SubscriptionRowLike,
} from "@/lib/billing/entitlements.server";

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

  const sub = data as (SubscriptionRowLike & {
    paid_at: string | null;
    last_charge_reference: string | null;
    money_back_used: boolean | null;
  }) | null;

  if (!sub || sub.tier === "free" || !sub.tier) {
    return Response.json({ tier: "free", hasBillingAccount: false });
  }

  // Mirror the EXACT rule the gates use — tierFromSubscriptionRow includes the
  // unconditional expiry backstop (period end + grace) that a bare
  // cancel-flag check misses. Without this the page could call a subscription
  // active after every server gate had already started refusing it.
  const effectiveTier = tierFromSubscriptionRow(sub);

  /** Why cancelling now would NOT refund — null while it would. */
  const refundBlocked = refundBlockedReason({
    tier: sub.tier,
    lastChargeReference: sub.last_charge_reference,
    paidAt: sub.paid_at,
    moneyBackUsed: sub.money_back_used,
  });

  // A queued money-back refund (Paystack refused the instant one — usually an
  // empty settlement balance) is service-role data under RLS, so this needs
  // the admin client. Read-only, and it only surfaces a timestamp: enough for
  // the billing page to say "your refund is processing" durably, long after
  // the cancel-time banner has scrolled away.
  let refundProcessingSince: string | null = null;
  const admin = createAdminClient();
  if (admin) {
    const { data: queued } = await admin
      .from("pending_refunds")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (queued) {
      refundProcessingSince = (queued as { created_at: string }).created_at;
    }
  }

  return Response.json({
    tier: effectiveTier,
    status: sub.status,
    hasBillingAccount: true,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    currentPeriodEnd: sub.current_period_end,
    /** Cancelling now would reverse the most recent charge and end access immediately. */
    refundEligible: refundBlocked === null,
    /** When refundEligible is false, the exact money-back gate that closed. */
    refundIneligibleReason: refundBlocked,
    /** Non-null while a money-back refund is queued for automatic retry. */
    refundProcessingSince,
    moneyBackDays: MONEY_BACK_DAYS,
  });
}
