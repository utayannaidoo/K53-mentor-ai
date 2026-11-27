import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "PrDP: professional driving permit categories, age & how to apply",
  description:
    "Who needs a South African PrDP, what categories G, P and D cover, the minimum ages, the medical and criminal-record rules, and how long the permit lasts.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="prdp-professional-driving-permit"
      title="PrDP: the professional driving permit explained"
      intro="A driving licence says which vehicles you can drive. A professional driving permit says you may drive them for work: trucks over 3,5 tonnes, buses, taxis and dangerous goods. It sits on top of your licence, it expires every two years, and some offences keep you from getting one."
      faq={[
        {
          question: "What are the PrDP categories?",
          answer:
            "G (goods) covers goods vehicles over 3 500 kg and breakdown vehicles. P (passengers) covers everything in G plus buses, minibuses, vehicles carrying 12 or more people and vehicles carrying people for reward. D (dangerous goods) covers everything in P plus vehicles carrying dangerous goods.",
        },
        {
          question: "How old must you be for a PrDP?",
          answer:
            "21 for category P and 25 for category D. The regulations set no separate age for category G, but you need the driving licence for the vehicle, which for a heavy goods vehicle means at least 18.",
        },
        {
          question: "How long is a PrDP valid?",
          answer:
            "24 months. If you apply on or before the expiry date, the new permit runs for 24 months from the day after the old one expires. The regulations give no grace period once it has expired.",
        },
        {
          question: "Do I need a PrDP to drive an Uber or a taxi?",
          answer:
            "Yes. Any motor vehicle used to carry people for reward needs a PrDP, which means category P, from age 21. It applies to an ordinary car as much as to a minibus.",
        },
        {
          question: "Does a learner need a PrDP to practise in a truck or bus?",
          answer:
            "No, but the person supervising must hold a valid PrDP for that vehicle as well as a driving licence for it.",
        },
      ]}
    >
      <section>
        <h2>Who must hold one</h2>
        <p>You need a PrDP to drive any of these on a public road:</p>
        <ul>
          <li>
            a <strong>goods vehicle</strong> with a gross vehicle mass over{" "}
            <strong>3&nbsp;500&nbsp;kg</strong>, and any <strong>breakdown vehicle</strong>;
          </li>
          <li>
            a <strong>bus</strong>, and a <strong>minibus</strong> over 3&nbsp;500&nbsp;kg or built
            for <strong>12 or more people</strong> including the driver;
          </li>
          <li>
            any vehicle <strong>carrying people for reward</strong>, or operated under an
            operating licence — a car used for e-hailing included;
          </li>
          <li>any vehicle actually carrying 12 or more people including the driver;</li>
          <li>a vehicle over 3&nbsp;500&nbsp;kg carrying <strong>dangerous goods</strong>.</li>
        </ul>
        <p>
          A hearse and a tractor are exempt, as are traffic officers and examiners on duty. So is a{" "}
          <strong>learner</strong>, as long as the person supervising holds a valid PrDP for that
          vehicle.
        </p>
      </section>
      <section>
        <h2>The three categories: G, P and D</h2>
        <ul>
          <li>
            <strong>G — goods.</strong> Goods vehicles over 3&nbsp;500&nbsp;kg and breakdown
            vehicles.
          </li>
          <li>
            <strong>P — passengers.</strong> Everything in G, plus buses, minibuses, vehicles
            carrying 12 or more people and vehicles carrying people for reward.
          </li>
          <li>
            <strong>D — dangerous goods.</strong> Everything in P, plus vehicles carrying dangerous
            goods. D is the widest category.
          </li>
        </ul>
        <p>
          The permit only works together with your licence. A PrDP is valid only for a vehicle you
          hold a <strong>driving licence</strong> for. A Code 8 driver with a category P permit may
          carry paying passengers in a car, but not drive a bus. For that they
          need a heavy licence too — see{" "}
          <Link href="/guides/which-licence-code-8-10-14">Code 8 vs Code 10 vs Code 14</Link>.
        </p>
      </section>
      <section>
        <h2>Age and the rules that disqualify you</h2>
        <ul>
          <li>
            <strong>21</strong> for category P and <strong>25</strong> for category D. G has no
            age of its own, so the floor is the licence it needs: 18 for a Code 10.
          </li>
          <li>
            A <strong>medical certificate</strong> on form MC from a registered doctor or
            occupational health practitioner, signed in the <strong>two months</strong> before you
            apply.
          </li>
          <li>
            No conviction, and no admission of guilt paid, in the last <strong>five years</strong>{" "}
            for driving under the influence, driving over the alcohol limit or{" "}
            <strong>reckless driving</strong>. For P and D, no offence involving{" "}
            <strong>violence</strong> either.
          </li>
          <li>Your licence and any existing permit must not be suspended or cancelled.</li>
        </ul>
        <p>
          Once you hold a PrDP, the alcohol limit drops to 0,02&nbsp;g per 100&nbsp;ml of blood,
          less than half the ordinary limit.
        </p>
      </section>
      <section>
        <h2>How to apply</h2>
        <p>
          Apply at a <strong>driving licence testing centre</strong> on <strong>form PD1</strong>.
          Take:
        </p>
        <ul>
          <li>your identity document and two photographs;</li>
          <li>your original driving licence for the vehicle;</li>
          <li>the completed form MC medical certificate;</li>
          <li>any PrDP you already hold;</li>
          <li>the fee, which each province sets.</li>
        </ul>
        <p>
          The centre checks the application against the disqualifications, tests your eyesight
          against the standard for your code, and asks the nearest SAPS station for a report of the convictions
          listed above. The eyesight standard is stricter for heavy codes, so read the{" "}
          <Link href="/guides/learners-licence-eye-test">eye test guide</Link> if you have any
          doubt.
        </p>
        <p>
          <strong>Dangerous goods:</strong> the regulations allow the Minister to make an
          approved training certificate, from the six months before you apply, compulsory for
          category D. Expect to need the course, and ask the testing centre what it currently
          requires.
        </p>
      </section>
      <section>
        <h2>Renewal: two years, no grace period</h2>
        <p>
          A PrDP is valid for <strong>24 months</strong>. Apply again{" "}
          <strong>on or before the expiry date</strong> and the new permit carries on from the day
          after the old one expires, so you lose nothing by renewing early. You need a new medical
          certificate each time. The regulations give no grace period after expiry, and driving a
          PrDP vehicle with an expired permit is driving it without one.
        </p>
      </section>
      <section>
        <h2>Getting there</h2>
        <p>
          Most professional drivers start with the heavy-vehicle learner's licence, then the
          heavy driving test, then the permit. The{" "}
          <Link href="/guides/code-10-code-14-learners-licence">
            Code 10 &amp; Code 14 learner's licence guide
          </Link>{" "}
          covers the theory, and the{" "}
          <Link href="/guides/code-10-code-14-driving-test">heavy-vehicle driving test guide</Link>{" "}
          covers the yard and road test. Choosing Code 10 or 14 in K53 Mentor switches the practice
          questions to heavy vehicles.
        </p>
      </section>
    </LegalPage>
  );
}
