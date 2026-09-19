import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle, formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { schoolInstructors, schoolLearners } from "@/lib/schools/diary";
import {
  LICENCE_LABEL,
  STATUS_LABEL,
  learnerName,
  type LearnerStatus,
} from "@/lib/schools/diary-types";
import { ActionForm, Field } from "@/components/admin/action-form";
import { SelectField } from "@/components/schools/fields";
import { addLearner } from "@/app/schools/diary-actions";

export const metadata: Metadata = { title: "Learners" };

/** Who counts as "on the books" by default: anyone not finished or gone. */
const FILTERS: { key: string; label: string; statuses?: LearnerStatus[] }[] = [
  { key: "current", label: "Current", statuses: ["enquiry", "active", "paused"] },
  { key: "passed", label: "Passed", statuses: ["passed"] },
  { key: "left", label: "Left", statuses: ["left"] },
  { key: "all", label: "Everyone" },
];

const STATUS_VARIANT: Record<LearnerStatus, "default" | "secondary" | "success" | "warning" | "outline"> = {
  enquiry: "warning",
  active: "default",
  paused: "secondary",
  passed: "success",
  left: "outline",
};

export default async function SchoolLearners({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const { show } = await searchParams;
  const filter = FILTERS.find((f) => f.key === show) ?? FILTERS[0];

  const [learners, instructors] = await Promise.all([
    schoolLearners(school, filter.statuses),
    schoolInstructors(school),
  ]);
  const instructorName = new Map(instructors.map((i) => [i.id, i.displayName]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Learners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {learners.length} {filter.key === "all" ? "in total" : filter.label.toLowerCase()}
        </p>
      </div>

      <nav aria-label="Filter learners" className="flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "current" ? "/schools/learners" : `/schools/learners?show=${f.key}`}
            aria-current={f.key === filter.key ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full px-3",
              f.key === filter.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {learners.length === 0 ? (
        <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
          {filter.key === "current"
            ? "No learners yet. Add the first one below — a name and a phone number is enough to start booking."
            : "Nobody here."}
        </Card>
      ) : (
        <Card className={cn(glass, "divide-y divide-border/50")}>
          {learners.map((learner) => {
            const instructor = learner.assigned_instructor_id
              ? instructorName.get(learner.assigned_instructor_id)
              : null;
            return (
              <Link
                key={learner.id}
                href={`/schools/learners/${learner.id}`}
                className="block p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-medium">{learnerName(learner)}</span>
                  <Badge variant="outline">{LICENCE_LABEL[learner.licence_code]}</Badge>
                  {learner.status !== "active" ? (
                    <Badge variant={STATUS_VARIANT[learner.status]}>{STATUS_LABEL[learner.status]}</Badge>
                  ) : null}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-2xs text-muted-foreground">
                  {instructor ? <span>{instructor}</span> : null}
                  {learner.phone ? <span className="tabular-nums">{learner.phone}</span> : null}
                  {learner.test_date ? (
                    <span>
                      Test {formatDate(learner.test_date)}
                      {learner.test_centre ? ` · ${learner.test_centre}` : ""}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </Card>
      )}

      {school.access === "full" ? (
        <details className="group" open={learners.length === 0 && filter.key === "current"}>
          <summary className="cursor-pointer list-none">
            <span className={cn(buttonVariants(), "press")}>Add a learner</span>
          </summary>
          <Card className={cn(glass, "mt-3 p-5")}>
            <ActionForm action={addLearner} submitLabel="Add learner" pendingLabel="Adding…">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" name="first_name" required />
                <Field label="Surname" name="last_name" />
                <Field label="Phone" name="phone" type="tel" placeholder="082 123 4567" hint="Used for WhatsApp reminders." />
                <Field label="Email (optional)" name="email" type="email" />
                <SelectField
                  label="Licence"
                  name="licence_code"
                  defaultValue="8"
                  options={(Object.keys(LICENCE_LABEL) as (keyof typeof LICENCE_LABEL)[]).map((code) => ({
                    value: code,
                    label: LICENCE_LABEL[code],
                  }))}
                />
                <SelectField
                  label="Instructor"
                  name="assigned_instructor_id"
                  defaultValue={school.role === "instructor" ? school.memberId : ""}
                  options={[
                    { value: "", label: "Not assigned yet" },
                    ...instructors.map((i) => ({ value: i.id, label: i.displayName })),
                  ]}
                />
              </div>
            </ActionForm>
          </Card>
        </details>
      ) : null}
    </div>
  );
}
