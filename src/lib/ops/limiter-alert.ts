import { environmentLabel, errorMessage, opsAlert } from "@/lib/ops/alert";

/**
 * Tell a human when shared rate limiting (Upstash) is failing.
 *
 * During an outage the AI routes keep working, but only on the rule-based
 * fallback — for paying learners too, since spend cannot be accounted for.
 * That degradation is deliberate and silent to the learner's wallet, which is
 * exactly why it must not be silent to the operator: nothing else surfaces it.
 *
 * Throttling and delivery are shared with the checkout alert — see ops/alert.
 */
export function reportLimiterOutage(surface: "tutor" | "coach" | "vision", err: unknown): void {
  opsAlert({
    kind: `limiter:${surface}`,
    subject: `[K53 ops] Rate limiter down — AI on local fallback (${surface})`,
    lines: [
      `Shared rate limiting is failing, so AI routes are on the free local fallback.`,
      ``,
      `Surface:     ${surface}`,
      `Environment: ${environmentLabel()}`,
      `Error:       ${errorMessage(err)}`,
      ``,
      `What learners see: the tutor and coach answer from study notes (paid plans`,
      `included) and the sign scanner reports itself unavailable. No provider spend`,
      `happens and no daily allowance is used.`,
      ``,
      `Check the Upstash Redis database and the UPSTASH_REDIS_REST_* env vars.`,
      `At most one alert per instance every 30 minutes.`,
    ],
  });
}
