import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";

export const metadata: Metadata = { title: "Diary" };

/**
 * Today's diary — the instructor's landing page.
 *
 * Slice 0 has no lessons table yet, so this stands in with the workspace's
 * actual state and the one next step. It is replaced wholesale in slice 1.
 */
export default async function SchoolDiary() {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const today = new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Today</h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </div>

      <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
        No lessons booked yet. Once the diary is switched on you&apos;ll see every lesson for the
        day here, in time order, with the learner, the car and where to fetch them.
      </Card>

      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Set up</h2>
        <Card className={cn(glass, "divide-y divide-border/50")}>
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">Invite your instructors</p>
              <p className="mt-0.5 text-2xs text-muted-foreground">
                {school.seatsUsed} of {school.seats}{" "}
                {school.seats === 1 ? "seat" : "seats"} used on your plan.
              </p>
            </div>
            <Link href="/schools/settings" className={cn(buttonVariants({ size: "sm" }), "press")}>
              Invite
            </Link>
          </div>
          {school.partnerSchoolId === null ? (
            <div className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">Link your referral code</p>
                <p className="mt-0.5 text-2xs text-muted-foreground">
                  Already sending learners to K53 Mentor? Link the code and your earnings show up
                  here.
                </p>
              </div>
              <Link
                href="/schools/settings"
                className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "press")}
              >
                Link
              </Link>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
