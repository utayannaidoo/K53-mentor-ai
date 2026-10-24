import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "K53 parallel parking & alley docking, step by step",
  description:
    "The K53 yard test manoeuvres explained — parallel parking, alley docking, the turn in the road and the incline start: movements allowed, what is scored and what disqualifies you.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="k53-parallel-parking-alley-docking"
      title="K53 parallel parking, alley docking, three-point turn & incline start"
      intro="The yard test is four manoeuvres between painted lines and poles. The steering is the easy part to learn. What fails people is the routine around it — the parking brake, the observations and the signal that must happen before every single movement."
      faq={[
        {
          question: "How many movements are allowed for K53 parallel parking?",
          answer:
            "Three: reverse in, move forward, and reverse straight back. Completing it in a single movement is equally acceptable. You may not touch a pole, mount the kerb or roll.",
        },
        {
          question: "How many attempts do you get at alley docking?",
          answer:
            "Two. A second attempt at a parking manoeuvre is allowed as long as you did not roll and did not touch a pole on the first.",
        },
        {
          question: "How many moves are allowed in the K53 three-point turn?",
          answer:
            "Three at most. A fourth movement is an immediate disqualification, as is mounting the kerb.",
        },
        {
          question: "Is rolling back on the incline start an instant fail?",
          answer:
            "Yes. Any rearward roll on the incline start ends the test immediately.",
        },
      ]}
    >
      <section>
        <h2>The routine before every movement</h2>
        <p>
          Each manoeuvre starts from a painted box and is broken into separate movements. Before
          every one of them you repeat the same three steps:
        </p>
        <ul>
          <li>
            <strong>Stop</strong> — apply the parking brake as soon as the vehicle has stopped
            completely, select neutral, and take your feet off the pedals.
          </li>
          <li>
            <strong>Indicate</strong> — do a full 360° observation, slowly enough for the examiner
            to see it, then signal the direction you are about to move.
          </li>
          <li>
            <strong>Move</strong> — select the gear, find the biting point so the vehicle cannot
            roll, do a second 360° observation, release the parking brake and move off slowly.
          </li>
        </ul>
        <p>
          A missed observation or a missed signal costs 5 points each, every time. A parking brake
          used out of order costs 2, and letting the ratchet click costs 1 — press the button in
          as you pull it up.
        </p>
      </section>
      <section>
        <h2>Alley docking</h2>
        <ul>
          <li>You reverse into a bay marked by poles, once from each side.</li>
          <li>
            Steer around the entry poles keeping them roughly half a metre from the side of the
            vehicle, and finish fully inside the bay.
          </li>
          <li>
            You may stop as often as you need to. If you are stationary for more than three
            seconds, do another 360° check before moving again.
          </li>
          <li>You get two attempts. Touching any pole is an immediate disqualification.</li>
        </ul>
      </section>
      <section>
        <h2>Parallel parking</h2>
        <ul>
          <li>
            Start alongside the bay, about half a metre out from the first pole, with the back of
            the vehicle well past the poles.
          </li>
          <li>
            You have <strong>three movements</strong>: reverse in, move forward, reverse straight
            back. Doing it in one is fine.
          </li>
          <li>
            Finishing parallel is the aim, but anywhere inside the marked area between the poles
            is a pass.
          </li>
          <li>
            Touching a pole, mounting the kerb or rolling ends the test. Bumping the kerb without
            climbing it costs 4 points.
          </li>
        </ul>
      </section>
      <section>
        <h2>Turn in the road (three-point turn)</h2>
        <ul>
          <li>
            Start as close to the left kerb as you can. Move forward on full right lock and
            straighten the wheels just before you stop, about a metre from the far kerb.
          </li>
          <li>Reverse on full left lock, straighten again, and stop before you touch the kerb.</li>
          <li>Move forward and finish parallel to the kerb on the other side of the road.</li>
          <li>
            <strong>Three movements maximum.</strong> A fourth is an immediate disqualification.
            Forgetting to straighten the wheels before stopping costs a point each time.
          </li>
        </ul>
      </section>
      <section>
        <h2>Incline start</h2>
        <ul>
          <li>Stop behind the line, parking brake on, neutral — this shows the brake holds.</li>
          <li>
            360° check, first gear, bring the clutch to the biting point, second 360° check, then
            release the parking brake and feed in the accelerator as you bring the clutch up.
          </li>
          <li>
            <strong>Any roll backwards is an immediate failure.</strong> If you stall, apply the
            parking brake, go to neutral and restart with the full procedure.
          </li>
        </ul>
      </section>
      <section>
        <h2>What disqualifies you outright</h2>
        <ul>
          <li>The vehicle rolls</li>
          <li>Any part of the vehicle touches a pole</li>
          <li>A wheel mounts the kerb</li>
          <li>More than three movements in the turn in the road</li>
        </ul>
        <p>
          Everything else is points. That makes the yard test far more forgiving of clumsy
          steering than of a skipped routine: you can take the full three movements and stall once
          and still pass, but you cannot roll.
        </p>
      </section>
      <section>
        <h2>How to practise</h2>
        <p>
          Practise the stop–indicate–move routine until it is automatic before you worry about
          the lines. Say each step aloud; it slows you down and makes the observation visible.
          Then add the{" "}
          <Link href="/guides/k53-pre-trip-inspection">pre-trip inspection</Link>, which opens the
          yard test, and read{" "}
          <Link href="/guides/k53-driving-test">how the whole driving test is scored</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
