import type {
  CategoryId,
  Question,
  QuestionAttempt,
  Scenario,
  ScenarioAttempt,
  VehicleCode,
} from "@/types";
import { forCode } from "@/lib/content/vehicle";
import { CATEGORIES } from "@/lib/content/categories";
import { EXAM_FORMAT, SECTION_OF, type ExamSection } from "@/lib/constants";
import { shuffle } from "@/lib/utils";

/**
 * Reorder a question's answer options at random and remap the correct index,
 * so the correct answer is not always in the same slot. Call once when an
 * attempt is prepared (not on every render) so the layout stays stable while
 * the learner reads it.
 */
export function withShuffledOptions(q: Question): Question {
  const order = shuffle(q.options.map((_, i) => i));
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correctIndex: order.indexOf(q.correctIndex),
  };
}

/** When each item was last seen, from a list of attempts keyed by its own id field. */
function lastSeenBy<A extends { at: string }>(
  attempts: readonly A[],
  idOf: (a: A) => string,
): Map<string, number> {
  const lastSeen = new Map<string, number>();
  for (const a of attempts) {
    const t = Date.parse(a.at) || 0;
    const id = idOf(a);
    if (t > (lastSeen.get(id) ?? 0)) lastSeen.set(id, t);
  }
  return lastSeen;
}

/** Least-recently-seen first (unseen first), randomised within each tier. */
function byFreshness<T extends { id: string }>(pool: T[], lastSeen: Map<string, number>): T[] {
  // shuffle first so ties (e.g. all-unseen) are randomised; sort is stable in V8.
  return shuffle(pool).sort((a, b) => (lastSeen.get(a.id) ?? 0) - (lastSeen.get(b.id) ?? 0));
}

/**
 * Order a pool so the questions the learner has seen least recently come first
 * (unseen first, then oldest), with random order within each tier. This lets a
 * mode cycle through the whole bank before repeating anything.
 */
export function orderByFreshness(pool: Question[], attempts: QuestionAttempt[] = []): Question[] {
  return byFreshness(pool, lastSeenBy(attempts, (a) => a.questionId));
}

/**
 * The same rotation for scenarios, which record their attempts under
 * `scenarioId` rather than `questionId`.
 */
export function orderScenariosByFreshness(
  pool: Scenario[],
  attempts: ScenarioAttempt[] = [],
): Scenario[] {
  return byFreshness(pool, lastSeenBy(attempts, (a) => a.scenarioId));
}

/**
 * What a question is *about*, for the purpose of not asking it twice.
 *
 * Several questions can legitimately target the same road sign — one asks what
 * it means, another names it, a hand-written one poses a scenario around it.
 * Individually they are all fair; two of them in the same paper is what makes a
 * deep bank feel shallow, because the learner recognises the picture, not the
 * question. Items without a subject fall back to their own id, so they are
 * always distinct from each other.
 */
export function subjectOf(q: Question): string {
  return q.image ?? (q.sign ? `sign:${q.sign}` : `id:${q.id}`);
}

/**
 * Take `n` questions, preferring one per subject.
 *
 * Pass a shared `seen` set to dedupe across several calls. Papers are built
 * section by section, but a sign can be the subject of a signs question *and*
 * of a rules question about the intersection it governs — so deduping within
 * each section separately still lets the same sign appear twice in one paper.
 *
 * Falls back to the skipped items (still in freshness order) when the pool
 * cannot fill `n` distinct subjects — a mock exam must always be the full 64
 * questions, so a shorter paper is never the right trade.
 */
export function takeDistinctSubjects(
  ordered: Question[],
  n: number,
  seen: Set<string> = new Set(),
): Question[] {
  const picked: Question[] = [];
  const skipped: Question[] = [];
  for (const q of ordered) {
    if (picked.length === n) break;
    const key = subjectOf(q);
    if (seen.has(key)) {
      skipped.push(q);
      continue;
    }
    seen.add(key);
    picked.push(q);
  }
  if (picked.length < n) picked.push(...skipped.slice(0, n - picked.length));
  return picked;
}

