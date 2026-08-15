"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { categoryMastery } from "@/lib/dashboard/mastery";
import { cn, glass } from "@/lib/utils";
import type { CategoryId } from "@/types";

/**
 * Every category, weakest first, against the mark its exam section has to hit.
 *
 * The reference this borrows its shape from is a plain "areas of interest"
 * list — label, bar, percentage, an arrow. The bar is the useful part and the
 * arrow is decoration there. Here the arrow carries the actual meaning: up and
 * green means this category is clearing the minimum its section needs, down and
 * amber means it is not, and the marker on the track shows by how much.
 *
 * That is the difference between "signs is your worst at 64%" and "signs needs
 * 82% and you are at 64%" — the first is a ranking, the second is a decision.
 */
export function MasteryRail({
  perCategory,
  hasAttempts,
}: {
  perCategory: Record<CategoryId, number>;
  /** Before any answers the model reports a flat baseline, which is not mastery. */
  hasAttempts: boolean;
}) {
  const rows = categoryMastery(perCategory);

  return (
    <Card className={cn(glass, "p-5")}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">Mastery</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {hasAttempts ? "Against each section's pass mark" : "Answer a few questions to fill this in"}
          </p>
        </div>
        <Link href="/dashboard/progress" className="shrink-0 text-xs font-medium text-primary hover:underline">
          Details
        </Link>
      </div>

      <ul className="mt-4 space-y-3.5">
        {rows.map((row) => {
          const Icon = row.clearing ? ArrowUp : ArrowDown;
          return (
            <li key={row.id}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium text-foreground">{row.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {hasAttempts ? `${row.value}%` : "—"}
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full",
                      row.clearing && hasAttempts
                        ? "bg-success/15 text-success"
                        : "bg-warning/15 text-warning",
                    )}
                    // The bar alone is colour-only information; say it in words too.
                    aria-label={
                      hasAttempts
                        ? row.clearing
                          ? `Clearing the ${row.required}% this section needs`
                          : `Below the ${row.required}% this section needs`
                        : "Not enough answers yet"
                    }
                  >
                    <Icon className="h-3 w-3" strokeWidth={3} />
                  </span>
                </span>
              </div>

              <div className="relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500 ease-glass",
                    row.clearing && hasAttempts ? "bg-success" : "bg-primary",
                  )}
                  style={{ width: `${hasAttempts ? row.value : 0}%` }}
                />
                {/* Where this section's mark actually sits. */}
                <span
                  aria-hidden
                  className="absolute top-0 h-full w-px bg-foreground/35"
                  style={{ left: `${row.required}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-2xs leading-relaxed text-muted-foreground">
        The line on each track is that section&apos;s pass mark. Signs and rules carry the most
        marks, so they move your predicted pass the fastest.
      </p>
    </Card>
  );
}
