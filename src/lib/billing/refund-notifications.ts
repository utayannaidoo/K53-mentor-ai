import "server-only";
import { createHash } from "node:crypto";
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

/**
 * Outbox id for one operator alert. Requested/processed happen once per charge.
 * Attention can happen several times, so its id also carries the problem: the
 * same refusal on every daily retry stays one email, while a different problem
 * later (retries exhausted, Paystack failing an accepted refund) is a new one.
 */
export function refundOperatorAlertId(reference: string, kind: "requested" | "attention" | "processed", detail: string) {
  if (kind !== "attention") return `refund-${reference}-${kind}`;
  return `refund-${reference}-attention-${createHash("sha256").update(detail).digest("hex").slice(0, 12)}`;
}

export async function notifyRefundOperator(
  admin: SupabaseClient,
  input: { reference: string; userId?: string; userEmail?: string; kind: "requested" | "attention" | "processed"; detail: string },
) {
  await queueBillingEmail(admin, refundOperatorAlertId(input.reference, input.kind, input.detail), {
    to: SUPPORT_EMAIL,
    ...buildRefundOperatorEmail(input),
  });
}

/**
 * Immediate send on request; unsent messages are also retried by the refund cron.
 * `scope` narrows the send to exact ids, or to every id under a prefix (one
 * charge's mail is `refund-<reference>-…`).
 */
export async function flushBillingEmails(admin: SupabaseClient, limit = 3, scope?: string[] | { prefix: string }) {
  let query = admin.from("billing_email_outbox").select("id,message")
    .is("sent_at", null).order("last_attempt_at", { ascending: true, nullsFirst: true }).limit(limit);
  if (Array.isArray(scope)) query = query.in("id", scope);
  // LIKE wildcards inside a reference can only widen the match to other unsent
  // billing mail, which is owed a send anyway.
  else if (scope) query = query.like("id", `${scope.prefix}%`);
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
