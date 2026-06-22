import * as React from "react";
import { cn, clamp } from "@/lib/utils";
import { scoreTone, type ScoreTone } from "@/lib/score";

const fillByTone: Record<ScoreTone, string> = {
  primary: "bg-gradient-to-r from-primary to-primary-light",
  success: "bg-gradient-to-r from-success to-success",
  warning: "bg-gradient-to-r from-warning to-accent",
  danger: "bg-gradient-to-r from-danger to-danger",
  // single-hue fallbacks keep bars calm; primary/warning get a subtle blend
};

export function MasteryBar({
  label,
  value,
  tone,
  icon,
  count,
  className,
}: {
  label: React.ReactNode;
  value: number;
  tone?: ScoreTone;
  icon?: React.ReactNode;
  count?: string;
  className?: string;
}) {
  const pct = clamp(value);
  const resolved = tone ?? scoreTone(pct);
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
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", fillByTone[resolved])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
