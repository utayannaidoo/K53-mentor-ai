import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Content sources",
  description: "Where K53 Mentor AI's study content comes from and how it's checked.",
};

export default function SourcesPage() {
  return (
    <LegalPage
      title="Content sources"
      updated="2 July 2026"
      intro={`Everything you study in ${APP_NAME} is aligned to official South African road-traffic material. This page lists what our content is based on and how we keep it honest.`}
    >
      <section>
        <h2>Primary sources</h2>
        <ul>
          <li>
            <strong>The National Road Traffic Act 93 of 1996</strong> and the National Road
            Traffic Regulations — the legal foundation for the rules of the road, speed limits,
            distances, licence codes and vehicle requirements our questions test.
          </li>
          <li>
            <strong>The official K53 learner&apos;s and driving licence syllabus</strong> —
            including the learner&apos;s test structure (vehicle controls, road signs &amp;
            markings, rules of the road) and the K53 defensive-driving system.
          </li>
          <li>
            <strong>The Department of Transport&apos;s K53 practical test volumes</strong> — the
            source for our yard-test and road-test module procedures for light vehicles,
            motorcycles (Codes A1/A) and heavy vehicles (Codes 10/14), including manoeuvres such
            as the slow ride, incline start, alley docking and coupling/uncoupling.
          </li>
          <li>
            <strong>Official South African road traffic signage</strong> (SADC road sign system) —
            the sign images shown in the app follow the official signage series used in the K53
            manual.
          </li>
        </ul>
      </section>

      <section>
        <h2>How our content is written</h2>
        <p>
          Our questions, flashcards, scenarios and licence-prep guides are original works written
          against the sources above — we do not reproduce the official manual&apos;s text. Facts
          with legal weight (distances, speed limits, blood-alcohol limits, licence codes) are
          cross-checked against the Act and current regulatory summaries before publication.
        </p>
      </section>

      <section>
        <h2>Test format</h2>
        <p>
          Our mock exams mirror the official learner&apos;s test format: 64 questions split across
          vehicle controls (8), road signs &amp; markings (28) and rules of the road (28), with
          section-level pass requirements. Actual test administration can vary by testing centre.
        </p>
      </section>

      <section>
        <h2>Accuracy & corrections</h2>
        <ul>
          <li>
            Road legislation and test administration change. Where a figure is safety- or
            exam-critical, verify it against the current official K53 manual or the Act itself.
          </li>
          <li>
            {APP_NAME} is not affiliated with or endorsed by the RTMC or the Department of
            Transport.
          </li>
          <li>
            Spotted an error? Tell us through your account page — verified corrections ship in the
            next content update.
          </li>
        </ul>
      </section>
    </LegalPage>
  );
}
