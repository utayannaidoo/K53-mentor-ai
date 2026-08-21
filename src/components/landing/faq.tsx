import Link from "next/link";
import type { ReactNode } from "react";
import { Accordion } from "@/components/ui/accordion";

/**
 * Every item carries `answer` as PLAIN TEXT and optionally `richAnswer` as JSX.
 * The split exists because the JSON-LD schema serialises these items — a JSX
 * element stringifies into React-internal garbage ("props", "_owner"), which
 * Google reads as an invalid Answer. The schema uses the text; the accordion
 * renders the rich version when one exists.
 */
/**
 * Exported for tests/seo.test.ts, which pins `answer` staying plain text —
 * the JSON-LD schema serialises it verbatim.
 */
export const FAQ_ITEMS: {
  question: string;
  answer: string;
  richAnswer?: ReactNode;
}[] = [  {
    question: "Is this affiliated with the RTMC? Is the content official?",
    answer:
      "No. K53 Mentor AI is an independent study tool and is not affiliated with or endorsed by the RTMC, your local DLTC, or any government body. Every question and flashcard is written to match the structure and content of the official K53 manual, and each fact traces back to a cited source — but it is study material, not government-issued material.",
  },
  {
    question: "Why pay when there are free K53 apps?",
    answer:
      "Free apps hand you the same recycled question bank everyone else has and leave you to guess what to study. We have over 1,000 questions and nearly 800 flashcards, but volume isn't the point: a 15-question diagnostic finds which of the seven categories you're actually weak in, your daily plan puts those first, and spaced repetition brings them back just before you'd forget them. You're paying for a diagnosis and a plan, not more questions.",
  },
  {
    question: "Which licence codes does my subscription cover?",
    answer:
      "All of them. One price covers Code 08 (car), Code A/A1 (motorcycle) and Code 10/14 (heavy vehicle) — the vehicle you study is a setting, not something you buy. Pick it during onboarding, change it any time under Account → Study profile, and your questions, signs, flashcards, mock exams and study plan all re-tune to that code. Switching costs nothing and never touches your progress.",
  },
  {
    question: "How is my readiness score calculated?",
    answer:
      "It blends two signals: your accuracy across all seven categories, weighted the way the real test weights them (signs and rules count for the most), and how well you've mastered your flashcards, scaled by how much of the deck you've actually worked through. It updates after every session, so you can watch it move in real time. The predicted-pass figure next to it is worked out differently, and deliberately harder: the official test is 64 questions across three sections, and you have to reach the pass mark in every section, not just overall — so we work out your chance of clearing each section on its own and multiply them. That's why the two numbers can sit far apart. Strong readiness with one weak section is exactly the shape that fails on the day, and we'd rather tell you that now. Both are our own estimate from how you perform in this app — a target to study toward, not a prediction of your result on the day.",
  },
  {
    question: "Do you cover the driver's licence too, not just the learner's?",
    answer:
      "Yes — Premium Plus adds step-by-step yard-test modules covering parallel parking, alley docking, the three-point turn, the hill start, the pre-trip inspection and the observation routines examiners actually mark you on. They follow your licence code too: motorcycle learners get the slow ride, figure-of-eight and emergency swerve, and heavy learners get the air-brake check and trailer coupling.",
  },
  {
    question: "What if I don't pass?",
    answer:
      "Nothing resets. Your progress, streak and readiness score stay exactly where they are, and your plan carries on — so you can go straight back to the categories that caught you out and book again. Being straight with you: studying here doesn't guarantee a pass, no study tool can promise one, and we don't refund a subscription because a test didn't go your way. Your subscription is an ordinary monthly or annual plan — keep it running while you prepare for the retest, or cancel it yourself in a couple of taps. Plenty of people write more than once; you won't lose a day of the work you've already put in, so keep going.",
  },
  {
    question: "Can I cancel? Do you offer refunds?",
    answer:
      "Yes to both, and neither needs an email. Cancel yourself any time from Account → Billing & plan → Cancel plan: billing stops immediately and you keep full access until the end of the period you have already paid for. Cancel within 7 days of your first payment and that payment is refunded in full, automatically, as you cancel — in that case access ends with the refund. Your progress is kept either way. Duplicate or incorrect charges are always refunded too. Full details are in our Refund & Cancellation Policy.",
    richAnswer: (
      <>
        Yes to both, and neither needs an email. Cancel yourself any time from{" "}
        <strong className="font-medium text-foreground">
          Account → Billing &amp; plan → Cancel plan
        </strong>
        : billing stops immediately and you keep full access until the end of the period you have
        already paid for. Cancel within 7 days of your first payment and that payment is refunded in
        full, automatically, as you cancel — in that case access ends with the refund. Your progress
        is kept either way. Duplicate or incorrect charges are always refunded too. Full details are
        in our{" "}
        <Link href="/refunds" className="underline hover:text-foreground">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </>
    ),
  },
  {
    question: "Will it work on my phone with limited data?",
    answer:
      "Yes — it's built for exactly that. The app is mobile-first with no autoplay video and minimal imagery, and Data saver mode (under Account → Preferences) drops decorative graphics and animations. You can also download the full study pack once, on your own terms, and then keep practising without pulling it down again.",
  },
];

/**
 * Google's FAQ rich result reads this. The answers are already written and
 * already the honest ones — this just makes them machine-readable, so the
 * section that explains the pass model can surface in search rather than only
 * to someone who already scrolled here.
 */
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

/**
 * `withSchema` is opt-in, and exactly one page may opt in.
 *
 * This section renders on both `/` and `/pricing`, which meant the same
 * FAQPage block was emitted at two URLs — Google reads that as competing
 * candidates for the same rich result and can pick neither. Defaulting to off
 * means a third page rendering the FAQ can't silently reintroduce the
 * duplicate; `tests/seo.test.ts` holds the count at one.
 */
export function Faq({ withSchema = false }: { withSchema?: boolean }) {
  return (
    <section id="faq" className="border-t border-border bg-card/40">
      {withSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
        />
      )}
      <div className="container scroll-mt-20 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
            <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight">
              Straight answers, no fine print
            </h2>
          </div>
          <Accordion
            className="mt-10"
            items={FAQ_ITEMS.map((item) => ({
              question: item.question,
              answer: item.richAnswer ?? item.answer,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
