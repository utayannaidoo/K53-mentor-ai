import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * What a driving school may see about itself.
 *
 * Counts and rand totals only. No learner ids, names, emails or dates of
 * individual signups: a school is entitled to know how many people it sent and
 * what it earned, not to a roster of who they were. That boundary is enforced
 * here, in the only query the statement page runs, rather than by remembering
 * not to render a field.
 */
export interface SchoolStatement {
  name: string;
  code: string;
  status: string;
  signedUp: number;
  converted: number;
  pendingCents: number;
  payableCents: number;
  paidCents: number;
  lastPaidAt: string | null;
}

export async function schoolStatement(code: string): Promise<SchoolStatement | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: codeRow } = await admin
    .from("partner_school_codes")
    .select("school_id, code")
    .eq("code", code.trim().toLowerCase())
    .maybeSingle();
  // A revoked code still opens the statement it belongs to: a school whose code
  // was rotated should not lose sight of money it has already earned.
  if (!codeRow) return null;
  const { school_id: schoolId } = codeRow as { school_id: string; code: string };

  const [school, referrals, commissions, payouts] = await Promise.all([
    admin.from("partner_schools").select("name,status").eq("id", schoolId).maybeSingle(),
    admin.from("school_referrals").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    admin.from("partner_commissions").select("amount_cents,status,void_reason").eq("school_id", schoolId),
    admin
      .from("partner_payouts")
      .select("paid_at")
      .eq("school_id", schoolId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(1),
  ]);
  if (!school.data) return null;

  const rows = (commissions.data ?? []) as {
    amount_cents: number;
    status: string;
    void_reason: string | null;
  }[];
  const sum = (predicate: (row: (typeof rows)[number]) => boolean) =>
    rows.filter(predicate).reduce((total, row) => total + row.amount_cents, 0);

  return {
    name: (school.data as { name: string }).name,
    code: (codeRow as { code: string }).code,
    status: (school.data as { status: string }).status,
    signedUp: referrals.count ?? 0,
    // Void commissions are conversions that were refunded. They are counted as
    // conversions because they happened, but they are worth nothing — showing
    // them as earnings would promise money that is never coming.
    converted: rows.filter((row) => row.status !== "void").length,
    // "Pending" is the 8-day money-back hold, plus anything held for review.
    pendingCents: sum((row) => row.status === "pending"),
    payableCents: sum((row) => row.status === "payable"),
    paidCents: sum((row) => row.status === "paid" && row.void_reason === null),
    lastPaidAt: ((payouts.data ?? [])[0] as { paid_at: string } | undefined)?.paid_at ?? null,
  };
}
