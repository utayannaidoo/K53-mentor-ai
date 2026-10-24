import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXAM_FORMAT, SITE_URL } from "@/lib/constants";
import { JsonLd, PUBLISHER, breadcrumbSchema } from "@/lib/seo";
import { SIGN_CATEGORIES } from "@/lib/content/sign-categories";
import { signImageDimensions } from "@/lib/content/signs-dimensions";
import { describeAppearance } from "@/lib/content/sign-traits";
import {
  SIGN_FAMILY_COPY,
  SIGN_PAGES,
  signBySlug,
  signPath,
} from "@/lib/content/sign-pages";
import { STARTER_QUESTIONS } from "@/lib/content/starter";

/**
 * One page per verified road sign.
 *
 * The library at /road-signs shows each sign's meaning in a dialog, which is
 * right for browsing and invisible to search: a dialog has no URL, so "what
 * does the no entry sign mean" had nothing to land on. These pages are that
 * landing — statically generated, one sign each, with the meaning in the HTML.
 */

// Every valid slug is known at build time; anything else is a 404 rather than
// an on-demand render of an empty page.
export const dynamicParams = false;

export function generateStaticParams() {
  return SIGN_PAGES.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sign = signBySlug(slug);
  if (!sign) return {};
  const family = SIGN_FAMILY_COPY[sign.category];
  // "<name> road sign meaning" is the query, near enough verbatim.
  const title = `${sign.name} ${sign.category === "marking" ? "road marking" : "road sign"} meaning — South Africa`;
  const description = `${sign.meaning} A K53 ${family.noun} from the official manual, explained for the learner's licence test.`;
  return {
    title,
    description,
    alternates: { canonical: signPath(sign) },
    openGraph: { title, description, url: signPath(sign), type: "article" },
  };
}

export default async function SignPage({ params }: Props) {
  const { slug } = await params;
  const sign = signBySlug(slug);
  if (!sign) notFound();

  const family = SIGN_FAMILY_COPY[sign.category];
  const category = SIGN_CATEGORIES.find((c) => c.id === sign.category);
  const appearance = describeAppearance(sign);
  const dims = signImageDimensions(sign.image) ?? { w: 400, h: 400 };
  const path = signPath(sign);

  // Same subcategory first — the signs printed beside this one in the manual —
  // then the wider family.
  const sameGroup = SIGN_PAGES.filter(
    (p) => p.sign.id !== sign.id && p.sign.category === sign.category,
  );
  const related = [
    ...sameGroup.filter((p) => p.sign.subcategory === sign.subcategory),
    ...sameGroup.filter((p) => p.sign.subcategory !== sign.subcategory),
  ].slice(0, 8);

  // A starter-pack question that shows this exact sign, when there is one.
  const question = STARTER_QUESTIONS.find((q) => q.image === sign.image);

  const signsSection = EXAM_FORMAT.sections.signs;

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "South African road signs", path: "/road-signs" },
            { name: sign.name, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${sign.name}: what this road sign means`,
            description: sign.meaning,
            url: `${SITE_URL}${path}`,
            image: `${SITE_URL}${sign.image}`,
            inLanguage: "en-ZA",
            isAccessibleForFree: true,
            author: PUBLISHER,
            publisher: PUBLISHER,
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
          },
        ]}
      />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="container max-w-3xl flex-1 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/road-signs" className="font-medium text-primary underline-offset-4 hover:underline">
            South African road signs
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{category?.label ?? "Signs"}</span>
        </nav>

        <h1 className="mt-4 text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          {sign.name}: what this road sign means
        </h1>

        <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="flex h-44 w-full shrink-0 items-center justify-center rounded-xl border border-border bg-white p-4 sm:w-44">
            <Image
              src={sign.image}
              alt={`${sign.name} — South African ${family.noun}`}
              width={dims.w}
              height={dims.h}
              sizes="176px"
              priority
              className="h-full w-full object-contain"
            />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {category?.label}
              {sign.subcategory ? ` · ${sign.subcategory}` : ""}
            </p>
            <p className="mt-2 text-lg leading-relaxed text-foreground">{sign.meaning}</p>
          </div>
        </div>

        <div className="mt-10 space-y-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground">
          <section>
            <h2>What kind of sign is it?</h2>
            <p>
              {sign.name} is a {family.noun}
              {appearance ? ` — ${appearance}` : ""}. {family.rule}
            </p>
            {category && <p>{category.blurb}</p>}
          </section>

          <section>
            <h2>How it comes up in the K53 learner&apos;s test</h2>
            <p>
              Road signs, signals and markings are the largest section of the learner&apos;s licence
              test: {signsSection.questions} of the {EXAM_FORMAT.totalQuestions} questions, with a
              pass mark of {signsSection.pass}. That leaves room for only{" "}
              {signsSection.questions - signsSection.pass} wrong answers, and the section must be
              passed separately from the other two. A sign question shows you the picture and asks
              what it means or what you must do — so knowing the name is not enough; you need the
              action.
            </p>
          </section>

          {question && (
            <section>
              <h2>Test yourself</h2>
              <p className="!text-base !font-medium !text-foreground">{question.prompt}</p>
              <ul className="mt-3 list-[upper-alpha] space-y-1.5 pl-6 text-sm leading-relaxed text-muted-foreground">
                {question.options.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
              <details className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
                <summary className="cursor-pointer font-medium text-primary">Show the answer</summary>
                <p>
                  <strong className="text-foreground">
                    {String.fromCharCode(65 + question.correctIndex)}.
                  </strong>{" "}
                  {question.explanation}
                </p>
              </details>
            </section>
          )}
        </div>

        {related.length > 0 && (
          <nav aria-label="Related road signs" className="mt-12 border-t border-border pt-8">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Related road signs
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {related.map(({ sign: other, slug: otherSlug }) => (
                <li key={other.id}>
                  <Link
                    href={`/road-signs/${otherSlug}`}
                    className="flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-colors hover:border-primary/40"
                  >
                    <span className="flex h-16 w-full items-center justify-center rounded-lg bg-white p-1.5">
                      <Image
                        src={other.image}
                        alt=""
                        width={96}
                        height={96}
                        sizes="80px"
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <span className="text-xs font-medium leading-snug text-foreground">
                      {other.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm">
              <Link href="/road-signs" className="font-medium text-primary underline-offset-4 hover:underline">
                All South African road signs
              </Link>
              {" · "}
              <Link
                href="/guides/k53-road-signs-explained"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                How shapes and colours work
              </Link>
            </p>
          </nav>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Practise road signs the way the test asks them
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Ten real K53 questions, free, with the reasoning after every answer — and no signup.
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
