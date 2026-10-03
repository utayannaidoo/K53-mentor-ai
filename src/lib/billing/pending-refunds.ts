import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyTransaction } from "@/lib/paystack/client";
import { voidMoneyBackCommission } from "@/lib/billing/subscription-cancel";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildManualRefundEmail, buildRefundProcessedEmail } from "@/lib/notify/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { processRefund, type PendingRefundRow } from "./refund-lifecycle";
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
 * One Paystack attempt now, for a queued or stopped row: the admin has topped
 * up the balance or seen new sales land and does not want to wait for 03:00.
 * A refusal is recorded but not counted against REFUND_MAX_ATTEMPTS, which
 * paces the cron, not the person checking whether their top-up arrived.
 */
export async function retryRefundNow(admin: Admin, id: string): Promise<AdminRefundResult> {
  const row = await readRow(admin, id);
  if (!row) return { ok: false, message: "That refund no longer exists." };
  if (row.status === "refunded") return { ok: false, message: "It has already been refunded." };
  if (["failed", "needs_attention", "submitting"].includes(row.status)) return { ok: false, message: "Reconcile this refund in Paystack before any further payment. Automatic submission is blocked." };
  try {
    const status = await processRefund(admin, row.transaction_reference);
    await flushBillingEmails(admin, 3);
    return { ok: status === "refunded" || status === "processing", message: status === "refunded" ? "Paystack confirmed the refund was processed." : status === "processing" ? "Paystack is processing the refund. Completion will be confirmed separately." : "Refund needs review. Check its status and the support alert before taking action." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Refund check failed." };
  }
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
  if (row.status !== "failed") return { ok: false, message: "Reconcile the provider status first; this refund may still be processing." };
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
