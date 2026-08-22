import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Failed the learner's licence test? What happens next",
  description:
    "Failing is common and fixable. How rebooking works, why your marks sheet matters, what a retest costs, and how to turn a near-miss into a pass next sitting.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="failed-learners-test"
      title="Failed the learner's licence test? What happens next"
      updated="2026-08-22"
      intro="A fail stings more than it costs. You leave the centre with a marks sheet that names the section which fell short — and that sheet is the most useful study document you'll ever be handed."
    >
      <section>
        <h2>First: failing is common</h2>
        <p>
          The learner's test is deliberately unforgiving — you need the pass
          mark in all three sections separately, and nationally the pass rate
          has been reported at around <strong>40%</strong> since computerised
          testing rolled out. Whatever the figure is in your province, a large
          share of first-timers are turned away, plenty of them people who went
          on to pass comfortably second time. One result says nothing about the
          next one; what matters is what you change between sittings.
        </p>
      </section>
      <section>
        <h2>You leave with a marks sheet — keep it</h2>
        <p>
          A fail isn't a bare verdict. You receive a{" "}
          <strong>marks sheet</strong> recording how you performed against each
          of the three sections — vehicle controls, signs, signals and
          markings, and rules of the road — so it shows exactly which one fell
          short. Photograph it and keep it: rebooking without reading it is how
          people fail identically twice.
        </p>
        <p>
          To sit again you rebook at a DLTC and pay the{" "}
          <strong>retest fee</strong> — amounts are set locally and change, so
          confirm the current fee with your centre when booking. There's no
          nationally fixed cooling-off period in our material either: you can
          usually rebook straight away, and available slots determine when you
          actually sit. Get both answers from your DLTC rather than assuming.
        </p>
      </section>
      <section>
        <h2>Your future learner's licence clock hasn't started</h2>
        <p>
          A learner's licence is issued only when you pass, and its{" "}
          <strong>24-month validity</strong> runs from the day you pass — not
          the day you first applied or sat a failed attempt. Failed tries don't
          start the clock, shorten it, or expire anything; you're simply
          unlicensed until a pass prints the licence. Take the retry seriously,
          but don't let anyone tell you a fail has burned your window.
        </p>
      </section>
      <section>
        <h2>Diagnose before you rebook</h2>
        <p>
          Most failures are one weak section wearing a total's disguise. The
          bars are independent: <strong>6 of 8</strong> on vehicle controls,{" "}
          <strong>23 of 28</strong> on signs, signals and markings,{" "}
          <strong>22 of 28</strong> on rules of the road. Your marks sheet
          shows which bar you missed — and lifting one weak section beats
          restudying all three evenly every time. The full scoring mechanics
          are in our{" "}
          <Link href="/guides/k53-pass-mark-and-test-format">
            pass mark &amp; format guide
          </Link>
          .
        </p>
      </section>
      <section>
        <h2>A targeted plan for the retry</h2>
        <ul>
          <li>
            <strong>Fix the failing section first.</strong> Spend your first
            sessions drilling it specifically — that's where every recovered
            mark lives.
          </li>
          <li>
            <strong>Then rehearse whole papers.</strong> Full timed mocks under
            real conditions — see{" "}
            <Link href="/guides/k53-mock-test">how to run a proper mock</Link>{" "}
            — because a repaired section still has to survive 64 questions on a
            clock.
          </li>
          <li>
            <strong>Space it out.</strong> Short daily sessions beat weekend
            cramming; recall consolidates between sessions, not during
            marathons.
          </li>
        </ul>
        <p>
          No honest course can guarantee a pass — but a retry aimed at a
          diagnosed weakness is a different exam from a blind repeat of the
          last one.
        </p>
        {/* /study/* is auth-gated — organic readers landing here from search
            were sent to a login screen. The free assessment is the public
            entry point. */}
        <p>
          K53 Mentor's <Link href="/onboarding">free assessment</Link> finds
          the section that cost you the pass, then builds your retry's study
          plan around it until it clears its mark with room to spare.
        </p>
      </section>
    </LegalPage>
  );
}
