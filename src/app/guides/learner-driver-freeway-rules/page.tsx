import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Can learners drive on the freeway? SA freeway rules",
  description:
    "Yes, with a licensed supervisor beside you. Who may not use a South African freeway, when you may stop on one, the lane rules in regulation 323, and how the driving test scores freeway joins.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="learner-driver-freeway-rules"
      quiz={{ categories: ["rules", "following_distance"] }}
      title="Can learners drive on the freeway? South African freeway rules"
      intro="Yes. Nothing in the regulations keeps a supervised learner off the freeway. What changes at 120 km/h is the rulebook: who may be there at all, when you may stop, and what each lane is for."
      faq={[
        {
          question: "Can a learner driver drive on the freeway in South Africa?",
          answer:
            "Yes. A learner may use any public road, freeways included, as long as they are under the direct personal supervision of someone licensed for that class of vehicle, seated next to them. The freeway regulation lists the vehicles and road users barred from a freeway, and learner drivers are not on it.",
        },
        {
          question: "What is the speed limit on a South African freeway?",
          answer:
            "120 km/h, unless a road sign shows a different limit for that stretch. Goods and combination vehicles over 9 000 kg are limited to 80 km/h and buses and minibuses to 100 km/h, so expect slower heavy traffic in the left lane.",
        },
        {
          question: "When may you stop on a freeway?",
          answer:
            "Only where a road sign or a traffic officer tells you to, in an area signed for stopping or parking, or for a cause beyond your control, such as a breakdown. If you have to stop, get the whole vehicle to the left of the yellow edge line and put your hazard lights on.",
        },
        {
          question: "Can a 50 cc scooter go on the freeway?",
          answer:
            "No. Motorcycles of 50 cc or less, electric motorcycles, motor tricycles and quadricycles, pedal cycles, animal-drawn vehicles and tractors are all barred from freeways, whatever licence the rider holds.",
        },
      ]}
    >
      <section>
        <h2>The short answer: yes, under supervision</h2>
        <p>
          The conditions on a learner's licence are in <strong>regulation 99</strong>. You must
          drive under the <em>direct personal supervision</em> of someone who holds a full licence
          for that class of vehicle, not another learner's licence. They sit next to you, or
          directly behind you if there's no seat beside you. That's the rule on every road. The
          regulation doesn't keep learners off any kind of road, and the freeway regulation,{" "}
          <strong>regulation 323</strong>, doesn't list learners among the road users it bans.
          The Motus manual says it plainly: a learner may drive on a freeway when accompanied by
          someone licensed for the same category.
        </p>
        <p>
          Motorcycle learners are the exception. Regulation 99 doesn't require a supervisor on a
          motorcycle, and you may not carry a passenger at all. But if your bike is{" "}
          <strong>50 cc or smaller</strong>, or electric, it isn't allowed on a freeway at all,
          whatever licence you hold. The{" "}
          <Link href="/guides/motorcycle-learners-licence">motorcycle learner's guide</Link> covers
          the other rider-only rules.
        </p>
        <p>
          Being allowed on the freeway doesn't mean you should take your first drive there. That's
          a judgement for you and your supervisor. The rules below are the same whenever you go.
        </p>
      </section>
      <section>
        <h2>Who and what may not be on a freeway</h2>
        <p>Regulation 323 bars these vehicles from a freeway entirely:</p>
        <ul>
          <li>animal-drawn vehicles and pedal cycles;</li>
          <li>
            motorcycles of <strong>50 cc or less</strong>, and electrically propelled motorcycles;
          </li>
          <li>motor tricycles and motor quadricycles;</li>
          <li>
            vehicles of <strong>230 kg or less</strong> built or adapted for people with a
            disability;
          </li>
          <li>tractors, unless they're working on the freeway's construction or maintenance.</li>
        </ul>
        <p>
          People on foot are allowed only in an area signed for stopping or parking, or where
          something beyond their control has left them there, such as a breakdown. Animals are
          allowed only inside a vehicle or in a signed stopping area. Where these rules start and
          end is shown by the freeway sign and its "freeway ends" version with a red cross. The{" "}
          <Link href="/guides/k53-road-signs-explained">road signs guide</Link> explains how the
          cross ends a restriction, and you can browse the regulatory signs in the{" "}
          <Link href="/road-signs">road signs library</Link>.
        </p>
      </section>
      <section>
        <h2>Stopping, and what to do if you must</h2>
        <p>You may stop a vehicle on a freeway in three cases only:</p>
        <ul>
          <li>a road sign or a traffic officer tells you to;</li>
          <li>you're in an area signed for stopping or parking;</li>
          <li>a cause beyond your control forces you to, such as a breakdown.</li>
        </ul>
        <p>
          Stopping to answer a phone, check a map or drop someone off isn't any of those. If you
          do have to stop, the yellow edge line tells you where. On a road with more than one lane
          each way you may not drive or overtake on the shoulder beyond it. In an emergency stop,
          though, you get the <em>whole</em> vehicle to the left of that line, put your hazard
          lights on, and set your warning triangle well back so traffic has time to react.
          Reversing along a freeway to an exit you missed is an offence. Carry on to the next one.
        </p>
        <p>
          Hand signals are banned on a freeway too, except when a cause beyond your control leaves
          you no choice. You learn them for the road test, but on a freeway your indicators do the
          work.
        </p>
      </section>
      <section>
        <h2>Speed and following distance</h2>
        <p>
          The general limit is <strong>120 km/h</strong>, and a road sign showing another limit
          overrides it for that stretch. Two other limits explain why the left lane is often
          slower: goods and combination vehicles over <strong>9&nbsp;000 kg</strong> are limited
          to <strong>80 km/h</strong>, and buses and minibuses to <strong>100 km/h</strong>.
        </p>
        <p>
          At 120 km/h you cover about <strong>33 metres every second</strong>. The two-second
          following gap for a light vehicle is therefore about 67 metres. That sounds generous,
          but it's still only two seconds to see a problem, react and start braking. Count it
          from a fixed point, and leave
          more in the wet: braking distance grows on a wet road even though your reaction time
          doesn't. Heavy vehicles need three seconds. The{" "}
          <Link href="/k53-questions/following-distance">following distance questions</Link>{" "}
          drill the numbers.
        </p>
      </section>
      <section>
        <h2>Lane discipline: keep left, pass right</h2>
        <p>
          Freeway lanes have jobs. The left lanes are for travelling and the right-hand lane is for
          overtaking. Regulation 323 puts this into law. If you're in the right-hand lane and you
          become aware that someone behind wants to pass, you must move <strong>one lane
          left</strong> when it's safe, and you may not speed up until they've gone by. The
          regulation also lets the overtaking driver <strong>flash their headlights</strong> to
          show you they mean to pass. That's the one place the regulations give a flash a
          meaning. Anywhere else it's only someone's guess at what they want.
        </p>
        <ul>
          <li>
            The road-test sequence says the same: don't drive in the right-hand lane except to
            overtake.
          </li>
          <li>
            Passing on the left is allowed where there are two or more lanes in your direction.
            Crossing the yellow line to do it never is.
          </li>
          <li>
            Change lanes in order: mirrors, signal, blind spot, then move. Moving first and
            signalling during the move tells nobody anything.
          </li>
          <li>
            Don't make a U-turn across the median, and don't cross the solid white line on the
            right edge of the carriageway.
          </li>
        </ul>
      </section>
      <section>
        <h2>Joining and leaving: what the examiner watches</h2>
        <p>
          If your road-test route includes a freeway, the joins and exits are scored like any
          other manoeuvre. Each penalty is counted every time it happens: 3 for mirrors, 5 for
          the blind spot, 5 for not signalling, 4 for not cancelling the signal and 5 for
          clear space. The sequence the Motus manual teaches:
        </p>
        <ul>
          <li>
            Start your checks at least <strong>100 metres, or about 12 seconds</strong>, before
            the entrance or exit.
          </li>
          <li>
            Check <strong>both blind spots again 50 metres</strong> before the actual entrance or
            exit.
          </li>
          <li>
            Passing an on-ramp, check your <strong>left</strong> blind spot for joining traffic.
            Passing an off-ramp, check <strong>both</strong>.
          </li>
          <li>
            Use the on-ramp to match the speed of the traffic you're joining, and blend in. Don't
            stop at the end of the ramp unless you can't avoid it. Pulling into 120 km/h traffic
            from a standstill needs a far bigger gap than joining at its speed.
          </li>
        </ul>
        <p>
          <Link href="/guides/k53-driving-test">The K53 driving test guide</Link> explains how
          the points add up and which mistakes end the test on the spot.
        </p>
      </section>
      <section>
        <h2>How the learner's test asks about freeways</h2>
        <p>
          Freeway questions sit in the rules of the road section. They're usually about which
          vehicles are banned, when stopping is allowed, what to do when someone wants to pass,
          and the limit itself. Watch for an option that's right on an ordinary road but wrong on
          a freeway. The shoulder rule is the one to know: you may pull onto the shoulder to let a
          car pass only on a <em>single-lane</em> road, in daylight, with 150 m of clear shoulder
          ahead, so it doesn't apply on a multi-lane freeway. The{" "}
          <Link href="/guides/k53-rules-of-the-road">rules of the road guide</Link> has the
          rest of the numbers, and the{" "}
          <Link href="/k53-questions/rules-of-the-road">rules of the road questions</Link> are free
          to practise.
        </p>
        {/* /study/* is auth-gated — organic readers landing here from search
            were sent to a login screen. The free assessment is the public
            entry point. */}
        <p>
          K53 Mentor's <Link href="/onboarding">free practice</Link> marks every section to the
          real pass mark, so you can see whether the rules section is holding you back.
        </p>
      </section>
    </LegalPage>
  );
}
