import { Accordion } from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Is this affiliated with the RTMC? Is the content official?",
    answer:
      "No. K53 Mentor AI is an independent study tool and is not affiliated with or endorsed by the RTMC or any government body. Our content is carefully aligned to the structure of the official K53 manual, but it is not government-issued material.",
  },
  {
    question: "Why pay when there are free K53 apps?",
    answer:
      "Free apps give you the same question bank everyone else has. They can't tell you which categories you're failing, they don't space your revision so it sticks, and they don't have a tutor that explains your mistakes. You're paying for a diagnosis and a plan, not more questions.",
  },
  {
    question: "What if I don't pass?",
    answer:
      "Your subscription keeps working until your test date — and if you don't pass first time, message us and we'll extend your Premium access free until you do. We'd rather you pass than churn.",
  },
  {
    question: "Will it work on my phone with limited data?",
    answer:
      "Yes. K53 Mentor AI is built mobile-first and is light on data — there's no autoplay video, images are kept minimal, and a data-saver mode defers non-essential loads. It's designed for studying on the go in South African conditions.",
  },
  {
    question: "How is my readiness score calculated?",
    answer:
      "It's a weighted blend of your accuracy across all seven categories (signs and rules count for the most, mirroring the real test) and your flashcard mastery. It updates after every session, so you can see your progress move in real time.",
  },
  {
    question: "Do you cover the driver's licence too, not just the learner's?",
    answer:
      "Yes — Premium Plus includes step-by-step yard-test modules for parallel parking, alley docking, three-point turns, the vehicle inspection and observation routines, so you're covered from learner's to licensed.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-card/40">
      <div className="container scroll-mt-20 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
            <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight">
              Straight answers, no fine print
            </h2>
          </div>
          <Accordion className="mt-10" items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
