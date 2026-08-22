"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GuidedSession } from "@/components/onboarding/guided-session";
import { Spinner } from "@/components/ui/spinner";
import { useStudyStore } from "@/hooks/use-study-store";
import { safeNextPath } from "@/lib/auth/safe-next";

export default function WelcomePage() {
  const router = useRouter();
  const { ready, accountHydrated, isAuthed, hasDiagnostic, state } = useStudyStore();

  // The guide only makes sense once: signed in, diagnosed, not yet toured.
  React.useEffect(() => {
    if (!ready || !accountHydrated) return;
    // Same rule as /continue: the login bounce carries where the learner was
    // headed so signing in resumes the guided tour instead of dropping it.
    const next = safeNextPath("/welcome") ?? "/welcome";
    if (!isAuthed) router.replace(`/login?next=${encodeURIComponent(next)}`);
    else if (!hasDiagnostic) router.replace("/diagnostic");
    else if (state.guidedDone) router.replace("/dashboard");
  }, [ready, accountHydrated, isAuthed, hasDiagnostic, state.guidedDone, router]);

  if (!ready || !accountHydrated || !isAuthed || !hasDiagnostic || state.guidedDone) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  return <GuidedSession />;
}
