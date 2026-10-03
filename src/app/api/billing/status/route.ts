import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundBlockedReason, MONEY_BACK_DAYS } from "@/lib/billing/subscription-cancel";
import {
  tierFromSubscriptionRow,
  type SubscriptionRowLike,
} from "@/lib/billing/entitlements.server";

export const runtime = "nodejs";

/** How long a settled refund stays on the billing page. Owed refunds show until settled. */
const SETTLED_REFUND_NOTICE_MS = 30 * 86_400_000;

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

  // The learner's latest money-back refund, if any. Service-role data under RLS,
  // so it needs the admin client. Read in parallel with the subscription below,
  // and shown to free accounts too: the progress of a refund stays visible
  // after the paid access it reversed has ended.
  const admin = createAdminClient();
  const queuedPromise = admin
    ? admin
        .from("pending_refunds")
        .select("created_at,status,refunded_at,updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : null;

  const { data, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select(
      "tier, status, cancel_at_period_end, current_period_end, paid_at, last_charge_reference, money_back_used",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (subscriptionError) return Response.json({ error: "Billing status temporarily unavailable" }, { status: 503 });

  const sub = data as (SubscriptionRowLike & {
    paid_at: string | null;
    last_charge_reference: string | null;
    money_back_used: boolean | null;
  }) | null;

  const refundResult = queuedPromise ? await queuedPromise : null;
  if (refundResult?.error) return Response.json({ error: "Refund status temporarily unavailable" }, { status: 503 });
  const latest = refundResult?.data as {
    created_at: string;
    status: string;
    refunded_at: string | null;
    updated_at: string | null;
  } | null;
  // A settled refund is news for a while, not forever: it stops showing after
  // a month, or as soon as the learner has paid again. One that is still owed
  // (queued, processing, needs attention, stopped) shows until it settles.
  const settledAt =
    latest?.status === "refunded" ? Date.parse(latest.refunded_at ?? latest.updated_at ?? latest.created_at) : null;
  const settledNoticeOver =
    settledAt !== null &&
    (Date.now() - settledAt > SETTLED_REFUND_NOTICE_MS || (sub?.paid_at != null && Date.parse(sub.paid_at) > settledAt));
  const refund = settledNoticeOver ? null : latest;
  const refundFields = {
    refundStatus: refund?.status ?? null,
    refundProcessingSince: refund && ["queued", "submitting", "processing"].includes(refund.status) ? refund.created_at : null,
  };
  if (!sub || sub.tier === "free" || !sub.tier) {
    return Response.json({ tier: "free", hasBillingAccount: false, ...refundFields });
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
    ...refundFields,
    moneyBackDays: MONEY_BACK_DAYS,
  });
}
