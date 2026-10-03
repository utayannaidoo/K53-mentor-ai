import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { voidMoneyBackCommission } from "@/lib/billing/subscription-cancel";
import {
  fetchRefund,
  listTransactionRefunds,
  PaystackError,
  refundTransaction,
  verifyTransaction,
  type PaystackRefund,
  type VerifyTransactionResult,
} from "@/lib/paystack/client";
import { buildRefundProcessedEmail } from "@/lib/notify/templates";
import { notifyRefundOperator, queueBillingEmail } from "@/lib/billing/refund-notifications";
import { routeSchoolEvent } from "@/lib/billing/school-billing";

/**
 * The money-back refund lifecycle: one durable `pending_refunds` row per
 * charge, moved by the cancel route, the daily refund cron, Paystack's refund
 * webhooks and /admin/refunds. Statuses:
 *
 *  - queued: safe to submit (nothing is in flight at Paystack)
 *  - submitting: one attempt owns the row; its outcome may be uncertain
 *  - processing: Paystack accepted a refund, not yet confirmed processed
 *  - needs_attention / failed: parked for a person (docs/ops/refund-recovery.md)
 *  - refunded: confirmed processed, or an EFT repayment an admin recorded
 *
 * Three rules hold the rest up:
 *  1. The row is written BEFORE Paystack is asked to move money, so a crash
 *     can never leave a refund nothing knows about.
 *  2. A POST whose outcome is uncertain (timeout, 5xx) is never repeated
 *     blindly: every submission first reads Paystack's refund history for the
 *     charge and adopts a refund that already exists.
 *  3. Access ends only on a CONFIRMED processed refund of the full amount, and
 *     only while that charge is still the learner's latest payment. A newer
 *     purchase or a tutor top-up is never revoked by an old refund.
 */

/** Daily cron attempts before a queued refund stops retrying (about two weeks). */
export const REFUND_MAX_ATTEMPTS = 14;
/** How long a submitting row is presumed to have a live request behind it (the cancel route's maxDuration). */
export const SUBMITTING_STALE_MS = 120_000;
/** One cron pass stops starting new rows after this, well inside the route's 300s maxDuration. */
const CRON_PASS_BUDGET_MS = 180_000;
/** Rows one cron pass looks at. Volume is tiny by construction. */
const MAX_ROWS_PER_PASS = 20;

export type RefundStatus = "queued" | "submitting" | "processing" | "needs_attention" | "refunded" | "failed";
export interface PendingRefundRow {
  id: string;
  user_id: string;
  transaction_reference: string;
  status: RefundStatus;
  attempts: number;
  last_error: string | null;
  provider_refund_id: number | null;
  updated_at: string;
  manual_reference?: string | null;
}
type Admin = SupabaseClient;

async function readRefund(admin: Admin, reference: string) {
  const { data, error } = await admin
    .from("pending_refunds")
    .select("*")
    .eq("transaction_reference", reference)
    .maybeSingle();
  if (error) throw new Error(`Refund read failed: ${error.message}`);
  return data as PendingRefundRow | null;
}

/**
 * Record a charge as owed before any money moves (rule 1).
 *
 * INSERT-ignore via upsert + ignoreDuplicates: an existing row wins untouched,
 * whatever its status, so a retried cancel can never resurrect a settled row
 * and re-fire its refund.
 */
export async function queuePendingRefund(
  admin: Admin,
  input: { userId: string; reference: string; lastError?: string | null },
): Promise<{ ok: false } | { ok: true; rowStatus: RefundStatus }> {
  const { error } = await admin.from("pending_refunds").upsert(
    {
      user_id: input.userId,
      transaction_reference: input.reference,
      status: "queued",
      last_error: input.lastError ?? null,
    },
    { onConflict: "transaction_reference", ignoreDuplicates: true },
  );
  if (error) return { ok: false };
  const row = await readRefund(admin, input.reference);
  return row ? { ok: true, rowStatus: row.status } : { ok: false };
}

