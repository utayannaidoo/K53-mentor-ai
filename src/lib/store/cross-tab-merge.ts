import type { DailyUsage, Streak, TutorThread, UserState } from "@/types";
import { KEEP } from "@/lib/store/local-store";
import { mergeProgress } from "@/lib/supabase/progress";

/**
 * Merge another tab's committed store blob into this tab's state.
 *
 * Cross-tab adoption used to be a whole-blob replace: any mutation this tab
 * had made but not yet flushed (the save is debounced by 250ms) was silently
 * discarded the moment the other tab wrote. With two tabs of one account open
 * — a phone and a desktop, or just two windows — that lost answers, CP and
 * streak days in a window users can genuinely hit.
 *
 * There are no per-field timestamps to order two blobs, so every field merges
 * under its own monotonicity rule instead:
 *
 *  - progress collections (attempts, mocks, card states, sessions…) union by
 *    id via the same mergeProgress account hydration uses — nothing on either
 *    side can be lost;
 *  - counters and high-water marks (cp, rank, achievements, daily usage,
 *    streak length) take the maximum;
 *  - identity/profile/scalar fields take the INCOMING writer's copy — both
 *    tabs are the same signed-in learner, so those agree anyway;
 *  - celebration queues (pendingRankUp/pendingAchievements) stay whichever
 *    exists so an unseen toast survives the merge.
 */
export function mergeAdoptedTabState(local: UserState, incoming: UserState): UserState {
  // Progress unions lose nothing from either side (local wins id collisions).
  // Only the seven collection fields are taken from this result — spreading
  // the whole object here would re-apply every LOCAL scalar over the
  // incoming writer's copy, silently reverting renames and tier changes.
  const merged = mergeProgress(local, {
    attempts: incoming.attempts ?? [],
    scenarioAttempts: incoming.scenarioAttempts ?? [],
    mockExams: incoming.mockExams ?? [],
    diagnostics: incoming.diagnostics ?? [],
    cardStates: incoming.cardStates ?? {},
    sessions: incoming.sessions ?? [],
    readinessHistory: incoming.readinessHistory ?? [],
  });

  return {
    // The incoming tab is the writer: identity/profile/tier/scalars start
    // from ITS copy…
    ...incoming,
    // …then only the unioned collections are laid on top.
    attempts: merged.attempts,
    scenarioAttempts: merged.scenarioAttempts,
    mockExams: merged.mockExams,
    diagnostics: merged.diagnostics,
    cardStates: merged.cardStates,
    sessions: merged.sessions,
    readinessHistory: merged.readinessHistory,

    cp: Math.max(local.cp ?? 0, incoming.cp ?? 0),
    rankAchieved: Math.max(local.rankAchieved ?? 0, incoming.rankAchieved ?? 0),
    achievements: maxPerKey(local.achievements, incoming.achievements),
    dailyUsage: mergeDailyUsage(local.dailyUsage, incoming.dailyUsage),
    streak: healthierStreak(local.streak, incoming.streak),

    driverProgress: mergeDriverProgress(local.driverProgress, incoming.driverProgress),
    tutorThreads: mergeThreads(local.tutorThreads, incoming.tutorThreads),

    guidedDone: Boolean(local.guidedDone || incoming.guidedDone),
    planBonusDate: laterDate(local.planBonusDate, incoming.planBonusDate),

    pendingRankUp: local.pendingRankUp ?? incoming.pendingRankUp,
    pendingAchievements: mergePendingAchievements(
      local.pendingAchievements,
      incoming.pendingAchievements,
    ),
    pendingComeback: local.pendingComeback ?? incoming.pendingComeback,

    licence: definedWins(local.licence, incoming.licence),
    licenceDeferredOn: definedWins(local.licenceDeferredOn, incoming.licenceDeferredOn),
  };
}

function maxPerKey(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? v, v);
  return out;
}

