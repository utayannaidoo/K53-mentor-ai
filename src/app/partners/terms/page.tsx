import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";
import { MONEY_BACK_DAYS } from "@/lib/billing/refund-policy";
import { FREE_TRIAL_DAYS } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Driving school partner terms",
  description: `The terms of the ${APP_NAME} driving school referral programme: R20 per converted learner, when it is paid, and when it is not.`,
};

export default function PartnerTermsPage() {
  return (
    <LegalPage
      title="Driving school partner terms"
      updated="2026-09-15"
      intro={`These terms cover the ${APP_NAME} referral programme for driving schools. The short version: you get a code, you hand it to your learners, and you earn R20 for every one of them who subscribes and keeps their subscription past the refund window. It is free to join and you can stop at any time.`}
    >
      <section>
        <h2>1. What you earn</h2>
        <ul>
          <li>
            <strong>R20 for each learner</strong> who signs up using your code or link and then
            subscribes to a paid plan.
          </li>
          <li>
            <strong>The amount is flat.</strong> It is R20 whichever plan the learner chooses and
            whether they pay monthly or annually.
          </li>
          <li>
            <strong>Once per learner, ever.</strong> It is paid on a learner&apos;s first
            subscription payment, not on renewals, and the same learner cannot be earned from twice.
          </li>
          <li>
            A learner can only be credited to one school, and only if they had never paid for{" "}
            {APP_NAME} before using your code.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. When it is paid</h2>
        <ul>
          <li>
            Every learner may request a refund within <strong>{MONEY_BACK_DAYS} days</strong> of
            paying. Your R20 therefore becomes payable{" "}
            <strong>{MONEY_BACK_DAYS + 1} days</strong> after their payment, not immediately.
          </li>
          <li>
            Payments are made by <strong>EFT, monthly</strong>, once your balance is at least{" "}
            <strong>R100</strong>. Anything below that carries forward.
          </li>
          <li>
            You can see your signups, conversions and balance at any time on your private statement
            link. We also email it to you monthly.
          </li>
          <li>
            We need your banking details to pay you. They are stored for that purpose only, and
            are never shared.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. When it is not paid</h2>
        <ul>
          <li>
            <strong>If the learner gets a refund or reverses the charge</strong>, the R20 falls
            away. If it had already been paid to you, it is deducted from your next payment.
          </li>
          <li>
            <strong>Referring yourself, your staff, or accounts you control</strong> is not
            permitted, and neither is creating accounts on learners&apos; behalf.
          </li>
          <li>
            <strong>Posting your code publicly</strong> — to a deals site, a coupon page, or a group
            unrelated to your school — is outside the programme. The code is for the learners you
            teach.
          </li>
          <li>
            Where signups look unrelated to real teaching, we may hold the affected earnings while
            we check, and we will tell you why. We may replace your code or end the arrangement,
            but we will not withhold money that was properly earned.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. What your learners get</h2>
        <p>
          Your learners pay exactly the same price as everyone else — your code is not a discount
          and costs them nothing. For using it they receive{" "}
          <strong>{FREE_TRIAL_DAYS * 2} days of free trial instead of {FREE_TRIAL_DAYS}</strong> and
          250 confidence points. We tell them clearly that your school is credited.
        </p>
      </section>

      <section>
        <h2>5. Tax</h2>
        <p>
          What we pay you is a marketing referral fee. You are responsible for declaring it and for
          any tax due on it. We do not deduct tax from these payments, and we are happy to provide a
          statement of what we have paid you for your records.
        </p>
      </section>

      <section>
        <h2>6. Changes and ending the arrangement</h2>
        <ul>
          <li>
            Either of us can end this at any time, for any reason. If you stop, we still pay
            everything already earned.
          </li>
          <li>
            If we change the rate or the rules, we will tell you before it takes effect, and
            anything already earned is paid at the rate it was earned at.
          </li>
          <li>
            These terms sit alongside our{" "}
            <Link href="/terms">terms of service</Link> and{" "}
            <Link href="/privacy">privacy policy</Link>.
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          Anything about the programme, a payment, or your numbers:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
