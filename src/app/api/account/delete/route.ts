import { isPaystackConfigured, isSupabaseConfigured, supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { refundTransaction } from "@/lib/paystack/client";
import { disableActiveSubscriptions, refundEligible } from "@/lib/billing/subscription-cancel";

export const runtime = "nodejs";

/**
 * Verify a password out of band via GoTrue's password grant, WITHOUT touching
 * the caller's session cookies — a throwaway request whose returned tokens are
 * discarded. Used to reauthenticate the user right before an irreversible
 * action, so a walk-up on an already-open session can't trigger it.
 */
async function verifyPassword(email: string, password: string): Promise<boolean> {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return false;
  try {
    const res = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: supabaseConfig.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * POPIA right-to-erasure: permanently delete the signed-in user's account.
 * Every user table references auth.users(id) ON DELETE CASCADE, so removing the
 * auth user erases profile, subscription, streaks, attempts, reviews, tutor
 * threads — everything — in one call. Irreversible by design.
 *
 * Two safeguards run before the erase:
 *  1. Re-verify the requester. Password accounts must re-enter their password
 *     (verified out-of-band); an OAuth-only account's live provider session is
 *     the proof. This stops someone on an unlocked session from wiping it.
 *  2. Cancel any live Paystack subscription first — and refund it if still
 *     inside the money-back window — so the platform never keeps charging a card
 *     attached to an account that no longer exists, and deleting is never a way
 *     to silently forfeit a refund the user would get by cancelling normally.
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

  let body: { password?: unknown } = {};
  try {
    body = (await req.json()) as { password?: unknown };
  } catch {
    // A missing body is fine — OAuth-only accounts send no password.
  }
  const password = typeof body.password === "string" ? body.password : "";

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

  // ── 1. Reauthenticate ──────────────────────────────────────────────────────
  // Password accounts must confirm their password. OAuth-only accounts have no
  // password to re-enter; their active provider session stands in as proof.
  const hasPassword = (user.identities ?? []).some((i) => i.provider === "email");
  if (hasPassword) {
    if (!password) {
      return Response.json({ error: "password_required" }, { status: 401 });
    }
    if (!user.email || !(await verifyPassword(user.email, password))) {
      return Response.json({ error: "invalid_password" }, { status: 401 });
    }
  }

  // ── 2. Cancel any live subscription, then (best-effort) refund ──────────────
  const { data } = await supabase
    .from("subscriptions")
    .select("tier, provider_customer_id, last_charge_reference, paid_at, money_back_used")
    .eq("user_id", user.id)
    .maybeSingle();
  const sub = data as {
    tier: string | null;
    provider_customer_id: string | null;
    last_charge_reference: string | null;
    paid_at: string | null;
    money_back_used: boolean | null;
  } | null;
  const customerCode = sub?.provider_customer_id ?? null;

  if (customerCode && isPaystackConfigured) {
    try {
      await disableActiveSubscriptions(customerCode);
    } catch (err) {
      // Billing might still be live — do NOT erase the account, or Paystack
      // keeps charging a card with no account behind it. The user retries.
      console.error("account/delete: could not cancel subscription", err);
      return Response.json({ error: "subscription_cancel_failed" }, { status: 502 });
    }

    if (
      refundEligible({
        tier: sub?.tier ?? null,
        lastChargeReference: sub?.last_charge_reference ?? null,
        paidAt: sub?.paid_at ?? null,
        moneyBackUsed: sub?.money_back_used ?? null,
      }) &&
      sub?.last_charge_reference
    ) {
      try {
        await refundTransaction(sub.last_charge_reference);
        // Latch the refund on the row BEFORE deleting, so if the delete below
        // fails and the request is retried, the refund can't be issued twice.
        await admin
          .from("subscriptions")
          .update({ money_back_used: true, status: "canceled", tier: "free" })
          .eq("user_id", user.id);
      } catch (err) {
        // Billing is already stopped; a refund hiccup must not block erasure.
        console.error("account/delete: refund error", err);
      }
    }
  }

  // ── 3. Erase ────────────────────────────────────────────────────────────────
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("account/delete failed", error.message);
    return Response.json({ error: "Deletion failed — please try again." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
