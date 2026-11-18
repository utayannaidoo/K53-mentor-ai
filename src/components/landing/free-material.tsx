import Link from "next/link";
import { ArrowRight, BookOpen, ListChecks, Signpost, Timer } from "lucide-react";
import { GUIDES } from "@/app/guides/guides";
import { QUESTION_PAGES } from "@/lib/content/question-pages";
import { VERIFIED_SIGNS } from "@/lib/content/signs";

/**
 * The free material, linked from the home page itself.
 *
 * The landing page used to link none of it: every call to action went to the
 * app, and the guides, sign library, question pages and free test were
 * reachable only from the footer. A visitor (or an AdSense reviewer) landing on
 * "/" saw a product pitch and nothing to read. Counts come from the catalogues
 * so the copy cannot drift from what the pages hold.
 *
 * A server component on purpose: VERIFIED_SIGNS carries the sign catalogue,
 * which must not ride into a client bundle.
 */

const POPULAR_GUIDES = [
  "how-the-k53-learners-test-works",
  "k53-pass-mark-and-test-format",
  "which-licence-code-8-10-14",
  "k53-driving-test",
];

export function FreeMaterial() {
  const cards = [
    {
      href: "/free-quiz",
      icon: Timer,
      title: "Free practice test",
      body: "Ten real K53 learner's test questions, scored, with the reasoning after every answer.",
    },
    {
      href: "/road-signs",
      icon: Signpost,
      title: "South African road signs",
      body: `${VERIFIED_SIGNS.length} signs from the official manual, grouped by family, each with what it means and what you must do.`,
    },
    {
      href: "/k53-questions",
      icon: ListChecks,
      title: "K53 questions and answers",
      body: `${QUESTION_PAGES.length} topics, from road signs to vehicle controls, with the reasoning behind every answer written out.`,
    },
    {
      href: "/guides",
      icon: BookOpen,
      title: "K53 guides",
      body: `${GUIDES.length} guides on the test format, booking, licence codes, the yard test and the rules learners most often get wrong.`,
    },
  ];
  const popular = POPULAR_GUIDES.map((slug) => GUIDES.find((g) => g.slug === slug)).filter(
    (g): g is (typeof GUIDES)[number] => Boolean(g),
  );

  return (
    <section id="free-material" className="mx-auto max-w-[1120px] scroll-mt-20 px-6 py-16">
      <div className="mb-[42px] max-w-[640px]">
        <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
          Free, no account needed
        </span>
        <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
          Start reading right now
        </h2>
        <p className="mt-4 text-pretty text-[1.05rem] leading-[1.55] text-muted-foreground">
          Everything here is free to read without signing up, and written against the National Road
          Traffic Act, the Department of Transport&apos;s road-sign manual and the K53 test
          procedure.{" "}
          <Link href="/sources" className="underline underline-offset-4 hover:text-foreground">
            See our sources
          </Link>
          .
        </p>
      </div>

      <ul className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(248px,1fr))]">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="glass hover-elevate group flex h-full flex-col rounded-[18px] p-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-primary/20 to-primary/[0.07] text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]">
                <c.icon className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="font-display text-[17px] font-semibold tracking-[-0.01em] text-foreground">
                {c.title}
              </span>
              <span className="mt-2 flex-1 text-pretty text-[0.93rem] leading-[1.55] text-muted-foreground">
                {c.body}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {popular.length > 0 && (
        <div className="mt-8 text-sm">
          <h3 className="font-semibold text-foreground">Popular guides</h3>
          <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {popular.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="inline-block py-0.5 text-primary underline-offset-4 hover:underline"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
