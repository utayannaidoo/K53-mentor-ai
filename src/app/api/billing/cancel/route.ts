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
export const maxDuration = 120;

export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) return Response.json({ error: "rate_limited", retryAfter: rl.retryAfter }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  if (!isPaystackConfigured || !isSupabaseConfigured) return Response.json({ error: "Billing not configured", demo: true }, { status: 501 });
  const supabase = await createClient();
  const { data: { user } } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userRl = await limitUserDaily("cancel", user.id, ACCOUNT_DAILY_LIMIT.cancel);
  if (!userRl.success) return Response.json({ error: "rate_limited", retryAfter: userRl.retryAfter }, { status: 429, headers: { "Retry-After": String(userRl.retryAfter) } });
  const { data: sub, error: readError } = await supabase.from("subscriptions")
    .select("tier,provider_customer_id,last_charge_reference,paid_at,money_back_used,current_period_end,created_at")
    .eq("user_id", user.id).maybeSingle();
  if (readError) return Response.json({ error: "Billing temporarily unavailable" }, { status: 503 });
  if (!sub?.provider_customer_id) return Response.json({ error: "no_billing_account" }, { status: 404 });
  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Storage not configured" }, { status: 500 });
  const refundReason = refundBlockedReason({ tier: sub.tier, lastChargeReference: sub.last_charge_reference, paidAt: sub.paid_at, moneyBackUsed: sub.money_back_used });
  const reference = sub.last_charge_reference as string | null;
  const eligible = refundReason === null && reference !== null;
  const daysActive = sub.created_at ? Math.max(0, Math.floor((Date.now() - Date.parse(sub.created_at)) / 86400000)) : null;

  try {
    // Record intent before contacting Paystack. Failed email delivery stays in the outbox.
    if (eligible) {
      await notifyRefundOperator(admin, { reference, userId: user.id, userEmail: user.email, kind: "requested", detail: "The learner requested cancellation inside the money-back window. Refund completion will be confirmed separately." });
      await flushBillingEmails(admin, 1, [`refund-${reference}-requested`]).catch((error) => console.error("refund request notification pending", error));
    }
    const disabled = await disableActiveSubscriptions(sub.provider_customer_id, "learner");
    if (disabled === 0 && !eligible) return Response.json({ error: "no_active_subscription" }, { status: 404 });
    // Compare the captured payment: a simultaneous newer purchase must survive.
    const flag = admin.from("subscriptions").update({ cancel_at_period_end: true }).eq("user_id", user.id);
    const { error: flagError } = await (reference === null ? flag.is("last_charge_reference", null) : flag.eq("last_charge_reference", reference));
    if (flagError) throw new Error(`Could not record cancellation: ${flagError.message}`);

    let refundStatus: RefundStatus | null = null;
    if (eligible) {
      const claimed = await admin.from("subscriptions").update({ money_back_used: true })
        .eq("user_id", user.id).eq("last_charge_reference", reference).eq("money_back_used", false).select("user_id");
      if (claimed.error) throw new Error(`Could not claim refund: ${claimed.error.message}`);
      if (claimed.data?.length) {
        const queued = await queuePendingRefund(admin, { userId: user.id, reference });
        if (!queued.ok) {
          await admin.from("subscriptions").update({ money_back_used: false }).eq("user_id", user.id).eq("last_charge_reference", reference);
          throw new Error("Could not record the refund for processing");
        }
        refundStatus = await processRefund(admin, reference);
      } else {
        // Another request owns the claim. Never issue an additional refund.
        const { data: existing, error } = await admin.from("pending_refunds").select("status").eq("transaction_reference", reference).maybeSingle();
        if (error) throw new Error(error.message);
        refundStatus = existing?.status ?? "submitting";
      }
      // Everything this charge has queued: attention alerts carry a per-problem suffix.
      await flushBillingEmails(admin, 4, { prefix: `refund-${reference}-` }).catch((error) => console.error("refund notification pending", error));
    } else if (isEmailConfigured) {
      await sendEmail({ to: SUPPORT_EMAIL, ...buildCancellationAlertEmail({
        userEmail: user.email ?? "(no email)", userId: user.id,
        plan: PLAN_MAP[sub.tier as keyof typeof PLAN_MAP]?.name ?? sub.tier,
        outcome: `No refund (${refundReason}); access continues until period end.`, daysActive,
        accessUntil: sub.current_period_end,
      }) });
    }
    const refunded = refundStatus === "refunded";
    const { data: current, error: currentError } = await admin.from("subscriptions").select("tier,current_period_end").eq("user_id", user.id).maybeSingle();
    if (currentError) throw new Error(`Could not read current access: ${currentError.message}`);
    return Response.json({ ok: true, refunded, endsNow: refunded && current?.tier === "free",
      refundStatus, refundQueued: ["queued", "submitting", "processing"].includes(refundStatus ?? ""),
      refundError: refundStatus === "failed" || refundStatus === "needs_attention",
      refundReason, daysActive, accessUntil: current?.current_period_end ?? sub.current_period_end });
  } catch (error) {
    console.error("billing/cancel failed", error);
    if (eligible) {
      await notifyRefundOperator(admin, { reference, userId: user.id, userEmail: user.email, kind: "attention", detail: "Cancellation or refund could not complete. Inspect the account and Paystack before taking action." }).catch((e) => console.error("refund alert could not be recorded", e));
      await flushBillingEmails(admin, 3, { prefix: `refund-${reference}-` }).catch((e) => console.error("refund alert pending", e));
    }
    return Response.json({ error: "Cancellation could not fully complete. Please refresh your billing status; support has been alerted where available." }, { status: 502 });
  }
}
