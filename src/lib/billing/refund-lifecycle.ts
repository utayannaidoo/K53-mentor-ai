import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { voidMoneyBackCommission } from "@/lib/billing/subscription-cancel";
import { fetchRefund, listTransactionRefunds, PaystackError, refundTransaction, verifyTransaction, type PaystackRefund } from "@/lib/paystack/client";
import { buildRefundProcessedEmail } from "@/lib/notify/templates";
import { notifyRefundOperator, queueBillingEmail } from "@/lib/billing/refund-notifications";
import { routeSchoolEvent } from "@/lib/billing/school-billing";

export const REFUND_MAX_ATTEMPTS = 14;
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
  const { data, error } = await admin.from("pending_refunds").select("*")
    .eq("transaction_reference", reference).maybeSingle();
  if (error) throw new Error(`Refund read failed: ${error.message}`);
  return data as PendingRefundRow | null;
}

/** A durable row always precedes the money-moving POST. Never reopen a settled row. */
export async function queuePendingRefund(admin: Admin, input: { userId: string; reference: string; lastError?: string | null }):
  Promise<{ ok: false } | { ok: true; rowStatus: RefundStatus }> {
  const { error } = await admin.from("pending_refunds").upsert({
    user_id: input.userId, transaction_reference: input.reference, status: "queued", last_error: input.lastError ?? null,
  }, { onConflict: "transaction_reference", ignoreDuplicates: true });
  if (error) return { ok: false };
  const row = await readRefund(admin, input.reference);
  return row ? { ok: true, rowStatus: row.status } : { ok: false };
}

async function attention(admin: Admin, row: PendingRefundRow, detail: string, status: "failed" | "needs_attention" = "needs_attention") {
  await notifyRefundOperator(admin, { reference: row.transaction_reference, userId: row.user_id, kind: "attention", detail });
  const { error } = await admin.from("pending_refunds").update({ status, last_error: detail.slice(0, 500), updated_at: new Date().toISOString() })
    .eq("id", row.id).neq("status", "refunded");
  if (error) throw new Error(`Refund attention write failed: ${error.message}`);
  return (await readRefund(admin, row.transaction_reference))?.status ?? status;
}

/** Confirmed processing only. Exact payment matching preserves newer purchases and top-ups. */
export async function completeRefund(admin: Admin, reference: string, amountCents?: number) {
  const row = await readRefund(admin, reference);
  if (row?.manual_reference) return;
  // Preserve school-credit refunds and route school payments to their own product.
  const school = await routeSchoolEvent(admin, "refund.processed", { reference });
  const { error } = school === "school" ? { error: null } : await admin.from("subscriptions").update({
    tier: "free", status: "canceled", refunded_at: new Date().toISOString(), cancel_at_period_end: false,
  }).eq("last_charge_reference", reference).neq("tier", "free");
  if (error) throw new Error(`Refund downgrade failed: ${error.message}`);
  await voidMoneyBackCommission(admin, reference);
  await notifyRefundOperator(admin, { reference, userId: row?.user_id, kind: "processed", detail: "Paystack confirmed processing is complete. Bank clearance may still take 5–10 business days." });
  if (row) {
    const { data: profile, error: profileError } = await admin.from("profiles").select("email,full_name").eq("id", row.user_id).maybeSingle();
    if (profileError) throw new Error(`Refund receipt lookup failed: ${profileError.message}`);
    if (profile?.email) await queueBillingEmail(admin, `refund-${reference}-customer-processed`, {
      to: profile.email,
      ...buildRefundProcessedEmail({ firstName: (profile.full_name ?? "").trim().split(/\s+/)[0], amountZar: amountCents == null ? null : amountCents / 100 }),
    });
    const { error: writeError } = await admin.from("pending_refunds").update({
      status: "refunded", refunded_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_error: null,
    }).eq("id", row.id);
    if (writeError) throw new Error(`Refund completion write failed: ${writeError.message}`);
  }
}

