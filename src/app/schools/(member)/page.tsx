import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { diaryForDay, schoolInstructors, schoolLearners, schoolVehicles } from "@/lib/schools/diary";
import { schoolLedger } from "@/lib/schools/ledger";
import { packageChoices } from "@/lib/schools/money";
import { learnerName } from "@/lib/schools/diary-types";
import { isIsoDay, longDay, schoolDay, shiftDay } from "@/lib/schools/time";
import { LessonRow } from "@/components/schools/lesson-row";
import { BookLessonForm } from "@/components/schools/book-lesson-form";

export const metadata: Metadata = { title: "Diary" };

/**
 * The diary — the instructor's landing page.
 *
 * One day at a time, in time order, because that is how the day is lived:
 * who, when, which car, where to fetch them. An instructor sees their own day
 * by default and can switch to the whole school's; the owner and the office
 * see everyone. `?day=YYYY-MM-DD` walks the calendar.
 */
export default async function SchoolDiary({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; who?: string }>;
}) {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const params = await searchParams;
  const today = schoolDay(new Date(), school.timezone);
  const day = isIsoDay(params.day) ? params.day : today;
  const isInstructor = school.role === "instructor";
  const showEveryone = !isInstructor || params.who === "all";

  const [entries, learners, instructors, vehicles, ledger] = await Promise.all([
    diaryForDay(school, day, showEveryone ? undefined : school.memberId),
    schoolLearners(school),
    schoolInstructors(school),
    schoolVehicles(school),
    schoolLedger(school),
  ]);
  const packageOptions = packageChoices(
    ledger.packages,
    ledger.lessons,
    new Map(learners.map((l) => [l.id, learnerName(l)])),
  );

  const heading =
    day === today ? "Today" : day === shiftDay(today, 1) ? "Tomorrow" : day === shiftDay(today, -1) ? "Yesterday" : longDay(day);
  const dayLink = (target: string) => {
    const query = new URLSearchParams();
    if (target !== today) query.set("day", target);
    if (isInstructor && showEveryone) query.set("who", "all");
    const qs = query.toString();
    return qs ? `/schools?${qs}` : "/schools";
  };
  const whoLink = (all: boolean) => {
    const query = new URLSearchParams();
    if (day !== today) query.set("day", day);
    if (all) query.set("who", "all");
    const qs = query.toString();
    return qs ? `/schools?${qs}` : "/schools";
  };

  // The next whole hour on today's view; a sensible morning start otherwise.
  const hourNow = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: school.timezone, hour: "2-digit", hourCycle: "h23" }).format(new Date()),
  );
  const defaultTime =
    day === today && hourNow < 18 ? `${String(Math.max(hourNow + 1, 7)).padStart(2, "0")}:00` : "08:00";

  const live = entries.filter((e) => e.status === "scheduled").length;
  const canWrite = school.access === "full";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {heading === longDay(day) ? "" : `${longDay(day)} · `}
            {entries.length === 0
              ? "Nothing booked"
              : `${entries.length} ${entries.length === 1 ? "booking" : "bookings"}${live ? `, ${live} still to go` : ""}`}
          </p>
        </div>
        <nav aria-label="Change day" className="flex items-center gap-1">
          <Link href={dayLink(shiftDay(day, -1))} className={cn(buttonVariants({ variant: "ghost" }), "press")} aria-label="Previous day">
            ←
          </Link>
          {day !== today ? (
            <Link href={dayLink(today)} className={cn(buttonVariants({ variant: "secondary" }), "press")}>
              Today
            </Link>
          ) : null}
          <Link href={dayLink(shiftDay(day, 1))} className={cn(buttonVariants({ variant: "ghost" }), "press")} aria-label="Next day">
            →
          </Link>
        </nav>
      </div>

      {isInstructor ? (
        <div className="flex gap-2 text-sm">
          <Link
            href={whoLink(false)}
            aria-current={!showEveryone ? "page" : undefined}
            className={cn("inline-flex min-h-10 items-center rounded-full px-3", !showEveryone ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            My day
          </Link>
          <Link
            href={whoLink(true)}
            aria-current={showEveryone ? "page" : undefined}
            className={cn("inline-flex min-h-10 items-center rounded-full px-3", showEveryone ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            Whole school
          </Link>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
          Nothing on the diary for this day. Book a lesson below and it shows up here, in time order,
          with the car and where to fetch the learner.
        </Card>
      ) : (
        <Card className={cn(glass, "divide-y divide-border/50")}>
          {entries.map((entry) => (
            <LessonRow
              key={entry.id}
              lesson={entry}
              timezone={school.timezone}
              schoolName={school.name}
              canEdit={
                canWrite &&
                (school.role !== "instructor" || entry.instructor_id === school.memberId)
              }
            />
          ))}
        </Card>
      )}

      {canWrite ? (
        <details className="group" open={entries.length === 0 && learners.length > 0}>
          <summary className="cursor-pointer list-none">
            <span className={cn(buttonVariants({ variant: "default" }), "press")}>Book a lesson</span>
          </summary>
          <Card className={cn(glass, "mt-3 p-5")}>
            <BookLessonForm
              school={school}
              learners={learners}
              instructors={instructors}
              vehicles={vehicles}
              day={day}
              defaultTime={defaultTime}
              packageOptions={packageOptions}
            />
          </Card>
        </details>
      ) : null}

      {learners.length === 0 ? (
        <Card className={cn(glass, "divide-y divide-border/50")}>
          <SetupStep
            title="Add your learners"
            body="Everyone you teach, with a phone number so the diary can WhatsApp them."
            href="/schools/learners"
            action="Add"
          />
          {school.role === "owner" ? (
            <SetupStep
              title="Invite your instructors"
              body={`${school.seatsUsed} of ${school.seats} seats used. Each instructor gets their own diary.`}
              href="/schools/settings"
              action="Invite"
            />
          ) : null}
          {school.role !== "instructor" && vehicles.length === 0 ? (
            <SetupStep
              title="Add your vehicles"
              body="So the diary can stop two instructors booking the same car."
              href="/schools/vehicles"
              action="Add"
            />
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

function SetupStep({ title, body, href, action }: { title: string; body: string; href: string; action: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-2xs text-muted-foreground">{body}</p>
      </div>
      <Link href={href} className={cn(buttonVariants({ variant: "secondary" }), "press")}>
        {action}
      </Link>
    </div>
  );
}
