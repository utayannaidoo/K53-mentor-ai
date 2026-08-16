"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Flag, Lock, Minus, TrendingDown, TrendingUp, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { categoryMastery } from "@/lib/dashboard/mastery";
import { buildDayStrip, dayKey, type StripDay } from "@/lib/dashboard/day-strip";
import { summariseDay, type DaySummary } from "@/lib/dashboard/day-detail";
import { ReadinessPlot } from "@/components/dashboard/readiness-plot";
import type { PlanTask } from "@/lib/plan";
import type { TrendPoint } from "@/components/dashboard/trend-chart";
import { cn, glassFloat } from "@/lib/utils";
import type { CategoryId, UserState } from "@/types";

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
  daySource,
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
  alert: {
    tone: "warning" | "primary";
    title: string;
    body: string;
    href: string;
    cta: string;
    /** Present only where the alert's condition is stored state, not a fact. */
    onDismiss?: () => void;
  } | null;
  /** Readiness history — plotted at the top, beside the balance. */
  trend: TrendPoint[];
  /** The slices a clicked day is summarised from. */
  daySource: Pick<
    UserState,
    "attempts" | "sessions" | "mockExams" | "scenarioAttempts" | "cardStates" | "readinessHistory"
  >;
  /** Driver-rank line, e.g. "Learner Driver · 150 CP to Road Ready". */
  rankLine: string;
}) {
  const strip = React.useMemo(
    () => buildDayStrip({ activeDays, testDate }),
    [activeDays, testDate],
  );
  const mastery = React.useMemo(() => categoryMastery(perCategory).slice(0, 5), [perCategory]);
  // Which day the learner has opened, if any. Closing returns the strip to a
  // plain summary rather than leaving a panel pinned open.
  const [openDay, setOpenDay] = React.useState<string | null>(null);
  const detail = React.useMemo<DaySummary | null>(
    () => (openDay ? summariseDay(daySource, openDay) : null),
    [openDay, daySource],
  );
  const firstIncomplete = tasks.find((t) => !doneMap[t.id]) ?? null;
  const totalMin = tasks.reduce((s, t) => s + t.estMinutes, 0);

  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaTone =
    delta && delta > 0 ? "text-success" : delta && delta < 0 ? "text-danger" : "text-muted-foreground";

  return (
    <div className={cn(glassFloat, "overflow-hidden rounded-3xl border")}>
      {/* ── The balance, and the line it has traced ─────────────────────── */}
      <div className="grid gap-px bg-border/40 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
        <div className="flex flex-row items-end justify-between gap-6 bg-card/[0.01] px-6 py-6 lg:flex-col lg:items-start lg:justify-start lg:gap-0 lg:py-7">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Readiness
            </p>
            <p className="mt-1.5 font-mono text-6xl font-semibold leading-none tabular-nums">
              {readiness}
              <span className="align-top text-2xl text-muted-foreground">%</span>
            </p>
            <p className={cn("mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium", deltaTone)}>
              <DeltaIcon className="h-4 w-4" />
              {delta === null
                ? "First week"
                : delta === 0
                  ? "Level with last week"
                  : `${delta > 0 ? "+" : ""}${delta} this week`}
            </p>
          </div>

          <div className="text-right lg:mt-6 lg:text-left">
            {daysToTest === null ? (
              <>
                <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Test date
                </p>
                <Link href="/account" className="mt-1 block text-sm font-medium text-primary hover:underline">
                  Set a date
                </Link>
              </>
            ) : (
              <>
                <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {daysToTest <= 0 ? "Test day" : "Days to test"}
                </p>
                <p className="mt-1 font-mono text-3xl font-semibold leading-none tabular-nums">
                  {daysToTest <= 0 ? "Today" : daysToTest}
                </p>
              </>
            )}
            <p className="mt-3 text-2xs uppercase tracking-[0.18em] text-muted-foreground">Studying</p>
            <p className="mt-0.5 max-w-[18ch] text-xs font-medium">{vehicleLabel}</p>
          </div>
        </div>

        {/* The chart is the top of the sheet now, not a footnote at the bottom. */}
        <div className="min-w-0 bg-card/[0.01] pb-2 pr-2 pt-4">
          <ReadinessPlot data={trend} current={readiness} />
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
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={alert.href}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              {alert.cta}
            </Link>
            {/* Only the alerts that outlive their own condition need this. The
                cram and trial bands clear themselves when the situation does;
                `pendingComeback` is stored state and clears only when asked. */}
            {alert.onDismiss && (
              <button
                type="button"
                onClick={alert.onDismiss}
                aria-label={`Dismiss: ${alert.title}`}
                className="press rounded-full p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── The period, and whichever day is open ───────────────────────── */}
      <DayStrip
        days={strip}
        openDay={openDay}
        onSelect={(key) => setOpenDay((cur) => (cur === key ? null : key))}
      />
      {detail && <DayPanel detail={detail} onClose={() => setOpenDay(null)} />}

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
        <span className="text-xs text-muted-foreground">{rankLine}</span>
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
 * Two weeks as columns, each one a button.
 *
 * Nothing is booked in a study app, so a day carries only whether it was
 * worked — the run of filled marks is the streak made visible. Opening one
 * answers the question the mark provokes: what did I actually do?
 *
 * Future days are inert rather than hidden. Greying them out keeps the two-week
 * grid whole, which is what makes the distance to test day legible.
 */
function DayStrip({
  days,
  openDay,
  onSelect,
}: {
  days: StripDay[];
  openDay: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="border-t border-border/50 px-6 py-4">
      <div className="grid grid-cols-7 gap-y-2">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="text-center text-2xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </span>
        ))}
        {days.map((d) => {
          const openable = d.state !== "future";
          const isOpen = openDay === d.key;
          return (
            <div key={d.key} className="flex justify-center">
              <button
                type="button"
                disabled={!openable}
                aria-pressed={isOpen}
                onClick={() => onSelect(d.key)}
                title={
                  d.state === "test"
                    ? "Test day"
                    : d.state === "today"
                      ? "Today"
                      : d.state === "worked"
                        ? "Studied — open for the detail"
                        : d.state === "missed"
                          ? "No study recorded"
                          : undefined
                }
                className={cn(
                  "press flex h-8 w-8 items-center justify-center rounded-full text-2xs font-medium tabular-nums",
                  "transition-colors duration-200 ease-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                  openable && "hover:bg-foreground/10",
                  d.state === "test" && "bg-warning text-warning-foreground",
                  d.state === "today" && "bg-primary text-primary-foreground",
                  d.state === "worked" && "bg-success/20 text-success",
                  d.state === "missed" && "text-muted-foreground/50",
                  d.state === "future" && "cursor-default text-muted-foreground/40",
                  isOpen && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                )}
              >
                {d.state === "test" ? <Flag className="h-3 w-3" /> : d.day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Seconds as the shortest honest phrase — "0m" is not a study session. */
function duration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/**
 * One day, opened.
 *
 * A band inside the sheet rather than a popover, for the same reason nothing
 * else here floats: a layer on top would be a second object. It pushes the
 * entries down while it is open and disappears when the day is closed.
 */
function DayPanel({ detail, onClose }: { detail: DaySummary; onClose: () => void }) {
  const date = new Date(`${detail.key}T00:00:00`);
  const label = date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const stats: { label: string; value: string; sub?: string }[] = [];
  if (detail.studiedSeconds > 0) {
    stats.push({ label: "Time studied", value: duration(detail.studiedSeconds) });
  }
  if (detail.questions.answered > 0) {
    stats.push({
      label: "Questions",
      value: `${detail.questions.answered}`,
      sub: `${detail.questions.correct} right · ${detail.questions.accuracy}%`,
    });
  }
  if (detail.flashcards > 0) {
    stats.push({ label: "Flashcards", value: `${detail.flashcards}`, sub: "reviewed" });
  }
  if (detail.mocks.count > 0) {
    stats.push({
      label: detail.mocks.count === 1 ? "Mock exam" : "Mock exams",
      value: detail.mocks.total ? `${detail.mocks.bestScore}/${detail.mocks.total}` : `${detail.mocks.count}`,
      sub:
        detail.mocks.count > 1
          ? `best of ${detail.mocks.count} · ${detail.mocks.passed} passed`
          : detail.mocks.passed
            ? "passed"
            : "not passed",
    });
  }
  if (detail.scenarios.count > 0) {
    stats.push({
      label: detail.scenarios.count === 1 ? "Scenario" : "Scenarios",
      value: `${detail.scenarios.count}`,
      sub: `${detail.scenarios.correct} right`,
    });
  }
  if (detail.readiness !== null) {
    stats.push({ label: "Readiness", value: `${detail.readiness}%`, sub: "recorded that day" });
  }

  return (
    <div className="border-t border-border/50 bg-foreground/[0.03] px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{label}</h2>
        <button
          type="button"
          onClick={onClose}
          className="press -mr-1 rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
          aria-label="Close day detail"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {detail.isEmpty ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing recorded on this day. A missed day costs the streak, not the progress — the
          reviews just wait for you.
        </p>
      ) : (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-2xs uppercase tracking-[0.14em] text-muted-foreground">
                {s.label}
              </dt>
              <dd className="mt-0.5 font-mono text-lg font-semibold leading-none tabular-nums">
                {s.value}
              </dd>
              {s.sub && <dd className="mt-1 text-2xs text-muted-foreground">{s.sub}</dd>}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
