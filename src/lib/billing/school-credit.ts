import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { refundTransaction } from "@/lib/paystack/client";
import { schoolChargeCents, schoolPlanFromCode } from "@/lib/billing/school-billing";

/**
 * Referral commission taken as account credit (migration 0042).
 *
 * A driving school that refers learners and also pays for the software can
 * have its R20-a-learner commission settled into credit instead of an EFT.
 * Credit pays for whole payments: Paystack cannot vary a Plan's amount, so a
 * month (or a year, on yearly billing) is "paid for with credit" by refunding
 * that charge and debiting the credit for it. There is no path from credit to
 * cash.
 */

/** Postgres and PostgREST's two ways of saying "that table does not exist". */
const MISSING_TABLE = new Set(["42P01", "PGRST205"]);

/**
 * Nightly, after commissions mature: settle every credit-mode school's payable
 * commission into credit. Safe to repeat (a second run finds nothing payable),
 * and silent on a database that has no school tables yet — the cron that runs
 * it also runs the learner app's payment reconciliation, which must not fail
 * because a product that isn't live yet is missing its tables.
 */
export async function accrueSchoolCredit(admin: SupabaseClient): Promise<number> {
  const { data, error } = await admin
    .from("schools")
    .select("id")
    .eq("commission_mode", "credit")
    .not("partner_school_id", "is", null);
  if (error) {
    if (!(error.code && MISSING_TABLE.has(error.code))) {
      console.error("[school-credit] could not list credit-mode schools", error.message);
    }
    return 0;
  }
  let credited = 0;
  for (const { id } of (data ?? []) as { id: string }[]) {
    const { data: cents, error: rpcError } = await admin.rpc("apply_commission_credit", { p_school: id });
    if (rpcError) {
      console.error(`[school-credit] could not credit school ${id}`, rpcError.message);
      continue;
    }
    credited += typeof cents === "number" ? cents : 0;
  }
  return credited;
}

export type RedeemOutcome =
  | { ok: true; amountCents: number; reference: string }
  | { ok: false; message: string };

/**
 * Pay for a school's latest charge with its credit: debit first, then refund,
 * and put the credit back if the refund does not happen.
 *
 * The debit comes first on purpose. The refund.processed webhook that follows
 * a successful refund would otherwise end the school's plan — it is how a
 * refund normally reads — and it tells the two apart by finding this debit in
 * the ledger (isCreditRedemption in school-billing.ts). Debit, then refund, is
 * also the order that can never pay out twice: a crash between the two leaves
 * credit spent and no refund made, which the ledger shows and an admin can
 * reverse.
 */
