"use client";

import * as React from "react";
import { TodaySheet } from "@/components/dashboard/today-sheet";
import { trialExhausted } from "@/components/app/trial-end-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { usePlanRationale } from "@/components/dashboard/coach-plan";
import { countDueFlashcards, generateTodayPlan, isTaskDone, planFocus } from "@/lib/plan";
import { isCramWindow, daysUntilTest } from "@/lib/learning/cram";
import { openMistakes } from "@/lib/learning/mistakes";
import { categoryName } from "@/lib/content/categories";
import { CODE_LABEL, hasFeature, PLAN_MAP, studyCodeOf } from "@/lib/billing/plans";
import { rankProgress } from "@/lib/engagement";
import { topAlert, type DashboardAlert } from "@/lib/dashboard/alerts";
import { activeDaysFrom } from "@/lib/dashboard/day-strip";
import { daysUntil } from "@/lib/utils";

/**
 * Today.
 *
 * One object on the page, and everything is a band inside it — see
 * `TodaySheet` for why, and for the rules that keep it that way. The page's
 * only job is to gather the numbers and pick the single interruption; it
 * deliberately renders nothing beside the sheet, because a second card is all
 * it takes for this to become a grid again.
 */
export default function DashboardPage() {
  const { state, readiness, hasDiagnostic } = useStudyStore();

  const tasks = generateTodayPlan(state, readiness);
  const doneMap = Object.fromEntries(tasks.map((t) => [t.id, isTaskDone(t, state)]));
  const doneCount = tasks.filter((t) => doneMap[t.id]).length;
  const planDonePct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const focus = planFocus(state, readiness);
  const rationale = usePlanRationale({
    firstName: state.profile?.name?.split(" ")[0],
    weakestCategory: focus.categoryId ? categoryName(focus.categoryId) : undefined,
    weakestPct:
      focus.categoryId && !focus.fromWorry ? readiness.perCategory[focus.categoryId] : undefined,
    fromWorry: focus.fromWorry,
    dueCards: countDueFlashcards(state),
    daysToTest: daysUntil(state.onboarding?.testDate ?? null),
    streak: state.streak.current,
  });

  const mistakes = openMistakes(state);
  const alertKey = topAlert({
    cram: isCramWindow(state) && mistakes.length > 0,
    "trial-ended": trialExhausted(state),
    diagnostic: !hasDiagnostic,
    comeback: state.pendingComeback !== null,
  });

  // The day strip reads from what the learner actually did, whichever surface
  // they did it on.
  const activeDays = React.useMemo(
    () => activeDaysFrom([state.attempts, state.sessions, state.mockExams, state.scenarioAttempts]),
    [state.attempts, state.sessions, state.mockExams, state.scenarioAttempts],
  );

  const rank = rankProgress(state.rankAchieved, {
    cp: state.cp,
    readiness: readiness.readiness,
    hasPassedMock: state.mockExams.some((m) => m.passed && !m.mini && !m.drill),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <TodaySheet
        firstName={state.profile?.name?.split(" ")[0] ?? "there"}
        vehicleLabel={CODE_LABEL[studyCodeOf(state)]}
        readiness={readiness.readiness}
        passProbability={readiness.passProbability}
        delta={weekDelta(state.readinessHistory, readiness.readiness)}
        streak={state.streak.current}
        cp={state.cp}
        daysToTest={daysUntil(state.onboarding?.testDate ?? null)}
        testDate={state.onboarding?.testDate ?? null}
        planDonePct={planDonePct}
        perCategory={readiness.perCategory}
        hasAttempts={state.attempts.length > 0}
        activeDays={activeDays}
        tasks={tasks}
        doneMap={doneMap}
        scenariosUnlocked={hasFeature(state.tier, "scenarios")}
        planLocked={!PLAN_MAP[state.tier].limits.studyPlan}
        rationale={rationale}
        alert={alertBand(alertKey, { mistakes: mistakes.length, days: daysUntilTest(state) })}
        trend={state.readinessHistory}
        rankLine={
          rank.next
            ? `${rank.current.name} · ${rank.unmet[0] ?? `next: ${rank.next.name}`}`
            : `${rank.current.name} — the road is done`
        }
      />
    </div>
  );
}

/** The chosen alert, as the band the sheet renders. */
function alertBand(
  key: DashboardAlert | null,
  ctx: { mistakes: number; days: number | null },
) {
  switch (key) {
    case "cram":
      return {
        tone: "warning" as const,
        title:
          ctx.days === 0
            ? "Your test is today"
            : ctx.days === 1
              ? "Your test is tomorrow"
              : `Your test is in ${ctx.days} days`,
        body: `Skip the new material — ${ctx.mistakes} questions are still tripping you up.`,
        href: "/study/questions?mode=cram",
        cta: "Drill mistakes",
      };
    case "trial-ended":
      return {
        tone: "primary" as const,
        title: "Your free week is over",
        body: "Pick a plan to keep your daily allowance and the full study plan.",
        href: "/account/billing",
        cta: "See plans",
      };
    case "diagnostic":
      return {
        tone: "primary" as const,
        title: "Take your diagnostic",
        body: "It personalises your whole plan and readiness score.",
        href: "/diagnostic",
        cta: "Start",
      };
    case "comeback":
      return {
        tone: "primary" as const,
        title: "Welcome back",
        body: "Your progress held while you were away — pick up where you left off.",
        href: "/study",
        cta: "Resume",
      };
    default:
      return null;
  }
}

function weekDelta(
  history: { date: string; readiness: number }[],
  current: number,
): number | null {
  if (history.length < 2) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const within = history.filter((h) => h.date >= cutoffKey);
  const base = (within[0] ?? history[0]).readiness;
  return current - base;
}
