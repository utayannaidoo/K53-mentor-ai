"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { DrivingLoader } from "@/components/ui/driving-loader";
import { useStudyStore } from "@/hooks/use-study-store";
import { safeNextPath } from "@/lib/auth/safe-next";

/**
 * Post-auth router. Every sign-in (password, Google, demo) lands here, waits
 * for the server account + progress to hydrate into local state, and only
 * THEN decides where the user belongs. Routing off local state immediately
 * after login is what used to re-onboard returning users.
 */
export default function ContinuePage() {
  const router = useRouter();
  const { ready, accountHydrated, isAuthed, hasOnboarded, hasDiagnostic, state } =
    useStudyStore();
  const routed = React.useRef(false);

  React.useEffect(() => {
    if (!ready || !accountHydrated || routed.current) return;
    routed.current = true;
    // Where they were headed before the middleware bounced them to /login.
    // Re-validated here, not trusted from the auth form: /continue?next=… is a
    // URL anyone can craft, and this is the hop that actually acts on it.
    const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
    if (!isAuthed) {
      // A stale tab parked here carries its own `?next=` — usually a purchase
      // intent like /account/billing?buy=…. Hand it through the login bounce
      // instead of dropping it at the door.
      const here = safeNextPath(window.location.pathname + window.location.search);
      router.replace(here ? `/login?next=${encodeURIComponent(here)}` : "/login");
    } else if (!hasOnboarded && !hasDiagnostic) {
      router.replace("/onboarding");
    } else if (!hasDiagnostic) {
      router.replace("/diagnostic");
    } else if (state.tier === "free" && !state.guidedDone && state.sessions.length === 0) {
      // Brand-new account fresh off the diagnostic: guided first session.
      router.replace("/welcome");
    } else {
      // Only a fully set-up account gets sent on to `next` — every branch above
      // is a step they still owe, and the deep link would skip it.
      router.replace(next ?? "/dashboard");
    }
  }, [ready, accountHydrated, isAuthed, hasOnboarded, hasDiagnostic, state, router]);

  const returning = hasOnboarded || hasDiagnostic;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background bg-app px-6 text-center">
      <Logo />
      <DrivingLoader label="Loading your progress" className="py-0" />
      <div>
        <p className="font-display text-xl font-semibold tracking-tight">
          {returning ? `Welcome back${state.profile?.name ? `, ${state.profile.name.split(" ")[0]}` : ""}` : "Setting things up"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Loading your progress — one moment…
        </p>
      </div>
    </div>
  );
}
