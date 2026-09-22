"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Spinner } from "@/components/ui/spinner";
import { useStudyStore } from "@/hooks/use-study-store";
import { shouldSkipOnboarding } from "@/lib/auth/onboarding-guard";

/**
 * First-run setup — and only first-run setup. Why the decision is shaped the
 * way it is lives in `shouldSkipOnboarding`.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { ready, accountHydrated, isAuthed, hasOnboarded } = useStudyStore();
  const settled = ready && accountHydrated;

  /**
   * The verdict is latched the moment the flags settle, and never revisited.
   *
   * The question is "had this learner already set up before they arrived?", and
   * only the answer on arrival is meaningful. Re-reading it live is a bug with
   * a very short fuse: finishing the wizard calls `completeOnboarding`, which
   * flips `hasOnboarded` true while this page is still mounted, so the guard
   * would fire and `router.replace("/dashboard")` would race the wizard's own
   * `router.push("/diagnostic")` — and win. A learner who had just tapped
   * "Start my 5-minute check" landed on the dashboard instead, with the choice
   * they made silently dropped.
   */
  const arrived = React.useRef<boolean | null>(null);
  if (settled && arrived.current === null) {
    arrived.current = shouldSkipOnboarding({ ready, accountHydrated, isAuthed, hasOnboarded });
  }
  const alreadySetUp = arrived.current === true;

  React.useEffect(() => {
    if (alreadySetUp) router.replace("/dashboard");
  }, [alreadySetUp, router]);

  // Held until the flags settle: rendering the wizard first and pulling it away
  // a tick later is how a learner ends up half-way through a question they were
  // never meant to be asked.
  if (!settled || alreadySetUp) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  return <OnboardingWizard />;
}
