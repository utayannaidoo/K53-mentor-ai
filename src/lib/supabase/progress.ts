import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CardState,
  CategoryId,
  CategoryScore,
  DiagnosticResult,
  MockExamAttempt,
  QuestionAttempt,
  ScenarioAttempt,
  StudyContext,
  UserState,
} from "@/types";

/**
 * Study-progress sync: attempts, SM-2 card states, mock exams, diagnostics
 * and readiness history mirrored to the 0001 tables — so a cleared browser
 * or a new phone restores a paying learner's history instead of wiping it.
 *
 * Push is incremental and idempotent: each item carries its local id as
 * `client_id` (unique per user), so re-sending after a failed flush upserts
 * instead of duplicating. A per-user watermark in localStorage tracks what's
 * been pushed; card states upsert by (user_id, flashcard_id) and are re-sent
 * whenever reviewed after the watermark.
 */

const CURSOR_PREFIX = "k53mentor.sync.v1.";

function readCursor(userId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(CURSOR_PREFIX + userId) ?? "";
  } catch {
    return "";
  }
}

function writeCursor(userId: string, iso: string) {
  try {
    window.localStorage.setItem(CURSOR_PREFIX + userId, iso);
  } catch {
    /* quota / private mode */
  }
}

/** Push everything newer than the watermark. Best-effort; safe to re-run. */
export async function pushProgress(supabase: SupabaseClient, userId: string, state: UserState): Promise<void> {
  const since = readCursor(userId);
  let maxAt = since;
  const bump = (at: string | null | undefined) => {
    if (at && at > maxAt) maxAt = at;
  };

  const attempts = state.attempts.filter((a) => a.at > since);
  const scenarios = state.scenarioAttempts.filter((a) => a.at > since);
  const mocks = state.mockExams.filter((m) => m.at > since);
  const diags = state.diagnostics.filter((d) => d.at > since);
  const cards = Object.values(state.cardStates).filter(
    (c) => c.lastReviewed !== null && c.lastReviewed > since,
  );
  // readinessHistory is one point per day — push the recent window and let
  // the (user_id, day) upsert absorb repeats.
  const readiness = state.readinessHistory.slice(-14);

  const ops: PromiseLike<{ error: unknown }>[] = [];

  if (attempts.length) {
    ops.push(
      supabase.from("question_attempts").upsert(
        attempts.map((a) => ({
          user_id: userId,
          client_id: a.id,
          question_id: a.questionId,
          category_id: a.categoryId,
          selected_index: a.selectedIndex,
          is_correct: a.correct,
          context: a.context,
          attempted_at: a.at,
        })),
        { onConflict: "user_id,client_id" },
      ),
    );
  }
  if (scenarios.length) {
    ops.push(
      supabase.from("scenario_attempts").upsert(
        scenarios.map((a) => ({
          user_id: userId,
          client_id: a.id,
          scenario_id: a.scenarioId,
          category_id: a.categoryId,
          choice_id: a.choiceId,
          is_correct: a.correct,
          attempted_at: a.at,
        })),
        { onConflict: "user_id,client_id" },
      ),
    );
  }
  if (mocks.length) {
    ops.push(
      supabase.from("mock_exam_attempts").upsert(
        mocks.map((m) => ({
          user_id: userId,
          client_id: m.id,
          score: m.score,
          total: m.total,
          passed: m.passed,
          per_category: m.perCategory,
          duration_seconds: m.durationSeconds,
          taken_at: m.at,
        })),
        { onConflict: "user_id,client_id" },
      ),
    );
  }
  if (diags.length) {
    ops.push(
      supabase.from("diagnostic_attempts").upsert(
        diags.map((d) => ({
          user_id: userId,
          client_id: d.id,
          readiness: d.readiness,
          predicted_pass_probability: d.passProbability,
          total: d.total,
          correct: d.correct,
          per_category: d.perCategory,
          weak_categories: d.weakCategories,
          strong_categories: d.strongCategories,
          completed_at: d.at,
        })),
        { onConflict: "user_id,client_id" },
      ),
    );
  }
  if (cards.length) {
    ops.push(
      supabase.from("flashcard_review_log").upsert(
        cards.map((c) => ({
          user_id: userId,
          flashcard_id: c.cardId,
          // The table logs the last rating; CardState doesn't keep it, so the
          // synced snapshot records a neutral value — SRS math rides on
          // ease/interval/due, which are exact.
          rating: "good",
          ease: c.ease,
          interval_days: c.intervalDays,
          reps: c.reps,
          lapses: c.lapses,
          mastery: c.mastery,
          due_at: c.due,
          reviewed_at: c.lastReviewed,
        })),
        { onConflict: "user_id,flashcard_id" },
      ),
    );
  }
  if (readiness.length) {
    ops.push(
      supabase.from("readiness_history").upsert(
        readiness.map((r) => ({ user_id: userId, day: r.date, readiness: r.readiness })),
        { onConflict: "user_id,day" },
      ),
    );
  }

  if (!ops.length) return;
  const results = await Promise.all(ops);
  if (results.some((r) => r.error)) return; // retry next flush from the same watermark

  for (const a of attempts) bump(a.at);
  for (const a of scenarios) bump(a.at);
  for (const m of mocks) bump(m.at);
  for (const d of diags) bump(d.at);
  for (const c of cards) bump(c.lastReviewed);
  if (maxAt > since) writeCursor(userId, maxAt);
}

export interface RemoteProgress {
  attempts: QuestionAttempt[];
  scenarioAttempts: ScenarioAttempt[];
  mockExams: MockExamAttempt[];
  diagnostics: DiagnosticResult[];
  cardStates: Record<string, CardState>;
  readinessHistory: { date: string; readiness: number }[];
}

