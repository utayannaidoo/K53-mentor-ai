import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The do-not-send list, fed by Resend's bounce and complaint webhooks
 * (migration 0022).
 *
 * Mailbox providers score a sender on how often it keeps mailing addresses that
 * do not exist, and on how often recipients report it as spam. Ignoring those
 * signals is a slow-acting outage: reputation decays, and eventually the
 * signup-confirmation emails the whole account flow depends on start landing in
 * Junk. Checking a list before each send is the cheap half of not letting that
 * happen.
 */

export type SuppressionReason = "bounced" | "complained";

/** Addresses are compared case-insensitively; the local part rarely is in practice. */
function normalise(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Should we refuse to send to this address?
 *
 * Fails **open** — an unreachable database means we send, which risks one
 * avoidable email to a dead address. Failing closed would mean an outage in
 * this table silently stops payment receipts and password-adjacent mail, which
 * is far worse than a bounce.
 */
export async function isSuppressed(email: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  try {
    const { data, error } = await admin
      .from("email_suppressions")
      .select("email")
      .eq("email", normalise(email))
      .maybeSingle();
    if (error) {
      console.error("isSuppressed lookup failed", error.message);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    console.error("isSuppressed threw", err);
    return false;
  }
}

/**
 * Add an address to the list. Idempotent: a repeat bounce keeps the original
 * timestamp, which is the one worth knowing — when this address first went bad,
 * not when we last noticed.
 */
export async function suppress(
  email: string,
  reason: SuppressionReason,
  detail?: string | null,
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  try {
    const { error } = await admin
      .from("email_suppressions")
      .upsert(
        { email: normalise(email), reason, detail: detail ?? null },
        { onConflict: "email", ignoreDuplicates: true },
      );
    if (error) {
      console.error("suppress failed", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("suppress threw", err);
    return false;
  }
}
