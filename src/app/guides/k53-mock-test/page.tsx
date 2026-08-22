import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "K53 mock tests: how to practise like it's test day",
  description:
    "Answering random questions isn't the same as being ready. Here's how to run a timed, scored K53 mock test that rehearses the real per-section pass rules.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="k53-mock-test"
      title="K53 mock tests: how to practise like it's test day"
      updated="2026-08-22"
      intro="Working through practice questions is study. A mock is a rehearsal — same format, same clock, same scoring — and it's the rehearsal that tells you whether test day will go your way."
    >
      <section>
        <h2>Mock vs random practice</h2>
        <p>
          Ten questions over coffee check whether you recognise the material.
          They don't check whether you can sit still, pick the best of four
          options and move on — sixty-four times in a row, on a clock, while a
          score sheet fills in. Random practice trains recall; a mock trains
          performance. Both matter, but only one looks like the test.
        </p>
      </section>
      <section>
        <h2>Rehearse the real exam conditions</h2>
        <p>
          The learner's test is <strong>64 multiple-choice questions</strong> in
          three sections, and you typically get about an hour to work through
          them:
        </p>
        <ul>
          <li>
            <strong>Vehicle controls</strong> — 8 questions, pass mark{" "}
            <strong>6</strong>
          </li>
          <li>
            <strong>Road signs, signals &amp; markings</strong> — 28 questions,
            pass mark <strong>23</strong>
          </li>
          <li>
            <strong>Rules of the road</strong> — 28 questions, pass mark{" "}
            <strong>22</strong>
          </li>
        </ul>
        <p>
          So sit every mock the way you'll sit the real paper: one uninterrupted
          block, timer running, nothing looked up mid-question. Each pause to
          check an answer is a habit the exam room won't permit.
        </p>
      </section>
      <section>
        <h2>Mark yourself the way the examiner will</h2>
        <p>
          You need the pass mark in <strong>every section separately</strong> —
          a good overall total rescues nothing. The combined requirement works
          out to <strong>51 of 64</strong> (about 80%), but the distribution
          decides the result: 28/28 on signs with 21/28 on rules is a fail,
          despite a total most learners would celebrate. Score each section
          against its own bar and treat any section under its minimum as a fail
          no matter how the rest went. There's no negative marking, so never
          leave a blank — an unanswered question is a free mark given away.
        </p>
      </section>
      <section>
        <h2>What mocks expose</h2>
        <ul>
          <li>
            <strong>Time pressure on signs.</strong> Twenty-eight sign, signal
            and marking questions punish slow plate-reading. If you decode each
            sign from scratch, the clock becomes the enemy long before your
            knowledge does.
          </li>
          <li>
            <strong>Misreading the qualifier words.</strong>{" "}
            <em>Must</em>, <em>must not</em> and <em>may</em> decide answers,
            and rushing swaps them silently. Most "silly mistakes" are these
            three words.
          </li>
          <li>
            <strong>Second-guessing right instincts.</strong> Track what happens
            when you change an answer. For most people the changes net out
            worse — the first read is better trained than it feels under
            pressure.
          </li>
        </ul>
      </section>
      <section>
        <h2>Between mocks: repair, don't just repeat</h2>
        <p>
          A mock that shows you where you're weak has already earned its hour.
          Spend the days after it drilling those categories specifically instead
          of queueing another full paper immediately — short, spaced sessions on
          your worst material move accuracy far more than another 64 questions
          crammed into the same evening. Then mock again and compare sections,
          not totals: the number that matters is your weakest section's margin
          over its pass mark.
        </p>
      </section>
      <section>
        <h2>When are you ready?</h2>
        <p>
          Not when one mock goes well — when every section clears its pass mark
          with room to spare, across consecutive papers. Scraping through
          controls while acing signs is a coin-flip waiting for test day;
          consistent margin in all three sections is what survives nerves, a
          strange chair and a slower clock than home.
        </p>
        {/* /study/* is auth-gated — organic readers landing here from search
            were sent to a login screen. The free assessment is the public
            entry point. */}
        <p>
          Not sure where you stand? K53 Mentor's{" "}
          <Link href="/onboarding">free assessment</Link> scores you the way the
          examiner will — per section — and builds your study plan around the
          sections that need the work.
        </p>
      </section>
    </LegalPage>
  );
}