export async function redeemSchoolCredit(
  admin: SupabaseClient,
  schoolId: string,
  note?: string,
): Promise<RedeemOutcome> {
  const { data } = await admin
    .from("school_subscriptions")
    .select("status, plan_code, last_charge_reference, credit_cents")
    .eq("school_id", schoolId)
    .maybeSingle();
  const sub = data as {
    status: string;
    plan_code: string | null;
    last_charge_reference: string | null;
    credit_cents: number;
  } | null;
  if (!sub?.last_charge_reference || !sub.plan_code) {
    return { ok: false, message: "This school has no charge for credit to pay for." };
  }
  if (sub.status !== "active" && sub.status !== "past_due") {
    return { ok: false, message: "Credit only pays for a plan that is running." };
  }
  const plan = schoolPlanFromCode(sub.plan_code);
  if (!plan) return { ok: false, message: "That plan isn't one of the school plans configured here." };
  const amountCents = schoolChargeCents(plan.plan, plan.cycle);
  if (sub.credit_cents < amountCents) {
    return { ok: false, message: "Not enough credit to cover a whole payment yet." };
  }

  const { data: entry, error } = await admin.rpc("redeem_school_credit", {
    p_school: schoolId,
    p_charge_reference: sub.last_charge_reference,
    p_amount_cents: amountCents,
    p_note: note ?? "Paid for with referral credit",
  });
  if (error || typeof entry !== "string") {
    console.error("[school-credit] redemption refused", error?.message);
    return {
      ok: false,
      message: error?.message.includes("already been paid")
        ? "That payment has already been covered by credit."
        : "Could not redeem the credit.",
    };
  }

  try {
    await refundTransaction(sub.last_charge_reference, {
      amountCents,
      merchantNote: "K53 Mentor for Schools: payment covered by referral credit",
      customerNote: "This payment was covered by the credit you earned by referring learners.",
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[school-credit] refund of ${sub.last_charge_reference} failed; restoring credit`, reason);
    const { error: reverseError } = await admin.rpc("reverse_school_credit_redemption", {
      p_entry: entry,
      p_reason: `Refund failed: ${reason}`.slice(0, 300),
    });
    if (reverseError) {
      console.error(`[school-credit] REVERSAL FAILED for ledger ${entry}; credit is debited with no refund`, reverseError.message);
    }
    return { ok: false, message: `Paystack refused the refund, so the credit was put back. (${reason})` };
  }
  return { ok: true, amountCents, reference: sub.last_charge_reference };
}

/** A K53 Mentor for Schools workspace linked to a partner-programme school. */
export interface LinkedWorkspace {
  schoolId: string;
  name: string;
  commissionMode: "eft" | "credit";
  plan: string;
  status: string;
  planCode: string | null;
  lastChargeReference: string | null;
  creditCents: number;
}

/**
 * Every partner school that has a software workspace linked to it, keyed by
 * the partner school's id — what the admin pages need to know whether a
 * school is paid by EFT or in credit. Empty on a database without the school
 * tables, so the partner admin keeps working before 0035 is applied.
 */
export async function linkedWorkspaces(admin: SupabaseClient): Promise<Map<string, LinkedWorkspace>> {
  const linked = new Map<string, LinkedWorkspace>();
  const { data: schools, error } = await admin
    .from("schools")
    .select("id, name, partner_school_id, commission_mode")
    .not("partner_school_id", "is", null);
  if (error) {
    if (!(error.code && MISSING_TABLE.has(error.code))) {
      console.error("[school-credit] could not list linked workspaces", error.message);
    }
    return linked;
  }
  const rows = (schools ?? []) as { id: string; name: string; partner_school_id: string; commission_mode: string }[];
  if (rows.length === 0) return linked;

  const { data: subs } = await admin
    .from("school_subscriptions")
    .select("school_id, plan, status, plan_code, last_charge_reference, credit_cents")
    .in(
      "school_id",
      rows.map((r) => r.id),
    );
  const subBySchool = new Map(
    ((subs ?? []) as {
      school_id: string;
      plan: string;
      status: string;
      plan_code: string | null;
      last_charge_reference: string | null;
      credit_cents: number;
    }[]).map((s) => [s.school_id, s]),
  );
  for (const row of rows) {
    const sub = subBySchool.get(row.id);
    linked.set(row.partner_school_id, {
      schoolId: row.id,
      name: row.name,
      commissionMode: row.commission_mode === "credit" ? "credit" : "eft",
      plan: sub?.plan ?? "trial",
      status: sub?.status ?? "canceled",
      planCode: sub?.plan_code ?? null,
      lastChargeReference: sub?.last_charge_reference ?? null,
      creditCents: sub?.credit_cents ?? 0,
    });
  }
  return linked;
}

/** The partner schools whose commission is settled into credit, not by EFT. */
export function creditModePartners(linked: Map<string, LinkedWorkspace>): Set<string> {
  return new Set([...linked].filter(([, w]) => w.commissionMode === "credit").map(([partnerId]) => partnerId));
}

/**
 * What one billing period of the workspace's plan costs (a month, or a year on
 * yearly billing) — the amount credit must cover to pay for the latest
 * charge. Null when there is no running school plan to pay for.
 */
export function periodCostCents(workspace: Pick<LinkedWorkspace, "planCode" | "status">): number | null {
  if (workspace.status !== "active" && workspace.status !== "past_due") return null;
  const plan = schoolPlanFromCode(workspace.planCode);
  return plan ? schoolChargeCents(plan.plan, plan.cycle) : null;
}

export interface CreditEntry {
  id: string;
  kind: "earned" | "redeemed" | "reversed";
  amountCents: number;
  note: string | null;
  createdAt: string;
}

/** The latest credit movements for one school, newest first. */
export async function schoolCreditLedger(admin: SupabaseClient, schoolId: string, limit = 12): Promise<CreditEntry[]> {
  const { data } = await admin
    .from("school_credit_ledger")
    .select("id, kind, amount_cents, note, created_at")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as { id: string; kind: CreditEntry["kind"]; amount_cents: number; note: string | null; created_at: string }[]).map(
    (row) => ({ id: row.id, kind: row.kind, amountCents: row.amount_cents, note: row.note, createdAt: row.created_at }),
  );
}
