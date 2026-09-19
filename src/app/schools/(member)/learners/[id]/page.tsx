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
import { learnerLedger, memberNamesByUser } from "@/lib/schools/ledger";
import { formatRand, learnerBalance, packageChoices, packageUsage } from "@/lib/schools/money";
import { PaymentList } from "@/components/schools/payment-list";
import { RecordPaymentForm } from "@/components/schools/record-payment-form";
import { sellPackage, setPackageStatus } from "@/app/schools/money-actions";
import { learnerTestResults } from "@/lib/schools/pipeline";
import { TEST_DOCUMENTS } from "@/lib/schools/test-day";
import { recordTestResult, setDocuments } from "@/app/schools/enquiry-actions";
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
import { createLearnerLinkCode, disconnectLearner } from "@/app/schools/actions";
import { linkPanelFor } from "@/lib/schools/learner-link";
import { SITE_URL } from "@/lib/constants";

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

  const [instructors, vehicles, learners, progress, focus, ledger, takenBy, results, link] = await Promise.all([
    schoolInstructors(school),
    schoolVehicles(school),
    schoolLearners(school),
    learnerProgress(school, learner.id),
    latestFocus(school, learner.id),
    learnerLedger(school, learner.id),
    memberNamesByUser(school),
    learnerTestResults(school, learner.id),
    linkPanelFor(school, learner),
  ]);
  const haveDocs = new Set(learner.documents ?? []);
  const balance = learnerBalance(learner.id, ledger.packages, ledger.payments, ledger.lessons).balanceCents;
  const choices = packageChoices(ledger.packages, ledger.lessons, new Map(), learner.id);
  const canCorrect = school.access === "full" && school.role !== "instructor";
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
  const linkWa = link.code
    ? whatsappLink(
        learner.phone,
        `Hi ${learner.first_name}, to see your lessons and progress from ${school.name} in K53 Mentor, open ${SITE_URL}/account/school and enter code ${link.code.code}.`,
      )
    : null;

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
              packageOptions={choices}
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

      {/* ── Their own K53 Mentor app (0043) ─────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Their K53 Mentor app</h2>
        {learner.link_consent_at ? (
          <Card className={cn(glass, "space-y-4 p-5")}>
            <p className="text-sm text-muted-foreground">
              {learner.first_name} connected their app on {formatDate(learner.link_consent_at)}. You see what
              they agreed to share: their readiness for the learner&apos;s test, and how strong they are in
              each part of it.
            </p>
            {link.summary && (link.summary.readiness !== null || link.summary.categories.length > 0) ? (
              <>
                <div className={cn(glassSubtle, "rounded-md p-4")}>
                  <p className="text-2xs uppercase tracking-wide text-muted-foreground">Readiness</p>
                  <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                    {link.summary.readiness === null ? "—" : `${link.summary.readiness}%`}
                  </p>
                  {link.summary.readinessDay ? (
                    <p className="mt-0.5 text-2xs text-muted-foreground">
                      updated {formatDate(link.summary.readinessDay)}
                    </p>
                  ) : null}
                </div>
                {link.summary.categories.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {link.summary.categories.map((c) => (
                      <div key={c.categoryId} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                        <span className="min-w-0 flex-1">{c.name}</span>
                        <span
                          className={cn(
                            "tabular-nums",
                            c.enough && c.strength < 60 ? "font-semibold text-danger" : "text-muted-foreground",
                          )}
                        >
                          {c.enough ? `${c.strength}%` : "too early to tell"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm">Nothing to show yet: they haven&apos;t studied in the app since connecting.</p>
            )}
            <ActionForm
              action={disconnectLearner}
              submitLabel="Disconnect"
              variant="ghost"
              className="space-y-0"
              confirm={`Disconnect ${learner.first_name}'s app? You stop seeing their progress and they stop seeing their lessons in the app. They can connect again with a new code.`}
            >
              <input type="hidden" name="learner" value={learner.id} />
            </ActionForm>
          </Card>
        ) : (
          <Card className={cn(glass, "space-y-3 p-5")}>
            <p className="text-sm text-muted-foreground">
              If {learner.first_name} studies with K53 Mentor, connect their app. They see their next lesson,
              their manoeuvre ratings, the notes you choose to share and what they owe. You see their
              readiness and weak spots. They agree to it on their own phone.
            </p>
            {link.code ? (
              <div className="flex flex-wrap items-center gap-3">
                <code className="font-mono text-lg font-semibold tracking-wider">{link.code.code}</code>
                <span className="text-2xs text-muted-foreground">expires {formatDate(link.code.expiresAt)}</span>
                {linkWa ? (
                  <a
                    href={linkWa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "press")}
                  >
                    Send on WhatsApp
                  </a>
                ) : null}
              </div>
            ) : null}
            {canWrite ? (
              <ActionForm
                action={createLearnerLinkCode}
                submitLabel={link.code ? "Make a new code" : "Make a code"}
                pendingLabel="Making…"
                variant="secondary"
                className="space-y-0"
              >
                <input type="hidden" name="learner" value={learner.id} />
              </ActionForm>
            ) : null}
          </Card>
        )}
      </div>

      {/* ── Test day ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold">Test day</h2>
          <p className="text-sm text-muted-foreground">
            {learner.test_date
              ? `${formatDate(learner.test_date)}${learner.test_centre ? ` · ${learner.test_centre}` : ""}`
              : "No test booked"}
          </p>
        </div>
        <Card className={cn(glass, "p-5")}>
          {canWrite ? (
            <ActionForm action={setDocuments} submitLabel="Save checklist" variant="secondary" resetOnSuccess={false}>
              <input type="hidden" name="learner_id" value={learner.id} />
              <fieldset className="space-y-1">
                <legend className="mb-1 text-2xs uppercase tracking-wide text-muted-foreground">
                  Bring on the day · {haveDocs.size} of {TEST_DOCUMENTS.length} ready
                </legend>
                {TEST_DOCUMENTS.map((doc) => (
                  <label key={doc.id} className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      name="documents"
                      value={doc.id}
                      defaultChecked={haveDocs.has(doc.id)}
                      className="size-5 shrink-0 accent-primary"
                    />
                    <span>{doc.label}</span>
                  </label>
                ))}
              </fieldset>
            </ActionForm>
          ) : (
            <p className="text-sm text-muted-foreground">
              {haveDocs.size} of {TEST_DOCUMENTS.length} documents ready.
            </p>
          )}
        </Card>

        {results.length > 0 ? (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {results.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 font-medium">
                    {r.test_type === "drivers" ? "Driver’s test" : "Learner’s test"}
                  </span>
                  <Badge variant={r.result === "passed" ? "success" : "danger"}>{r.result}</Badge>
                </div>
                <p className="mt-1 text-2xs text-muted-foreground">
                  {[formatDate(r.taken_on), r.centre, r.notes].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </Card>
        ) : null}

        {canWrite ? (
          <details className="group">
            <summary className="cursor-pointer list-none">
              <span className={cn(buttonVariants({ variant: "secondary" }), "press")}>Record a test result</span>
            </summary>
            <Card className={cn(glass, "mt-3 p-5")}>
              <ActionForm action={recordTestResult} submitLabel="Record result" pendingLabel="Saving…">
                <input type="hidden" name="learner_id" value={learner.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Test"
                    name="test_type"
                    defaultValue={learner.stage === "learners" ? "learners" : "drivers"}
                    options={[
                      { value: "drivers", label: "Driver’s licence" },
                      { value: "learners", label: "Learner’s licence" },
                    ]}
                  />
                  <SelectField
                    label="Result"
                    name="result"
                    defaultValue="passed"
                    options={[
                      { value: "passed", label: "Passed" },
                      { value: "failed", label: "Failed" },
                    ]}
                  />
                  <Field label="Date" name="taken_on" type="date" defaultValue={learner.test_date ?? today} required />
                  <Field label="Testing centre" name="centre" defaultValue={learner.test_centre} />
                  <SelectField
                    label="Prepared by"
                    name="instructor_id"
                    defaultValue={learner.assigned_instructor_id ?? ""}
                    options={[
                      { value: "", label: "—" },
                      ...instructors.map((i) => ({ value: i.id, label: i.displayName })),
                    ]}
                  />
                  <Field label="Notes" name="notes" placeholder="e.g. Rolled back on the incline" />
                </div>
              </ActionForm>
            </Card>
          </details>
        ) : null}
      </div>

      {/* ── Money ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold">Money</h2>
          <p
            className={cn(
              "font-display text-base font-semibold tabular-nums",
              balance > 0 ? "text-primary" : "text-muted-foreground",
            )}
          >
            {balance > 0 ? `Owes ${formatRand(balance)}` : balance < 0 ? `In credit ${formatRand(-balance)}` : "Paid up"}
          </p>
        </div>

        {ledger.packages.length > 0 ? (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {ledger.packages.map((pkg) => {
              const usage = packageUsage(pkg, ledger.lessons);
              return (
                <div key={pkg.id} className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 font-medium">{pkg.name}</span>
                    <span className="tabular-nums">{formatRand(pkg.price_cents)}</span>
                    {pkg.status !== "active" ? <Badge variant="secondary">{pkg.status}</Badge> : null}
                  </div>
                  <p className="text-2xs text-muted-foreground">
                    {[
                      `${usage.used} used`,
                      usage.booked ? `${usage.booked} booked` : null,
                      usage.left !== null ? `${usage.left} left` : null,
                      `sold ${formatDate(pkg.sold_on)}`,
                      pkg.expires_on ? `expires ${formatDate(pkg.expires_on)}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {canCorrect ? (
                    <ActionForm
                      action={setPackageStatus}
                      submitLabel="Update"
                      variant="ghost"
                      className="flex flex-wrap items-end gap-2 space-y-0"
                      resetOnSuccess={false}
                    >
                      <input type="hidden" name="id" value={pkg.id} />
                      <SelectField
                        label="Status"
                        name="status"
                        defaultValue={pkg.status}
                        className="min-w-40"
                        options={[
                          { value: "active", label: "Active" },
                          { value: "used", label: "Used up" },
                          { value: "expired", label: "Expired" },
                          { value: "refunded", label: "Refunded" },
                        ]}
                      />
                    </ActionForm>
                  ) : null}
                </div>
              );
            })}
          </Card>
        ) : null}

        {ledger.payments.length > 0 ? (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            <PaymentList
              payments={ledger.payments}
              learnerNames={new Map([[learner.id, name]])}
              takenBy={takenBy}
              canVoid={canCorrect}
              showLearner={false}
            />
          </Card>
        ) : ledger.packages.length === 0 ? (
          <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
            No packages or payments yet.
          </Card>
        ) : null}

        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <details className="group w-full">
              <summary className="cursor-pointer list-none">
                <span className={cn(buttonVariants({ variant: "secondary" }), "press")}>Record a payment</span>
              </summary>
              <Card className={cn(glass, "mt-3 p-5")}>
                <RecordPaymentForm learnerId={learner.id} packageOptions={choices} today={today} />
              </Card>
            </details>
            <details className="group w-full">
              <summary className="cursor-pointer list-none">
                <span className={cn(buttonVariants({ variant: "secondary" }), "press")}>Sell a package</span>
              </summary>
              <Card className={cn(glass, "mt-3 p-5")}>
                <ActionForm action={sellPackage} submitLabel="Add package" pendingLabel="Adding…">
                  <input type="hidden" name="learner_id" value={learner.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" name="name" placeholder="e.g. 10 lessons" required />
                    <Field label="Price (R)" name="price" placeholder="e.g. 2800" required />
                    <Field label="Lessons included" name="lessons_included" type="number" placeholder="10" hint="Leave blank for an open amount." />
                    <Field label="Sold on" name="sold_on" type="date" defaultValue={today} required />
                    <Field label="Expires (optional)" name="expires_on" type="date" />
                  </div>
                </ActionForm>
              </Card>
            </details>
          </div>
        ) : null}
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
