"use client";

import { cn, glassSubtle } from "@/lib/utils";

/** One day's readiness. The shape `state.readinessHistory` already stores. */
export interface TrendPoint {
  date: string;
  readiness: number;
}

/**
 * The readiness line, drawn bare so it can sit inside the sheet.
 *
 * It was briefly a card of its own with its own range control. A card inside
 * the sheet is the exact thing the sheet exists to avoid, so the chrome is
 * gone and only the plot survives — which is also why it draws its own pass
 * mark: with no surrounding card to caption it, the dashed line has to be
 * self-explanatory.
 *
 * **It prints no readiness figure of its own**, and must not be given one back.
 * As a standalone card it captioned itself with "Readiness now" in the corner;
 * inside the sheet that number sits immediately to its left, at four times the
 * size, so the caption was the same fact said twice a few centimetres apart.
 * `current` survives for the accessible description only, where a screen reader
 * has no spatial relationship to lean on.
 *
 * Not TrendChart, which is a deliberately minimal 160px strip still used at
 * that size on /dashboard/progress and stretches its stroke with
 * `preserveAspectRatio="none"` — fine small, visibly wrong at this scale.
 */

const H = 200;
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

export function ReadinessPlot({ data, current }: { data: TrendPoint[]; current: number }) {
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

    </div>
  );
}
