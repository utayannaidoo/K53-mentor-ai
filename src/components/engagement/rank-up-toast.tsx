"use client";

import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { RANKS } from "@/lib/engagement";
import { cn, glassFloat } from "@/lib/utils";

/**
 * The rank-up moment — the biggest celebration in the loop. Reads the queued
 * pendingRankUp from the store and stays until acknowledged, so a promotion
 * earned mid-session is never missed.
 */
export function RankUpToast() {
  const { ready, state, acknowledgeRankUp } = useStudyStore();
  if (!ready || state.pendingRankUp === null) return null;
  const rank = RANKS[state.pendingRankUp];
  if (!rank) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-8">
      <Card className={cn(glassFloat, "w-full max-w-md animate-scale-in border-primary/30 p-5")}>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Trophy className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Rank up 🎉</p>
            <p className="mt-0.5 font-display text-xl font-semibold tracking-tight">{rank.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{rank.tagline}</p>
          </div>
        </div>
        <Button className="mt-4 w-full" onClick={acknowledgeRankUp}>
          Keep going
        </Button>
      </Card>
    </div>
  );
}
