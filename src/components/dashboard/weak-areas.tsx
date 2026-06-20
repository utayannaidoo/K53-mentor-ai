import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { CategoryIcon } from "@/components/shared/category-icon";
import { categoryName } from "@/lib/content/categories";
import type { CategoryId } from "@/types";

export function WeakAreas({
  perCategory,
  limit = 4,
}: {
  perCategory: Record<CategoryId, number>;
  limit?: number;
}) {
  const ranked = (Object.keys(perCategory) as CategoryId[])
    .sort((a, b) => perCategory[a] - perCategory[b])
    .slice(0, limit);

  return (
    <Card className="p-6">
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
