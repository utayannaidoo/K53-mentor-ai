import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn, glass, glassFloat } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { ActionForm, Field } from "@/components/admin/action-form";
import { createSchoolWorkspace } from "@/app/schools/actions";
import { SCHOOL_TRIAL_DAYS } from "@/lib/billing/school-plans";

export const metadata: Metadata = { title: "Set up your school" };
export const dynamic = "force-dynamic";

/**
 * Where a signed-in person with no school lands.
 *
 * Two doors, because there are exactly two ways to belong to a school: you run
 * it, or someone who runs it invited you.
 */
export default async function StartSchool({ searchParams }: { searchParams: Promise<{ closed?: string }> }) {
  if (isSupabaseConfigured && (await currentSchool())) redirect("/schools");
  const justClosed = (await searchParams).closed === "1";

  return (
    <div className="bg-app min-h-dvh">
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6">
        <div>
          <p className="text-2xs font-medium uppercase tracking-wide text-primary">
            K53 Mentor for Schools
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Set up your school
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your diary, your learners and your money in one place. {SCHOOL_TRIAL_DAYS} days free, no card.
          </p>
        </div>

        {justClosed ? (
          <Card role="status" className={cn(glass, "p-5 text-sm")}>
            Your school has been closed and its records deleted. Your own K53 Mentor account is untouched.
          </Card>
        ) : null}

        <Card className={cn(glassFloat, "space-y-5 p-6")}>
          <div>
            <h2 className="font-display text-lg font-semibold">I run the school</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You can change any of this later. Only the name is needed to start.
            </p>
          </div>
          <ActionForm
            action={createSchoolWorkspace}
            submitLabel="Create my school"
            pendingLabel="Setting up…"
          >
            <Field label="School name" name="name" placeholder="e.g. Sipho's Driving School" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Town" name="town" placeholder="e.g. Pinetown" />
              <Field label="Province" name="province" placeholder="e.g. KwaZulu-Natal" />
            </div>
            <Field label="Phone" name="phone" type="tel" placeholder="e.g. 082 123 4567" />
          </ActionForm>
        </Card>

        <Card className={cn(glass, "space-y-3 p-6")}>
          <h2 className="font-display text-lg font-semibold">I was invited</h2>
          <p className="text-sm text-muted-foreground">
            If the owner gave you an 8-character code, enter it on the join page.
          </p>
          <Link href="/schools/join" className="text-sm font-medium text-primary hover:underline">
            Enter an invite code →
          </Link>
        </Card>
      </div>
    </div>
  );
}
