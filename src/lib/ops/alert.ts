import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { SUPPORT_EMAIL } from "@/lib/constants";

/**
 * Operator alerts — the shared half of "something is broken and nothing else
 * would ever tell you".
 *
 * Two things use this, and both share the same failure shape: a degradation
 * the learner sees but the operator does not. A rate limiter that is down
 * quietly serves the free tutor to paying accounts; a checkout that 5xxs
 * quietly turns away buyers. Neither raises an error anybody reads.
 *
 * Throttled per serverless instance rather than globally. That is deliberate
 * and its limits are worth knowing: a sustained outage across N warm instances
 * sends up to N emails an interval, and a cold start resets the clock. Shared
 * throttling would need Redis — which is the very thing the limiter alert
 * exists to tell you is down. A handful of duplicate emails is the right price
 * for an alert that still works when the shared backend does not.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Per-instance last-sent clock, keyed by alert kind so one cannot mute another. */
const lastAlertAt = new Map<string, number>();

/** Shared by the alerts below so both read the same in an inbox. */
export function opsAlert(args: {
  /** Throttle key. Alerts of different kinds never suppress each other. */
  kind: string;
  subject: string;
  /** Body lines, rendered as monospace text. */
  lines: string[];
  /** Minimum gap between alerts of this kind, per instance. */
  everyMs?: number;
}): void {
  const now = Date.now();
  const gap = args.everyMs ?? 30 * 60 * 1000;
  const last = lastAlertAt.get(args.kind) ?? 0;
  if (now - last < gap) return;
  lastAlertAt.set(args.kind, now);
  if (!isEmailConfigured) return;

  const text = args.lines.join("\n");
  void sendEmail({
    to: SUPPORT_EMAIL,
    subject: args.subject,
    html:
      `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;` +
      `line-height:1.6;color:#1d2724;white-space:pre-wrap;">${esc(text)}</pre>`,
    text,
  }).catch(() => {});
}

/** Where this alert came from, for the body. */
export function environmentLabel(): string {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";
}

/** Paystack puts the real reason in the error message — pass it through. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
