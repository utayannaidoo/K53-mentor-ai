"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Snowflake, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useStudyStore } from "@/hooks/use-study-store";
import { canRegain, daysBetween, todayKey } from "@/lib/store/local-store";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "k53mentor.streakbanner.dismissed";

type BannerState =
  | { kind: "risk"; streak: number }
  | { kind: "freeze"; streak: number };

/**
 * The streak's early-warning voice — it only speaks while there is something
 * to save:
 *  - risk:   studied yesterday, not yet today, afternoon onwards — save it now.
 *  - freeze: one missed day and this run's single regain can still bridge it.
 *
 * A run that is already gone gets no banner at all: `resolveStreak` has shown
 * it as restarted at login, and a "come back" prompt whose tap lands the
 * learner on day 1 reads as a promise the app then breaks. Self-dismisses the
 * moment the user studies (the gap goes to 0), and can be snoozed for the day.
 * Hidden inside focused study flows.
 */
export function StreakBanner() {
  const { ready, state } = useStudyStore();
  const pathname = usePathname();
  const [dismissed, setDismissed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(DISMISS_KEY) === todayKey();
    } catch {
      return false;
    }
  });

  // Don't interrupt an active study session — the session itself clears the risk.
  const inFocusedFlow = pathname.startsWith("/study/");
  if (!ready || dismissed || inFocusedFlow) return null;

  const { current, lastStudyDate } = state.streak;
  if (!lastStudyDate || current < 2) return null;

  const gap = daysBetween(lastStudyDate, todayKey());
  let banner: BannerState | null = null;
  if (gap === 1 && new Date().getHours() >= 15) {
    banner = { kind: "risk", streak: current };
  } else if (gap === 2 && canRegain(state.streak)) {
    banner = { kind: "freeze", streak: current };
  }
  if (!banner) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, todayKey());
    } catch {
      /* private mode — session-only dismiss */
    }
  }

  const style = {
    risk: {
      icon: <Flame className="h-4 w-4" />,
      wrap: "border-warning/40 bg-warning/[0.08] text-warning",
      message: `Your ${banner.streak}-day streak ends at midnight — five quiet minutes keeps it alive.`,
      cta: "Keep it alive",
    },
    freeze: {
      icon: <Snowflake className="h-4 w-4" />,
      wrap: "border-primary/30 bg-primary/[0.06] text-primary",
      message: `Your freeze covered yesterday. Study today and your ${banner.streak}-day streak carries on.`,
      cta: "Continue streak",
    },
  }[banner.kind];

  return (
    <div className="mx-auto mb-5 max-w-5xl animate-fade-in">
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3",
          style.wrap,
        )}
      >
        {style.icon}
        <p className="min-w-0 flex-1 text-sm font-medium">{style.message}</p>
        <Link
          href="/study/flashcards"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          {style.cta}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss for today"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