async function applyProviderRefund(admin: Admin, row: PendingRefundRow, result: PaystackRefund): Promise<RefundStatus> {
  if (!result?.id || !result.status) return attention(admin, row, "Paystack returned an incomplete refund response. Check the provider before retrying.");
  if ((await readRefund(admin, row.transaction_reference))?.status === "refunded") return "refunded";
  const { error } = await admin.from("pending_refunds").update({ provider_refund_id: result.id })
    .eq("id", row.id).neq("status", "refunded");
  if (error) throw new Error(`Refund provider ID write failed: ${error.message}`);
  if (result.status === "processed") {
    const transaction = await verifyTransaction(row.transaction_reference);
    if (result.amount !== transaction.amount) return attention(admin, row, "Refund amount could not be confirmed as the full payment. Reconcile in Paystack before changing access.");
    await completeRefund(admin, row.transaction_reference, result.amount);
    return "refunded";
  }
  if (result.status === "failed" || result.status === "needs-attention") {
    return attention(admin, row, `Paystack refund ${result.id}: ${result.status}. Review in Paystack before retrying.`, result.status === "failed" ? "failed" : "needs_attention");
  }
  const { error: pendingError } = await admin.from("pending_refunds").update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", row.id).in("status", ["queued", "submitting", "processing"]);
  if (pendingError) throw new Error(`Refund processing write failed: ${pendingError.message}`);
  return (await readRefund(admin, row.transaction_reference))?.status ?? "processing";
}

/** Atomic queued → submitting claim. An uncertain POST is NEVER blindly repeated. */
export async function processRefund(admin: Admin, reference: string): Promise<RefundStatus> {
  const row = await readRefund(admin, reference);
  if (!row) throw new Error("Refund request missing");
  if (["refunded", "failed", "needs_attention"].includes(row.status)) return row.status;
  if (row.status === "submitting") {
    if (Date.now() - Date.parse(row.updated_at) > 120_000) return attention(admin, row, "Refund submission was interrupted. Verify its status in Paystack before retrying.");
    return "submitting";
  }
  if (row.status === "processing") {
    if (!row.provider_refund_id) return attention(admin, row, "Refund accepted without a stored provider ID. Reconcile in Paystack.");
    return applyProviderRefund(admin, row, await fetchRefund(row.provider_refund_id));
  }
  if (row.attempts >= REFUND_MAX_ATTEMPTS) return attention(admin, row, row.last_error ?? "Automatic refund retries exhausted.", "failed");
  const { data: claim, error } = await admin.from("pending_refunds").update({
    status: "submitting", attempts: row.attempts + 1, updated_at: new Date().toISOString(),
  }).eq("id", row.id).eq("status", "queued").select("id").maybeSingle();
  if (error) throw new Error(`Refund claim failed: ${error.message}`);
  if (!claim) return (await readRefund(admin, reference))?.status ?? "submitting";
  let submitted = false;
  try {
    const tx = await verifyTransaction(reference);
    const refunds = await listTransactionRefunds(tx.id);
    if (refunds.length) {
      if (refunds.length !== 1 || refunds[0].amount !== tx.amount) return attention(admin, row, "Existing partial or multiple refunds found. Reconcile the remaining amount manually.");
      return await applyProviderRefund(admin, row, refunds[0]);
    }
    if (tx.status !== "success") return attention(admin, row, `Transaction status is ${tx.status}; no new refund was submitted.`);
    submitted = true;
    const result = await refundTransaction(reference, {
      merchantNote: "K53 Mentor 7-day money-back cancellation",
      customerNote: "Full refund of your most recent K53 Mentor payment.",
    });
    return await applyProviderRefund(admin, row, result);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const noFunds = err instanceof PaystackError && err.httpStatus >= 400 && err.httpStatus < 500 && /insufficient balance/i.test(detail);
    if (!submitted || noFunds) {
      await notifyRefundOperator(admin, { reference, userId: row.user_id, kind: "attention", detail });
      const { error: retryError } = await admin.from("pending_refunds").update({ status: "queued", last_error: detail.slice(0, 500), updated_at: new Date().toISOString() })
        .eq("id", row.id).eq("status", "submitting");
      if (retryError) throw new Error(`Refund retry write failed: ${retryError.message}`);
      return (await readRefund(admin, reference))?.status ?? "queued";
    }
    return attention(admin, row, detail);
  }
}

