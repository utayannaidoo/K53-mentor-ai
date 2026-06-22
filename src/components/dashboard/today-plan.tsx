import Link from "next/link";
import { CheckCircle2, Circle, Layers, HelpCircle, Route, ArrowRight, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { PlanTask, PlanTaskType } from "@/lib/plan";
import { cn, glass } from "@/lib/utils";

const TYPE_ICON: Record<PlanTaskType, typeof Layers> = {
  flashcards: Layers,
  questions: HelpCircle,
  scenario: Route,
  mock: HelpCircle,
};

export function TodayPlan({
  tasks,
  doneMap,
  scenariosUnlocked,
}: {
  tasks: PlanTask[];
  doneMap: Record<string, boolean>;
  scenariosUnlocked: boolean;
}) {
  const totalMin = tasks.reduce((s, t) => s + t.estMinutes, 0);
  const firstIncomplete = tasks.find((t) => !doneMap[t.id]);
  const allDone = !firstIncomplete;

  return (
    <Card className={cn(glass, "flex flex-col p-6")}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Today&apos;s plan</h2>
        <span className="text-xs text-muted-foreground">~{totalMin} min</span>
      </div>

      <ul className="mt-4 flex-1 space-y-2.5">
        {tasks.map((task) => {
          const Icon = TYPE_ICON[task.type];
          const done = doneMap[task.id];
          const locked = task.premium && !scenariosUnlocked;
          const href = locked ? "/account/billing" : task.href;
          return (
            <li key={task.id}>
              <Link
                href={href}
                className={cn(
                  "press flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 px-3 py-3 hover:border-primary/30 hover:bg-background/70",
                  done && "opacity-60",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", done ? "text-muted-foreground line-through" : "text-foreground")}>
                    {task.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{task.subtitle}</p>
                </div>
                {locked ? (
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {allDone ? (
        <div className="mt-4 rounded-lg bg-success/10 px-4 py-3 text-center text-sm font-medium text-success">
          🎉 Today&apos;s plan complete — come back tomorrow to keep your streak.
        </div>
      ) : (
        <Link href={firstIncomplete!.href} className={cn(buttonVariants(), "mt-4 w-full")}>
          Start today&apos;s plan <ArrowRight />
        </Link>
      )}
    </Card>
  );
}
