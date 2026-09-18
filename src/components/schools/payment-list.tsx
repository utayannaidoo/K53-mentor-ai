import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { ActionForm, Field } from "@/components/admin/action-form";
import { voidPayment } from "@/app/schools/money-actions";
import { formatRand, METHOD_LABEL, type PaymentRow } from "@/lib/schools/money";

/**
 * A run of payments, newest first, as `divide-y` rows.
 *
 * A voided payment stays in the list — struck through, with who voided it and
 * why — because the ledger is append-only (0038) and a school reconciling its
 * cash box needs to see the mistake as well as the correction.
 */
export function PaymentList({
  payments,
  learnerNames,
  takenBy,
  canVoid,
  showLearner = true,
}: {
  payments: PaymentRow[];
  learnerNames: Map<string, string>;
  takenBy: Map<string, string>;
  canVoid: boolean;
  showLearner?: boolean;
}) {
  return (
    <>
      {payments.map((payment) => {
        const voided = payment.voided_at !== null;
        const refund = payment.amount_cents < 0;
        return (
          <div key={payment.id} className="space-y-2 p-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={cn(
                  "font-display text-base font-semibold tabular-nums",
                  voided && "text-muted-foreground line-through",
                  refund && !voided && "text-danger",
                )}
              >
                {refund ? `−${formatRand(-payment.amount_cents)}` : formatRand(payment.amount_cents)}
              </span>
              {showLearner ? (
                <Link
                  href={`/schools/learners/${payment.learner_id}`}
                  className="min-w-0 truncate font-medium hover:underline"
                >
                  {learnerNames.get(payment.learner_id) ?? "Learner"}
                </Link>
              ) : null}
              <Badge variant="outline">{METHOD_LABEL[payment.method]}</Badge>
              {refund ? <Badge variant="warning">refund</Badge> : null}
              {voided ? <Badge variant="secondary">void</Badge> : null}
            </div>
            <p className="text-2xs text-muted-foreground">
              {[
                formatDate(payment.received_on),
                takenBy.get(payment.received_by) ? `taken by ${takenBy.get(payment.received_by)}` : null,
                payment.reference ? `ref ${payment.reference}` : null,
                payment.note,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {voided ? (
              <p className="text-2xs text-muted-foreground">Voided: {payment.void_reason}</p>
            ) : canVoid ? (
              <details>
                <summary className="inline-flex min-h-10 cursor-pointer list-none items-center text-2xs text-muted-foreground hover:text-foreground">
                  Void this payment…
                </summary>
                <ActionForm
                  action={voidPayment}
                  submitLabel="Void"
                  pendingLabel="Voiding…"
                  variant="danger"
                  className="mt-2 space-y-2"
                  confirm="Void this payment? It stays on the record, crossed out, and stops counting."
                >
                  <input type="hidden" name="id" value={payment.id} />
                  <input type="hidden" name="learner_id" value={payment.learner_id} />
                  <Field label="Why" name="reason" placeholder="e.g. Counted twice" required />
                </ActionForm>
              </details>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
