import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { Card } from "@/components/ui/card";
import { PartnerApplyForm } from "@/components/partners/apply-form";
import { cn, glass, glassSubtle } from "@/lib/utils";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";
import { MONEY_BACK_DAYS } from "@/lib/billing/refund-policy";
import { FREE_TRIAL_DAYS } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "For driving schools — earn R20 per learner",
  description: `Refer your learners to ${APP_NAME} and earn R20 for every one who subscribes. Free to join, no contract, and your learners get ${FREE_TRIAL_DAYS * 2} days free instead of ${FREE_TRIAL_DAYS}.`,
};

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
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="container pt-12 text-center sm:pt-16 lg:pt-20">
          <p className="text-2xs font-medium uppercase tracking-wide text-primary">
            Driving school partners
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Earn R20 for every learner you send who subscribes.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            You already tell your learners how to pass. This pays you for it — and gets them double
            the free trial while they study for the test you are preparing them for.
          </p>
        </section>

        <section className="container mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title} className={cn(glass, "p-5")}>
              <p className="font-display text-sm font-semibold text-primary tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-display text-base font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </Card>
          ))}
        </section>

        <section className="container mt-12 sm:mt-16">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                What your learners get
              </h2>
              <p className="text-sm text-muted-foreground">
                This is the part worth repeating in class, because it is the reason a learner
                actually types your code in.
              </p>
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

              <h2 className="pt-4 font-display text-xl font-semibold tracking-tight">
                How you get paid
              </h2>
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
                  private link showing your numbers at any time — no login, no app to check.
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
