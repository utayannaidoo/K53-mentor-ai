import { SITE_URL } from "@/lib/constants";
import { clientIp, limitPlanEmail } from "@/lib/ai/rate-limit";
import { suppress } from "@/lib/notify/suppression";
import { verifyUnsubscribe } from "@/lib/leads/unsubscribe-token";

export const runtime = "nodejs";

/**
 * One-click unsubscribe from the link in a plan email.
 *
 * A GET, because that is what a mail client follows, and it is safe to repeat:
 * suppression is idempotent. The address is proved by the HMAC in the link, so
 * nobody can unsubscribe someone else's address by guessing it.
 *
 * Lands on the same suppression list the bounce webhook writes to, which
 * `sendEmail` already checks before every send — so this stops account email
 * too, deliberately: someone clicking "stop emailing me" means all of it.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = url.searchParams.get("t") ?? "";

  // Cheap guard on an endpoint anyone can hit; the HMAC is the real check.
  const rl = await limitPlanEmail(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!email || !verifyUnsubscribe(email, token)) {
    return Response.redirect(`${SITE_URL}/unsubscribed?status=invalid`, 303);
  }

  const ok = await suppress(email, "unsubscribed", "one-click from a plan email");
  return Response.redirect(`${SITE_URL}/unsubscribed?status=${ok ? "done" : "error"}`, 303);
}
