import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXAM_FORMAT, SECTION_LABEL } from "@/lib/constants";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { QUESTION_PAGES, questionsFor } from "@/lib/content/question-pages";

/**
 * Hub for the public question-and-answer pages — the landing for "K53
 * questions and answers" and "learner's licence test questions".
 */

const TOTAL = QUESTION_PAGES.reduce((n, p) => n + questionsFor(p.categoryId).length, 0);

export const metadata: Metadata = {
  title: "K53 learner's test questions and answers — free",
  description: `${TOTAL} K53 learner's licence questions with answers and explanations, grouped by topic: road signs, rules of the road, vehicle controls, intersections, parking and more. Free, no signup.`,
  alternates: { canonical: "/k53-questions" },
};

export default function QuestionsHubPage() {
  const sections = EXAM_FORMAT.sections;
  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "K53 questions and answers", path: "/k53-questions" }]),
          itemListSchema(
            "K53 learner's licence test questions by topic",
            QUESTION_PAGES.map((p) => ({
              name: `K53 ${p.topic} questions and answers`,
              path: `/k53-questions/${p.slug}`,
            })),
          ),
        ]}
      />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="container max-w-3xl flex-1 py-16">
        <h1 className="text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          K53 learner&apos;s licence test questions and answers
        </h1>
        <p className="mt-3 text-muted-foreground">
          {TOTAL} real practice questions for the South African learner&apos;s licence test, each
          with the correct answer and the reasoning behind it. Free to read, grouped by the topics
          the test examines.
        </p>

        <ul className="mt-10 space-y-5">
          {QUESTION_PAGES.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/k53-questions/${p.slug}`}
                className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                  K53 {p.topic} questions and answers
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.intro}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {questionsFor(p.categoryId).length} questions <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-12 rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-base font-semibold text-foreground">
            How many questions are in the real test?
          </h2>
          <p className="mt-2">
            The learner&apos;s licence test is {EXAM_FORMAT.totalQuestions} multiple-choice
            questions in three sections, and you must reach the pass mark in each one separately:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              {SECTION_LABEL.controls}: {sections.controls.questions} questions, pass mark{" "}
              {sections.controls.pass}
            </li>
            <li>
              {SECTION_LABEL.signs}: {sections.signs.questions} questions, pass mark{" "}
              {sections.signs.pass}
            </li>
            <li>
              {SECTION_LABEL.rules}: {sections.rules.questions} questions, pass mark{" "}
              {sections.rules.pass}
            </li>
          </ul>
          <p className="mt-2">
            <Link href="/guides/k53-pass-mark-and-test-format" className="text-primary underline">
              How the pass marks work
            </Link>
            {" · "}
            <Link href="/road-signs" className="text-primary underline">
              Every road sign and what it means
            </Link>
            {" · "}
            <Link href="/guides" className="text-primary underline">
              All K53 guides
            </Link>
          </p>
        </section>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Want it scored like the real thing?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Ten questions, free, no signup — and at the end you see which of the three sections
            would have failed you.
          </p>
          <Link href="/free-quiz" className={cn(buttonVariants({ size: "lg" }), "mt-6 gap-2")}>
            Take the free practice test <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
