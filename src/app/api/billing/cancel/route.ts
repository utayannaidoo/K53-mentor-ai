import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACCOUNT_DAILY_LIMIT, clientIp, limitCheckout, limitUserDaily } from "@/lib/ai/rate-limit";
import { refundTransaction } from "@/lib/paystack/client";
import { disableActiveSubscriptions, refundBlockedReason } from "@/lib/billing/subscription-cancel";
import { queuePendingRefund } from "@/lib/billing/pending-refunds";
import { REFUND_PROCESSING_DAYS } from "@/lib/billing/plans";

export const runtime = "nodejs";

/**
 * Self-serve cancellation. Paystack has no Stripe-style hosted billing portal,
 * so this calls Paystack's disable-subscription API directly: fetch the
 * customer (which embeds their subscriptions, including the email_token only
 * Paystack's API can hand out) and disable every active one.
 *
 * Two outcomes, and which one applies is decided by money, not by preference:
 *
 *  - **Inside the 7-day money-back window**: the first charge is refunded and
 *    access ends immediately. The payment is being reversed, so keeping the
 *    tier would hand over a full refund *and* a free month.
 *
 *  - **Outside it**: no refund, so the paid period is still owed. Billing stops
 *    at Paystack and `cancel_at_period_end` is set, but tier and status are left
 *    alone until `current_period_end` passes. Revoking on the spot would take
 *    back a month someone has already paid for — which is what this route used
 *    to do, honestly signposted ("you'll drop to Free immediately") and still
 *    wrong.
 *
 * A third sub-outcome exists inside the window: when Paystack refuses the
 * instant refund (an empty settlement balance being the usual cause), the
 * charge is queued in `pending_refunds` and retried by cron until it clears —
 * the learner is told their refund is processing and roughly how long it
 * takes, and access continues until the queued refund actually lands (the
 * cron's revoke mirrors this route's).
 *
 * There is no separate "turn off auto-renew" endpoint because Paystack has no
 * such concept: disabling a subscription IS how you stop it renewing, and a
 * disabled subscription cannot be re-enabled. Resuming means a fresh checkout,
 * which is why the billing page offers Resume rather than a toggle.
 */
