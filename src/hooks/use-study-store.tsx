"use client";

import * as React from "react";
import type {
  DiagnosticResult,
  MockExamAttempt,
  OnboardingData,
  Profile,
  ScenarioAttempt,
  SessionType,
  SrsRating,
  StudyContext,
  SubscriptionTier,
  TutorMessage,
  TutorThread,
  UserState,
  CategoryId,
} from "@/types";
import {
  STORAGE_KEY,
  defaultUserState,
  getTodayUsage,
  loadState,
  saveState,
  todayKey,
  touchStreak,
} from "@/lib/store/local-store";
import { initialCardState, scheduleCard } from "@/lib/srs/sm2";
import { computeReadiness, type ReadinessBreakdown } from "@/lib/diagnostic/scoring";
import { dailyCap, type CapKey } from "@/lib/billing/plans";
import { trialExhausted } from "@/lib/billing/trial";
import { countDueFlashcards, generateTodayPlan, isTaskDone } from "@/lib/plan";
import {
  computeRankIndex,
  flashcardCp,
  isFirstCorrect,
  questionCp,
  DIAGNOSTIC_CP,
  MOCK_COMPLETION_CP,
  MOCK_PASS_BONUS_CP,
  PLAN_COMPLETE_CP,
  SCENARIO_CP,
  LICENCE_RANK_INDEX,
} from "@/lib/engagement";
import { achievementInputs, evaluateAchievements } from "@/lib/achievements";
import { uid } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { loadAccount, saveAccount } from "@/lib/supabase/account";
import { pullProgress, pushProgress } from "@/lib/supabase/progress";
import { hydrateAccountState, hydrateSessionOnly } from "@/lib/store/account-hydrate";
import { shouldClearCachedProfile } from "@/lib/auth/session-absent";
import { persistOnboarding } from "@/lib/store/persist-onboarding";

type UsageKind = "flashcards" | "questions" | "tutor" | "scenarios";

interface StudyStore {
  ready: boolean;
  /**
   * True once the signed-in user's server account + progress have been folded
   * into local state (immediately true in demo mode / signed-out). Post-login
   * routing MUST wait for this — before it flips, hasOnboarded/hasDiagnostic
   * reflect an empty local store, not the account.
   */
  accountHydrated: boolean;
  state: UserState;
  isAuthed: boolean;
  hasOnboarded: boolean;
  hasDiagnostic: boolean;
  readiness: ReadinessBreakdown;

  signInLocal: (name: string, email: string) => void;
  signOut: () => void;
  setTier: (tier: SubscriptionTier) => void;
  /**
   * Re-pull the account rows (tier, profile, streak) from Supabase. Returns
   * the freshly loaded tier, or null in demo mode / signed-out. Used after a
   * Paystack redirect so the webhook-written tier appears without a reload.
   */
  refreshAccount: () => Promise<SubscriptionTier | null>;
  completeOnboarding: (data: Omit<OnboardingData, "completedAt">) => void;
  /**
   * Save onboarding answers and resolve only once the server has them.
   *
   * The background sync is debounced 800ms, which is right for study progress
   * (constant, replaceable) but wrong for a profile edit: it is a deliberate
   * change the user watches, and any navigation inside that window cancels the
   * pending write via the effect's cleanup. The profile editor reloaded the
   * page 600ms after saving, so the licence code never reached
   * `profiles.vehicle_code` — and hydration then restored the server's old
   * value, silently reverting the change. Rejects if the write fails, so the
   * caller can say so rather than claim a save that did not happen.
   */
  saveOnboarding: (data: OnboardingData) => Promise<void>;

  recordDiagnostic: (result: DiagnosticResult) => void;
  reviewCard: (cardId: string, rating: SrsRating) => void;
  recordQuestionAttempt: (a: {
    questionId: string;
    categoryId: CategoryId;
    correct: boolean;
    selectedIndex: number;
    context?: StudyContext;
    /** Thinking time, render to tap. Absent where a surface doesn't measure it. */
    ms?: number;
  }) => void;
  recordScenarioAttempt: (a: Omit<ScenarioAttempt, "id" | "at">) => void;
  recordMockExam: (
    m: Omit<MockExamAttempt, "id" | "at">,
    responses?: {
      questionId: string;
      categoryId: CategoryId;
      correct: boolean;
      selectedIndex: number;
    }[],
  ) => void;
  recordSession: (type: SessionType, durationSeconds: number) => void;
  toggleDriverStep: (moduleId: string, stepN: number) => void;

