import Link from "next/link";
import { CalendarClock, AlertCircle, ArrowRight } from "lucide-react";
import { daysUntil } from "@/lib/utils";
import type { OnboardingData } from "@/types";

/** One or two countdown/reminder rows — two when the learner is chasing both
 * the learner's and driver's tests, since those are booked separately. */
export function TestCountdown({ onboarding }: { onboarding: OnboardingData | null }) {
  if (!onboarding) return null;

  const items =
    onboarding.goal === "both"
      ? [
          { label: "Learner's test", date: onboarding.testDate },
          { label: "Driver's test", date: onboarding.driversTestDate },
        ]
      : [
          {
            label: onboarding.goal === "drivers" ? "Driver's test" : "Learner's test",
            date: onboarding.testDate,
          },
        ];

  return (
    <div className="mb-5 flex flex-col gap-2.5">
      {items.map((item) => (
        <CountdownRow key={item.label} label={item.label} date={item.date} />
      ))}
    </div>
  );
}

function CountdownRow({ label, date }: { label: string; date: string | null }) {
  const days = daysUntil(date);
  const upcoming = date && days !== null && days >= 0;

  if (upcoming) {
    return (
      <Link
        href="/study/mock-exam"
        className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/[0.08] px-4 py-3 text-sm transition-colors hover:bg-accent/15"
      >
        <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
        <span className="font-medium text-foreground">
          {label} is in {days} {days === 1 ? "day" : "days"}.
        </span>
        <span className="hidden text-muted-foreground sm:inline">Keep your daily plan going.</span>
        <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    );
  }

  // Either never booked, or the date has slipped into the past — both need a nudge.
  return (
    <Link
      href="/account?edit=profile"
      className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/[0.08] px-4 py-3 text-sm transition-colors hover:bg-warning/15"
    >
      <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
      <span className="font-medium text-foreground">
        {date ? `Your ${label.toLowerCase()} date has passed.` : `You haven't booked your ${label.toLowerCase()} yet.`}
      </span>
      <span className="hidden text-muted-foreground sm:inline">
        {date ? "Update it to keep your plan accurate." : "Book it to lock in your study plan."}
      </span>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
