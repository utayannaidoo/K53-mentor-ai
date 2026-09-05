import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "AARTO demerit points: rollout status and what learners should know",
  description:
    "AARTO rollout dates have changed. Check the official government status before relying on a demerit-system commencement date.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="aarto-demerit-points"
      title="AARTO demerit points, explained"
      updated="2026-09-05"
      intro="AARTO rollout dates and phases have changed. Treat commencement dates as time-sensitive: check the official government status before relying on one."
    >
      <section>
        <h2>What AARTO is</h2>
        <p>
          AARTO — the <strong>Administrative Adjudication of Road Traffic Offences</strong> — is the
          system intended to handle traffic infringements and a demerit-point scheme. Its national
          rollout has changed more than once, so this guide does not present a fixed commencement
          date as settled law.
        </p>
      </section>
      <section>
        <h2>Check the current official status</h2>
        <p>
          The Department of Transport announced a revised rollout, while later government material
          describes the demerit system as a later phase. Read the{" "}
          <a href="https://www.gov.za/documents/administrative-adjudication-road-traffic-offences-act">official AARTO Act status</a>{" "}
          and the Department of Transport&apos;s{" "}
          <a href="https://www.gov.za/news/speeches/minister-barbara-creecy-road-safety-practitioners-colloquium-02-sep-2026">latest published rollout update</a>{" "}
          before relying on a start date or a points threshold.
        </p>
      </section>
      <section>
        <h2>Why learners should still pay attention</h2>
        <p>
          AARTO is separate from the K53 learner's paper. The useful immediate lesson is simpler:
          driving-law obligations and enforcement rules can change, so follow current official notices
          once you are on the road rather than relying on an old study note.
        </p>
      </section>
      <section>
        <h2>What to study now</h2>
        <p>
          Focus on the K53 syllabus: right-of-way order, stopping rules, speed limits and road signs.
          Those rules help you pass and remain relevant regardless of changes to the administrative
          enforcement schedule.{" "}
          {/* /study/* is auth-gated — organic readers landing here from search
              were sent to a login screen. The free assessment is the public
              entry point. */}
          <Link href="/onboarding">Practise the rules of the road</Link> to build both at once.
        </p>
      </section>
      <section>
        <h2>Is this on the learner's test?</h2>
        <p>
          AARTO is not part of the K53 learner's question paper. Treat it as time-sensitive legal
          context, not exam-cramming material.
        </p>
      </section>
    </LegalPage>
  );
}
