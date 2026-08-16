"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Flag, Lock, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { categoryMastery } from "@/lib/dashboard/mastery";
import { buildDayStrip, type StripDay } from "@/lib/dashboard/day-strip";
import type { PlanTask } from "@/lib/plan";
import type { TrendPoint } from "@/components/dashboard/trend-chart";
import { cn, glassFloat } from "@/lib/utils";
import type { CategoryId } from "@/types";

/**
 * Today, as one sheet.
 *
 * The page was a grid of cards — and every attempt to fix it by rearranging the
 * grid produced another grid. A statement doesn't do that: it is a single
 * surface, and its sections are separated by rules, not by gaps. So there is
 * exactly one bordered object on this page, and everything below is a band
 * inside it.
 *
 * Reading order is a ledger's: the balance first, the figures that qualify it
 * beneath, the period it covers, then the entries. Readiness is the balance
 * because it is the number that moves when you study; the countdown sits beside
 * it because a balance with no date against it has no urgency.
 *
 * The rules to keep if this is edited: no nested bordered box anywhere inside,
 * no banner — an alert is a band like any other — and no second card added
 * beside it. The moment there are two objects the composition is a grid again.
 */
export function TodaySheet({
  firstName,
  vehicleLabel,
  readiness,
  passProbability,
  delta,
  streak,
  cp,
  daysToTest,
  testDate,
  planDonePct,
  perCategory,
  hasAttempts,
  activeDays,
  tasks,
  doneMap,
  scenariosUnlocked,
  planLocked,
  rationale,
  alert,
  trend,
  rankLine,
}: {
  firstName: string;
  vehicleLabel: string;
  readiness: number;
  passProbability: number;
  delta: number | null;
  streak: number;
  cp: number;
  daysToTest: number | null;
  testDate: string | null;
  planDonePct: number;
  perCategory: Record<CategoryId, number>;
  hasAttempts: boolean;
  activeDays: ReadonlySet<string>;
  tasks: PlanTask[];
  doneMap: Record<string, boolean>;
  scenariosUnlocked: boolean;
  planLocked: boolean;
  /** The coach's one-line reason for today's plan, once it has resolved. */
  rationale: React.ReactNode;
  /** The single most urgent thing, already chosen — rendered as a band. */
  alert: { tone: "warning" | "primary"; title: string; body: string; href: string; cta: string } | null;
  /** Readiness history, for the closing band's sparkline. */
  trend: TrendPoint[];
  /** Driver-rank line, e.g. "Learner Driver · 150 CP to Road Ready". */
  rankLine: string;
}) {
  const strip = React.useMemo(
    () => buildDayStrip({ activeDays, testDate }),
    [activeDays, testDate],
  );
  const mastery = React.useMemo(() => categoryMastery(perCategory).slice(0, 5), [perCategory]);
  const firstIncomplete = tasks.find((t) => !doneMap[t.id]) ?? null;
  const totalMin = tasks.reduce((s, t) => s + t.estMinutes, 0);

  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaTone =
    delta && delta > 0 ? "text-success" : delta && delta < 0 ? "text-danger" : "text-muted-foreground";

  return (
    <div className={cn(glassFloat, "overflow-hidden rounded-3xl border")}>
      {/* ── The balance ─────────────────────────────────────────────────── */}
      <div className="grid gap-px bg-border/40 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="bg-card/[0.01] px-6 py-8 text-center sm:py-10">
          <p className="text-2xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Readiness
          </p>
          <p className="mt-2 font-mono text-6xl font-semibold leading-none tabular-nums sm:text-7xl">
            {readiness}
            <span className="align-top text-2xl text-muted-foreground">%</span>
          </p>
          <p className={cn("mt-3 inline-flex items-center gap-1.5 text-sm font-medium", deltaTone)}>
            <DeltaIcon className="h-4 w-4" />
            {delta === null
              ? "Building your first week"
              : delta === 0
                ? "Level with last week"
                : `${delta > 0 ? "+" : ""}${delta} this week`}
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-6 bg-card/[0.01] px-6 py-5 sm:flex-col sm:justify-center sm:gap-1 sm:px-8">
          {daysToTest === null ? (
            <div className="text-center">
              <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Test date
              </p>
              <Link
                href="/account"
                className="mt-1 block text-sm font-medium text-primary hover:underline"
              >
                Set a date
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {daysToTest <= 0 ? "Test day" : "Days to test"}
              </p>
              <p className="mt-1 font-mono text-4xl font-semibold leading-none tabular-nums">
                {daysToTest <= 0 ? "—" : daysToTest}
              </p>
            </div>
          )}
          <div className="text-center sm:mt-4">
            <p className="text-2xs uppercase tracking-[0.18em] text-muted-foreground">Studying</p>
            <p className="mt-1 max-w-[18ch] text-xs font-medium">{vehicleLabel}</p>
          </div>
        </div>
      </div>

      {/* ── The figures that qualify it ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-px border-t border-border/50 bg-border/40 sm:grid-cols-4">
        <Figure label="Predicted pass" value={`${passProbability}%`} />
        <Figure label="Today's plan" value={`${planDonePct}%`} />
        <Figure label="Streak" value={streak} unit={streak === 1 ? "day" : "days"} />
        <Figure label="Points" value={cp.toLocaleString()} unit="CP" />
      </div>

      {/* ── An interruption, if there is one. A band, never a floating card. */}
      {alert && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3.5",
            alert.tone === "warning"
              ? "border-t-border/50 bg-warning/[0.07] shadow-[inset_3px_0_0_hsl(var(--warning))]"
              : "border-t-border/50 bg-primary/[0.05] shadow-[inset_3px_0_0_hsl(var(--primary))]",
          )}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">{alert.title}</p>
            <p className="text-xs text-muted-foreground">{alert.body}</p>
          </div>
          <Link
            href={alert.href}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}
          >
            {alert.cta}
          </Link>
        </div>
      )}

      {/* ── The period ───────────────────────────────────────────────────── */}
      <DayStrip days={strip} />

      {/* ── The entries ──────────────────────────────────────────────────── */}
      <div className="grid border-t border-border/50 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <section className="min-w-0 border-b border-border/50 px-6 py-5 lg:border-b-0 lg:border-r">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
              Today
            </h2>
            <span className="text-xs tabular-nums text-muted-foreground">~{totalMin} min</span>
          </div>

          {rationale ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-balance">
              {rationale}
            </p>
          ) : null}

          <ul className="mt-4 divide-y divide-border/50">
            {tasks.map((task) => {
              const done = doneMap[task.id];
              const locked = task.premium && !scenariosUnlocked;
              return (
                <li key={task.id}>
                  <Link
                    href={locked ? "/account/billing" : task.href}
                    className="group flex items-center gap-3 py-2.5 transition-colors duration-200 ease-soft hover:text-primary"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        done
                          ? "border-success bg-success text-success-foreground"
                          : "border-border text-transparent",
                      )}
                      aria-hidden
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm font-medium",
                          done ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {task.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {task.subtitle}
                      </span>
                    </span>
                    {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {task.estMinutes}m
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {planLocked && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> The full daily plan is a Premium feature —{" "}
              <Link href="/account/billing" className="font-medium text-primary hover:underline">
                unlock it
              </Link>
            </p>
          )}

          {firstIncomplete ? (
            <Link
              href={firstIncomplete.href}
              className={cn(buttonVariants(), "mt-4 w-full sm:w-auto")}
            >
              Start today&apos;s plan <ArrowRight />
            </Link>
          ) : (
            <p className="mt-4 text-sm font-medium text-success">
              Plan complete — come back tomorrow to keep your streak.
            </p>
          )}
        </section>

        <section className="min-w-0 px-6 py-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
              Weakest
            </h2>
            <Link
              href="/dashboard/progress"
              className="text-xs font-medium text-primary hover:underline"
            >
              All
            </Link>
          </div>

          <ul className="mt-4 space-y-3">
            {mastery.map((row) => (
              <li key={row.id}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate font-medium text-foreground">{row.name}</span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                    {hasAttempts ? `${row.value}%` : "—"}
                    <span className="text-muted-foreground/60"> / {row.required}%</span>
                  </span>
                </div>
                <div className="relative mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500 ease-glass",
                      row.clearing && hasAttempts ? "bg-success" : "bg-primary",
                    )}
                    style={{ width: `${hasAttempts ? row.value : 0}%` }}
                  />
                  <span
                    aria-hidden
                    className="absolute top-0 h-full w-px bg-foreground/40"
                    style={{ left: `${row.required}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-2xs leading-relaxed text-muted-foreground">
            The tick is the mark that section needs to pass.
          </p>
        </section>
      </div>

      {/* ── The closing line ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Sparkline data={trend} />
          <span className="text-xs text-muted-foreground">{rankLine}</span>
        </div>
        <Link
          href="/dashboard/progress"
          className="text-xs font-medium text-primary hover:underline"
        >
          Detailed progress
        </Link>
      </div>
    </div>
  );
}

/**
 * The trend, at the size a statement gives a chart: a footnote. The full plot
 * lives on /dashboard/progress — putting it here at any real size would make a
 * second focal point, which is the thing this layout exists to avoid.
 */
function Sparkline({ data }: { data: TrendPoint[] }) {
  if (data.length < 2) {
    return <span className="text-xs text-muted-foreground">Trend appears after a few sessions</span>;
  }
  const w = 96;
  const h = 24;
  const pts = data.slice(-30);
  const values = pts.map((p) => p.readiness);
  const min = Math.min(...values);
  const span = Math.max(1, Math.max(...values) - min);
  const d = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p.readiness - min) / span) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0 overflow-visible">
      <path d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Figure({
  label,
  value,
  unit,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
}) {
  return (
    <div className="bg-card/[0.01] px-5 py-4 text-center">
      <p className="text-2xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-semibold leading-none tabular-nums">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Two weeks as columns. Nothing is booked in a study app, so a day carries only
 * whether it was worked — the run of filled marks is the streak made visible,
 * which is the one thing a planner view adds that a number cannot.
 */
function DayStrip({ days }: { days: StripDay[] }) {
  return (
    <div className="border-t border-border/50 px-6 py-4">
      <div className="grid grid-cols-7 gap-y-3">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="text-center text-2xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </span>
        ))}
        {days.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-2xs font-medium tabular-nums transition-colors duration-200 ease-soft",
                d.state === "test" && "bg-warning text-warning-foreground",
                d.state === "today" && "bg-primary text-primary-foreground",
                d.state === "worked" && "bg-success/20 text-success",
                d.state === "missed" && "text-muted-foreground/50",
                d.state === "future" && "text-muted-foreground",
              )}
              title={
                d.state === "test"
                  ? "Test day"
                  : d.state === "today"
                    ? "Today"
                    : d.state === "worked"
                      ? "Studied"
                      : undefined
              }
            >
              {d.state === "test" ? <Flag className="h-3 w-3" /> : d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
