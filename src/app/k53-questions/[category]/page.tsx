import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import { signQuestionAlt } from "@/lib/content/sign-alt";
import { signImageDimensions } from "@/lib/content/signs-dimensions";
import {
  QUESTION_PAGES,
  questionPageBySlug,
  questionsFor,
} from "@/lib/content/question-pages";

/**
 * K53 questions and answers for one category, readable without an account.
 *
 * "K53 questions and answers" is the single most common thing a learner
 * searches, and the bank was entirely behind the app — so the site had the
 * answers and no page that said so. Each question is in the HTML with its
 * answer and reasoning in a native <details>, which needs no JavaScript and is
 * still indexed.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return QUESTION_PAGES.map((p) => ({ category: p.slug }));
}

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const page = questionPageBySlug(category);
  if (!page) return {};
  const count = questionsFor(page.categoryId).length;
  const title = `K53 ${page.topic} questions and answers (free)`;
  const description = `${count} K53 learner's licence test questions on ${page.topic}, each with the correct answer and the reasoning behind it. Free to read, no signup.`;
  const path = `/k53-questions/${page.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}

export default async function QuestionCategoryPage({ params }: Props) {
  const { category } = await params;
  const page = questionPageBySlug(category);
  if (!page) notFound();

  const questions = questionsFor(page.categoryId);
  const path = `/k53-questions/${page.slug}`;
  const others = QUESTION_PAGES.filter((p) => p.slug !== page.slug);

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "K53 questions and answers", path: "/k53-questions" },
            { name: page.topic, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Quiz",
            name: `K53 ${page.topic} questions and answers`,
            url: `${SITE_URL}${path}`,
            inLanguage: "en-ZA",
            isAccessibleForFree: true,
            about: { "@type": "Thing", name: `K53 learner's licence test: ${page.topic}` },
            educationalLevel: "beginner",
            hasPart: questions.map((q) => ({
              "@type": "Question",
              eduQuestionType: "Multiple choice",
              text: q.prompt,
              ...(q.image && { image: `${SITE_URL}${q.image}` }),
              suggestedAnswer: q.options
                .filter((_, i) => i !== q.correctIndex)
                .map((text) => ({ "@type": "Answer", text })),
              acceptedAnswer: {
                "@type": "Answer",
                text: q.options[q.correctIndex],
                answerExplanation: { "@type": "Comment", text: q.explanation },
              },
            })),
          },
        ]}
      />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="container max-w-3xl flex-1 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link
            href="/k53-questions"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            K53 questions and answers
          </Link>
        </nav>
        <h1 className="mt-4 text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          K53 {page.topic} questions and answers
        </h1>
        <p className="mt-3 text-muted-foreground">{page.intro}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {questions.length} questions below, each with the correct answer and why it is correct.
          Try to answer before you open it — recognising the right answer once you have seen it is
          not the same as knowing it.
        </p>

        <ol className="mt-10 space-y-6">
          {questions.map((q, i) => {
            const dims = q.image ? signImageDimensions(q.image) : undefined;
            return (
              <li key={q.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h2 className="font-display text-base font-semibold leading-snug text-foreground">
                  <span className="mr-2 tabular-nums text-muted-foreground">{i + 1}.</span>
                  {q.prompt}
                </h2>
                {q.image && (
                  <span className="mt-4 flex h-32 w-32 items-center justify-center rounded-xl border border-border bg-white p-2">
                    <Image
                      src={q.image}
                      alt={signQuestionAlt(q.image, q.categoryId)}
                      width={dims?.w ?? 256}
                      height={dims?.h ?? 256}
                      sizes="128px"
                      className="h-full w-full object-contain"
                    />
                  </span>
                )}
                <ul className="mt-4 list-[upper-alpha] space-y-1.5 pl-6 text-sm leading-relaxed text-muted-foreground">
                  {q.options.map((option) => (
                    <li key={option}>{option}</li>
                  ))}
                </ul>
                <details className="mt-4 border-t border-border pt-3 text-sm">
                  <summary className="cursor-pointer font-medium text-primary">
                    Show the answer
                  </summary>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">
                      {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}
                    </strong>
                  </p>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{q.explanation}</p>
                </details>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Reading answers is not practice
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            The real test shuffles the questions and the options. Take the free 10-question
            practice test — scored, no signup — and see which section would let you down.
          </p>
          <Link href="/free-quiz" className={cn(buttonVariants({ size: "lg" }), "mt-6 gap-2")}>
            Take the free practice test <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <nav aria-label="More K53 question topics" className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            More K53 questions by topic
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed">
            {others.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/k53-questions/${p.slug}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  K53 {p.topic} questions and answers
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
