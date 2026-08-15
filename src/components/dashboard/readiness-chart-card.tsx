"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn, glass, glassSubtle } from "@/lib/utils";
import type { TrendPoint } from "@/components/dashboard/trend-chart";

/** Windows the range pill offers, in days. */
const RANGES = [
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "90", label: "Last 90 days", days: 90 },
  { key: "all", label: "All time", days: Infinity },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

/**
 * Readiness over time, at the scale the page's main chart deserves.
 *
 * The dashboard's trend used to be a 160px strip at the very bottom, below the
 * rank — the last thing on the page, and the smallest. In every reference this
 * borrows from, the chart *is* the page: it takes the width, it carries one
 * annotated moment, and it prints the number it wants remembered in the corner
 * rather than making you read the axis.
 *
 * Drawn here rather than by extending TrendChart because that one is a
 * deliberately minimal strip, still used at its own size on /dashboard/progress,
 * and it stretches its stroke with `preserveAspectRatio="none"` — fine at 160px,
 * visibly wrong when the same path is blown up to hero scale.
 */
export function ReadinessChartCard({
  data,
  current,
}: {
  data: TrendPoint[];
  current: number;
}) {
  const [range, setRange] = React.useState<RangeKey>("30");
  const active = RANGES.find((r) => r.key === range) ?? RANGES[0];

  const points = React.useMemo(() => {
    if (active.days === Infinity) return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - active.days);
    const key = cutoff.toISOString().slice(0, 10);
    return data.filter((d) => d.date >= key);
  }, [data, active.days]);

  return (
    <Card className={cn(glass, "mt-5 overflow-hidden p-0")}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-0">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Readiness</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            How ready you are, session by session
          </p>
        </div>

        {/* The reference's "Range:" control, as a segmented pill. */}
        <div className={cn(glassSubtle, "flex rounded-full border p-0.5")} role="group" aria-label="Chart range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={cn(
                "press rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-soft",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                range === r.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ReadinessPlot data={points} current={current} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-5 py-3">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Readiness
          <span className="ml-2 inline-block h-px w-4 border-t border-dashed border-foreground/40" />
          Pass mark
        </span>
        <Link href="/dashboard/progress" className="text-xs font-medium text-primary hover:underline">
          Detailed progress
        </Link>
      </div>
    </Card>
  );
}

const H = 240;
const W = 720;
const PAD_X = 20;
const PAD_Y = 26;

/** A Catmull-Rom-ish smoothing, so the line reads as a curve rather than a saw. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function ReadinessPlot({ data, current }: { data: TrendPoint[]; current: number }) {
  if (data.length < 2) {
    return (
      <div className="m-5 flex h-[200px] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-center">
        <p className="text-sm font-medium text-foreground">Not enough history yet</p>
        <p className="max-w-[34ch] text-xs text-muted-foreground">
          Your readiness is plotted after a couple of sessions. Today&apos;s plan is the fastest
          way to put the first point on it.
        </p>
      </div>
    );
  }

  const values = data.map((d) => d.readiness);
  // Always keep the pass mark in frame — a trend that can't be read against the
  // line it has to cross is decoration.
  const min = Math.max(0, Math.min(...values, 51) - 8);
  const max = Math.min(100, Math.max(...values, 51) + 8);
  const span = Math.max(1, max - min);

  const x = (i: number) => PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2);
  const y = (v: number) => PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2);

  const pts = data.map((d, i) => ({ x: x(i), y: y(d.readiness) }));
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD_Y} L ${pts[0].x.toFixed(1)} ${H - PAD_Y} Z`;

  // The moment worth annotating: the biggest single-session jump.
  let bestIdx = 1;
  let bestGain = -Infinity;
  for (let i = 1; i < data.length; i++) {
    const gain = data[i].readiness - data[i - 1].readiness;
    if (gain > bestGain) {
      bestGain = gain;
      bestIdx = i;
    }
  }
  const annotate = bestGain > 0 ? pts[bestIdx] : null;
  const last = pts[pts.length - 1];

  return (
    <div className="relative px-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        role="img"
        aria-label={`Readiness trend across ${data.length} days, currently ${current} percent`}
      >
        <defs>
          <linearGradient id="readinessFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.20" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* The pass mark, so the curve has something to mean something against. */}
        <line
          x1={PAD_X}
          x2={W - PAD_X}
          y1={y(51)}
          y2={y(51)}
          stroke="hsl(var(--foreground))"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray="4 5"
        />
        <path d={area} fill="url(#readinessFill)" />
        <path
          d={line}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {annotate && (
          <circle cx={annotate.x} cy={annotate.y} r="4.5" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2.5" />
        )}
        <circle cx={last.x} cy={last.y} r="5" fill="hsl(var(--primary))" />
      </svg>

      {/* The floating annotation pill, positioned over the plot. */}
      {annotate && (
        <div
          className={cn(
            glassSubtle,
            "pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl border px-3 py-1.5 text-center shadow-soft",
          )}
          style={{ left: `${(annotate.x / W) * 100}%`, top: `${(annotate.y / H) * 100}%` }}
        >
          <p className="whitespace-nowrap text-xs font-semibold text-foreground">
            Best day · +{Math.round(bestGain)}
          </p>
          <p className="whitespace-nowrap text-2xs text-muted-foreground">
            {new Date(data[bestIdx].date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
          </p>
        </div>
      )}

      {/* The number the card wants remembered. */}
      <div className="pointer-events-none absolute bottom-1 right-5 text-right">
        <p className="font-mono text-3xl font-semibold leading-none tabular-nums text-foreground">
          {current}%
        </p>
        <p className="mt-1 text-2xs text-muted-foreground">Readiness now</p>
      </div>
    </div>
  );
}
