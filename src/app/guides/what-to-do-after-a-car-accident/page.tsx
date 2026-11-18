import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "What to do after a car accident in South Africa",
  description:
    "The duties section 61 of the National Road Traffic Act puts on every driver after a crash: stop, help, give your details, report it. When you may move the car, and the real reporting deadline.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="what-to-do-after-a-car-accident"
      quiz={{ categories: ["rules", "hazard_awareness"] }}
      title="What to do after a car accident: a driver's legal duties in South Africa"
      intro="The minutes after a crash are a bad time to work out what the law expects. Section 61 of the National Road Traffic Act sets it out in order, and it applies to a car-park scrape as much as to a serious collision. Learn it now, while nothing is at stake."
      faq={[
        {
          question: "How long do you have to report a car accident in South Africa?",
          answer:
            "If anyone was killed or injured, you must report it within 24 hours. If not, you must report it on the first working day after the accident. Reporting to a police or traffic officer at the scene counts. Learner manuals teach 24 hours for every accident, and reporting within 24 hours meets the law in every case.",
        },
        {
          question: "Can I move my car after an accident?",
          answer:
            "If someone was killed or injured, not until a traffic officer authorises it, unless the vehicles completely block the road. Then you mark each vehicle's position on the road surface and move it only far enough to let traffic pass. If nobody was hurt, you may move the vehicle if it is obstructing traffic.",
        },
        {
          question: "What details must I give after an accident?",
          answer:
            "If someone with reasonable grounds asks, you must give your name and address, the name and address of the vehicle's owner, and the vehicle's licence number. When you report the accident you must also produce your driving licence and give your identity number.",
        },
        {
          question: "Is it an offence to drive away from an accident?",
          answer:
            "Yes. Section 61 requires every driver involved in an accident to stop immediately, and failing to carry out any of the section's duties is an offence. That applies even if your vehicle was not damaged, as long as it was involved in or contributed to the accident.",
        },
      ]}
    >
      <section>
        <h2>When the duties apply</h2>
        <p>
          Section 61 applies to the driver of any vehicle that is{" "}
          <strong>involved in or contributes to</strong> an accident in which:
        </p>
        <ul>
          <li>anyone is killed or injured;</li>
          <li>any property, including another vehicle, is damaged; or</li>
          <li>
            an animal is hurt. The Act lists cattle, horses, donkeys, mules, sheep, goats, pigs,
            ostriches and dogs.
          </li>
        </ul>
        <p>
          Note the words <em>contributes to</em>. Your car doesn't have to touch anything. If you
          cut someone off and they swerve into a pole, you were part of that accident and the
          duties are yours. Each one is a separate legal obligation, and failing any of them is
          an offence on its own.
        </p>
      </section>
      <section>
        <h2>1. Stop, and make the scene safe</h2>
        <p>
          The first duty is to <strong>stop immediately</strong>. Driving on and coming back
          later doesn't meet it.
        </p>
        <p>
          The Act doesn't say how to make the scene safe, but the rest of the rules do. Your hazard
          lights are for exactly this: an emergency, or a vehicle stopped where it's a danger.
          Set your warning triangle well back, so approaching drivers see it in time to slow
          down. If you need help, the police are on <strong>10111</strong>, an ambulance on{" "}
          <strong>10177</strong>, and from a mobile phone you can dial <strong>112</strong>.
        </p>
      </section>
      <section>
        <h2>2. Check for injuries and help</h2>
        <p>
          Next, you must find out <strong>whether anyone is hurt and how badly</strong>, and give
          an injured person <strong>whatever help you're capable of giving</strong>. The law sets
          the standard at your ability, not a paramedic's, and calling for an ambulance is help
          anyone can give. Then you must also establish the nature and extent of the damage to
          vehicles, property or animals.
        </p>
      </section>
      <section>
        <h2>3. Leave the vehicles where they are if someone is hurt</h2>
        <p>
          After an accident where someone is <strong>killed or injured</strong>, nobody may move a
          vehicle from where it came to rest until a <strong>traffic officer authorises</strong>{" "}
          it. There's one exception. If the accident <em>completely</em> blocks the road, you may
          move a vehicle only far enough to let traffic pass, and only after clearly marking its
          position on the road surface.
        </p>
        <p>
          When <strong>nobody is hurt</strong>, that rule doesn't apply, and you may move the
          vehicle if it's obstructing traffic.
        </p>
        <p>
          One more rule applies to every accident. No one may remove a vehicle from the scene,
          except to let traffic pass, without the permission of its owner, driver or operator, or
          someone lawfully entitled to take possession of it. A tow truck that arrives first
          still needs your permission to take your car.
        </p>
      </section>
      <section>
        <h2>4. Give your details</h2>
        <p>
          If anyone with reasonable grounds asks, you must give them:
        </p>
        <ul>
          <li>your name and address;</li>
          <li>the name and address of the vehicle's owner;</li>
          <li>the vehicle's licence (registration) number.</li>
        </ul>
        <p>
          The owner's details matter more than people expect. A learner driving a parent's car, or
          anyone in a borrowed or company vehicle, gives the owner's details as well as their own.
          Ask the other drivers for the same three things. Their duty is the same as yours.
        </p>
      </section>
      <section>
        <h2>5. Report it, and the real deadline</h2>
        <p>
          If the accident wasn't already reported to a police or traffic officer at the scene, you
          must report it yourself at a <strong>police station</strong> or a designated{" "}
          <strong>traffic office</strong>, as soon as reasonably practicable:
        </p>
        <ul>
          <li>
            <strong>within 24 hours</strong> if anyone was killed or injured;
          </li>
          <li>
            otherwise, <strong>on the first working day</strong> after the accident.
          </li>
        </ul>
        <p>
          Take your <strong>driving licence</strong>, and be ready to give your identity number
          and the same details you gave at the scene. A driver whose own injuries make reporting
          impossible is excused.
        </p>
        <p>
          You'll often read that every accident must be reported within 24 hours. The Motus manual
          says so, and so do most study materials. The Act is a little more forgiving for a crash
          with no injuries. Both rules are met if you report within 24 hours, so that's the safe
          habit, and it's also the figure the manuals teach for the learner's test.
        </p>
      </section>
      <section>
        <h2>6. No alcohol until you've reported</h2>
        <p>
          Until you've made the report, where it's your duty to make one, you may not take{" "}
          <strong>any alcohol or any drug with a narcotic effect</strong>. If a traffic officer
          requires you to be examined by a doctor, the ban lasts until that's done too. The only
          exception is something a doctor gives you, or tells you to take, for injury or shock.
          A drink to calm your nerves before you report is itself an offence.
        </p>
      </section>
      <section>
        <h2>Learner drivers and the driving test</h2>
        <p>
          If you're driving on a learner's licence, you are the driver section 61 is talking
          about. The duties are yours, not your supervisor's, although the licensed driver beside
          you is the obvious person to help you through them. It's another reason to know them
          before you start practising on public roads.
        </p>
        <p>
          On the road test, causing an accident ends the test. If another driver causes it, the
          examiner may let you continue, as long as your vehicle is still roadworthy. The{" "}
          <Link href="/guides/k53-driving-test">K53 driving test guide</Link> lists the other
          mistakes that fail you on the spot.
        </p>
      </section>
      <section>
        <h2>How the learner's test asks it</h2>
        <p>
          Accident questions are in the rules of the road section. Expect to be asked what you
          must do first, how long you have to report, whether you may drink before reporting, and
          when the vehicles may be moved. Watch for an option that borrows a number from another
          rule. Seven days, for instance, is how long a vehicle may stand on an urban road before
          it's treated as abandoned. It has nothing to do with reporting a crash. The{" "}
          <Link href="/guides/k53-rules-of-the-road">rules of the road guide</Link> puts these
          numbers alongside the speed limits and stopping distances, and the{" "}
          <Link href="/k53-questions/rules-of-the-road">rules of the road</Link> and{" "}
          <Link href="/k53-questions/hazard-awareness">hazard awareness</Link> questions are free
          to practise.
        </p>
        {/* /study/* is auth-gated — organic readers landing here from search
            were sent to a login screen. The free assessment is the public
            entry point. */}
        <p>
          K53 Mentor's <Link href="/onboarding">free practice</Link> marks you section by section
          and brings back the questions you miss until you get them right.
        </p>
      </section>
    </LegalPage>
  );
}
