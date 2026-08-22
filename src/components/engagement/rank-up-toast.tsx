"use client";

import { Medal, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { ACHIEVEMENT_BY_ID } from "@/lib/achievements";
import { RANKS } from "@/lib/engagement";
import { cn, glassFloat } from "@/lib/utils";

/**
 * The celebration surface — rank-ups and achievement unlocks.
 *
 * One component for both because two would be two toasts stacked on top of each
 * other the moment a mock exam earns a rank and a badge together, which it
 * routinely does. The rank outranks the badge when both are queued: it is the
 * larger moment, and the badge is still waiting behind it afterwards.
 */
export function RankUpToast() {
  const { ready, state, acknowledgeRankUp, acknowledgeAchievement } = useStudyStore();
  if (!ready) return null;

  const rank = state.pendingRankUp === null ? null : RANKS[state.pendingRankUp];
  const unlock = rank ? null : state.pendingAchievements[0];
  const achievement = unlock ? ACHIEVEMENT_BY_ID[unlock.id] : undefined;

  if (!rank && !achievement) return null;

  const kicker = rank ? "Rank up 🎉" : "Achievement";
  const title = rank ? rank.name : `${achievement!.name} — ${achievement!.tiers[unlock!.tier].name}`;
  const body = rank ? rank.tagline : achievement!.description;

  return (
    <div
      className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-8"
      // Unprompted overlay that covers content: screen readers must hear it.
      role="status"
      aria-live="polite"
    >
      <Card className={cn(glassFloat, "w-full max-w-md animate-scale-in border-primary/30 p-5")} aria-labelledby="rank-up-title">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            {rank ? <Trophy className="h-6 w-6" /> : <Medal className="h-6 w-6" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{kicker}</p>
            <p id="rank-up-title" className="mt-0.5 font-display text-xl font-semibold tracking-tight">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        </div>
        <Button
          className="mt-4 w-full"
          onClick={rank ? acknowledgeRankUp : acknowledgeAchievement}
        >
          Keep going
        </Button>
      </Card>
    </div>
  );
}
