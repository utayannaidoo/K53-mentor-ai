import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";
import { APP_NAME, BUSINESS, EXAM_FORMAT, SUPPORT_EMAIL } from "@/lib/constants";
import { GUIDES } from "@/app/guides/guides";
import { QUESTION_PAGES } from "@/lib/content/question-pages";
import { VERIFIED_SIGNS } from "@/lib/content/signs";
import {
  FLASHCARD_META,
  MODULE_META,
  QUESTION_DIFFICULTY,
  SCENARIO_META,
} from "@/lib/content/meta";

export const metadata: Metadata = {
  title: "About us",
  description: `What ${APP_NAME} is, who it's for, where its K53 material comes from, how it's checked, and how the site is paid for.`,
  alternates: { canonical: "/about" },
};

/**
 * Who runs the site and why its content can be trusted.
 *
 * A reviewer (AdSense, or a learner deciding whether to believe a road-rule
 * answer) looks for this page before anything else, and the site had none:
 * /sources says what the material is based on and /contact says how to reach
 * us, but nothing tied them together. Every count is read from the content
 * bank, so the page cannot drift from what is actually on the site.
 */
export default function AboutPage() {
  const questions = Object.keys(QUESTION_DIFFICULTY).length;
  const signs = EXAM_FORMAT.sections.signs;

  return (
    <LegalPage
      title={`About ${APP_NAME}`}
      updated="2026-11-01"
      intro={`${APP_NAME} is a South African study site for the K53 learner's and driver's licence tests. This page explains who it is for, where the material comes from, how we check it, and how the site pays for itself.`}
    >
      <section>
        <h2>Why it exists</h2>
        <p>
          The learner&apos;s licence test is {EXAM_FORMAT.totalQuestions} questions in three
          sections, and each section has its own pass mark. A strong total does not save you: on
          road signs you may get only {signs.questions - signs.pass} of {signs.questions} wrong, and
          one more wrong answer fails the whole test. Most learners prepare by memorising a list of
          answers, which works until the test words a question differently.
        </p>
        <p>
          We built {APP_NAME} to teach the reason behind each answer: what a sign orders you to do,
          not just its name, and why a rule exists, so a reworded question still makes sense. The
          study app tracks every section on its own, so you can see which one would fail you before
          the testing centre does.
        </p>
      </section>

      <section>
        <h2>What&apos;s on the site</h2>
        <p>Free to read, with no account:</p>
        <ul>
          <li>
            <Link href="/guides">{GUIDES.length} K53 guides</Link> on the test format, booking, licence
            codes, the yard test, road markings and the rules learners most often get wrong.
          </li>
          <li>
            A <Link href="/road-signs">library of {VERIFIED_SIGNS.length} road signs</Link> from the
            official manual, searchable by name, shape and colour.
          </li>
          <li>
            <Link href="/k53-questions">K53 questions and answers</Link> across {QUESTION_PAGES.length}{" "}
            topics, each with the reasoning written out.
          </li>
          <li>
            A <Link href="/free-quiz">free ten-question practice test</Link>.
          </li>
        </ul>
        <p>With a free account, the full study app:</p>
        <ul>
          <li>
            {questions.toLocaleString("en-GB")} practice questions,{" "}
            {FLASHCARD_META.length.toLocaleString("en-GB")} flashcards and {SCENARIO_META.length}{" "}
            road scenarios, scheduled so you revisit what you got wrong.
          </li>
          <li>
            Mock exams in the official {EXAM_FORMAT.totalQuestions}-question format, scored per
            section the way the real test is.
          </li>
          <li>
            {MODULE_META.length} driver&apos;s licence modules for the yard and road test, covering
            the pre-trip inspection, alley docking, parallel parking and the incline start.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where the material comes from</h2>
        <p>
          Everything is written against official South African sources: the National Road Traffic
          Act and its Regulations, the Department of Transport&apos;s manual of road traffic signs,
          and the published K53 practical test procedure. The full list, with links, is on our{" "}
          <Link href="/sources">content sources</Link> page.
        </p>
        <p>
          Questions, flashcards, scenarios and guides are our own writing, not copied from the
          manual or from other question sites. Before a fact goes into the question bank it is
          recorded with the source it came from, and facts with legal weight (following distances,
          speed limits, alcohol limits, licence codes) are checked against the Act and current
          regulations. Road-sign images and their official meanings come from the Department of
          Transport&apos;s manual, and each sign&apos;s name is checked by hand before it gets a
          public page.
        </p>
      </section>

      <section>
        <h2>Corrections</h2>
        <p>
          Road rules change and people make mistakes. Every question in the study app has a link to
          report a problem, which sends us that exact question. You can also write to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. When a correction is confirmed, the
          fix goes out in the next update.
        </p>
      </section>

      <section>
        <h2>The AI tutor</h2>
        <p>
          Paid plans add an AI tutor that answers questions in plain language and explains your
          mistakes. It is told to keep to the same sources as the question bank, but it can still be
          wrong. Where it disagrees with the official manual or the law, the manual and the law are
          right.
        </p>
      </section>

      <section>
        <h2>How the site is paid for</h2>
        <p>
          All study material is free. The free plan shows adverts, served by Google AdSense, and
          that is what pays for it. Paid plans buy the AI tutor and remove the adverts; they do not
          unlock any extra questions. We do not sell personal information. The{" "}
          <Link href="/privacy">privacy policy</Link> explains what we collect and why, and{" "}
          <Link href="/pricing">pricing</Link> lists the plans.
        </p>
        <p>
          {APP_NAME} is independent. We are not affiliated with or endorsed by the Road Traffic
          Management Corporation, the Department of Transport or any driving licence testing centre.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          A real person reads <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          {BUSINESS.legalName ? ` on behalf of ${BUSINESS.legalName}` : ""}. Support, billing and
          privacy requests are covered on the <Link href="/contact">contact page</Link>. If you run a
          driving school, see <Link href="/for-driving-schools">{APP_NAME} for driving schools</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
