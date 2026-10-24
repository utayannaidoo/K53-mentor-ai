import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { GUIDES } from "./guides";

export const metadata: Metadata = {
  title: "K53 guides: learner's test, driving test & road signs",
  description:
    "Plain-English guides to the South African K53 learner's and driver's licence: how the test works, pass marks, rules of the road, the yard test, and which licence code you need.",
};

export default function GuidesIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "K53 guides", path: "/guides" }]),
          itemListSchema(
            "K53 learner's and driver's licence guides",
            GUIDES.map((g) => ({ name: g.title, path: `/guides/${g.slug}` })),
          ),
        ]}
      />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="container max-w-3xl py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight">K53 guides</h1>
        <p className="mt-3 text-muted-foreground">
          Everything first-time test takers ask us, answered in plain English — no memorandum
          dumps, no outdated forum answers.
        </p>
        <ul className="mt-10 space-y-5">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                  {g.title}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{g.description}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Read the guide <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-muted-foreground">
          Rather practise than read?{" "}
          <Link href="/k53-questions" className="font-medium text-primary underline underline-offset-4">
            K53 questions and answers
          </Link>
          {" · "}
          <Link href="/road-signs" className="font-medium text-primary underline underline-offset-4">
            every road sign explained
          </Link>
          {" · "}
          <Link href="/free-quiz" className="font-medium text-primary underline underline-offset-4">
            free practice test
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
