import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { GUIDES } from "./guides";

export const metadata: Metadata = {
  title: "K53 guides — how the learner's test works, pass marks & licence codes",
  description:
    "Plain-English guides to the South African K53 learner's licence: how the test works, the pass marks per section, and which licence code you actually need.",
};

export default function GuidesIndexPage() {
  return (
    <>
      <MarketingNav />
      <main className="container max-w-3xl py-16">
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
      </main>
      <Footer />
    </>
  );
}
