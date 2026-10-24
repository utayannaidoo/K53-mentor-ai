import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "K53 driving test: yard test, road test & instant fails",
  description:
    "How the South African K53 driver's licence test works — the yard test, the road test, how penalty points are scored, and the mistakes that end the test immediately.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="k53-driving-test"
      title="The K53 driver's licence test: yard test and road test explained"
      intro="The driving test is not a judgement of whether you can drive. It is a checklist of observable actions, each with a penalty attached, plus a short list of mistakes that stop the test on the spot. Knowing the checklist is most of the preparation."
      faq={[
        {
          question: "What are the two parts of the K53 driving test?",
          answer:
            "The yard test and the road test. The yard test comes first and covers the pre-trip inspection and the manoeuvres: alley docking, parallel parking, the turn in the road and the incline start. You must pass both parts.",
        },
        {
          question: "What is an instant fail in the K53 driving test?",
          answer:
            "Rolling backwards or forwards when you should be stationary, touching a pole or mounting the kerb in the yard, taking more than three movements in the turn in the road, breaking any rule of the road, failing to obey a road sign, a dangerous or uncontrolled action, and causing an accident.",
        },
        {
          question: "How often must you check your mirrors in the K53 road test?",
          answer:
            "Every five to eight seconds while driving, and before every signal, change of speed or change of direction. Each missed check costs penalty points, and they add up across the whole test.",
        },
        {
          question: "What happens if the car breaks down during the driving test?",
          answer:
            "A mechanical breakdown is not a failure. The result is recorded as deferred and you take the test again.",
        },
      ]}
    >
      <section>
        <h2>Two phases, both must be passed</h2>
        <ul>
          <li>
            <strong>The yard test</strong> — the pre-trip inspection of the vehicle, then four
            manoeuvres: alley docking, parallel parking, the turn in the road (three-point turn)
            and the incline start. The whole yard test is timed at about 20 minutes, and the
            examiner may take the manoeuvres in any order.
          </li>
          <li>
            <strong>The road test</strong> — driving on public roads while the examiner scores
            your observation, signalling, speed control, positioning and handling of
            intersections.
          </li>
        </ul>
        <p>
          You only reach the road if you pass the yard. The manoeuvres are covered step by step in
          the <Link href="/guides/k53-parallel-parking-alley-docking">yard test guide</Link>, and
          the walk-around in the{" "}
          <Link href="/guides/k53-pre-trip-inspection">pre-trip inspection guide</Link>.
        </p>
      </section>
      <section>
        <h2>How the scoring works</h2>
        <p>
          Every fault has a fixed penalty, and the same fault is penalised every time it happens.
          That is why small habits fail tests: one missed mirror check is survivable, one every
          thirty seconds is not. The expensive faults are almost all about looking:
        </p>
        <ul>
          <li>
            <strong>5 points</strong> — a missed all-round observation before moving off; a missed
            blind-spot check; a missed signal; not checking the mirror every 5–8 seconds; following
            closer than two seconds; driving too fast for the conditions even inside the limit;
            looking down at the gear lever.
          </li>
          <li>
            <strong>4 points</strong> — leaving a signal on after the manoeuvre; turning wide or
            cutting a corner; changing gear in the middle of a corner.
          </li>
          <li>
            <strong>3 points</strong> — a missed mirror check before signalling; coasting with the
            clutch in or in neutral; front wheels not straight while waiting to turn right.
          </li>
          <li>
            <strong>1–2 points</strong> — parking brake not used or the ratchet heard clicking;
            stalling; wrong gear; a jerky movement; resting your foot on the clutch; stopping
            without reason.
          </li>
        </ul>
      </section>
      <section>
        <h2>What ends the test immediately</h2>
        <ul>
          <li>
            <strong>Rolling</strong> — any roll on the incline start, at a stop line or during a
            manoeuvre.
          </li>
          <li>
            <strong>Touching a pole</strong> or <strong>mounting the kerb</strong> in the yard.
            (Bumping the kerb without climbing it costs points instead.)
          </li>
          <li>
            A <strong>fourth movement</strong> in the turn in the road.
          </li>
          <li>
            <strong>Breaking any rule of the road</strong> or failing to obey a road sign — a
            rolling stop at a stop sign is enough.
          </li>
          <li>
            A <strong>dangerous or uncontrolled action</strong>: taking an unsafe gap, cornering too
            fast, endangering a pedestrian.
          </li>
          <li>
            <strong>Causing an accident</strong>, or presenting a vehicle the examiner finds
            unroadworthy at the pre-trip inspection.
          </li>
        </ul>
        <p>
          You are not always told at the moment it happens. The examiner may let you drive back to
          the centre first.
        </p>
      </section>
      <section>
        <h2>The observation routine the examiner is watching for</h2>
        <p>
          Before the vehicle moves — every time — do an all-round check slowly enough to be seen,
          signal, and check again just before you release the parking brake. On the road, the
          sequence before any change of speed or direction is mirror, blind spot, signal, then
          act, and cancel the signal afterwards. Examiners score what they can see your head do,
          so a glance with your eyes alone earns nothing.
        </p>
      </section>
      <section>
        <h2>On the road</h2>
        <ul>
          <li>Steer push-pull, hands never crossing, and keep to your lane without wandering.</li>
          <li>Keep a two-second following distance, counted off a fixed point.</li>
          <li>Brake in a straight line with both hands on the wheel; do not use the gears to slow.</li>
          <li>
            Stop behind the line. Where there is none, stop with the front of the vehicle behind
            the sign.
          </li>
          <li>
            Hand signals may be asked for: you get two attempts, and they must be finished before
            you brake.
          </li>
          <li>
            You may be asked for an emergency stop: stop promptly, in a straight line, under
            control. Two attempts.
          </li>
          <li>Change lanes only when asked, or when a sign or marking requires it.</li>
        </ul>
      </section>
      <section>
        <h2>Manual or automatic?</h2>
        <p>
          Passing in an automatic gives you a licence restricted to automatics. Passing in a
          manual covers both. Whichever you choose, you need a valid learner's licence to book —
          and if you are still working towards that,{" "}
          <Link href="/guides/how-the-k53-learners-test-works">start with how the learner's test works</Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
