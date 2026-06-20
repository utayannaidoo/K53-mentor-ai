import { ClipboardCheck, Sparkles, CalendarCheck } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { MasteryBar } from "@/components/ui/mastery-bar";

const STEPS = [
  {
    n: 1,
    icon: ClipboardCheck,
    title: "Take the diagnostic",
    body: "A 15-question adaptive assessment across all 7 K53 categories — no signup needed to see your score.",
  },
  {
    n: 2,
    icon: Sparkles,
    title: "Get your personalised plan",
    body: "We pinpoint your weak areas, estimate your pass probability, and build a study plan backward from your test date.",
  },
  {
    n: 3,
    icon: CalendarCheck,
    title: "Study 10 minutes a day",
    body: "Spaced-repetition flashcards, targeted practice and scenarios — your readiness score climbs as you go.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="container scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
        <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight">
          From “I don&apos;t know what I don&apos;t know” to a clear plan
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.n} className="relative rounded-lg border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-semibold text-primary">
                {s.n}
              </span>
              <s.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>

            <div className="mt-5 rounded-lg border border-border bg-background/60 p-4">
              {i === 0 && (
                <div className="flex items-center justify-center py-1">
                  <ScoreRing value={58} size={104} stroke={9} label="Readiness" animate={false} />
                </div>
              )}
              {i === 1 && (
                <div className="space-y-3">
                  <MasteryBar label="Intersections" value={41} />
                  <MasteryBar label="Following distance" value={48} />
                  <MasteryBar label="Road signs" value={84} />
                </div>
              )}
              {i === 2 && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Day 1</span>
                    <span className="font-mono text-foreground">58%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Day 14</span>
                    <span className="font-mono text-success">81%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[81%] rounded-full bg-gradient-to-r from-primary to-success" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