/** Usage counters only ever rise within a day; per-key/per-counter max. */
function mergeDailyUsage(
  a: Record<string, DailyUsage>,
  b: Record<string, DailyUsage>,
): Record<string, DailyUsage> {
  const out: Record<string, DailyUsage> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[key];
    const y = b[key];
    if (!x) out[key] = y;
    else if (!y) out[key] = x;
    else
      out[key] = {
        date: x.date >= y.date ? x.date : y.date,
        flashcards: Math.max(x.flashcards, y.flashcards),
        questions: Math.max(x.questions, y.questions),
        tutor: Math.max(x.tutor, y.tutor),
        scenarios: Math.max(x.scenarios, y.scenarios),
      };
  }
  return out;
}

/**
 * The longer current run wins; ties break toward fresher study date. A run
 * RESTARTING in one tab (current drops to 1) while the other still shows the
 * old run is the one case where max is wrong — but resolveStreak() re-runs at
 * open and touchStreak() on the next action, so a stale longer value
 * self-corrects against the real attempt log, while picking the shorter could
 * erase a run that is actually alive.
 *
 * `longest` is an all-time high-water mark regardless of which run is alive,
 * so it takes the max of both sides explicitly — picking one object's whole
 * streak let the record regress when the shorter-current side held it.
 */
function healthierStreak(a: Streak, b: Streak): Streak {
  const chosen =
    (b.current ?? 0) !== (a.current ?? 0)
      ? (b.current ?? 0) > (a.current ?? 0)
        ? b
        : a
      : (b.longest ?? 0) !== (a.longest ?? 0)
        ? (b.longest ?? 0) > (a.longest ?? 0)
          ? b
          : a
        : !a.lastStudyDate
          ? b
          : !b.lastStudyDate
            ? a
            : b.lastStudyDate > a.lastStudyDate
              ? b
              : a;
  return { ...chosen, longest: Math.max(a.longest ?? 0, b.longest ?? 0) };
}

function mergeDriverProgress(
  a: Record<string, number[]>,
  b: Record<string, number[]>,
): Record<string, number[]> {
  const out: Record<string, number[]> = { ...a };
  for (const [moduleId, steps] of Object.entries(b)) {
    out[moduleId] = [...new Set([...(out[moduleId] ?? []), ...steps])].sort((x, y) => x - y);
  }
  return out;
}

function mergeThreads(a: TutorThread[], b: TutorThread[]): TutorThread[] {
  const byId = new Map<string, TutorThread>();
  for (const t of [...a, ...b]) {
    const existing = byId.get(t.id);
    if (!existing) {
      byId.set(t.id, t);
      continue;
    }
    // Union messages by id, oldest first; thread meta comes from whichever
    // copy carries more conversation.
    const messages = [...existing.messages, ...t.messages];
    const seen = new Set<string>();
    const unique = messages.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
    unique.sort((x, y) => x.createdAt.localeCompare(y.createdAt));
    const richer = t.messages.length > existing.messages.length ? t : existing;
    byId.set(t.id, {
      ...richer,
      updatedAt: [richer.updatedAt, existing.updatedAt, t.updatedAt]
        .sort()
        .at(-1) as string,
      messages: unique.slice(-KEEP.tutorMessagesPerThread),
    });
  }
  // Newest thread first, matching how the list renders and the store saves.
  return [...byId.values()]
    .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt))
    .slice(0, KEEP.tutorThreads);
}

function laterDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function mergePendingAchievements(
  a: { id: string; tier: number }[],
  b: { id: string; tier: number }[],
): { id: string; tier: number }[] {
  const byId = new Map<string, { id: string; tier: number }>();
  for (const p of [...a, ...b]) {
    byId.set(p.id, { id: p.id, tier: Math.max(byId.get(p.id)?.tier ?? p.tier, p.tier) });
  }
  return [...byId.values()];
}

/** Per-key object merge where a present value beats an absent one. */
function definedWins<T extends object>(a: T, b: T): T {
  return { ...b, ...Object.fromEntries(Object.entries(a).filter(([, v]) => v != null)) } as T;
}
