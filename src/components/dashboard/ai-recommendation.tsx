import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { categoryName } from "@/lib/content/categories";
import type { CategoryId } from "@/types";
import { cn } from "@/lib/utils";

export function AiRecommendation({
  category,
  missCount,
}: {
  category: CategoryId | null;
  missCount: number;
}) {
  const message =
    category && missCount >= 2
      ? `You've missed ${missCount} ${categoryName(category).toLowerCase()} questions. Want me to explain this differently?`
      : category
        ? `${categoryName(category)} is your weakest area right now. A quick explanation could move your readiness fast.`
        : "You're tracking well across the board. Try a full mock exam to pressure-test your readiness.";

  const href = category
    ? `/tutor?category=${category}`
    : "/study/mock-exam";
  const cta = category ? "Ask the tutor" : "Take a mock exam";

  return (
    <Card className="flex flex-col border-primary/25 bg-primary/[0.06] p-6 shadow-glass backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="h-4 w-4" /> AI recommendation
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">{message}</p>
      <Link href={href} className={cn(buttonVariants({ variant: "ai" }), "mt-4 w-full")}>
        {cta} <ArrowRight />
      </Link>
    </Card>
  );
}
