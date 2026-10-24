import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "K53 rules of the road: speed limits & distances",
  description:
    "South African speed limits, following distance, where you may not park or stop, overtaking, lights, seat belts and alcohol limits — the rules the K53 learner's test asks about.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="k53-rules-of-the-road"
      quiz={{ categories: ["rules", "parking", "following_distance"] }}
      title="K53 rules of the road: speed limits, distances & the numbers to know"
      intro="Rules of the road is 28 of the 64 questions in the learner's test, and you need 22 of them. Most of what it asks is a number — a speed, a distance, a time limit — and the wrong options are the other numbers on this page."
      faq={[
        {
          question: "What are the general speed limits in South Africa?",
          answer:
            "60 km/h on a road in an urban area, 100 km/h on a public road outside an urban area, and 120 km/h on a freeway. A road sign showing a different limit always overrides the general one.",
        },
        {
          question: "How close to an intersection may you park?",
          answer:
            "You may not park within 5 metres of an intersection. You also may not park within 9 metres of a pedestrian crossing or within 1,5 metres of a fire hydrant.",
        },
        {
          question: "What is the legal alcohol limit for drivers in South Africa?",
          answer:
            "For an ordinary driver the limit is below 0,05 grams per 100 millilitres of blood, or 0,24 milligrams per 1 000 millilitres of breath. For a professional driver it is 0,02 grams per 100 millilitres of blood, or 0,10 milligrams per 1 000 millilitres of breath.",
        },
        {
          question: "How long do you have to report an accident?",
          answer:
            "You must report the accident at a police station within 24 hours, with your driving licence on you, and you may not take alcohol or drugs before reporting it.",
        },
      ]}
    >
      <section>
        <h2>Speed limits</h2>
        <ul>
          <li>
            <strong>60 km/h</strong> in an urban area
          </li>
          <li>
            <strong>100 km/h</strong> on a public road outside an urban area
          </li>
          <li>
            <strong>120 km/h</strong> on a freeway
          </li>
          <li>
            <strong>80 km/h</strong> for a goods or combination vehicle over 9&nbsp;000&nbsp;kg
          </li>
          <li>
            <strong>100 km/h</strong> for a bus or minibus
          </li>
        </ul>
        <p>
          These are the general limits. A speed-limit sign replaces them for the stretch of road
          it governs, and a traffic officer's instruction overrides any sign or rule.
        </p>
      </section>
      <section>
        <h2>Following distance</h2>
        <p>
          Keep at least <strong>two seconds</strong> behind the vehicle ahead in a light motor
          vehicle, and <strong>three seconds</strong> in a heavy vehicle. Count it off a fixed
          point — "one thousand and one, one thousand and two" — and leave more in rain, at night
          or on a poor surface. The rule is counted in seconds rather than metres because a gap
          measured in seconds grows by itself as your speed rises.
        </p>
      </section>
      <section>
        <h2>Where you may not park</h2>
        <ul>
          <li>
            Within <strong>5 m</strong> of an intersection
          </li>
          <li>
            Within <strong>9 m</strong> of a pedestrian crossing
          </li>
          <li>
            Within <strong>1,5 m</strong> of a fire hydrant
          </li>
          <li>
            With your left wheels more than <strong>450 mm</strong> from the edge of the pavement,
            unless a sign allows it
          </li>
          <li>
            Within <strong>1 m</strong> of the road edge outside an urban area, unless in a marked
            bay
          </li>
          <li>
            On a road less than <strong>5,5 m</strong> wide, unless it is one-way
          </li>
          <li>
            On a sidewalk, a traffic island, in a loading zone, across an entrance, or where you
            would hide a road sign
          </li>
        </ul>
      </section>
      <section>
        <h2>Where you may not even stop</h2>
        <ul>
          <li>
            In a tunnel or subway or on a bridge, or within <strong>6 m</strong> of one
          </li>
          <li>
            On, or within <strong>6 m</strong> of, a place where the roadway narrows
          </li>
          <li>
            Within <strong>9 m</strong> of the approach side of a pedestrian crossing
          </li>
          <li>
            Alongside or opposite another vehicle where the road is less than <strong>9 m</strong>{" "}
            wide
          </li>
          <li>On the right-hand side of the road facing oncoming traffic</li>
          <li>On a freeway, except in an emergency or where an officer directs you</li>
        </ul>
        <p>
          Stopping and parking are different questions with different numbers. The test relies on
          learners mixing up the 5, 6 and 9 metre rules.
        </p>
      </section>
      <section>
        <h2>Overtaking</h2>
        <ul>
          <li>Overtake on the right, and move back to the left only once you are safely past.</li>
          <li>
            Never overtake on a blind rise or curve, across a solid white line, or at or
            approaching a pedestrian crossing — and never pass a vehicle that has stopped at one.
          </li>
          <li>
            Overtaking on the left is allowed only when the vehicle ahead is turning right, or
            where there are two or more lanes in your direction. Never cross the yellow line to
            do it.
          </li>
          <li>When you are being overtaken, keep left and hold your speed. Do not accelerate.</li>
          <li>
            You may move onto the shoulder to let someone pass only on a single-lane road, in
            daylight, with at least 150 m of clear shoulder ahead.
          </li>
        </ul>
      </section>
      <section>
        <h2>Lights, hooter and tyres</h2>
        <ul>
          <li>
            Headlights on between sunset and sunrise, and whenever you cannot clearly see people
            or vehicles <strong>150 m</strong> away.
          </li>
          <li>
            Main beam should light the road <strong>100 m</strong> ahead; dipped beam no more than{" "}
            <strong>45 m</strong>. Dip for oncoming traffic.
          </li>
          <li>
            Parking lights are needed when you park outside a bay more than <strong>12 m</strong>{" "}
            from a streetlight.
          </li>
          <li>
            Your hooter must be audible from <strong>90 m</strong> and is a warning device only —
            it gives you no right of way.
          </li>
          <li>
            Tyre tread must be at least <strong>1 mm</strong> deep across the whole surface.
          </li>
        </ul>
      </section>
      <section>
        <h2>Seat belts, alcohol and accidents</h2>
        <ul>
          <li>
            Seat belts are worn by the driver and every passenger where fitted. An infant under 3
            must be in a child restraint.
          </li>
          <li>
            Alcohol: below <strong>0,05 g per 100 ml</strong> of blood for ordinary drivers and{" "}
            <strong>0,02 g</strong> for professional drivers.
          </li>
          <li>
            After an accident: stop, check for injuries, help, exchange details, and report it to
            the police within <strong>24 hours</strong>.
          </li>
          <li>
            Towing: the rope, chain or bar between the vehicles may not be longer than{" "}
            <strong>3,5 m</strong>, and a tow-bar is required above 30 km/h.
          </li>
        </ul>
      </section>
      <section>
        <h2>How to learn the numbers</h2>
        <p>
          Group them by size rather than by topic: 1,5 m (hydrant), 5 m (intersection), 6 m
          (bridge, tunnel, narrowing), 9 m (pedestrian crossing). Then practise them as questions,
          because recognising a number in a list is easier than choosing it from four near-misses.
          The <Link href="/k53-questions/rules-of-the-road">rules of the road questions</Link> and{" "}
          <Link href="/k53-questions/parking-and-stopping">parking and stopping questions</Link>{" "}
          are free to read, and right of way has{" "}
          <Link href="/guides/four-way-stop-right-of-way">its own guide</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
