import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { PublicAdSlot } from "@/components/ads/public-ad-slot";
import { Footer } from "@/components/landing/footer";
import { SignBrowser } from "@/components/shared/sign-browser";
import { VERIFIED_SIGNS } from "@/lib/content/signs";
import { SIGN_CATEGORIES } from "@/lib/content/sign-categories";
import {
  INFORMATION_GROUP,
  SIGN_CATEGORY_PAGES,
  signCount,
} from "@/lib/content/sign-category-pages";
import { SignSections } from "@/components/shared/sign-entry";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { EXAM_FORMAT } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Public road-sign library — no signup, no paywall.
 *
 * Two jobs. It is the link-in-bio destination for social traffic, which arrives
 * from a video about one sign and bounces off anything that asks for an account
 * first. And it is an evergreen search page: people look up South African road
 * signs all year, and a set with sourced meanings is worth more over time than
 * any single video.
 *
 * VERIFIED_SIGNS, not SIGNS: only hand-verified names are fit to index. See the
 * note on that export.
 */

export const metadata: Metadata = {
  title: "South African road signs — every K53 sign and what it means",
  description:
    "Browse South African road signs from the official K53 manual: regulatory, warning, information, guidance and road markings — with what each one means. Free, no signup.",
  alternates: { canonical: "/road-signs" },
};

export default function RoadSignsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "South African road signs", path: "/road-signs" }]),
          itemListSchema(
            "South African road signs and their meanings",
            SIGN_CATEGORY_PAGES.map((p) => ({ name: p.h1, path: `/road-signs/${p.slug}` })),
          ),
        ]}
      />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="container max-w-5xl flex-1 py-16">
        <h1 className="text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          South African road signs
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {VERIFIED_SIGNS.length} signs from the official K53 manual, each with what it actually
          means on the road. Search by name, or filter by the shape and colour you remember. Free
          to browse — no signup.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Road signs are the section that fails the most learners: you are allowed only{" "}
          {EXAM_FORMAT.sections.signs.questions - EXAM_FORMAT.sections.signs.pass} wrong out of{" "}
          {EXAM_FORMAT.sections.signs.questions}.
        </p>

        <div className="mt-8">
          <SignBrowser signs={VERIFIED_SIGNS} initialFilter="all" />
        </div>

        <PublicAdSlot className="mt-12" />

        {/* The browser above opens each sign in a dialog, which has no URL.
            These are the crawlable pages: one per family, every sign on it in
            full. They replaced 151 single-sign pages; see
            src/lib/content/sign-category-pages.ts. */}
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Every sign, by family
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each page shows every sign in the family with what it means and what you must do,
            grouped the way the official manual groups them.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {SIGN_CATEGORY_PAGES.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/road-signs/${p.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                    {p.label}
                  </span>
                  <span className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {signCount(p)} {p.noun}
                  </span>
                  <span className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {SIGN_CATEGORIES.find((c) => c.id === p.category)?.blurb}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    See every {p.label.toLowerCase().replace(/s$/, "")}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Eight signs are too few for a page of their own, so they live here. */}
        <section id="information-signs" className="mt-16 scroll-mt-24">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Information signs and plates
          </h2>
          {INFORMATION_GROUP.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
          <SignSections group={INFORMATION_GROUP} headingLevel={3} />
        </section>

        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Knowing the signs is not the same as passing
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            The computerised test shuffles the questions and the answers, so recognising a sign in
            a list is not enough. Practise them as the test asks them — free, no card needed, and
            no test before you start.
          </p>
          <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "mt-6 gap-2")}>
            Start studying free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
