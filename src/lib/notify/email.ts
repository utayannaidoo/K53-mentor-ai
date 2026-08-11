import "server-only";
import { isSuppressed } from "@/lib/notify/suppression";

/**
 * Minimal transactional email sender (Resend REST API via fetch — no SDK
 * dependency). Unconfigured environments no-op: the cron reports what it
 * *would* send without writing notification rows, so nothing is marked
 * "sent" that never left the building.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

export async function sendEmail(msg: EmailMessage): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  // Never mail an address that hard-bounced or reported us as spam. Both are
  // permanent signals, and continuing to send is what turns a bad address into
  // a bad domain reputation — which eventually lands the signup confirmations
  // in Junk too. Returns false, like any other not-sent outcome, so the callers
  // that record a send ledger (the reminder cron) correctly don't record one.
  if (await isSuppressed(msg.to)) return false;

  const from = process.env.NOTIFY_FROM_EMAIL ?? "K53 Mentor <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      // A hung email API must not stall the caller (webhook / cron) — callers
      // already treat false as "not sent" and move on.
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });
    if (!res.ok) {
      console.error("resend send failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("resend send error", err);
    return false;
  }
}
