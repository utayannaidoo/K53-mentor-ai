import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Code EB licence: when you need it to tow a trailer in South Africa",
  description:
    "Code 8 covers a trailer up to 750 kg GVM; anything heavier needs Code EB. How to tell which you need, how to get it, and the trailer brake and towing rules.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="code-eb-trailer-licence"
      title="Code EB licence: when you need it to tow a trailer"
      intro="A Code 8 licence lets you tow a small trailer. Once the trailer is rated over 750 kg, you need Code EB. What decides it is the trailer's rating, not what you load on it, so check the trailer's GVM before you hitch up."
      faq={[
        {
          question: "Can I tow a trailer with a Code 8 licence?",
          answer:
            "Yes, if the trailer's gross vehicle mass (GVM) is 750 kg or less. A trailer with a GVM over 750 kg needs a Code EB licence.",
        },
        {
          question: "Does an empty trailer still count as over 750 kg?",
          answer:
            "Yes. The rule uses the trailer's GVM, the maximum mass it is rated to carry including its load. A trailer rated over 750 kg needs Code EB whether it is loaded or empty.",
        },
        {
          question: "Is there a separate learner's licence for Code EB?",
          answer:
            "No. You write the ordinary light-vehicle learner's licence (Code 2), then take the EB driving test with the trailer attached. You must be at least 18.",
        },
        {
          question: "Does my trailer need its own brakes?",
          answer:
            "It depends on its GVM compared with the tare of the towing vehicle. A trailer up to 750 kg and no heavier than half the vehicle's tare needs only a parking brake. Heavier trailers need an overrun or service brake as well, and over 3 500 kg a service brake is compulsory.",
        },
      ]}
    >
      <section>
        <h2>750 kg: the line between Code 8 and Code EB</h2>
        <ul>
          <li>
            <strong>Code 8 (B)</strong> — a light motor vehicle, with or without a trailer whose{" "}
            <strong>GVM is not more than 750&nbsp;kg</strong>.
          </li>
          <li>
            <strong>Code EB</strong> — the same light vehicle (up to 3&nbsp;500&nbsp;kg) drawing a
            trailer with a <strong>GVM over 750&nbsp;kg</strong>. EB also covers everything Code 8
            does.
          </li>
        </ul>
        <p>
          <strong>GVM</strong> is the gross vehicle mass: the maximum the trailer is rated to weigh
          with its load. It is the trailer's rating that counts, so a caravan rated at
          1&nbsp;200&nbsp;kg needs Code EB even when it is empty.
        </p>
        <p>
          If the towing vehicle is itself over 3&nbsp;500&nbsp;kg, you are into the heavy codes:
          see{" "}
          <Link href="/guides/which-licence-code-8-10-14">Code 8 vs Code 10 vs Code 14</Link>.
        </p>
      </section>
      <section>
        <h2>How to get Code EB</h2>
        <ul>
          <li>
            You must be <strong>18</strong> or older.
          </li>
          <li>
            There is <strong>no EB learner's licence</strong>. The ordinary light-vehicle learner's
            (Code 2) covers a light vehicle with a trailer, so you write the same test as every
            Code 8 learner. Start with{" "}
            <Link href="/guides/how-the-k53-learners-test-works">
              how the learner's test works
            </Link>
            .
          </li>
          <li>
            The driving test uses its own K53 volume for light-vehicle combinations, and it is
            done <strong>with the trailer attached</strong>.
          </li>
        </ul>
        <p>
          You can take the Code 8 test first and add EB later, but EB includes Code 8. If you
          know you will be towing, testing for EB covers both.
        </p>
      </section>
      <section>
        <h2>Trailer brakes</h2>
        <p>
          What the trailer needs depends on its GVM compared with the{" "}
          <strong>tare</strong> (unladen mass) of the vehicle towing it.
        </p>
        <ul>
          <li>
            <strong>Up to 750&nbsp;kg, and no more than half the vehicle's tare</strong>: a{" "}
            <strong>parking brake</strong>, or some other way of keeping it stationary.
          </li>
          <li>
            <strong>Up to 750&nbsp;kg, between half and all of the tare</strong>: a parking brake
            plus an <strong>overrun</strong> brake or a service brake.
          </li>
          <li>
            <strong>Over 750&nbsp;kg up to 3&nbsp;500&nbsp;kg, no more than the tare</strong>: a
            parking brake plus an overrun or service brake.
          </li>
          <li>
            <strong>Heavier than the towing vehicle's tare, or over 3&nbsp;500&nbsp;kg</strong>: a
            parking brake plus a <strong>service brake</strong> that the driver can work from the
            towing vehicle while moving.
          </li>
        </ul>
        <p>
          The regulations do not set a single maximum that a car may tow. The limit to check is
          the <strong>towing capacity</strong> the manufacturer gives for your vehicle.
        </p>
      </section>
      <section>
        <h2>Towing rules that come up in the test</h2>
        <ul>
          <li>
            A vehicle may draw <strong>one or two trailers</strong>, no more.
          </li>
          <li>
            Towing another vehicle: the rope, chain or bar between them may be no longer than{" "}
            <strong>3,5&nbsp;m</strong>, and a licensed driver must steer the towed vehicle.
          </li>
          <li>
            Above <strong>30&nbsp;km/h</strong> you need a <strong>tow-bar or drawbar</strong>. A
            rope or chain means 30&nbsp;km/h at most.
          </li>
          <li>
            <strong>No passengers in a towed vehicle</strong>, unless it is a semi-trailer. That
            is the answer the learner's test expects. The regulation itself bars passengers above
            30&nbsp;km/h.
          </li>
          <li>A motorcycle, tricycle or quadricycle may not tow.</li>
          <li>
            There is no separate speed limit for a car towing a trailer: the ordinary 60, 100 and
            120&nbsp;km/h limits apply. The 80&nbsp;km/h limit is for goods vehicles and
            combinations over 9&nbsp;000&nbsp;kg.
          </li>
        </ul>
        <p>
          The rest of the numbers the test asks about are in the{" "}
          <Link href="/guides/k53-rules-of-the-road">rules of the road guide</Link>, and you can
          practise them in the <Link href="/k53-questions">questions and answers</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
