import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, glass, glassSubtle } from "@/lib/utils";
import { partnerSnapshot, summarise, rand } from "@/lib/partners/admin-data";
import { ActionForm, Field } from "@/components/admin/action-form";
import { createSchool } from "@/app/admin/actions";

const STATUS_VARIANT = {
  active: "success",
  pending: "warning",
  suspended: "danger",
} as const;

export default async function AdminSchools() {
  const snapshot = await partnerSnapshot();
  const summaries = snapshot ? summarise(snapshot) : [];
  // Anomalous volume first — the leak signal is useless if it has to be hunted.
  const ordered = [...summaries].sort((a, b) => {
    if (a.overThreshold !== b.overThreshold) return a.overThreshold ? -1 : 1;
    return b.attributedLast7 - a.attributedLast7;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Schools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sorted by attributions in the last 7 days, so anything unusual surfaces on its own.
        </p>
      </div>

      {ordered.length === 0 ? (
        <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
          No schools yet. Add the first one below — it goes live immediately with a code you can
          hand over.
        </Card>
      ) : (
        <Card className={cn(glass, "divide-y divide-border/50")}>
          {ordered.map((s) => (
            <Link
              key={s.school.id}
              href={`/admin/schools/${s.school.id}`}
              className="block p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 truncate font-medium">{s.school.name}</span>
                <Badge variant={STATUS_VARIANT[s.school.status]}>{s.school.status}</Badge>
                {s.overThreshold && <Badge variant="warning">review volume</Badge>}
                {s.heldCount > 0 && <Badge variant="warning">{s.heldCount} held</Badge>}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-2xs text-muted-foreground">
                <span>
                  code{" "}
                  <code className="font-mono text-foreground">
                    {s.activeCode?.code ?? "none active"}
                  </code>
                </span>
                <span className="tabular-nums">
                  {s.attributedLast7} in 7d / threshold {s.school.review_threshold}
                </span>
                <span className="tabular-nums">
                  {s.attributed} attributed · {s.converted} converted
                </span>
                <span className="tabular-nums">
                  payable {rand(s.payableCents)} · paid {rand(s.paidCents)}
                </span>
                {s.clawbackCents > 0 && (
                  <span className="tabular-nums text-danger">
                    clawback {rand(s.clawbackCents)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </Card>
      )}

      <Card className={cn(glass, "space-y-4 p-5")}>
        <div>
          <h2 className="font-display text-base font-semibold">Add a school</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Goes live straight away — use this for a school you have already spoken to. Leave the
            code blank to generate one from the name.
          </p>
        </div>
        <ActionForm action={createSchool} submitLabel="Create school" pendingLabel="Creating…">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="School name" name="name" required placeholder="Kasi Driving School" />
            <Field
              label="Referral code"
              name="code"
              placeholder="auto from name"
              hint="6–16 characters: a–z, 0–9, hyphens."
            />
            <Field label="Contact name" name="contact_name" required />
            <Field label="Contact email" name="contact_email" type="email" required />
            <Field label="Phone" name="contact_phone" />
            <Field label="Town" name="town" />
            <Field label="Province" name="province" />
            <Field label="Notes" name="notes" placeholder="How you met, what they agreed to" />
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
