import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund & cancellation policy",
  description: `How to cancel, when you're eligible for a refund, and how ${APP_NAME} handles billing disputes.`,
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund & cancellation policy"
      updated="13 July 2026"
      intro={`This policy explains how to cancel your ${APP_NAME} subscription, when you can get a refund, and how we handle billing disputes. The short version: you can cancel yourself at any time in a couple of taps, we never bill you again after that, and if something went wrong with a charge we'll make it right.`}
    >
      <section>
        <h2>1. Cancelling your subscription</h2>
        <ul>
          <li>
            You can cancel <strong>at any time</strong>, yourself, from{" "}
            <strong>Account → Billing &amp; plan → Cancel plan</strong>. No email, phone call or
            notice period is required.
          </li>
          <li>
            Cancelling <strong>stops all future billing immediately</strong> — your card is never
            charged again once you cancel.
          </li>
          <li>
            On cancellation your account returns to the <strong>Free plan</strong>. Your study
            progress, streak and readiness score are always kept — cancelling never deletes your
            data.
          </li>
          <li>
            Cancel <strong>within 7 days</strong> of your first payment and your refund is issued{" "}
            <strong>automatically</strong> as you cancel — see section 2.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Refunds</h2>
        <ul>
          <li>
            <strong>7-day money-back, automatically.</strong> If you cancel within{" "}
            <strong>7 days</strong> of your first subscription payment, we refund it{" "}
            <strong>in full, automatically</strong> — right from{" "}
            <strong>Account → Billing</strong>, with no need to email us.
          </li>
          <li>
            <strong>Incorrect, duplicate or unrecognised charges are refunded in full.</strong> If
            you were charged twice, charged after cancelling, or don&apos;t recognise a charge,
            email us (see section 4) and we&apos;ll investigate and refund any error in full.
          </li>
          <li>
            <strong>One-off purchases</strong> (such as AI tutor top-up packs) are refundable only
            where the credits have not yet been used — email us and we&apos;ll sort it out.
          </li>
          <li>
            Refunds are made to your <strong>original payment method</strong> through Paystack, and
            typically clear within <strong>5–10 business days</strong> depending on your bank.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. If you&apos;re unhappy — disputes</h2>
        <p>
          If you&apos;re unhappy with a charge or the service, please <strong>contact us first</strong>{" "}
          — it&apos;s almost always the fastest way to sort things out. We aim to acknowledge every
          billing query within <strong>2 business days</strong> and to resolve it within{" "}
          <strong>7 business days</strong>. If you paid by card and notice a problem, reaching out
          to us before raising a chargeback with your bank usually gets the money back to you
          sooner.
        </p>
        <p>
          Nothing in this policy limits the rights you have under the South African{" "}
          <strong>Consumer Protection Act</strong> or the{" "}
          <strong>Electronic Communications and Transactions Act</strong>.
        </p>
      </section>

      <section>
        <h2>4. How to request a refund or raise a dispute</h2>
        <p>
          Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          from the email address on your account. To help us act quickly, please include:
        </p>
        <ul>
          <li>the email address your account uses;</li>
          <li>the approximate date and amount of the charge; and</li>
          <li>the Paystack payment reference, if you have it (it&apos;s on your receipt email).</li>
        </ul>
      </section>

      <section>
        <h2>5. Related policies</h2>
        <p>
          This policy sits alongside our{" "}
          <Link href="/terms" className="text-primary underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
          . Payments are processed securely by Paystack; your card details never touch our servers.
        </p>
      </section>
    </LegalPage>
  );
}
