import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { TumblingETest } from "@/components/vision/tumbling-e-test";
import { SupportLink } from "@/components/shared/support-link";
import { isEyeTestReleased, resolveEyeTestAccess } from "@/lib/billing/preview-access.server";
import { cn, glass } from "@/lib/utils";

export const metadata: Metadata = { title: "Eye test" };

// The gate reads the session, so this page must never be prerendered or cached.
export const dynamic = "force-dynamic";

/**
 * `resolveEyeTestAccess()` 404s signed-out callers, so the URL does not
 * advertise the feature to the open web while it is dark.
 *
 * A signed-in learner is a different case, on any tier: /licence-prep draws
 * them an Eye test tile, so when the release flag is off they resolve to
 * "coming-soon" and get told so — a 404 at the end of a link we drew is a dead
 * end, not a secret.
 *
 * The allowlist keeps working after release (support/debugging access), so
 * `access === "owner"` alone doesn't mean "still unreleased" — check
 * `isEyeTestReleased()` separately before showing the preview banner.
 */
export default async function EyeTestPage() {
  const access = await resolveEyeTestAccess();
  if (access === "denied") notFound();

  if (access === "coming-soon") {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Eye test"
          description="The tumbling-E screener the DLTC puts you through before they book your test."
        />
        <Card className={cn(glass, "p-8 text-center")}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Eye className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold tracking-tight">
            We&apos;re putting the finishing touches on this
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The screener is free on every plan and opens here shortly — there&apos;s nothing to
            pay and nothing to do. Carry on studying in the meantime.
          </p>
          <Link href="/licence-prep" className={cn(buttonVariants(), "mt-6")}>
            Back to licence prep
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Expected it to be open already? Tell us at{" "}
            <SupportLink subject="K53 Mentor — the eye test isn't open yet" />.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Eye test"
        description="The tumbling-E screener the DLTC puts you through before they book your test."
      />

      {access === "owner" && !isEyeTestReleased() && (
        <p className="mb-5 rounded-lg border border-warning/30 bg-warning/[0.08] px-4 py-2.5 text-xs text-warning">
          Unreleased — visible to you only. Set EYE_TEST_RELEASED=1 to open it to every signed-in learner.
        </p>
      )}

      <TumblingETest />
    </div>
  );
}
