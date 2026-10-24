import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Motorcycle learner's licence South Africa (Code A & A1)",
  description:
    "The South African motorcycle learner's licence: Code A vs A1, minimum ages, the rules that apply only to riders, and what the Code 1 learner's test covers.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="motorcycle-learners-licence"
      title="Motorcycle learner's licence (Code A & A1): what to study"
      intro="A car licence does not let you ride, and a motorcycle learner's is its own test. Most of it is the same theory every road user writes — but the controls questions and a set of rider-only rules are different, and most study material skips them."
      faq={[
        {
          question: "How old must you be for a motorcycle learner's licence in South Africa?",
          answer:
            "16 for Code A1, which covers motorcycles up to 125 cc, and 18 for Code A, which covers larger motorcycles.",
        },
        {
          question: "Can you carry a passenger on a motorcycle learner's licence?",
          answer:
            "No. A motorcycle learner may not carry a passenger. Separately, no motorcycle of 50 cc or less may carry a passenger at all.",
        },
        {
          question: "Does a Code 8 licence allow you to ride a motorcycle?",
          answer:
            "No. Motorcycle licences are separate from car licences. You need a Code A1 or Code A licence, and a motorcycle learner's licence to start.",
        },
        {
          question: "Must a motorcycle's headlight be on during the day?",
          answer: "Yes. A motorcyclist must ride with the headlight on at all times.",
        },
      ]}
    >
      <section>
        <h2>Code A1 or Code A</h2>
        <ul>
          <li>
            <strong>Code A1</strong> — motorcycles up to 125&nbsp;cc. Learner's licence from age{" "}
            <strong>16</strong>.
          </li>
          <li>
            <strong>Code A</strong> — motorcycles above 125&nbsp;cc. From age <strong>18</strong>.
          </li>
        </ul>
        <p>
          At the testing centre the motorcycle learner's licence is booked as{" "}
          <strong>Code 1</strong>. It follows the same format as every learner's test — 64
          questions in three sections, each with its own pass mark — but the vehicle-controls
          section asks about a motorcycle's controls, not a car's. See{" "}
          <Link href="/guides/k53-pass-mark-and-test-format">how the pass marks work</Link>.
        </p>
      </section>
      <section>
        <h2>Rules that apply only to riders</h2>
        <ul>
          <li>Sit astride the saddle with both feet on the footrests.</li>
          <li>Keep at least one hand on the handlebars at all times.</li>
          <li>
            Rider <strong>and</strong> passenger must wear a helmet.
          </li>
          <li>
            Ride with the <strong>headlight on at all times</strong>, day and night.
          </li>
          <li>Ride in single file.</li>
          <li>
            No passenger on a motorcycle of <strong>50&nbsp;cc or less</strong>, and never more
            than one passenger behind the rider. Nothing and nobody may be carried in front of
            the rider.
          </li>
          <li>Two motorcycles may not overtake the same vehicle at the same time.</li>
          <li>
            A motorcycle may not tow, be towed, or hold on to another vehicle.
          </li>
          <li>
            A load may not project more than <strong>600&nbsp;mm</strong> to the front,{" "}
            <strong>900&nbsp;mm</strong> to the rear or <strong>450&nbsp;mm</strong> to the side.
          </li>
          <li>
            Motorcycles of <strong>50&nbsp;cc or less</strong> are not allowed on a freeway.
          </li>
          <li>
            Tyres need at least 1&nbsp;mm of tread across the whole surface, and retreaded tyres
            may not be fitted to a motorcycle.
          </li>
        </ul>
      </section>
      <section>
        <h2>What the test expects you to understand about riding</h2>
        <ul>
          <li>
            <strong>Braking</strong> — use both brakes. The front brake does most of the stopping
            on a dry road; go easier on it on wet or loose surfaces.
          </li>
          <li>
            <strong>Cornering</strong> — set your speed before the bend, look through the corner to
            where you want to go, and accelerate gently out of it.
          </li>
          <li>
            <strong>Road position</strong> — ride where you can be seen and have space, away from
            the oily strip in the centre of the lane and clear of parked cars.
          </li>
          <li>
            <strong>Being seen</strong> — assume drivers have not noticed you. Bright or reflective
            gear and good positioning do more than the headlight alone.
          </li>
          <li>
            <strong>Rain and gravel</strong> — the first minutes of rain are the most slippery.
            Keep every input smooth and leave a bigger gap.
          </li>
          <li>
            <strong>Before you ride</strong> — check tyres, brakes, throttle and clutch, lights and
            indicators, oil, and chain tension.
          </li>
        </ul>
      </section>
      <section>
        <h2>Everything else is the same test</h2>
        <p>
          Road signs and rules of the road are shared with car learners, and together they are 56
          of the 64 questions. The{" "}
          <Link href="/road-signs">road sign library</Link>, the{" "}
          <Link href="/guides/k53-rules-of-the-road">rules of the road guide</Link> and the{" "}
          <Link href="/k53-questions">questions and answers</Link> all apply to you.
        </p>
        <p>
          Inside K53 Mentor, choosing a motorcycle code during onboarding swaps in the rider
          question bank, flashcards and controls, and the mock exams follow it. One plan covers
          every code, so switching later costs nothing.
        </p>
      </section>
    </LegalPage>
  );
}
