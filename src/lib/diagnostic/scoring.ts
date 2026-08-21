import type {
  CategoryId,
  CategoryScore,
  DiagnosticResult,
  UserState,
} from "@/types";
import { CATEGORIES } from "@/lib/content/categories";
// Mastery only counts cards per category, so the planning index is enough —
// see meta.ts for why the full deck must not be imported here.
import { FLASHCARD_META } from "@/lib/content/meta";
import { forCode } from "@/lib/content/vehicle";
import { studyCodeOf } from "@/lib/billing/plans";
import { EXAM_FORMAT, SECTION_OF, type ExamSection } from "@/lib/constants";
import { MIN_ATTEMPTS_FOR_ABILITY } from "@/lib/learning/ability";
import { clamp, uid } from "@/lib/utils";

/**
 * Per-category weighting toward overall readiness. Signs and rules dominate the
 * real test, so they carry the most weight. Weights sum to 1.
 */
export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  signs: 0.22,
  rules: 0.22,
  controls: 0.1,
  intersections: 0.14,
  parking: 0.08,
  following_distance: 0.12,
  hazard_awareness: 0.12,
};

/** Baseline competence for a category with no signal yet (endowed-progress, never 0). */
const BASELINE = 18;

/**
 * Evidence weight behind the accuracy estimate, in pseudo-attempts.
 *
 * A raw rolling average treats one lucky answer as proven mastery: 1/1 read as
 * 100%, dragged the section binomial — and the predicted-pass number printed
 * beside it — to near-certainty on a sample of one. Shrinking observed accuracy
 * toward BASELINE is a Beta-binomial posterior mean; the strength is
 * calibrated against both ends of that trade-off:
 *
 *  - 1/1 must NOT read as mastery:        (1 + 2·0.18)/3  ≈ 45%, not 100%.
 *  - a perfect run must still be able to
 *    clear real thresholds when it is long
 *    enough to trust:                      70-for-70 across every category
 *                                          lands near 86% per category, which
 *                                          puts the section-aware pass
 *                                          probability around 70% — promoted,
 *                                          but nowhere near certain.
 *
 * Strength 4+ pins even long perfect runs below every promotion threshold;
 * strength 1 is barely distinguishable from no shrinkage. 2 is the value that
 * satisfies both.
 */
const PRIOR_STRENGTH = 2;

/** Total question attempts before the model considers itself measured at all. */
export const MIN_EVIDENCE_FOR_CONFIDENCE = 12;

export interface ReadinessBreakdown {
  readiness: number;
  passProbability: number;
  perCategory: Record<CategoryId, number>;
  /**
   * Answered question attempts behind each category's estimate. A category at
   * zero is displaying the baseline prior, not a measurement — surfaces and
   * rankings must treat the two differently.
   */
  perCategoryEvidence: Record<CategoryId, number>;
  /**
   * Conservative lower bound (≈80% one-sided) on each category's competence.
   * An untouched category floors near 0 — "could be anything" — while a
   * well-sampled 55% floors near 42. Ranking weakness by this floor stops
   * never-attempted categories from masquerading as the weakest.
   */
  perCategoryFloor: Record<CategoryId, number>;
  weakCategories: CategoryId[];
  strongCategories: CategoryId[];
  /**
   * False while the numbers rest on little more than the baseline — too few
   * attempts for any category reading to be trusted. Surfaces show an
   * "early estimate" qualifier when this is false rather than presenting the
   * same digits with unwarranted authority.
   */
  measured: boolean;
}

/**
 * P(at least `k` of `n` correct) when each question is independent with
 * probability `p`. Built up from the pmf term by term, so no factorial is ever
 * materialised — n is only 28, but the recurrence is simpler than the
 * alternative and can't overflow.
 */
function binomialAtLeast(n: number, k: number, p: number): number {
  if (k <= 0) return 1;
  if (k > n) return 0;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let pmf = Math.pow(1 - p, n); // P(X = 0)
  let cumulativeBelow = pmf;
  for (let i = 0; i < k - 1; i++) {
    pmf = (pmf * (n - i) * p) / ((i + 1) * (1 - p));
    cumulativeBelow += pmf;
  }
  return clamp(1 - cumulativeBelow, 0, 1);
}

/** Estimated 0–100 competence for an exam section, from its study categories. */
function sectionCompetence(
  perCategory: Record<CategoryId, number>,
  section: ExamSection,
): number {
  let weighted = 0;
  let weight = 0;
  for (const cat of CATEGORIES) {
    if (SECTION_OF[cat.id] !== section) continue;
    weighted += perCategory[cat.id] * CATEGORY_WEIGHTS[cat.id];
    weight += CATEGORY_WEIGHTS[cat.id];
  }
  return weight > 0 ? weighted / weight : BASELINE;
}

