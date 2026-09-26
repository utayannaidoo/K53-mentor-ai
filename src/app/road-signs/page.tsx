import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { SignBrowser } from "@/components/shared/sign-browser";
import { VERIFIED_SIGNS } from "@/lib/content/signs";
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

        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Knowing the signs is not the same as passing
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            The computerised test shuffles the questions and the answers, so recognising a sign in
            a list is not enough. Find out which sections would fail you today — 15 questions, no
            card needed.
          </p>
          <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "mt-6 gap-2")}>
            Start free assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
