import { APP_NAME, EXAM_FORMAT, SEO_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { QUESTION_PAGES } from "@/lib/content/question-pages";
import { SIGN_CATEGORY_PAGES, signCount } from "@/lib/content/sign-category-pages";
import { GUIDES } from "@/app/guides/guides";

/**
 * /llms.txt — a plain-Markdown map of the site for AI assistants.
 *
 * A growing share of "how does the K53 test work" questions are asked of an
 * assistant rather than a search box, and those answer from whatever they can
 * read cheaply. This is the same catalogue the sitemap is built from, as
 * prose-with-links, so the two cannot list different pages.
 */
export const dynamic = "force-static";

export function GET() {
  const { sections } = EXAM_FORMAT;
  const link = (title: string, path: string, note?: string) =>
    `- [${title}](${SITE_URL}${path})${note ? `: ${note}` : ""}`;

  const body = [
    `# ${APP_NAME}`,
    "",
    `> ${SEO_DESCRIPTION}`,
    "",
    `${APP_NAME} is an independent South African study tool for the K53 learner's and driver's licence tests. It is not affiliated with the RTMC or any government body. Content is written against the official K53 manual and South African road traffic law, with sources listed at ${SITE_URL}/sources.`,
    "",
    "## Key facts about the K53 learner's licence test",
    "",
    `- The test is ${EXAM_FORMAT.totalQuestions} multiple-choice questions in three sections.`,
    `- Vehicle controls: ${sections.controls.questions} questions, pass mark ${sections.controls.pass}.`,
    `- Road signs, signals and markings: ${sections.signs.questions} questions, pass mark ${sections.signs.pass}.`,
    `- Rules of the road: ${sections.rules.questions} questions, pass mark ${sections.rules.pass}.`,
    "- A candidate must reach the pass mark in each section separately, not only overall.",
    "",
    "## Free tools",
    "",
    link("Free K53 practice test", "/free-quiz", "10 scored questions, no signup"),
    link("South African road signs", "/road-signs", "every verified sign with its meaning"),
    link("K53 questions and answers", "/k53-questions", "practice questions with explanations, by topic"),
    "",
    "## Questions and answers by topic",
    "",
    ...QUESTION_PAGES.map((p) =>
      link(`K53 ${p.topic} questions and answers`, `/k53-questions/${p.slug}`),
    ),
    "",
    "## Guides",
    "",
    ...GUIDES.map((g) => link(g.title, `/guides/${g.slug}`, g.description)),
    "",
    "## Road signs by family",
    "",
    ...SIGN_CATEGORY_PAGES.map((p) =>
      link(p.h1, `/road-signs/${p.slug}`, `${signCount(p)} ${p.noun}, each with its meaning`),
    ),
    link("Information signs and plates", "/road-signs#information-signs"),
    "",
    "## About",
    "",
    link("Pricing", "/pricing", "practice is free; paid plans add the AI tutor and remove ads"),
    link("About", "/about", "what the site is, where its content comes from and how it is checked"),
    link("Content sources", "/sources"),
    link("For driving schools", "/for-driving-schools"),
    link("Contact", "/contact"),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