/**
 * Probability of passing the real paper, as a percentage.
 *
 * The K53 is passed only by clearing **every** section's own mark as well as
 * the total, so the honest model is the product of three section
 * probabilities — each a binomial over that section's real question count and
 * pass mark, with the learner's estimated accuracy as p.
 *
 * This replaced a logistic on the single weighted readiness score, which had no
 * concept of sections. That model told a learner who was perfect on controls
 * and rules but 68% on signs that they had a **94%** chance of passing —
 * printed directly above a panel explaining that the paper they had just sat
 * would have been a fail. Averages hide exactly the failure mode this exam is
 * built to catch.
 */
export function passProbabilityFromSections(perCategory: Record<CategoryId, number>): number {
  let p = 1;
  for (const section of Object.keys(EXAM_FORMAT.sections) as ExamSection[]) {
    const { questions, pass } = EXAM_FORMAT.sections[section];
    p *= binomialAtLeast(questions, pass, clamp(sectionCompetence(perCategory, section)) / 100);
  }
  return Math.round(clamp(p * 100));
}

/**
 * The section standing between this learner and a pass, if there is one.
 *
 * Readiness and predicted pass can look contradictory — 80% readiness beside a
 * 2% pass chance — and the reason is always a single section sitting under its
 * own mark. Naming it turns a confusing pair of numbers into one instruction.
 */
export function blockingSection(perCategory: Record<CategoryId, number>): ExamSection | null {
  let worst: { section: ExamSection; shortfall: number } | null = null;
  for (const section of Object.keys(EXAM_FORMAT.sections) as ExamSection[]) {
    const { questions, pass } = EXAM_FORMAT.sections[section];
    const required = (pass / questions) * 100;
    const shortfall = required - sectionCompetence(perCategory, section);
    if (shortfall > 0 && (!worst || shortfall > worst.shortfall)) {
      worst = { section, shortfall };
    }
  }
  return worst?.section ?? null;
}

/**
 * Score a single completed diagnostic from its per-question correctness.
 * Used at the moment the diagnostic finishes.
 */
export function scoreDiagnostic(
  responses: { categoryId: CategoryId; correct: boolean }[],
  now = new Date(),
): DiagnosticResult {
  const perCategory: Partial<Record<CategoryId, CategoryScore>> = {};
  for (const cat of CATEGORIES) {
    const subset = responses.filter((r) => r.categoryId === cat.id);
    if (subset.length === 0) continue;
    const correct = subset.filter((r) => r.correct).length;
    perCategory[cat.id] = {
      correct,
      total: subset.length,
      score: Math.round((correct / subset.length) * 100),
    };
  }

  let weightSum = 0;
  let weighted = 0;
  for (const cat of CATEGORIES) {
    const cs = perCategory[cat.id];
    if (!cs) continue;
    weighted += cs.score * CATEGORY_WEIGHTS[cat.id];
    weightSum += CATEGORY_WEIGHTS[cat.id];
  }
  const readiness = weightSum > 0 ? Math.round(weighted / weightSum) : BASELINE;

  // The section model needs every category, so categories this diagnostic
  // didn't reach fall back to the same baseline the live model uses. Reached
  // categories are shrunk toward that baseline by their sample size — a
  // category the sampler hit once shouldn't print 100%-confidence numbers
  // into the pass probability off a single question.
  const competence = {} as Record<CategoryId, number>;
  for (const cat of CATEGORIES) {
    const cs = perCategory[cat.id];
    if (!cs) {
      competence[cat.id] = BASELINE;
      continue;
    }
    const shrunk =
      (cs.correct + PRIOR_STRENGTH * (BASELINE / 100)) / (cs.total + PRIOR_STRENGTH);
    competence[cat.id] = clamp(Math.round(shrunk * 100));
  }

  const ranked = (Object.keys(perCategory) as CategoryId[]).sort(
    (a, b) => perCategory[a]!.score - perCategory[b]!.score,
  );
  const weakCategories = ranked.filter((c) => perCategory[c]!.score < 70).slice(0, 3);
  const strongCategories = [...ranked]
    .reverse()
    .filter((c) => perCategory[c]!.score >= 75)
    .slice(0, 2);

  const total = responses.length;
  const correct = responses.filter((r) => r.correct).length;

  return {
    id: uid("diag"),
    at: now.toISOString(),
    readiness,
    passProbability: passProbabilityFromSections(competence),
    total,
    correct,
    perCategory,
    weakCategories,
    strongCategories,
  };
}

