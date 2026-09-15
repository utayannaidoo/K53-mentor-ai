import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, glass, glassSubtle } from "@/lib/utils";
import { partnerSnapshot, summarise, rand, maskAccount } from "@/lib/partners/admin-data";
import { statementUrl } from "@/lib/partners/statement-token";
import { SITE_URL } from "@/lib/constants";
import { ActionForm, Field } from "@/components/admin/action-form";
import { setSchoolStatus, updateSchool, rotateCode, releaseHeld } from "@/app/admin/actions";

const COMMISSION_STATUS = {
  pending: "secondary",
  payable: "success",
  paid: "default",
  void: "danger",
} as const;

export default async function SchoolDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await partnerSnapshot();
  if (!snapshot) notFound();
  const summary = summarise(snapshot).find((s) => s.school.id === id);
  if (!summary) notFound();

  const { school, activeCode } = summary;
  const codes = snapshot.codes.filter((c) => c.school_id === id);
  const referrals = snapshot.referrals.filter((r) => r.school_id === id);
  const commissions = snapshot.commissions.filter((c) => c.school_id === id);
  const payouts = snapshot.payouts.filter((p) => p.school_id === id);
  const converted = new Set(commissions.map((c) => c.user_id));
  const statement = activeCode ? statementUrl(activeCode.code) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{school.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {school.contact_name} · {school.contact_email}
            {school.town ? ` · ${school.town}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={school.status === "active" ? "success" : school.status === "pending" ? "warning" : "danger"}>
            {school.status}
          </Badge>
          {(["active", "suspended"] as const)
            .filter((next) => next !== school.status)
            .map((next) => (
              <ActionForm
                key={next}
                action={setSchoolStatus}
                submitLabel={next === "active" ? "Activate" : "Suspend"}
                variant={next === "active" ? "secondary" : "danger"}
                className="space-y-0"
                confirm={
                  next === "suspended"
                    ? "Suspend this school? Its codes stop working immediately and held commissions stop maturing."
                    : undefined
                }
              >
                <input type="hidden" name="id" value={school.id} />
                <input type="hidden" name="status" value={next} />
              </ActionForm>
            ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Attributed", value: String(summary.attributed) },
          { label: "Converted", value: String(summary.converted) },
          { label: "Payable", value: rand(summary.payableCents) },
          { label: "Paid to date", value: rand(summary.paidCents) },
        ].map((stat) => (
          <Card key={stat.label} className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">{stat.value}</p>
          </Card>
        ))}
      </div>

      {summary.heldCount > 0 && (
        <Card className={cn(glass, "space-y-3 p-5")}>
          <h2 className="font-display text-base font-semibold">
            {summary.heldCount} commission{summary.heldCount === 1 ? "" : "s"} held for review
          </h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {commissions
              .filter((c) => c.status === "pending" && c.hold_reason)
              .map((c) => (
                <li key={c.id}>
                  {rand(c.amount_cents)} · {c.hold_reason}
                </li>
              ))}
          </ul>
          <ActionForm
            action={releaseHeld}
            submitLabel="Release for payment"
            variant="secondary"
            confirm="Release these for payment? Do this only once you have checked the volume is legitimate."
          >
            <input type="hidden" name="id" value={school.id} />
          </ActionForm>
        </Card>
      )}

      <Card className={cn(glass, "space-y-4 p-5")}>
        <div>
          <h2 className="font-display text-base font-semibold">Codes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rotating revokes every active code and issues a new one. Credit already earned is
            untouched — this only stops future claims.
          </p>
        </div>
        {activeCode && (
          <div className={cn(glassSubtle, "space-y-2 rounded-md p-4")}>
            <p className="font-mono text-lg font-semibold">{activeCode.code}</p>
            <p className="break-all text-2xs text-muted-foreground">
              {SITE_URL}/signup?school={activeCode.code}
            </p>
            {statement ? (
              <p className="break-all text-2xs text-muted-foreground">
                Statement link: {statement}
              </p>
            ) : (
              <p className="text-2xs text-warning">
                No statement link — set PARTNER_SECRET or CRON_SECRET.
              </p>
            )}
          </div>
        )}
        {codes.length > 1 && (
          <ul className="space-y-1 text-2xs text-muted-foreground">
            {codes
              .filter((c) => c.status === "revoked")
              .map((c) => (
                <li key={c.id}>
                  <code className="font-mono line-through">{c.code}</code> revoked
                  {c.revoked_reason ? ` — ${c.revoked_reason}` : ""}
                </li>
              ))}
          </ul>
        )}
        <ActionForm
          action={rotateCode}
          submitLabel="Rotate code"
          variant="outline"
          confirm="Rotate the code? Anything already printed with the old one stops working."
        >
          <input type="hidden" name="id" value={school.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New code" name="code" required placeholder="kasi-2027" />
            <Field label="Reason" name="reason" required placeholder="Leaked to a deals page" />
          </div>
        </ActionForm>
      </Card>

      <Card className={cn(glass, "space-y-4 p-5")}>
        <div>
          <h2 className="font-display text-base font-semibold">Settings &amp; bank details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Account on file: {maskAccount(school.bank_account_number)}. The full number appears only
            in the payout CSV.
          </p>
        </div>
        <ActionForm action={updateSchool} submitLabel="Save" variant="secondary">
          <input type="hidden" name="id" value={school.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Commission (cents)"
              name="commission_cents"
              type="number"
              defaultValue={school.commission_cents}
              hint="2000 = R20. Flat, whatever plan the learner buys."
            />
            <Field
              label="Review threshold"
              name="review_threshold"
              type="number"
              defaultValue={school.review_threshold}
              hint="Attributions per 7 days before commissions hold for review."
            />
            <Field
              label="Monthly commission cap"
              name="monthly_commission_cap"
              type="number"
              defaultValue={school.monthly_commission_cap}
              hint="Blast-radius ceiling. Over it, commissions hold rather than mature."
            />
            <Field label="Account holder" name="bank_account_name" defaultValue={school.bank_account_name} />
            <Field label="Bank" name="bank_name" defaultValue={school.bank_name} />
            <Field label="Account number" name="bank_account_number" defaultValue={school.bank_account_number} />
            <Field label="Branch code" name="bank_branch_code" defaultValue={school.bank_branch_code} />
            <Field label="Notes" name="notes" defaultValue={school.notes} />
          </div>
        </ActionForm>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold">Learners ({referrals.length})</h2>
        {referrals.length === 0 ? (
          <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
            Nobody has used this school&apos;s code yet.
          </Card>
        ) : (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {referrals.slice(0, 100).map((r) => {
              const commission = commissions.find((c) => c.user_id === r.user_id);
              return (
                <div key={r.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
                  <span className="tabular-nums text-muted-foreground">
                    {new Date(r.attributed_at).toLocaleDateString("en-ZA")}
                  </span>
                  <Badge variant="outline">{r.source}</Badge>
                  <code className="font-mono text-2xs text-muted-foreground">{r.code_used}</code>
                  <span className="ml-auto">
                    {commission ? (
                      <Badge variant={COMMISSION_STATUS[commission.status]}>
                        {commission.status} · {rand(commission.amount_cents)}
                      </Badge>
                    ) : (
                      <span className="text-2xs text-muted-foreground">
                        {converted.has(r.user_id) ? "—" : "not converted"}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </Card>
        )}
      </section>

      {payouts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-base font-semibold">Payout history</h2>
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {payouts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
                <span className="tabular-nums text-muted-foreground">
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-ZA") : "—"}
                </span>
                <span className="font-mono text-2xs">{p.payment_reference}</span>
                <span className="text-2xs text-muted-foreground">
                  {p.commission_count} commission{p.commission_count === 1 ? "" : "s"}
                </span>
                <span className="ml-auto tabular-nums font-semibold">{rand(p.total_cents)}</span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
