"use client";

import * as React from "react";
import { HEAT_LEVELS, type HeatDay } from "@/lib/dashboard/day-strip";
import { cn } from "@/lib/utils";

/**
 * The study habit as a shape rather than an integer.
 *
 * "Current streak 6 · longest 9" is two numbers that cannot answer the question
 * a learner actually has, which is whether they are keeping this up. Six days
 * reads identically after a solid month and after three empty weeks followed by
 * one good one. The grid shows which.
 *
 * One hue, one meaning: intensity is an opacity ramp on `--primary`, never a
 * change of colour. In this palette `--primary` and `--success` are both green
 * and near-identical in light mode, so a second green here would say something
 * it does not mean.
 */

const WEEKDAY = ["M", "", "W", "", "F", "", "S"];

/** Opacity per level, as Tailwind classes so `.data-saver` and print keep them. */
const FILL: Record<number, string> = {
  0: "bg-muted/60",
  1: "bg-primary/25",
  2: "bg-primary/45",
  3: "bg-primary/70",
  4: "bg-primary",
};

export function StudyHeatmap({
  days,
  className,
}: {
  days: HeatDay[];
  className?: string;
}) {
  const active = days.filter((d) => d.count > 0).length;
  const total = days.filter((d) => !d.future).length;

  return (
    <div className={className}>
      <div className="flex gap-1.5">
        {/* Weekday gutter — Monday-first, matching buildHeatmap's column order. */}
        <div
          className="grid shrink-0 gap-[3px] text-2xs leading-none text-muted-foreground"
          style={{ gridTemplateRows: `repeat(7, minmax(0, 1fr))` }}
          aria-hidden
        >
          {WEEKDAY.map((d, i) => (
            <span key={i} className="flex h-3.5 items-center">
              {d}
            </span>
          ))}
        </div>

        {/* Cells are a fixed square, and the grid takes its natural width rather
            than stretching. Twelve columns spread across a desktop sheet makes
            each cell ~80px wide and 10px tall, which reads as a row of bars —
            the calendar only works if a day is a day-shaped thing. */}
        <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
          <div
            className="grid w-max grid-flow-col gap-[3px]"
            style={{ gridTemplateRows: `repeat(7, minmax(0, 1fr))` }}
            role="img"
            aria-label={`Study activity: ${active} of the last ${total} days`}
          >
            {days.map((d) => (
              <span
                key={d.key}
                title={
                  d.future
                    ? undefined
                    : `${d.key} — ${d.count === 0 ? "nothing" : `${d.count} item${d.count === 1 ? "" : "s"}`}`
                }
                className={cn(
                  "h-3.5 w-3.5 rounded-[3px] transition-colors duration-500 ease-soft",
                  d.future ? "bg-transparent" : FILL[d.level],
                  // Today is marked with an outline, never a fill — a filled
                  // cell already means "you studied", and the cursor must not
                  // borrow that meaning (see session-progress.tsx).
                  d.isToday && "ring-2 ring-foreground/55",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-2xs text-muted-foreground">
        <span>Less</span>
        {Array.from({ length: HEAT_LEVELS + 1 }, (_, i) => (
          <span key={i} className={cn("h-3 w-3 rounded-[3px]", FILL[i])} aria-hidden />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
