import "server-only";
import webpush from "web-push";
import { SUPPORT_EMAIL } from "@/lib/constants";

/**
 * Web-push delivery, alongside the Resend email sender in `./email.ts`. Both
 * channels are optional and independently configured; the cron route decides
 * per-user which to use based on what they've opted into / subscribed to.
 */

export const isPushConfigured = Boolean(
  process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
);

let vapidReady = false;
function ensureVapid() {
  if (vapidReady || !isPushConfigured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? `mailto:${SUPPORT_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  vapidReady = true;
}

export interface PushMessage {
  title: string;
  body: string;
  url: string;
}

export interface PushSubscriptionRow {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Send one push notification. Returns "ok", "gone" (subscription expired —
 * caller should delete the row), or "error".
 */
export async function sendPush(
  sub: PushSubscriptionRow,
  msg: PushMessage,
): Promise<"ok" | "gone" | "error"> {
  if (!isPushConfigured) return "error";
  ensureVapid();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify(msg),
    );
    return "ok";
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return "gone";
    console.error("push send failed", status);
    return "error";
  }
}
