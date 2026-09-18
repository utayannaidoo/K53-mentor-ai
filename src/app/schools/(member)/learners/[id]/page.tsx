import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassFloat, glassSubtle, formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import {
  latestFocus,
  learnerProgress,
  learnerWithLessons,
  schoolInstructors,
  schoolLearners,
  schoolVehicles,
} from "@/lib/schools/diary";
import { modulesForLicence, RATING_LABEL, readiness, type Rating } from "@/lib/schools/modules";
import { longDay, schoolDay, clockTime } from "@/lib/schools/time";
import {
  LICENCE_LABEL,
  STATUS_LABEL,
  learnerName,
  nextLesson,
  whatsappLink,
  type LearnerStatus,
} from "@/lib/schools/diary-types";
import { LessonRow } from "@/components/schools/lesson-row";
import { BookLessonForm } from "@/components/schools/book-lesson-form";
import { ActionForm, Field } from "@/components/admin/action-form";
import { SelectField, TextAreaField } from "@/components/schools/fields";
import { updateLearner } from "@/app/schools/diary-actions";

export const metadata: Metadata = { title: "Learner" };

/**
 * One learner: who they are, what's next, and everything that has happened.
 *
 * "What's next" leads, because it is the question an instructor asks of this
 * page most — the next lesson, with the car, the pickup, and what the last
 * instructor said it should start with. The K53 grid below it is the latest
 * rating for every manoeuvre on this learner's licence.
 */

