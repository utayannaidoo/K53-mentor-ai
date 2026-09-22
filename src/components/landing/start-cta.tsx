"use client";

import * as React from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { STORAGE_KEY } from "@/lib/store/storage-key";
import { signedInFromStateBlob } from "@/lib/auth/onboarding-guard";

/**
 * The top-of-funnel button, pointed at wherever the visitor actually belongs.
 *
 * "Start free assessment" is the right promise for a stranger and the wrong one
 * for a learner three weeks into their studying — who, before this, was sent
 * into first-run setup by the button on their own home page. The route guard on
 * /onboarding is what protects their data; this is what stops the app asking in
 * the first place.
 *
 * The signal is one localStorage read, deliberately not `useStudyStore`: the
 * marketing pages do not mount StudyStoreProvider, because it reaches the
 * question bank and would put ~645KB into the landing chunk. `profile` is
 * written by both sign-in paths (Supabase and demo guest), which is the same
 * thing `isAuthed` means inside the app.
 *
 * It is a per-browser guess, and it is allowed to be wrong. These pages are
 * statically cached, so the signed-out markup is what the CDN serves and what
 * hydration must match — the swap happens after mount, and a signed-in learner
 * on a device they have not used before keeps the stranger's label. In both
 * cases the destination still resolves correctly, because /onboarding redirects
 * an already-onboarded learner to /dashboard.
 */

function readSignedIn(): boolean {
  try {
    return signedInFromStateBlob(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // localStorage itself can throw — private mode, blocked site data.
    return false;
  }
}

export function StartCta({
  location,
  label,
  signedInLabel = "Go to dashboard",
  signedInHref = "/dashboard",
  icon,
  className,
  onNavigate,
}: {
  /** Funnel attribution, as `cta_clicked` already reports it ("hero", "nav", …). */
  location: string;
  label: string;
  signedInLabel?: string;
  signedInHref?: string;
  icon?: React.ReactNode;
  className?: string;
  /** For the mobile menu, which closes itself on tap. */
  onNavigate?: () => void;
}) {
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    setSignedIn(readSignedIn());
  }, []);

  return (
    <Link
      href={signedIn ? signedInHref : "/onboarding"}
      className={className}
      onClick={() => {
        // `destination` keeps returning learners out of the landing→signup
        // conversion rate, which they would otherwise enter and never complete.
        track("cta_clicked", { location, destination: signedIn ? "dashboard" : "onboarding" });
        onNavigate?.();
      }}
    >
      {signedIn ? signedInLabel : label}
      {icon}
    </Link>
  );
}
