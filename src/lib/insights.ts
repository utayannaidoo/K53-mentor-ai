import type { CategoryId, QuestionAttempt } from "@/types";

/**
 * Real study-pattern insights computed from attempt history (these replace
 * the placeholder values the advanced-analytics card used to hardcode).
 * Both return null until there's enough data to say something honest.
 */

const TIME_BUCKETS = [
  { label: "Mornings", from: 5, to: 12 },
  { label: "Afternoons", from: 12, to: 17 },
  { label: "Evenings", from: 17, to: 22 },
  { label: "Late nights", from: 22, to: 5 }, // wraps midnight
] as const;

/** The time of day this learner answers most accurately (min. 20 attempts, 8 per bucket). */
export function bestStudyTime(
  attempts: QuestionAttempt[],
): { label: string; accuracy: number } | null {
  if (attempts.length < 20) return null;
  const stats = TIME_BUCKETS.map((bucket) => ({ bucket, total: 0, correct: 0 }));
  for (const a of attempts) {
    const h = new Date(a.at).getHours();
    const s = stats.find(({ bucket }) =>
      bucket.from < bucket.to ? h >= bucket.from && h < bucket.to : h >= bucket.from || h < bucket.to,
    );
    if (!s) continue;
    s.total += 1;
    if (a.correct) s.correct += 1;
  }
  const eligible = stats.filter((s) => s.total >= 8);
  if (eligible.length === 0) return null;
  const best = eligible.reduce((m, s) => (s.correct / s.total > m.correct / m.total ? s : m));
  return { label: best.bucket.label, accuracy: Math.round((best.correct / best.total) * 100) };
}

/**
 * The category with the biggest accuracy gain, comparing each category's
 * earlier half of attempts against its later half (min. 12 attempts).
 */
export function mostImproved(
  attempts: QuestionAttempt[],
): { categoryId: CategoryId; delta: number } | null {
  const byCat = new Map<CategoryId, QuestionAttempt[]>();
  for (const a of attempts) {
    const list = byCat.get(a.categoryId) ?? [];
    list.push(a);
    byCat.set(a.categoryId, list);
  }

  const accuracy = (arr: QuestionAttempt[]) =>
    arr.length ? arr.filter((a) => a.correct).length / arr.length : 0;

  let best: { categoryId: CategoryId; delta: number } | null = null;
  for (const [categoryId, list] of byCat) {
    if (list.length < 12) continue;
    const sorted = [...list].sort((x, y) => x.at.localeCompare(y.at));
    const mid = Math.floor(sorted.length / 2);
    const delta = Math.round((accuracy(sorted.slice(mid)) - accuracy(sorted.slice(0, mid))) * 100);
    if (delta > 0 && (best === null || delta > best.delta)) best = { categoryId, delta };
  }
  return best;
}
