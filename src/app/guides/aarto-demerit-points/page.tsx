import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "AARTO demerit points explained (starts 1 September 2026)",
  description:
    "South Africa's AARTO demerit-point system starts allocating points on 1 September 2026. Here's how points work, the learner threshold of 6 points, and how points fall away.",
};

export default function GuidePage() {
  return (
    <LegalPage
      title="AARTO demerit points, explained"
      intro="From 1 September 2026, traffic infringements start adding demerit points to your driving record. Rack up too many and your licence is suspended — here's exactly how it works, and why learners need to care."
    >
      <section>
        <h2>What AARTO is</h2>
        <p>
          AARTO — the <strong>Administrative Adjudication of Road Traffic Offences</strong> — is the
          system that handles traffic fines and, from{" "}
          <strong>1 September 2026</strong>, demerit points. The idea is simple: repeat offenders
          accumulate points, and enough points cost you your licence.
        </p>
      </section>
      <section>
        <h2>How points work</h2>
        <ul>
          <li>
            Points are added when you <strong>pay an infringement fine</strong>, an{" "}
            <strong>enforcement order</strong> is issued, or a court <strong>convicts</strong> you.
            Paying the fine does <em>not</em> stop the points.
          </li>
          <li>
            Points scale with severity — a minor infringement like failing to stop at a line is
            around <strong>2 points</strong>, while driving without a valid licence is about{" "}
            <strong>6 points</strong>.
          </li>
          <li>
            They fall away over time: <strong>one point every three months</strong> with no new
            infringement, until you're back to zero.
          </li>
        </ul>
      </section>
      <section>
        <h2>The thresholds — and why learners face a stricter one</h2>
        <p>
          A fully licensed driver may hold up to <strong>15 points</strong>. A{" "}
          <strong>learner driver's threshold is just 6 points</strong> — low enough that a single
          serious infringement can put your provisional driving at risk. Go over the threshold and
          your licence is suspended for <strong>three months for every point above the limit</strong>.
          Three suspensions and the licence is <strong>cancelled</strong> — you'd have to apply and
          test all over again.
        </p>
      </section>
      <section>
        <h2>How to keep your record clean</h2>
        <p>
          There's no trick — just lawful driving. Because points melt away at one per three months,
          a stretch of clean driving brings you back to zero and keeps you well under the threshold.
          The same knowledge that passes your learner's test — right-of-way order, stopping rules,
          speed limits — is what keeps demerit points off your record once you're on the road.{" "}
          <Link href="/study/questions?category=rules">Practise the rules of the road</Link> to build
          both at once.
        </p>
      </section>
      <section>
        <h2>Is this on the learner's test?</h2>
        <p>
          AARTO itself isn't part of the K53 learner's question paper — but it's the law you'll be
          driving under the moment you pass, and a few AARTO questions appear in K53 Mentor's rules
          practice so you know where you stand. Treat this as "know the law" material rather than
          exam cramming.
        </p>
      </section>
    </LegalPage>
  );
}
