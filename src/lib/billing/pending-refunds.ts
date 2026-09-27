import "server-only";
import { voidMoneyBackCommission } from "@/lib/billing/subscription-cancel";
import type { SupabaseClient } from "@supabase/supabase-js";
import { refundTransaction, verifyTransaction } from "@/lib/paystack/client";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import {
  buildManualRefundEmail,
  buildQueuedRefundAlertEmail,
  buildRefundProcessedEmail,
  buildStuckRefundAlertEmail,
} from "@/lib/notify/templates";
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
 *
 * Waiting is not always enough. In South Africa Paystack pays takings out after
 * two working days and a refund can only draw on what is still unpaid, so on a
 * quiet week no amount of retrying finds the money. Support is paged after
 * REFUND_ESCALATE_AFTER_ATTEMPTS failed retries, not only when the queue gives
 * up, and /admin/refunds can settle a row by hand: retry it once a top-up or
 * new sales cover it, or stop the retries, repay by EFT and record that.
 */

/** Give up (and page ops) after roughly two weeks of daily retries. */
export const REFUND_MAX_ATTEMPTS = 14;
/**
 * Page support once a queued refund has failed this many daily retries. Two is
 * past the point where fresh sales would normally have covered it, and early
 * enough to repay by EFT before the date the learner was promised.
 */
export const REFUND_ESCALATE_AFTER_ATTEMPTS = 2;
/** Attached to every refund this module requests, so the dashboard line explains itself. */
const REFUND_NOTES = {
  merchantNote: "K53 Mentor 7-day money-back cancellation",
  customerNote: "Full refund of your most recent K53 Mentor payment.",
};
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
 * Rescue the one legacy state that predates the retry queue.
 *
 * Before `pending_refunds` existed, a cancellation could successfully claim
 * `money_back_used`, have Paystack refuse the refund, and then fail to release
 * that claim. The subscription was correctly made non-renewing, but no retry
 * record existed — so neither the learner nor the daily cron could ever get
 * the money moving again.
 *
 * This combination is otherwise impossible in the current flow:
 *
 *  - a successful refund immediately makes the subscription free; and
 *  - a refused refund always creates a pending-refund row before returning.
 *
 * It is therefore safe to turn a paid, non-renewing, claimed subscription
 * with no queue row into the same durable queue the modern path uses. The
 * unique transaction reference remains the final race guard.
 */
async function recoverOrphanedRefundClaims(admin: Admin): Promise<number> {
  const { data, error } = await admin
    .from("subscriptions")
    .select("user_id, last_charge_reference")
    .eq("money_back_used", true)
    .eq("cancel_at_period_end", true)
    .neq("tier", "free")
    .limit(MAX_ROWS_PER_PASS);
  if (error) {
    console.error("[refunds] could not inspect legacy refund claims:", error.message);
    return 0;
  }

  let recovered = 0;
  for (const candidate of (data ?? []) as Array<{
    user_id: string;
    last_charge_reference: string | null;
  }>) {
    if (!candidate.last_charge_reference) continue;

    // A present row is already owned by the normal queue. Avoid overwriting
    // its last Paystack refusal merely because the recovery sweep saw it.
    const { data: existing, error: existingError } = await admin
      .from("pending_refunds")
      .select("id")
      .eq("transaction_reference", candidate.last_charge_reference)
      .maybeSingle();
    if (existingError) {
      console.error(
        `[refunds] could not check legacy claim ${candidate.last_charge_reference}: ${existingError.message}`,
      );
      continue;
    }
    if (existing) continue;

    const queued = await queuePendingRefund(admin, {
      userId: candidate.user_id,
      reference: candidate.last_charge_reference,
      lastError: "Recovered a legacy refund claim that had no retry record.",
    });
    if (queued.ok && queued.rowStatus === "queued") recovered += 1;
  }
  return recovered;
}

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
  recovered: number;
}> {
  const summary = { attempted: 0, refunded: 0, failed: 0, waiting: 0, recovered: 0 };

  // Run this before reading queued rows so a pre-queue cancellation is not
  // stranded for another day. It does not call Paystack itself; every payment
  // attempt still travels through the single, audited loop below.
  summary.recovered = await recoverOrphanedRefundClaims(admin);

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
      await refundTransaction(row.transaction_reference, REFUND_NOTES);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const attempts = row.attempts + 1;
      // Not fatal by design: insufficient balance resolves when new sales
      // land, which is what this loop waits out. It pages support once, early,
      // in case they don't.
      await markAttempt(admin, row.id, attempts, message);
      summary.waiting += 1;
      console.error(`[refunds] retry ${attempts} failed for ${row.transaction_reference}: ${message}`);
      if (attempts === REFUND_ESCALATE_AFTER_ATTEMPTS) {
        await sendStuckRefundAlert({ ...row, attempts }, message).catch(() => {});
      }
      continue;
    }

    // Money is back with the learner. Mark the row FIRST — the downgrade and
    // email are best-effort follow-ups, but the queue state must reflect
    // reality even if everything after this line fails (the webhook's
    // refund.processed event also converges the tier independently).
    await markRefunded(admin, row.id);
    summary.refunded += 1;
    await afterRefund(admin, row, "paystack");
  }

  return summary;
}

