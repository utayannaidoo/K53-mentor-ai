import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Forget a captured lead address.
 *
 * The privacy policy says an address left by someone who asked for a plan
 * email but never made an account is kept "only until you unsubscribe or ask
 * us to delete it". Suppression alone did not honour that: it stops the
 * sending, but the row — address, result and consent timestamp — stayed on.
 * So an unsubscribe deletes it, and so does account deletion, which otherwise
 * left the address behind entirely: `plan_leads` is keyed by email and has no
 * user id for `deleteUser` to cascade from.
 *
 * Best-effort and always after the fact. Neither an opt-out nor an erasure may
 * fail because this row would not go away.
 */
export async function forgetPlanLead(email: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  try {
    const { error } = await admin
      .from("plan_leads")
      .delete()
      .eq("email", email.trim().toLowerCase());
    if (error) console.error("plan lead delete failed", error.message);
  } catch (err) {
    console.error("plan lead delete threw", err);
  }
}
