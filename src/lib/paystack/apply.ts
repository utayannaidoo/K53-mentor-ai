import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildPaymentReceiptEmail } from "@/lib/notify/templates";
import { PLAN_MAP } from "@/lib/billing/plans";
import { fetchCustomer, disableSubscription, type PaystackTransaction } from "@/lib/paystack/client";

/**
 * The shape of a successful charge, as it arrives either on the `charge.success`
 * webhook or from `/transaction/verify`. Metadata is what we set ourselves at
 * `/transaction/initialize`, so it's the trusted link back to our user.
 */
export interface ChargeSuccessData {
  id: number;
  reference: string;
  /** Amount paid, in ZAR cents. */
  amount?: number;
  customer: { customer_code: string; email: string; first_name?: string | null };
  metadata?: Record<string, string> | null;
  plan?: { plan_code?: string } | null;
}

/** The `payment_events` id every path uses for a successful charge. */
export function chargeLedgerId(transactionId: number | string): string {
  return `charge.success:${transactionId}`;
}

/**
 * Coerce a transaction from the list endpoint into the shape the grant expects.
 *
 * Two quirks, both load-bearing. `metadata` comes back as a JSON *string*
 * rather than an object on some responses, and it carries the `user_id` that
 * ties a charge to an account — lose it and the grant silently treats a real
 * payment as a renewal with no owner. `plan` comes back as a bare code rather
 * than `{ plan_code }`, and without a plan code `applyChargeSuccess` decides
 * the charge "isn't one of ours" and returns having done nothing.
 *
 * Both failures are silent, which is why this is shared rather than inlined.
 */
export function normaliseTransaction(tx: PaystackTransaction): ChargeSuccessData {
  let metadata: Record<string, string> | null = null;
  if (typeof tx.metadata === "string") {
    try {
      const parsed = JSON.parse(tx.metadata) as unknown;
      if (parsed && typeof parsed === "object") metadata = parsed as Record<string, string>;
    } catch {
      metadata = null;
    }
  } else if (tx.metadata && typeof tx.metadata === "object") {
    metadata = tx.metadata;
  }

  const planCode = typeof tx.plan === "string" ? tx.plan : tx.plan?.plan_code;

  return {
    id: tx.id,
    reference: tx.reference,
    amount: tx.amount,
    customer: tx.customer,
    metadata,
    plan: planCode ? { plan_code: planCode } : null,
  };
}

export type ApplyOnceOutcome = "applied" | "already_applied" | "failed";

/**
 * `applyChargeSuccess` wrapped in the `payment_events` ledger dance: claim the
 * row, apply, and release the row again if applying threw so a later retry
 * isn't swallowed as a duplicate.
 *
 * Used by the reconciliation cron. The webhook and verify routes keep their own
 * inline copies of this sequence — not duplication for its own sake: each needs
 * to distinguish "ledger unreachable" from "apply failed" in its HTTP response,
 * and verify continues on to return the resulting tier. This wrapper exists so
 * the cron, which only needs applied/skipped/failed, cannot drift from the
 * idempotency rules those two encode.
 */
export async function applyChargeOnce(
  admin: SupabaseClient,
  data: ChargeSuccessData,
): Promise<ApplyOnceOutcome> {
  const ledgerId = chargeLedgerId(data.id);
  const { error: ledgerError } = await admin
    .from("payment_events")
    .insert({ id: ledgerId, type: "charge.success" });

  if (ledgerError?.code === "23505") return "already_applied";
  if (ledgerError) {
    console.error("applyChargeOnce: ledger insert failed", ledgerId, ledgerError.message);
    return "failed";
  }

  try {
    await applyChargeSuccess(admin, data);
    return "applied";
  } catch (err) {
    console.error("applyChargeOnce: apply failed, releasing ledger row", ledgerId, err);
    await admin
      .from("payment_events")
      .delete()
      .eq("id", ledgerId)
      .then(({ error }) => {
        if (error) console.error("applyChargeOnce: ledger release failed", ledgerId, error.message);
      });
    return "failed";
  }
}

