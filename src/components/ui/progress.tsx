import * as React from "react";
import { cn, clamp } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
  tone = "primary",
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "accent";
}) {
  const toneClass = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    accent: "bg-accent",
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          toneClass,
          indicatorClassName,
        )}
        style={{ width: `${clamp(value)}%` }}
      />
    </div>
  );
}
