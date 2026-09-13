import { environmentLabel, errorMessage, opsAlert } from "@/lib/ops/alert";

/**
 * Tell a human when checkout stops working.
 *
 * This exists because of a real morning: a learner arrived from Google search,
 * finished a mock, hit the paywall, and pressed the buy button **eight times
 * over three hours** before giving up and going back to the free drill. The
 * route was returning 5xx the whole time. Nothing anywhere raised a hand — no
 * alert, no dashboard, no email — and it was only found by reading the event
 * stream days later looking for something else.
 *
 * Every other silent failure in this app has an alert. This one costs money
 * directly, so it gets the loudest one: a shorter throttle than the limiter
 * alert, because a broken checkout is not something to learn about in half an
 * hour, and the buyer's user id so the person can be contacted and made whole.
 */

/** Tighter than the default: money is leaving while this is broken. */
const CHECKOUT_ALERT_EVERY_MS = 10 * 60 * 1000;

export function reportCheckoutFailure(args: {
  /** What went wrong, in words a sleepy operator can act on. */
  reason: "plan_code_missing" | "paystack_error";
  plan: string;
  cycle: string;
  /** Who could not pay, so they can be followed up. */
  userId?: string;
  err?: unknown;
}): void {
  const detail =
    args.reason === "plan_code_missing"
      ? [
          `A Paystack Plan code is missing from the environment, so checkout`,
          `returned 500 before it ever reached Paystack.`,
          ``,
          `Fix: set the PAYSTACK_PLAN_* variable for this plan in Vercel`,
          `(Production scope), then redeploy.`,
        ]
      : [
          `Paystack refused to start the transaction:`,
          ``,
          `  ${errorMessage(args.err)}`,
          ``,
          `"No Plan with code…" usually means the PAYSTACK_PLAN_* values are`,
          `TEST-mode codes while the secret key is live — the two modes have`,
          `separate Plan objects. Run \`npm run paystack:check\` with the live`,
          `key to see the Plans this account actually has.`,
        ];

  opsAlert({
    kind: `checkout:${args.reason}`,
    everyMs: CHECKOUT_ALERT_EVERY_MS,
    subject: `[K53 ops] Checkout is failing — nobody can pay (${args.plan})`,
    lines: [
      `A learner tried to subscribe and could not.`,
      ``,
      `Plan:        ${args.plan} ${args.cycle}`,
      `Environment: ${environmentLabel()}`,
      `Account:     ${args.userId ?? "(unknown)"}`,
      ``,
      ...detail,
      ``,
      `The buyer saw an honest error and was told to email support rather than`,
      `to retry, so expect a message. They have not been charged.`,
      ``,
      `At most one alert of this kind per instance every 10 minutes.`,
    ],
  });
}
