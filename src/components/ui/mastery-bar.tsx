import * as React from "react";
import { cn, clamp } from "@/lib/utils";
import { scoreTone, thresholdTone, type ScoreTone } from "@/lib/score";

const fillByTone: Record<ScoreTone, string> = {
  primary: "bg-gradient-to-r from-primary to-primary-light",
  success: "bg-success",
  // Warning was `from-warning to-accent`, which was a warm ochre-to-amber blend
  // when --accent was amber. Road Atlas made accent motorway blue, so every
  // short bar in the app has since been fading from ochre into blue — a second
  // hue that means something else entirely, on the mark that says "not there
  // yet". Warning is one hue now, like success and danger.
  warning: "bg-warning",
  danger: "bg-danger",
};

export function MasteryBar({
  label,
  value,
  tone,
  icon,
  count,
  threshold,
  thresholdLabel,
  className,
}: {
  label: React.ReactNode;
  value: number;
  tone?: ScoreTone;
  icon?: React.ReactNode;
  count?: string;
  /**
   * Pass mark for this bar, 0–100, drawn as a tick on the track. The gap to a
   * pass becomes something the learner can see rather than arithmetic they
   * have to do off a "23/28 · need 23" caption.
   */
  threshold?: number;
  /** Accessible name for the tick — e.g. "Pass mark 23 of 28". */
  thresholdLabel?: string;
  className?: string;
}) {
  const pct = clamp(value);
  const mark = threshold != null ? clamp(threshold) : null;
  const resolved = tone ?? (mark != null ? thresholdTone(pct, mark) : scoreTone(pct));
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-foreground">
          {icon}
          {label}
        </span>
        <span className="tabular font-mono text-xs text-muted-foreground">
          {count ?? `${Math.round(pct)}%`}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", fillByTone[resolved])}
          style={{ width: `${pct}%` }}
        />
        {mark != null && (
          <span
            role={thresholdLabel ? "img" : undefined}
            aria-label={thresholdLabel}
            aria-hidden={thresholdLabel ? undefined : true}
            className="absolute inset-y-0 w-0.5 -translate-x-px bg-foreground/55"
            style={{ left: `${mark}%` }}
          />
        )}
      </div>
    </div>
  );
}
