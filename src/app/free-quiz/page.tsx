import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { FreeQuiz } from "@/components/landing/free-quiz";
import { EXAM_FORMAT } from "@/lib/constants";
import { STARTER_QUESTIONS } from "@/lib/content/starter";
import { MIX, QUIZ_SIZE, pickQuestions } from "@/lib/quiz/free-quiz";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";

/**
 * Free practice quiz — no signup, no paywall.
 *
 * The link-in-bio destination for social traffic. Sending that traffic to the
 * homepage spends it on a signup wall; this spends it on proof, and asks only
 * once the learner has seen where they stand.
 */

export const metadata: Metadata = {
  title: "Free K53 learner's licence practice test — 10 real questions",
  description:
    "Answer 10 real K53 questions free, with no signup, and see which of the three test sections would let you down. Road signs, rules of the road and vehicle controls.",
  alternates: { canonical: "/free-quiz" },
};

// The ten questions are picked on the server so the first one is in the HTML;
// before this the page was 120 words and a "Loading…" box to anything that
// did not run the script. Re-picking every ten minutes keeps the page on the
// CDN while a learner who comes back later still meets a different set.
export const revalidate = 600;

export default function FreeQuizPage() {
  const questions = pickQuestions(STARTER_QUESTIONS);
  const { signs, rules, controls } = EXAM_FORMAT.sections;

  return (
    // `bg-app` because the quiz card is a glass surface, and glass without
    // atmosphere behind it reads as flat grey. `flex-1` keeps the footer at the
    // bottom on the results screen, which is shorter than the viewport.
    <div className="flex min-h-dvh flex-col bg-app">
      <JsonLd data={breadcrumbSchema([{ name: "Free K53 practice test", path: "/free-quiz" }])} />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="container max-w-2xl flex-1 py-16">
        <h1 className="text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          Free K53 practice test
        </h1>
        <p className="mt-3 text-muted-foreground">
          Ten real questions from the K53 bank, with the reasoning explained after every answer. No
          signup, no card — and at the end you&apos;ll see which section would let you down.
        </p>

        <div className="mt-8">
          <FreeQuiz questions={questions} />
        </div>

        <div className="mt-12 space-y-8 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground">
          <section>
            <h2>What these ten questions cover</h2>
            <p>
              The quiz is the real paper in miniature. The learner&apos;s test has{" "}
              {EXAM_FORMAT.totalQuestions} questions, and these {QUIZ_SIZE} keep roughly the same
              balance: {MIX.signs} on road signs and markings, {MIX.rules} on rules of the road and{" "}
              {MIX.controls} on vehicle controls. They are drawn at random and the answer options
              are shuffled, and the set changes through the day, so coming back later is a new
              quiz rather than a memory exercise.
            </p>
            <p>
              <strong className="text-foreground">Road signs and markings.</strong> You are shown a
              sign, a signal or a line painted on the road and asked what it means or what you must
              do. Knowing the name is not enough, because the test asks for the action. If this is
              where you drop marks, start with{" "}
              <Link href="/guides/k53-road-signs-explained">how sign shapes and colours work</Link>.
            </p>
            <p>
              <strong className="text-foreground">Rules of the road.</strong> Who goes first at an
              intersection, where you may stop or park, how much following distance to leave and
              how to respond to a hazard ahead. These questions describe a situation and ask what
              the law expects of you. The{" "}
              <Link href="/guides/k53-rules-of-the-road">rules of the road guide</Link> covers the
              ones that come up most.
            </p>
            <p>
              <strong className="text-foreground">Vehicle controls.</strong> Which control does
              what, and when you use it. It is the smallest section and the easiest to
              underestimate. The{" "}
              <Link href="/guides/k53-vehicle-controls">vehicle controls guide</Link> goes through
              them one by one.
            </p>
          </section>

          <section>
            <h2>How to read your result</h2>
            <p>
              At the end you get a score out of {QUIZ_SIZE} and a bar for each section. Look at the
              bars first. On the real test a good total does not save you: you need{" "}
              {signs.pass} of {signs.questions} on signs, {rules.pass} of {rules.questions} on
              rules and {controls.pass} of {controls.questions} on controls, each one separately.
              With only {controls.questions} controls questions, you can afford just{" "}
              {controls.questions - controls.pass} wrong answers there. One more fails the whole
              test, however well the other two sections went.
            </p>
            <p>
              So a section where you missed half the questions here is the one to study first,
              even if your overall score looks fine. Ten questions are a signal and not a
              prediction. They are enough to show you where to look, and too few to tell you that
              you are ready.
            </p>
          </section>

          <section>
            <h2>What to do after the quiz</h2>
            <p>
              Read the explanation under every answer, including the ones you got right. A right
              answer for the wrong reason will not survive a differently worded question. Then
              come back for a fresh set, or go through the{" "}
              <Link href="/k53-questions">K53 questions and answers</Link> one topic at a time.
            </p>
            <p>
              When single questions feel easy, sit a full-length paper under test conditions.{" "}
              <Link href="/guides/k53-mock-test">How to practise with a K53 mock test</Link> explains what a
              mock result does and does not tell you, and{" "}
              <Link href="/guides/how-the-k53-learners-test-works">
                how the learner&apos;s test works
              </Link>{" "}
              covers the day itself.
            </p>
          </section>
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-base font-semibold text-foreground">
            How the real test is scored
          </h2>
          <p className="mt-2">
            The learner&apos;s test is {EXAM_FORMAT.totalQuestions} questions in three sections —{" "}
            {EXAM_FORMAT.sections.controls.questions} on vehicle controls,{" "}
            {EXAM_FORMAT.sections.signs.questions} on road signs and{" "}
            {EXAM_FORMAT.sections.rules.questions} on rules of the road — and you must reach the
            pass mark in <strong>each section separately</strong>. That is why a strong total is
            not enough on its own.
          </p>
          <p className="mt-2">
            <Link href="/guides/k53-pass-mark-and-test-format" className="text-primary underline">
              Read how the pass marks work
            </Link>{" "}
            or{" "}
            <Link href="/road-signs" className="text-primary underline">
              browse every road sign
            </Link>
            . Want to read rather than be tested? See the{" "}
            <Link href="/k53-questions" className="text-primary underline">
              K53 questions and answers
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
