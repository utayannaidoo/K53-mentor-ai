"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { CategoryIcon } from "@/components/shared/category-icon";
import { CATEGORIES } from "@/lib/content/categories";
import { MASTERY_STAMP_AT } from "@/lib/engagement";
import { scoreTone } from "@/lib/score";
import { cn, clamp } from "@/lib/utils";
import type { CategoryId } from "@/types";

const RING_SIZE = 72;
const RING_STROKE = 6;

const STROKE_BY_TONE = {
  primary: "stroke-primary",
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
} as const;

function MasteryRing({ value, categoryId }: { value: number; categoryId: CategoryId }) {
  const pct = clamp(value);
  const mastered = pct >= MASTERY_STAMP_AT;
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="relative inline-flex" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          strokeWidth={RING_STROKE}
          className="stroke-muted"
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-soft",
            mastered ? "stroke-success" : STROKE_BY_TONE[scoreTone(pct)],
          )}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          mastered ? "text-success" : "text-muted-foreground",
        )}
      >
        <CategoryIcon id={categoryId} className="h-6 w-6" />
      </span>
    </span>
  );
}

/**
 * The Mastery Map — every category as a node whose ring reflects sustained
 * competence (practice accuracy blended with spaced-repetition retention).
 * A node stamps gold-green at 90%+; each stamp also fills the Driving Passport.
 */
export function MasteryMap({ perCategory }: { perCategory: Record<CategoryId, number> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {CATEGORIES.map((cat) => {
        const value = perCategory[cat.id] ?? 0;
        const mastered = value >= MASTERY_STAMP_AT;
        return (
          <Link
            key={cat.id}
            href={`/study/questions?category=${cat.id}`}
            className={cn(
              "press group flex flex-col items-center gap-2 rounded-xl border bg-background/40 p-4 text-center transition-colors hover:bg-background/70",
              mastered ? "border-success/40" : "border-border/50 hover:border-primary/30",
            )}
          >
            <MasteryRing value={value} categoryId={cat.id} />
            <span className="text-sm font-medium leading-tight text-foreground group-hover:text-primary">
              {cat.short}
            </span>
            {mastered ? (
              <span className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wide text-success">
                <BadgeCheck className="h-3.5 w-3.5" /> Mastered
              </span>
            ) : (
              <span className="font-mono text-xs text-muted-foreground">{clamp(value)}%</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