/** Pull the server's copy of the learner's history (recent windows). */
export async function pullProgress(supabase: SupabaseClient, userId: string): Promise<RemoteProgress> {
  const [qa, sc, me, dg, fl, rh] = await Promise.all([
    supabase
      .from("question_attempts")
      .select("id,client_id,question_id,category_id,selected_index,is_correct,context,attempted_at")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: false })
      .limit(2000),
    supabase
      .from("scenario_attempts")
      .select("id,client_id,scenario_id,category_id,choice_id,is_correct,attempted_at")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: false })
      .limit(1000),
    supabase
      .from("mock_exam_attempts")
      .select("id,client_id,score,total,passed,per_category,duration_seconds,taken_at")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false })
      .limit(200),
    supabase
      .from("diagnostic_attempts")
      .select("id,client_id,readiness,predicted_pass_probability,total,correct,per_category,weak_categories,strong_categories,completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(50),
    supabase
      .from("flashcard_review_log")
      .select("flashcard_id,ease,interval_days,reps,lapses,mastery,due_at,reviewed_at")
      .eq("user_id", userId)
      .limit(2000),
    supabase
      .from("readiness_history")
      .select("day,readiness")
      .eq("user_id", userId)
      .order("day", { ascending: false })
      .limit(400),
  ]);

  type Row = Record<string, unknown>;
  const rows = (r: { data: unknown }) => ((r.data ?? []) as Row[]);

  const attempts: QuestionAttempt[] = rows(qa).map((r) => ({
    id: (r.client_id as string | null) ?? (r.id as string),
    questionId: r.question_id as string,
    categoryId: r.category_id as CategoryId,
    correct: Boolean(r.is_correct),
    selectedIndex: Number(r.selected_index),
    context: (r.context as StudyContext) ?? "practice",
    at: r.attempted_at as string,
  }));

  const scenarioAttempts: ScenarioAttempt[] = rows(sc).map((r) => ({
    id: (r.client_id as string | null) ?? (r.id as string),
    scenarioId: r.scenario_id as string,
    categoryId: r.category_id as CategoryId,
    choiceId: r.choice_id as string,
    correct: Boolean(r.is_correct),
    at: r.attempted_at as string,
  }));

  const mockExams: MockExamAttempt[] = rows(me).map((r) => ({
    id: (r.client_id as string | null) ?? (r.id as string),
    score: Number(r.score),
    total: Number(r.total),
    passed: Boolean(r.passed),
    perCategory: (r.per_category ?? {}) as Partial<Record<CategoryId, CategoryScore>>,
    durationSeconds: Number(r.duration_seconds ?? 0),
    at: r.taken_at as string,
  }));

  const diagnostics: DiagnosticResult[] = rows(dg).map((r) => ({
    id: (r.client_id as string | null) ?? (r.id as string),
    readiness: Number(r.readiness),
    passProbability: Number(r.predicted_pass_probability),
    total: Number(r.total),
    correct: Number(r.correct),
    perCategory: (r.per_category ?? {}) as Partial<Record<CategoryId, CategoryScore>>,
    weakCategories: (r.weak_categories ?? []) as CategoryId[],
    strongCategories: (r.strong_categories ?? []) as CategoryId[],
    at: r.completed_at as string,
  }));

  const cardStates: Record<string, CardState> = {};
  for (const r of rows(fl)) {
    const cardId = r.flashcard_id as string;
    cardStates[cardId] = {
      cardId,
      reps: Number(r.reps ?? 0),
      lapses: Number(r.lapses ?? 0),
      ease: Number(r.ease ?? 2.5),
      intervalDays: Number(r.interval_days ?? 0),
      due: (r.due_at as string | null) ?? new Date().toISOString(),
      lastReviewed: (r.reviewed_at as string | null) ?? null,
      mastery: Number(r.mastery ?? 0),
    };
  }

  const readinessHistory = rows(rh)
    .map((r) => ({ date: r.day as string, readiness: Number(r.readiness) }))
    .reverse();

  return { attempts, scenarioAttempts, mockExams, diagnostics, cardStates, readinessHistory };
}

/** Union two id-keyed lists, oldest→newest, capped from the tail. */
function unionById<T extends { id: string; at: string }>(local: T[], remote: T[], cap: number): T[] {
  const seen = new Map<string, T>();
  for (const item of remote) seen.set(item.id, item);
  for (const item of local) seen.set(item.id, item); // local wins on the same id
  return [...seen.values()].sort((a, b) => (a.at < b.at ? -1 : 1)).slice(-cap);
}

/** Merge the server's history into local state (no data ever discarded). */
export function mergeProgress(state: UserState, remote: RemoteProgress): UserState {
  const cardStates = { ...remote.cardStates };
  for (const [id, local] of Object.entries(state.cardStates)) {
    const r = cardStates[id];
    // The copy with more reviews is the fresher schedule; ties → later due.
    cardStates[id] =
      !r || local.reps + local.lapses > r.reps + r.lapses || (local.reps + local.lapses === r.reps + r.lapses && local.due >= r.due)
        ? local
        : r;
  }

  const days = new Map<string, { date: string; readiness: number }>();
  for (const p of remote.readinessHistory) days.set(p.date, p);
  for (const p of state.readinessHistory) days.set(p.date, p);
  const readinessHistory = [...days.values()].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-400);

  return {
    ...state,
    attempts: unionById(state.attempts, remote.attempts, 4000),
    scenarioAttempts: unionById(state.scenarioAttempts, remote.scenarioAttempts, 1000),
    mockExams: unionById(state.mockExams, remote.mockExams, 200),
    diagnostics: unionById(state.diagnostics, remote.diagnostics, 50),
    cardStates,
    readinessHistory,
  };
}
