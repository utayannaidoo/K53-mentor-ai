import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildWelcomeEmail } from "@/lib/notify/templates";
import { FREE_TRIAL_DAYS } from "@/lib/billing/plans";

/**
 * Send the welcome email once per account, ever.
 *
 * Free signups got nothing before this: the only welcome in the system was
 * bundled into the payment receipt, so the people still deciding whether to pay
 * heard from us least. It is also the first chance to set the expectation the
 * product depends on — ten minutes a day, not a cram.
 *
 * ── Once, and only once ─────────────────────────────────────────────────────
 *
 * The `notifications` table is the send ledger the reminder cron already uses,
 * and the same rule applies here: **the row is written only after a successful
 * send**, so an unconfigured or failing provider never burns the one welcome an
 * account gets. The trade is the other direction — a send that succeeds and
 * whose ledger write then fails could send twice. A duplicate welcome is a mild
 * embarrassment; a silently-swallowed one is a user who never hears from us.
 *
 * ── Why it lives in the auth callback ───────────────────────────────────────
 *
 * That route is the one place both signup paths converge: `token_hash` email
 * confirmation and the OAuth code exchange. Hooking the email confirmation
 * alone would skip every Google signup. The `isNew` guard is the caller's job,
 * since only it knows whether this callback just created an account.
 */
export async function sendWelcomeOnce(userId: string): Promise<boolean> {
  if (!isEmailConfigured) return false;
  const admin = createAdminClient();
  if (!admin) return false;

  try {
    const { data: already } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "welcome")
      .limit(1)
      .maybeSingle();
    if (already) return false;

    const { data } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();
    const profile = data as { email: string | null; full_name: string | null } | null;
    if (!profile?.email) return false;

    // First name only. `full_name` is whatever they typed, so it is escaped in
    // the template like every other user-supplied value.
    const firstName = (profile.full_name ?? "").trim().split(/\s+/)[0] ?? "";
    const mail = buildWelcomeEmail({ firstName, trialDays: FREE_TRIAL_DAYS });

    const sent = await sendEmail({ to: profile.email, ...mail });
    if (!sent) return false;

    await admin
      .from("notifications")
      .insert({ user_id: userId, type: "welcome", sent_at: new Date().toISOString() });
    return true;
  } catch (err) {
    // Never propagates: this runs on the redirect that finishes signup, and no
    // email problem may stop somebody getting into the account they just made.
    console.error("sendWelcomeOnce failed", err);
    return false;
  }
}
