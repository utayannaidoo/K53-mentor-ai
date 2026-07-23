import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

/**
 * POPIA right-to-erasure: permanently delete the signed-in user's account.
 * Every user table references auth.users(id) ON DELETE CASCADE, so removing
 * the auth user erases profile, subscription, streaks, attempts, reviews,
 * tutor threads — everything — in one call. Irreversible by design.
 *
 * Note: this deletes the account record, not the Paystack subscription —
 * the client requires cancellation first (and the UI enforces that order).
 */
export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!isSupabaseConfigured) {
    // Demo mode has no server account — the client clears localStorage itself.
    return Response.json({ ok: true, demo: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "Deletion not configured" }, { status: 500 });
  }

  // Refuse while a paid subscription is live — otherwise Paystack keeps
  // charging a card attached to an account that no longer exists.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier,status")
    .eq("user_id", user.id)
    .maybeSingle();
  const row = sub as { tier: string; status: string } | null;
  // Any live paid state must be cancelled first, otherwise Paystack keeps a
  // payment method attached to an account that no longer exists. `trialing` is
  // treated as live here to match the entitlement and checkout status checks.
  if (
    row &&
    row.tier !== "free" &&
    (row.status === "active" || row.status === "trialing" || row.status === "past_due")
  ) {
    return Response.json({ error: "cancel_subscription_first" }, { status: 409 });
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("account/delete failed", error.message);
    return Response.json({ error: "Deletion failed — please try again." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
