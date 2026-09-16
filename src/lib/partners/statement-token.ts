import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/constants";

/**
 * A driving school's read-only statement link.
 *
 * Schools deliberately have no account (see the programme spec): a page showing
 * five numbers does not justify a second auth surface to build, support and
 * secure. So the link *is* the credential — an HMAC of the school's code, the
 * same construction as `src/lib/leads/unsubscribe-token.ts` uses for people who
 * never made an account.
 *
 * Nothing behind it is personal: counts and rand totals, never the learners.
 * A leaked statement link therefore exposes a school's own numbers to whoever
 * holds it, which is the same thing the school's own inbox already exposes.
 *
 * Falls back to CRON_SECRET so this works on the current deployment without a
 * new env var; set PARTNER_SECRET to rotate it independently. With neither set
 * there is no link, and callers must say so rather than print a broken one.
 */
function secret(): string {
  return process.env.PARTNER_SECRET || process.env.CRON_SECRET || "";
}

export function statementToken(code: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key)
    .update(`partner-statement:${code.trim().toLowerCase()}`)
    .digest("base64url")
    .slice(0, 32);
}

/** The full link to email a school, or null when no secret is configured. */
export function statementUrl(code: string): string | null {
  const token = statementToken(code);
  if (!token) return null;
  return `${SITE_URL}/partners/${encodeURIComponent(code.trim().toLowerCase())}?t=${token}`;
}

export function verifyStatementToken(code: string, token: string): boolean {
  const expected = statementToken(code);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