/** State transitions are idempotent. Late pending events cannot undo completion. */
export async function applyRefundEvent(admin: Admin, event: string, data: {
  transaction_reference?: string; transaction?: { reference?: string }; amount?: number | string; id?: number;
}) {
  const reference = data.transaction_reference ?? data.transaction?.reference;
  if (!reference) throw new Error("Refund event missing transaction reference");
  const row = await readRefund(admin, reference);
  if (row?.status === "refunded") return;
  if (event === "refund.processed") {
    if (data.amount != null) {
      const tx = await verifyTransaction(reference);
      if (Number(data.amount) !== tx.amount) {
        if (row) await attention(admin, row, "Partial refund processed; manual reconciliation required.");
        else await notifyRefundOperator(admin, { reference, kind: "attention", detail: "Partial refund processed. Paid access was preserved; review the remaining amount." });
        return;
      }
    }
    await completeRefund(admin, reference, data.amount == null ? undefined : Number(data.amount));
  } else if (event === "refund.failed" || event === "refund.needs-attention") {
    if (row) await attention(admin, row, `Paystack reported ${event}. Review the payment in Paystack.`, event === "refund.failed" ? "failed" : "needs_attention");
    else await notifyRefundOperator(admin, { reference, kind: "attention", detail: `Paystack reported ${event} for a refund outside the app queue.` });
  } else if (row) {
    const { error } = await admin.from("pending_refunds").update({ status: "processing", ...(data.id ? { provider_refund_id: data.id } : {}), updated_at: new Date().toISOString() })
      .eq("id", row.id).in("status", ["queued", "submitting", "processing"]);
    if (error) throw new Error(`Refund event write failed: ${error.message}`);
  }
}

/** Bounded by elapsed time as well as rows; checked rows rotate to the back. */
export async function processPendingRefunds(admin: Admin) {
  const summary = { attempted: 0, refunded: 0, failed: 0, waiting: 0, recovered: 0 };
  const deadline = Date.now() + 180_000;
  // A crash after claiming the guarantee must remain visible to support.
  const candidates = await admin.from("subscriptions").select("user_id,last_charge_reference")
    .eq("money_back_used", true).eq("cancel_at_period_end", true).neq("tier", "free").limit(20);
  if (candidates.error) throw new Error(`Refund claim recovery failed: ${candidates.error.message}`);
  for (const candidate of candidates.data ?? []) {
    const reference = candidate.last_charge_reference;
    if (!reference || await readRefund(admin, reference)) continue;
    const detail = "Refund claim has no processing record. Reconcile in Paystack before moving money.";
    const recovery = await admin.from("pending_refunds").upsert({ user_id: candidate.user_id, transaction_reference: reference, status: "needs_attention", last_error: detail }, { onConflict: "transaction_reference", ignoreDuplicates: true });
    if (recovery.error) throw new Error(`Refund recovery write failed: ${recovery.error.message}`);
    await notifyRefundOperator(admin, { reference, userId: candidate.user_id, kind: "attention", detail });
    summary.recovered++;
  }
  const { data, error } = await admin.from("pending_refunds").select("transaction_reference")
    .in("status", ["queued", "submitting", "processing"]).order("updated_at", { ascending: true }).limit(20);
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
      const { error: writeError } = await admin.from("pending_refunds").update({ last_error: detail.slice(0, 500), updated_at: new Date().toISOString() })
        .eq("transaction_reference", row.transaction_reference).neq("status", "refunded");
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
