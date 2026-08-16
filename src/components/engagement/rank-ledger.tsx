"use client";

import * as React from "react";
import { Car, Check, Flag } from "lucide-react";
import { RANKS, LICENCE_RANK_INDEX, rankProgress, type RankInputs } from "@/lib/engagement";
import { cn } from "@/lib/utils";

/**
 * The Road to Licence, read downward.
 *
 * The horizontal road it replaces put six checkpoints on a 2px track and hid
 * every rank name below `sm` — so on a phone, which is where this app is used,
 * the whole journey rendered as a line and six anonymous dots. Rank names are
 * the only part of a rank ladder that carries meaning; a layout that drops them
 * at the common width is not a layout.
 *
 * Vertical fixes that at every width, and the milestones become rows with room
 * for their own gates. The car stays: it is the one piece of character in the
 * component, and it survives the change intact.
 *
 * Position is an outline, never a fill (see session-progress.tsx). A filled node
 * already means "reached"; painting the current one primary would say the
 * learner has completed the rank they are working toward — and in this palette
 * `--primary` and `--success` are the same green anyway.
 */
export function RankLedger({
  rankAchieved,
  inputs,
  className,
}: {
  rankAchieved: number;
  inputs: RankInputs;
  className?: string;
}) {
  const prog = rankProgress(rankAchieved, inputs);
  const currentIndex = Math.min(rankAchieved, LICENCE_RANK_INDEX);

  return (
    <ol className={cn("relative", className)}>
      {RANKS.map((rank, i) => {
        const reached = i <= rankAchieved;
        const isCurrent = i === currentIndex;
        const isLicence = i === LICENCE_RANK_INDEX;
        const isNext = prog.next != null && i === currentIndex + 1;
        const last = i === RANKS.length - 1;

        return (
          <li key={rank.id} className="relative flex gap-3.5 pb-4 last:pb-0">
            {/* The road itself — a rule in the gutter, filled up to where you are. */}
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[13px] top-7 -bottom-0.5 w-0.5 rounded-full",
                  i < rankAchieved ? "bg-primary" : "bg-border",
                )}
              />
            )}

            <span
              aria-hidden
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500 ease-soft",
                isCurrent
                  ? "border-transparent bg-card text-primary ring-2 ring-foreground/55"
                  : reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
              )}
            >
              {isCurrent ? (
                <Car className="h-3.5 w-3.5" />
              ) : isLicence ? (
                <Flag className="h-3 w-3" />
              ) : reached ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : null}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    reached ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {rank.name}
                </p>
                {isCurrent && (
                  <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary">
                    You are here
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {isNext && prog.unmet.length > 0 ? (
                  <>
                    <span className="text-foreground">To reach it:</span> {prog.unmet.join(" · ")}
                  </>
                ) : (
                  rank.tagline
                )}
              </p>

              {/* Only the next rank gets a bar — every other row is settled. */}
              {isNext && !isLicence && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700 ease-glass"
                    style={{ width: `${Math.round(prog.cpPct * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
