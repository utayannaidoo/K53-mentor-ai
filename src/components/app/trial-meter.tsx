"use client";

import Link from "next/link";
import { useStudyStore } from "@/hooks/use-study-store";
import { cn } from "@/lib/utils";

const LABEL: Record<string, string> = {
  questions: "free questions",
  flashcards: "free flashcards",
  tutor: "free tutor messages",
};

/**
 * Quiet low-fuel warning for the free trial. Deliberately invisible while the
 * pool is healthy — it only appears once ≤25% remains, as a slim muted line
 * (danger tone at ≤10%), so studying never feels metered until it's about to
 * actually stop.
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
  if (!Number.isFinite(cap) || cap <= 0) return null;
  const left = Math.max(0, cap - used);
  const ratio = left / cap;
  if (ratio > 0.25) return null;

  return (
    <p
      className={cn(
        "text-right text-xs",
        ratio <= 0.1 ? "text-danger" : "text-muted-foreground",
        className,
      )}
    >
      {left} {LABEL[feature] ?? "left"} left ·{" "}
      <Link href="/account/billing" className="font-medium text-primary hover:underline">
        Upgrade
      </Link>
    </p>
  );
}
