"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The thumb-row under a session player on phones.
 *
 * On desktop the prev/next controls flank the question column as round arrows;
 * on a phone that layout stole 104px from the question, wrapped every answer
 * into skinny towers, and put the primary action — advancing — mid-screen on
 * the trailing edge, out of one-handed reach. Below `sm` this row renders
 * instead: back on the leading edge, next as a full-width bar sitting right
 * under the answers (and their explanations), where the thumb already is.
 */
export function SessionNavRow({
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  nextLabel,
  finish,
  finishLabel = "Finish",
}: {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  /** Label for the steady-state advance button, e.g. "Next question". */
  nextLabel: string;
  /** When true the advance button completes the session instead of advancing. */
  finish?: boolean;
  finishLabel?: string;
}) {
  const FinishIcon = finish ? Check : ChevronRight;
  return (
    <div className="mt-6 flex items-center gap-3 sm:hidden">
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
        aria-label="Previous"
        className={cn(
          "press flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          prevDisabled
            ? "cursor-not-allowed border-border/40 text-muted-foreground/30"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          "press flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-5",
          finish
            ? "border-2 border-success/60 bg-success/[0.08] text-success"
            : "bg-primary text-primary-foreground shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.55)] hover:brightness-[1.05]",
        )}
      >
        {finish ? finishLabel : nextLabel}
        <FinishIcon />
      </button>
    </div>
  );
}
