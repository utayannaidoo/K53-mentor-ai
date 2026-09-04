"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GuidedSession } from "@/components/onboarding/guided-session";
import { Spinner } from "@/components/ui/spinner";
import { useStudyStore } from "@/hooks/use-study-store";
import { safeNextPath } from "@/lib/auth/safe-next";

export default function WelcomePage() {
  const router = useRouter();
  const { ready, accountHydrated, isAuthed, hasOnboarded, hasDiagnostic, state } = useStudyStore();

  // This route is only for the learner who deliberately chose "study first".
  // A completed starting check already taught them enough to use Today.
  React.useEffect(() => {
    if (!ready || !accountHydrated) return;
    const next = safeNextPath("/welcome") ?? "/welcome";
    if (!isAuthed) router.replace(`/login?next=${encodeURIComponent(next)}`);
    else if (!hasOnboarded) router.replace("/onboarding");
    else if (hasDiagnostic || state.guidedDone) router.replace("/dashboard");
    else if (!state.diagnosticSkippedAt) router.replace("/diagnostic");
  }, [
    ready,
    accountHydrated,
    isAuthed,
    hasOnboarded,
    hasDiagnostic,
    state.guidedDone,
    state.diagnosticSkippedAt,
    router,
  ]);

  if (
    !ready ||
    !accountHydrated ||
    !isAuthed ||
    !hasOnboarded ||
    hasDiagnostic ||
    state.guidedDone ||
    !state.diagnosticSkippedAt
  ) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  return <GuidedSession />;
}
