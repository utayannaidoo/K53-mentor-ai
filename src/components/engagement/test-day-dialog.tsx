"use client";

import * as React from "react";
import Link from "next/link";
import { Award, CalendarClock, PartyPopper } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  formatTestDate,
  isTestToday,
  testOutcomeDue,
  LICENCE_LABEL,
  TEST_LABEL,
} from "@/lib/licence/test-day";
import { cn } from "@/lib/utils";
import type { TestKind } from "@/types";

/**
 * Test day: the one question the app cannot answer for itself.
 *
 * Every other number here is derived from something the learner did in the
 * product. Whether they walked out of the licensing department with a licence
 * is not, and the whole last rung of the Driver Rank ladder depends on it — so
 * on the day a booked test arrives, the app asks.
 *
 * Both tests are asked about, each about itself. Which one is owed comes from
 * `testOutcomeDue`, because the goal decides which onboarding field even holds
 * the date (see `bookedTests`) — this component is told, it does not guess.
 *
 * Three answers, because two would be a lie. "Passed" and "not this time" are
 * the outcomes; "not written yet" is the truth for anyone whose test moved, and
 * without it the only way past a modal on a stressful morning would be to claim
 * something untrue about the most important fact in the account.
 *
 * A pass swaps the dialog for a celebration rather than closing it. The Driving
 * Passport turns gold at that moment and it is the one time in this product
 * someone genuinely wants to show it to people, so the next step is offered
 * while the news is still new.
 */
export function TestDayDialog() {
  const { ready, accountHydrated, state, recordLicenceResult, deferLicenceQuestion } =
    useStudyStore();
  // The answer carries its own test. Recording a result is exactly what makes
  // the prompt stop being due, so the follow-up screen cannot read the question
  // back out of the store — and re-deriving it during render would compare two
  // freshly built objects and loop forever.
  const [answered, setAnswered] = React.useState<{
    kind: TestKind;
    result: "passed" | "failed";
  } | null>(null);

  // `accountHydrated` is not optional here. Before it flips, `licence` reflects
  // an empty local store rather than the account — so a learner who already
  // answered on their phone would be asked again, on every desktop sign-in,
  // about a test they have a licence for.
  const due = ready && accountHydrated ? testOutcomeDue(state) : null;
  const close = () => setAnswered(null);

  if (answered?.result === "passed") {
    const kind = answered.kind;
    return (
      <Dialog open onClose={close} label="Licence achieved">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <PartyPopper className="h-7 w-7" />
          </span>
          <p className="mt-4 text-2xs font-semibold uppercase tracking-[0.2em] text-success">
            {LICENCE_LABEL[kind]}
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
            Congratulations.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {kind === "drivers"
              ? "That is the whole road, start to finish — and the one thing in here nothing could give you but the test itself."
              : "That is the last rank on the road — the one nothing in here could give you."}{" "}
            Your Driving Passport has the stamp on it now.
          </p>
          <Link
            href="/dashboard/progress"
            onClick={close}
            className={cn(buttonVariants(), "mt-5 w-full gap-1.5")}
          >
            <Award className="h-4 w-4" /> See your passport
          </Link>
          <Button variant="ghost" className="mt-2 w-full" onClick={close}>
            Not now
          </Button>
        </div>
      </Dialog>
    );
  }

  if (answered?.result === "failed") {
    return (
      <Dialog open onClose={close} label="Test result recorded">
        <h2 className="pr-8 font-display text-xl font-semibold tracking-tight">
          Then you go again.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Most people who pass have sat it more than once. Everything you have built is still
          here — book the next date and we will aim the plan at whatever caught you out.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href="/account" onClick={close} className={cn(buttonVariants(), "w-full gap-1.5")}>
            <CalendarClock className="h-4 w-4" /> Set a new test date
          </Link>
          <Button variant="outline" className="w-full" onClick={close}>
            Back to studying
          </Button>
        </div>
      </Dialog>
    );
  }

  if (!due) return null;
  const { kind, testDate } = due;
  const answer = (result: "passed" | "failed") => {
    recordLicenceResult(kind, result, testDate);
    setAnswered({ kind, result });
  };

  return (
    <Dialog open onClose={() => deferLicenceQuestion(kind)} label="How did your test go?">
      <p className="text-2xs font-semibold uppercase tracking-[0.2em] text-primary">
        {isTestToday(testDate) ? "Test day" : `Your booked ${TEST_LABEL[kind]}`}
      </p>
      <h2 className="mt-1.5 pr-8 font-display text-xl font-semibold tracking-tight">
        How did it go?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your {TEST_LABEL[kind]} was booked for{" "}
        <span className="font-medium text-foreground">{formatTestDate(testDate)}</span>. Tell us
        how it went and we will set the app straight.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button className="w-full gap-1.5" onClick={() => answer("passed")}>
          <Award className="h-4 w-4" /> I passed
        </Button>
        <Button variant="outline" className="w-full" onClick={() => answer("failed")}>
          Not this time
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => deferLicenceQuestion(kind)}>
          I haven&apos;t written it yet
        </Button>
      </div>
    </Dialog>
  );
}
