import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildPaymentReceiptEmail, buildPriceMismatchAlertEmail } from "@/lib/notify/templates";
import { PLAN_MAP } from "@/lib/billing/plans";
import { checkChargeAmount } from "@/lib/billing/charge-amount";
import { SUPPORT_EMAIL } from "@/lib/constants";
import {
  fetchCustomer,
  disableSubscription,
  type PaystackSubscription,
  type PaystackTransaction,
} from "@/lib/paystack/client";

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
  /** Settlement currency. Read only to notice when it is not ZAR. */
  currency?: string;
  customer: { customer_code: string; email: string; first_name?: string | null };
  metadata?: Record<string, string> | null;
  plan?: { plan_code?: string } | null;
}

/** The `payment_events` id every path uses for a successful charge. */
export function chargeLedgerId(transactionId: number | string): string {
  return `charge.success:${transactionId}`;
}

/**
 * Read a subscription's plan code out of whatever shape Paystack decided to
 * send today. The verify endpoint returns `plan` as a bare string; the
 * transaction list has been observed returning `plan: {}`; the customer embed
 * is believed to do the same under eventual consistency right after creation.
 * Anything without a non-empty code is UNKNOWN — callers must treat unknown
 * plans as untouchable, never as "different from mine".
 */
export function subscriptionPlanCode(
  s: Pick<PaystackSubscription, "plan">,
): string | undefined {
  const plan = s.plan;
  if (!plan) return undefined;
  const code = typeof plan === "string" ? plan : plan.plan_code;
  return typeof code === "string" && code.length > 0 ? code : undefined;
}

/** Find the ACTIVE subscription matching the plan just paid for. */
function findCurrentSubscription(
  customer: Awaited<ReturnType<typeof fetchCustomer>>,
  planCode: string,
): PaystackSubscription | undefined {
  return customer.subscriptions.find(
    (s) => s.status === "active" && subscriptionPlanCode(s) === planCode,
  );
}

/**
 * WHY a same-plan duplicate guard exists beside the superseded-plan guard:
 * cancel→re-subscribe edge cases can leave TWO active subscriptions on the
 * SAME plan code for one customer. The superseded guard below only disables
 * subscriptions whose plan code DIFFERS from the one just paid for, so
 * same-plan duplicates sail past it — and every renewal then charges the
 * learner twice for one tier, forever. After a successful grant we collapse
 * them to a single survivor.
 *
 * Survivor rule: latest period wins, where the only period marker the
 * PaystackSubscription type offers is `next_payment_date` (Paystack nulls it
 * once a sub stops renewing). If the dates are missing/unparseable/equal, the
 * subscription whose CODE sorts last wins, so repeated webhooks converge on
 * the same survivor instead of flapping between two live subs.
 */
function isLaterSubscription(a: PaystackSubscription, b: PaystackSubscription): boolean {
  const endMs = (s: PaystackSubscription): number => {
    if (!s.next_payment_date) return Number.NEGATIVE_INFINITY;
    const parsed = Date.parse(s.next_payment_date);
    return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
  };
  const [aEnd, bEnd] = [endMs(a), endMs(b)];
  if (aEnd !== bEnd) return aEnd > bEnd;
  // Deterministic tie-break: same dates (or both unknown) → higher code.
  return a.subscription_code > b.subscription_code;
}

/**
 * Split the ACTIVE subscriptions matching `planCode` into one survivor and
 * zero or more same-plan duplicates. With fewer than two candidates this is
 * exactly `findCurrentSubscription` semantics (first match), so behaviour is
 * unchanged unless a real duplicate exists.
 */
function partitionSamePlanDuplicates(
  subscriptions: PaystackSubscription[],
  planCode: string,
): { survivor?: PaystackSubscription; duplicates: PaystackSubscription[] } {
  const candidates = subscriptions.filter(
    (s) => s.status === "active" && subscriptionPlanCode(s) === planCode,
  );
  if (candidates.length < 2) return { survivor: candidates[0], duplicates: [] };
  const survivor = candidates.reduce((kept, s) =>
    kept === undefined || isLaterSubscription(s, kept) ? s : kept,
  );
  return {
    survivor,
    duplicates: candidates.filter((c) => c.subscription_code !== survivor.subscription_code),
  };
}

/**
 * Disable same-plan duplicates, keeping only `keepCode`. BEST-EFFORT by
 * contract: the tier grant has already succeeded and the ledger row is
 * committed, so any failure here must be logged loudly (customer code, plan
 * code, kept vs disabled codes) and swallowed — throwing would release the
 * ledger row, Paystack would redeliver an already-applied charge, and the
 * duplicate would STILL be billing while the retry loop span forever.
 */
