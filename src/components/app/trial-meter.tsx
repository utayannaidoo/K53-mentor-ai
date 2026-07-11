"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStudyStore } from "@/hooks/use-study-store";
import { cn, glass } from "@/lib/utils";

const LABEL: Record<string, string> = {
  questions: "free questions",
  flashcards: "free flashcards",
  tutor: "free tutor messages",
};

/**
 * Pre-emptive trial gauge for free users: "7 of 15 free questions left".
 * The free tier is a lifetime pool, so this is the only warning a learner gets
 * before the paywall — amber when running low, red when nearly gone.
 * Renders nothing for paid tiers or unlimited pools.
 */
export function TrialMeter({
  feature,
  className,
}: {
  feature: "questions" | "flashcards" | "tutor";
  className?: string;
}) {
  const { state, usageFor } = useStudyStore();
  if (state.tier !== "free") return null;
  const { used, cap } = usageFor(feature);
  if (!Number.isFinite(cap)) return null;
  const left = Math.max(0, cap - used);
  const ratio = cap > 0 ? left / cap : 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-full border px-3.5 py-1.5 text-xs",
        ratio <= 0.1
          ? "border-danger/30 bg-danger/[0.07] text-danger"
          : ratio <= 0.34
            ? "border-warning/30 bg-warning/[0.08] text-warning"
            : "border-border bg-card/60 text-muted-foreground",
        className,
      )}
    >
      <span className="font-medium">
        <span className="font-mono tabular">{left}</span> of{" "}
        <span className="font-mono tabular">{cap}</span> {LABEL[feature] ?? "left"} left
      </span>
      {ratio <= 0.34 && (
        <Link
          href="/account/billing"
          className="flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline"
        >
          <Sparkles className="h-3 w-3" /> Upgrade
        </Link>
      )}
    </div>
  );
}

const POOL_LABEL = { questions: "Questions", flashcards: "Flashcards", tutor: "Tutor messages" } as const;

/**
 * Dashboard overview of the whole free-trial tank — all three pools at a
 * glance, so running out is never a surprise. Free tier only.
 */
export function TrialPoolsCard({ className }: { className?: string }) {
  const { state, usageFor } = useStudyStore();
  if (state.tier !== "free") return null;
  const pools = (Object.keys(POOL_LABEL) as (keyof typeof POOL_LABEL)[])
    .map((k) => ({ key: k, ...usageFor(k) }))
    .filter((p) => Number.isFinite(p.cap));
  if (pools.length === 0) return null;

  return (
    <Card className={cn(glass, "mb-5 p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Your free trial</h2>
        <Link
          href="/account/billing"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Sparkles className="h-3 w-3" /> Go unlimited
        </Link>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {pools.map((p) => {
          const left = Math.max(0, p.cap - p.used);
          const ratio = p.cap > 0 ? left / p.cap : 0;
          return (
            <div key={p.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{POOL_LABEL[p.key]}</span>
                <span className="font-mono tabular text-foreground">
                  {left}/{p.cap}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-300",
                    ratio <= 0.1 ? "bg-danger" : ratio <= 0.34 ? "bg-warning" : "bg-primary",
                  )}
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
