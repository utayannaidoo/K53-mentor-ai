import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { FreeQuiz } from "@/components/landing/free-quiz";
import { EXAM_FORMAT } from "@/lib/constants";

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

export default function FreeQuizPage() {
  return (
    // `bg-app` because the quiz card is a glass surface, and glass without
    // atmosphere behind it reads as flat grey. `flex-1` keeps the footer at the
    // bottom on the results screen, which is shorter than the viewport.
    <div className="flex min-h-dvh flex-col bg-app">
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
          <FreeQuiz />
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
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
