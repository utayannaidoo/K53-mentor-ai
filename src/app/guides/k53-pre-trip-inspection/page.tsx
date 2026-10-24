import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "K53 pre-trip inspection checklist, in order",
  description:
    "The K53 pre-trip inspection for the driver's licence test — the exterior walk-around in order, the interior checks, and what to say aloud to the examiner.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="k53-pre-trip-inspection"
      title="K53 pre-trip inspection: the exterior and interior checks in order"
      intro="The pre-trip inspection opens the yard test, and the clock starts when you begin it. It is a recital as much as an inspection: the examiner needs to see and hear you check each item, in a sensible order, without missing one."
      faq={[
        {
          question: "What is the K53 pre-trip inspection?",
          answer:
            "It is the first part of the yard test in the driver's licence test. You walk around the vehicle checking that it is roadworthy, then check the lights, indicators, wipers and hooter from inside, and confirm aloud that the vehicle is ready to be started.",
        },
        {
          question: "Which direction do you walk around the car in the K53 pre-trip inspection?",
          answer:
            "Anti-clockwise, working from top to bottom at each point, starting by looking underneath the vehicle and then at the driver's door.",
        },
        {
          question: "Can you fail the driving test during the pre-trip inspection?",
          answer:
            "Yes. If the vehicle is found to be unroadworthy at any point, the test ends there and you do not go on to the manoeuvres.",
        },
        {
          question: "Do you have to touch every item in the pre-trip inspection?",
          answer:
            "No. You may point at an item and say that you are checking it. What matters is that the examiner can tell each item has been covered.",
        },
      ]}
    >
      <section>
        <h2>How it runs</h2>
        <ul>
          <li>The examiner starts timing the yard test at the exterior check.</li>
          <li>
            Walk around the vehicle <strong>anti-clockwise</strong>, checking each point from top
            to bottom.
          </li>
          <li>
            You may point and say "I am checking this" rather than handling every part — but say
            it. A silent glance looks like a missed item.
          </li>
          <li>
            If the vehicle is judged <strong>unroadworthy</strong>, the test stops there. Check a
            hired or borrowed car yourself before the day.
          </li>
        </ul>
      </section>
      <section>
        <h2>Exterior: before you start walking</h2>
        <ul>
          <li>
            Look <strong>underneath</strong> the vehicle for leaks and obstructions. It is also the
            only way to see a child or an animal under the car.
          </li>
          <li>Unlock the driver's door, then unlock the others from inside.</li>
        </ul>
      </section>
      <section>
        <h2>Exterior: driver's side and front</h2>
        <ul>
          <li>Driver's mirror — unbroken, secure, clean.</li>
          <li>Driver's side of the windscreen — clean and undamaged.</li>
          <li>
            Driver's wiper — lift it, feel the blade, say it is not torn or perished, and leave it
            raised.
          </li>
          <li>Front right tyre — pressure, sidewall damage, tread depth, wheel nuts.</li>
          <li>Front right light — lens and reflector.</li>
          <li>Bonnet and front bumper secure.</li>
          <li>State that you have checked the oil, water, brake fluid and engine belts.</li>
          <li>Front number plate.</li>
          <li>Front left light, then the front left tyre.</li>
        </ul>
      </section>
      <section>
        <h2>Exterior: passenger side and rear</h2>
        <ul>
          <li>Passenger side of the windscreen, and the passenger wiper — same check, left up.</li>
          <li>Licence disc — valid and displayed.</li>
          <li>Left mirror, then the left doors and window winders.</li>
          <li>Seat belts — secure and undamaged.</li>
          <li>Fuel cap — secure and not leaking.</li>
          <li>Left rear tyre and left rear light.</li>
          <li>Boot secure; mention the spare wheel, jack and wheel spanner.</li>
          <li>Rear bumper and exhaust secure.</li>
          <li>Number-plate light and rear number plate.</li>
          <li>Right rear light, right rear tyre, then the right doors and windows.</li>
        </ul>
        <p>
          Goods vehicles and buses add the information plate and the rear chevron. That brings you
          back to the driver's door, having gone all the way round.
        </p>
      </section>
      <section>
        <h2>Interior: what the examiner asks you to operate</h2>
        <ul>
          <li>
            <strong>Lights</strong> — dipped and main beam, with the rear lights and brake lights
            checked.
          </li>
          <li>
            <strong>Indicators</strong> — left and right, front and rear.
          </li>
          <li>
            <strong>Wipers</strong> — operated while still raised.
          </li>
          <li>
            <strong>Hooter.</strong>
          </li>
        </ul>
        <p>Any of these not working is likely to be treated as an unroadworthy vehicle.</p>
      </section>
      <section>
        <h2>What you say before starting the engine</h2>
        <p>Once the examiner is seated, state each of these out loud:</p>
        <ul>
          <li>All the doors are closed.</li>
          <li>The parking brake is engaged.</li>
          <li>The gear lever is in neutral (or Park in an automatic).</li>
          <li>
            There is nothing loose on the floor and nothing blocking the view through the front or
            rear window.
          </li>
        </ul>
        <p>
          Then adjust your seat and mirrors, fasten your seat belt and start the engine: key to
          the on position first, watch the warning lights and gauges, then start and release the
          key the moment the engine fires.
        </p>
      </section>
      <section>
        <h2>How to learn it</h2>
        <p>
          Learn it as a route, not a list — underneath, driver's door, then anti-clockwise around
          the car — and rehearse it aloud on a real vehicle until you can do it without stopping
          to think. Then move on to the{" "}
          <Link href="/guides/k53-parallel-parking-alley-docking">yard test manoeuvres</Link> and{" "}
          <Link href="/guides/k53-driving-test">how the driving test is scored</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
