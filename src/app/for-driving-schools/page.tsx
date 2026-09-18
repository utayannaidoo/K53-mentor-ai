import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PartnerApplyForm } from "@/components/partners/apply-form";
import { cn, glass, glassFloat, glassSubtle } from "@/lib/utils";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";
import { MONEY_BACK_DAYS } from "@/lib/billing/refund-policy";
import { FREE_TRIAL_DAYS } from "@/lib/billing/plans";
import {
  SCHOOL_ANNUAL_MONTHS_CHARGED,
  SCHOOL_PLANS,
  SCHOOL_TRIAL_DAYS,
  schoolAnnualZar,
  seatLabel,
} from "@/lib/billing/school-plans";
import { modulesForLicence } from "@/lib/schools/modules";

/**
 * Two offers on one page, software first.
 *
 * The school workspace is the product; the R20-per-learner referral programme
 * is how an existing partner earns alongside it. Every number on this page is
 * read from the code that enforces it — prices and the trial from
 * school-plans.ts, manoeuvre counts from the K53 content itself, the refund
 * hold from refund-policy.ts — so the page cannot promise what the product
 * doesn't do. That is also why nothing here claims automatic reminders (they
 * are one-tap WhatsApp messages) or an export (not built yet).
 */

export const metadata: Metadata = {
  title: "For driving schools — run your school from your phone",
  description: `${APP_NAME} for Schools: one diary for every instructor and car, every learner's K53 progress, and who owes you what. ${SCHOOL_TRIAL_DAYS} days free, no card.`,
};

const SIGN_UP = `/signup?next=${encodeURIComponent("/schools/start")}`;

const PROBLEMS = [
  {
    title: "The diary is a book or a WhatsApp scroll",
    body: "Two instructors book the same car. A reschedule gets lost in a chat. Nobody can see tomorrow except the person holding the book.",
  },
  {
    title: "Who paid lives in your head",
    body: "Cash in the car, EFTs with no reference, a package half used. At month end you can't say who still owes what.",
  },
  {
    title: "Nobody can say who's ready",
    body: "Is Thabo ready for his test, or does his alley docking still need work? It depends which instructor you ask.",
  },
];

const FEATURES = [
  {
    title: "One diary",
    points: [
      "Every instructor and every vehicle, on your phone.",
      "It refuses to book a person or a car twice — two people booking at once can't both win.",
      "Done, no-show or cancelled in one tap. A WhatsApp confirmation, already typed.",
    ],
  },
  {
    title: "Every learner",
    points: [
      "Their next lesson, and what it should start with.",
      "Notes from the last lesson, whoever taught it.",
      "Test date, testing centre, and the documents they still need to bring.",
    ],
  },
  {
    title: "Who owes you",
    points: [
      "Lesson packages, cash, EFT, card and SnapScan.",
      "Who owes what, largest first, with a reminder that has the amount typed in.",
      "Nothing is ever edited or deleted — a mistake is voided with a reason, and stays on the record.",
    ],
  },
  {
    title: "Enquiries and test day",
    points: [
      "Who to call back today, so a WhatsApp enquiry never goes cold.",
      "Every test attempt recorded, so your pass rate is one you can defend.",
      "An owner's report: lessons, money, no-shows and who's test-ready.",
    ],
  },
];

const FAQ = [
  {
    q: "Does it work on my phone?",
    a: "It's built for a phone in a car — big buttons, one hand, nothing to install. Open it in your browser and add it to your home screen.",
  },
  {
    q: "My learners pay cash.",
    a: "Record cash, EFT, card or SnapScan against a learner or a package. Instructors can record money they're handed; only you or the office can void a payment, and a voided payment stays on the record with the reason.",
  },
  {
    q: "Who can see my learners' details?",
    a: "Only the people in your school. Another school can't see or book your learners, instructors or vehicles. We never ask for a full ID number — the last four digits are enough to tell two learners apart.",
  },
  {
    q: "I'm the only instructor.",
    a: "That's what the Solo plan is for. Everything works the same, for one diary.",
  },
  {
    q: "What happens if I stop paying?",
    a: "Nothing is deleted. Your diary, learners and payments stay readable — you just can't add or change anything until you start again. Your records are your business, and we won't hold them hostage.",
  },
  {
    q: "Do my learners need to install anything?",
    a: "No. The school side works on its own. Learners who want to study for the learner's test can use the K53 Mentor app separately.",
  },
];

