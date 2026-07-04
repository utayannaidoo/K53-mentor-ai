"use client";

import { Award, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared/category-icon";
import { CATEGORIES } from "@/lib/content/categories";
import { MASTERY_STAMP_AT } from "@/lib/engagement";
import { cn, glass } from "@/lib/utils";
import type { CategoryId } from "@/types";

/**
 * The Driving Passport — a stamp per mastered category, with the final page
 * reserved for the real licence. The last stamp is deliberately unreachable
 * inside the app: it belongs to test day.
 */
export function DrivingPassport({ perCategory }: { perCategory: Record<CategoryId, number> }) {
  const stamped = CATEGORIES.filter((c) => (perCategory[c.id] ?? 0) >= MASTERY_STAMP_AT).length;

  return (
    <Card className={cn(glass, "p-6")}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Driving Passport</h2>
        <span className="font-mono text-xs text-muted-foreground">
          {stamped}/{CATEGORIES.length} stamps
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Master a category (90%+) to earn its stamp. The last page is for the real thing.
      </p>

      <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-8">
        {CATEGORIES.map((cat) => {
          const earned = (perCategory[cat.id] ?? 0) >= MASTERY_STAMP_AT;
          return (
            <div key={cat.id} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-full",
                  earned
                    ? "-rotate-6 border-2 border-success/60 bg-success/10 text-success"
                    : "border-2 border-dashed border-border text-muted-foreground/50",
                )}
              >
                <CategoryIcon id={cat.id} className="h-5 w-5" />
                {earned && (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-white shadow-sm">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </span>
              <span className="text-center text-2xs leading-tight text-muted-foreground">{cat.short}</span>
            </div>
          );
        })}

        {/* The licence itself — stamped the day they pass for real. */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-accent/50 text-accent/60">
            <Award className="h-5 w-5" />
          </span>
          <span className="text-center text-2xs leading-tight text-muted-foreground">The day you pass</span>
        </div>
      </div>
    </Card>
  );
}
