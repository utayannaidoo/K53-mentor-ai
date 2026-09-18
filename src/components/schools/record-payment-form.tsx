import { ActionForm, Field } from "@/components/admin/action-form";
import { SelectField } from "@/components/schools/fields";
import { recordPayment } from "@/app/schools/money-actions";
import { METHOD_LABEL, type PaymentMethod } from "@/lib/schools/money";
import { learnerName, type Learner } from "@/lib/schools/diary-types";

/**
 * Take a payment — or record money given back.
 *
 * Either for a fixed learner (on their card) or with a learner picker (on the
 * money screen). The amount field takes whatever someone types: "450",
 * "R450", "450,50" and "1 200" all work (parseRand in money.ts).
 */
export function RecordPaymentForm({
  learners,
  learnerId,
  packageOptions,
  today,
}: {
  learners?: Learner[];
  learnerId?: string;
  packageOptions: { value: string; label: string }[];
  today: string;
}) {
  return (
    <ActionForm action={recordPayment} submitLabel="Record" pendingLabel="Recording…">
      {learnerId ? <input type="hidden" name="learner_id" value={learnerId} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {!learnerId && learners ? (
          <SelectField
            label="Who"
            name="learner_id"
            defaultValue=""
            options={[
              { value: "", label: "— choose —" },
              ...learners.map((l) => ({ value: l.id, label: learnerName(l) })),
            ]}
          />
        ) : null}
        <Field label="Amount (R)" name="amount" placeholder="e.g. 450" required />
        <SelectField
          label="How"
          name="method"
          defaultValue="cash"
          options={(Object.keys(METHOD_LABEL) as PaymentMethod[]).map((m) => ({
            value: m,
            label: METHOD_LABEL[m],
          }))}
        />
        <SelectField
          label="Money"
          name="direction"
          defaultValue="in"
          options={[
            { value: "in", label: "Paid to the school" },
            { value: "refund", label: "Refunded to the learner" },
          ]}
        />
        <Field label="Date" name="received_on" type="date" defaultValue={today} required />
        {packageOptions.length > 0 ? (
          <SelectField
            label="Towards"
            name="package_id"
            defaultValue=""
            options={[{ value: "", label: "Their account in general" }, ...packageOptions]}
          />
        ) : null}
        <Field label="Reference" name="reference" placeholder="EFT reference, receipt no." />
      </div>
    </ActionForm>
  );
}
