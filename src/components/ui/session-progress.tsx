import * as React from "react";
import { cn, clamp } from "@/lib/utils";

/**
 * The bar at the top of every session player — questions, mock exam, flashcards
 * and scenarios all render this one component.
 *
 * It has two shapes. Given `outcomes` for a short enough queue it draws one
 * segment per item, so the learner reads their whole run at a glance instead of
 * a percentage they have to remember. Otherwise it falls back to the continuous
 * fill, which is what every caller drew by hand before this existed.
 */

/**
 * Past this many items a segment falls under ~4px on a 375px screen and the bar
 * reads as noise rather than information, so a full 64-question mock stays
 * continuous. Practice sets, mini mocks and section drills all sit under it.
 */
export const SEGMENT_LIMIT = 28;

/**
 * `done` is deliberately distinct from `correct`/`wrong`: a timed mock must not
 * leak whether an answer was right while the paper is still open, and a
 * flashcard review has no right answer to leak in the first place.
 */
export type SessionOutcome = "pending" | "done" | "correct" | "wrong";

const SEGMENT_TONE: Record<SessionOutcome, string> = {
  pending: "bg-muted",
  done: "bg-primary",
  correct: "bg-success",
  wrong: "bg-danger",
};

export function SessionProgress({
  completed,
  total,
  index,
  outcomes,
  className,
}: {
  /** Items finished — drives the continuous fill. */
  completed: number;
  total: number;
  /** 0-based position of the item on screen, marked as "you are here". */
  index?: number;
  /** One entry per item. Omit for a continuous bar. */
  outcomes?: SessionOutcome[];
  className?: string;
}) {
  const pct = clamp(total > 0 ? (completed / total) * 100 : 0);
  const segmented = outcomes != null && total > 0 && total <= SEGMENT_LIMIT;

  const aria = {
    role: "progressbar" as const,
    "aria-valuenow": Math.round(pct),
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuetext": `${clamp(completed, 0, total)} of ${total}`,
  };

  if (segmented) {
    return (
      // Taller than the continuous bar on purpose — at h-1.5 the individual
      // segments stop reading as separate marks.
      <div {...aria} className={cn("flex h-2 min-w-0 flex-1 gap-0.5", className)}>
        {outcomes.map((outcome, idx) => (
          <span
            key={idx}
            className={cn(
              "flex-1 rounded-sm transition-colors duration-300 ease-soft",
              // A settled outcome outranks "you are here". The learner stays on
              // the question they just answered while they read the
              // explanation, and that segment has to show the result rather
              // than hide it behind the cursor.
              outcome === "pending" && idx === index ? "bg-primary" : SEGMENT_TONE[outcome],
              // The ring paints outside the box, so marking the current segment
              // costs no height in the header row.
              idx === index && "ring-2 ring-primary/30",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      {...aria}
      className={cn("h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-soft"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