const RATING_VARIANT: Record<Rating, "secondary" | "warning" | "success"> = {
  1: "secondary",
  2: "warning",
  3: "success",
};
export default async function LearnerCard({ params }: { params: Promise<{ id: string }> }) {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const { id } = await params;

  const detail = await learnerWithLessons(school, id);
  if (!detail) notFound();
  const { learner, lessons } = detail;

  const [instructors, vehicles, learners, progress, focus] = await Promise.all([
    schoolInstructors(school),
    schoolVehicles(school),
    schoolLearners(school),
    learnerProgress(school, learner.id),
    latestFocus(school, learner.id),
  ]);
  const catalogue = modulesForLicence(learner.licence_code);
  const progressById = new Map(progress.map((p) => [p.module_id, p]));
  const score = readiness(learner.licence_code, progress);
  const upcoming = nextLesson(lessons);
  const name = learnerName(learner);
  const assigned = instructors.find((i) => i.id === learner.assigned_instructor_id);
  const canWrite = school.access === "full";
  const today = schoolDay(new Date(), school.timezone);
  const completed = lessons.filter((l) => l.status === "completed").length;
  const noShows = lessons.filter((l) => l.status === "no_show").length;
  const wa = whatsappLink(learner.phone, `Hi ${learner.first_name}, this is ${school.name}.`);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/schools/learners" className="text-2xs text-muted-foreground hover:text-foreground">
          ← Learners
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 font-display text-2xl font-semibold tracking-tight">{name}</h1>
          <Badge variant="outline">{LICENCE_LABEL[learner.licence_code]}</Badge>
          <Badge variant={learner.status === "passed" ? "success" : learner.status === "active" ? "default" : "secondary"}>
            {STATUS_LABEL[learner.status]}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {assigned ? `${assigned.displayName} teaches ${learner.first_name}` : "No instructor assigned"}
        </p>
      </div>

      {/* ── Next lesson ─────────────────────────────────────────────────── */}
      <Card className={cn(glassFloat, "space-y-2 p-5")}>
        <p className="text-2xs uppercase tracking-wide text-muted-foreground">Next lesson</p>
        {upcoming ? (
          <>
            <p className="font-display text-xl font-semibold">
              {schoolDay(new Date(upcoming.starts_at), school.timezone) === today
                ? "Today"
                : longDay(schoolDay(new Date(upcoming.starts_at), school.timezone))}
              , {clockTime(upcoming.starts_at, school.timezone)}
            </p>
            <p className="text-sm text-muted-foreground">
              {[upcoming.instructorName, upcoming.vehicleLabel, upcoming.pickup_address && `Pickup: ${upcoming.pickup_address}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Nothing booked yet.</p>
        )}
        {focus ? (
          <p className="border-t border-border/50 pt-2 text-sm">
            <span className="text-muted-foreground">Starts with: </span>
            {focus.nextFocus}
          </p>
        ) : null}
      </Card>

      {/* ── At a glance ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Lessons done", value: String(completed) },
          { label: "No-shows", value: String(noShows) },
          { label: "Test", value: learner.test_date ? formatDate(learner.test_date) : "—" },
        ].map((stat) => (
          <Card key={stat.label} className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">{stat.value}</p>
          </Card>
        ))}
      </div>

      {learner.phone ? (
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${learner.phone.replace(/\s/g, "")}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "press")}>
            Call {learner.phone}
          </a>
          {wa ? (
            <a href={wa} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "press")}>
              WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}

      {/* ── Book the next one ───────────────────────────────────────────── */}
      {canWrite && learner.status !== "left" && learner.status !== "passed" ? (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <span className={cn(buttonVariants(), "press")}>Book a lesson for {learner.first_name}</span>
          </summary>
          <Card className={cn(glass, "mt-3 p-5")}>
            <BookLessonForm
              school={school}
              learners={learners}
              instructors={instructors}
              vehicles={vehicles}
              day={today}
              defaultTime="08:00"
              defaultLearnerId={learner.id}
            />
          </Card>
        </details>
      ) : null}

      {/* ── K53 progress ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold">K53 manoeuvres</h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {score.ready} of {score.total}
            </span>{" "}
            test-ready
          </p>
        </div>
        <Card className={cn(glass, "divide-y divide-border/50")}>
          {catalogue.map((module) => {
            const row = progressById.get(module.id);
            return (
              <div key={module.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 font-medium">{module.name}</span>
                  {row ? (
                    <Badge variant={RATING_VARIANT[row.rating]}>{RATING_LABEL[row.rating]}</Badge>
                  ) : (
                    <span className="text-2xs text-muted-foreground">Not started</span>
                  )}
                </div>
                {row && row.faults.length > 0 && row.rating < 3 ? (
                  <p className="mt-1 text-2xs text-muted-foreground">{row.faults.join(" · ")}</p>
                ) : null}
              </div>
            );
          })}
        </Card>
      </div>

      {/* ── History ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Lessons</h2>
        {lessons.length === 0 ? (
          <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
            No lessons yet.
          </Card>
        ) : (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                timezone={school.timezone}
                schoolName={school.name}
                showDate
                linkLearner={false}
                canEdit={canWrite && (school.role !== "instructor" || lesson.instructor_id === school.memberId)}
              />
            ))}
          </Card>
        )}
      </div>

      {/* ── Details ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Details</h2>
        <Card className={cn(glass, "p-5")}>
          {canWrite ? (
            <ActionForm action={updateLearner} submitLabel="Save" pendingLabel="Saving…" resetOnSuccess={false}>
              <input type="hidden" name="id" value={learner.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Status"
                  name="status"
                  defaultValue={learner.status}
                  options={(Object.keys(STATUS_LABEL) as LearnerStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                />
                <SelectField
                  label="Instructor"
                  name="assigned_instructor_id"
                  defaultValue={learner.assigned_instructor_id ?? ""}
                  options={[
                    { value: "", label: "Not assigned" },
                    ...instructors.map((i) => ({ value: i.id, label: i.displayName })),
                  ]}
                />
                <Field label="Phone" name="phone" type="tel" defaultValue={learner.phone} />
                <Field label="Test date" name="test_date" type="date" defaultValue={learner.test_date} />
                <Field label="Testing centre" name="test_centre" defaultValue={learner.test_centre} placeholder="e.g. Waltloo" />
              </div>
              <TextAreaField
                label="Notes"
                name="notes"
                defaultValue={learner.notes}
                placeholder="Anything the next instructor should know."
                hint="Only your school sees this."
              />
            </ActionForm>
          ) : (
            <p className="text-sm text-muted-foreground">
              {learner.notes || "No notes."}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
