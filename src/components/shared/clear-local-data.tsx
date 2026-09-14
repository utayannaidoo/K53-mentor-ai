"use client";

import { cn } from "@/lib/utils";

/** Everything the app owns in web storage. Prefix, so drafts are covered too. */
const PREFIX = "k53mentor.";

const CONFIRM =
  "This clears the study data saved in this browser and reloads the app.\n\n" +
  "If you're signed in, your progress comes back from your account when you " +
  "sign back in. If you've been studying without an account, it will be lost.\n\n" +
  "Only do this if the app keeps breaking.";

/**
 * The bottom of the ladder on a crash screen.
 *
 * A saved record the app cannot read takes down every route at once — the
 * store is mounted by the (app) layout — so the learner cannot reach /account
 * to reset it, and both boundary buttons re-read the same record and crash
 * again. `withSaneShapes` in local-store.ts closes the known version of that
 * (a field whose shape is wrong), but not a crash from something it can't
 * anticipate, and a loop with no exit is not something support can talk
 * someone out of over email.
 *
 * Deliberately the quietest thing on the screen and deliberately destructive-
 * on-purpose rather than clever: `window.confirm`, not the design system's
 * Dialog, because whatever broke may be exactly the machinery a Dialog needs.
 * For the same reason every step is individually guarded — this must not be
 * the thing that throws on the screen that exists to catch throws.
 */
export function ClearLocalData({ className }: { className?: string }) {
  function clear() {
    if (!window.confirm(CONFIRM)) return;
    for (const store of [window.localStorage, window.sessionStorage]) {
      try {
        for (const key of Object.keys(store)) {
          if (key.startsWith(PREFIX)) store.removeItem(key);
        }
      } catch {
        /* private mode, or storage disabled — try the other one anyway */
      }
    }
    // Home rather than reload: the route that crashed is the least likely one
    // to survive, and landing back on it would read as "that did nothing".
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={clear}
      className={cn(
        "text-2xs text-muted-foreground/70 underline underline-offset-2 hover:text-muted-foreground",
        className,
      )}
    >
      Still looping? Clear this browser&apos;s saved data
    </button>
  );
}
