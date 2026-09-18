import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { SITE_URL } from "@/lib/constants";

/**
 * Staff invites, in two forms on purpose.
 *
 * The emailed link is the good path. The 8-character short code is the one
 * that actually matters here: plenty of driving instructors have no working
 * email address, and an owner standing next to their car needs to be able to
 * read the code down the phone or into a WhatsApp voice note. An email-only
 * invite flow would strand real customers on day one.
 */

/**
 * 24 letters + 8 digits = 32 symbols, and `O`, `0`, `I`, `1` are all absent
 * because someone will read this aloud. 32 divides 256 exactly, so the
 * byte-to-symbol mapping below is unbiased with no rejection loop.
 */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** ~41 bits. Short codes are low-entropy by design, so they also expire. */
export function newShortCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (const byte of bytes) out += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return out;
}

/** The emailed secret. 256 bits, URL-safe. */
export function newInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Only the digest is stored (`school_invites.token_hash`). A plain SHA-256 is
 * right here rather than a password hash: the input is 256 random bits, so
 * there is nothing to brute-force and nothing to salt.
 */
export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function inviteUrl(token: string): string {
  return `${SITE_URL}/schools/join/${token}`;
}

/** Prefilled WhatsApp hand-off, since there is no messaging integration. */
export function inviteWhatsappUrl(schoolName: string, code: string, url: string): string {
  const text = `You've been added to ${schoolName} on K53 Mentor. Open ${url} or enter code ${code} at ${SITE_URL}/schools/join`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Normalises what someone typed or pasted into a short-code field. */
export function normaliseShortCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function validShortCode(value: string): boolean {
  return /^[A-Z2-9]{8}$/.test(value);
}
