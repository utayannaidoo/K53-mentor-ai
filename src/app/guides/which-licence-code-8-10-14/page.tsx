import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Code 8 vs Code 10 vs Code 14 — which SA licence do you need?",
  description:
    "What each South African driving licence code covers (B/C1/EC and motorcycle A1/A), minimum ages, and which learner's licence to book.",
};

export default function GuidePage() {
  return (
    <LegalPage
      title="Code 8 vs Code 10 vs Code 14: which licence do you need?"
      intro="South Africans still use the old code numbers, the cards print the new letters, and the DLTC forms use both. Here's the translation table and what each code actually lets you drive."
    >
      <section>
        <h2>The codes, translated</h2>
        <ul>
          <li>
            <strong>Code 8 (B)</strong> — light motor vehicles up to 3&nbsp;500&nbsp;kg GVM:
            normal cars and bakkies, trailer up to 750&nbsp;kg. EB covers heavier trailers. This
            is the licence most people mean by "a driver's licence". Learner's from age 17.
          </li>
          <li>
            <strong>Code 10 (C1)</strong> — goods vehicles between 3&nbsp;500 and
            16&nbsp;000&nbsp;kg GVM: delivery trucks, larger minibuses and small rigid trucks.
            Learner's from age 18. A Code 10 licence also covers what Code 8 covers.
          </li>
          <li>
            <strong>Code 14 (EC)</strong> — articulated and combination vehicles above
            16&nbsp;000&nbsp;kg: truck-tractors with semi-trailers, the big rigs. Learner's from
            age 18. Professional drivers usually also need a PrDP (professional driving permit).
          </li>
        </ul>
      </section>
      <section>
        <h2>Motorcycles are separate</h2>
        <p>
          Motorcycle licences don't stack with car codes — a Code 8 does not let you ride.{" "}
          <strong>Code A1</strong> covers motorcycles up to 125&nbsp;cc (learner's from age 16);{" "}
          <strong>Code A</strong> covers anything bigger (from 18, or 17 for a licence limited
          to certain power classes — confirm current rules with your DLTC). Motorcycle learners
          may not carry any passenger.
        </p>
      </section>
      <section>
        <h2>Which learner's licence to book</h2>
        <p>
          The learner's test itself comes in three classes: <strong>Code 1</strong> for
          motorcycles, <strong>Code 2</strong> for light vehicles up to 3&nbsp;500&nbsp;kg (the
          future Code 8 driver), and <strong>Code 3</strong> for heavy vehicles (the future Code
          10/14 driver). Book the learner class that matches the driving licence you're working
          toward — the theory overlaps heavily, but the vehicle-controls questions differ by
          class.
        </p>
      </section>
      <section>
        <h2>Studying for a specific code</h2>
        <p>
          Most study apps only cover cars. K53 Mentor has dedicated question banks, flashcards
          and scenarios for motorcycle (A1/A) and heavy-vehicle (Code 10/14) learners — air
          brakes, tail swing, lane positioning, helmet law and the rest — served automatically
          when you pick your code during onboarding.
        </p>
      </section>
    </LegalPage>
  );
}
