import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn, glass, glassFloat, glassSubtle } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { lessonFactsBetween, schoolInstructors, schoolLearners, schoolProgress } from "@/lib/schools/diary";
import { schoolLedger } from "@/lib/schools/ledger";
import { schoolTestResults } from "@/lib/schools/pipeline";
import { readiness } from "@/lib/schools/modules";
import { collectedIn, formatRand, learnerBalance } from "@/lib/schools/money";
import { lessonStats, mondayOf, percent } from "@/lib/schools/reports";
import { passRate } from "@/lib/schools/test-day";
import { dayBounds, schoolDay, shiftDay } from "@/lib/schools/time";

export const metadata: Metadata = { title: "Reports" };

/**
 * How the school is doing, on one screen.
 *
 * Six numbers an owner can act on — this week's lessons, the month's money,
 * what's owed, how often learners don't show, who's ready for a test, and the
 * pass rate — then the same per instructor, and one plain sentence about where
 * money is leaking. Every figure is computed from the records, never stored,
 * so there is nothing to reconcile.
 */
export default async function SchoolReports() {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;

  if (school.role === "instructor") {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Reports</h1>
        <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
          Reports are for the owner and the office. Your own day is on the diary, and each
          learner&apos;s progress is on their card.
        </Card>
      </div>
    );
  }

  const tz = school.timezone;
  const today = schoolDay(new Date(), tz);
  const weekStart = dayBounds(mondayOf(today), tz).start.toISOString();
  const weekEnd = dayBounds(shiftDay(mondayOf(today), 6), tz).end.toISOString();
  const monthAgo = dayBounds(shiftDay(today, -30), tz).start.toISOString();
  const tomorrow = dayBounds(shiftDay(today, 1), tz).start.toISOString();
  const quarterAgo = shiftDay(today, -90);

  const [facts, ledger, results, learners, instructors, progress] = await Promise.all([
    lessonFactsBetween(school, monthAgo < weekStart ? monthAgo : weekStart, weekEnd),
    schoolLedger(school),
    schoolTestResults(school, quarterAgo),
    schoolLearners(school),
    schoolInstructors(school),
    schoolProgress(school),
  ]);

  const week = lessonStats(facts, weekStart, weekEnd);
  const last30 = lessonStats(facts, monthAgo, tomorrow);
  const collected = collectedIn(today.slice(0, 7), ledger.payments);
  const owing = learners
    .map((l) => learnerBalance(l.id, ledger.packages, ledger.payments, ledger.lessons).balanceCents)
    .filter((b) => b > 0);
  const outstanding = owing.reduce((sum, b) => sum + b, 0);
  const current = learners.filter((l) => l.status === "active" || l.status === "paused");
  const testReady = current.filter((l) => {
    const score = readiness(
      l.licence_code,
      progress.filter((p) => p.learner_id === l.id),
    );
    return score.total > 0 && score.ready === score.total;
  }).length;
  const drivers = passRate(results, quarterAgo, "drivers");

  const tiles = [
    { label: "Lessons this week", value: String(week.taught + week.booked), hint: `${week.taught} done, ${week.booked} to go` },
    { label: "In this month", value: formatRand(collected), hint: "payments recorded" },
    { label: "Outstanding", value: formatRand(outstanding), hint: `${owing.length} learners`, emphasis: outstanding > 0 },
    { label: "No-shows", value: percent(last30.noShowRate), hint: `${last30.noShows} in 30 days` },
    { label: "Test-ready", value: String(testReady), hint: `of ${current.length} current learners` },
    { label: "Pass rate", value: percent(drivers.rate), hint: drivers.attempts ? `${drivers.passed} of ${drivers.attempts} driver's tests, 90 days` : "no driver's tests yet" },
  ];

  const leak = [
    outstanding > 0 ? `${formatRand(outstanding)} is outstanding across ${owing.length} ${owing.length === 1 ? "learner" : "learners"}` : null,
    last30.noShows > 0 ? `${last30.noShows} ${last30.noShows === 1 ? "no-show" : "no-shows"} in the last 30 days` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/schools/more" className="text-2xs text-muted-foreground hover:text-foreground">
          ← More
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">{school.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label} className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">{tile.label}</p>
            <p className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", tile.emphasis && "text-primary")}>
              {tile.value}
            </p>
            <p className="mt-0.5 text-2xs text-muted-foreground">{tile.hint}</p>
          </Card>
        ))}
      </div>

      {leak.length > 0 ? (
        <Card className={cn(glassFloat, "p-5 text-sm")}>
          <span className="font-medium">Where money is leaking: </span>
          {leak.join("; ")}.{" "}
          <Link href="/schools/money" className="font-medium text-primary hover:underline">
            See who owes →
          </Link>
        </Card>
      ) : null}

      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">By instructor · last 30 days</h2>
        <Card className={cn(glass, "divide-y divide-border/50")}>
          {instructors.map((instructor) => {
            const mine = lessonStats(
              facts.filter((f) => f.instructor_id === instructor.id),
              monthAgo,
              tomorrow,
            );
            const theirPasses = passRate(
              results.filter((r) => r.instructor_id === instructor.id),
              quarterAgo,
              "drivers",
            );
            return (
              <div key={instructor.id} className="p-4">
                <p className="font-medium">{instructor.displayName}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-2xs text-muted-foreground tabular-nums">
                  <span>{mine.taught} taught</span>
                  <span>{mine.noShows} no-shows ({percent(mine.noShowRate)})</span>
                  <span>
                    pass rate {percent(theirPasses.rate)}
                    {theirPasses.attempts ? ` (${theirPasses.passed}/${theirPasses.attempts})` : ""}
                  </span>
                </p>
              </div>
            );
          })}
        </Card>
      </div>

      <p className="text-2xs text-muted-foreground">
        No-shows are counted out of lessons that were due to happen. The pass rate counts every
        attempt at the driver&apos;s test, so two fails and a pass is one in three.
      </p>
    </div>
  );
}