/** Target question count per category for the 15-question diagnostic. */
const DIAGNOSTIC_PLAN: Record<CategoryId, number> = {
  signs: 4,
  rules: 3,
  controls: 2,
  intersections: 2,
  parking: 1,
  following_distance: 1,
  hazard_awareness: 2,
};

/**
 * Per-category counts for a diagnostic, tilted toward what the learner said
 * worries them (onboarding step 5): +1 question for each of the top two worry
 * categories, taken from the largest non-worry categories so the total stays
 * the same. Exported for unit tests.
 */
export function diagnosticPlanFor(worryCategories: CategoryId[] = []): Record<CategoryId, number> {
  const plan = { ...DIAGNOSTIC_PLAN };
  const worries = worryCategories.slice(0, 2).filter((c) => c in plan);
  for (const worry of worries) {
    // Donor: the non-worry category with the most questions and at least 2,
    // so no category drops to zero coverage.
    const donor = (Object.keys(plan) as CategoryId[])
      .filter((c) => !worries.includes(c) && plan[c] >= 2)
      .sort((a, b) => plan[b] - plan[a])[0];
    if (!donor) break;
    plan[donor] -= 1;
    plan[worry] += 1;
  }
  return plan;
}

/**
 * Sample a diagnostic covering every category, preferring fresh questions,
 * with shuffled order and shuffled options. If the learner told us what
 * worries them, those categories get extra weight.
 */
export function sampleDiagnostic(
  pool: Question[],
  attempts: QuestionAttempt[],
  code: VehicleCode,
  worryCategories: CategoryId[] = [],
): Question[] {
  const bank = forCode(pool, code);
  const plan = diagnosticPlanFor(worryCategories);
  const picked: Question[] = [];
  const seen = new Set<string>(); // one diagnostic, one subject list
  for (const cat of CATEGORIES) {
    const pool = orderByFreshness(bank.filter((q) => q.categoryId === cat.id), attempts);
    picked.push(...takeDistinctSubjects(pool, plan[cat.id] ?? 2, seen));
  }
  return shuffle(picked).map(withShuffledOptions);
}

/**
 * For self-declared beginners' very first session: easy questions first so the
 * opening minutes build confidence instead of bruising it. Stable within tiers.
 */
export function easyFirst(pool: Question[]): Question[] {
  return [...pool].sort((a, b) => a.difficulty - b.difficulty);
}

/**
 * Mini mock: a pressure check at the real test's pass ratio, weighted toward
 * the learner's weakest categories so it doubles as targeted revision.
 */
/** Seconds a mini mock allows per question — the real paper's pace, tightened. */
const MINI_SECONDS_PER_QUESTION = 48;
/** The real test's pass ratio (51/64), which every mini length inherits. */
const MINI_PASS_RATIO = 0.8;

/**
 * Mini lengths, framed by what the learner is trying to do rather than by
 * question count. Nobody sits down wanting "10 questions"; they want to know
 * whether they still remember it, or to feel the clock.
 */
export const MINI_MOCK_LENGTHS = [
  { total: 5, label: "Quick check", blurb: "Am I still sharp?" },
  { total: 10, label: "Focused drill", blurb: "A proper go at my weak areas." },
  { total: 15, label: "Pressure test", blurb: "The standard mini, timed." },
  { total: 20, label: "Deep run", blurb: "Closest thing to the real paper." },
] as const;

export function miniMockConfig(total: number) {
  return {
    total,
    passMark: Math.ceil(total * MINI_PASS_RATIO),
    seconds: total * MINI_SECONDS_PER_QUESTION,
  };
}

/** Default mini — kept as a named export because several surfaces quote it. */
export const MINI_MOCK = miniMockConfig(15);

export function sampleMiniMock(
  pool: Question[],
  attempts: QuestionAttempt[],
  code: VehicleCode,
  weakCategories: CategoryId[] = [],
  total: number = MINI_MOCK.total,
): Question[] {
  const bank = forCode(pool, code);
  const weakSet = new Set(weakCategories.slice(0, 3));
  const weakPool = bank.filter((q) => weakSet.has(q.categoryId));
  const restPool = bank.filter((q) => !weakSet.has(q.categoryId));
  // ~60% weak-category questions, the rest spread across everything else —
  // scaled to the chosen length rather than fixed, so a 5-question check is
  // still mostly weak-area and a 20-question run isn't overwhelmingly so.
  const targetWeak =
    weakSet.size > 0 ? Math.min(Math.round(total * 0.6), weakPool.length) : 0;
  const seen = new Set<string>();
  const picked = takeDistinctSubjects(orderByFreshness(weakPool, attempts), targetWeak, seen);
  picked.push(
    ...takeDistinctSubjects(orderByFreshness(restPool, attempts), total - picked.length, seen),
  );
  return shuffle(picked).map(withShuffledOptions);
}

