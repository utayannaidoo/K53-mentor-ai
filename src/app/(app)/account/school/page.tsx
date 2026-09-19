import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, glass, glassSubtle, formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkedSchoolsFor, type LinkedSchoolView } from "@/lib/schools/learner-link";
import { formatRand } from "@/lib/schools/money";
import { shortDateTime, clockTime } from "@/lib/schools/time";
import { ConnectSchool, LeaveSchool } from "@/components/account/connect-school";

export const metadata: Metadata = { title: "Your driving school" };
export const dynamic = "force-dynamic";

/**
 * The learner's view of their driving school, when they have chosen to
 * connect one (migration 0043). Server-rendered: the school's side is read
 * with the service role, and only ever through linkedSchoolsFor, which
 * decides what a learner may see.
 */
export default async function AccountSchool() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeader title="Your driving school" description="Your lessons and progress from your driving school." />
        <Link href="/account" className="text-2xs text-muted-foreground hover:text-foreground">
          ← Account
        </Link>
        <Card className={cn(glass, "p-5 text-sm text-muted-foreground")}>
          Connecting a driving school needs a K53 Mentor account. It isn&apos;t available in the demo.
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const admin = createAdminClient();
  const schools = user && admin ? await linkedSchoolsFor(admin, user.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Your driving school" description="Your lessons and progress from your driving school." />
      <Link href="/account" className="text-2xs text-muted-foreground hover:text-foreground">
        ← Account
      </Link>

      {!user ? (
        <Card className={cn(glass, "p-5 text-sm text-muted-foreground")}>
          Sign in to connect your driving school.
        </Card>
      ) : (
        <>
          {schools.map((school) => (
            <SchoolCard key={school.rosterId} school={school} />
          ))}
          {schools.length === 0 ? <ConnectSchool /> : null}
        </>
      )}
    </div>
  );
}

function SchoolCard({ school }: { school: LinkedSchoolView }) {
  const owes = school.balanceCents;
  return (
    <div className="space-y-3">
      <Card className={cn(glass, "space-y-4 p-5")}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold">{school.schoolName}</h2>
            <p className="mt-0.5 text-2xs text-muted-foreground">
              Connected {formatDate(school.connectedAt)}
              {school.instructorName ? ` · ${school.instructorName} is your instructor` : ""}
            </p>
          </div>
          <Badge variant={owes > 0 ? "warning" : "outline"}>
            {owes > 0 ? `You owe ${formatRand(owes)}` : owes < 0 ? `${formatRand(-owes)} in credit` : "All paid up"}
          </Badge>
        </div>

        <div className={cn(glassSubtle, "rounded-md p-4")}>
          <p className="text-2xs uppercase tracking-wide text-muted-foreground">Next lesson</p>
          {school.nextLesson ? (
            <>
              <p className="mt-1 font-display text-lg font-semibold">
                {shortDateTime(school.nextLesson.startsAt, school.timezone)}–
                {clockTime(school.nextLesson.endsAt, school.timezone)}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[
                  school.nextLesson.pickup ? `Pickup: ${school.nextLesson.pickup}` : null,
                  school.nextLesson.instructorName ? `with ${school.nextLesson.instructorName}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Details from your school"}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Nothing booked yet.</p>
          )}
        </div>

        {school.nextFocus ? (
          <div className="text-sm">
            <p className="font-medium">From your instructor</p>
            <p className="mt-1 text-muted-foreground">
              Next time, start with: {school.nextFocus.text}
              <span className="text-2xs"> ({formatDate(school.nextFocus.lessonAt)})</span>
            </p>
          </div>
        ) : null}
      </Card>

      <Card className={cn(glass, "divide-y divide-border/50")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 p-4">
          <h3 className="font-display text-base font-semibold">Yard-test manoeuvres</h3>
          <p className="text-2xs text-muted-foreground">
            {school.manoeuvres.length} of {school.totalManoeuvres} rated by your school
          </p>
        </div>
        {school.manoeuvres.length > 0 ? (
          school.manoeuvres.map((m) => (
            <div key={m.name} className="flex flex-wrap items-center gap-3 p-4 text-sm">
              <span className="min-w-0 flex-1">{m.name}</span>
              <Badge variant={m.rating === "Test-ready" ? "success" : "outline"}>{m.rating}</Badge>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-muted-foreground">Your instructor hasn&apos;t rated any yet.</p>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-2xs text-muted-foreground">
          {school.schoolName} sees your readiness score and your strength in each part of the learner&apos;s
          test. Nothing else.
        </p>
        <LeaveSchool rosterId={school.rosterId} schoolName={school.schoolName} />
      </div>
    </div>
  );
}
