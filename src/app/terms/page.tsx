import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply when you use K53 Mentor AI.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="2026-08-08"
      intro={`These terms apply when you use ${APP_NAME}. They're written to be read — the short version: we help you study, we don't write the test for you, and we ask you to use the service honestly.`}
    >
      <section>
        <h2>1. What the service is</h2>
        <p>
          {APP_NAME} is a study aid for the South African K53 learner&apos;s and driving licence
          tests. It provides practice questions, flashcards, scenarios, mock exams, licence-prep
          guides and an AI tutor, personalised to your progress.
        </p>
      </section>

      <section>
        <h2>2. What the service is not</h2>
        <ul>
          <li>
            We are <strong>not affiliated with or endorsed by</strong> the RTMC, the Department of
            Transport, or any Driving Licence Testing Centre.
          </li>
          <li>
            Using the app does <strong>not guarantee</strong> that you will pass any test. Your
            result depends on your preparation and performance on the day, and{" "}
            <strong>a test result is not a ground for a refund</strong> — see our{" "}
            <a href="/refunds" className="underline">
              Refund &amp; Cancellation Policy
            </a>
            .
          </li>
          <li>
            The app is a <strong>study aid, not a legal reference</strong>. Test content and road
            legislation change; always verify critical details against the current official K53
            manual and the National Road Traffic Act.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          You are responsible for the accuracy of your account details and for keeping your login
          credentials safe. One account is for one person — your study plan only works when the
          history behind it is yours.
        </p>
      </section>

      <section>
        <h2>4. Subscriptions & billing</h2>
        <ul>
          <li>
            Paid plans are billed monthly or annually. One plan covers every licence code —
            car (Code 08), motorcycle (A/A1) and heavy (10/14) — and you can switch which one
            you study at any time from your account, at no extra charge.
          </li>
          <li>Prices are shown in South African Rand and may change with notice.</li>
          <li>
            Paid plans renew automatically — monthly or yearly, depending on the cycle you choose —
            until you cancel.
          </li>
          <li>
            You can cancel any time from your billing page. Billing stops immediately and you keep
            full access until the end of the period you have already paid for, after which your
            account returns to the Free plan. Cancel within 7 days of your first payment and you
            are refunded in full automatically, in which case access ends with the refund — see our{" "}
            <a href="/refunds" className="underline">
              Refund &amp; Cancellation Policy
            </a>
            .
          </li>
          <li>
            Where the app runs in demo mode, no charges are made and paid features are unlocked for
            evaluation only.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Acceptable use</h2>
        <ul>
          <li>Don&apos;t resell, scrape or bulk-copy the study content.</li>
          <li>Don&apos;t attempt to break, overload or reverse-engineer the service.</li>
          <li>Don&apos;t use the AI tutor to generate harmful or unlawful content.</li>
        </ul>
      </section>

      <section>
        <h2>6. Intellectual property</h2>
        <p>
          The app, its design and its original study content belong to {APP_NAME}. Road traffic
          signage and the rules of the road are public regulatory material; our questions,
          explanations and guides are original works aligned to them.
        </p>
      </section>

      <section>
        <h2>7. Liability</h2>
        <p>
          The service is provided &quot;as is&quot;. To the maximum extent permitted by law, we are
          not liable for indirect or consequential loss arising from your use of the app —
          including the outcome of any official test or anything that happens on a road. Nothing
          in these terms limits rights you have under the Consumer Protection Act.
        </p>
      </section>

      <section>
        <h2>8. Termination</h2>
        <p>
          You may stop using the service and delete your account at any time. We may suspend or
          close accounts that break these terms, with a refund of any unused subscription period
          where the closure wasn&apos;t caused by abuse.
        </p>
      </section>

      <section>
        <h2>9. Governing law</h2>
        <p>These terms are governed by the laws of the Republic of South Africa.</p>
      </section>

      <section>
        <h2>10. Changes</h2>
        <p>
          If we change these terms materially, we&apos;ll update the date above and, for
          significant changes, notify you in the app.
        </p>
      </section>
    </LegalPage>
  );
}
