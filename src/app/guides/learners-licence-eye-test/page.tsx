import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "The learner's licence eye test: what the DLTC checks",
  description:
    "The eyesight standard in regulation 102, what the screening machine asks you to do, how glasses and contact lenses count, and what happens if you don't meet the standard at the DLTC.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="learners-licence-eye-test"
      title="The learner's licence eye test: what the DLTC checks and how to pass"
      intro="Before you write a single question, the testing centre checks your eyes. It takes a few minutes and it isn't a trick: the standard is written into the regulations, so you can know before you arrive whether you meet it."
      faq={[
        {
          question: "Can I wear glasses for the learner's licence eye test?",
          answer:
            "Yes. Regulation 102 sets the standard with or without refractive correction, so glasses and contact lenses count. If you need them to meet the standard, your licence carries a restriction, and the only vision restriction South African licences use is the one for spectacles or contact lenses.",
        },
        {
          question: "What eyesight do you need for a Code 8 (Code B) licence?",
          answer:
            "At least 6/12 in each eye. If one eye is weaker than 6/12 or blind, the other eye must reach 6/9 on its own. You also need a field of vision of at least 70 degrees to the outer side of each eye, or 115 degrees in total if one eye falls short.",
        },
        {
          question: "What happens if I fail the eye test at the DLTC?",
          answer:
            "You may have your eyes tested by a registered optometrist or ophthalmologist at your own cost and take the result back to the testing centre, which must accept an accurate result. If you still fall below the standard for the code you applied for, the centre may not issue a licence for that code.",
        },
        {
          question: "Can an optometrist do the eye test instead of the testing centre?",
          answer:
            "Yes. The government's learner's licence service page says you may have the eye test done by a qualified optometrist and submit the form at the testing centre. The same applies when you renew your driving licence card.",
        },
      ]}
    >
      <section>
        <h2>Where the eye test fits</h2>
        <p>
          The eye test is part of your <strong>learner's licence application</strong>, not part
          of the test paper. None of the 64 questions is about eyesight, and you can't make up
          for poor eyesight with a good score. You meet the standard first, and then you write.
        </p>
        <p>
          You have two ways to do it. The testing centre can screen you on the day, or you can
          have the test done by a <strong>qualified optometrist</strong> beforehand and hand in
          the form at the centre. It isn't a one-off either. Every time you renew your driving
          licence card, which is valid for <strong>five years</strong>, you're tested again or
          bring an optometrist's report. Meeting the standard is something you have to keep
          doing for as long as you drive.
        </p>
      </section>
      <section>
        <h2>The standard you have to meet</h2>
        <p>
          The rule is <strong>regulation 102</strong> of the National Road Traffic Regulations.
          It covers two things: <em>visual acuity</em>, which is how clearly you see detail, and
          your <em>field of vision</em>, which is how far to the side you can see while looking
          straight ahead.
        </p>
        <p>
          For a motorcycle or light motor vehicle (codes A1, A, B and EB, which includes the
          licence still widely called Code 8):
        </p>
        <ul>
          <li>
            <strong>6/12 in each eye</strong>, with or without glasses or contact lenses;
          </li>
          <li>
            or, where one eye is under 6/12 or blind, <strong>6/9 in the other eye</strong>;
          </li>
          <li>
            a field of at least <strong>70°</strong> to the outer side of each eye, or{" "}
            <strong>115°</strong> in total where one eye falls short or is blind.
          </li>
        </ul>
        <p>
          For the heavy codes (C1, C, EC1 and EC, taught as{" "}
          <Link href="/guides/code-10-code-14-learners-licence">Code 10 and Code 14</Link>), the
          bar is higher: <strong>6/9 in each eye</strong>, with no one-eye alternative, and{" "}
          <strong>70°</strong> to the outer side of each eye.
        </p>
        <p>
          The figures are Snellen notation. 6/6 is full acuity, and the larger the second number,
          the weaker the eye. The Motus manual's chart puts 6/12 at a 15% loss of acuity and
          6/60 at 80%. The standard hasn't been revised since 1998, so an older study guide will
          give you the same numbers.
        </p>
      </section>
      <section>
        <h2>The rule is per eye, and that catches people out</h2>
        <p>
          You'll often see the standard summarised as "6/12 in one eye, or both eyes together".
          That isn't what the regulation says, and the difference matters. Each eye is measured
          on its own, and a weak eye can only be carried by a <em>strong</em> one:
        </p>
        <ul>
          <li>
            <strong>6/12 left, 6/36 right</strong> fails codes A1, A, B and EB. The right eye is
            under 6/12, so the left has to reach 6/9, and 6/12 doesn't.
          </li>
          <li>
            <strong>6/6 left, 6/36 right</strong> passes those codes, because the left eye clears
            6/9. It fails the heavy codes, which need 6/9 in both eyes.
          </li>
          <li>
            <strong>6/12 in both eyes</strong> passes the light codes and fails the heavy ones.
          </li>
        </ul>
        <p>
          The last example is why your code matters. If you're aiming for Code 10 or 14, check
          your eyes against the heavy standard before you book, not against the one your friends
          met for Code 8.
        </p>
      </section>
      <section>
        <h2>What happens at the screening machine</h2>
        <p>
          Most centres screen you on a machine, not a wall chart. You look into it and it shows
          you rows of a capital <strong>E</strong> turned to face different directions. It's
          sometimes called the "tumbling E" or "illiterate E". You say which way the arms of each
          E point. You're never asked to read a letter, so it doesn't matter what language you
          read in or how well you read. Each eye is tested on its own and both eyes together.
        </p>
        <p>A few things make the screening go smoothly:</p>
        <ul>
          <li>
            <strong>Bring your glasses or contact lenses</strong> if you wear them, and use them
            for the test. The standard counts corrected vision, so passing with glasses is a pass.
          </li>
          <li>
            <strong>Answer what you see.</strong> If a row is a blur, say so. The standard is
            the sight you'll need for reading the road, and you'll be held to it at every
            renewal.
          </li>
          <li>
            <strong>Think about going to an optometrist first.</strong> Staff at Gauteng testing
            centres have reported screening machines going offline, sometimes for days, because
            of network faults, fibre theft and power cuts. With an optometrist's form, your
            application doesn't depend on the machine working that morning.
          </li>
        </ul>
      </section>
      <section>
        <h2>Glasses, contact lenses and your licence</h2>
        <p>
          If you need correction to meet the standard, that's recorded as a restriction on your
          licence. In South Africa the only vision restriction is the one for{" "}
          <strong>spectacles or contact lenses</strong>. From then on, the restriction applies
          every time you drive, not just on test day: the standard you met with your glasses on
          is the standard you're licensed to drive at.
        </p>
        <p>
          If you've never had your eyes tested and you struggle to read signs from a distance, see
          an optometrist before you book. Learning that you need glasses at the DLTC means another
          trip and another booking. And reading signs matters on paper too:{" "}
          <Link href="/guides/k53-road-signs-explained">signs, signals and markings</Link> are 28
          of the 64 questions on the test you're about to write.
        </p>
      </section>
      <section>
        <h2>If you don't meet the standard</h2>
        <p>
          Not passing the screening isn't the end. Regulation 102 lets you go to a{" "}
          <strong>registered optometrist or ophthalmologist</strong>, at your own cost, and be
          tested against the same standard. The testing centre must accept that result if it
          accurately states your Snellen acuity and your field of vision in degrees. Because the
          standard counts corrected vision, if glasses or contact lenses bring you up to it, you
          go back wearing them and qualify with the spectacles restriction.
        </p>
        <p>
          If you still fall below the standard, the centre may not issue a licence{" "}
          <strong>for the code you applied for</strong>. That can leave a lower code open to you.
          Someone with 6/12 in each eye misses the heavy-vehicle standard but meets the
          light-vehicle one. When existing drivers are found below the standard, testing-centre
          managers describe the code being downgraded rather than the licence being refused
          outright. Ask your optometrist which code your eyes support before you rebook.
        </p>
      </section>
      <section>
        <h2>The rest of the application</h2>
        <p>
          The eye test is one step of booking day. The documents, photos and age limits are in{" "}
          <Link href="/guides/book-your-learners-licence">
            our guide to booking your learner's licence
          </Link>
          , and{" "}
          <Link href="/guides/how-the-k53-learners-test-works">
            how the K53 learner's test works
          </Link>{" "}
          walks through the paper you'll write once your eyes are cleared. If you're not sure
          which code to apply for, start with{" "}
          <Link href="/guides/which-licence-code-8-10-14">Code 8 vs Code 10 vs Code 14</Link>.
        </p>
        {/* /study/* is auth-gated — organic readers landing here from search
            were sent to a login screen. The free assessment is the public
            entry point. */}
        <p>
          Once you're booked, K53 Mentor's <Link href="/onboarding">free practice</Link> marks
          you section by section, the way the examiner does, so you know where to spend the weeks
          before test day.
        </p>
      </section>
    </LegalPage>
  );
}
