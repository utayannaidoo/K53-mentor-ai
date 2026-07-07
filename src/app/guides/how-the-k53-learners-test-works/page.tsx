import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "How the K53 learner's licence test works (South Africa)",
  description:
    "A plain-English walkthrough of the SA K53 learner's test: what's in it, how long it takes, what to bring to the DLTC, and how booking works.",
};

export default function GuidePage() {
  return (
    <LegalPage
      title="How the K53 learner's licence test works"
      intro="If you've never sat the learner's test, here is the whole process — booking, test day, and what the test actually contains — without the folklore."
    >
      <section>
        <h2>What the test contains</h2>
        <p>
          The learner's licence test is a theory test of 64 multiple-choice questions covering
          three areas: <strong>vehicle controls</strong> (8 questions), <strong>road signs,
          signals and markings</strong> (28 questions) and <strong>rules of the road</strong>{" "}
          (28 questions). You need to pass every section on its own — a brilliant score on signs
          cannot rescue a weak score on rules. You typically get about an hour, which is more
          than enough if you've practised.
        </p>
      </section>
      <section>
        <h2>Booking the test</h2>
        <p>
          You book at a Driving Licence Testing Centre (DLTC), and in most provinces online via
          the NaTIS system (natis.gov.za). You'll choose a centre, a date and pay the booking
          fee. Demand is high in the metros — book well before you want to take the test.
        </p>
      </section>
      <section>
        <h2>What to bring on test day</h2>
        <ul>
          <li>Your ID document (or valid passport), plus a copy</li>
          <li>Two identical black-and-white ID photos (some centres take the photos there)</li>
          <li>Proof of residence</li>
          <li>The booking confirmation and payment receipt</li>
        </ul>
        <p>
          Requirements vary slightly by centre and change over time — confirm with your DLTC
          when you book.
        </p>
      </section>
      <section>
        <h2>Age requirements</h2>
        <p>
          You may take the learner's test from age <strong>16</strong> for a motorcycle up to
          125&nbsp;cc (code A1), <strong>17</strong> for light motor vehicles (code B / "code
          8"), and <strong>18</strong> for heavy vehicles. A learner's licence is valid for 24
          months — your driving test must happen inside that window or you rewrite.
        </p>
      </section>
      <section>
        <h2>How to prepare (the honest version)</h2>
        <p>
          Most people fail not because the material is hard but because they memorise a stack of
          old question papers instead of learning the system behind the answers. Signs follow
          patterns (shape and colour tell you the sign's job before you read it), and the rules
          are a small set of principles applied over and over. Practise with feedback — knowing{" "}
          <em>why</em> an answer is right is what survives exam pressure.
        </p>
      </section>
    </LegalPage>
  );
}
