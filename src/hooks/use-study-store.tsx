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
  VehicleClass,
  CategoryId,
} from "@/types";
import {
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
import { uid } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { loadAccount, saveAccount } from "@/lib/supabase/account";

type UsageKind = "flashcards" | "questions" | "tutor" | "scenarios";

interface StudyStore {
  ready: boolean;
  state: UserState;
  isAuthed: boolean;
  hasOnboarded: boolean;
  hasDiagnostic: boolean;
  readiness: ReadinessBreakdown;

  signInLocal: (name: string, email: string) => void;
  signOut: () => void;
  setTier: (tier: SubscriptionTier) => void;
  setVehicleClass: (vc: VehicleClass | null) => void;
  completeOnboarding: (data: Omit<OnboardingData, "completedAt">) => void;

  recordDiagnostic: (result: DiagnosticResult) => void;
  reviewCard: (cardId: string, rating: SrsRating) => void;
  recordQuestionAttempt: (a: {
    questionId: string;
    categoryId: CategoryId;
    correct: boolean;
    selectedIndex: number;
    context?: StudyContext;
  }) => void;
  recordScenarioAttempt: (a: Omit<ScenarioAttempt, "id" | "at">) => void;
  recordMockExam: (m: Omit<MockExamAttempt, "id" | "at">) => void;
  recordSession: (type: SessionType, durationSeconds: number) => void;
  toggleDriverStep: (moduleId: string, stepN: number) => void;

  createTutorThread: (t: {
    title: string;
    contextLabel?: string | null;
    contextQuestionId?: string | null;
  }) => string;
  appendTutorMessage: (threadId: string, m: Omit<TutorMessage, "id" | "createdAt">) => void;

  bumpUsage: (kind: UsageKind, by?: number) => void;
  usageFor: (kind: UsageKind) => { used: number; cap: number; allowed: boolean };
  resetProgress: () => void;
}

const StudyContextValue = React.createContext<StudyStore | null>(null);

const CAP_KEY: Record<UsageKind, CapKey | null> = {
  flashcards: "flashcardsPerDay",
  questions: "questionsPerDay",
  tutor: "tutorPerDay",
  scenarios: null, // gated by feature flag, not a daily cap
};

/** Touch the streak and snapshot today's readiness — shared by all study actions. */
function applyStudyEffects(state: UserState, now = new Date()): UserState {
  const streak = touchStreak(state.streak, now);
  const withStreak = { ...state, streak };
  const { readiness } = computeReadiness(withStreak);
  const date = todayKey(now);
  const history = withStreak.readinessHistory.filter((h) => h.date !== date);
  history.push({ date, readiness });
  history.sort((a, b) => a.date.localeCompare(b.date));
  return { ...withStreak, readinessHistory: history.slice(-90) };
}

export function StudyStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<UserState>(defaultUserState);
  const [ready, setReady] = React.useState(false);
  // null in demo mode (no Supabase env) — every Supabase effect below no-ops.
  const [supabase] = React.useState(() => createClient());

  // Hydrate from localStorage on the client only (avoids SSR mismatch).
  React.useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  // Persist on change once hydrated (local cache; also offline/demo store).
  React.useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  // ── Supabase: follow the real auth session (prod only) ─────────────────────
  // Auth state is driven by the Supabase session, not just the local profile:
  // on sign-in we load the account rows; on sign-out we clear the local profile.
  React.useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const hydrate = async (user: import("@supabase/supabase-js").User | null) => {
      if (!user) {
        setState((s) => (s.profile ? { ...s, profile: null } : s));
        return;
      }
      try {
        const account = await loadAccount(supabase, user);
        if (!cancelled) setState((s) => ({ ...s, ...account }));
      } catch {
        // Network/RLS hiccup — keep whatever the local cache holds.
      }
    };

    supabase.auth.getUser().then(({ data }) => hydrate(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrate(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // ── Supabase: persist account-tier data back (prod only, debounced) ────────
  React.useEffect(() => {
    if (!supabase || !ready || !state.profile) return;
    const t = setTimeout(() => {
      saveAccount(supabase, state).catch(() => {
        // Best-effort; the local cache remains the fallback.
      });
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, ready, state.profile, state.onboarding, state.tier, state.streak]);

  const readiness = React.useMemo(() => computeReadiness(state), [state]);

  const bumpUsageState = (s: UserState, kind: UsageKind, by = 1): UserState => {
    const key = todayKey();
    const current = getTodayUsage(s);
    return {
      ...s,
      dailyUsage: { ...s.dailyUsage, [key]: { ...current, [kind]: current[kind] + by } },
    };
  };

  const store: StudyStore = {
    ready,
    state,
    isAuthed: Boolean(state.profile),
    hasOnboarded: Boolean(state.onboarding),
    hasDiagnostic: state.diagnostics.length > 0,
    readiness,

    signInLocal: (name, email) => {
      setState((s) => {
        const profile: Profile =
          s.profile ?? {
            id: uid("user"),
            name: name || "Learner",
            email,
            createdAt: new Date().toISOString(),
          };
        return { ...s, profile: { ...profile, name: name || profile.name, email } };
      });
    },

    signOut: () => {
      // End the real Supabase session (prod); the auth listener will also clear
      // the local profile, but we clear it immediately for a snappy redirect.
      if (supabase) supabase.auth.signOut().catch(() => {});
      setState((s) => ({ ...s, profile: null }));
    },

    setTier: (tier) => setState((s) => ({ ...s, tier })),

    setVehicleClass: (vehicleClass) => setState((s) => ({ ...s, vehicleClass })),

    completeOnboarding: (data) =>
      setState((s) => ({
        ...s,
        onboarding: { ...data, completedAt: new Date().toISOString() },
      })),

    recordDiagnostic: (result) =>
      setState((s) => {
        const next = {
          ...s,
          diagnostics: [...s.diagnostics, result],
          attempts: s.attempts, // diagnostic responses are recorded separately as attempts
        };
        return applyStudyEffects(next);
      }),

    reviewCard: (cardId, rating) =>
      setState((s) => {
        const prev = s.cardStates[cardId] ?? initialCardState(cardId);
        const updated = scheduleCard(prev, rating);
        let next: UserState = { ...s, cardStates: { ...s.cardStates, [cardId]: updated } };
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
        let next: UserState = { ...s, attempts: [...s.attempts, attempt] };
        if (attempt.context === "practice") next = bumpUsageState(next, "questions");
        return applyStudyEffects(next);
      }),

    recordScenarioAttempt: (a) =>
      setState((s) => {
        const attempt: ScenarioAttempt = { id: uid("scn"), at: new Date().toISOString(), ...a };
        let next: UserState = { ...s, scenarioAttempts: [...s.scenarioAttempts, attempt] };
        next = bumpUsageState(next, "scenarios");
        return applyStudyEffects(next);
      }),

    recordMockExam: (m) =>
      setState((s) => {
        const exam: MockExamAttempt = { id: uid("mock"), at: new Date().toISOString(), ...m };
        return applyStudyEffects({ ...s, mockExams: [...s.mockExams, exam] });
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

    bumpUsage: (kind, by = 1) => setState((s) => bumpUsageState(s, kind, by)),

    usageFor: (kind) => {
      const capKey = CAP_KEY[kind];
      const used = getTodayUsage(state)[kind];
      const cap = capKey ? dailyCap(state.tier, capKey) : Infinity;
      return { used, cap, allowed: used < cap };
    },

    resetProgress: () => setState(() => defaultUserState()),
  };

  return <StudyContextValue.Provider value={store}>{children}</StudyContextValue.Provider>;
}

export function useStudyStore(): StudyStore {
  const ctx = React.useContext(StudyContextValue);
  if (!ctx) throw new Error("useStudyStore must be used within <StudyStoreProvider>");
  return ctx;
}
