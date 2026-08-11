import { PLAN_MAP, annualPrice, monthlyPrice } from "@/lib/billing/plans";

/**
 * Does what Paystack actually charged match what the site advertised?
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * Checkout sends Paystack **both** an amount and a Plan code, and for a
 * subscription Paystack bills the **Plan's dashboard amount**, ignoring what we
 * sent. Nothing outside the Paystack dashboard has ever asserted that those two
 * numbers agree. If a Plan there says R90 while `plans.ts` says R70, the site
 * advertises one price and the card is charged another — a Consumer Protection
 * Act problem rather than a bug, and one that would surface as a confused
 * support email weeks later, if at all.
 *
 * ── What this is NOT ────────────────────────────────────────────────────────
 *
 * It is not an authorization control, and reading it as one would be a mistake.
 * `metadata.plan` and `metadata.cycle` are set server-side by our own checkout
 * route, and the charged amount is decided by Paystack from the Plan — a buyer
 * has no way to influence either. There is no underpayment attack to stop here.
 * This detects **our own misconfiguration**, which is a different job.
 *
 * That is also why the caller grants the tier even when this fails. The likely
 * cause of a mismatch is a wrong number in the Paystack dashboard, and the
 * person who suffers for it is a customer who has already paid in good faith.
 * Refusing to grant would turn a billing-config error into "I paid and got
 * nothing" — strictly worse for them and no better for us. Detect, shout, let
 * the money through, fix the Plan.
 *
 * `scripts/paystack-reconcile.mjs` is the other half, and the better half: it
 * diffs the live Plans against this file before any customer is charged at all.
 */

export type PaidPlan = "premium" | "premium_plus";
export type BillingCycle = "monthly" | "annual";

/** What a first subscription charge should cost, in ZAR cents. */
export function expectedChargeCents(plan: PaidPlan, cycle: BillingCycle): number {
  const def = PLAN_MAP[plan];
  return (cycle === "annual" ? annualPrice(def) : monthlyPrice(def)) * 100;
}

export interface AmountCheck {
  /** false only when we positively know the charge disagrees with the site. */
  ok: boolean;
  /** Null when the cycle is unknown, so no single figure was expected. */
  expectedCents: number | null;
  actualCents: number | null;
  /** A complete sentence for a log line or an alert email. Null when ok. */
  problem: string | null;
}

/**
 * Compare a charge against the advertised price.
 *
 * Unverifiable inputs resolve to `ok` rather than to a false alarm — a missing
 * `amount` field or an unrecognised cycle means we cannot tell, and an alert
 * nobody can act on trains people to ignore alerts. Only a figure we can
 * compute and that disagrees is reported.
 */
export function checkChargeAmount(args: {
  plan: PaidPlan;
  /** `metadata.cycle` from checkout. Absent on older in-flight checkouts. */
  cycle?: string | null;
  /** `amount` from the charge, in ZAR cents. */
  actualCents?: number | null;
  currency?: string | null;
}): AmountCheck {
  const actual = typeof args.actualCents === "number" ? args.actualCents : null;
  const cycle: BillingCycle | null =
    args.cycle === "annual" ? "annual" : args.cycle === "monthly" ? "monthly" : null;
  const expected = cycle ? expectedChargeCents(args.plan, cycle) : null;

  if (args.currency && args.currency.toUpperCase() !== "ZAR") {
    return {
      ok: false,
      expectedCents: expected,
      actualCents: actual,
      problem:
        `Charge settled in ${args.currency}, not ZAR. Every price in plans.ts is Rand, ` +
        `so the amount comparison below is meaningless and the buyer may have been ` +
        `charged a converted figure they never saw advertised.`,
    };
  }

  if (actual === null) {
    return { ok: true, expectedCents: expected, actualCents: null, problem: null };
  }

  // No cycle recorded: accept either published price rather than guess. This
  // still catches a Plan set to a number that is neither.
  if (!cycle) {
    const candidates = (["monthly", "annual"] as const).map((c) =>
      expectedChargeCents(args.plan, c),
    );
    if (candidates.includes(actual)) {
      return { ok: true, expectedCents: null, actualCents: actual, problem: null };
    }
    return {
      ok: false,
      expectedCents: null,
      actualCents: actual,
      problem:
        `Charged R${(actual / 100).toFixed(2)} for ${args.plan}, which matches neither the ` +
        `monthly (R${(candidates[0] / 100).toFixed(2)}) nor the annual ` +
        `(R${(candidates[1] / 100).toFixed(2)}) price in plans.ts. No billing cycle was ` +
        `recorded on the charge, so this is as precise as it gets.`,
    };
  }

  if (actual === expected) {
    return { ok: true, expectedCents: expected, actualCents: actual, problem: null };
  }

  const direction = actual > expected! ? "MORE than" : "LESS than";
  return {
    ok: false,
    expectedCents: expected,
    actualCents: actual,
    problem:
      `Charged R${(actual / 100).toFixed(2)} for ${args.plan} ${cycle}, which is ${direction} ` +
      `the R${(expected! / 100).toFixed(2)} the site advertises. Paystack bills the Plan's ` +
      `dashboard amount, not the amount checkout sends, so the Paystack Plan and plans.ts ` +
      `have drifted apart. Fix the Plan in the Paystack dashboard.`,
  };
}
