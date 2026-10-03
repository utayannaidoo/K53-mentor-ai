import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, glass, glassSubtle } from "@/lib/utils";
import { rand } from "@/lib/partners/admin-data";
import { ActionForm, Field } from "@/components/admin/action-form";
import { recordRefundPaid, retryRefund, stopRefund } from "@/app/admin/actions";
import type { AdminRefundRow } from "@/lib/billing/pending-refunds";

/**
 * The /admin/refunds view: what is owed, the three ways to settle it, and the
 * last month's settlements. Data loading and the allowlist live in the page.
 */
export function RefundQueue({ open, settled }: { open: AdminRefundRow[]; settled: AdminRefundRow[] }) {
  const owed = open.reduce((sum, row) => sum + (row.amountCents ?? 0), 0);
  // A total that silently skips an amount Paystack didn't return would
  // understate what is owed, so it is only shown when every amount is known.
  const learners = `${open.length} learner${open.length === 1 ? "" : "s"}`;
  const summary =
    open.length === 0
      ? "Nothing is owed."
      : open.every((row) => row.amountCents !== null)
        ? `${rand(owed)} owed to ${learners}.`
        : `Refunds owed to ${learners}.`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Refunds</h1>
        <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Paystack can only refund from takings it hasn&apos;t paid out yet, roughly the last two
          working days of sales. When that doesn&apos;t cover a money-back refund, it waits here.
          Retry it once new sales or a balance top-up cover it, or stop the retries, pay the learner
          back by EFT and record it. Refund from here rather than the Paystack dashboard, so the
          learner&apos;s plan and email follow.
        </p>
      </div>

      {open.length === 0 ? (
        <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
          No refunds are waiting. A money-back refund lands here only when Paystack refuses it.
        </Card>
      ) : (
        <div className="space-y-4">
          {open.map((row) => (
            <OpenRefund key={row.id} row={row} />
          ))}
        </div>
      )}

      {settled.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-base font-semibold">Settled in the last 30 days</h2>
          <Card className={cn(glassSubtle, "divide-y divide-border/60")}>
            {settled.map((row) => (
              <div key={row.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.name || row.email || row.user_id}</p>
                  <p className="text-2xs text-muted-foreground">{row.transaction_reference}</p>
                </div>
                <p className="break-words text-2xs text-muted-foreground">
                  {row.manual_reference
                    ? `EFT ${row.manual_reference} · recorded by ${row.manual_recorded_by ?? "admin"}`
                    : "Refunded by Paystack"}
                  {row.refunded_at ? ` · ${new Date(row.refunded_at).toLocaleDateString("en-ZA")}` : ""}
                </p>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}

function OpenRefund({ row }: { row: AdminRefundRow }) {
  const retrying = row.status === "queued";
  const stopped = row.status === "failed";
  const who = row.name || row.email || "this learner";
  const amount = row.amountCents === null ? "the charge" : rand(row.amountCents);
  return (
    <Card className={cn(glass, "space-y-4 p-5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-display text-base font-semibold">{row.name || row.email || row.user_id}</p>
          <p className="mt-1 break-words text-2xs text-muted-foreground">
            {row.email ?? "no email on file"} · {row.transaction_reference} · cancelled{" "}
            {new Date(row.created_at).toLocaleDateString("en-ZA")}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-semibold tabular-nums">
            {row.amountCents === null ? "—" : rand(row.amountCents)}
          </p>
          <p className="text-2xs text-muted-foreground tabular-nums">
            {row.attempts} automatic {row.attempts === 1 ? "try" : "tries"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {retrying ? (
          <Badge variant="outline">retrying daily</Badge>
        ) : (
          <Badge variant="warning">{stopped ? "retries stopped" : row.status.replaceAll("_", " ")}</Badge>
        )}
      </div>

      {row.last_error && <p className="text-sm text-muted-foreground">{row.last_error}</p>}

      <div className="flex flex-wrap items-start gap-3">
        <ActionForm
          action={retryRefund}
          submitLabel={row.status === "processing" ? "Check status" : "Retry now"}
          pendingLabel="Asking Paystack…"
          variant="secondary"
          confirm={`Ask Paystack to refund ${amount} to ${who}'s card now?`}
          resetOnSuccess={false}
        >
          <input type="hidden" name="id" value={row.id} />
        </ActionForm>
        {retrying && (
          <ActionForm
            action={stopRefund}
            submitLabel="Stop retries to repay by EFT"
            pendingLabel="Stopping…"
            variant="outline"
            confirm="Stop the automatic retries? Only do this if you're about to pay the learner back by EFT."
            resetOnSuccess={false}
          >
            <input type="hidden" name="id" value={row.id} />
          </ActionForm>
        )}
      </div>

      {stopped && (
        <ActionForm
          action={recordRefundPaid}
          submitLabel="Mark as refunded"
          pendingLabel="Recording…"
          confirm={`Confirm you have already sent ${amount} to ${who} by EFT. This ends their plan and emails them.`}
        >
          <input type="hidden" name="id" value={row.id} />
          <Field
            label="EFT reference"
            name="reference"
            required
            placeholder="FNB 2026-10-01"
            hint="Whatever your bank shows, so the refund can be matched later."
            className="max-w-sm"
          />
        </ActionForm>
      )}
    </Card>
  );
}
