"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Spinner } from "@/components/ui/spinner";
import { useStudyStore } from "@/hooks/use-study-store";

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
    if (!isAuthed) {
      router.replace("/login");
    } else if (!hasOnboarded && !hasDiagnostic) {
      router.replace("/onboarding");
    } else if (!hasDiagnostic) {
      router.replace("/diagnostic");
    } else if (state.tier === "free" && !state.guidedDone && state.sessions.length === 0) {
      // Brand-new account fresh off the diagnostic: guided first session.
      router.replace("/welcome");
    } else {
      router.replace("/dashboard");
    }
  }, [ready, accountHydrated, isAuthed, hasOnboarded, hasDiagnostic, state, router]);

  const returning = hasOnboarded || hasDiagnostic;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background bg-app px-6 text-center">
      <Logo />
      <Spinner className="h-6 w-6" />
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
