import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/constants";

/**
 * One-click unsubscribe for people who gave us an address but never made an
 * account — there is no account page for them to switch reminders off in, and
 * a marketing email without a working opt-out is both rude and unlawful
 * (POPIA s69 requires a way to say stop).
 *
 * An HMAC of the address, not a stored random token: nothing to migrate, no
 * row to look up, and a link that cannot be guessed for someone else's
 * address. Truncated to 32 base64url characters — 192 bits, far past what an
 * unsubscribe link needs, and short enough not to wrap in a mail client.
 *
 * Falls back to CRON_SECRET so this works on the current deployment without a
 * new env var; set UNSUBSCRIBE_SECRET to rotate it independently. With neither
 * set (local dev) there is no link, and the caller says so rather than
 * printing a broken one.
 */
function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || "";
}

function normalise(email: string): string {
  return email.trim().toLowerCase();
}

export function unsubscribeToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(normalise(email)).digest("base64url").slice(0, 32);
}

/** The full link to put in an email, or null when no secret is configured. */
export function unsubscribeUrl(email: string): string | null {
  const token = unsubscribeToken(email);
  if (!token) return null;
  return `${SITE_URL}/api/unsubscribe?e=${encodeURIComponent(normalise(email))}&t=${token}`;
}

export function verifyUnsubscribe(email: string, token: string): boolean {
  const expected = unsubscribeToken(email);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