/** Average flashcard mastery for a category, across cards the user has studied. */
function flashMasteryForCategory(state: UserState, categoryId: CategoryId): number | null {
  const cards = forCode(FLASHCARD_META, studyCodeOf(state)).filter(
    (f) => f.categoryId === categoryId,
  );
  const studied = cards
    .map((c) => state.cardStates[c.id])
    .filter((s): s is NonNullable<typeof s> => Boolean(s) && s.reps > 0);
  if (studied.length === 0) return null;
  const avg = studied.reduce((sum, s) => sum + s.mastery, 0) / studied.length;
  // Scale by coverage so studying more of the deck raises confidence.
  const coverage = Math.sqrt(studied.length / cards.length);
  return avg * coverage;
}

/**
 * The live readiness model that powers the dashboard. It blends diagnostic /
 * practice accuracy with flashcard mastery so the score visibly moves as the
 * user studies — the core retention loop.
 *
 * Every category also carries its evidence count and a conservative floor.
 * The shrinkage prior keeps small samples from reading as extremes, but it
 * cannot stop an untouched category from printing the baseline (18) with the
 * same visual authority as a well-measured one. The floor is what separates
 * them: no evidence floors near 0 ("could be anything"), real evidence at 55%
 * floors near 42 ("reliably mediocre"). Weakness ranking runs on that floor,
 * so study recommendations name proven weak spots before unexplored ones.
 */
export function computeReadiness(state: UserState): ReadinessBreakdown {
  const perCategory = {} as Record<CategoryId, number>;
  const perCategoryEvidence = {} as Record<CategoryId, number>;
  const perCategoryFloor = {} as Record<CategoryId, number>;

  for (const cat of CATEGORIES) {
    // Blanks (selectedIndex -1) are excluded: a timed mock records every slot
    // at submit, and running out of time is not evidence about what the
    // learner knows. The mock's own score still counts blanks as wrong — that
    // is what the real paper does — but they must not drag this estimate.
    const attempts = state.attempts.filter(
      (a) => a.categoryId === cat.id && a.selectedIndex >= 0,
    );
    const n = attempts.length;
    const acc =
      n === 0
        ? null
        : ((attempts.filter((a) => a.correct).length + PRIOR_STRENGTH * (BASELINE / 100)) /
            (n + PRIOR_STRENGTH)) *
          100;
    const flash = flashMasteryForCategory(state, cat.id);

    let competence: number;
    if (acc !== null && flash !== null) competence = 0.65 * acc + 0.35 * flash;
    else if (acc !== null) competence = acc;
    else if (flash !== null) competence = flash;
    else competence = BASELINE;

    perCategory[cat.id] = clamp(Math.round(competence));
    perCategoryEvidence[cat.id] = n;

    // One-sided ≈80% lower bound: mean − 1.28·sd, with the Beta posterior's
    // variance (prior strength counts in the denominator). Clamped at 0 —
    // "no idea" and "provably terrible" rank differently below.
    const mean = competence / 100;
    const sd = Math.sqrt((mean * (1 - mean)) / (n + PRIOR_STRENGTH + 1));
    perCategoryFloor[cat.id] = clamp(Math.round((mean - 1.28 * sd) * 100));
  }

  let weighted = 0;
  for (const cat of CATEGORIES) weighted += perCategory[cat.id] * CATEGORY_WEIGHTS[cat.id];
  const readiness = clamp(Math.round(weighted));

  // Weak categories: measured weakness first (most urgent at the front), then
  // unmeasured ones. Without the split, untouched categories sitting at the
  // baseline outrank a category the learner has actually failed — and the
  // daily plan sends them to drill something they have never even tried.
  const isWeak = (c: CategoryId) => perCategory[c] < 70;
  const byMean = (a: CategoryId, b: CategoryId) => perCategory[a] - perCategory[b];
  const hasEvidence = (c: CategoryId) => perCategoryEvidence[c] >= MIN_ATTEMPTS_FOR_ABILITY;
  const ranked = (Object.keys(perCategory) as CategoryId[]).filter(isWeak).sort(byMean);
  const weakCategories = [
    ...ranked.filter(hasEvidence),
    ...ranked.filter((c) => !hasEvidence(c)),
  ].slice(0, 3);

  // "Measured" needs real question evidence — a diagnostic alone (12–15
  // questions) just clears the bar; three taps in one category does not.
  const answered = state.attempts.filter((a) => a.selectedIndex >= 0).length;

  return {
    readiness,
    passProbability: passProbabilityFromSections(perCategory),
    perCategory,
    perCategoryEvidence,
    perCategoryFloor,
    weakCategories,
    strongCategories: [...(Object.keys(perCategory) as CategoryId[])]
      .reverse()
      .filter((c) => perCategory[c] >= 75)
      .slice(0, 3),
    measured: answered >= MIN_EVIDENCE_FOR_CONFIDENCE,
  };
}
