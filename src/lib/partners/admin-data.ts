import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { auditPartnerConfig } from "@/lib/env";

// Once per server instance, next to the first thing that reads partner data.
auditPartnerConfig();

/**
 * Reads behind /admin.
 *
 * Aggregation happens in TypeScript rather than SQL on purpose. The programme
 * is measured in tens of schools and hundreds of commissions; pulling the four
 * partner tables whole and grouping them here costs a few milliseconds, keeps
 * every number visible in one place next to the rule it implements, and avoids
 * adding views that would then have to be migrated every time the admin screens
 * want a different cut. Revisit when a single school has thousands of rows —
 * `partner_commissions(school_id,status)` is already indexed for it.
 */

export const PAYOUT_MINIMUM_CENTS = 10_000;

export interface SchoolRow {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  town: string | null;
  province: string | null;
  commission_cents: number;
  status: "pending" | "active" | "suspended";
  bank_account_name: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_branch_code: string | null;
  notes: string | null;
  created_at: string;
  activated_at: string | null;
  review_threshold: number;
  monthly_commission_cap: number;
}

export interface CodeRow {
  id: string;
  school_id: string;
  code: string;
  label: string | null;
  status: "active" | "revoked";
  created_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
}

export interface CommissionRow {
  id: string;
  school_id: string;
  user_id: string;
  amount_cents: number;
  charge_reference: string;
  plan: string | null;
  cycle: string | null;
  status: "pending" | "payable" | "paid" | "void";
  earned_at: string;
  eligible_at: string;
  void_reason: string | null;
  hold_reason: string | null;
  payout_id: string | null;
  clawback_settled_payout_id: string | null;
}

export interface ReferralRow {
  id: string;
  school_id: string;
  user_id: string;
  code_used: string;
  source: "link" | "manual" | "admin";
  attributed_at: string;
}

export interface PayoutRow {
  id: string;
  school_id: string;
  commission_count: number;
  total_cents: number;
  status: "draft" | "paid";
  paid_at: string | null;
  payment_reference: string | null;
  note: string | null;
  created_at: string;
}

/** Everything the admin screens group and re-group. One round trip. */
export interface PartnerSnapshot {
  schools: SchoolRow[];
  codes: CodeRow[];
  commissions: CommissionRow[];
  referrals: ReferralRow[];
  payouts: PayoutRow[];
}

export async function partnerSnapshot(): Promise<PartnerSnapshot | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const [schools, codes, commissions, referrals, payouts] = await Promise.all([
    admin.from("partner_schools").select("*").order("created_at", { ascending: false }),
    admin.from("partner_school_codes").select("*").order("created_at", { ascending: false }),
    admin.from("partner_commissions").select("*").order("earned_at", { ascending: false }),
    admin.from("school_referrals").select("*").order("attributed_at", { ascending: false }),
    admin.from("partner_payouts").select("*").order("created_at", { ascending: false }),
  ]);
  const failure = [schools, codes, commissions, referrals, payouts].find((r) => r.error);
  if (failure?.error) {
    console.error("[partners] admin snapshot failed", failure.error.message);
    return null;
  }
  return {
    schools: (schools.data ?? []) as SchoolRow[],
    codes: (codes.data ?? []) as CodeRow[],
    commissions: (commissions.data ?? []) as CommissionRow[],
    referrals: (referrals.data ?? []) as ReferralRow[],
    payouts: (payouts.data ?? []) as PayoutRow[],
  };
}

/** Per-school rollup, the shape every admin table renders from. */
export interface SchoolSummary {
  school: SchoolRow;
  activeCode: CodeRow | null;
  attributed: number;
  /** Attributions in the trailing 7 days, against the school's own threshold. */
  attributedLast7: number;
  overThreshold: boolean;
  converted: number;
  pendingCents: number;
  heldCount: number;
  payableCents: number;
  paidCents: number;
  /** Paid commissions later reversed and not yet settled against a payout. */
  clawbackCents: number;
  /** What an EFT would actually transfer today: payable minus clawbacks. */
  netPayableCents: number;
  clearsMinimum: boolean;
}

export function summarise(snapshot: PartnerSnapshot, now = Date.now()): SchoolSummary[] {
  const weekAgo = now - 7 * 86_400_000;
  return snapshot.schools.map((school) => {
    const referrals = snapshot.referrals.filter((r) => r.school_id === school.id);
    const commissions = snapshot.commissions.filter((c) => c.school_id === school.id);
    const sum = (rows: CommissionRow[]) => rows.reduce((total, c) => total + c.amount_cents, 0);
    const payableCents = sum(commissions.filter((c) => c.status === "payable"));
    const clawbackCents = sum(
      commissions.filter(
        (c) => c.status === "paid" && c.void_reason !== null && c.clawback_settled_payout_id === null,
      ),
    );
    const attributedLast7 = referrals.filter((r) => Date.parse(r.attributed_at) >= weekAgo).length;
    const netPayableCents = payableCents - clawbackCents;
    return {
      school,
      activeCode: snapshot.codes.find((c) => c.school_id === school.id && c.status === "active") ?? null,
      attributed: referrals.length,
      attributedLast7,
      overThreshold: attributedLast7 > school.review_threshold,
      // A conversion is a commission that exists at all — void ones were real
      // conversions that were later refunded, and hiding them would make the
      // conversion rate drift upward every time someone got their money back.
      converted: commissions.length,
      pendingCents: sum(commissions.filter((c) => c.status === "pending")),
      heldCount: commissions.filter((c) => c.status === "pending" && c.hold_reason !== null).length,
      payableCents,
      paidCents: sum(commissions.filter((c) => c.status === "paid" && c.void_reason === null)),
      clawbackCents,
      netPayableCents,
      clearsMinimum: netPayableCents >= PAYOUT_MINIMUM_CENTS,
    };
  });
}

/** Rand, from integer cents. Money is never a float anywhere above this line. */
export function rand(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Bank account numbers are shown as their last four digits. The admin area is
 * already behind the allowlist, but a payout screen is the one page most likely
 * to be open on a shared screen, and the full number is only ever needed inside
 * the CSV that goes to the bank.
 */
export function maskAccount(value: string | null): string {
  if (!value) return "—";
  const digits = value.replace(/\s+/g, "");
  return digits.length <= 4 ? digits : `•••• ${digits.slice(-4)}`;
}
