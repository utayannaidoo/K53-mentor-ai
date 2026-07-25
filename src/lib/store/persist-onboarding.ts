import type { OnboardingData, UserState } from "@/types";

/**
 * Apply an onboarding edit and make it durable.
 *
 * Extracted from the store provider so the ordering guarantees below can be
 * tested without a DOM. They matter because a profile edit that only reaches
 * localStorage looks saved and then silently reverts: the next sign-in
 * hydrates `profiles` and puts the old answers straight back.
 *
 * 1. The local cache is written first, so the choice survives a failed
 *    network call (and demo mode, where local IS the store).
 * 2. The server write is AWAITED, so the caller can only report success once
 *    the profile row actually has it. It used to ride the store's 800ms
 *    debounce, which any navigation inside that window cancelled.
 * 3. A server failure propagates rather than being swallowed.
 */
export async function persistOnboarding({
  state,
  data,
  saveLocal,
  saveRemote,
}: {
  state: UserState;
  data: OnboardingData;
  /** Synchronous local-cache write (localStorage). */
  saveLocal: (next: UserState) => void;
  /** Server write, or null when there's no backend (demo mode). */
  saveRemote: ((next: UserState) => Promise<void>) | null;
}): Promise<UserState> {
  const next: UserState = { ...state, onboarding: data };
  saveLocal(next);
  // No account to write to: signed out, or demo mode.
  if (saveRemote && next.profile) await saveRemote(next);
  return next;
}