async function pruneDuplicateSamePlanSubscriptions(input: {
  customerCode: string;
  paidPlanCode: string;
  keepCode?: string;
  duplicates: PaystackSubscription[];
}): Promise<void> {
  const { customerCode, paidPlanCode, keepCode, duplicates } = input;
  for (const dup of duplicates) {
    try {
      await disableSubscription(dup.subscription_code, dup.email_token);
      console.error(
        `applyChargeSuccess: disabled DUPLICATE subscription ${dup.subscription_code} ` +
          `(same plan ${paidPlanCode}, customer ${customerCode}); kept ${keepCode ?? "unknown"}`,
      );
    } catch (err) {
      console.error(
        `applyChargeSuccess: FAILED to disable duplicate subscription ${dup.subscription_code} ` +
          `(same plan ${paidPlanCode}, customer ${customerCode}); kept ${keepCode ?? "unknown"}; ` +
          `the older subscription may keep charging — investigate.`,
        err,
      );
    }
  }
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
    currency: tx.currency,
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
      //
      // IDENTITY — no subscription-code guard possible here: a transaction
      // payload names no subscription at all (webhook and verify shapes
      // alike — see the ChargeSuccessData note near partitionSamePlanDuplicates
      // below), so there is nothing comparable against the row's stored
      // provider_subscription_id. The write stays scoped the way pre-0008
      // rows were always handled: customer code, non-free tiers only. The
      // plan code disambiguates only the period-end lookup above; it cannot
      // strengthen this WHERE clause.
      if (data.plan?.plan_code && data.customer?.customer_code) {
      // Roll the period forward too. Without this the stored end date stays at
      // the *first* month's, and the billing page would tell a paying
      // subscriber their access ran out weeks ago. Best-effort: a Paystack
      // hiccup must not fail a renewal that has already been paid, so the
      // status update below still runs with whatever we managed to learn.
      let period: { current_period_end: string } | Record<string, never> = {};
      try {
        const customer = await fetchCustomer(data.customer.customer_code);
        const sub = findCurrentSubscription(customer, data.plan!.plan_code);
        if (sub?.next_payment_date) {
          period = { current_period_end: new Date(sub.next_payment_date).toISOString() };
        }
      } catch (err) {
        console.error("applyChargeSuccess: renewal period lookup failed", err);
      }

      // MONEY-BACK ANCHOR (policy contract documented atop refundEligible in
      // subscription-cancel.ts, pinned by tests/money-back-anchor.test.ts):
      // `paid_at` is the MOST RECENT PLAN payment and `last_charge_reference`
      // must point at that same charge, because an automatic money-back
      // cancellation refunds exactly what the anchor names. A renewal IS a
      // plan payment, so it re-points both here — restarting the window is
      // the published, generous policy (/refunds §2), not an accident. Both
      // columns move together or not at all; a tutor top-up can never reach
      // this branch (no plan code, and its metadata routes away above), so
      // buying credits can neither extend the window nor move its target.
      const { error } = await admin
        .from("subscriptions")
        .update({
          status: "active",
          cancel_at_period_end: false,
          paid_at: new Date().toISOString(),
          last_charge_reference: data.reference,
          ...period,
        })
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

  // Did Paystack charge what the site advertises? Checkout sends an amount AND
  // a Plan code, and Paystack bills the *Plan's* dashboard amount — so the two
  // can silently disagree and nothing outside that dashboard would notice.
  //
  // The grant continues either way, deliberately. See charge-amount.ts: the
  // realistic cause is a wrong number in the Paystack dashboard, and the person
  // who would pay for refusing is a customer who has already paid us.
  const amountCheck = checkChargeAmount({
    plan,
    cycle: meta.cycle,
    actualCents: data.amount,
    currency: data.currency,
  });
  if (amountCheck.problem) {
    console.error(
      `PRICE MISMATCH on charge ${data.reference}: ${amountCheck.problem} ` +
        `Tier was granted anyway — the buyer paid in good faith.`,
    );
    if (isEmailConfigured) {
      const alert = buildPriceMismatchAlertEmail({
        reference: data.reference,
        plan: PLAN_MAP[plan].name,
        cycle: meta.cycle ?? "unrecorded",
        problem: amountCheck.problem,
        expectedCents: amountCheck.expectedCents,
        actualCents: amountCheck.actualCents,
        buyerEmail: data.customer.email,
      });
      await sendEmail({ to: SUPPORT_EMAIL, ...alert }).catch(() => {});
    }
  }

  const { error: grantError } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      tier: plan,
      status: "active",
      provider: "paystack",
      provider_customer_id: data.customer.customer_code,
      // Recorded so a 7-day money-back cancellation can refund this exact
      // charge automatically. Checkout charges land here on first purchase,
      // on a cancel→resubscribe, and on a plan/cycle change; plain renewals
      // don't carry our metadata and re-anchor these same two columns via the
      // ownerless renewal branch above. Top-up charges return earlier still
      // and never touch either column (pinned by money-back-anchor tests).
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

  // One live customer fetch drives all post-grant reconciliation: recording
  // this row's identity from the newly-paid subscription, disabling every
  // other PLAN's active subscription, and collapsing same-plan duplicates.
  // Guarded on purpose: the grant has already landed and the ledger row is
  // committed, so a Paystack outage here must not throw past this point and
  // replay an applied charge — log and continue with whatever we have.
  const paidPlanCode = data.plan!.plan_code;
  let customer: Awaited<ReturnType<typeof fetchCustomer>> | null = null;
  try {
    customer = await fetchCustomer(data.customer.customer_code);
  } catch (err) {
    console.error(
      `applyChargeSuccess: customer lookup for ${data.customer.customer_code} failed after the ` +
        `${data.reference} grant succeeded; subscription reconciliation skipped`,
      err,
    );
  }

  // Record which Paystack subscription this row represents, and when the period
  // it just paid for runs out — BEFORE disabling any superseded plan below.
  //
  // `provider_subscription_id` has existed since 0008 and was never written, so
  // cancellation depended entirely on `provider_customer_id` plus a live
  // customer fetch — one Paystack outage away from a learner being unable to
  // cancel, and no help at all when a customer has more than one subscription.
  //
  // `current_period_end` matters more. It is what someone is owed after they
  // stop renewing, and Paystack nulls `next_payment_date` the moment a
  // subscription stops renewing — so it can only be captured *here*, while the
  // subscription is still active, never at cancellation time when it is gone.
  //
  // Ordering is load-bearing: disabling a stale plan fires Paystack's
  // `subscription.disable`, and that webhook reads this row the moment it
  // lands. If the disable call goes out before these fields are written, the
  // webhook sees a missing/stale period end and downgrades the tier the
  // learner paid for seconds earlier (observed in production: a Plus→Premium
  // switch landed as "no subscription"). Recording first means the webhook
  // either sees the NEW subscription's identity (and its mismatched-code guard
  // skips it) or a live period end.
  //
  // `cancel_at_period_end` resets to false: a successful charge means billing
  // is running, whatever was true before. Without this, someone who cancels and
  // later resubscribes stays flagged as ending.
  //
  // Best-effort on purpose. It runs after the grant, and failing to record
  // these must not throw — throwing releases the ledger row and replays a
  // charge that has already been applied.
  // Same-plan duplicate detection runs BEFORE anything is disabled: if two
  // live subs share the just-paid plan code, this row must be pointed at the
  // SURVIVOR (not whichever came first in the embed), so that when the older
  // duplicate is disabled below and Paystack fires subscription.disable, the
  // webhook's mismatched-code guard sees a row that names the kept
  // subscription and leaves the paid tier alone.
  //
  // The incoming charge itself cannot name its subscription — ChargeSuccessData
  // carries no `subscription` field (webhook and verify shapes alike) — so the
  // newest-wins rule above is the identification; there is no tx.subscription
  // code to protect instead.
  const { survivor, duplicates } = partitionSamePlanDuplicates(customer?.subscriptions ?? [], paidPlanCode);
  const current = survivor ?? (customer ? findCurrentSubscription(customer, paidPlanCode) : undefined);
  if (current) {
    const { error } = await admin
      .from("subscriptions")
      .update({
        provider_subscription_id: current.subscription_code,
        cancel_at_period_end: false,
        ...(current.next_payment_date
          ? { current_period_end: new Date(current.next_payment_date).toISOString() }
          : {}),
      })
      .eq("user_id", userId);
    if (error) {
      console.error(
        `applyChargeSuccess: could not record subscription state for ${userId}: ${error.message}`,
      );
    }
  } else if (customer) {
    // The grant landed but the subscription it belongs to could not be picked
    // out of the customer embed. This is the signature of Paystack returning
    // the fresh sub with an empty/incomplete plan object — the exact condition
    // that, combined with the stale loop below, used to disable brand-new
    // subscriptions seconds after purchase. Never guess an identity here:
    // log loudly so ops can reconcile by hand.
    console.error(
      `applyChargeSuccess: grant applied for ${userId} but no active subscription ` +
        `matching plan ${paidPlanCode} was found in the customer embed; ` +
        `provider_subscription_id/current_period_end not updated. Subs seen: ` +
        JSON.stringify(
          customer.subscriptions.map((s) => ({
            code: s.subscription_code,
            status: s.status,
            plan: s.plan,
          })),
        ),
    );
  } else {
    console.error(
      `applyChargeSuccess: grant applied for ${userId} but the Paystack customer embed was ` +
        `unreachable; provider_subscription_id/current_period_end not updated`,
    );
  }

  // A plan or cycle change starts a NEW Paystack subscription while the
  // OLD one stays active — Paystack never auto-cancels the previous plan. Left
  // alone, the learner is billed for BOTH plans every renewal. So cancel every
  // *other* live subscription for this customer, keeping only the one matching
  // the plan just paid for. A no-op on a first purchase.
  //
  // IDENTIFICATION RULE — this filter has one job and a history of doing the
  // opposite. It previously read `s.plan.plan_code !== paidPlanCode`, so any
  // subscription whose embedded plan came back EMPTY (`{}`, an observed
  // Paystack serialization) compared as `undefined !== "PLN_…"` → stale →
  // DISABLED. That silently flipped every paying customer's brand-new
  // subscription to non-renewing ~1.5s after checkout (four-for-four in the
  // event ledger). The rule now: only a subscription whose plan code is KNOWN,
  // differs from the plan just paid for, and names a different subscription is
  // superseded. Unknown plans are untouchable — worst case is a duplicate
  // billing we can detect and refund, never a paid plan vanishing.
  // A disable that FAILS intentionally THROWS instead of logging and moving on:
  // a swallowed disable is a permanent double-charge, and the ledger row is
  // already committed so Paystack's redelivery would otherwise skip it.
  // Throwing releases the ledger row (both callers do this) so the whole charge
  // is retried until superseded subscriptions are actually gone. The tier grant
  // above is idempotent on retry, and the receipt email below runs only after
  // this succeeds — so a retry re-grants harmlessly and never double-sends.
  const stale = (customer?.subscriptions ?? []).filter((s) => {
    if (s.status !== "active") return false;
    if (current && s.subscription_code === current.subscription_code) return false;
    const code = subscriptionPlanCode(s);
    if (!code) {
      console.error(
        `applyChargeSuccess: skipping unidentifiable subscription ${s.subscription_code} ` +
          `(status ${s.status}, plan ${JSON.stringify(s.plan)}) during superseded-plan cleanup`,
      );
      return false;
    }
    return code !== paidPlanCode;
  });
  for (const s of stale) {
    console.error(
      `applyChargeSuccess: disabling superseded subscription ${s.subscription_code} ` +
        `(plan ${subscriptionPlanCode(s)} ≠ paid ${paidPlanCode}) for customer ${data.customer.customer_code}`,
    );
    await disableSubscription(s.subscription_code, s.email_token);
  }

  // Collapse any remaining SAME-PLAN duplicates (the superseded guard above
  // only ever touches different plan codes). Best-effort and never throwing —
  // see pruneDuplicateSamePlanSubscriptions. Runs after the row points at the
  // survivor, so the subscription.disable event Paystack fires for each
  // dropped duplicate hits the webhook's mismatched-code guard.
  if (duplicates.length > 0) {
    await pruneDuplicateSamePlanSubscriptions({
      customerCode: data.customer.customer_code,
      paidPlanCode,
      keepCode: current?.subscription_code,
      duplicates,
    });
  }

  // Receipt + welcome (best-effort; the ledger already made this once-only).
  if (isEmailConfigured && data.customer.email) {
    const receipt = buildPaymentReceiptEmail({
      firstName: data.customer.first_name ?? "",
      planName: PLAN_MAP[plan].name,
      amountZar: (data.amount ?? 0) / 100,
      // Naming the next charge date is the disclosure that stops a renewal
      // being a surprise. Null when Paystack didn't give us one; the template
      // then says it renews without naming a day, rather than inventing one.
      renewsOn: current?.next_payment_date ?? null,
    });
    await sendEmail({ to: data.customer.email, ...receipt }).catch(() => {});
  }
}
