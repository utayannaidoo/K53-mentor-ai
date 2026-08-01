import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { cn, glassFloat } from "@/lib/utils";
import type { ExamSection } from "@/lib/constants";

const SECTION_LABEL: Record<ExamSection, string> = {
  controls: "vehicle controls",
  signs: "road signs",
  rules: "rules of the road",
};

export function ReadinessCard({
  readiness,
  passProbability,
  delta,
  blocking,
}: {
  readiness: number;
  passProbability: number;
  delta: number | null;
  /** The section sitting under its own pass mark, if one is. */
  blocking?: ExamSection | null;
}) {
  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaTone = delta && delta > 0 ? "text-success" : delta && delta < 0 ? "text-danger" : "text-muted-foreground";
  // Green on a number that means "you'd fail" reads as a bug. Tone it honestly.
  const passTone =
    passProbability >= 70 ? "text-success" : passProbability >= 35 ? "text-warning" : "text-danger";

  return (
    <Card className={cn(glassFloat, "flex flex-col items-center justify-center p-6 text-center")}>
      <ScoreRing value={readiness} size={172} label="Readiness" />
      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          Predicted pass{" "}
          <span className={cn("font-mono font-semibold", passTone)}>{passProbability}%</span>
        </span>
        <span className="h-4 w-px bg-border" />
        <span className={cn("flex items-center gap-1 font-medium", deltaTone)}>
          <DeltaIcon className="h-3.5 w-3.5" />
          {delta === null ? "New" : `${delta > 0 ? "+" : ""}${delta} this week`}
        </span>
      </div>

      {/* Two numbers far apart look like a bug unless you say why. The real
          test is passed section by section, so one weak section caps the whole
          prediction however much the learner knows overall. */}
      {blocking && (
        <p className="mt-3 max-w-[34ch] text-pretty text-xs leading-relaxed text-muted-foreground">
          Readiness is how much you know. Predicted pass is stricter, because the real test needs
          the pass mark in <strong>every</strong> section — and{" "}
          <span className="font-medium text-foreground">{SECTION_LABEL[blocking]}</span> is still
          under its own mark.
        </p>
      )}

      {/* Honesty note: the score is our estimate from in-app performance only —
          it must never read as a prediction of the official DLTC result. */}
      <p className="mt-3 max-w-[34ch] text-pretty text-xs leading-relaxed text-muted-foreground">
        Our estimate from your practice here — not a prediction of your official test result.
      </p>
    </Card>
  );
}