  createTutorThread: (t: {
    title: string;
    contextLabel?: string | null;
    contextQuestionId?: string | null;
  }) => string;
  appendTutorMessage: (threadId: string, m: Omit<TutorMessage, "id" | "createdAt">) => void;

  /** Mark the post-signup guided first session as completed/skipped. */
  completeGuided: () => void;
  bumpUsage: (kind: UsageKind, by?: number) => void;
  usageFor: (kind: UsageKind) => { used: number; cap: number; allowed: boolean };
  acknowledgeRankUp: () => void;
  /** Clears the oldest queued achievement unlock — one toast at a time. */
  acknowledgeAchievement: () => void;
  dismissComeback: () => void;
  resetProgress: () => void;
}

/**
 * The parts of the store that change with state, as opposed to the mutators.
 * Everything else on StudyStore is an action whose identity can stay stable.
 */
type StudyValues =
  | "ready"
  | "accountHydrated"
  | "state"
  | "isAuthed"
  | "hasOnboarded"
  | "hasDiagnostic"
  | "readiness"
  | "usageFor";

type StudyActions = Omit<StudyStore, StudyValues>;

const StudyContextValue = React.createContext<StudyStore | null>(null);

const CAP_KEY: Record<UsageKind, CapKey | null> = {
  flashcards: "flashcardsPerDay",
  questions: "questionsPerDay",
  tutor: "tutorPerDay",
  scenarios: null, // gated by feature flag, not a daily cap
};

/**
 * Shared by all study actions: touch the streak, snapshot today's readiness,
 * grant the once-a-day plan-complete CP bonus, and promote the Driver Rank
 * (monotonic — queued as pendingRankUp for the celebration toast).
 */
function applyStudyEffects(state: UserState, now = new Date()): UserState {
  const streak = touchStreak(state.streak, now);
  let s: UserState = { ...state, streak };
  const breakdown = computeReadiness(s);
  const date = todayKey(now);

  if (s.planBonusDate !== date) {
    // A due mock retest joins the plan but never gates the daily bonus — a
    // 60-minute exam shouldn't hold the everyday +15 CP hostage.
    const tasks = generateTodayPlan(s, breakdown, now).filter((t) => t.type !== "mock");
    if (tasks.every((t) => isTaskDone(t, s, now))) {
      s = { ...s, cp: s.cp + PLAN_COMPLETE_CP, planBonusDate: date };
    }
  }

  const rankIndex = computeRankIndex({
    cp: s.cp,
    readiness: breakdown.readiness,
    hasPassedMock: s.mockExams.some((m) => m.passed && !m.mini && !m.drill),
  });
  if (rankIndex > s.rankAchieved) {
    s = { ...s, rankAchieved: rankIndex, pendingRankUp: rankIndex };
  }

  // Achievements ride alongside the rank on every study action, for the same
  // reason: both are high-water marks, and the moment to notice one is the
  // moment the work that earned it landed.
  const { next: achievements, newly } = evaluateAchievements(
    achievementInputs(s, breakdown.perCategory, s.rankAchieved >= LICENCE_RANK_INDEX),
    s.achievements,
  );
  if (newly.length > 0) {
    s = { ...s, achievements, pendingAchievements: [...s.pendingAchievements, ...newly] };
  }

  const history = s.readinessHistory.filter((h) => h.date !== date);
  history.push({ date, readiness: breakdown.readiness });
  history.sort((a, b) => a.date.localeCompare(b.date));
  return { ...s, readinessHistory: history.slice(-90) };
}

/** Gap after which returning gets a "while you were away" summary. */
const COMEBACK_GAP_DAYS = 3;

/**
 * Runs once per app open: if the last visit was 3+ days ago, queue the
 * comeback diff (positively framed — progress held, reviews waiting), then
 * refresh the lastSeen snapshot.
 */