const STEPS = [
  {
    title: "We give you a code",
    body: "A short code and a link, both yours. Put the code on the whiteboard, share the link in your class WhatsApp group — whichever suits how you teach.",
  },
  {
    title: "Your learners use it",
    body: `They pay the same price everyone pays. What they get for using your code is ${FREE_TRIAL_DAYS * 2} days free instead of ${FREE_TRIAL_DAYS}, and a head start on their progress score.`,
  },
  {
    title: "You earn R20 each",
    body: "Every learner of yours who subscribes earns you R20 — flat, whichever plan they pick, monthly or annual. Paid by EFT, once a month.",
  },
];

export default function ForDrivingSchoolsPage() {
  const manoeuvres = {
    car: modulesForLicence("8").length,
    motorcycle: modulesForLicence("A").length,
    heavy: modulesForLicence("14").length,
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="container pt-12 text-center sm:pt-16 lg:pt-20">
          <p className="text-2xs font-medium uppercase tracking-wide text-primary">
            {APP_NAME} for Schools
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Run your driving school from your phone.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            The diary, the money, and every learner&apos;s K53 progress in one place — so you always
            know who&apos;s booked, who&apos;s paid, and who&apos;s ready for their test.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={SIGN_UP} className={cn(buttonVariants({ size: "lg" }), "press")}>
              Start free for {SCHOOL_TRIAL_DAYS} days
            </Link>
            <Link href="#pricing" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "press")}>
              See pricing
            </Link>
          </div>
          <p className="mt-3 text-2xs text-muted-foreground">
            No card needed · bring your whole team · works on any phone
          </p>
        </section>

        {/* ── The problem ──────────────────────────────────────────────── */}
        <section className="container mt-14 grid gap-4 sm:mt-20 sm:grid-cols-3">
          {PROBLEMS.map((p) => (
            <Card key={p.title} className={cn(glassSubtle, "p-5")}>
              <h2 className="font-display text-base font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </Card>
          ))}
        </section>

        {/* ── What it does ─────────────────────────────────────────────── */}
        <section className="container mt-14 sm:mt-20">
          <h2 className="text-center font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Everything a driving school keeps track of
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Card key={f.title} className={cn(glass, "p-5")}>
                <h3 className="font-display text-base font-semibold">{f.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {f.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span aria-hidden className="text-primary">
                        ·
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* ── K53 ──────────────────────────────────────────────────────── */}
        <section className="container mt-14 sm:mt-20">
          <Card className={cn(glassFloat, "mx-auto max-w-3xl p-6 sm:p-8")}>
            <p className="text-2xs font-medium uppercase tracking-wide text-primary">
              Built on the K53 yard test
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
              Not a booking app. A driving school app.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              After a lesson, rate each manoeuvre you covered — introduced, developing, test-ready —
              and tick the faults you saw straight from that manoeuvre&apos;s own K53 failure
              criteria. Nothing to type. Every learner&apos;s card then shows exactly where they
              stand, and what the next lesson should start with.
            </p>
            <p className="mt-4 text-sm">
              <strong className="tabular-nums">{manoeuvres.car}</strong> car manoeuvres ·{" "}
              <strong className="tabular-nums">{manoeuvres.motorcycle}</strong> motorcycle ·{" "}
              <strong className="tabular-nums">{manoeuvres.heavy}</strong> heavy vehicle
            </p>
          </Card>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="container mt-14 scroll-mt-24 sm:mt-20">
          <h2 className="text-center font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Priced by instructors, not learners
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
            Unlimited learners, lessons and vehicles on every plan. Less than one lesson a month.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SCHOOL_PLANS.map((plan) => (
              <Card key={plan.id} className={cn(plan.id === "team" ? glassFloat : glass, "flex flex-col p-5")}>
                <h3 className="font-display text-base font-semibold">{plan.name}</h3>
                <p className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground">{seatLabel(plan)}</p>
                <p className="mt-4 font-display text-3xl font-semibold tabular-nums">
                  R{plan.monthlyZar}
                  <span className="text-sm font-normal text-muted-foreground"> /month</span>
                </p>
                <p className="mt-1 text-2xs text-muted-foreground">
                  or R{schoolAnnualZar(plan).toLocaleString("en-ZA")} a year — {12 - SCHOOL_ANNUAL_MONTHS_CHARGED} months free
                </p>
                <p className="mt-4 flex-1 text-sm text-muted-foreground">{plan.blurb}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href={SIGN_UP} className={cn(buttonVariants({ size: "lg" }), "press")}>
              Start your {SCHOOL_TRIAL_DAYS}-day free trial
            </Link>
            <p className="mt-3 text-2xs text-muted-foreground">
              No card. Invite your whole team during the trial, then pick the plan that fits.
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="container mt-14 sm:mt-20">
          <h2 className="text-center font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Questions schools ask
          </h2>
          <Card className={cn(glass, "mx-auto mt-8 max-w-3xl divide-y divide-border/50")}>
            {FAQ.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {item.q}
                  <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-90">
                    ›
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </Card>
        </section>

        {/* ── Partners ─────────────────────────────────────────────────── */}
        <section id="partners" className="container mt-14 scroll-mt-24 sm:mt-20">
          <div className="text-center">
            <p className="text-2xs font-medium uppercase tracking-wide text-primary">Partner programme</p>
            <h2 className="mx-auto mt-2 max-w-2xl font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Already sending learners our way? Earn R20 for each one who subscribes.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Separate from the school app and free to join. You already tell your learners how to
              pass; this pays you for it, and gets them double the free trial on the learner app.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <Card key={step.title} className={cn(glass, "p-5")}>
                <p className="font-display text-sm font-semibold text-primary tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold tracking-tight">What your learners get</h3>
              <Card className={cn(glassSubtle, "space-y-3 p-5 text-sm")}>
                <p>
                  <strong>The same price as everyone else.</strong> Your code is not a discount and
                  never costs them anything.
                </p>
                <p>
                  <strong>{FREE_TRIAL_DAYS * 2} days free instead of {FREE_TRIAL_DAYS}.</strong> Double
                  the full free trial — the whole question bank, flashcards and mock tests, daily,
                  for two weeks.
                </p>
                <p>
                  <strong>250 confidence points.</strong> A head start on the progress score that
                  tracks how test-ready they are.
                </p>
              </Card>

              <h3 className="pt-2 font-display text-lg font-semibold tracking-tight">How you get paid</h3>
              <Card className={cn(glassSubtle, "space-y-3 p-5 text-sm")}>
                <p>
                  <strong>R20 per subscriber, flat.</strong> It does not matter which plan they
                  choose or whether they pay monthly or annually.
                </p>
                <p>
                  <strong>A short hold first.</strong> Every learner can ask for their money back
                  within {MONEY_BACK_DAYS} days, so earnings become payable{" "}
                  {MONEY_BACK_DAYS + 1} days after their payment. If someone refunds, that R20 falls
                  away.
                </p>
                <p>
                  <strong>EFT, once a month,</strong> once you have at least R100 owing. You get a
                  private link showing your numbers at any time — or link your code in the school
                  app and see them there.
                </p>
                <p className="text-muted-foreground">
                  Full details in the{" "}
                  <Link href="/partners/terms" className="text-primary underline">
                    partner terms
                  </Link>
                  , or email{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              </Card>
            </div>

            <div id="apply" className="lg:sticky lg:top-24">
              <PartnerApplyForm />
            </div>
          </div>
        </section>

        <div className="h-16" />
      </main>
      <Footer />
    </div>
  );
}
