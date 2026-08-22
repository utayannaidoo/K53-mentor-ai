"use client";

import { SectionError } from "@/components/shared/section-error";

/**
 * Group-level boundary. login, signup, onboarding, welcome, continue,
 * diagnostic and eye-test have no error.tsx of their own — without this one a
 * crash in any of them bubbled to the bare root boundary and dropped every
 * learner mid-signup with no way back except typing a URL by hand.
 */
export default function ErrorBoundary(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SectionError {...props} label="This page" />;
}
