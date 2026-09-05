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
      updated="2026-09-05"
      intro={`Everything you study in ${APP_NAME} is aligned to official South African road-traffic material. This page lists what our content is based on and how we keep it honest.`}
    >
      <section>
        <h2>Primary sources</h2>
        <ul>
          <li>
            <a href="https://www.gov.za/documents/national-road-traffic-act"><strong>The National Road Traffic Act 93 of 1996</strong></a>{" "}
            and the National Road Traffic Regulations — the legal foundation for the rules of the
            road, speed limits, distances, licence codes and vehicle requirements our questions test.
          </li>
          <li>
            <a href="https://www.transport.gov.za/?page_id=1176"><strong>The Department of Transport learner&apos;s licence guidance</strong></a> —
            the official overview of licence codes, the application process and the three tested
            knowledge areas: vehicle controls, road signs and road rules.
          </li>
          <li>
            <a href="https://www.gov.za/documents/notices/national-road-traffic-act-k53-practical-driving-test-motor-vehicle-drivers-vol-1"><strong>The official K53 practical driving test volume for light motor vehicles</strong></a> — the
            published yard-test and road-test procedure for Code B vehicles, including incline
            starts, alley docking and parallel parking.
          </li>
          <li>
            <a href="https://www.natis.gov.za/images/learners/2_Manual_on_Road_Traffic_Signs_v100_Jun_2012.pdf"><strong>The Department of Transport learner driver manual for road traffic signs</strong></a> —
            the official signs, signals and markings reference used for the sign images and
            meanings shown in the app.
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
