import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, limitPlanEmail } from "@/lib/ai/rate-limit";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildPlanEmail } from "@/lib/notify/templates";
import { planLeadSchema } from "@/lib/leads/plan-lead";
import { unsubscribeUrl } from "@/lib/leads/unsubscribe-token";

export const runtime = "nodejs";

/**
 * POST a signed-out visitor's starting-check plan to their inbox.
 *
 * No account, by design — this is the exit for people who won't make one yet.
 * That makes it an open, email-sending endpoint, so it is rate limited per IP,
 * the address is validated, and the consent tick is required by the schema.
 *
 * The plan itself comes from the client because the result lives in the
 * browser (the whole app works signed out). Nothing here is authoritative:
 * worst case someone mails themselves numbers they made up.
 */
export async function POST(req: Request) {
  const rl = await limitPlanEmail(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const parsed = planLeadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const lead = parsed.data;

  if (!isEmailConfigured) {
    console.error("plan email requested but email is not configured");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const mail = buildPlanEmail({
    score: lead.score,
    correct: lead.correct,
    total: lead.total,
    weakCategories: lead.weakCategories,
    unsubscribeUrl: unsubscribeUrl(lead.email),
  });
  const sent = await sendEmail({ to: lead.email, ...mail });
  // A suppressed or undeliverable address returns false — don't store a lead
  // we can never reach, and don't tell the visitor it arrived.
  if (!sent) return Response.json({ error: "unavailable" }, { status: 503 });

  // Storage is best-effort and happens after the send: the visitor's plan
  // reaching them matters more than our record of it, and a Supabase hiccup
  // must not turn a delivered email into an error on screen.
  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.from("plan_leads").upsert(
      {
        email: lead.email,
        vehicle_code: lead.vehicleCode,
        weak_categories: lead.weakCategories,
        score: lead.score,
        correct: lead.correct,
        total: lead.total,
        source: "diagnostic_results",
        last_sent_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );
    if (error) console.error("plan lead upsert failed", error.message);
  }

  return Response.json({ ok: true });
}
