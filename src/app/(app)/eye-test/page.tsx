import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/app-shell";
import { TumblingETest } from "@/components/vision/tumbling-e-test";
import { isEyeTestReleased, resolveEyeTestAccess } from "@/lib/billing/preview-access.server";

export const metadata: Metadata = { title: "Eye test" };

// The gate reads the session, so this page must never be prerendered or cached.
export const dynamic = "force-dynamic";

/**
 * `resolveEyeTestAccess()` 404s for everyone unless the caller's email is in
 * EYE_TEST_ALLOWLIST, or EYE_TEST_RELEASED=1 and they are on Premium Plus.
 * Nothing links here while it is unreleased — a 404 rather than a paywall so
 * the URL does not advertise what is coming.
 *
 * The allowlist keeps working after release (support/debugging access), so
 * `access === "owner"` alone doesn't mean "still unreleased" — check
 * `isEyeTestReleased()` separately before showing the preview banner.
 */
export default async function EyeTestPage() {
  const access = await resolveEyeTestAccess();
  if (access === "denied") notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Eye test"
        description="The tumbling-E screener the DLTC puts you through before they book your test."
      />

      {access === "owner" && !isEyeTestReleased() && (
        <p className="mb-5 rounded-lg border border-warning/30 bg-warning/[0.08] px-4 py-2.5 text-xs text-warning">
          Unreleased — visible to you only. Set EYE_TEST_RELEASED=1 to open it to Premium Plus.
        </p>
      )}

      <TumblingETest />
    </div>
  );
}
