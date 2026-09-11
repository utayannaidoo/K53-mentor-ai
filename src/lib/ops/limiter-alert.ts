import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { SUPPORT_EMAIL } from "@/lib/constants";

/**
 * Tell a human when shared rate limiting (Upstash) is failing.
 *
 * During an outage the AI routes keep working, but only on the rule-based
 * fallback — for paying learners too, since spend cannot be accounted for.
 * That degradation is deliberate and silent to the learner's wallet, which is
 * exactly why it must not be silent to the operator: nothing else surfaces it.
 *
 * Throttled per serverless instance, so a sustained outage sends a handful of
 * emails rather than one per request.
 */
const ALERT_EVERY_MS = 30 * 60 * 1000;
let lastAlertAt = 0;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function reportLimiterOutage(surface: "tutor" | "coach" | "vision", err: unknown): void {
  const now = Date.now();
  if (now - lastAlertAt < ALERT_EVERY_MS) return;
  lastAlertAt = now;
  if (!isEmailConfigured) return;

  const lines = [
    `Shared rate limiting is failing, so AI routes are on the free local fallback.`,
    ``,
    `Surface:     ${surface}`,
    `Environment: ${process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown"}`,
    `Error:       ${err instanceof Error ? err.message : String(err)}`,
    ``,
    `What learners see: the tutor and coach answer from study notes (paid plans`,
    `included) and the sign scanner reports itself unavailable. No provider spend`,
    `happens and no daily allowance is used.`,
    ``,
    `Check the Upstash Redis database and the UPSTASH_REDIS_REST_* env vars.`,
    `At most one alert per instance every 30 minutes.`,
  ];
  void sendEmail({
    to: SUPPORT_EMAIL,
    subject: `[K53 ops] Rate limiter down — AI on local fallback (${surface})`,
    html:
      `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;` +
      `line-height:1.6;color:#1d2724;white-space:pre-wrap;">${esc(lines.join("\n"))}</pre>`,
    text: lines.join("\n"),
  }).catch(() => {});
}
