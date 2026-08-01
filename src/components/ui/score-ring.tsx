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

const glowByTone: Record<ScoreTone, string> = {
  primary: "hsl(var(--primary) / 0.3)",
  success: "hsl(var(--success) / 0.3)",
  warning: "hsl(var(--warning) / 0.3)",
  danger: "hsl(var(--danger) / 0.3)",
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

  // Starts at the real score, never 0. This is the headline number on the
  // dashboard and on the diagnostic results screen — the conversion moment — and
  // seeding it at 0 put "0%" in the server HTML and left it there for anyone
  // whose rAF never ran. The count-up is a hydration flourish: rewind, then
  // animate, so the honest value is what shows if the animation never happens.
  const [shown, setShown] = React.useState(pct);
  React.useEffect(() => {
    if (!animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(pct);
      return;
    }
    setShown(0);
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
    // rAF is throttled to nothing in a background tab, and the score is the one
    // number on this screen that must never lie. If the animation hasn't landed
    // by the time it should have, snap to the truth.
    const failsafe = window.setTimeout(() => setShown(pct), duration + 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [pct, animate]);

  const offset = circumference - (shown / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
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
          style={{ filter: `drop-shadow(0 0 14px ${glowByTone[resolvedTone]})` }}
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
