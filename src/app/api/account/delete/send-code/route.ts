import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACCOUNT_DAILY_LIMIT, clientIp, limitCheckout, limitUserDaily } from "@/lib/ai/rate-limit";
import { generateDeletionCode, storeDeletionCode } from "@/lib/account/deletion-code";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildAccountDeletionCodeEmail } from "@/lib/notify/templates";

export const runtime = "nodejs";

/**
 * Email a one-time deletion code to the signed-in user. This is the confirmation
 * step for OAuth-only accounts (no password to reauthenticate with) before the
 * irreversible /api/account/delete call. The code is stored hashed and expires
 * in 10 minutes; only the account owner (their own session + their own inbox)
 * can complete the deletion.
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
    // Demo mode has no server account — nothing to confirm.
    return Response.json({ ok: true, demo: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // This one sends mail, so the per-account cap is also the anti-email-bombing
  // cap — the per-IP limit alone let one caller keep mailing a stranger's inbox.
  const userRl = await limitUserDaily("deletion_code", user.id, ACCOUNT_DAILY_LIMIT.deletion_code);
  if (!userRl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: userRl.retryAfter },
      { status: 429, headers: { "Retry-After": String(userRl.retryAfter) } },
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "Deletion not configured" }, { status: 500 });
  }

  if (!user.email) {
    return Response.json({ error: "no_email" }, { status: 400 });
  }
  if (!isEmailConfigured) {
    // Can't deliver a code — tell the client so it doesn't wait on one.
    return Response.json({ error: "email_not_configured" }, { status: 503 });
  }

  const code = generateDeletionCode();
  try {
    await storeDeletionCode(admin, user.id, code);
  } catch (err) {
    console.error("account/delete/send-code: store failed", err);
    return Response.json({ error: "Could not start deletion — please try again." }, { status: 500 });
  }

  const firstName = ((user.user_metadata?.full_name as string | undefined) ?? "").split(" ")[0] ?? "";
  const email = buildAccountDeletionCodeEmail({ firstName, code });
  const sent = await sendEmail({ to: user.email, ...email });
  if (!sent) {
    return Response.json({ error: "email_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
