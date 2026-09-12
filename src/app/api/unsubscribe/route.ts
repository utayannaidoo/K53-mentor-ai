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
/** Shared by both verbs: rate limit, prove the address, suppress it. */
async function unsubscribeFrom(
  req: Request,
): Promise<{ status: "rate_limited" | "invalid" | "done" | "error"; retryAfter?: number }> {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = url.searchParams.get("t") ?? "";

  // Cheap guard on an endpoint anyone can hit; the HMAC is the real check.
  const rl = await limitPlanEmail(clientIp(req));
  if (!rl.success) return { status: "rate_limited", retryAfter: rl.retryAfter };
  if (!email || !verifyUnsubscribe(email, token)) return { status: "invalid" };

  const ok = await suppress(email, "unsubscribed", "one-click from a plan email");
  return { status: ok ? "done" : "error" };
}

/**
 * RFC 8058 one-click: the mailbox provider POSTs this URL itself when the
 * reader taps its own unsubscribe control, and never shows them our page. It
 * must not need a body, a session or a redirect — just a 2xx once the address
 * is off. Advertising List-Unsubscribe-Post without answering POST is worse
 * than not advertising it at all: Gmail shows the button, then it fails.
 */
export async function POST(req: Request) {
  const result = await unsubscribeFrom(req);
  if (result.status === "rate_limited") {
    return Response.json(
      { error: "rate_limited", retryAfter: result.retryAfter },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
    );
  }
  if (result.status === "invalid") return Response.json({ error: "invalid" }, { status: 400 });
  // A failed suppression returns 5xx on purpose: providers retry, and silently
  // answering "fine" would drop the request on the floor.
  if (result.status === "error") return Response.json({ error: "unavailable" }, { status: 503 });
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  const result = await unsubscribeFrom(req);
  if (result.status === "rate_limited") {
    return Response.json(
      { error: "rate_limited", retryAfter: result.retryAfter },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
    );
  }
  // A human followed the link, so every other outcome is a page, not JSON.
  return Response.redirect(`${SITE_URL}/unsubscribed?status=${result.status}`, 303);
}
