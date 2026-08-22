import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Booking your learner's licence: DLTC, documents & validity",
  description:
    "Where and how to book your learner's licence test, which documents to take to the DLTC, what happens at the eye test, and why your learner's lasts 24 months.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="book-your-learners-licence"
      title="Booking your learner's licence: DLTC, documents & validity"
      updated="2026-08-22"
      intro="Booking is admin, not an exam — but arrive without the right paperwork and it becomes a wasted trip. Here's the whole errand: where to book, what to bring, what your eyes need to prove, and what your learner's lets you do once you hold it."
    >
      <section>
        <h2>Book at a driving licence testing centre</h2>
        <p>
          Learner's tests are run at a <strong>Driving Licence Testing Centre
          (DLTC)</strong> — in practice, your municipality's licensing arm.
          Some municipalities take bookings online through the national eNaTIS
          or Natis systems, others still work on walk-in queues — check how
          yours handles it and book early either way, because metro slots are
          scarce and can sit weeks away. When you book, ask for the current
          document checklist while you're at it; requirements vary slightly by
          centre and drift over time.
        </p>
      </section>
      <section>
        <h2>What to take with you</h2>
        <ul>
          <li>
            Your <strong>green barcoded ID book or smart ID card</strong>, plus
            a certified copy (a passport serves if you're not an SA citizen).
          </li>
          <li>
            <strong>ID photos</strong> — two identical photos is the common ask,
            but the count varies by centre and some photograph you there;
            confirm when booking.
          </li>
          <li>
            <strong>Proof of residence</strong>, where your centre requires it.
          </li>
          <li>
            The application form itself is completed at the centre — bring a pen
            and arrive early enough to fill it in.
          </li>
        </ul>
      </section>
      <section>
        <h2>What it costs</h2>
        <p>
          Fees are set per municipality and change, so we won't quote a rand
          amount — any figure printed elsewhere may already be stale. Ask your
          DLTC for the current fee when you book, and check whether payment
          happens at booking, on the day, or both.
        </p>
      </section>
      <section>
        <h2>The eye test</h2>
        <p>
          Part of the application is an eyesight screening at the centre,
          checked against the standard for the class you're applying for. Bring
          your glasses or contact lenses if you wear any — needing correction is
          noted as a condition on your licence, not a reason to fail. If the
          screening shows a problem, you'll typically be referred to an
          optometrist before you can proceed.
        </p>
      </section>
      <section>
        <h2>How old you must be</h2>
        <p>
          Minimum ages differ by class: <strong>16</strong> for a motorcycle up
          to 125&nbsp;cc (code A1), <strong>17</strong> for light motor vehicles
          (code B, still widely called code 8), and <strong>18</strong> for
          heavy vehicles. Book the class that matches the licence you're working
          towards.
        </p>
      </section>
      <section>
        <h2>After you pass: 24 months, supervision, L plates</h2>
        <ul>
          <li>
            A learner's licence is valid for <strong>24 months</strong>. Pass
            your driving test inside that window — let it lapse and you reapply
            and write again from scratch.
          </li>
          <li>
            While you drive on it, a driver licensed for that class must
            supervise you, seated next to you where the vehicle has a seat beside
            the driver.
          </li>
          <li>
            L plates go up front and rear — and motorcycle learners may carry no
            passenger at all.
          </li>
        </ul>
        <p>
          What the test itself contains is a separate question —{" "}
          <Link href="/guides/how-the-k53-learners-test-works">
            how the K53 learner's test works
          </Link>{" "}
          walks through the paper section by section.
        </p>
        {/* /study/* is auth-gated — organic readers landing here from search
            were sent to a login screen. The free assessment is the public
            entry point. */}
        <p>
          Once you're booked, K53 Mentor's{" "}
          <Link href="/onboarding">free assessment</Link> shows you which of the
          three sections needs the work between now and test day.
        </p>
      </section>
    </LegalPage>
  );
}