async function markRefunded(admin: Admin, id: string) {
  const now = new Date().toISOString();
  await admin
    .from("pending_refunds")
    .update({ status: "refunded", refunded_at: now, updated_at: now })
    .eq("id", id);
}

/**
 * Everything owed once the money is back: the guarded revoke, then the
 * learner's email. True when that email actually went.
 */
async function afterRefund(
  admin: Admin,
  row: PendingRefundRow,
  via: "paystack" | "eft",
): Promise<boolean> {
  await downgradeIfStillCurrentCharge(admin, row);
  return notifyLearner(row, via).catch(() => false);
}

/** The tail of an admin result: whether the learner heard, or that they still need to. */
function told(emailed: boolean): string {
  return emailed ? "The learner has been emailed." : "No email went out, so let the learner know yourself.";
}

// ── Settling a row by hand (/admin/refunds) ──────────────────────────────────
//
// Each returns a sentence for the admin form rather than throwing: a money
// screen must say whether the click landed.

export type AdminRefundResult = { ok: boolean; message: string };

export interface AdminRefundRow extends PendingRefundRow {
  created_at: string;
  refunded_at: string | null;
  manual_reference: string | null;
  manual_recorded_by: string | null;
  email: string | null;
  name: string | null;
  /** The charge in cents, from Paystack. Null when it couldn't be read. */
  amountCents: number | null;
}

const ADMIN_COLUMNS =
  "id, user_id, transaction_reference, status, attempts, last_error, created_at, refunded_at, manual_reference, manual_recorded_by";
/** How far back the admin page shows settled refunds. */
const SETTLED_LOOKBACK_DAYS = 30;

/**
 * What /admin/refunds draws: every row still owed (queued or stopped), oldest
 * first, and the last month's settled ones as a record of how each went back.
 */
export async function refundsForAdmin(
  admin: Admin,
): Promise<{ ok: true; open: AdminRefundRow[]; settled: AdminRefundRow[] } | { ok: false; message: string }> {
  const since = new Date(Date.now() - SETTLED_LOOKBACK_DAYS * 86_400_000).toISOString();
  const [openRead, settledRead] = await Promise.all([
    admin
      .from("pending_refunds")
      .select(ADMIN_COLUMNS)
      .in("status", ["queued", "failed"])
      .order("created_at", { ascending: true }),
    admin
      .from("pending_refunds")
      .select(ADMIN_COLUMNS)
      .eq("status", "refunded")
      .gte("refunded_at", since)
      .order("refunded_at", { ascending: false })
      .limit(20),
  ]);
  const readError = openRead.error ?? settledRead.error;
  if (readError) {
    console.error("[refunds] admin read failed:", readError.message);
    return { ok: false, message: readError.message };
  }
  type Base = Omit<AdminRefundRow, "email" | "name" | "amountCents">;
  const open = (openRead.data ?? []) as unknown as Base[];
  const settled = (settledRead.data ?? []) as unknown as Base[];

  const userIds = [...new Set([...open, ...settled].map((row) => row.user_id))];
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, email, full_name").in("id", userIds)
    : { data: [] };
  const who = new Map(
    ((profiles ?? []) as { id: string; email: string | null; full_name: string | null }[]).map(
      (profile) => [profile.id, profile],
    ),
  );
  // Only the rows still owed need an amount: it is what the admin is about to
  // send by EFT. A Paystack hiccup leaves it blank rather than failing the page.
  const amounts = await Promise.all(
    open.map((row) =>
      verifyTransaction(row.transaction_reference)
        .then((tx) => (typeof tx.amount === "number" ? tx.amount : null))
        .catch(() => null),
    ),
  );
  const decorate = (row: Base, amountCents: number | null): AdminRefundRow => ({
    ...row,
    email: who.get(row.user_id)?.email ?? null,
    name: who.get(row.user_id)?.full_name ?? null,
    amountCents,
  });
  return {
    ok: true,
    open: open.map((row, i) => decorate(row, amounts[i])),
    settled: settled.map((row) => decorate(row, null)),
  };
}

async function readRow(admin: Admin, id: string): Promise<PendingRefundRow | null> {
  const { data } = await admin
    .from("pending_refunds")
    .select("id, user_id, transaction_reference, status, attempts, last_error")
    .eq("id", id)
    .maybeSingle();
  return (data as PendingRefundRow | null) ?? null;
}

/**
 * One Paystack attempt now, for a queued or stopped row: the admin has topped
 * up the balance or seen new sales land and does not want to wait for 03:00.
 * A refusal is recorded but not counted against REFUND_MAX_ATTEMPTS, which
 * paces the cron, not the person checking whether their top-up arrived.
 */
