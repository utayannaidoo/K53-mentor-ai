import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "K53 pass mark & test format explained (per-section pass marks)",
  description:
    "The K53 learner's test is 64 questions in three sections — and you must pass each section separately. Here are the pass marks and how the scoring works.",
};

export default function GuidePage() {
  return (
    <LegalPage
      title="K53 pass marks & test format, explained"
      intro="The single most misunderstood thing about the learner's test: there is no single pass mark. You must reach the pass mark in each of the three sections."
    >
      <section>
        <h2>The format</h2>
        <p>
          The learner's test is <strong>64 multiple-choice questions</strong> split into three
          sections, each with its own pass requirement:
        </p>
        <ul>
          <li>
            <strong>Vehicle controls</strong> — 8 questions, pass mark <strong>6</strong>
          </li>
          <li>
            <strong>Road signs, signals &amp; markings</strong> — 28 questions, pass mark{" "}
            <strong>23</strong>
          </li>
          <li>
            <strong>Rules of the road</strong> — 28 questions, pass mark <strong>22</strong>
          </li>
        </ul>
        <p>
          That means the effective overall requirement is 51 out of 64 (about 80%) — but scoring
          51 the "wrong way" still fails. Get 28/28 on signs and 21/28 on rules, and you fail on
          rules despite an excellent total.
        </p>
      </section>
      <section>
        <h2>Why people fail</h2>
        <p>
          The controls section is tiny — just 8 questions with a pass mark of 6 — so two careless
          answers there can sink an otherwise strong attempt. And because most learners practise
          signs the hardest, <strong>rules of the road</strong> is the most common failing
          section: distances, right-of-way order, and parking/stopping restrictions are exactly
          the details that memorising old papers doesn't teach.
        </p>
      </section>
      <section>
        <h2>What a smart practice plan looks like</h2>
        <p>
          Track your accuracy per section, not overall. If you're at 90% on signs and 70% on
          rules, more sign practice is wasted effort — the marginal hour belongs to your weakest
          section. That per-section targeting is exactly how K53 Mentor's study plan decides what
          you see each day, and its mock exams apply the real per-section pass marks so a pass in
          practice means a pass at the DLTC.
        </p>
      </section>
      <section>
        <h2>Test-day scoring notes</h2>
        <ul>
          <li>There is no negative marking — never leave a question blank.</li>
          <li>Every question has exactly one correct option.</li>
          <li>
            Centres administer the test on paper or computer depending on location; the content
            and pass marks are the same.
          </li>
        </ul>
      </section>
    </LegalPage>
  );
}
