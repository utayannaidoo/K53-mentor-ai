import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { PublicAdSlot } from "@/components/ads/public-ad-slot";
import { Footer } from "@/components/landing/footer";
import { SignSections } from "@/components/shared/sign-entry";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXAM_FORMAT, SITE_URL } from "@/lib/constants";
import { JsonLd, PUBLISHER, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { PAGE_UPDATED } from "@/lib/page-dates";
import {
  SIGN_CATEGORY_PAGES,
  sectionAnchor,
  signCategoryPageBySlug,
  signCount,
  signHref,
  signsInGroup,
} from "@/lib/content/sign-category-pages";

/**
 * Every sign in one family on one page: regulatory, warning, road markings.
 *
 * These replaced 151 single-sign pages, each one meaning inside a template
 * shared with all the others. Grouped here, the meanings and the section intros
 * make a page worth reading in its own right, and each old URL redirects to its
 * sign's anchor. See src/lib/content/sign-category-pages.ts.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return SIGN_CATEGORY_PAGES.map((p) => ({ category: p.slug }));
}

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const page = signCategoryPageBySlug(category);
  if (!page) return {};
  const path = `/road-signs/${page.slug}`;
  const description = `${signCount(page)} signs. ${page.summary} Free, no signup.`;
  return {
    title: page.title,
    description,
    alternates: { canonical: path },
    openGraph: { title: page.title, description, url: path, type: "article" },
  };
}

/** "2026-11-18" → "18 November 2026", without the server's timezone shifting the day. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

export default async function SignCategoryPage({ params }: Props) {
  const { category } = await params;
  const page = signCategoryPageBySlug(category);
  if (!page) notFound();

  const path = `/road-signs/${page.slug}` as const;
  const groups = signsInGroup(page).filter((g) => g.signs.length > 0);
  const count = signCount(page);
  const others = SIGN_CATEGORY_PAGES.filter((p) => p.slug !== page.slug);
  const updated = PAGE_UPDATED[path];
  const signsSection = EXAM_FORMAT.sections.signs;

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "South African road signs", path: "/road-signs" },
            { name: page.label, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: page.h1,
            description: page.summary,
            url: `${SITE_URL}${path}`,
            dateModified: updated,
            inLanguage: "en-ZA",
            isAccessibleForFree: true,
            author: PUBLISHER,
            publisher: PUBLISHER,
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
          },
          itemListSchema(
            page.h1,
            groups.flatMap((g) =>
              g.signs.map((s) => ({ name: s.sign.name, path: signHref(s.sign, s.slug) })),
            ),
          ),
        ]}
      />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="container max-w-3xl flex-1 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/road-signs" className="font-medium text-primary underline-offset-4 hover:underline">
            South African road signs
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{page.label}</span>
        </nav>

        <h1 className="mt-4 text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          {page.h1}
        </h1>
        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
          {count} {page.noun} · Last updated: {formatDate(updated)}
        </p>
        {page.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="mt-4 leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Signs, signals and markings are {signsSection.questions} of the{" "}
          {EXAM_FORMAT.totalQuestions} questions in the learner&apos;s test, and you need{" "}
          {signsSection.pass} of them right. Each question shows a sign and asks what it means or
          what you must do, so learn the action, not only the name.
        </p>

        <nav aria-label="On this page" className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            On this page
          </h2>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {groups.map(({ section, signs }) => (
              <li key={section.heading}>
                <a
                  href={`#${sectionAnchor(section)}`}
                  className="inline-block py-0.5 text-primary underline-offset-4 hover:underline"
                >
                  {section.heading}
                </a>{" "}
                <span className="text-muted-foreground">({signs.length})</span>
              </li>
            ))}
            {page.mixUps.length > 0 && (
              <li>
                <a
                  href="#mix-ups"
                  className="inline-block py-0.5 text-primary underline-offset-4 hover:underline"
                >
                  Signs learners mix up
                </a>
              </li>
            )}
          </ul>
        </nav>

        <SignSections group={page} afterFirst={<PublicAdSlot className="mt-12" />} />

        {page.mixUps.length > 0 && (
          <section
            id="mix-ups"
            className="mt-14 scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Signs learners mix up
            </h2>
            <dl className="mt-4 space-y-4 text-sm leading-relaxed">
              {page.mixUps.map((m) => (
                <div key={m.pair}>
                  <dt className="font-semibold text-foreground">{m.pair}</dt>
                  <dd className="mt-1 text-muted-foreground">{m.detail}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <nav aria-label="More road signs" className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-xl font-semibold tracking-tight">More road signs</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {others.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/road-signs/${p.slug}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {p.label}
                </Link>{" "}
                <span className="text-muted-foreground">({signCount(p)})</span>
              </li>
            ))}
            <li>
              <Link
                href="/road-signs#information-signs"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Information signs and plates
              </Link>
            </li>
            <li>
              <Link
                href="/guides/k53-road-signs-explained"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                How shapes and colours work
              </Link>
            </li>
            <li>
              <Link
                href="/k53-questions/road-signs"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                K53 road sign questions and answers
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Practise road signs the way the test asks them
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Ten real K53 questions, free, with the reasoning after every answer, and no signup.
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