/** Park a row for a person and tell support why. A settled row is never touched. */
async function attention(
  admin: Admin,
  row: PendingRefundRow,
  detail: string,
  status: "failed" | "needs_attention" = "needs_attention",
) {
  await notifyRefundOperator(admin, {
    reference: row.transaction_reference,
    userId: row.user_id,
    kind: "attention",
    detail,
  });
  const { error } = await admin
    .from("pending_refunds")
    .update({ status, last_error: detail.slice(0, 500), updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .neq("status", "refunded");
  if (error) throw new Error(`Refund attention write failed: ${error.message}`);
  return (await readRefund(admin, row.transaction_reference))?.status ?? status;
}

/** What school routing needs to recognise a school charge that is no longer its latest one. */
function schoolEvidence(charge: VerifyTransactionResult) {
  return {
    planCode: typeof charge.plan === "string" ? charge.plan : (charge.plan?.plan_code ?? null),
    customerCode: charge.customer?.customer_code ?? null,
  };
}

/**
 * Everything a confirmed, full refund settles (rule 3): the matching plan
 * ends, any partner commission on the charge is voided, support and the
 * learner are told, and the row is marked refunded.
 *
 * `charge` is the verified transaction when the caller already has one. School
 * routing needs its plan and customer: a school's older charge is not findable
 * by reference alone, and its refund would otherwise leave the school plan
 * running. Without one, Paystack is asked here; if it can't answer, routing
 * falls back to the reference, which still finds a school's latest charge.
 */
export async function completeRefund(
  admin: Admin,
  reference: string,
  amountCents?: number,
  charge?: VerifyTransactionResult,
) {
  const row = await readRefund(admin, reference);
  // Repaid by EFT and recorded by an admin, which already ran these follow-ups.
  if (row?.manual_reference) return;

  let evidence: ReturnType<typeof schoolEvidence> | Record<string, never> = charge ? schoolEvidence(charge) : {};
  if (!charge) {
    try {
      evidence = schoolEvidence(await verifyTransaction(reference));
    } catch (error) {
      console.error(`[refunds] charge lookup for ${reference} failed; routing the refund by reference`, error);
    }
  }
  // A refunded school-credit month keeps its plan (0042); any other school
  // refund ends the school's plan, never the owner's learner tier.
  const school = await routeSchoolEvent(admin, "refund.processed", { reference, ...evidence });
  if (school !== "school") {
    // Keyed on the exact charge: an old refund cannot revoke a newer purchase,
    // and a tutor top-up never lands in last_charge_reference.
    const { error } = await admin
      .from("subscriptions")
      .update({
        tier: "free",
        status: "canceled",
        refunded_at: new Date().toISOString(),
        cancel_at_period_end: false,
      })
      .eq("last_charge_reference", reference)
      .neq("tier", "free");
    if (error) throw new Error(`Refund downgrade failed: ${error.message}`);
  }
  await voidMoneyBackCommission(admin, reference);
  await notifyRefundOperator(admin, {
    reference,
    userId: row?.user_id,
    kind: "processed",
    detail: "Paystack confirmed processing is complete. Bank clearance may still take 5–10 business days.",
  });

  // A refund issued outside the queue (the Paystack dashboard) has no row and
  // no learner to email from here; the downgrade above is all it needs.
  if (!row) return;
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("email,full_name")
    .eq("id", row.user_id)
    .maybeSingle();
  if (profileError) throw new Error(`Refund receipt lookup failed: ${profileError.message}`);
  if (profile?.email) {
    await queueBillingEmail(admin, `refund-${reference}-customer-processed`, {
      to: profile.email,
      ...buildRefundProcessedEmail({
        firstName: (profile.full_name ?? "").trim().split(/\s+/)[0],
        amountZar: amountCents == null ? null : amountCents / 100,
      }),
    });
  }
  const now = new Date().toISOString();
  const { error: writeError } = await admin
    .from("pending_refunds")
    .update({ status: "refunded", refunded_at: now, updated_at: now, last_error: null })
    .eq("id", row.id);
  if (writeError) throw new Error(`Refund completion write failed: ${writeError.message}`);
}

/** Apply what Paystack says about one refund (a POST response, a history entry or a fetch). */
async function applyProviderRefund(admin: Admin, row: PendingRefundRow, result: PaystackRefund): Promise<RefundStatus> {
  if (!result?.id || !result.status) {
    return attention(admin, row, "Paystack returned an incomplete refund response. Check the provider before retrying.");
  }
  if ((await readRefund(admin, row.transaction_reference))?.status === "refunded") return "refunded";
  const { error } = await admin
    .from("pending_refunds")
    .update({ provider_refund_id: result.id })
    .eq("id", row.id)
    .neq("status", "refunded");
  if (error) throw new Error(`Refund provider ID write failed: ${error.message}`);

  if (result.status === "processed") {
    const transaction = await verifyTransaction(row.transaction_reference);
    if (result.amount !== transaction.amount) {
      return attention(
        admin,
        row,
        "Refund amount could not be confirmed as the full payment. Reconcile in Paystack before changing access.",
      );
    }
    await completeRefund(admin, row.transaction_reference, result.amount, transaction);
    return "refunded";
  }
  if (result.status === "failed" || result.status === "needs-attention") {
    return attention(
      admin,
      row,
      `Paystack refund ${result.id}: ${result.status}. Review in Paystack before retrying.`,
      result.status === "failed" ? "failed" : "needs_attention",
    );
  }
  // pending / processing: accepted, not yet money back.
  const { error: pendingError } = await admin
    .from("pending_refunds")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .in("status", ["queued", "submitting", "processing"]);
  if (pendingError) throw new Error(`Refund processing write failed: ${pendingError.message}`);
  return (await readRefund(admin, row.transaction_reference))?.status ?? "processing";
}

/**
 * Atomic queued → submitting claim, then at most one POST (rule 2).
 *
 * `manual` is an admin's one checked attempt from /admin/refunds: it is not
 * counted against REFUND_MAX_ATTEMPTS (that budget paces the cron, not a person
 * checking whether their balance top-up arrived) and it may run on a row the
 * cron has given up on.
 */
export async function processRefund(
  admin: Admin,
  reference: string,
  opts: { manual?: boolean } = {},
): Promise<RefundStatus> {
  const row = await readRefund(admin, reference);
  if (!row) throw new Error("Refund request missing");
  if (["refunded", "failed", "needs_attention"].includes(row.status)) return row.status;
  if (row.status === "submitting") {
    if (Date.now() - Date.parse(row.updated_at) > SUBMITTING_STALE_MS) {
      return attention(admin, row, "Refund submission was interrupted. Verify its status in Paystack before retrying.");
    }
    return "submitting";
  }
  if (row.status === "processing") {
    if (!row.provider_refund_id) {
      return attention(admin, row, "Refund accepted without a stored provider ID. Reconcile in Paystack.");
    }
    return applyProviderRefund(admin, row, await fetchRefund(row.provider_refund_id));
  }
  if (!opts.manual && row.attempts >= REFUND_MAX_ATTEMPTS) {
    // Worded apart from the last refusal, so this alert is not deduplicated
    // against the one that refusal already sent (see refundOperatorAlertId).
    return attention(
      admin,
      row,
      `Automatic retries stopped after ${row.attempts} attempts. Last error: ${row.last_error ?? "none recorded"}`,
      "failed",
    );
  }

  // The claim: only one of any number of racing callers (two cancel taps, the
  // cron, an admin) moves the row out of queued, and only that one may POST.
  const { data: claim, error } = await admin
    .from("pending_refunds")
    .update({
      status: "submitting",
      attempts: opts.manual ? row.attempts : row.attempts + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("status", "queued")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Refund claim failed: ${error.message}`);
  if (!claim) return (await readRefund(admin, reference))?.status ?? "submitting";

  /** Set the moment the POST is sent: from then on, a failure means "outcome unknown". */
  let submitted = false;
  try {
    const tx = await verifyTransaction(reference);
    // A refund Paystack marked failed moved no money, so it neither blocks a
    // fresh submission nor counts as an existing one.
    const refunds = (await listTransactionRefunds(tx.id)).filter((refund) => refund.status !== "failed");
    if (refunds.length) {
      if (refunds.length !== 1 || refunds[0].amount !== tx.amount) {
        return attention(admin, row, "Existing partial or multiple refunds found. Reconcile the remaining amount manually.");
      }
      return await applyProviderRefund(admin, row, refunds[0]);
    }
    if (tx.status !== "success") {
      return attention(admin, row, `Transaction status is ${tx.status}; no new refund was submitted.`);
    }
    submitted = true;
    const result = await refundTransaction(reference, {
      merchantNote: "K53 Mentor 7-day money-back cancellation",
      customerNote: "Full refund of your most recent K53 Mentor payment.",
    });
    return await applyProviderRefund(admin, row, result);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    // An explicit refusal proves Paystack did not accept the POST. "Insufficient
    // balance" is the classic: it clears once new sales land, which is what the
    // daily retry waits out.
    const noFunds =
      err instanceof PaystackError && err.httpStatus >= 400 && err.httpStatus < 500 && /insufficient balance/i.test(detail);
    if (!submitted || noFunds) {
      await notifyRefundOperator(admin, { reference, userId: row.user_id, kind: "attention", detail });
      const { error: retryError } = await admin
        .from("pending_refunds")
        .update({ status: "queued", last_error: detail.slice(0, 500), updated_at: new Date().toISOString() })
        .eq("id", row.id)
        .eq("status", "submitting");
      if (retryError) throw new Error(`Refund retry write failed: ${retryError.message}`);
      return (await readRefund(admin, reference))?.status ?? "queued";
    }
    // Sent, then lost (timeout, 5xx): Paystack may have accepted it. Park it.
    return attention(admin, row, detail);
  }
}

/**
 * One Paystack refund webhook. Every transition is keyed on the row's status,
 * so redeliveries converge and a late pending event cannot undo a completion.
 */
export async function applyRefundEvent(
  admin: Admin,
  event: string,
  data: { transaction_reference?: string; transaction?: { reference?: string }; amount?: number | string; id?: number },
) {
  const reference = data.transaction_reference ?? data.transaction?.reference;
  if (!reference) {
    // Nothing to match it to. Failing would only make Paystack redeliver the
    // same unmatchable event for days, so it is acknowledged and logged.
    console.error(`[refunds] ${event} without a transaction reference (refund ${data.id ?? "unknown"}); not applied`);
    return;
  }
  const row = await readRefund(admin, reference);
  if (row?.status === "refunded") return;

  if (event === "refund.processed") {
    let charge: VerifyTransactionResult | undefined;
    if (data.amount != null) {
      charge = await verifyTransaction(reference);
      if (Number(data.amount) !== charge.amount) {
        // A partial refund keeps access: the learner still holds part of a payment.
        if (row) await attention(admin, row, "Partial refund processed; manual reconciliation required.");
        else {
          await notifyRefundOperator(admin, {
            reference,
            kind: "attention",
            detail: "Partial refund processed. Paid access was preserved; review the remaining amount.",
          });
        }
        return;
      }
    }
    await completeRefund(admin, reference, data.amount == null ? undefined : Number(data.amount), charge);
  } else if (event === "refund.failed" || event === "refund.needs-attention") {
    if (row) {
      await attention(
        admin,
        row,
        `Paystack reported ${event}. Review the payment in Paystack.`,
        event === "refund.failed" ? "failed" : "needs_attention",
      );
    } else {
      await notifyRefundOperator(admin, {
        reference,
        kind: "attention",
        detail: `Paystack reported ${event} for a refund outside the app queue.`,
      });
    }
  } else if (row) {
    // refund.pending / refund.processing: accepted, not yet money back.
    const { error } = await admin
      .from("pending_refunds")
      .update({
        status: "processing",
        ...(data.id ? { provider_refund_id: data.id } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .in("status", ["queued", "submitting", "processing"]);
    if (error) throw new Error(`Refund event write failed: ${error.message}`);
  }
}

/** How far back the sweep looks for a cancellation that died mid-claim. Days of missed cron runs, not weeks. */
const RECOVERY_LOOKBACK_MS = 14 * 86_400_000;
/** Younger requests may still be inside their own cancel request (maxDuration 120s). */
const RECOVERY_SETTLE_MS = 10 * 60_000;

/**
 * A cancellation that claimed the guarantee and then died before writing its
 * refund row. The cancel route records its "refund requested" notice BEFORE it
 * claims, so a recent notice with no row, on a subscription whose claim still
 * names that charge, is exactly that crash.
 *
 * Deliberately NOT driven by `money_back_used` alone: the flag is lifetime, so
 * a learner who used the guarantee once, resubscribed and later cancelled the
 * normal way looks identical on the subscription row and would be flagged for
 * a refund nobody owes them.
 */
async function recoverInterruptedClaims(admin: Admin): Promise<number> {
  const now = Date.now();
  const requests = await admin
    .from("billing_email_outbox")
    .select("id")
    .like("id", "refund-%-requested")
    .gte("created_at", new Date(now - RECOVERY_LOOKBACK_MS).toISOString())
    .lte("created_at", new Date(now - RECOVERY_SETTLE_MS).toISOString())
    .limit(50);
  if (requests.error) throw new Error(`Refund claim recovery failed: ${requests.error.message}`);

  let recovered = 0;
  for (const { id } of (requests.data ?? []) as Array<{ id: string }>) {
    const reference = id.slice("refund-".length, -"-requested".length);
    if (!reference || (await readRefund(admin, reference))) continue;
    const { data: claim, error } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("last_charge_reference", reference)
      .eq("money_back_used", true)
      .maybeSingle();
    if (error) throw new Error(`Refund claim recovery failed: ${error.message}`);
    // No claim on this charge: the request failed before claiming, or released it.
    if (!claim) continue;
    const detail = "Refund claim has no processing record. Reconcile in Paystack before moving money.";
    const recovery = await admin
      .from("pending_refunds")
      .upsert(
        { user_id: claim.user_id, transaction_reference: reference, status: "needs_attention", last_error: detail },
        { onConflict: "transaction_reference", ignoreDuplicates: true },
      );
    if (recovery.error) throw new Error(`Refund recovery write failed: ${recovery.error.message}`);
    await notifyRefundOperator(admin, { reference, userId: claim.user_id, kind: "attention", detail });
    recovered++;
  }
  return recovered;
}

/**
 * One cron pass: recover interrupted claims, then give every open row one
 * step, least recently touched first (a checked row's updated_at moves it to
 * the back). Bounded by elapsed time as well as rows.
 */
export async function processPendingRefunds(admin: Admin) {
  const summary = { attempted: 0, refunded: 0, failed: 0, waiting: 0, recovered: 0 };
  const deadline = Date.now() + CRON_PASS_BUDGET_MS;
  // A crash after claiming the guarantee must remain visible to support.
  summary.recovered = await recoverInterruptedClaims(admin);

  const { data, error } = await admin
    .from("pending_refunds")
    .select("transaction_reference")
    .in("status", ["queued", "submitting", "processing"])
    .order("updated_at", { ascending: true })
    .limit(MAX_ROWS_PER_PASS);
  if (error) throw new Error(`Refund queue read failed: ${error.message}`);

  for (const row of data ?? []) {
    if (Date.now() >= deadline) break;
    summary.attempted++;
    let status: RefundStatus;
    try {
      status = await processRefund(admin, row.transaction_reference);
    } catch (error) {
      // A provider outage for one refund must not starve the rest of the queue.
      const detail = error instanceof Error ? error.message : String(error);
      await notifyRefundOperator(admin, { reference: row.transaction_reference, kind: "attention", detail });
      const { error: writeError } = await admin
        .from("pending_refunds")
        .update({ last_error: detail.slice(0, 500), updated_at: new Date().toISOString() })
        .eq("transaction_reference", row.transaction_reference)
        .neq("status", "refunded");
      if (writeError) throw new Error(`Refund retry checkpoint failed: ${writeError.message}`);
      summary.waiting++;
      continue;
    }
    if (status === "refunded") summary.refunded++;
    else if (status === "failed" || status === "needs_attention") summary.failed++;
    else summary.waiting++;
  }
  return summary;
}