/**
 * The category→section map now lives in constants.ts, beside the exam format it
 * belongs to, because the readiness model needs it as well as the samplers.
 * Re-exported here so every existing caller keeps importing it from the sampler.
 */
export { SECTION_OF, type ExamSection } from "@/lib/constants";

/**
 * Did this full mock paper actually pass?
 *
 * The real K53 requires the overall mark *and* each section's own mark — a
 * 56/64 with 22/28 on signs is a fail at the DLTC. Scoring on the total alone
 * told learners "You passed 🎉" for papers they would have failed, which is the
 * most damaging thing a readiness product can get wrong: they book the test on
 * it.
 *
 * Lives here rather than in the exam component so the rule has one definition
 * and the tests exercise the same code the exam screen runs.
 */
export function fullMockPassed(perSectionCorrect: Record<ExamSection, number>): boolean {
  const sections = Object.keys(EXAM_FORMAT.sections) as ExamSection[];
  const total = sections.reduce((n, s) => n + perSectionCorrect[s], 0);
  return (
    total >= EXAM_FORMAT.passMark &&
    sections.every((s) => perSectionCorrect[s] >= EXAM_FORMAT.sections[s].pass)
  );
}

/**
 * Section drills: one exam section on its own, at the real section size, pass
 * mark and a proportional share of the real 60-minute clock. Passing every
 * section individually is exactly what the real test requires, so drilling a
 * single section against its true pass mark is the highest-fidelity practice
 * short of a full mock.
 */
export const SECTION_DRILL: Record<
  ExamSection,
  { total: number; passMark: number; seconds: number }
> = Object.fromEntries(
  (Object.keys(EXAM_FORMAT.sections) as ExamSection[]).map((s) => [
    s,
    {
      total: EXAM_FORMAT.sections[s].questions,
      passMark: EXAM_FORMAT.sections[s].pass,
      // The real paper gives 60 min for 64 questions — same pace per question.
      seconds:
        Math.round((EXAM_FORMAT.sections[s].questions / EXAM_FORMAT.totalQuestions) * 3600 / 30) *
        30,
    },
  ]),
) as Record<ExamSection, { total: number; passMark: number; seconds: number }>;

export function sampleSectionDrill(
  pool: Question[],
  section: ExamSection,
  attempts: QuestionAttempt[],
  code: VehicleCode,
): Question[] {
  const sectionPool = forCode(pool, code).filter((q) => SECTION_OF[q.categoryId] === section);
  return shuffle(
    takeDistinctSubjects(orderByFreshness(sectionPool, attempts), SECTION_DRILL[section].total),
  ).map(withShuffledOptions);
}

/**
 * Build a full mock exam in the official format: 8 controls, 28 signs and
 * 28 rules questions (64 total). Each section is filled with unique questions,
 * preferring ones the learner has seen least recently; the order is shuffled
 * and every question's options are shuffled.
 */
export function sampleMockExam(
  pool: Question[],
  attempts: QuestionAttempt[],
  code: VehicleCode,
): Question[] {
  const bySection: Record<ExamSection, Question[]> = {
    controls: [],
    signs: [],
    rules: [],
  };
  for (const q of forCode(pool, code)) bySection[SECTION_OF[q.categoryId]].push(q);

  const out: Question[] = [];
  const seen = new Set<string>(); // shared across sections — one paper, one subject list
  for (const section of Object.keys(EXAM_FORMAT.sections) as ExamSection[]) {
    const need = EXAM_FORMAT.sections[section].questions;
    out.push(...takeDistinctSubjects(orderByFreshness(bySection[section], attempts), need, seen));
  }
  return shuffle(out).map(withShuffledOptions);
}
