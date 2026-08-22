import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { refundTransaction, verifyTransaction } from "@/lib/paystack/client";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildQueuedRefundAlertEmail, buildRefundProcessedEmail } from "@/lib/notify/templates";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The money-back retry queue.
 *
 * An instant refund can fail for reasons that resolve themselves — the classic
 * being Paystack's "Insufficient balance to process refund", which happens
 * whenever a settlement has paid out before a learner cancels inside the
 * 7-day window. Before this module existed that learner was told to email
 * support and wait for a human; the money came back only if someone noticed.
 *
 * Now a failed instant refund is queued here and a cron pass retries every row
 * until Paystack accepts. On success it applies exactly what the instant path
 * would have: the revoke (tier free, canceled, refunded_at) plus the learner's
 * confirmation email.
 *
 * Exactly-once is guaranteed by three layers:
 *   1. `money_back_used` stays latched when a refund is queued, so no manual
 *      re-cancel can race the cron for the same charge.
 *   2. `transaction_reference` is UNIQUE — one queue row per charge, ever.
 *   3. The downgrade matches `subscriptions.last_charge_reference`, so a
 *      learner who re-subscribed while their old refund was still queued never
 *      loses the NEW tier they paid for.
 */

/** Give up (and page ops) after roughly two weeks of daily retries. */
export const REFUND_MAX_ATTEMPTS = 14;
/** Rows processed per cron pass — volume here is tiny by construction. */
const MAX_ROWS_PER_PASS = 20;

export interface PendingRefundRow {
  id: string;
  user_id: string;
  transaction_reference: string;
  status: string;
  attempts: number;
  last_error: string | null;
}

type Admin = SupabaseClient;

/**
 * Queue one charge for automatic reversal.
 *
 * INSERT-ignore, deliberately NOT an upsert: a retried cancel must never
 * resurrect a row the cron has already settled — flipping a `refunded` row
 * back to `queued` would re-fire the refund for a charge that was already
 * reversed. An existing row of any status short-circuits to a read of its
 * current state.
 *
 * `ok: false` means the write itself failed — callers use that to decide
 * whether to release the money-back claim (manual retry stays possible) or
 * keep it latched (the cron now owns this refund).
 */
export async function queuePendingRefund(
  admin: Admin,
  input: { userId: string; reference: string; lastError?: string | null },
): Promise<{ ok: false } | { ok: true; rowStatus: PendingRefundRow["status"] }> {
  const { error } = await admin
    .from("pending_refunds")
    .upsert(
      {
        user_id: input.userId,
        transaction_reference: input.reference,
        status: "queued",
        last_error: input.lastError ?? null,
      },
      // INSERT-ignore via upsert: this project's supabase-js types don't carry
      // `ignoreDuplicates` on .insert(), and upsert + ignoreDuplicates +
      // onConflict compiles to ON CONFLICT (transaction_reference) DO NOTHING —
      // an existing row wins untouched, whatever its status. No merge ever
      // occurs, so a settled row can never be resurrected.
      { onConflict: "transaction_reference", ignoreDuplicates: true },
    );
  if (error) {
    console.error(
      `[refunds] could not queue ${input.reference} for user ${input.userId}: ${error.message}`,
    );
    return { ok: false };
  }

  const { data: row, error: readError } = await admin
    .from("pending_refunds")
    .select("id, user_id, transaction_reference, status, attempts, last_error")
    .eq("transaction_reference", input.reference)
    .maybeSingle();
  if (readError || !row) {
    // The insert landed (no error), so treat as queued — worst case the cron's
    // next pass sees the truth.
    console.error(`[refunds] queued ${input.reference} but the follow-up read failed`);
    return { ok: true, rowStatus: "queued" };
  }

  const queuedRow = row as PendingRefundRow;
  if (queuedRow.status === "queued") {
    // Freshest refusal wins on an already-pending row — pure observability.
    await markAttempt(admin, queuedRow.id, queuedRow.attempts, input.lastError ?? "");
  }
  console.error(
    `[refunds] queue state for ${input.reference}: ${queuedRow.status}`,
  );
  return { ok: true, rowStatus: queuedRow.status };
}

/**
 * One cron pass. Retries every queued row once, oldest first. Never throws:
 * each row's failure is recorded on the row, and a Paystack/DB hiccup for one
 * charge must not stall the rest of the queue.
 */
