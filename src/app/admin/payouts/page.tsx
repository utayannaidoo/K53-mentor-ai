import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle } from "@/lib/utils";
import {
  partnerSnapshot,
  summarise,
  rand,
  maskAccount,
  PAYOUT_MINIMUM_CENTS,
} from "@/lib/partners/admin-data";
import { ActionForm, Field } from "@/components/admin/action-form";
import { markPaid } from "@/app/admin/actions";

export default async function AdminPayouts() {
  const snapshot = await partnerSnapshot();
  const summaries = snapshot ? summarise(snapshot) : [];
  // Anything with a balance, including the ones fully cancelled by a clawback —
  // those still need settling, and hiding them is what made them invisible.
  const queue = summaries
    .filter((s) => s.payableCents > 0)
    .sort((a, b) => b.netPayableCents - a.netPayableCents);
  const totalNet = queue.reduce((sum, s) => sum + Math.max(0, s.netPayableCents), 0);
  const payable = queue.filter((s) => s.clearsMinimum);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Payouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {queue.length === 0
              ? "Nothing is waiting."
              : `${rand(totalNet)} across ${queue.length} school${queue.length === 1 ? "" : "s"}. ${payable.length} clear${payable.length === 1 ? "s" : ""} the ${rand(PAYOUT_MINIMUM_CENTS)} minimum.`}
          </p>
        </div>
        {payable.length > 0 && (
          <a href="/admin/payouts/csv" className={cn(buttonVariants({ variant: "secondary" }), "press")}>
            Download bank CSV
          </a>
        )}
      </div>

      {queue.length === 0 ? (
        <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
          No payable commissions. They appear here once they clear the 8-day hold — the overview
          shows what is still in hold.
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((s) => {
            const offsetOnly = s.netPayableCents <= 0;
            return (
              <Card key={s.school.id} className={cn(glass, "space-y-4 p-5")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/schools/${s.school.id}`}
                      className="font-display text-base font-semibold hover:underline"
                    >
                      {s.school.name}
                    </Link>
                    <p className="mt-1 text-2xs text-muted-foreground">
                      {s.school.bank_account_name ?? "no account holder on file"} ·{" "}
                      {s.school.bank_name ?? "no bank"} · {maskAccount(s.school.bank_account_number)} ·
                      branch {s.school.bank_branch_code ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold tabular-nums">
                      {rand(Math.max(0, s.netPayableCents))}
                    </p>
                    <p className="text-2xs text-muted-foreground tabular-nums">
                      {rand(s.payableCents)} payable
                      {s.clawbackCents > 0 ? ` − ${rand(s.clawbackCents)} clawback` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!s.clearsMinimum && !offsetOnly && (
                    <Badge variant="outline">below the {rand(PAYOUT_MINIMUM_CENTS)} minimum</Badge>
                  )}
                  {offsetOnly && <Badge variant="warning">fully offset — settles at R0</Badge>}
                  {!s.school.bank_account_number && <Badge variant="danger">no bank details</Badge>}
                </div>

                {offsetOnly && (
                  <p className="text-sm text-muted-foreground">
                    A clawback cancels this balance out. Recording it moves no money, but it settles
                    the debt and clears the queue — leaving it unrecorded is what keeps the two
                    offsetting each other forever.
                  </p>
                )}

                <ActionForm
                  action={markPaid}
                  submitLabel={offsetOnly ? "Settle at R0" : "Mark as paid"}
                  pendingLabel="Recording…"
                  confirm={
                    offsetOnly
                      ? "Record this settlement? No money moves; the clawback is cleared."
                      : `Confirm you have already sent ${rand(Math.max(0, s.netPayableCents))} to ${s.school.name} by EFT.`
                  }
                >
                  <input type="hidden" name="id" value={s.school.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="EFT reference"
                      name="reference"
                      required
                      placeholder="FNB 2026-10-01"
                      hint="Whatever your bank shows, so this row can be matched later."
                    />
                    <Field label="Note" name="note" placeholder="Optional" />
                  </div>
                  {!s.clearsMinimum && !offsetOnly && (
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="override" className="size-4 rounded border-border" />
                      Pay it anyway, below the minimum
                    </label>
                  )}
                </ActionForm>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
