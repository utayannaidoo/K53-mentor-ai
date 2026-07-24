import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * One-time codes that confirm an account deletion from an OAuth-only account
 * (which has no password to reauthenticate with). Codes are short-lived, stored
 * hashed, and tolerate only a few wrong guesses before they're burned.
 */

export const CODE_TTL_MS = 10 * 60_000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** A cryptographically-random 6-digit code, zero-padded. */
export function generateDeletionCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Store (replacing any previous) the pending deletion code for a user, hashed. */
export async function storeDeletionCode(
  admin: SupabaseClient,
  userId: string,
  code: string,
): Promise<void> {
  const { error } = await admin.from("account_deletion_codes").upsert(
    {
      user_id: userId,
      code_hash: hashCode(code),
      expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
      attempts: 0,
      created_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`storeDeletionCode: ${error.message}`);
}

/**
 * Verify a submitted code against the stored hash (constant-time). Consumes the
 * code on success; burns it once expired or after too many wrong guesses. Every
 * failure returns false the same way, so nothing leaks which condition failed.
 */
export async function verifyDeletionCode(
  admin: SupabaseClient,
  userId: string,
  code: string,
): Promise<boolean> {
  const { data } = await admin
    .from("account_deletion_codes")
    .select("code_hash, expires_at, attempts")
    .eq("user_id", userId)
    .maybeSingle();
  const row = data as { code_hash: string; expires_at: string; attempts: number } | null;
  if (!row) return false;

  if (Date.parse(row.expires_at) < Date.now() || row.attempts >= MAX_ATTEMPTS) {
    await admin.from("account_deletion_codes").delete().eq("user_id", userId);
    return false;
  }

  const expected = Buffer.from(row.code_hash);
  const actual = Buffer.from(hashCode(code));
  const match = expected.length === actual.length && timingSafeEqual(expected, actual);
  if (!match) {
    // Count the failed guess; once the cap is reached, burn the code outright so
    // it can't be brute-forced by re-issuing guesses.
    const attempts = row.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await admin.from("account_deletion_codes").delete().eq("user_id", userId);
    } else {
      await admin.from("account_deletion_codes").update({ attempts }).eq("user_id", userId);
    }
    return false;
  }

  await admin.from("account_deletion_codes").delete().eq("user_id", userId);
  return true;
}
