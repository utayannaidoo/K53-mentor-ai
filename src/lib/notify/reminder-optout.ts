import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/constants";

/**
 * One-click opt-out for the study-reminder emails.
 *
 * Separate from the plan-email unsubscribe on purpose. That one suppresses
 * the address outright, which is right for someone with no account. Doing the
 * same to an account holder would also kill their payment receipts, password
 * resets and the notice that their subscription is about to lapse — mail they
 * did not ask to stop and would be alarmed to lose. So this flips
 * `profiles.email_notifications` instead: reminders off, everything
 * transactional untouched.
 *
 * Signed over the user id rather than the address: the id is already in the
 * cron's hand when it builds the email, it does not change when someone
 * updates their email, and it keeps the address out of the URL.
 *
 * `:reminders` is domain separation. Without it the same secret would produce
 * interchangeable tokens for two different actions, and a link meant to stop
 * reminders could be replayed against another endpoint.
 */
function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || "";
}

export function reminderOptOutToken(userId: string): string | null {
  const key = secret();
  if (!key || !userId) return null;
  return createHmac("sha256", key).update(`${userId}:reminders`).digest("base64url").slice(0, 32);
}

/** The link for an email footer, or null when no secret is configured. */
export function reminderOptOutUrl(userId: string): string | null {
  const token = reminderOptOutToken(userId);
  if (!token) return null;
  return `${SITE_URL}/api/unsubscribe/reminders?u=${encodeURIComponent(userId)}&t=${token}`;
}

export function verifyReminderOptOut(userId: string, token: string): boolean {
  const expected = reminderOptOutToken(userId);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
