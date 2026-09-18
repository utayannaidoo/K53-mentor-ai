import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActionForm } from "@/components/admin/action-form";
import { setLessonStatus } from "@/app/schools/diary-actions";
import { clockTime, longDay, schoolDay, shortDateTime } from "@/lib/schools/time";
import {
  KIND_LABEL,
  LESSON_STATUS_LABEL,
  whatsappLink,
  type DiaryEntry,
} from "@/lib/schools/diary-types";

const STATUS_VARIANT = {
  scheduled: "default",
  completed: "success",
  no_show: "warning",
  cancelled_learner: "secondary",
  cancelled_school: "secondary",
} as const;

/**
 * One booking, as a row in a `divide-y` list. Shows who, when, which car and
 * where to fetch them, and — for a booking still on the diary — the three
 * things an instructor does to it afterwards, plus a WhatsApp hand-off.
 *
 * `showDate` switches the time label from "14:00–15:00" (the day view) to
 * "Fri 19 Sep, 14:00" (a learner's history, which spans many days).
 */
export function LessonRow({
  lesson,
  timezone,
  schoolName,
  canEdit,
  showDate = false,
  linkLearner = true,
}: {
  lesson: DiaryEntry;
  timezone: string;
  schoolName: string;
  canEdit: boolean;
  showDate?: boolean;
  linkLearner?: boolean;
}) {
  const when = showDate
    ? shortDateTime(lesson.starts_at, timezone)
    : `${clockTime(lesson.starts_at, timezone)}–${clockTime(lesson.ends_at, timezone)}`;
  const cancelled = lesson.status === "cancelled_learner" || lesson.status === "cancelled_school";
  const firstName = lesson.learnerName?.split(" ")[0] ?? "";
  const wa = lesson.status === "scheduled"
    ? whatsappLink(
        lesson.learnerPhone,
        `Hi ${firstName}, this is ${schoolName} confirming your lesson on ${longDay(
          schoolDay(new Date(lesson.starts_at), timezone),
        )} at ${clockTime(lesson.starts_at, timezone)}.`,
      )
    : null;
  const meta = [
    lesson.instructorName,
    lesson.vehicleLabel,
    lesson.pickup_address ? `Pickup: ${lesson.pickup_address}` : null,
  ].filter(Boolean);

  return (
    <div className={cn("space-y-2 p-4", cancelled && "opacity-60")}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-base font-semibold tabular-nums">{when}</span>
        {lesson.learner_id && lesson.learnerName ? (
          linkLearner ? (
            <Link
              href={`/schools/learners/${lesson.learner_id}`}
              className="min-w-0 truncate font-medium hover:underline"
            >
              {lesson.learnerName}
            </Link>
          ) : (
            <span className="min-w-0 truncate font-medium">{lesson.learnerName}</span>
          )
        ) : (
          <span className="font-medium text-muted-foreground">Blocked time</span>
        )}
        {lesson.kind !== "lesson" && lesson.kind !== "block" ? (
          <Badge variant="accent">{KIND_LABEL[lesson.kind]}</Badge>
        ) : null}
        <Badge variant={STATUS_VARIANT[lesson.status]}>{LESSON_STATUS_LABEL[lesson.status]}</Badge>
      </div>
      {meta.length > 0 ? (
        <p className="text-2xs text-muted-foreground">{meta.join(" · ")}</p>
      ) : null}

      {lesson.status === "scheduled" && (canEdit || wa) ? (
        <div className="flex flex-wrap items-start gap-2">
          {canEdit ? (
            <>
              <StatusButton id={lesson.id} status="completed" label="Done" variant="secondary" />
              <StatusButton id={lesson.id} status="no_show" label="No-show" variant="ghost" />
              <StatusButton
                id={lesson.id}
                status="cancelled_school"
                label="Cancel"
                variant="ghost"
                confirm="Cancel this booking? The slot becomes free for someone else."
              />
            </>
          ) : null}
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "press")}
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StatusButton({
  id,
  status,
  label,
  variant,
  confirm,
}: {
  id: string;
  status: string;
  label: string;
  variant: "secondary" | "ghost";
  confirm?: string;
}) {
  return (
    <ActionForm
      action={setLessonStatus}
      submitLabel={label}
      pendingLabel="Saving…"
      variant={variant}
      className="space-y-1"
      confirm={confirm}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
    </ActionForm>
  );
}
