import "server-only";

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
  const from = process.env.NOTIFY_FROM_EMAIL ?? "K53 Mentor <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
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
