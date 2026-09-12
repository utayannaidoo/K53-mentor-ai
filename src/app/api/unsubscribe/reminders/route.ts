import { SITE_URL } from "@/lib/constants";
import { clientIp, limitUnsubscribeProbe } from "@/lib/ai/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyReminderOptOut } from "@/lib/notify/reminder-optout";

export const runtime = "nodejs";

/**
 * Turn study reminders off from the link in a reminder email.
 *
 * Unlike /api/unsubscribe (which suppresses an address outright), this only
 * clears `profiles.email_notifications`, so receipts, password mail and
 * subscription notices keep working. Someone who wants all of it stopped can
 * still say so from the account page or by replying.
 *
 * Signature first, rate limit second — the same reason as the plan-email
 * route: Gmail sends one-click POSTs from Google's shared IP ranges, so
 * throttling before the HMAC check would break the button it renders.
 */
async function optOut(
  req: Request,
): Promise<{ status: "rate_limited" | "invalid" | "done" | "error"; retryAfter?: number }> {
  const url = new URL(req.url);
  const userId = (url.searchParams.get("u") ?? "").trim();
  const token = url.searchParams.get("t") ?? "";

  if (userId && verifyReminderOptOut(userId, token)) {
    const admin = createAdminClient();
    if (!admin) return { status: "error" };
    const { error } = await admin
      .from("profiles")
      .update({ email_notifications: false })
      .eq("id", userId);
    if (error) {
      console.error("reminder opt-out failed", error.message);
      return { status: "error" };
    }
    return { status: "done" };
  }

  const rl = await limitUnsubscribeProbe(clientIp(req));
  if (!rl.success) return { status: "rate_limited", retryAfter: rl.retryAfter };
  return { status: "invalid" };
}

/** RFC 8058 one-click: the mail client POSTs this itself, expecting a 2xx. */
export async function POST(req: Request) {
  const result = await optOut(req);
  if (result.status === "rate_limited") {
    return Response.json(
      { error: "rate_limited", retryAfter: result.retryAfter },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
    );
  }
  if (result.status === "invalid") return Response.json({ error: "invalid" }, { status: 400 });
  // 5xx on purpose: providers retry, and answering "fine" would silently drop
  // an opt-out the reader believes they made.
  if (result.status === "error") return Response.json({ error: "unavailable" }, { status: 503 });
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  const result = await optOut(req);
  if (result.status === "rate_limited") {
    return Response.json(
      { error: "rate_limited", retryAfter: result.retryAfter },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
    );
  }
  return Response.redirect(`${SITE_URL}/unsubscribed?status=${result.status}&kind=reminders`, 303);
}
