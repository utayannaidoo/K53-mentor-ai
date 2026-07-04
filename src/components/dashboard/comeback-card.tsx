"use client";

import { Sun, X, Layers, Target, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { cn, glassFloat, pluralize } from "@/lib/utils";

/**
 * "While you were away" — shown once after a 3+ day gap, framed as proof that
 * nothing was lost rather than a guilt trip. Dismisses into the normal plan.
 */
export function ComebackCard() {
  const { state, dismissComeback } = useStudyStore();
  const c = state.pendingComeback;
  if (!c) return null;

  const delta = c.readinessNow - c.readinessThen;
  const readinessLine =
    delta >= 0
      ? `Readiness held at ${c.readinessNow}%${delta > 0 ? ` — up ${delta} since you left` : ""}`
      : `Readiness ${c.readinessNow}% — a few reviews will bring the ${Math.abs(delta)} back`;

  return (
    <Card className={cn(glassFloat, "mb-5 border-primary/25 p-6")}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sun className="h-4 w-4" /> While you were away
        </span>
        <button
          type="button"
          onClick={dismissComeback}
          aria-label="Dismiss"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 font-display text-lg font-medium leading-snug tracking-tight">
        {c.daysAway} {pluralize(c.daysAway, "day")} away — nothing lost.
      </p>

      <ul className="mt-4 space-y-2 text-sm text-foreground">
        <li className="flex items-center gap-2">
          <Target className="h-4 w-4 shrink-0 text-primary" /> {readinessLine}
        </li>
        {c.dueCards > 0 && (
          <li className="flex items-center gap-2">
            <Layers className="h-4 w-4 shrink-0 text-primary" /> {c.dueCards}{" "}
            {pluralize(c.dueCards, "review")} queued and ready when you are
          </li>
        )}
        <li className="flex items-center gap-2">
          <Flame className="h-4 w-4 shrink-0 text-accent" /> Longest streak still standing:{" "}
          {state.streak.longest} {pluralize(state.streak.longest, "day")}
        </li>
      </ul>

      <Button className="mt-5 w-full sm:w-auto" onClick={dismissComeback}>
        Pick up where I left off
      </Button>
    </Card>
  );
}
