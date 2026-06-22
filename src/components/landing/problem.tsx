import { Brain, EyeOff, Repeat } from "lucide-react";
import { PASS_RATE_BEFORE, PASS_RATE_NOW } from "@/lib/constants";

const PROBLEMS = [
  {
    icon: Brain,
    title: "Memorising 1,200 questions",
    body: "The old trick was to rote-learn the question pool. Computerised testing shuffles and rephrases everything — memorising no longer works.",
  },
  {
    icon: EyeOff,
    title: "You can't see your blind spots",
    body: "Free apps tell you “41 out of 64”. They never tell you that you fail specifically at intersections and following distance.",
  },
  {
    icon: Repeat,
    title: "No system, no retention",
    body: "Cramming the night before fades fast. Without spaced repetition you re-forget the same rules again and again.",
  },
];

export function Problem() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="container py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">The problem</p>
          <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight">
            Passing got harder. The way people study didn&apos;t change.
          </h2>
          <p className="mt-4 text-muted-foreground">
            When the RTMC rolled out computerised testing to stop cheating, the national first-time
            pass rate fell from about {PASS_RATE_BEFORE}% to {PASS_RATE_NOW}%. The “memorise
            everything” approach is failing more people than ever.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
