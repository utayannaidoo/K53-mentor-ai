"use client";

import * as React from "react";
import type { UserState } from "@/types";

/**
 * Local copy of the three local-store functions this provider needs.
 *
 * The module itself is imported dynamically (see below): its dependency chain
 * — defaultUserState → engagement/scoring → the generated planning index in
 * content/meta.ts — is ~110KB of raw JS that has no job before someone
 * actually interacts with the form, and /signup is a crawlable page whose
 * First Load JS we are actively trying to keep near the marketing baseline.
 */
interface LocalStoreModule {
  applySignIn: (state: UserState, name: string, email: string) => UserState;
  loadState: () => UserState;
  saveState: (state: UserState) => void;
}

interface AuthLocalStore {
  /**
   * Promise-resolved by the time any human click lands (the import starts on
   * mount), but still awaited at every call site: AuthForm must not navigate
   * before the profile is durably in localStorage. See the race note below.
   */
  signInLocal: (name: string, email: string) => Promise<void>;
  isAuthed: boolean;
  ready: boolean;
}

const AuthLocalContext = React.createContext<AuthLocalStore | null>(null);

/**
 * A minimal stand-in for the study store, scoped to the public auth pages.
 *
 * /login and /signup used to sit inside the (app) route group purely because
 * AuthForm read `signInLocal` off the shared study store — which meant every
 * signed-out visitor to those two publicly crawlable pages downloaded the
 * entire provider stack (~170KB of First Load JS: study planning, engagement
 * scoring, the starter question pack, Supabase sync modules) to fill in one
 * form. They now live in (auth), whose layout mounts nothing heavy, and
 * AuthForm reads the three values it actually needs from here instead.
 *
 * Semantics match the parts of use-study-store that AuthForm touches:
 *
 *   ready      flips true once localStorage has been read on the client.
 *   isAuthed   Boolean(state.profile) — the same local-only flag. It lies in
 *              production (a cached profile can outlive an evicted session
 *              cookie), but shouldAuthPageSelfRedirect already refuses to act
 *              on it whenever Supabase is configured, so no session tracking
 *              is needed here — in prod this context only mirrors the profile
 *              into localStorage after a real sign-up/sign-in succeeds.
 *   signInLocal writes the profile into localStorage immediately once resolved
 *              (see below).
 *
 * The save MUST complete before AuthForm navigates — it just cannot be
 * debounced. Inside (app), /login shared one long-lived provider instance with
 * every app route, so state survived navigation in memory while the 250ms
 * debounce ran its course. Across route groups it cannot: navigating
 * /login → /continue unmounts this provider, and anything still pending dies
 * with it — the profile never reaches localStorage, hydration on the app side
 * reads an empty store, and the learner is bounced straight back to /login
 * having lost the sign-in they just completed. Hence call sites `await`
 * signInLocal; the module is already resident by then, so the await costs
 * nothing perceptible. An auth page has no other concurrent writer, so the
 * immediate write cannot race anything either.
 */
export function AuthLocalProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const storeRef = React.useRef<Promise<LocalStoreModule> | null>(null);

  const ensureStore = React.useCallback((): Promise<LocalStoreModule> => {
    if (!storeRef.current) storeRef.current = import("@/lib/store/local-store");
    return storeRef.current;
  }, []);

  // Hydrate once on the client only (avoids an SSR mismatch): read whatever is
  // persisted and derive isAuthed exactly as the big store does. Also warms
  // the dynamic import so the first sign-in never waits on the network.
  React.useEffect(() => {
    let cancelled = false;
    ensureStore().then((m) => {
      if (cancelled) return;
      setIsAuthed(Boolean(m.loadState().profile));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ensureStore]);

  const signInLocal = React.useCallback(
    async (name: string, email: string) => {
      const m = await ensureStore();
      // Read fresh rather than mirroring state in React: the merge must apply
      // to whatever is actually persisted right now, and there is no reason to
      // keep a second copy for a value that is written once and immediately
      // consumed by the redirect below.
      m.saveState(m.applySignIn(m.loadState(), name, email));
      setIsAuthed(true);
    },
    [ensureStore],
  );

  const value = React.useMemo<AuthLocalStore>(
    () => ({ signInLocal, isAuthed, ready }),
    [signInLocal, isAuthed, ready],
  );

  return <AuthLocalContext.Provider value={value}>{children}</AuthLocalContext.Provider>;
}

export function useAuthLocal(): AuthLocalStore {
  const ctx = React.useContext(AuthLocalContext);
  if (!ctx) throw new Error("useAuthLocal must be used within <AuthLocalProvider>");
  return ctx;
}
