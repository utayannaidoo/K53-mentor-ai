import { isAdmin } from "@/lib/partners/admin-auth";
import { partnerSnapshot, summarise, PAYOUT_MINIMUM_CENTS } from "@/lib/partners/admin-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { creditModePartners, linkedWorkspaces } from "@/lib/billing/school-credit";

export const runtime = "nodejs";

/**
 * The pay run, as a file a bank's bulk-EFT screen will accept.
 *
 * This is the one place the full account number leaves the database, which is
 * why it is a separate authenticated request rather than something rendered
 * into the payouts page: downloading it is a deliberate act, and it does not
 * sit in a browser tab all afternoon.
 *
 * Amounts are in rand with two decimals because that is what banks import;
 * everything upstream of this line is integer cents.
 */
function escape(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  if (!(await isAdmin())) {
    // Same answer a signed-out browser gets from /admin itself.
    return new Response("Not found", { status: 404 });
  }
  const snapshot = await partnerSnapshot();
  if (!snapshot) return new Response("Storage is not configured", { status: 501 });

  const today = new Date().toISOString().slice(0, 10);
  const admin = createAdminClient();
  // Schools taking commission as credit are settled into their plan, never by EFT.
  const inCredit = admin ? creditModePartners(await linkedWorkspaces(admin)) : new Set<string>();
  const rows = summarise(snapshot)
    .filter((s) => s.netPayableCents > 0 && s.clearsMinimum && !inCredit.has(s.school.id))
    .map((s) => [
      s.school.name,
      s.school.bank_account_name,
      s.school.bank_name,
      s.school.bank_account_number,
      s.school.bank_branch_code,
      (s.netPayableCents / 100).toFixed(2),
      // A reference the school will recognise on its statement, and that the
      // "Mark as paid" form can be filled in with verbatim.
      `K53 ${today}`,
    ]);

  const header = [
    "school",
    "account_holder",
    "bank",
    "account_number",
    "branch_code",
    "amount_zar",
    "reference",
  ];
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="k53-partner-payouts-${today}.csv"`,
      // Never cached: it contains bank details and it is a point-in-time view
      // of what is owed.
      "cache-control": "no-store",
    },
  });
}
