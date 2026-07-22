"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { localPlanRationale, type PlanRationaleData } from "@/lib/ai/coach";
import type { PlanTask } from "@/lib/plan";
import { cn, glassFloat } from "@/lib/utils";

const CACHE_KEY = "k53mentor.coach.plan.v1";

/**
 * Fetch the one-line "why this plan" from the coach, cached per day + plan
 * signature so a normal day costs a single LLM call. Falls back to the local
 * template on any failure — the hero card never shows an error.
 */
function useCoachRationale(input: PlanRationaleData): string | null {
  const [text, setText] = React.useState<string | null>(null);
  const sig = [input.weakestCategory ?? "", input.dueCards ?? 0, input.daysToTest ?? ""].join("|");
  const inputRef = React.useRef(input);
  inputRef.current = input;

  React.useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "null") as {
        date?: string;
        sig?: string;
        text?: string;
      } | null;
      if (cached?.date === today && cached.sig === sig && cached.text) {
        setText(cached.text);
        return;
      }
    } catch {
      /* corrupt cache — refetch */
    }

    const controller = new AbortController();
    fetch("/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "plan_rationale", data: inputRef.current }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`coach ${r.status}`))))
      .then((j: { text?: string }) => {
        const t = j.text && typeof j.text === "string" ? j.text : localPlanRationale(inputRef.current);
        setText(t);
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, sig, text: t }));
        } catch {
          /* quota — skip caching */
        }
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name !== "AbortError") setText(localPlanRationale(inputRef.current));
      });
    return () => controller.abort();
  }, [sig]);

  return text;
}

export function CoachPlan({
  tasks,
  doneMap,
  scenariosUnlocked,
  planLocked = false,
  rationaleInput,
}: {
  tasks: PlanTask[];
  doneMap: Record<string, boolean>;
  scenariosUnlocked: boolean;
  /** Free tier: the multi-task daily plan is a paid feature — only the first
   * task stays actionable, the rest show as a locked preview. */
  planLocked?: boolean;
  rationaleInput: PlanRationaleData;
}) {
  const rationale = useCoachRationale(rationaleInput);
  const totalMin = tasks.reduce((s, t) => s + t.estMinutes, 0);
  const firstIncomplete = tasks.find((t) => !doneMap[t.id]);
  const allDone = !firstIncomplete;

  return (
    <Card className={cn(glassFloat, "mb-5 p-6")}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-4 w-4" /> Coach&apos;s plan
        </span>
        <span className="text-xs text-muted-foreground">~{totalMin} min</span>
      </div>

      {rationale ? (
        <p className="mt-3 animate-fade-in font-display text-lg font-medium leading-snug tracking-tight text-balance">
          {rationale}
        </p>
      ) : (
        <div className="mt-4 space-y-2" aria-label="Preparing your plan">
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {/* grid-cols-1 (minmax(0,1fr)) — an auto column would size to the widest
          nowrap subtitle and overflow the card on phones. */}
      <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {tasks.map((task, idx) => {
          const done = doneMap[task.id];
          const locked = (task.premium && !scenariosUnlocked) || (planLocked && idx > 0);
          const href = locked ? "/account/billing" : task.href;
          return (
            <li key={task.id}>
              <Link
                href={href}
                className={cn(
                  "press flex h-full items-start gap-2.5 rounded-xl border border-border/50 bg-background/40 px-3 py-3 hover:border-primary/30 hover:bg-background/70",
                  done && "opacity-60",
                )}
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : locked ? (
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      done ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {task.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{task.subtitle}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {planLocked && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> The full multi-step daily plan is a Premium feature —{" "}
          <Link href="/account/billing" className="font-medium text-primary hover:underline">
            unlock it
          </Link>
        </p>
      )}

      {allDone ? (
        <div className="mt-4 rounded-lg bg-success/10 px-4 py-3 text-center text-sm font-medium text-success">
          🎉 Plan complete — come back tomorrow to keep your streak.
        </div>
      ) : (
        <Link href={firstIncomplete!.href} className={cn(buttonVariants(), "mt-4 w-full sm:w-auto")}>
          Start today&apos;s plan <ArrowRight />
        </Link>
      )}
    </Card>
  );
}