function withArrivalEffects(s: UserState, now = new Date()): UserState {
  const breakdown = computeReadiness(s);
  const readinessNow = breakdown.readiness;
  let next = s;

  // Bank whatever the existing log already earned, silently. This is the v3→v4
  // back-fill and the same endowed-progress move CP made at v2: a returning
  // learner's first sight of the grid should be a record of their work, not an
  // empty wall. `newly` is dropped rather than queued — nobody wants thirteen
  // toasts at once, and from here on `applyStudyEffects` catches real unlocks.
  const banked = evaluateAchievements(
    achievementInputs(s, breakdown.perCategory, s.rankAchieved >= LICENCE_RANK_INDEX),
    s.achievements,
  ).next;
  if (banked !== s.achievements) next = { ...next, achievements: banked };

  if (s.lastSeen) {
    const daysAway = Math.floor((now.getTime() - Date.parse(s.lastSeen.at)) / 86_400_000);
    if (daysAway >= COMEBACK_GAP_DAYS) {
      next = {
        ...next,
        pendingComeback: {
          daysAway,
          readinessThen: s.lastSeen.readiness,
          readinessNow,
          dueCards: countDueFlashcards(s, now),
        },
      };
    }
  }
  return { ...next, lastSeen: { at: now.toISOString(), readiness: readinessNow } };
}

