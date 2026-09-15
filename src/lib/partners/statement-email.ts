import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildPartnerStatementEmail } from "@/lib/notify/templates";
import { statementUrl } from "@/lib/partners/statement-token";
import { schoolStatement } from "@/lib/partners/statement";

/**
 * The monthly "here's what you earned" email.
 *
 * Runs inside the existing daily reconciliation cron rather than as its own
 * schedule: `vercel.json` already carries two crons and the deployment's
 * allowance is small, and this is a once-a-month send that does not need its
 * own clock.
 *
 * Idempotency is `partner_schools.statement_month`, a `YYYY-MM` marker written
 * after a successful send. A school is emailed when its marker is not the
 * current month, which means the send survives a failed cron run (it retries
 * the next night) without ever sending twice in one month.
 */
export async function sendMonthlyStatements(admin: SupabaseClient): Promise<number> {
  if (!isEmailConfigured) return 0;
  const month = new Date().toISOString().slice(0, 7);

  const { data, error } = await admin
    .from("partner_schools")
    .select("id,name,contact_name,contact_email,statement_month")
    .eq("status", "active")
    .or(`statement_month.is.null,statement_month.neq.${month}`);
  if (error) {
    console.error("[partners] statement recipients lookup failed", error.message);
    return 0;
  }

  const schools = (data ?? []) as {
    id: string;
    name: string;
    contact_name: string;
    contact_email: string;
  }[];
  let sent = 0;

  for (const school of schools) {
    const { data: codeRow } = await admin
      .from("partner_school_codes")
      .select("code")
      .eq("school_id", school.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    const code = (codeRow as { code: string } | null)?.code;
    // No live code means nothing to link to and nothing being earned.
    if (!code) continue;

    const statement = await schoolStatement(code);
    // Nobody has used the code yet. A statement of zeroes is a worse first
    // impression than silence, and there is nothing for them to act on.
    if (!statement || statement.signedUp === 0) continue;

    const url = statementUrl(code);
    if (!url) {
      console.error("[partners] no statement secret configured; skipping statement emails");
      return sent;
    }

    const email = buildPartnerStatementEmail({
      schoolName: school.name,
      contactName: school.contact_name,
      signedUp: statement.signedUp,
      converted: statement.converted,
      pendingCents: statement.pendingCents,
      payableCents: statement.payableCents,
      paidCents: statement.paidCents,
      statementUrl: url,
    });

    try {
      await sendEmail({ to: school.contact_email, ...email });
    } catch (err) {
      // Leave the marker alone so tomorrow's run retries this school.
      console.error("[partners] statement send failed", school.id, err);
      continue;
    }
    // Marked only after the send actually succeeded.
    const { error: markError } = await admin
      .from("partner_schools")
      .update({ statement_month: month })
      .eq("id", school.id);
    if (markError) {
      console.error("[partners] statement marker failed; may resend", school.id, markError.message);
    }
    sent += 1;
  }

  if (sent > 0) console.error("[partners] monthly statements sent", sent);
  return sent;
}
