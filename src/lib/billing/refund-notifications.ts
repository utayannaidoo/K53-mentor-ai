import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail, type EmailMessage } from "@/lib/notify/email";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { buildRefundOperatorEmail } from "@/lib/notify/templates";

/** Persist before sending: a mail outage must not silently lose a refund request. */
export async function queueBillingEmail(admin: SupabaseClient, id: string, message: EmailMessage) {
  const { error } = await admin.from("billing_email_outbox").upsert(
    { id, message: { ...message, idempotencyKey: id } },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) throw new Error(`Could not record billing notification: ${error.message}`);
}

export async function notifyRefundOperator(
  admin: SupabaseClient,
  input: { reference: string; userId?: string; userEmail?: string; kind: "requested" | "attention" | "processed"; detail: string },
) {
  await queueBillingEmail(admin, `refund-${input.reference}-${input.kind}`, {
    to: SUPPORT_EMAIL,
    ...buildRefundOperatorEmail(input),
  });
}

/** Immediate send on request; unsent messages are also retried by the refund cron. */
export async function flushBillingEmails(admin: SupabaseClient, limit = 3, ids?: string[]) {
  let query = admin.from("billing_email_outbox").select("id,message")
    .is("sent_at", null).order("last_attempt_at", { ascending: true, nullsFirst: true }).limit(limit);
  if (ids) query = query.in("id", ids);
  const { data, error } = await query;
  if (error) throw new Error(`Billing notification queue unavailable: ${error.message}`);
  let sent = 0;
  for (const row of data ?? []) {
    const { error: attemptError } = await admin.from("billing_email_outbox")
      .update({ last_attempt_at: new Date().toISOString() }).eq("id", row.id);
    if (attemptError) throw new Error(`Billing notification checkpoint failed: ${attemptError.message}`);
    if (!await sendEmail(row.message as EmailMessage)) continue;
    const { error: writeError } = await admin.from("billing_email_outbox")
      .update({ sent_at: new Date().toISOString() }).eq("id", row.id);
    if (writeError) throw new Error(`Billing notification receipt failed: ${writeError.message}`);
    sent += 1;
  }
  return sent;
}