export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!isPaystackConfigured || !isSupabaseConfigured) {
    return Response.json({ error: "Billing not configured", demo: true }, { status: 501 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Per-account cap under the per-IP one, so a shared NAT can't stop somebody
  // else from cancelling their own subscription.
  const userRl = await limitUserDaily("cancel", user.id, ACCOUNT_DAILY_LIMIT.cancel);
  if (!userRl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: userRl.retryAfter },
      { status: 429, headers: { "Retry-After": String(userRl.retryAfter) } },
    );
  }

  const { data } = await supabase
    .from("subscriptions")
    .select(
      "tier, provider_customer_id, last_charge_reference, paid_at, money_back_used, current_period_end, created_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  const sub = data as {
    tier: string | null;
    provider_customer_id: string | null;
    last_charge_reference: string | null;
    paid_at: string | null;
    money_back_used: boolean | null;
    current_period_end: string | null;
    created_at: string | null;
  } | null;
  const customerCode = sub?.provider_customer_id;
  if (!customerCode) {
    return Response.json({ error: "no_billing_account" }, { status: 404 });
  }

  // Eligible for an automatic full refund? Within the money-back window of the
  // most recent charge, on a paid tier, guarantee not already used. When not,
  // `refundBlocked` names the exact gate — it is returned to the client and
  // logged, because a cancellation that quietly skips its promised refund is
  // indistinguishable from a broken one until somebody asks "why".
  const refundBlocked = refundBlockedReason({
    tier: sub?.tier ?? null,
    lastChargeReference: sub?.last_charge_reference ?? null,
    paidAt: sub?.paid_at ?? null,
    moneyBackUsed: sub?.money_back_used ?? null,
  });
  const eligible = refundBlocked === null;

  const userId = user.id;

  // RLS only allows the client to SELECT its own subscription row — writing
  // (the claim, the revoke, the period-end flag) needs the service-role
  // client, same as the webhook uses. Fail fast when it is unavailable: every
  // write below is unconditional, and billing must not be reported stopped
  // (or refunded) on a request whose database writes silently no-op'd.
  const admin = createAdminClient();
  if (!admin) {
    console.error("billing/cancel: SUPABASE_SERVICE_ROLE_KEY not set; cannot apply cancellation");
    return Response.json({ error: "Storage not configured" }, { status: 500 });
  }

  /**
   * Atomically CLAIM the one-time money-back slot before any refund is issued.
   *
   * Reading `money_back_used` and writing it back later is a race: two taps of
   * "Yes, cancel" (or a retry behind a slow network) both read false, both pass
   * refundEligible, and both call Paystack's refund API for the same charge.
   * The claim flips the flag conditionally — `.eq("money_back_used", false)` —
   * so exactly one request wins; the loser sees zero updated rows and proceeds
   * down the no-refund path instead.
   */
  async function claimMoneyBack(): Promise<boolean> {
    if (!admin) return false;
    const claimed = await admin
      .from("subscriptions")
      .update({ money_back_used: true })
      .eq("user_id", userId)
      .eq("money_back_used", false)
      .select();
    return !claimed.error && Array.isArray(claimed.data) && claimed.data.length > 0;
  }

  /** Best-effort release when the refund itself failed, so a legitimate retry stays possible. */
  async function releaseMoneyBack(): Promise<void> {
    await admin
      ?.from("subscriptions")
      .update({ money_back_used: false })
      .eq("user_id", userId)
      .then(({ error }) => {
        if (error) console.error("billing/cancel: could not release money-back claim", error);
      });
  }

  /**
   * How long this subscription lasted, for the churn event the client fires.
   * Measured from the subscription row's creation, not `paid_at` — `paid_at`
   * is the most recent charge, so on a renewed plan it would report "3 days"
   * for someone who had been paying for four months, which is the opposite of
   * what a churn number is for. Null when the row predates the column being
   * populated, so the client can omit the property rather than send a zero
   * that would drag every average down.
   */
  const daysActive =
    sub?.created_at != null
      ? Math.max(0, Math.floor((Date.now() - new Date(sub.created_at).getTime()) / 86_400_000))
      : null;

  // A refund that is still owed survives an empty subscription list: the first
  // cancel attempt may have stopped billing at Paystack and then failed to
  // refund (claim released, tier untouched). The retry must be able to reach
  // the money — returning 404 here walled it off forever, with Paystack holding
  // no live subscription AND the app refusing to re-issue the refund.
  const refundTarget =
    eligible && sub?.last_charge_reference ? sub.last_charge_reference : null;
  try {
    // Disable EVERY active subscription, not just the first — a past plan change
    // can leave two live, and any one still running keeps charging the learner.
    const disabled = await disableActiveSubscriptions(customerCode);
    if (disabled === 0 && !refundTarget) {
      return Response.json({ error: "no_active_subscription" }, { status: 404 });
    }
  } catch (err) {
    console.error("billing/cancel: paystack error", err);
    return Response.json({ error: "Cancellation failed — please try again shortly." }, { status: 502 });
  }

  // Issue the money-back refund (best-effort). Billing is already stopped, so a
  // refund hiccup mustn't block the cancellation — we report it and the learner
  // can email us instead.
  //
  // The money-back slot is CLAIMED atomically before the API call: two racing
  // cancel requests cannot both refund one charge. On a failed refund the
  // claim is released — the learner keeps their money and their access, and a
  // retry inside the window stays possible.
  let refunded = false;
  let refundError = false;
  /** Paystack's own refusal, when the refund API rejected the charge. */
  let refundMessage: string | null = null;
  /**
   * True when the instant refund failed but the charge is now queued for
   * automatic retry — the learner is told their refund is processing, and the
   * cron owns completing it (revoke included). Mutually exclusive with
   * `refundError` in practice: a queued refund is not an error from the
   * learner's point of view.
   */
  let refundQueued = false;
  if (refundTarget) {
    if (await claimMoneyBack()) {
      try {
        await refundTransaction(refundTarget, {
          merchantNote: "K53 Mentor 7-day money-back cancellation",
          customerNote: "Full refund of your most recent K53 Mentor payment.",
        });
        refunded = true;
      } catch (err) {
        // Named loudly and WITH the reference: in live mode the usual refusal is
        // an account-level condition (insufficient balance after settlement
        // payouts being the classic), which no amount of same-request retrying
        // fixes — but it DOES resolve on its own once the next settlement
        // lands, so queue it rather than bouncing the learner to support.
        refundMessage = err instanceof Error ? err.message : String(err);
        console.error(
          `billing/cancel: refund of ${refundTarget} failed — Paystack said: ${refundMessage}`,
        );
        const queued = await queuePendingRefund(admin, {
          userId,
          reference: refundTarget,
          lastError: refundMessage,
        });
        if (queued.ok && queued.rowStatus === "queued") {
          // The claim STAYS latched: the cron now owns exactly this refund, and
          // a latched slot is what stops a later manual cancel from racing it.
          refundQueued = true;
        } else if (!queued.ok) {
          // Queue write failed too — fall back to releasing the claim so the
          // learner's manual retry inside the window remains possible.
          refundError = true;
          await releaseMoneyBack();
        } else {
          // Row exists in a terminal state ('refunded' — e.g. the webhook's
          // refund.processed landed first). Nothing owed; treat as done.
          refunded = queued.rowStatus === "refunded";
        }
      }
    }
  } else if (refundBlocked) {
    console.error(
      `billing/cancel: no refund attempted (${refundBlocked}) for user ${user.id}` +
        ` tier=${sub?.tier ?? "?"} paid_at=${sub?.paid_at ?? "null"}`,
    );
  }

  // ── Two different cancellations ─────────────────────────────────────────────
  //
  // Inside the money-back window the charge is being *reversed*, so access ends
  // with it — keeping the tier would mean a full refund and a free month.
  // `money_back_used` latches so the guarantee can't be claimed twice.
  //
  // Outside it, no money comes back, and revoking immediately would take a
  // month that has already been paid for. Someone cancelling on day 20 of a
  // billing month is owed the remaining ten days. Paystack billing has already
  // stopped above; all that is left is to stop it renewing on our side and let
  // the paid period run out.
  //
  // A refund that FAILED counts as outside the window: the learner still has
  // their money, so they keep the access it bought until the period ends.
  const endsNow = refunded;
  const periodEnd = sub?.current_period_end ?? null;

  if (endsNow) {
    // Admin is guaranteed non-null here (fail-fast above), so these writes are
    // unconditional — no optional-chaining that could silently no-op.
    await admin.from("subscriptions")
      .update({ tier: "free", status: "canceled", money_back_used: true, cancel_at_period_end: false })
      .eq("user_id", user.id);
    return Response.json({
      ok: true,
      refunded: true,
      refundError: false,
      refundQueued: false,
      endsNow: true,
      daysActive,
    });
  }

  // Tier and status deliberately unchanged — they are still a paying customer
  // until the period runs out, and `status` must stay one of the values
  // entitlements honours or access would be revoked on the spot.
  const { error: flagError } = await admin
    .from("subscriptions")
    .update({ cancel_at_period_end: true })
    .eq("user_id", user.id);
  if (flagError) {
    // Billing has stopped at Paystack, so nobody is being charged again — but
    // we could not record it, and the UI would keep claiming it renews. Say so
    // rather than reporting a clean cancellation.
    console.error("billing/cancel: could not flag cancel_at_period_end", flagError);
    return Response.json(
      { error: "Billing has been stopped, but we couldn't update your plan status. Please refresh." },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    refunded: false,
    refundError,
    /** True when the refund failed instantly but is queued for automatic retry. */
    refundQueued,
    /** Paystack's verbatim refusal when refundError is set (queue write also failed). */
    refundMessage,
    /** Why no refund was even attempted, when that is the case (money-back gates). */
    refundReason: refunded ? null : refundBlocked,
    /** The honest upper bound quoted to the learner for a queued refund. */
    refundProcessingDays: REFUND_PROCESSING_DAYS,
    endsNow: false,
    daysActive,
    /** null when the period end was never recorded — the UI degrades to vaguer copy. */
    accessUntil: periodEnd,
  });
}
