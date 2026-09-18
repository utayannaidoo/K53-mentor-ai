import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, glass, glassFloat, glassSubtle } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { learnerProgress, lessonRecord } from "@/lib/schools/diary";
import { modulesForLicence, RATING_LABEL, type Rating } from "@/lib/schools/modules";
import { shortDateTime } from "@/lib/schools/time";
import { LICENCE_LABEL, learnerName } from "@/lib/schools/diary-types";
import { ActionForm, Field } from "@/components/admin/action-form";
import { TextAreaField } from "@/components/schools/fields";
import { recordLesson } from "@/app/schools/diary-actions";

export const metadata: Metadata = { title: "Lesson record" };

const RATING_VARIANT: Record<Rating, "secondary" | "warning" | "success"> = {
  1: "secondary",
  2: "warning",
  3: "success",
};

/**
 * What happened in one lesson.
 *
 * Built to be filled in the car in about thirty seconds: a line on what
 * happened, a line on what's next, and a tap per manoeuvre covered. Every
 * manoeuvre for the learner's licence is listed, collapsed; the fault list
 * under each is that manoeuvre's own K53 failure criteria, so there is
 * nothing to type. Saving marks the lesson done.
 */
export default async function LessonRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const { id } = await params;
  const record = await lessonRecord(school, id);
  if (!record) notFound();
  const { entry, learner, note, modules } = record;

  const catalogue = modulesForLicence(learner.licence_code);
  const progress = await learnerProgress(school, learner.id);
  const gridRating = new Map(progress.map((p) => [p.module_id, p.rating]));
  const thisLesson = new Map(modules.map((m) => [m.module_id, m]));
  const didNotHappen = ["cancelled_learner", "cancelled_school", "no_show"].includes(entry.status);
  const canRecord =
    school.access === "full" &&
    !didNotHappen &&
    (school.role === "owner" || entry.instructor_id === school.memberId);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/schools/learners/${learner.id}`}
          className="text-2xs text-muted-foreground hover:text-foreground"
        >
          ← {learnerName(learner)}
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">Lesson record</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {[
            shortDateTime(entry.starts_at, school.timezone),
            entry.instructorName,
            entry.vehicleLabel,
            LICENCE_LABEL[learner.licence_code],
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {didNotHappen ? (
        <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
          This lesson was cancelled or missed, so there is nothing to record against it.
        </Card>
      ) : canRecord ? (
        <ActionForm
          action={recordLesson}
          submitLabel="Save and mark done"
          pendingLabel="Saving…"
          resetOnSuccess={false}
        >
          <input type="hidden" name="lesson_id" value={entry.id} />
          <input type="hidden" name="licence_code" value={learner.licence_code} />

          <Card className={cn(glassFloat, "space-y-4 p-5")}>
            <TextAreaField
              label="What happened"
              name="summary"
              defaultValue={note?.summary}
              placeholder="Good control on the incline. Alley dock still needs three corrections."
              rows={3}
            />
            <Field
              label="Next lesson starts with"
              name="next_focus"
              defaultValue={note?.next_focus}
              placeholder="e.g. Alley docking — reference point at the first pole"
              hint="Shows on the learner's card, so whoever teaches them next knows where to begin."
            />
          </Card>

          <div className="space-y-3">
            <div>
              <h2 className="font-display text-base font-semibold">K53 manoeuvres covered</h2>
              <p className="mt-1 text-2xs text-muted-foreground">
                Rate only what you practised. Faults are the K53 test&apos;s own criteria for that
                manoeuvre.
              </p>
            </div>
            <Card className={cn(glass, "divide-y divide-border/50")}>
              {catalogue.map((module) => {
                const saved = thisLesson.get(module.id);
                const overall = gridRating.get(module.id);
                return (
                  <details key={module.id} open={Boolean(saved)} className="group p-4">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2">
                      <span className="min-w-0 flex-1 font-medium">{module.name}</span>
                      {saved ? (
                        <Badge variant={RATING_VARIANT[saved.rating]}>{RATING_LABEL[saved.rating]}</Badge>
                      ) : overall ? (
                        <span className="text-2xs text-muted-foreground">
                          last: {RATING_LABEL[overall]}
                        </span>
                      ) : null}
                      <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-90">
                        ›
                      </span>
                    </summary>

                    <div className="mt-3 space-y-3">
                      <fieldset>
                        <legend className="sr-only">Rating for {module.name}</legend>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: "", label: "Not covered" },
                            { value: "1", label: RATING_LABEL[1] },
                            { value: "2", label: RATING_LABEL[2] },
                            { value: "3", label: RATING_LABEL[3] },
                          ].map((option) => (
                            <label key={option.value} className="cursor-pointer">
                              <input
                                type="radio"
                                name={`rating:${module.id}`}
                                value={option.value}
                                defaultChecked={String(saved?.rating ?? "") === option.value}
                                className="peer sr-only"
                              />
                              <span className="inline-flex min-h-10 items-center rounded-full border border-border/70 px-3 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring/60">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {module.commonFaults.length > 0 ? (
                        <fieldset className="space-y-2">
                          <legend className="text-2xs uppercase tracking-wide text-muted-foreground">
                            Faults seen
                          </legend>
                          {module.commonFaults.map((fault) => (
                            <label key={fault} className="flex min-h-10 cursor-pointer items-start gap-3 text-sm">
                              <input
                                type="checkbox"
                                name={`fault:${module.id}`}
                                value={fault}
                                defaultChecked={saved?.faults.includes(fault)}
                                className="mt-0.5 size-5 shrink-0 accent-primary"
                              />
                              <span>{fault}</span>
                            </label>
                          ))}
                        </fieldset>
                      ) : null}
                    </div>
                  </details>
                );
              })}
            </Card>
          </div>
        </ActionForm>
      ) : (
        <ReadOnlyRecord note={note} modules={modules} catalogueNames={new Map(catalogue.map((m) => [m.id, m.name]))} />
      )}
    </div>
  );
}

function ReadOnlyRecord({
  note,
  modules,
  catalogueNames,
}: {
  note: { summary: string; next_focus: string | null } | null;
  modules: { module_id: string; rating: Rating; faults: string[] }[];
  catalogueNames: Map<string, string>;
}) {
  if (!note && modules.length === 0) {
    return (
      <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
        Nothing has been recorded for this lesson yet. Only the instructor who taught it, or the
        owner, can record it.
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {note ? (
        <Card className={cn(glassFloat, "space-y-2 p-5")}>
          <p className="text-sm">{note.summary || "No summary."}</p>
          {note.next_focus ? (
            <p className="text-sm text-muted-foreground">Next: {note.next_focus}</p>
          ) : null}
        </Card>
      ) : null}
      {modules.length > 0 ? (
        <Card className={cn(glass, "divide-y divide-border/50")}>
          {modules.map((m) => (
            <div key={m.module_id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 font-medium">{catalogueNames.get(m.module_id) ?? m.module_id}</span>
                <Badge variant={RATING_VARIANT[m.rating]}>{RATING_LABEL[m.rating]}</Badge>
              </div>
              {m.faults.length > 0 ? (
                <p className="mt-1 text-2xs text-muted-foreground">{m.faults.join(" · ")}</p>
              ) : null}
            </div>
          ))}
        </Card>
      ) : null}
    </div>
  );
}
