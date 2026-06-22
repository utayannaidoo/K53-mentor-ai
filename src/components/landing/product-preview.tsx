import { CheckCircle2, Circle, Flame, Sparkles } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { Badge } from "@/components/ui/badge";
import { cn, glassFloat } from "@/lib/utils";

const TASKS = [
  { label: "12 flashcards due", done: true },
  { label: "Practice: Intersections", done: true },
  { label: "1 scenario challenge", done: false },
];

const WEAK = [
  { label: "Following distance", value: 41 },
  { label: "Intersections", value: 58 },
  { label: "Road signs", value: 84 },
];

export function ProductPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        glassFloat,
        "overflow-hidden rounded-[1.4rem] border",
        className,
      )}
    >
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <span className="ml-3 text-2xs text-muted-foreground">k53mentor.ai/dashboard</span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Good evening, Thando</p>
            <p className="font-display text-sm font-semibold">Today&apos;s plan</p>
          </div>
          <Badge variant="accent" className="gap-1">
            <Flame className="h-3 w-3" /> 12-day streak
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background/60 p-4">
            <ScoreRing value={72} size={132} stroke={11} label="Readiness" animate={false} />
            <p className="mt-2 text-2xs text-muted-foreground">
              Predicted pass <span className="font-semibold text-success">78%</span> · ↑ 6 this week
            </p>
          </div>

          <div className="space-y-2.5">
            {TASKS.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-background/60 px-3 py-2.5"
              >
                {t.done ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    t.done ? "text-muted-foreground line-through" : "font-medium text-foreground",
                  )}
                >
                  {t.label}
                </span>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs text-foreground">
                You&apos;ve missed 3 following-distance questions — want me to explain it differently?
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Weak areas
          </p>
          {WEAK.map((w) => (
            <MasteryBar key={w.label} label={w.label} value={w.value} />
          ))}
        </div>
      </div>
    </div>
  );
}
