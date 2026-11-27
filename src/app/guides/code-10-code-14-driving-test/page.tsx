import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Code 10 & Code 14 driving test: heavy-vehicle yard and road test",
  description:
    "How the South African heavy-vehicle K53 driving test differs from Code 8: the four yard manoeuvres, the test truck, the air-brake pre-trip checks, and no emergency stop.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="code-10-code-14-driving-test"
      title="Code 10 & Code 14 driving test: the heavy-vehicle yard and road test"
      intro="Heavy vehicles have their own K53 test manual, Volume 2, and its yard test is not the Code 8 one. There is no parallel parking and no three-point turn. Instead you reverse in a straight line and take a left turn. The pre-trip inspection adds the air system and the coupling, and the road test drops the emergency stop."
      faq={[
        {
          question: "What manoeuvres are in the Code 10 and Code 14 yard test?",
          answer:
            "Four, in any order: alley docking to the right, reversing in a straight line, the left turn, and the incline start. Parallel parking and the turn in the road are not part of the heavy-vehicle yard test.",
        },
        {
          question: "Does the truck have to be loaded for the driving test?",
          answer:
            "No. You supply a roadworthy heavy vehicle with a seat next to the driver, and no load is required. An articulated vehicle or combination is tested with the trailer coupled.",
        },
        {
          question: "Is there an emergency stop in the heavy-vehicle road test?",
          answer:
            "No. The light-vehicle test includes one, but the heavy-vehicle manual does not. The road test must include a lane change and at least one hand signal.",
        },
        {
          question: "Do I need Code 10 before I can get Code 14?",
          answer:
            "No. You need a learner's licence that covers the vehicle you are testing in, and the heavy-vehicle learner's (Code 3) covers both. A Code 14 licence also covers everything Code 10 does.",
        },
      ]}
    >
      <section>
        <h2>Which test, which vehicle</h2>
        <p>
          Codes C1, C, EC1 and EC (Code 10 and Code 14 in everyday language) are all tested from
          Volume 2 of the K53 practical driving test, the heavy-vehicle volume. Code 8 uses Volume
          1. Before you book you need the heavy learner's licence (Code 3) and you must be at least{" "}
          <strong>18</strong>. The theory is in the{" "}
          <Link href="/guides/code-10-code-14-learners-licence">
            Code 10 &amp; Code 14 learner's guide
          </Link>
          .
        </p>
        <ul>
          <li>
            You bring the vehicle: a <strong>roadworthy</strong> heavy vehicle or combination{" "}
            <strong>with a seat next to the driver</strong> for the examiner.
          </li>
          <li>
            <strong>No load is required.</strong>
          </li>
          <li>
            The volume covers vehicles over 3&nbsp;500&nbsp;kg with a total length of at least{" "}
            <strong>6&nbsp;m</strong>.
          </li>
          <li>
            For Code 14 the test is done <strong>coupled</strong>: the semi-trailer on the
            truck-tractor, or the trailer on the drawing vehicle.
          </li>
        </ul>
        <p>
          You do not need Code 10 first. A learner's licence that covers the vehicle is the only
          prerequisite, and Code 14 includes everything Code 10 covers.
        </p>
      </section>
      <section>
        <h2>The yard test: four manoeuvres</h2>
        <p>
          The examiner can take these in any order, and the yard test is timed at{" "}
          <strong>20 minutes</strong>:
        </p>
        <ul>
          <li>
            <strong>Alley docking — to the right only.</strong> The light-vehicle test docks left
            and right.
          </li>
          <li>
            <strong>Reversing in a straight line.</strong> Not in the Code 8 test.
          </li>
          <li>
            <strong>The left turn.</strong> Not in the Code 8 test either. On any heavy left turn
            the rear wheels track inside the path of the front, and a trailer cuts in further
            still, so swing wide enough that nothing crosses the kerb.
          </li>
          <li>
            <strong>The incline start.</strong> Pull away uphill without rolling back.
          </li>
        </ul>
        <p>
          <strong>Parallel parking</strong> and the <strong>turn in the road</strong> are not
          part of the heavy test. The{" "}
          <Link href="/guides/k53-driving-test">K53 driving test guide</Link> explains how a K53
          test is run and scored, and the{" "}
          <Link href="/guides/k53-parallel-parking-alley-docking">yard test guide</Link> for the
          alley-docking technique.
        </p>
      </section>
      <section>
        <h2>The pre-trip inspection: what heavy adds</h2>
        <p>
          The walk-around follows the same pattern as the{" "}
          <Link href="/guides/k53-pre-trip-inspection">light-vehicle pre-trip inspection</Link>.
          The exterior check is done with the <strong>engine idling</strong>, partly so that
          leaks in the braking system can be heard. Heavy vehicles add:
        </p>
        <ul>
          <li>
            <strong>Air leaks</strong>, and the <strong>air tanks</strong>: damage, stability,
            and a test for water in the tanks where applicable.
          </li>
          <li>
            On an articulated vehicle, the <strong>service lines and couplings</strong>, and the{" "}
            <strong>fifth-wheel coupling with its safety locking pin</strong>.
          </li>
          <li>
            The <strong>chevron</strong> at the back and the <strong>information plate</strong>,
            and the trailer's own plate where there is one.
          </li>
          <li>
            The roadworthy (clearance) disc and the <strong>operator certificate</strong>, and
            the trailer's clearance disc and number plate.
          </li>
          <li>
            Inside, the <strong>warning lights and gauges</strong>, and the pressure on the brake
            and clutch pedals.
          </li>
        </ul>
        <p>
          The manual lists the checks but gives no air-pressure figures, so learn the warning
          rather than a number. A low-pressure buzzer or light means stop and don't drive.
        </p>
      </section>
      <section>
        <h2>The road test</h2>
        <ul>
          <li>
            The route must include a <strong>lane change</strong> and{" "}
            <strong>at least one hand signal</strong>, so practise your hand signals from the cab.
          </li>
          <li>
            There is <strong>no emergency stop</strong>. The light-vehicle test has one; the
            heavy volume leaves it out.
          </li>
          <li>
            The heavy-vehicle numbers apply all the way round: a{" "}
            <strong>three-second following distance</strong>, and <strong>80&nbsp;km/h</strong>{" "}
            for a goods vehicle or combination over 9&nbsp;000&nbsp;kg.
          </li>
          <li>
            A long vehicle needs more room for everything: start lane changes earlier, and check
            the mirrors for the trailer as well as the traffic.
          </li>
        </ul>
      </section>
      <section>
        <h2>After the licence</h2>
        <p>
          Driving a truck or bus for a living also needs a professional driving permit. The{" "}
          <Link href="/guides/prdp-professional-driving-permit">PrDP guide</Link> covers the
          categories, the ages and the medical. For the learner's test itself, choose Code 10 or 14
          in K53 Mentor and the practice questions and controls switch to heavy vehicles.
        </p>
      </section>
    </LegalPage>
  );
}
