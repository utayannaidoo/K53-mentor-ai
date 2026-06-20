import { MessageSquareText, Layers, Route, Car, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: MessageSquareText,
    eyebrow: "AI Tutor",
    title: "An AI tutor that explains, not just answers",
    body: "Stuck on a wrong answer? Ask “explain like I'm 10”, “give another example” or “why is this wrong?” — and get a real explanation anchored to that exact question, not a canned blurb.",
    points: ["Explain · ELI10 · Another example", "Anchored to the question you missed", "Proactively offers help when you're stuck"],
  },
  {
    icon: Layers,
    eyebrow: "Smart flashcards",
    title: "Spaced repetition that adapts to you",
    body: "Cards resurface exactly when you're about to forget them, and get spaced out as you master them — so you never waste time on what you already know.",
    points: ["SM-2 scheduling with Again/Hard/Good/Easy", "Per-category mastery tracking", "Due-today counts on your dashboard"],
  },
  {
    icon: Route,
    eyebrow: "Scenarios",
    title: "Situational judgement, not just multiple choice",
    body: "Branching real-world scenarios — a busy traffic circle, a ball into the road, a dead robot during load-shedding — show you the consequence of each choice.",
    points: ["Decision → consequence branching", "Covers the judgement the test now demands", "The most “aha” way to learn the rules"],
  },
  {
    icon: Car,
    eyebrow: "Driver's licence prep",
    title: "Keep learning after you pass",
    body: "Step-by-step “cook mode” guides for the yard test — parallel parking, alley docking, three-point turns — that no question-bank app bothers to build.",
    points: ["Parallel parking · Alley docking · 3-point turn", "Common-fault warnings for each manoeuvre", "Mastery checklist as you practise"],
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card/40">
      <div className="container scroll-mt-20 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">What you get</p>
          <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight">
            The whole stack no other K53 app has built
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.eyebrow}
              className="group rounded-xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {f.eyebrow}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              <ul className="mt-4 space-y-1.5">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/onboarding"
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline",
            )}
          >
            See it on your own weak spots — start the free diagnostic
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
