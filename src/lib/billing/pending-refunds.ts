import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listTransactionRefunds, verifyTransaction } from "@/lib/paystack/client";
import { voidMoneyBackCommission } from "@/lib/billing/subscription-cancel";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildManualRefundEmail, buildRefundProcessedEmail } from "@/lib/notify/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { processRefund, SUBMITTING_STALE_MS, type PendingRefundRow } from "./refund-lifecycle";
import { flushBillingEmails } from "./refund-notifications";
export { queuePendingRefund, processPendingRefunds, REFUND_MAX_ATTEMPTS } from "./refund-lifecycle";
type Admin = SupabaseClient;
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
      .in("status", ["queued", "submitting", "processing", "needs_attention", "failed"])
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
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as PendingRefundRow | null) ?? null;
}

/**
 * Rows the cron will not touch again on its own, which a person may re-open for
 * one checked attempt. Each was parked because nobody could be sure what
 * Paystack did, and that is safe to settle now: processRefund reads Paystack's
 * refund history for the charge before it posts anything, so a refund that did
 * land is adopted, never sent twice.
 */
const REOPENABLE: PendingRefundRow["status"][] = ["failed", "needs_attention", "submitting"];

/**
 * One Paystack attempt now, for any open row: the admin has topped up the
 * balance, seen new sales land, or checked Paystack after an attention alert,
 * and does not want to wait for the next cron run. A refusal is recorded but not
 * counted against REFUND_MAX_ATTEMPTS, which paces the cron, not the person
 * checking whether their top-up arrived. A processing row is only re-checked.
 */
export async function retryRefundNow(admin: Admin, id: string): Promise<AdminRefundResult> {
  const row = await readRow(admin, id);
  if (!row) return { ok: false, message: "That refund no longer exists." };
  if (row.status === "refunded") return { ok: false, message: "It has already been refunded." };
  if (row.status === "submitting" && Date.now() - Date.parse(row.updated_at) <= SUBMITTING_STALE_MS) {
    return { ok: false, message: "A refund attempt is running right now. Reload in a couple of minutes." };
  }
  if (REOPENABLE.includes(row.status)) {
    // Compare-and-set on the status this page was drawn from, so two tabs (or
    // the cron) cannot both re-open it.
    const { data, error } = await admin.from("pending_refunds")
      .update({ status: "queued", updated_at: new Date().toISOString() })
      .eq("id", row.id).eq("status", row.status).select("id");
    if (error || !data?.length) return { ok: false, message: "It changed while you were looking. Reload and try again." };
  }
  let status: PendingRefundRow["status"];
  try {
    status = await processRefund(admin, row.transaction_reference, { manual: true });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refund check failed." };
  }
  // Refused before anything reached Paystack. A stopped row goes back to
  // stopped: Retry is one attempt, not a restart of the daily schedule an admin
  // (or the attempt budget) ended. Any other row stays queued for the cron.
  if (status === "queued" && row.status === "failed") {
    await admin.from("pending_refunds").update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", row.id).eq("status", "queued");
  }
  await flushBillingEmails(admin, 4, { prefix: `refund-${row.transaction_reference}-` })
    .catch((error) => console.error("[refunds] alerts pending after admin retry", error));
  const why = (await readRow(admin, id))?.last_error ?? "no detail recorded";
  switch (status) {
    case "refunded":
      return { ok: true, message: "Paystack confirmed the refund was processed. The learner's receipt is on its way." };
    case "processing":
      return { ok: true, message: "Paystack accepted the refund and is processing it. This page updates when it confirms." };
    case "queued":
      return { ok: false, message: `Paystack refused it: ${why}${row.status === "failed" ? " Retries stay stopped." : " The daily retry continues."}` };
    case "submitting":
      return { ok: false, message: "Another attempt is running. Reload in a couple of minutes." };
    default:
      return { ok: false, message: `Still needs review: ${why}` };
  }
}

/**
 * Why the learner must not be repaid by EFT yet: a Paystack refund for this
 * charge that could still pay them, or one that already has in full. Null when
 * nothing can, which is the only time repaying outside Paystack is safe.
 */
async function paystackStillOwnsRefund(reference: string): Promise<string | null> {
  const tx = await verifyTransaction(reference);
  const refunds = await listTransactionRefunds(tx.id);
  const live = refunds.find((refund) => ["pending", "processing", "needs-attention"].includes(refund.status));
  if (live) return `Paystack still has refund ${live.id} ${live.status} for this charge. Settle it in Paystack first.`;
  const processed = refunds.filter((refund) => refund.status === "processed").reduce((sum, refund) => sum + (refund.amount ?? 0), 0);
  if (processed > 0 && tx.amount == null) return "Paystack shows a refund for this charge but not the charge amount. Reconcile it in Paystack first.";
  if (tx.amount != null && processed >= tx.amount) return "Paystack has already refunded this charge in full. Check status instead of repaying by EFT.";
  return null;
}

/**
 * Take a row away from Paystack, so the admin can repay by EFT without Paystack
 * refunding the same charge as well. A queued row only needs the cron kept off
 * it. A needs_attention row was parked because nobody could be sure what
 * Paystack did (a timed-out request, a partial refund), so it is stopped only
 * once Paystack itself confirms nothing for this charge can still pay out.
 * That check runs here, BEFORE the EFT is sent, not when it is recorded.
 * The compare-and-set on status keeps a concurrent cron pass out.
 */
export async function stopRefundRetries(
  admin: Admin,
  id: string,
  by: string,
): Promise<AdminRefundResult> {
  const row = await readRow(admin, id);
  if (!row || (row.status !== "queued" && row.status !== "needs_attention")) {
    return { ok: false, message: "Only a refund that is retrying or needs attention can be stopped." };
  }
  if (row.status === "needs_attention") {
    try {
      const blocked = await paystackStillOwnsRefund(row.transaction_reference);
      if (blocked) return { ok: false, message: blocked };
    } catch {
      return { ok: false, message: "Couldn't reach Paystack to confirm no refund is in progress. Try again shortly." };
    }
  }
  const note = `Automatic retries stopped by ${by} to repay by EFT. Last error: ${row.last_error ?? "none"}`;
  const { data, error } = await admin
    .from("pending_refunds")
    .update({ status: "failed", last_error: note.slice(0, 500), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", row.status)
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
 * through Paystack, and the learner would be paid twice. So is every other
 * unstopped row: only stopRefundRetries decides that Paystack is out of it.
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
  if (row.status === "refunded") return { ok: false, message: "It has already been refunded." };
  if (row.status !== "failed") return { ok: false, message: "Stop it first. Paystack may still be processing this refund." };
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
