import { verifyResendSignature } from "@/lib/notify/resend-signature";
import { suppress } from "@/lib/notify/suppression";

export const runtime = "nodejs";

/**
 * Resend delivery events — the half of sending that was missing.
 *
 * Nothing consumed these before, so hard bounces and spam complaints piled up
 * where nobody could see them. That is not a cosmetic gap: mailbox providers
 * score a sender on how often it mails addresses that do not exist and how
 * often people report it, and a bad enough score puts the *signup confirmation*
 * in Junk. Every account depends on that one email arriving.
 *
 * Configure at Resend → Webhooks, pointing at
 * `https://k53mentorai.co.za/api/resend/webhook`, subscribed to
 * `email.bounced` and `email.complained`. Put the signing secret in
 * `RESEND_WEBHOOK_SECRET`.
 *
 * Note what this does NOT cover: Supabase's auth emails (confirmation, magic
 * link, password reset) go through Resend over **SMTP**, not our API calls, so
 * they never pass through `sendEmail` and are not suppressed by it. They will
 * still generate bounce events that land here and get recorded, which is the
 * part that matters for reputation and for answering "why does this person
 * never get our mail".
 */

/** Only permanent failures suppress — see the migration for why. */
const HARD_BOUNCE = /permanent|hard|undetermined/i;

interface ResendEvent {
  type?: string;
  data?: {
    to?: string[] | string;
    email_id?: string;
    bounce?: { type?: string; subType?: string; message?: string };
    // Complaints carry no bounce block; the address is all we need.
  };
}

function recipients(data: ResendEvent["data"]): string[] {
  const to = data?.to;
  if (!to) return [];
  return (Array.isArray(to) ? to : [to]).filter((t) => typeof t === "string" && t.includes("@"));
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // 501, not 500: an unconfigured webhook is a deployment that has not turned
    // this on yet, and Resend should not retry forever against it.
    return Response.json({ error: "Webhook not configured" }, { status: 501 });
  }

  // Raw bytes, before any parsing — the signature covers exactly these.
  const rawBody = await req.text();
  const ok = verifyResendSignature({
    rawBody,
    svixId: req.headers.get("svix-id"),
    svixTimestamp: req.headers.get("svix-timestamp"),
    svixSignature: req.headers.get("svix-signature"),
    secret,
  });
  if (!ok) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody) as ResendEvent;
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const addresses = recipients(event.data);
  if (addresses.length === 0) {
    return Response.json({ received: true, ignored: "no recipient" });
  }

  if (event.type === "email.complained") {
    // Someone pressed "this is spam". Unambiguous and permanent — stop, whatever
    // the message was.
    for (const email of addresses) {
      await suppress(email, "complained", `email_id=${event.data?.email_id ?? "unknown"}`);
    }
    return Response.json({ received: true, suppressed: addresses.length });
  }

  if (event.type === "email.bounced") {
    const bounce = event.data?.bounce;
    const kind = `${bounce?.type ?? ""} ${bounce?.subType ?? ""}`;
    // A transient bounce is a full mailbox or a greylist, and suppressing on it
    // would silently cut off a real customer whose inbox was full for an
    // afternoon — with no way for them to find out why the mail stopped.
    if (!HARD_BOUNCE.test(kind)) {
      return Response.json({ received: true, ignored: "soft bounce" });
    }
    for (const email of addresses) {
      await suppress(email, "bounced", bounce?.message ?? kind.trim() ?? null);
    }
    return Response.json({ received: true, suppressed: addresses.length });
  }

  // Deliveries, opens, clicks: acknowledged and dropped. Subscribing to them
  // costs nothing here, and 200 keeps Resend from retrying.
  return Response.json({ received: true });
}
