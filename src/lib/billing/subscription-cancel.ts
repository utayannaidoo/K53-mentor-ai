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
 * POLICY CONTRACT — the 7-day money-back guarantee, stated once and pinned by
 * tests/money-back-anchor.test.ts. Change code, tests and /refunds copy
 * together or not at all.
 *
 *  - ANCHOR: `paidAt` is the date of the learner's MOST RECENT PLAN payment.
 *    Every successful plan charge re-anchors it — the grant upsert at checkout
 *    (first payment, resubscribe, plan/cycle change) and the ownerless renewal
 *    branch of applyChargeSuccess (auto-renewals). Renewing therefore restarts
 *    the window; that generosity is published policy (/refunds §2), not a bug.
 *
 *  - REFUND TARGET: `lastChargeReference` is the reference of that SAME most
 *    recent charge. Both columns are written together by both paths, so an
 *    automatic money-back cancellation always refunds exactly the payment the
 *    window is measured from — never an older one.
 *
 *  - ONE REDEMPTION PER SUBSCRIPTION LIFETIME: `moneyBackUsed` latches true on
 *    the atomic claim before any refund is issued, and is released only when
 *    the refund itself failed so a retry stays possible. No later event —
 *    renewal, resubscribe, top-up — ever resets it; eligibility is NOT re-armed.
 *
 *  - TOP-UPS EXCLUDED: tutor credit purchases are not plan payments. Their
 *    charges carry no plan code and their grant path returns before any
 *    subscriptions write, so buying credits can neither restart the window nor
 *    re-point the refundable charge.
 *
 * These fields are written only by trusted server code (subscriptions is
 * SELECT-only under RLS), so they're safe to trust. A row missing any leg of
 * this contract (no reference, no anchor date, free tier) fails closed below.
 */
export type RefundBlockReason =
  | "not_paid"
  | "money_back_used"
  | "no_payment_record"
  | "outside_window";

/**
 * The same rule as `refundEligible` with its reason attached. The cancel route
 * and billing status API report it so that a refund which silently doesn't
 * happen — the merchant staring at Paystack's empty refunds list — can be
 * traced to its exact gate instead of guessed at.
 */
export function refundBlockedReason(ctx: RefundContext): RefundBlockReason | null {
  if (ctx.tier == null || ctx.tier === "free") return "not_paid";
  if (ctx.moneyBackUsed) return "money_back_used";
  if (!ctx.lastChargeReference || !ctx.paidAt) return "no_payment_record";
  const paidAtMs = Date.parse(ctx.paidAt);
  if (!Number.isFinite(paidAtMs) || Date.now() - paidAtMs > MONEY_BACK_DAYS * 86_400_000) {
    return "outside_window";
  }
  return null;
}

export function refundEligible(ctx: RefundContext): boolean {
  return refundBlockedReason(ctx) === null;
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
