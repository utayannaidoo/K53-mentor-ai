"use client";

import * as React from "react";
import { cn, clamp } from "@/lib/utils";
import { scoreTone, type ScoreTone } from "@/lib/score";

export type { ScoreTone };

const strokeByTone: Record<ScoreTone, string> = {
  primary: "stroke-primary",
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
};

export function ScoreRing({
  value,
  size = 184,
  stroke = 14,
  tone,
  label,
  sublabel,
  className,
  animate = true,
  suffix = "%",
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: ScoreTone;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  className?: string;
  animate?: boolean;
  suffix?: string;
}) {
  const pct = clamp(value);
  const resolvedTone = tone ?? scoreTone(pct);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [shown, setShown] = React.useState(animate ? 0 : pct);
  React.useEffect(() => {
    if (!animate) {
      setShown(pct);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(pct * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct, animate]);

  const offset = circumference - (shown / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke] duration-500", strokeByTone[resolvedTone])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="tabular font-mono text-4xl font-semibold tracking-tight text-foreground">
          {Math.round(shown)}
          <span className="text-2xl text-muted-foreground">{suffix}</span>
        </span>
        {label && (
          <span className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        )}
        {sublabel && <span className="mt-1 text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
