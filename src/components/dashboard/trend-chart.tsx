import * as React from "react";
import { cn } from "@/lib/utils";

export interface TrendPoint {
  date: string;
  readiness: number;
}

/**
 * Minimal, single-colour readiness trend line (Stripe-dashboard restraint —
 * no gridline clutter). Pure SVG, no chart dependency.
 */
export function TrendChart({
  data,
  height = 160,
  className,
}: {
  data: TrendPoint[];
  height?: number;
  className?: string;
}) {
  if (data.length < 2) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground", className)}
        style={{ height }}
      >
        Study a little more — your trend appears after a couple of sessions.
      </div>
    );
  }

  const width = 600;
  const pad = 16;
  const min = Math.max(0, Math.min(...data.map((d) => d.readiness)) - 8);
  const max = Math.min(100, Math.max(...data.map((d) => d.readiness)) + 8);
  const span = Math.max(1, max - min);

  const x = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.readiness).toFixed(1)}`).join(" ");
  const area = `${line} L ${x(data.length - 1).toFixed(1)} ${height - pad} L ${x(0).toFixed(1)} ${height - pad} Z`;
  const last = data[data.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)} preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trendFill)" />
      <path d={line} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(data.length - 1)} cy={y(last.readiness)} r="4" fill="hsl(var(--primary))" />
    </svg>
  );
}
