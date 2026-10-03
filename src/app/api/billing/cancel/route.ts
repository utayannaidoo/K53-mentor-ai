import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACCOUNT_DAILY_LIMIT, clientIp, limitCheckout, limitUserDaily } from "@/lib/ai/rate-limit";
import { disableActiveSubscriptions, refundBlockedReason } from "@/lib/billing/subscription-cancel";
import { processRefund, queuePendingRefund, type RefundStatus } from "@/lib/billing/refund-lifecycle";
import { flushBillingEmails, notifyRefundOperator } from "@/lib/billing/refund-notifications";
import { PLAN_MAP } from "@/lib/billing/plans";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildCancellationAlertEmail } from "@/lib/notify/templates";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const runtime = "nodejs";
// Room for one refund attempt: verify, refund history and the POST, each capped at 15s.
export const maxDuration = 120;

/**
 * Self-serve cancellation. Paystack has no Stripe-style hosted billing portal,
 * so this calls Paystack's disable-subscription API directly and disables
 * every active learner subscription on the customer.
 *
 * Which outcome applies is decided by money, not by preference:
 *
 *  - **Outside the 7-day money-back window** (or with the guarantee already
 *    used): no refund, so the paid period is still owed. Billing stops at
 *    Paystack and `cancel_at_period_end` is set; tier and status are left
 *    alone until `current_period_end` passes.
 *
 *  - **Inside it**: the one-time guarantee is claimed atomically and a full
 *    refund of the most recent charge goes through the refund lifecycle
 *    (refund-lifecycle.ts). Access continues until Paystack CONFIRMS the refund
 *    was processed (an accepted request is not money back), and then ends only
 *    if that charge is still the learner's latest payment. A refusal (an empty
 *    settlement balance is the usual one) leaves the refund queued for the
 *    daily cron; anything uncertain is parked for support.
 *
 * Support hears about every money-back request before Paystack is contacted,
 * through the durable billing outbox, so neither a mail outage nor a provider
 * outage can lose one.
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

  const { data: sub, error: readError } = await supabase
    .from("subscriptions")
    .select("tier, provider_customer_id, last_charge_reference, paid_at, money_back_used, current_period_end, created_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) return Response.json({ error: "Billing temporarily unavailable" }, { status: 503 });
  if (!sub?.provider_customer_id) return Response.json({ error: "no_billing_account" }, { status: 404 });

  // RLS only lets the client SELECT its own subscription row; every write below
  // (the claim, the period-end flag) needs the service-role client. Fail fast
  // rather than report a cancellation whose writes silently no-op'd.
  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Storage not configured" }, { status: 500 });

  // The exact money-back gate that closed, or null while it is open. Returned
  // to the client so a cancellation that skips its promised refund says why.
  const refundReason = refundBlockedReason({
    tier: sub.tier,
    lastChargeReference: sub.last_charge_reference,
    paidAt: sub.paid_at,
    moneyBackUsed: sub.money_back_used,
  });
  const reference = sub.last_charge_reference as string | null;
  const eligible = refundReason === null && reference !== null;
  // How long this subscription lasted, for the churn event the client fires.
  // From the row's creation, not `paid_at`: that is the most recent charge, so
  // on a renewed plan it would report days for someone who paid for months.
  const daysActive = sub.created_at
    ? Math.max(0, Math.floor((Date.now() - Date.parse(sub.created_at)) / 86_400_000))
    : null;

  try {
    if (eligible) {
      // Persisted before Paystack is contacted: a mail outage leaves it in the
      // outbox for the cron to send, and the cron's interrupted-claim sweep
      // starts from this notice.
      await notifyRefundOperator(admin, {
        reference,
        userId: user.id,
        userEmail: user.email,
        kind: "requested",
        detail:
          "The learner requested cancellation inside the money-back window. Refund completion will be confirmed separately.",
      });
      await flushBillingEmails(admin, 1, [`refund-${reference}-requested`]).catch((error) =>
        console.error("refund request notification pending", error),
      );
    }

    // EVERY active learner subscription, not just the first: a past plan
    // change can leave two live, and any one still running keeps charging.
    // "learner": an owner's driving-school plan on the same Paystack customer
    // is the other product and keeps running. A refund still owed survives an
    // empty list, because an earlier attempt may have stopped billing and then
    // failed before refunding.
    const disabled = await disableActiveSubscriptions(sub.provider_customer_id, "learner");
    if (disabled === 0 && !eligible) return Response.json({ error: "no_active_subscription" }, { status: 404 });

    // Keyed on the charge read above, so a newer purchase landing mid-request
    // is not marked as cancelled.
    const flag = admin.from("subscriptions").update({ cancel_at_period_end: true }).eq("user_id", user.id);
    const { error: flagError } = await (reference === null
      ? flag.is("last_charge_reference", null)
      : flag.eq("last_charge_reference", reference));
    if (flagError) throw new Error(`Could not record cancellation: ${flagError.message}`);

    let refundStatus: RefundStatus | null = null;
    if (eligible) {
      // Atomically CLAIM the one-time guarantee for exactly this charge. Two
      // taps of "Yes, cancel" (or a retry behind a slow network) both read
      // money_back_used=false; the conditional update lets exactly one win.
      const claimed = await admin
        .from("subscriptions")
        .update({ money_back_used: true })
        .eq("user_id", user.id)
        .eq("last_charge_reference", reference)
        .eq("money_back_used", false)
        .select("user_id");
      if (claimed.error) throw new Error(`Could not claim refund: ${claimed.error.message}`);

      if (claimed.data?.length) {
        const queued = await queuePendingRefund(admin, { userId: user.id, reference });
        if (!queued.ok) {
          // No durable row means no refund may be attempted. Release the claim
          // so the learner's retry inside the window stays possible.
          await admin
            .from("subscriptions")
            .update({ money_back_used: false })
            .eq("user_id", user.id)
            .eq("last_charge_reference", reference);
          throw new Error("Could not record the refund for processing");
        }
        refundStatus = await processRefund(admin, reference);
      } else {
        // Another request owns the claim and its refund. Report that one;
        // never issue another.
        const { data: existing, error } = await admin
          .from("pending_refunds")
          .select("status")
          .eq("transaction_reference", reference)
          .maybeSingle();
        if (error) throw new Error(error.message);
        refundStatus = existing?.status ?? "submitting";
      }
      // Everything this charge has queued: attention alerts carry a per-problem suffix.
      await flushBillingEmails(admin, 4, { prefix: `refund-${reference}-` }).catch((error) =>
        console.error("refund notification pending", error),
      );
    } else if (isEmailConfigured) {
      // Churn signal to support, best-effort: it must never turn a completed
      // cancellation into an error. Money-back requests report via the outbox.
      await sendEmail({
        to: SUPPORT_EMAIL,
        ...buildCancellationAlertEmail({
          userEmail: user.email ?? "(no email)",
          userId: user.id,
          plan: PLAN_MAP[sub.tier as keyof typeof PLAN_MAP]?.name ?? sub.tier,
          outcome: `No refund (${refundReason}); access continues until period end.`,
          daysActive,
          accessUntil: sub.current_period_end,
        }),
      }).catch(() => false);
    }

    const refunded = refundStatus === "refunded";
    const { data: current, error: currentError } = await admin
      .from("subscriptions")
      .select("tier,current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    if (currentError) throw new Error(`Could not read current access: ${currentError.message}`);
    return Response.json({
      ok: true,
      refunded,
      /** True only once the refund is confirmed and this charge's access has actually ended. */
      endsNow: refunded && current?.tier === "free",
      refundStatus,
      refundQueued: ["queued", "submitting", "processing"].includes(refundStatus ?? ""),
      refundError: refundStatus === "failed" || refundStatus === "needs_attention",
      /** Why no refund was attempted, when that is the case (money-back gates). */
      refundReason,
      daysActive,
      /** null when the period end was never recorded; the UI degrades to vaguer copy. */
      accessUntil: current?.current_period_end ?? sub.current_period_end,
    });
  } catch (error) {
    console.error("billing/cancel failed", error);
    if (eligible) {
      await notifyRefundOperator(admin, {
        reference,
        userId: user.id,
        userEmail: user.email,
        kind: "attention",
        detail: "Cancellation or refund could not complete. Inspect the account and Paystack before taking action.",
      }).catch((e) => console.error("refund alert could not be recorded", e));
      await flushBillingEmails(admin, 3, { prefix: `refund-${reference}-` }).catch((e) =>
        console.error("refund alert pending", e),
      );
    }
    return Response.json(
      {
        error:
          "Cancellation could not fully complete. Please refresh your billing status; support has been alerted where available.",
      },
      { status: 502 },
    );
  }
}