export async function processPendingRefunds(admin: Admin): Promise<{
  attempted: number;
  refunded: number;
  failed: number;
  waiting: number;
}> {
  const summary = { attempted: 0, refunded: 0, failed: 0, waiting: 0 };

  const { data, error } = await admin
    .from("pending_refunds")
    .select("id, user_id, transaction_reference, status, attempts, last_error")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(MAX_ROWS_PER_PASS);
  if (error) {
    console.error("[refunds] queue read failed:", error.message);
    return summary;
  }

  const rows = (data ?? []) as PendingRefundRow[];
  for (const row of rows) {
    if (row.attempts >= REFUND_MAX_ATTEMPTS) {
      // Exhausted without success — stop burning attempts silently. The row
      // stays as the audit trail; support gets exactly one nudge via the
      // failure marker in the logs below (and the alert email).
      await admin
        .from("pending_refunds")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", row.id)
        .eq("status", "queued");
      summary.failed += 1;
      console.error(
        `[refunds] GAVE UP on ${row.transaction_reference} after ${row.attempts} attempts — manual refund owed to user ${row.user_id}`,
      );
      await sendSupportAlert(row, row.last_error).catch(() => {});
      continue;
    }

    summary.attempted += 1;
    try {
      await refundTransaction(row.transaction_reference, {
        merchantNote: "K53 Mentor 7-day money-back cancellation",
        customerNote: "Full refund of your most recent K53 Mentor payment.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Not fatal by design: insufficient balance resolves when the next
      // settlement lands, which is precisely what this loop waits out.
      await markAttempt(admin, row.id, row.attempts + 1, message);
      summary.waiting += 1;
      console.error(`[refunds] retry ${row.attempts + 1} failed for ${row.transaction_reference}: ${message}`);
      continue;
    }

    // Money is back with the learner. Mark the row FIRST — the downgrade and
    // email are best-effort follow-ups, but the queue state must reflect
    // reality even if everything after this line fails (the webhook's
    // refund.processed event also converges the tier independently).
    await admin
      .from("pending_refunds")
      .update({ status: "refunded", refunded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", row.id);
    summary.refunded += 1;

    await downgradeIfStillCurrentCharge(admin, row);
    await notifyLearner(row).catch(() => {});
  }

  return summary;
}

async function markAttempt(admin: Admin, id: string, attempts: number, lastError: string) {
  await admin
    .from("pending_refunds")
    .update({ attempts, last_error: lastError.slice(0, 500), updated_at: new Date().toISOString() })
    .eq("id", id);
}

/**
 * Apply the revoke ONLY while the subscription row still names this exact
 * charge as its most recent payment. A learner who re-subscribed while their
 * old refund sat queued has a new `last_charge_reference` — stripping their
 * tier because of the old refund would take away something they paid for.
 */
async function downgradeIfStillCurrentCharge(admin: Admin, row: PendingRefundRow) {
  const { error } = await admin
    .from("subscriptions")
    .update({
      tier: "free",
      status: "canceled",
      refunded_at: new Date().toISOString(),
      cancel_at_period_end: false,
    })
    .eq("user_id", row.user_id)
    .eq("last_charge_reference", row.transaction_reference)
    .neq("tier", "free");
  if (error) {
    console.error(
      `[refunds] downgrade after queued refund of ${row.transaction_reference} failed: ${error.message}`,
    );
  }
}

/** Learner confirmation, best-effort. Resolves name/email via the service-role client. */
async function notifyLearner(row: PendingRefundRow) {
  let amountCents: number | null = null;
  try {
    const tx = await verifyTransaction(row.transaction_reference);
    amountCents = typeof tx.amount === "number" ? tx.amount : null;
  } catch {
    // Cosmetic only — the refund itself already succeeded.
  }
  const admin = createAdminClient();
  if (!admin) return;
  const { data: profile } = await admin
    .from("profiles")
    .select("email, first_name")
    .eq("id", row.user_id)
    .maybeSingle();
  const email = (profile as { email?: string } | null)?.email;
  if (!isEmailConfigured || !email) return;

  const mail = buildRefundProcessedEmail({
    firstName: (profile as { first_name?: string | null } | null)?.first_name ?? "",
    amountZar: amountCents !== null ? amountCents / 100 : null,
  });
  await sendEmail({ to: email, ...mail });
}

async function sendSupportAlert(row: PendingRefundRow, lastError: string | null) {
  if (!isEmailConfigured) return;
  const mail = buildQueuedRefundAlertEmail({
    reference: row.transaction_reference,
    userId: row.user_id,
    attempts: row.attempts,
    lastError,
  });
  await sendEmail({ to: SUPPORT_EMAIL, ...mail }).catch(() => {});
}