/**
 * Apply a verified successful charge to a user's entitlements. Single source of
 * truth shared by the webhook and the callback verify route, so a payment grants
 * exactly the same thing however it's confirmed first. Callers must guard this
 * with the `payment_events` ledger so it runs at most once per charge.
 *
 * THROWS when a money-bearing write fails, so the caller can release its
 * ledger row and let Paystack's redelivery (or the buyer's retry) re-apply the
 * grant. Cosmetic follow-ups (subscription reconciliation and the
 * receipt email) stay best-effort — a hiccup there must not un-grant a paid
 * tier or trigger a retry loop.
 */
export async function applyChargeSuccess(
  admin: SupabaseClient,
  data: ChargeSuccessData,
): Promise<void> {
  const meta = data.metadata ?? {};
  const userId = meta.user_id;
  if (!userId) {
    // Renewal charges don't carry our checkout metadata. A successful plan
    // charge for a known customer clears any past_due grace state.
    if (data.plan?.plan_code && data.customer?.customer_code) {
      const { error } = await admin
        .from("subscriptions")
        .update({ status: "active" })
        .eq("provider_customer_id", data.customer.customer_code)
        .neq("tier", "free");
      if (error) throw new Error(`applyChargeSuccess: renewal status update failed: ${error.message}`);
    }
    return;
  }

  // One-off tutor top-up: bank the credits and stop.
  if (meta.kind === "tutor_topup") {
    const credits = Math.min(500, Math.max(0, Number(meta.credits) || 0));
    if (credits > 0) {
      const { error } = await admin.rpc("grant_tutor_credits", { p_user: userId, p_credits: credits });
      if (error) throw new Error(`applyChargeSuccess: credit grant failed: ${error.message}`);
    }
    return;
  }

  // Subscription's first (or renewal) charge: grant/confirm the tier.
  // A plan-less charge with kind !== tutor_topup isn't one of ours.
  const plan = meta.plan;
  if ((plan !== "premium" && plan !== "premium_plus") || !data.plan?.plan_code) return;
  const { error: grantError } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      tier: plan,
      status: "active",
      provider: "paystack",
      provider_customer_id: data.customer.customer_code,
      // Recorded so a 7-day money-back cancellation can refund this exact
      // charge automatically. Renewals don't carry our metadata, so they
      // never reach here — paid_at stays the first-payment date.
      last_charge_reference: data.reference,
      paid_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (grantError) throw new Error(`applyChargeSuccess: tier grant failed: ${grantError.message}`);

  // NOTE: `profiles.vehicle_code` is deliberately NOT touched here. One plan
  // covers every licence code, so paying changes what the learner can do, never
  // what they are studying. This used to rewrite the code to match the paid
  // track, which silently moved a learner onto a different vehicle's content
  // the moment a charge landed.

  // A plan or cycle change starts a NEW Paystack subscription while the
  // OLD one stays active — Paystack never auto-cancels the previous plan. Left
  // alone, the learner is billed for BOTH plans every renewal. So cancel every
  // *other* active subscription for this customer, keeping only the one matching
  // the plan just paid for. A no-op on a first purchase (only the new sub exists).
  //
  // This intentionally THROWS on failure instead of logging and moving on: a
  // swallowed disable is a permanent double-charge, and the ledger row is already
  // committed so Paystack's redelivery would otherwise skip it. Throwing releases
  // the ledger row (both callers do this) so the whole charge is retried until the
  // old subscription is actually gone. The tier grant above is idempotent on
  // retry, and the receipt email below runs only *after* this
  // succeeds — so a retry re-grants harmlessly and never double-sends the receipt.
  const customer = await fetchCustomer(data.customer.customer_code);
  const stale = customer.subscriptions.filter(
    (s) => s.status === "active" && s.plan.plan_code !== data.plan!.plan_code,
  );
  for (const s of stale) {
    await disableSubscription(s.subscription_code, s.email_token);
  }

  // Receipt + welcome (best-effort; the ledger already made this once-only).
  if (isEmailConfigured && data.customer.email) {
    const receipt = buildPaymentReceiptEmail({
      firstName: data.customer.first_name ?? "",
      planName: PLAN_MAP[plan].name,
      amountZar: (data.amount ?? 0) / 100,
    });
    await sendEmail({ to: data.customer.email, ...receipt }).catch(() => {});
  }
}
