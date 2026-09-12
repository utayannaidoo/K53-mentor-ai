"use client";

import * as React from "react";
import Link from "next/link";
import { Award, CalendarClock, PartyPopper } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  formatTestDate,
  isTestToday,
  testOutcomeDue,
  LICENCE_LABEL,
  TEST_LABEL,
} from "@/lib/licence/test-day";
import { cn, glassSubtle } from "@/lib/utils";
import { DISPLAY_NAME_MAX, TESTIMONIAL_MAX, TESTIMONIAL_MIN } from "@/lib/testimonial";
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
          <TestimonialAsk kind={kind} />
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

/**
 * The one moment a testimonial is worth asking for: they have just told us
 * they passed. Optional, below the celebration's own actions, and it never
 * blocks the dialog.
 *
 * Publishing someone's words beside their name is a separate use of their
 * personal information under POPIA, so the consent toggle is off by default
 * and the send button stays disabled until it is on. Nothing is published
 * automatically: the quote is emailed to support for a human to read.
 */
function TestimonialAsk({ kind }: { kind: TestKind }) {
  const [quote, setQuote] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");

  const tooShort = quote.trim().length < TESTIMONIAL_MIN;

  async function send() {
    if (tooShort || !consent || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/testimonial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          quote: quote.trim(),
          displayName: displayName.trim() || undefined,
          consent: true,
          kind,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="mt-5 text-sm text-muted-foreground">
        Thank you &mdash; that means a lot to the next learner facing the same test.
      </p>
    );
  }

  return (
    <div className={cn(glassSubtle, "mt-5 w-full rounded-2xl border p-4 text-left")}>
      <p className="text-sm font-semibold text-foreground">Help the next learner?</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        One line about what made the difference. We read every one, and nothing is published
        without the tick below.
      </p>
      {/* Mirrors the Input primitive's field styling (16px text, so iOS does
          not zoom on focus). A multi-line variant does not exist yet and this
          is its only use. */}
      <textarea
        value={quote}
        onChange={(e) => setQuote(e.target.value.slice(0, TESTIMONIAL_MAX))}
        rows={3}
        maxLength={TESTIMONIAL_MAX}
        placeholder="I failed twice before. Seeing my section scores showed me rules was the problem, not signs."
        aria-label="Your testimonial"
        className="mt-3 w-full rounded-lg border border-input bg-card/70 px-3.5 py-2.5 text-base leading-relaxed text-foreground caret-primary shadow-sm backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-200 ease-soft placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-primary focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
      />
      <Input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={DISPLAY_NAME_MAX}
        placeholder="First name (optional)"
        aria-label="First name to publish it under"
        className="mt-2"
      />
      <div className="mt-3 flex items-start gap-3">
        <Switch
          checked={consent}
          onChange={setConsent}
          label="Allow K53 Mentor to publish this testimonial with my first name"
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          You may publish this, with my first name only.
        </span>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-danger">
          That did not send. Try again in a moment, or skip it &mdash; your result is already saved.
        </p>
      )}
      <Button
        className="mt-3 w-full"
        disabled={tooShort || !consent}
        loading={status === "sending"}
        loadingText="Sending"
        onClick={send}
      >
        Send it
      </Button>
    </div>
  );
}
