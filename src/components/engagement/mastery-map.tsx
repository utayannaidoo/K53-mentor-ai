"use client";

import Link from "next/link";
import { Award, Check } from "lucide-react";
import { CategoryIcon } from "@/components/shared/category-icon";
import { categoryMastery } from "@/lib/dashboard/mastery";
import { MASTERY_STAMP_AT } from "@/lib/engagement";
import { thresholdTone } from "@/lib/score";
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

/**
 * A category node: the ring is the present, the stamp is the record.
 *
 * These used to be two components — a ring here and an identical row of stamp
 * circles in a Driving Passport card directly beneath, showing the same
 * `perCategory` twice a few centimetres apart. The stamp is not separate data;
 * it is what a ring looks like at 90%. So it lives on the ring now.
 *
 * Colour comes from `thresholdTone` against the category's own exam-section pass
 * mark, not the generic 45/70 bands: Road signs needs 82%, so a green 80% here
 * would tell a learner they are clear on the one screen they use to decide
 * whether to book the test.
 */
function MasteryRing({
  value,
  required,
  categoryId,
}: {
  value: number;
  required: number;
  categoryId: CategoryId;
}) {
  const pct = clamp(value);
  const mastered = pct >= MASTERY_STAMP_AT;
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="relative inline-flex" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" aria-hidden>
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
            STROKE_BY_TONE[thresholdTone(pct, required)],
          )}
        />
        {/* The pass mark this category is actually judged against. */}
        <line
          x1={RING_SIZE / 2}
          y1={RING_STROKE / 2 + 1}
          x2={RING_SIZE / 2}
          y2={RING_STROKE + 2.5}
          className="stroke-foreground/45"
          strokeWidth={1.5}
          strokeLinecap="round"
          transform={`rotate(${(required / 100) * 360} ${RING_SIZE / 2} ${RING_SIZE / 2})`}
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
      {/* The stamp. Tilted, because a stamp is pressed by hand. */}
      {mastered && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 -rotate-12 items-center justify-center rounded-full bg-success text-white shadow-sm">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </span>
  );
}

/**
 * The Mastery Map — every category, weakest first, so the map is also the
 * to-do list. The last cell is the licence itself: unreachable inside the app
 * on purpose, because it belongs to test day.
 */
export function MasteryMap({ perCategory }: { perCategory: Record<CategoryId, number> }) {
  const rows = categoryMastery(perCategory);

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={`/study/questions?category=${row.id}`}
            className={cn(
              "press group flex h-full flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors hover:bg-background/70",
              row.value >= MASTERY_STAMP_AT
                ? "border-success/40 bg-background/40"
                : "border-border/50 bg-background/40 hover:border-primary/30",
            )}
          >
            <MasteryRing value={row.value} required={row.required} categoryId={row.id} />
            <span className="text-sm font-medium leading-tight text-foreground group-hover:text-primary">
              {row.name}
            </span>
            <span className="font-mono text-2xs tabular-nums text-muted-foreground">
              {row.value}%
              <span className="text-muted-foreground/60"> / {row.required}%</span>
            </span>
          </Link>
        </li>
      ))}

      {/* The final page of the passport. */}
      <li>
        <div className="flex h-full flex-col items-center gap-2 rounded-xl border border-dashed border-accent/40 p-4 text-center">
          <span
            className="flex items-center justify-center text-accent/60"
            style={{ width: RING_SIZE, height: RING_SIZE }}
            aria-hidden
          >
            <Award className="h-7 w-7" />
          </span>
          <span className="text-sm font-medium leading-tight text-muted-foreground">
            The day you pass
          </span>
          <span className="text-2xs text-muted-foreground/70">Stamped for real</span>
        </div>
      </li>
    </ul>
  );
}
