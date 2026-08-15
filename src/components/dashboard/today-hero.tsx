"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Flame,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { buttonVariants } from "@/components/ui/button";
import type { PlanTask } from "@/lib/plan";
import { cn, glass, glassFloat, glassSubtle } from "@/lib/utils";

/**
 * The top of Today: who you are, the two numbers that decide everything, and
 * the one action.
 *
 * Modelled on the reference's opening row — an identity card beside two
 * oversized percentages — but built from this system's own tiers rather than
 * its gradients. The references get their lift from colour; ours comes from
 * depth and scale, which is the trade the palette rules already made.
 *
 * The three tiles sit on three different depths on purpose: the identity card
 * floats, the metric tiles are standard content, and the chips inside are
 * recessed. Adjacent surfaces on the same tier is what made the old page read
 * flat no matter how the cards were arranged.
 */
export function TodayHero({
  firstName,
  vehicleLabel,
  readiness,
  passProbability,
  delta,
  streak,
  cp,
  daysToTest,
  planDonePct,
  nextTask,
}: {
  firstName: string;
  /** The licence code they're studying for, e.g. "Code B". */
  vehicleLabel: string;
  readiness: number;
  passProbability: number;
  /** Change over the last 7 days, or null before there is a week of history. */
  delta: number | null;
  streak: number;
  cp: number;
  daysToTest: number | null;
  /** Today's plan, as a percentage of its tasks completed. */
  planDonePct: number;
  /** The first unfinished task on today's plan; null once the plan is done. */
  nextTask: PlanTask | null;
}) {
  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaTone =
    delta && delta > 0 ? "text-success" : delta && delta < 0 ? "text-danger" : "text-muted-foreground";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)]">
        {/* Identity — the reference's profile card, with the ring doing the work
            its avatar does: the thing your eye lands on first. */}
        <Card className={cn(glassFloat, "flex flex-col items-center p-5 text-center")}>
          <ScoreRing
            value={readiness}
            size={116}
            stroke={10}
            label={<span className="font-mono text-2xl font-semibold tabular-nums">{readiness}%</span>}
            sublabel="readiness"
          />
          <p className="mt-3 font-display text-base font-semibold tracking-tight">
            {firstName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{vehicleLabel}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            <Chip icon={<Flame className="h-3.5 w-3.5 text-accent" />} value={streak} label="days" />
            <Chip icon={<Zap className="h-3.5 w-3.5 text-primary" />} value={cp} label="CP" />
            {daysToTest !== null && (
              <Chip
                icon={<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />}
                value={daysToTest <= 0 ? "Today" : daysToTest}
                label={daysToTest <= 0 ? "" : "to test"}
              />
            )}
          </div>
        </Card>

        <MetricTile
          label="Today's plan"
          value={planDonePct}
          caption={planDonePct >= 100 ? "Done — anything now is ahead" : "Of today's tasks completed"}
          icon={<Target className="h-4 w-4" />}
        />

        <MetricTile
          label="Predicted pass"
          value={passProbability}
          caption={
            delta === null
              ? "Building your first week"
              : delta === 0
                ? "Level with last week"
                : `Readiness ${delta > 0 ? "+" : ""}${delta} this week`
          }
          icon={<DeltaIcon className="h-4 w-4" />}
          captionTone={deltaTone}
        />
      </div>

      {/* The action rail — the reference's full-width strip under the tiles.
          One button, always the next thing; the plan below expands on it
          rather than repeating the decision. */}
      <Card className={cn(glass, "flex flex-wrap items-center justify-between gap-3 px-5 py-4")}>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {nextTask ? "Next up" : "All done"}
          </p>
          <p className="mt-0.5 truncate text-sm">
            {nextTask ? (
              <>
                <span className="font-medium text-foreground">{nextTask.title}</span>
                <span className="text-muted-foreground"> · about {nextTask.estMinutes} min</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                Today&apos;s plan is finished. Anything else is ahead of schedule.
              </span>
            )}
          </p>
        </div>
        <Link
          href={nextTask?.href ?? "/study"}
          className={cn(buttonVariants({ variant: nextTask ? "default" : "outline" }), "shrink-0")}
        >
          {nextTask ? "Start now" : "Keep studying"}
          <ArrowRight />
        </Link>
      </Card>
    </div>
  );
}

/**
 * One oversized percentage. The reference stacks a label, a floating icon and a
 * number that dwarfs both — the number is the content and everything else is
 * annotation, which is the hierarchy the old stat row never had.
 */
function MetricTile({
  label,
  value,
  caption,
  icon,
  captionTone,
}: {
  label: string;
  value: number;
  caption: string;
  icon: React.ReactNode;
  captionTone?: string;
}) {
  return (
    <Card className={cn(glass, "flex flex-col justify-between p-5")}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-sm font-semibold leading-snug tracking-tight">{label}</p>
        <span
          className={cn(
            glassSubtle,
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-primary",
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <div className="mt-6">
        <p className="font-mono text-4xl font-semibold leading-none tabular-nums">{value}%</p>
        <p className={cn("mt-1.5 text-xs", captionTone ?? "text-muted-foreground")}>{caption}</p>
      </div>
    </Card>
  );
}

function Chip({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className={cn(
        glassSubtle,
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
      )}
    >
      {icon}
      <span className="font-mono font-semibold tabular-nums text-foreground">{value}</span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </span>
  );
}
