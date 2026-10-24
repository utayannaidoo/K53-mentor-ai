import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Four-way stop & right of way rules in South Africa",
  description:
    "Right of way at four-way stops, traffic circles, mini-circles, robots and unmarked intersections in South Africa — who goes first, and how the K53 test asks it.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="four-way-stop-right-of-way"
      quiz={{ categories: ["intersections"] }}
      title="Four-way stops, traffic circles & right of way in South Africa"
      intro="Right-of-way questions are the ones learners argue about, because everyone has seen them done wrongly on the road. The test wants the rule — and then expects you to give way anyway if the other driver doesn't follow it."
      faq={[
        {
          question: "Who goes first at a four-way stop in South Africa?",
          answer:
            "The vehicle that stopped first goes first, then the others in the order they stopped. If you are not sure who stopped first, yield to the vehicle on your right.",
        },
        {
          question: "Who has right of way at a traffic circle?",
          answer:
            "Vehicles already in the circle have right of way, and you yield to traffic approaching from your right. At a mini-circle, the first vehicle to cross the yield line has right of way.",
        },
        {
          question: "What does a flashing red robot mean?",
          answer:
            "A flashing red traffic signal is treated as a stop sign: stop completely, then go when it is safe. A flashing amber signal is treated as a yield sign.",
        },
        {
          question: "Do you have to stop at a yield sign?",
          answer:
            "Not if the way is clear. A yield sign means give way to cross traffic and pedestrians, so you must be able to stop — but you may continue without stopping when nobody is there to give way to.",
        },
      ]}
    >
      <section>
        <h2>The principle: right of way is given, not taken</h2>
        <p>
          Every rule below tells you who <em>should</em> go first. None of them makes it safe to go
          if the other driver is not giving way. The K53 system is built on defensive driving: know
          the rule, then check that the other road user is actually following it.
        </p>
      </section>
      <section>
        <h2>Four-way stops</h2>
        <ul>
          <li>Stop completely behind the line, every time, even on an empty road.</li>
          <li>
            <strong>First to stop is first to go.</strong> Vehicles leave in the order they
            stopped.
          </li>
          <li>If you cannot tell who stopped first, yield to the vehicle on your right.</li>
          <li>Where there is no stop line, stop with the front of your vehicle behind the sign.</li>
        </ul>
      </section>
      <section>
        <h2>Stop signs and yield signs</h2>
        <p>
          A stop sign means a complete halt, then go when it is safe. A yield sign means give way
          to cross traffic and to pedestrians crossing or about to cross — you need not stop if the
          way is clear, but you must be ready to. See the{" "}
          <Link href="/road-signs/stop">stop sign</Link> and the{" "}
          <Link href="/road-signs/yield">yield sign</Link>.
        </p>
      </section>
      <section>
        <h2>Traffic circles and mini-circles</h2>
        <ul>
          <li>Vehicles already in the circle have right of way over vehicles entering.</li>
          <li>Yield to traffic approaching from your right.</li>
          <li>
            At a <strong>mini-circle</strong>, whoever crosses the yield line first has right of
            way.
          </li>
          <li>
            Signal your exit. If you are leaving by the first exit, approach with your left
            indicator already on; for a later exit, signal left once you are in the circle and
            passing the exit before yours.
          </li>
          <li>Enter only when there is a safe gap, and never stop inside the circle.</li>
        </ul>
      </section>
      <section>
        <h2>Robots (traffic signals)</h2>
        <ul>
          <li>
            <strong>Steady amber</strong> means stop — go through only if you cannot stop safely
            behind the line.
          </li>
          <li>
            <strong>Flashing red</strong> is treated as a stop sign;{" "}
            <strong>flashing amber</strong> as a yield sign.
          </li>
          <li>
            A <strong>green arrow</strong> gives you right of way in that direction even while the
            main signal is red, provided the intersection is clear.
          </li>
          <li>
            Green never clears a pedestrian who is already crossing, and you may not enter an
            intersection you cannot clear before the signal changes.
          </li>
        </ul>
      </section>
      <section>
        <h2>Turning</h2>
        <ul>
          <li>
            <strong>Turning right</strong>: yield to oncoming traffic, whether it is going straight
            or turning, and to pedestrians crossing the road you are entering. Keep your front
            wheels straight while you wait, so a bump from behind does not push you into oncoming
            traffic.
          </li>
          <li>
            <strong>Turning left</strong>: keep as far left as you can and give way to pedestrians
            and cyclists crossing the road you are turning into.
          </li>
          <li>Signal about 100 m, or five seconds, before the turn.</li>
        </ul>
      </section>
      <section>
        <h2>Intersections with no signs at all</h2>
        <p>
          At an uncontrolled intersection — no signal, no stop, no yield, no circle — nobody has
          automatic priority. Check your mirrors, slow down, look right and left, and go only when
          it is safe. Where a minor road ends at a through road, the vehicle on the road that ends
          gives way.
        </p>
      </section>
      <section>
        <h2>Who always goes first</h2>
        <ul>
          <li>
            A <strong>traffic officer's</strong> instruction overrides every sign, signal and rule.
          </li>
          <li>
            <strong>Emergency vehicles</strong> sounding a siren are given right of way as soon as
            it is safe to do so.
          </li>
          <li>
            <strong>Pedestrians</strong> on, or about to step onto, a pedestrian crossing — and at
            a scholar patrol.
          </li>
        </ul>
        <p>
          Practise these as questions on the{" "}
          <Link href="/k53-questions/intersections">intersections question page</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
