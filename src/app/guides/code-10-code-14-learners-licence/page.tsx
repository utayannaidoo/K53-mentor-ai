import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Code 10 & Code 14 learner's licence test guide",
  description:
    "What the South African Code 10 (C1) and Code 14 (EC) learner's licence test covers — heavy-vehicle speed limits, following distance, air brakes and combination vehicles.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="code-10-code-14-learners-licence"
      title="Code 10 & Code 14 learner's licence: the heavy vehicle test"
      intro="The heavy-vehicle learner's test shares its road signs and most of its rules with the car test. What changes is the handful of numbers that are different for a heavy vehicle, and a controls section about a truck rather than a car."
      faq={[
        {
          question: "What is the difference between Code 10 and Code 14?",
          answer:
            "Code 10 (C1) covers rigid goods vehicles between 3 500 kg and 16 000 kg. Code 14 (EC) covers articulated and combination vehicles above 16 000 kg, such as a truck-tractor with a semi-trailer.",
        },
        {
          question: "How old must you be for a Code 10 or Code 14 learner's licence?",
          answer: "18 years old for either heavy-vehicle class.",
        },
        {
          question: "What is the speed limit for a heavy goods vehicle in South Africa?",
          answer:
            "80 km/h for a goods vehicle or combination vehicle with a gross mass over 9 000 kg, even where the general limit is higher. Buses and minibuses are limited to 100 km/h.",
        },
        {
          question: "What following distance must a heavy vehicle keep?",
          answer:
            "At least three seconds, compared with two seconds for a light motor vehicle, and more in poor conditions.",
        },
      ]}
    >
      <section>
        <h2>Which code, which learner's</h2>
        <ul>
          <li>
            <strong>Code 10 (C1)</strong> — rigid goods vehicles from 3&nbsp;500 to
            16&nbsp;000&nbsp;kg. It also covers what a Code 8 covers.
          </li>
          <li>
            <strong>Code 14 (EC)</strong> — articulated and combination vehicles above
            16&nbsp;000&nbsp;kg.
          </li>
        </ul>
        <p>
          Both use the same learner's licence, booked at the testing centre as{" "}
          <strong>Code 3</strong>, from age <strong>18</strong>. The format is the standard one: 64
          questions in three sections, each passed separately. For the full comparison with Code 8
          see{" "}
          <Link href="/guides/which-licence-code-8-10-14">
            Code 8 vs Code 10 vs Code 14
          </Link>
          .
        </p>
      </section>
      <section>
        <h2>The numbers that change for heavy vehicles</h2>
        <ul>
          <li>
            <strong>Following distance: three seconds</strong>, not two.
          </li>
          <li>
            <strong>80 km/h</strong> for a goods or combination vehicle over 9&nbsp;000&nbsp;kg.
          </li>
          <li>
            <strong>100 km/h</strong> for a bus or minibus.
          </li>
          <li>
            <strong>Alcohol</strong>: a professional driver's limit is 0,02&nbsp;g per 100&nbsp;ml
            of blood (0,10&nbsp;mg per 1&nbsp;000&nbsp;ml of breath) — less than half the ordinary
            limit.
          </li>
        </ul>
        <p>
          These are the classic wrong answers for a heavy learner who studied from car material:
          the option that is right for a car is sitting in the list.
        </p>
      </section>
      <section>
        <h2>Air brakes</h2>
        <ul>
          <li>
            A <strong>low air-pressure warning</strong> — buzzer or light — means stop safely and
            do not drive on. Braking weakens as the pressure falls.
          </li>
          <li>
            <strong>Brake fade</strong> comes from braking continuously on a long descent until the
            brakes overheat. Use a low gear, engine braking and the retarder, and save the service
            brakes.
          </li>
        </ul>
      </section>
      <section>
        <h2>Stability, loading and turning</h2>
        <ul>
          <li>
            A loaded truck or tanker has a high centre of gravity and tips easily. Slow right down
            for circles, curves and off-ramps.
          </li>
          <li>
            On a turn the trailer's wheels track <strong>inside</strong> the path of the tractor.
            Swing wide enough and watch the trailer does not cut across a kerb or a cyclist.
          </li>
          <li>
            Spread the load evenly. An axle can be overloaded even when the total mass is within
            the limit.
          </li>
          <li>
            Overloading lengthens the braking distance, overheats tyres and brakes, makes the
            vehicle unstable — and is an offence.
          </li>
          <li>
            Check both tyres of a dual set. A flat inner tyre is easy to miss and overloads its
            partner.
          </li>
        </ul>
      </section>
      <section>
        <h2>Combination vehicles (Code 14)</h2>
        <ul>
          <li>
            <strong>Coupling</strong> — the kingpin must be fully engaged and locked in the fifth
            wheel, with the safety catch on. Confirm it with a tug test before you leave.
          </li>
          <li>
            <strong>Uncoupling</strong> — apply the trailer's parking brake and lower the landing
            legs before releasing the kingpin and pulling away.
          </li>
          <li>
            <strong>Reversing</strong> — steer the opposite way to swing the trailer, in small
            inputs, and get out to look or use a guide.
          </li>
        </ul>
      </section>
      <section>
        <h2>Driving for a living</h2>
        <p>
          Carrying goods or passengers for reward usually needs a professional driving permit
          (PrDP) on top of the licence, and transporting dangerous goods needs the dangerous-goods
          category with the correct placards displayed. On the driving test, the pre-trip
          inspection for a goods vehicle or bus adds the information plate and the rear chevron —
          see the{" "}
          <Link href="/guides/k53-pre-trip-inspection">pre-trip inspection guide</Link>.
        </p>
      </section>
      <section>
        <h2>Studying for the heavy test</h2>
        <p>
          Road signs and rules of the road are shared with every other learner, so the{" "}
          <Link href="/road-signs">road sign library</Link>, the{" "}
          <Link href="/guides/k53-rules-of-the-road">rules of the road guide</Link> and the{" "}
          <Link href="/k53-questions">questions and answers</Link> all apply. Inside K53 Mentor,
          choosing Code 10 or 14 during onboarding swaps in the heavy-vehicle questions and
          controls, and one plan covers every code.
        </p>
      </section>
    </LegalPage>
  );
}
