import "server-only";
import { fetchCustomer, disableSubscription } from "@/lib/paystack/client";
import { MONEY_BACK_DAYS } from "@/lib/billing/plans";

// Re-exported so server callers keep importing it from here, but declared in
// plans.ts — the cancel dialog and pricing copy are client components and
// cannot import a `server-only` module to quote the same number.
export { MONEY_BACK_DAYS };

export interface RefundContext {
  tier: string | null;
  lastChargeReference: string | null;
  paidAt: string | null;
  moneyBackUsed: boolean | null;
}

/**
 * True when the first charge is still inside the money-back window and hasn't
 * already been refunded. These fields are written only by trusted server code
 * (subscriptions is SELECT-only under RLS), so they're safe to trust.
 */
export function refundEligible(ctx: RefundContext): boolean {
  const paidAtMs = ctx.paidAt ? Date.parse(ctx.paidAt) : NaN;
  const withinWindow =
    Number.isFinite(paidAtMs) && Date.now() - paidAtMs <= MONEY_BACK_DAYS * 86_400_000;
  return withinWindow && ctx.tier !== "free" && !ctx.moneyBackUsed && Boolean(ctx.lastChargeReference);
}

/**
 * Disable EVERY live Paystack subscription for a customer and return how many
 * were disabled. Shared by self-serve cancellation and account deletion so both
 * stop billing identically — a plan change can briefly leave two subscriptions
 * live, and leaving even one running keeps charging a card the user has left.
 *
 * "Live" means `active` OR `non-renewing`. Paystack's disable API doesn't
 * cancel outright — it flips the subscription to `non-renewing` (fires
 * `subscription.not_renew`, keeps it paid through the period) — so a learner
 * who cancels, thinks better of it, and re-subscribes now has a non-renewing
 * row beside the new one. Filtering on `active` alone made the second cancel
 * report "no active subscription found" and leave that old sub's state
 * ambiguous; disabling both is idempotent and always ends in the same place.
 *
 * THROWS if any disable fails: the caller must then treat billing as still live
 * and NOT proceed as if it stopped (in particular, must not delete the account),
 * so a retry can finish the job.
 */
export async function disableActiveSubscriptions(customerCode: string): Promise<number> {
  const customer = await fetchCustomer(customerCode);
  const live = customer.subscriptions.filter(
    (s) => s.status === "active" || s.status === "non-renewing",
  );
  for (const s of live) {
    await disableSubscription(s.subscription_code, s.email_token);
  }
  return live.length;
}
