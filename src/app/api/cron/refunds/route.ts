import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { processPendingRefunds } from "@/lib/billing/refund-lifecycle";
import { flushBillingEmails } from "@/lib/billing/refund-notifications";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Storage unavailable" }, { status: 503 });
  try {
    const refunds = await processPendingRefunds(admin);
    const notificationsSent = await flushBillingEmails(admin, 5);
    return Response.json({ refunds, notificationsSent });
  } catch (error) {
    console.error("refund cron incomplete", error);
    // A provider outage must not prevent delivery of already-recorded alerts.
    await flushBillingEmails(admin, 3).catch((e) => console.error("refund alerts pending", e));
    return Response.json({ error: "Refund processing incomplete" }, { status: 502 });
  }
}
