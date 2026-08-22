import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "South African road signs explained: shapes, colours & categories",
  description:
    "Regulatory, warning and guidance signs — what each shape and colour tells you before you read a word, and how the test examines them across 28 questions.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="k53-road-signs-explained"
      title="South African road signs explained: shapes, colours & categories"
      updated="2026-08-22"
      intro="Nobody memorises South Africa's road signs one plate at a time — there are too many, and the test knows it. Category, shape and colour form a grammar that tells you what a sign is allowed to do before you've read it."
    >
      <section>
        <h2>The three jobs a sign can do</h2>
        <p>
          Every sign on a South African road does one of three jobs, defined
          under the National Road Traffic Act framework:
        </p>
        <ul>
          <li>
            <strong>Regulatory (control) signs</strong> are orders with the
            force of law — stop, yield, speed limits, no entry. Disobeying one
            isn't a preference, it's an offence.
          </li>
          <li>
            <strong>Warning signs</strong> flag a hazard ahead: a sharp bend,
            pedestrians, a level crossing. They advise rather than command.
          </li>
          <li>
            <strong>Guidance and information signs</strong> help you navigate —
            routes, directions, distances, facilities. Ignoring them costs you
            nothing but time.
          </li>
        </ul>
        <p>
          Identify the job first and you already know how much the sign can
          demand of you — which is most of what sign questions actually ask.
        </p>
      </section>
      <section>
        <h2>Shapes carry meaning before words do</h2>
        <ul>
          <li>
            <strong>Octagon</strong> — reserved for stop alone. If it's an
            octagon, it means stop; no other sign may use the shape.
          </li>
          <li>
            <strong>Inverted triangle</strong> — reserved for yield alone, same
            logic.
          </li>
          <li>
            <strong>Circles (discs)</strong> — regulatory orders: prohibitions
            and restrictions in a red ring, positive commands such as a
            compulsory direction on blue discs.
          </li>
          <li>
            <strong>Upright triangles and diamonds</strong> — warnings about
            conditions on the road ahead.
          </li>
          <li>
            <strong>Rectangles</strong> — information and guidance: directions,
            distances, route markers, services.
          </li>
        </ul>
        <p>
          Learn this table once and "hundreds of signs" collapses into five
          buckets — the shape narrows the job before you've read a word.
        </p>
      </section>
      <section>
        <h2>Colours narrow it further</h2>
        <ul>
          <li>
            <strong>Red</strong> — prohibition and restriction: the ring around
            a speed limit, the border on stop and yield.
          </li>
          <li>
            <strong>Blue</strong> — guidance and information, plus those blue
            discs issuing compulsory instructions.
          </li>
          <li>
            <strong>Yellow</strong> — temporary conditions. A familiar sign on a
            yellow background means roadworks or a deviation: the normal rule is
            suspended here, the temporary one applies.
          </li>
          <li>
            <strong>Green</strong> — destination guidance: routes, directions
            and distances on the big roadside boards.
          </li>
          <li>
            <strong>Brown</strong> — tourism and leisure facilities.
          </li>
        </ul>
        <p>
          Shape plus colour identifies most plates at a glance — which is
          exactly the fluency the test rewards and exam pressure requires.
        </p>
      </section>
      <section>
        <h2>Signals and markings share the section</h2>
        <p>
          The exam section is officially <em>road signs, signals and markings</em>
          {" "}— traffic lights, painted road markings and the hand signals an
          officer uses to direct traffic are examined inside it too. Study them
          as one subject, because the paper does.
        </p>
      </section>
      <section>
        <h2>How the test examines signs</h2>
        <p>
          This section carries <strong>28 of the 64 questions</strong>, with a
          pass mark of <strong>23</strong>. And the questions go beyond naming a
          plate — expect applications: who gives way under this sign, what it
          permits at this hour. That's where{" "}
          <strong>qualifier plates</strong> catch people out: a small
          supplementary panel beneath a sign changes its meaning — hours
          (<em>06:00–09:00</em>), vehicle classes, distances. Always read the
          plate under the plate.
        </p>
      </section>
      <section>
        <h2>How to study them</h2>
        <p>
          Categories and shapes first, individual plates second, applications
          last. Once shape and colour carry the meaning for you, new signs slot
          into buckets instead of stacking onto a memorisation pile — and
          application questions become reading comprehension rather than
          recall.
        </p>
        {/* /study/* is auth-gated — organic readers landing here from search
            were sent to a login screen. The free assessment is the public
            entry point. */}
        <p>
          K53 Mentor's <Link href="/onboarding">free assessment</Link> checks
          your signs against the real pass mark and feeds whatever you miss back
          into your study plan until it sticks.
        </p>
      </section>
    </LegalPage>
  );
}
