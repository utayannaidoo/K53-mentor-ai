"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Flame, Minus, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { buttonVariants } from "@/components/ui/button";
import type { PlanTask } from "@/lib/plan";
import { cn, glassFloat, glassSubtle } from "@/lib/utils";

/**
 * The one surface that answers "where am I, and what do I do now".
 *
 * The dashboard had no lead. Ten cards of equal weight stacked down the page,
 * and the numbers that make a dashboard worth opening — readiness, predicted
 * pass, the streak — sat in the last third, below the plan, below the rank.
 * The learner's own progress was the thing they had to scroll for.
 *
 * So one floating-tier surface carries all of it: the score they came to check,
 * the trend on it, the streak they are protecting, how long they have, and the
 * single next action. Everything below is detail on this.
 *
 * The ring is the anchor — one large number rather than four medium ones. Four
 * equal stat tiles is what "a bunch of random things" looks like; a hierarchy
 * needs something to actually be biggest.
 */
export function TodayHero({
  firstName,
  readiness,
  passProbability,
  delta,
  streak,
  cp,
  daysToTest,
  nextTask,
}: {
  firstName: string;
  readiness: number;
  passProbability: number;
  /** Change over the last 7 days, or null before there is a week of history. */
  delta: number | null;
  streak: number;
  cp: number;
  daysToTest: number | null;
  /** The first unfinished task on today's plan; null once the plan is done. */
  nextTask: PlanTask | null;
}) {
  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaTone =
    delta && delta > 0 ? "text-success" : delta && delta < 0 ? "text-danger" : "text-muted-foreground";

  return (
    <Card className={cn(glassFloat, "mb-5 overflow-hidden p-0")}>
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
        {/* The anchor. Deliberately the largest thing on the page. */}
        <ScoreRing
          value={readiness}
          size={132}
          stroke={11}
          label={<span className="font-mono text-3xl font-semibold tabular-nums">{readiness}%</span>}
          sublabel="readiness"
          className="mx-auto shrink-0 sm:mx-0"
        />

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className={cn("inline-flex items-center gap-1 font-medium", deltaTone)}>
              <DeltaIcon className="h-3.5 w-3.5" />
              {delta === null
                ? "Building your first week of history"
                : delta === 0
                  ? "Level with last week"
                  : `${delta > 0 ? "+" : ""}${delta} this week`}
            </span>
            <span aria-hidden>·</span>
            <span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {passProbability}%
              </span>{" "}
              predicted pass
            </span>
          </p>

          {/* Recessed tier so these read as facts about the hero, not as three
              more cards competing with it. */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Stat icon={<Flame className="h-3.5 w-3.5 text-accent" />} value={`${streak}`} label={streak === 1 ? "day streak" : "day streak"} />
            <Stat icon={<Zap className="h-3.5 w-3.5 text-primary" />} value={`${cp}`} label="CP" />
            {daysToTest !== null && (
              <Stat
                icon={<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />}
                value={daysToTest <= 0 ? "Today" : `${daysToTest}`}
                label={daysToTest <= 0 ? "test day" : daysToTest === 1 ? "day to test" : "days to test"}
              />
            )}
          </div>
        </div>
      </div>

      {/* The action rail. One button, always the next thing — the plan below
          expands on it rather than repeating the decision. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 bg-background/20 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {nextTask ? (
            <>
              Next up: <span className="font-medium text-foreground">{nextTask.title}</span>
              <span className="text-muted-foreground"> · about {nextTask.estMinutes} min</span>
            </>
          ) : (
            <>Today&apos;s plan is done. Anything else you do now is ahead of schedule.</>
          )}
        </p>
        <Link
          href={nextTask?.href ?? "/study"}
          className={cn(buttonVariants({ size: nextTask ? "default" : "sm", variant: nextTask ? "default" : "outline" }))}
        >
          {nextTask ? "Start now" : "Keep studying"}
          <ArrowRight />
        </Link>
      </div>
    </Card>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <span
      className={cn(
        glassSubtle,
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
      )}
    >
      {icon}
      <span className="font-mono font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
