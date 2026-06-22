import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { cn, glassFloat } from "@/lib/utils";

export function ReadinessCard({
  readiness,
  passProbability,
  delta,
}: {
  readiness: number;
  passProbability: number;
  delta: number | null;
}) {
  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaTone = delta && delta > 0 ? "text-success" : delta && delta < 0 ? "text-danger" : "text-muted-foreground";

  return (
    <Card className={cn(glassFloat, "flex flex-col items-center justify-center p-6 text-center")}>
      <ScoreRing value={readiness} size={172} label="Readiness" />
      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          Predicted pass{" "}
          <span className="font-mono font-semibold text-success">{passProbability}%</span>
        </span>
        <span className="h-4 w-px bg-border" />
        <span className={cn("flex items-center gap-1 font-medium", deltaTone)}>
          <DeltaIcon className="h-3.5 w-3.5" />
          {delta === null ? "New" : `${delta > 0 ? "+" : ""}${delta} this week`}
        </span>
      </div>
    </Card>
  );
}
