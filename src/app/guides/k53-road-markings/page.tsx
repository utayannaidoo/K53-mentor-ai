import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "K53 road markings explained: lines, blocks & arrows",
  description:
    "What every painted line, block and arrow on South African roads actually means — and exactly how those markings are examined in the learner's licence test.",
};

export default function GuidePage() {
  return (
    <LegalPage
      articleSlug="k53-road-markings"
      title="K53 road markings explained: lines, blocks & arrows"
      updated="2026-08-22"
      intro="Paint never shouts, but the learner's test grades it as strictly as any sign. Learn the grammar once — colour, pattern, orientation — and the road-scene diagrams start reading themselves."
    >
      <section>
        <h2>Markings live inside the signs section</h2>
        <p>
          Markings aren't examined as a standalone topic. The exam section is
          officially <em>road signs, signals and markings</em> —{" "}
          <strong>28 of the 64 questions</strong>, with a pass mark of{" "}
          <strong>23</strong> — and painted lines, blocks and arrows share it
          with the plates and the traffic lights. Study the three together,
          because the paper does. If you haven't yet,{" "}
          <Link href="/guides/k53-road-signs-explained">
            our guide to South African road signs
          </Link>{" "}
          covers the plated half of the section; this page is the paint.
        </p>
      </section>
      <section>
        <h2>Lines that run with the road</h2>
        <p>
          Longitudinal markings run parallel to your travel, and each pattern
          is a complete instruction:
        </p>
        <ul>
          <li>
            <strong>Continuous white edge line</strong> — the boundary of the
            drivable surface; hold your position inside it.
          </li>
          <li>
            <strong>Continuous white line between you and another lane</strong>{" "}
            — a wall. Stay on your side; don't cross or overtake across it.
          </li>
          <li>
            <strong>Broken white lane line</strong> — divides lanes travelling
            the same way; move across it when it's safe to do so.
          </li>
        </ul>
        <p>
          The centre of a two-way road belongs to <strong>yellow</strong>, and
          the pattern carries the whole message: a <strong>broken</strong>{" "}
          yellow line may be crossed to overtake when it's safe; a{" "}
          <strong>continuous</strong> yellow line means stay on your side;{" "}
          <strong>two continuous yellow lines</strong> forbid crossing or
          overtaking in <em>either</em> direction; and where a continuous line
          is paired with a broken one, only traffic on the broken side may
          cross.
        </p>
      </section>
      <section>
        <h2>Lines and blocks that run across the road</h2>
        <ul>
          <li>
            <strong>Stop lines</strong> — a solid white bar across your lane at
            a stop sign or red light: come to a complete standstill behind it.
          </li>
          <li>
            <strong>Yield lines</strong> — a row of short white triangles
            across the lane: slow down and give way before you cross them.
          </li>
          <li>
            <strong>Zebra crossings</strong> — broad white stripes across the
            road: pedestrians on the crossing go first, so slow down and stop
            if anyone is on it.
          </li>
          <li>
            <strong>Hatched and boxed areas</strong> — diagonally striped zones
            edged in continuous lines are out of bounds; where the edging is
            broken, cross or enter only when you must and it's safe. Busy city
            intersections are often boxed grid-style to keep standing traffic
            out of the junction itself — the scheme varies by municipality, so
            treat any box as "don't enter unless your exit is clear".
          </li>
        </ul>
      </section>
      <section>
        <h2>Arrows and words painted on the tar</h2>
        <p>
          Lane-use arrows near intersections commit your lane — straight-only,
          left-only, right-only, or a combination — and they carry the same
          weight as the sign that hangs above the same spot. Directional arrows
          through merges and complex bends steer you into the correct path;
          painted words such as <strong>SLOW</strong> or school warnings back up
          the roadside signs on approaches. Councils differ in how much they
          paint, so treat surface lettering as reinforcement: the sign is the
          authority, the paint is the reminder you can't miss.
        </p>
      </section>
      <section>
        <h2>Why white and yellow mean different things</h2>
        <ul>
          <li>
            <strong>White</strong> organises traffic moving in the{" "}
            <em>same</em> direction — lane dividers and edge lines — and
            carries nearly all the across-the-road commands: stop bars, yield
            triangles, zebra blocks, hatching.
          </li>
          <li>
            <strong>Yellow</strong> owns the centre of two-way roads,
            separating opposing flows, and steps in for temporary layouts at
            roadworks, where the fresh paint supersedes the permanent markings
            until the work ends.
          </li>
        </ul>
        <p>
          Read the colour first and half the meaning is settled before you've
          looked at the pattern.
        </p>
      </section>
      <section>
        <h2>How the test examines markings</h2>
        <p>
          Expect a drawing or photograph of a road scene with the question
          hanging off the paint: what does this line permit, who gives way
          here, may you cross to overtake? Three habits catch nearly
          everything:
        </p>
        <ul>
          <li>
            <strong>Read the whole scene before the options.</strong> Which
            marking applies depends on where the question's vehicle sits — the
            same line means different things on either side of it.
          </li>
          <li>
            <strong>Watch the qualifier verbs.</strong> <em>May</em> asks what
            is allowed; <em>must</em> asks what is required. Swapping them
            silently is the classic lost mark.
          </li>
          <li>
            <strong>Note the pattern precisely.</strong> Single versus double,
            continuous versus broken — each flip rewrites the rule, and
            examiners choose the variant you weren't expecting.
          </li>
        </ul>
      </section>
      <section>
        <h2>Practise reading scenes, not just plates</h2>
        <p>
          Marking questions are scene-reading under a clock, which makes them
          prime mock material — a{" "}
          <Link href="/guides/k53-mock-test">timed mock test</Link> rehearses
          the real per-section pass marks, including this shared signs,
          signals and markings section.
        </p>
        {/* /study/* is auth-gated — organic readers landing here from search
            were sent to a login screen. The free assessment is the public
            entry point. */}
        <p>
          Not sure how your marking knowledge scores? K53 Mentor's{" "}
          <Link href="/onboarding">free assessment</Link> marks you the way the
          examiner will, section by section, and feeds what you miss back into
          your study plan until it sticks.
        </p>
      </section>
    </LegalPage>
  );
}
