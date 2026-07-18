import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { CategoryIcon } from "@/components/shared/category-icon";
import { categoryName } from "@/lib/content/categories";
import { glass } from "@/lib/utils";
import type { CategoryId } from "@/types";

export function WeakAreas({
  perCategory,
  hasAttempts,
  limit = 4,
}: {
  perCategory: Record<CategoryId, number>;
  /** Whether the learner has answered anything yet. */
  hasAttempts: boolean;
  limit?: number;
}) {
  const ranked = (Object.keys(perCategory) as CategoryId[])
    .sort((a, b) => perCategory[a] - perCategory[b])
    .slice(0, limit);

  // With no attempts, readiness still reports a uniform baseline for every
  // category — so this card would list four identical percentages under the
  // heading "Weak areas", reading as "you're bad at all of this" when the truth
  // is that we don't know yet. Attempt count is the honest signal, not the score.
  if (!hasAttempts) {
    return (
      <Card className={`${glass} p-6`}>
        <h2 className="font-display text-lg font-semibold">Weak areas</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Nothing to show yet — answer a few questions and we&apos;ll pinpoint exactly which
          categories need the work.
        </p>
        <Link
          href="/study/questions"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Start a practice session <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  return (
    <Card className={`${glass} p-6`}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Weak areas</h2>
        <Link href="/dashboard/progress" className="text-xs font-medium text-primary hover:underline">
          Full breakdown
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {ranked.map((cat) => (
          <Link
            key={cat}
            href={`/study/questions?category=${cat}`}
            className="group block"
          >
            <MasteryBar
              label={
                <span className="group-hover:text-primary">
                  {categoryName(cat)}
                </span>
              }
              value={perCategory[cat]}
              icon={<CategoryIcon id={cat} className="h-4 w-4 text-muted-foreground" />}
            />
          </Link>
        ))}
      </div>
      <Link
        href="/study/questions"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Practice your weak areas <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
