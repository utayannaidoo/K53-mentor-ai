import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What K53 Mentor AI collects, why, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="2 July 2026"
      intro={`This policy explains what ${APP_NAME} collects, why we collect it, and the choices you have. We collect as little as we can get away with — your study data exists to teach you, not to sell you.`}
    >
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account details</strong> — your name and email address, used to create and
            secure your account.
          </li>
          <li>
            <strong>Study profile</strong> — your licence goal, vehicle code, test date(s) and the
            answers you give during onboarding, used to personalise your plan.
          </li>
          <li>
            <strong>Study activity</strong> — question attempts, flashcard reviews, mock-exam
            results, scenario answers and streaks, used to compute your readiness and schedule
            revision.
          </li>
          <li>
            <strong>Tutor conversations</strong> — messages you send to the AI tutor, used to
            generate replies and keep your conversation history.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where your data lives</h2>
        <p>
          Your study data is stored locally in your browser and, on a full account, synced to our
          database (hosted on Supabase) so you can continue on other devices. In the local demo
          mode, everything stays in your browser — clearing your browser data erases it.
        </p>
      </section>

      <section>
        <h2>Payments</h2>
        <p>
          Payments are processed by Paystack. Your card number never touches our servers — we receive
          only confirmation of payment and the subscription status needed to unlock your plan.
        </p>
      </section>

      <section>
        <h2>AI processing</h2>
        <p>
          When you use the AI tutor, the content of your question (and a short summary of your
          study context, such as your weak categories) is sent to our AI provider to generate the
          reply. We do not send your name, email or payment details with tutor requests.
        </p>
      </section>

      <section>
        <h2>Cookies & local storage</h2>
        <p>
          We use local storage for the things that make the app work: your session, your study
          progress cache, and preferences like dark mode and data-saver. We do not run third-party
          advertising trackers.
        </p>
      </section>

      <section>
        <h2>Your rights (POPIA)</h2>
        <p>
          Under the Protection of Personal Information Act you may ask what personal information we
          hold about you, ask us to correct it, or ask us to delete it. You can delete your study
          progress yourself at any time from Account → Reset all progress, and deleting your
          account removes your personal information from our systems within a reasonable period.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>
          We keep your data for as long as your account is active. If your account is inactive for
          an extended period we may delete it after notice to your email address.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The service is intended for people preparing for a South African learner&apos;s or
          driving licence (16 years and older). We do not knowingly collect information from
          children under 16.
        </p>
      </section>

      <section>
        <h2>Changes & contact</h2>
        <p>
          If this policy changes materially we&apos;ll note it here with a new date. Questions or
          requests about your personal information can be sent to us via your account page.
        </p>
      </section>
    </LegalPage>
  );
}
