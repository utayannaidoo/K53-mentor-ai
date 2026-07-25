import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildPaymentReceiptEmail } from "@/lib/notify/templates";
import { PLAN_MAP } from "@/lib/billing/plans";
import { fetchCustomer, disableSubscription } from "@/lib/paystack/client";

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

/**
 * Apply a verified successful charge to a user's entitlements. Single source of
 * truth shared by the webhook and the callback verify route, so a payment grants
 * exactly the same thing however it's confirmed first. Callers must guard this
 * with the `payment_events` ledger so it runs at most once per charge.
 *
 * THROWS when a money-bearing write fails, so the caller can release its
 * ledger row and let Paystack's redelivery (or the buyer's retry) re-apply the
 * grant. Cosmetic follow-ups (profile track sync, subscription reconciliation,
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
  const track = meta.track === "car" || meta.track === "bike_heavy" ? meta.track : null;
  const { error: grantError } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      tier: plan,
      status: "active",
      provider: "paystack",
      provider_customer_id: data.customer.customer_code,
      // Server truth for which vehicle track the plan covers. The client can't
      // write this row (RLS, 0004), so it's the one value content gating can
      // trust — `profiles.vehicle_code` is client-owned and can drift. Only
      // overwrite when this charge actually carries a track, so a renewal
      // (which has no metadata) never clears it.
      ...(track ? { track } : {}),
      // Recorded so a 7-day money-back cancellation can refund this exact
      // charge automatically. Renewals don't carry our metadata, so they
      // never reach here — paid_at stays the first-payment date.
      last_charge_reference: data.reference,
      paid_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (grantError) throw new Error(`applyChargeSuccess: tier grant failed: ${grantError.message}`);

  // Keep the studied licence code in step with the paid track, so study content
  // follows the plan and survives an account refresh (which reloads the code
  // from the profile). Only change it when the track actually differs, so an
  // existing code within the same class (e.g. 14 within bike & heavy) is kept.
  if (track) {
    const { data: prof } = await admin
      .from("profiles")
      .select("vehicle_code")
      .eq("id", userId)
      .maybeSingle();
    const code = (prof as { vehicle_code?: string | null } | null)?.vehicle_code ?? null;
    const currentTrack = code === "A" || code === "14" ? "bike_heavy" : code === "8" ? "car" : null;
    if (currentTrack !== track) {
      await admin
        .from("profiles")
        .update({ vehicle_code: track === "car" ? "8" : "A" })
        .eq("id", userId);
    }
  }

  // A plan, cycle, or track change starts a NEW Paystack subscription while the
  // OLD one stays active — Paystack never auto-cancels the previous plan. Left
  // alone, the learner is billed for BOTH plans every renewal. So cancel every
  // *other* active subscription for this customer, keeping only the one matching
  // the plan just paid for. A no-op on a first purchase (only the new sub exists).
  //
  // This intentionally THROWS on failure instead of logging and moving on: a
  // swallowed disable is a permanent double-charge, and the ledger row is already
  // committed so Paystack's redelivery would otherwise skip it. Throwing releases
  // the ledger row (both callers do this) so the whole charge is retried until the
  // old subscription is actually gone. The tier grant and track sync above are
  // idempotent on retry, and the receipt email below runs only *after* this
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