export function StudyStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<UserState>(defaultUserState);
  const [ready, setReady] = React.useState(false);
  const [accountHydrated, setAccountHydrated] = React.useState(false);
  // null in demo mode (no Supabase env) — every Supabase effect below no-ops.
  const [supabase] = React.useState(() => createClient());

  // Demo mode has no server account to wait for.
  React.useEffect(() => {
    if (!supabase) setAccountHydrated(true);
  }, [supabase]);

  // Hydrate from localStorage on the client only (avoids SSR mismatch).
  React.useEffect(() => {
    setState(withArrivalEffects(loadState()));
    setReady(true);
  }, []);

  // Persist on change once hydrated (local cache; also offline/demo store).
  // Debounced: bursts of updates (answer + streak + CP + usage) coalesce into
  // one JSON.stringify instead of one per intermediate state.
  const latest = React.useRef<{ state: UserState; ready: boolean }>({ state, ready });
  latest.current = { state, ready };
  React.useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => saveState(state), 250);
    return () => clearTimeout(t);
  }, [state, ready]);

  // Another tab wrote the store — adopt its state so tabs converge instead
  // of silently overwriting each other (the event never fires in the writer).
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      try {
        const incoming = JSON.parse(e.newValue) as UserState;
        setState((s) => {
          // Only adopt a write from a tab signed in as the SAME learner. Two
          // tabs on two accounts share one localStorage key, so adopting
          // blindly handed this tab the other account's profile, tier and
          // licence code — which then got written back over this account's
          // rows. A cross-account write is simply not ours to converge with.
          const mine = s.ownerEmail?.toLowerCase() ?? null;
          const theirs = incoming.ownerEmail?.toLowerCase() ?? null;
          if (mine !== null && theirs !== null && mine !== theirs) return s;
          return { ...defaultUserState(), ...incoming };
        });
      } catch {
        /* unreadable write — ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Flush the pending write when the tab hides/closes so nothing is lost.
  React.useEffect(() => {
    const flush = () => {
      if (latest.current.ready) saveState(latest.current.state);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // ── Supabase: follow the real auth session (prod only) ─────────────────────
  // Auth state is driven by the Supabase session, not just the local profile:
  // on sign-in we load the account rows; on sign-out we clear the local profile.
  React.useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const hydrate = async (
      user: import("@supabase/supabase-js").User | null,
      event: import("@supabase/supabase-js").AuthChangeEvent,
      error?: unknown,
    ) => {
      if (!user) {
        // A transient null user (Supabase's single-use refresh token racing
        // between the middleware and this client after a full-page return —
        // e.g. coming back from the Paystack redirect on a plan change) must
        // NOT be read as a logout. Clearing the profile here is what made a
        // plan change look like a sign-out.
        //
        // But keeping it for EVERY null was the opposite bug: the cached
        // profile outlived the cookie (iOS evicts it after ~7 days) and the app
        // went on claiming to be signed in with no session behind it.
        // shouldClearCachedProfile splits the two — an explicit SIGNED_OUT or
        // an AuthSessionMissingError is definitive, anything else keeps the
        // profile and lets the session cookies remain the source of truth.
        if (shouldClearCachedProfile({ event, hasUser: false, error })) {
          setState((s) => (s.profile ? { ...s, profile: null } : s));
        }
        setAccountHydrated(true); // nothing to wait for
        return;
      }
      // A (re)sign-in is in flight: hold routing until the account lands.
      setAccountHydrated(false);
      // A parked referral code from /signup?ref=… — claim it exactly once,
      // now that a real account exists (covers password and OAuth signups).
      try {
        const ref = window.localStorage.getItem("k53.ref");
        if (ref) {
          window.localStorage.removeItem("k53.ref");
          fetch("/api/referral", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code: ref }),
          }).catch(() => {});
        }
      } catch {
        /* private mode */
      }
      try {
        // Account rows + the server's copy of study history in one round.
        const [account, progress] = await Promise.all([
          loadAccount(supabase, user),
          pullProgress(supabase, user.id).catch(() => null),
        ]);
        if (!cancelled)
          setState((s) => hydrateAccountState(s, account, progress, user.email ?? null));
      } catch {
        // Network/RLS hiccup. Keeping only the local cache is what this used to
        // do, and on a browser with no cached profile it left isAuthed false
        // against a session that is plainly alive — AppShell then bounced to
        // /login, the middleware bounced straight back, and Safari died on the
        // history throttle. The read failing says nothing about whether they
        // are signed in; the session already answered that. See
        // hydrateSessionOnly.
        if (!cancelled)
          setState((s) =>
            hydrateSessionOnly(s, {
              id: user.id,
              email: user.email ?? null,
              fullName:
                typeof user.user_metadata?.full_name === "string"
                  ? user.user_metadata.full_name
                  : null,
            }),
          );
      } finally {
        if (!cancelled) setAccountHydrated(true);
      }
    };

    supabase.auth
      .getUser()
      // The error matters as much as the user here: it is the only place that
      // distinguishes "no session exists" from "this one call failed".
      .then(({ data, error }) => hydrate(data.user, "INITIAL_SESSION", error))
      // Surfaces now WAIT on accountHydrated before building a study queue, so
      // a rejected session lookup must still release them — otherwise a
      // network blip leaves the app on a permanent skeleton.
      .catch(() => setAccountHydrated(true));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      hydrate(session?.user ?? null, event);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // ── Supabase: persist account + study progress back (prod only, debounced) ─
  React.useEffect(() => {
    // Never write before we've READ. `ready` only means localStorage loaded —
    // which, on a returning visit, is a cached copy that may be stale or from
    // an older build. Without the accountHydrated gate this fired 800ms after
    // load, racing the (slower, network-bound) hydrate, and pushed the cached
    // profile over the server's. That is how a licence code corrected on the
    // server reappeared as the old value minutes later, with no user action.
    if (!supabase || !ready || !accountHydrated || !state.profile) return;
    const t = setTimeout(() => {
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          // Only write when the local state actually belongs to the signed-in
          // user — never write one account's profile or progress into
          // another's rows during the brief switch window before hydrate
          // re-seeds. This guarded progress but not the account rows, which is
          // how one learner's licence code landed on another's profile.
          if (!user || user.id !== state.profile?.id) return;
          saveAccount(supabase, state).catch(() => {
            // Best-effort; the local cache remains the fallback.
          });
          return pushProgress(supabase, user.id, state);
        })
        .catch(() => {
          // Watermark unchanged — the next flush retries the same window.
        });
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    supabase,
    ready,
    accountHydrated,
    state.profile,
    state.onboarding,
    state.tier,
    state.streak,
    state.attempts,
    state.cardStates,
    state.scenarioAttempts,
    state.mockExams,
    state.diagnostics,
    // Sessions became syncable in 0023. Without them here a finished session
    // waits for some other slice to change before it flushes.
    state.sessions,
  ]);

  const readiness = React.useMemo(() => computeReadiness(state), [state]);

  const bumpUsageState = (s: UserState, kind: UsageKind, by = 1): UserState => {
    const key = todayKey();
    const current = getTodayUsage(s);
    return {
      ...s,
      dailyUsage: { ...s.dailyUsage, [key]: { ...current, [kind]: current[kind] + by } },
    };
  };

  /**
   * The mutators, with a stable identity.
   *
   * Every one of these either drives `setState` with a functional updater or
   * reads through `latest.current`, so none of them closes over `state` and
   * none needs to be rebuilt when it changes. Left inline in the value object
   * they were rebuilt on every render, which quietly defeats any consumer that
   * puts an action in a dependency array — mock-exam.tsx's submit useCallback
   * was being recreated on every keystroke-level render for exactly this reason.
   *
   * `usageFor` is deliberately NOT here: it reads `state` to compare usage
   * against the plan cap, so it belongs with the values that change.
   */
  const actions = React.useMemo<StudyActions>(() => ({
    signInLocal: (name, email) => {
      setState((s) => {
        // A different email is a different person: start from a clean slate
        // instead of inheriting the previous account's tier, subscription
        // track and progress from this browser's store.
        const owner = s.ownerEmail ?? s.profile?.email ?? null;
        const isNewIdentity =
          owner !== null && owner.toLowerCase() !== email.toLowerCase();
        const base = isNewIdentity ? defaultUserState() : s;
        const profile: Profile =
          base.profile ?? {
            id: uid("user"),
            name: name || "Learner",
            email,
            createdAt: new Date().toISOString(),
          };
        return {
          ...base,
          ownerEmail: email,
          profile: { ...profile, name: name || profile.name, email },
        };
      });
    },

    signOut: () => {
      if (supabase) {
        // Prod: the server holds the durable copy, so wipe local progress on
        // sign-out — nothing lingers on a shared device, and the same person's
        // history restores from the server on their next sign-in.
        supabase.auth.signOut().catch(() => {});
        setState(() => defaultUserState());
      } else {
        // Demo (no backend): keep local data; ownerEmail guards re-sign-in.
        setState((s) => ({ ...s, profile: null }));
      }
    },

    setTier: (tier) => setState((s) => ({ ...s, tier })),

    refreshAccount: async () => {
      if (!supabase) return null;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const account = await loadAccount(supabase, user);
      setState((s) => {
        const next = { ...s, ...account };
        if (account.cp != null) next.cp = Math.max(s.cp, account.cp);
        // Same rule as hydrateAccountState: a server with no onboarding yet
        // must not blank the answers this browser already holds.
        next.onboarding = account.onboarding ?? s.onboarding;
        return next;
      });
      return account.tier ?? null;
    },

    completeOnboarding: (data) =>
      setState((s) => ({
        ...s,
        onboarding: { ...data, completedAt: new Date().toISOString() },
      })),

    saveOnboarding: async (data) => {
      const next = await persistOnboarding({
        // `latest` is assigned on every render, so this is the committed
        // state — unlike `state` captured in a stale closure, and unlike a
        // setState updater, whose result isn't readable synchronously.
        state: latest.current.state,
        data,
        saveLocal: saveState,
        saveRemote: supabase ? (s) => saveAccount(supabase, s) : null,
      });
      setState(next);
    },

    recordDiagnostic: (result) =>
      setState((s) => {
        const next = {
          ...s,
          diagnostics: [...s.diagnostics, result],
          attempts: s.attempts, // diagnostic responses are recorded separately as attempts
          cp: s.cp + DIAGNOSTIC_CP,
        };
        return applyStudyEffects(next);
      }),

    reviewCard: (cardId, rating) =>
      setState((s) => {
        const prev = s.cardStates[cardId] ?? initialCardState(cardId);
        const updated = scheduleCard(prev, rating);
        let next: UserState = {
          ...s,
          cardStates: { ...s.cardStates, [cardId]: updated },
          cp: s.cp + flashcardCp(prev, rating),
        };
        next = bumpUsageState(next, "flashcards");
        return applyStudyEffects(next);
      }),

    recordQuestionAttempt: (a) =>
      setState((s) => {
        const attempt = {
          id: uid("att"),
          at: new Date().toISOString(),
          context: a.context ?? "practice",
          ...a,
        };
        let next: UserState = {
          ...s,
          attempts: [...s.attempts, attempt],
          cp: s.cp + questionCp(a.questionId, a.correct, isFirstCorrect(s.attempts, a.questionId)),
        };
        if (attempt.context === "practice") next = bumpUsageState(next, "questions");
        return applyStudyEffects(next);
      }),

    recordScenarioAttempt: (a) =>
      setState((s) => {
        const attempt: ScenarioAttempt = { id: uid("scn"), at: new Date().toISOString(), ...a };
        let next: UserState = {
          ...s,
          scenarioAttempts: [...s.scenarioAttempts, attempt],
          cp: s.cp + (a.correct ? SCENARIO_CP : 0),
        };
        next = bumpUsageState(next, "scenarios");
        return applyStudyEffects(next);
      }),

    recordMockExam: (m, responses = []) =>
      setState((s) => {
        const at = new Date().toISOString();
        const exam: MockExamAttempt = { id: uid("mock"), at, ...m };
        // Per-question answers also land in `attempts` (context "mock") so the
        // live readiness model and weak-area ranking learn from every mock.
        const mockAttempts = responses.map((r) => ({
          id: uid("att"),
          at,
          context: "mock" as const,
          ...r,
        }));
        let gained = MOCK_COMPLETION_CP + (m.passed ? MOCK_PASS_BONUS_CP : 0);
        const seen: { questionId: string; correct: boolean }[] = [...s.attempts];
        for (const r of responses) {
          gained += questionCp(r.questionId, r.correct, isFirstCorrect(seen, r.questionId));
          seen.push({ questionId: r.questionId, correct: r.correct });
        }
        return applyStudyEffects({
          ...s,
          mockExams: [...s.mockExams, exam],
          attempts: [...s.attempts, ...mockAttempts],
          cp: s.cp + gained,
        });
      }),

    recordSession: (type, durationSeconds) =>
      setState((s) => {
        const end = new Date();
        const session = {
          id: uid("sess"),
          type,
          startedAt: new Date(end.getTime() - durationSeconds * 1000).toISOString(),
          endedAt: end.toISOString(),
          durationSeconds,
        };
        return applyStudyEffects({ ...s, sessions: [...s.sessions, session] });
      }),

    toggleDriverStep: (moduleId, stepN) =>
      setState((s) => {
        const done = new Set(s.driverProgress[moduleId] ?? []);
        if (done.has(stepN)) done.delete(stepN);
        else done.add(stepN);
        return {
          ...s,
          driverProgress: { ...s.driverProgress, [moduleId]: [...done].sort((a, b) => a - b) },
        };
      }),

    createTutorThread: ({ title, contextLabel = null, contextQuestionId = null }) => {
      const id = uid("thread");
      const now = new Date().toISOString();
      const thread: TutorThread = {
        id,
        title,
        contextLabel,
        contextQuestionId,
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      setState((s) => ({ ...s, tutorThreads: [thread, ...s.tutorThreads] }));
      return id;
    },

    appendTutorMessage: (threadId, m) =>
      setState((s) => {
        const message: TutorMessage = { id: uid("msg"), createdAt: new Date().toISOString(), ...m };
        const tutorThreads = s.tutorThreads.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, message], updatedAt: message.createdAt }
            : t,
        );
        let next: UserState = { ...s, tutorThreads };
        if (m.role === "user") next = applyStudyEffects(bumpUsageState(next, "tutor"));
        return next;
      }),

    completeGuided: () => setState((s) => (s.guidedDone ? s : { ...s, guidedDone: true })),

    bumpUsage: (kind, by = 1) => setState((s) => bumpUsageState(s, kind, by)),

    acknowledgeRankUp: () => setState((s) => (s.pendingRankUp === null ? s : { ...s, pendingRankUp: null })),

    acknowledgeAchievement: () =>
      setState((s) =>
        s.pendingAchievements.length === 0
          ? s
          : { ...s, pendingAchievements: s.pendingAchievements.slice(1) },
      ),

    dismissComeback: () =>
      setState((s) => (s.pendingComeback === null ? s : { ...s, pendingComeback: null })),

    resetProgress: () => setState(() => defaultUserState()),
  }), [supabase]);

  const store = React.useMemo<StudyStore>(
    () => ({
      ...actions,
      ready,
      accountHydrated,
      state,
      isAuthed: Boolean(state.profile),
      hasOnboarded: Boolean(state.onboarding),
      hasDiagnostic: state.diagnostics.length > 0,
      readiness,

      usageFor: (kind) => {
        const capKey = CAP_KEY[kind];
        // Every plan meters per day now. Free additionally expires after its
        // trial week, at which point the cap is 0 rather than the daily
        // allowance — see PlanLimits.trialDays and trialExhausted().
        const used = getTodayUsage(state)[kind];
        const base = capKey ? dailyCap(state.tier, capKey) : Infinity;
        const cap = trialExhausted(state) ? 0 : base;
        return { used, cap, allowed: used < cap };
      },
    }),
    [actions, ready, accountHydrated, state, readiness],
  );

  return <StudyContextValue.Provider value={store}>{children}</StudyContextValue.Provider>;
}

export function useStudyStore(): StudyStore {
  const ctx = React.useContext(StudyContextValue);
  if (!ctx) throw new Error("useStudyStore must be used within <StudyStoreProvider>");
  return ctx;
}
