"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GuidedSession } from "@/components/onboarding/guided-session";
import { Spinner } from "@/components/ui/spinner";
import { useStudyStore } from "@/hooks/use-study-store";
import { safeNextPath } from "@/lib/auth/safe-next";

export default function WelcomePage() {
  const router = useRouter();
  const { ready, accountHydrated, isAuthed, state } = useStudyStore();

  // The tour runs once per account, even if they skipped the diagnostic.
  // Previously it required hasDiagnostic, so skippers and Andile (diagnostic
  // session made sessions.length===1) never saw it.
  React.useEffect(() => {
    if (!ready || !accountHydrated) return;
    const next = safeNextPath("/welcome") ?? "/welcome";
    if (!isAuthed) router.replace(`/login?next=${encodeURIComponent(next)}`);
    else if (state.guidedDone) router.replace("/dashboard");
  }, [ready, accountHydrated, isAuthed, state.guidedDone, router]);

  if (!ready || !accountHydrated || !isAuthed || state.guidedDone) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  return <GuidedSession />;
}
