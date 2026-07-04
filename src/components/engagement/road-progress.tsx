"use client";

import * as React from "react";
import { Car, Flag, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RANKS, LICENCE_RANK_INDEX, rankProgress, type RankInputs } from "@/lib/engagement";
import { cn, glass } from "@/lib/utils";

/**
 * "The Road to Licence" — the whole journey as a literal road. The car sits at
 * the learner's monotonic rank (plus CP progress toward the next checkpoint);
 * the final flag is reserved for passing the real test.
 */
export function RoadProgress({
  rankAchieved,
  inputs,
  compact = false,
  className,
}: {
  rankAchieved: number;
  inputs: RankInputs;
  compact?: boolean;
  className?: string;
}) {
  const prog = rankProgress(rankAchieved, inputs);

  if (compact) {
    return (
      <Card className={cn(glass, "mb-5 flex items-center gap-4 px-5 py-4", className)}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Car className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-semibold text-foreground">{prog.current.name}</p>
            {prog.next && (
              <p className="shrink-0 text-xs text-muted-foreground">
                Next: <span className="font-medium text-foreground">{prog.next.name}</span>
                {prog.unmet[0] ? ` · ${prog.unmet[0]}` : ""}
              </p>
            )}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-soft"
              style={{ width: `${Math.round(prog.journeyPct * 100)}%` }}
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(glass, "p-6", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">The Road to Licence</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{prog.current.name}</span>
          {prog.next ? ` · next stop ${prog.next.name}` : ""}
        </p>
      </div>

      {/* The road */}
      <div className="relative mt-10 px-2 pb-8">
        <div className="relative h-2 rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-700 ease-soft"
            style={{ width: `${Math.round(prog.journeyPct * 100)}%` }}
          />
          {/* The car */}
          <span
            className="absolute -top-7 -translate-x-1/2 text-primary transition-[left] duration-700 ease-soft"
            style={{ left: `${Math.round(prog.journeyPct * 100)}%` }}
            aria-hidden
          >
            <Car className="h-5 w-5" />
          </span>
          {/* Checkpoints */}
          {RANKS.map((rank, i) => {
            const reached = i <= rankAchieved;
            const isLicence = i === LICENCE_RANK_INDEX;
            return (
              <span
                key={rank.id}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(i / LICENCE_RANK_INDEX) * 100}%` }}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    reached
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isLicence ? <Flag className="h-2.5 w-2.5" /> : reached ? <Check className="h-3 w-3" /> : null}
                </span>
                <span
                  className={cn(
                    "absolute left-1/2 top-7 hidden w-20 -translate-x-1/2 text-center text-2xs leading-tight sm:block",
                    reached ? "font-medium text-foreground" : "text-muted-foreground",
                    i === 0 && "translate-x-[-30%] text-left",
                    isLicence && "translate-x-[-70%] text-right",
                  )}
                >
                  {rank.name}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {prog.next ? (
          <>
            {prog.current.tagline}{" "}
            <span className="text-foreground">
              To reach {prog.next.name}: {prog.unmet.length > 0 ? prog.unmet.join(" · ") : "almost there"}.
            </span>
          </>
        ) : (
          prog.current.tagline
        )}
      </p>
    </Card>
  );
}
