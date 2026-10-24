import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "K53 vehicle controls explained: clutch, brakes & gears",
  description:
    "What every vehicle control does and how the K53 learner's test asks about it — foot controls, gears, the parking brake, steering method, indicators and mirrors.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="k53-vehicle-controls"
      quiz={{ categories: ["controls"] }}
      title="K53 vehicle controls: the 8 questions that sink strong attempts"
      intro="Vehicle controls is the smallest section of the learner's test: 8 questions, pass mark 6. Get three wrong and you fail the whole test, whatever you scored on signs and rules. It is also the section people study least."
      faq={[
        {
          question: "How many vehicle controls questions are in the K53 learner's test?",
          answer:
            "Eight, and you must get at least six right. The controls section is passed or failed separately from road signs and rules of the road.",
        },
        {
          question: "Which foot operates the clutch?",
          answer:
            "The left foot, and only the left foot. The right foot works both the accelerator and the foot brake, moving between them.",
        },
        {
          question: "If I pass my driving test in an automatic, can I drive a manual?",
          answer:
            "No. A licence obtained in an automatic vehicle restricts you to automatics. Passing in a manual vehicle licenses you for both.",
        },
        {
          question: "What is the correct K53 steering method?",
          answer:
            "The push-pull method, also called shuffle steering, with hands at ten-to-two or quarter-to-three and both thumbs on the inside of the rim. The hands never cross and the wheel is never allowed to spin back by itself.",
        },
      ]}
    >
      <section>
        <h2>The foot controls</h2>
        <ul>
          <li>
            <strong>Accelerator</strong> — right foot. Controls engine speed. Press it smoothly and
            gradually, and lightly as you bring the clutch up to move off.
          </li>
          <li>
            <strong>Foot brake</strong> — right foot, which moves between brake and accelerator.
            Squeeze it progressively; slamming it can lock the wheels. If they do lock, release
            and re-apply gently. Finish braking before you turn where you can.
          </li>
          <li>
            <strong>Clutch</strong> — left foot only. It disconnects the engine from the gearbox so
            you can change gear or stop without stalling. Push it in quickly, let it out slowly,
            and never rest your foot on it. When slowing for a corner the order is brake first,
            then clutch.
          </li>
        </ul>
      </section>
      <section>
        <h2>Gear lever and parking brake</h2>
        <ul>
          <li>
            Press the clutch before every gear change, and select the gear that suits your road
            speed. Keep your eyes on the road while you change — looking down at the lever costs
            points on the driving test.
          </li>
          <li>
            Do not coast: driving with the clutch held in, or in neutral, gives up engine braking
            and control.
          </li>
          <li>
            The <strong>parking brake</strong> (handbrake) holds the vehicle when it is stopped or
            left unattended, and on an incline. Apply it only once you have stopped completely —
            never at speed.
          </li>
          <li>
            Leaving the vehicle: parking brake on, engine off. An automatic is left in Park; a
            manual on a slope is usually left in first or reverse as a second safeguard.
          </li>
          <li>
            A licence obtained in an <strong>automatic</strong> restricts you to automatics. A
            manual licence covers both.
          </li>
        </ul>
      </section>
      <section>
        <h2>Steering</h2>
        <ul>
          <li>
            Use the <strong>push-pull</strong> method so both hands stay on the wheel and never
            cross.
          </li>
          <li>
            Hold the wheel at <strong>ten-to-two or quarter-to-three</strong>, thumbs on the inside
            of the rim — never on the lower half.
          </li>
          <li>Do not let the wheel spin back to centre, and never take both hands off it.</li>
          <li>Avoid turning the wheel while the vehicle is standing still.</li>
        </ul>
      </section>
      <section>
        <h2>Indicators, lights, hooter and mirrors</h2>
        <ul>
          <li>
            Signal about <strong>100 m, or five seconds</strong>, before a turn, only in the
            direction you mean to go, and cancel it afterwards. A signal announces what you intend
            — it does not give you right of way.
          </li>
          <li>
            Headlights go on between sunset and sunrise and whenever visibility drops below 150 m.
            Main beam is only for when there is no oncoming traffic.
          </li>
          <li>
            The hooter is a warning device, audible from 90 m. It gives no right of way and is not
            used without need.
          </li>
          <li>
            The <strong>interior rear-view mirror</strong> is your main mirror. Mirrors leave blind
            spots to the left and right behind the door pillars, which is why you turn your head
            before moving off or changing lanes.
          </li>
        </ul>
      </section>
      <section>
        <h2>Moving off and stopping</h2>
        <p>
          <strong>Moving off:</strong> clutch fully in, first gear, a little accelerator, bring the
          clutch up to the biting point, check all round, signal, release the parking brake and
          pull away smoothly.
        </p>
        <p>
          <strong>Stopping:</strong> mirror first, ease off the accelerator, brake gently in a
          straight line, press the clutch just before you stop, and keep both hands on the wheel
          until the vehicle is stationary. Then parking brake, then neutral.
        </p>
        <p>
          <strong>Reversing:</strong> only when stationary, only as far as you need, and looking
          over your left shoulder through the rear window — mirrors alone show too little.
        </p>
      </section>
      <section>
        <h2>How the test asks it</h2>
        <p>
          Controls questions usually show a diagram of the cockpit with numbered parts, or ask
          which control you would use to do something: slow down, change gear, hold the vehicle on
          a hill. Motorcycle and heavy-vehicle learners get the controls for their own class. With
          only eight questions, the efficient way to study is to drill this section by itself
          until you stop dropping any — see the{" "}
          <Link href="/k53-questions/vehicle-controls">vehicle controls questions and answers</Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