export async function retryRefundNow(admin: Admin, id: string): Promise<AdminRefundResult> {
  const row = await readRow(admin, id);
  if (!row) return { ok: false, message: "That refund no longer exists." };
  if (row.status === "refunded") return { ok: false, message: "It has already been refunded." };
  try {
    await refundTransaction(row.transaction_reference, REFUND_NOTES);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin
      .from("pending_refunds")
      .update({ last_error: message.slice(0, 500), updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return { ok: false, message: `Paystack refused it: ${message}` };
  }
  await markRefunded(admin, row.id);
  const emailed = await afterRefund(admin, row, "paystack");
  return { ok: true, message: `Paystack accepted the refund. ${told(emailed)}` };
}

/**
 * Take a queued row away from the cron, so the admin can repay by EFT without
 * Paystack refunding the same charge the next morning. Only a queued row can
 * be stopped; the compare-and-set on status is what makes that true.
 */
export async function stopRefundRetries(
  admin: Admin,
  id: string,
  by: string,
): Promise<AdminRefundResult> {
  const row = await readRow(admin, id);
  if (!row || row.status !== "queued") {
    return { ok: false, message: "Only a refund that is still retrying can be stopped." };
  }
  const note = `Automatic retries stopped by ${by} to repay by EFT. Last Paystack error: ${row.last_error ?? "none"}`;
  const { data, error } = await admin
    .from("pending_refunds")
    .update({ status: "failed", last_error: note.slice(0, 500), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "queued")
    .select("id");
  if (error || !data?.length) {
    if (error) console.error(`[refunds] could not stop ${row.transaction_reference}: ${error.message}`);
    return { ok: false, message: "Could not stop it. Reload and try again." };
  }
  return { ok: true, message: "Stopped. Pay the learner by EFT, then record it here." };
}

/**
 * Record that the admin repaid the learner outside Paystack, then do what a
 * Paystack refund would have: end the plan (guarded), void the commission,
 * email the learner. A queued row is refused: the cron could still refund it
 * through Paystack, and the learner would be paid twice.
 */
export async function recordManualRefund(
  admin: Admin,
  id: string,
  input: { reference: string; by: string },
): Promise<AdminRefundResult> {
  const row = await readRow(admin, id);
  if (!row) return { ok: false, message: "That refund no longer exists." };
  if (row.status === "queued") {
    return { ok: false, message: "Stop the automatic retries first, so Paystack can't refund it as well." };
  }
  if (row.status !== "failed") return { ok: false, message: "It has already been refunded." };
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("pending_refunds")
    .update({
      status: "refunded",
      refunded_at: now,
      updated_at: now,
      manual_reference: input.reference,
      manual_recorded_by: input.by,
    })
    .eq("id", id)
    .eq("status", "failed")
    .select("id");
  if (error || !data?.length) {
    if (error) console.error(`[refunds] could not record ${row.transaction_reference}: ${error.message}`);
    return { ok: false, message: "Could not record it. Reload and try again." };
  }
  const emailed = await afterRefund(admin, row, "eft");
  return { ok: true, message: `Recorded against ${input.reference}. ${told(emailed)}` };
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
  await voidMoneyBackCommission(admin, row.transaction_reference);
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

/**
 * Learner confirmation, best-effort. Resolves name/email via the service-role
 * client. `via` picks the wording: a Paystack refund goes back to the card, an
 * EFT repayment is already in their bank account. True when the email went.
 */
async function notifyLearner(row: PendingRefundRow, via: "paystack" | "eft"): Promise<boolean> {
  let amountCents: number | null = null;
  try {
    const tx = await verifyTransaction(row.transaction_reference);
    amountCents = typeof tx.amount === "number" ? tx.amount : null;
  } catch {
    // Cosmetic only — the refund itself already succeeded.
  }
  const admin = createAdminClient();
  if (!admin) return false;
  // `profiles` carries `full_name` — there is no `first_name` column, and
  // selecting it makes PostgREST error the whole read, so the learner
  // confirmation silently never sent.
  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", row.user_id)
    .maybeSingle();
  const email = (profile as { email?: string } | null)?.email;
  if (!isEmailConfigured || !email) return false;

  const content = {
    firstName: ((profile as { full_name?: string | null } | null)?.full_name ?? "")
      .trim()
      .split(/\s+/)[0] ?? "",
    amountZar: amountCents !== null ? amountCents / 100 : null,
  };
  const mail = via === "eft" ? buildManualRefundEmail(content) : buildRefundProcessedEmail(content);
  return sendEmail({ to: email, ...mail });
}

async function sendStuckRefundAlert(row: PendingRefundRow, lastError: string) {
  if (!isEmailConfigured) return;
  const mail = buildStuckRefundAlertEmail({
    reference: row.transaction_reference,
    userId: row.user_id,
    attempts: row.attempts,
    lastError,
  });
  await sendEmail({ to: SUPPORT_EMAIL, ...mail }).catch(() => {});
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
