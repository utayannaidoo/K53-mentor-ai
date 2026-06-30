import {
  Gauge,
  ClipboardList,
  Layers,
  MessageSquareText,
  Route,
  ClipboardCheck,
  Car,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Stagger } from "@/components/shared/stagger";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    icon: Gauge,
    title: "AI diagnostic",
    body: "A 15-question adaptive assessment that produces a readiness score, a predicted pass probability, and a per-category weakness breakdown.",
  },
  {
    icon: ClipboardList,
    title: "Personalised daily plan",
    body: "Due flashcards, targeted practice on your weakest category, and a scenario — sized to a 10-minutes-a-day habit.",
  },
  {
    icon: Layers,
    title: "Spaced repetition",
    body: "SM-2 flashcards with Again / Hard / Good / Easy and per-category mastery, so reviews land exactly when you need them.",
  },
  {
    icon: MessageSquareText,
    title: "AI Tutor",
    body: "A coach that explains the why, anchored to the exact question or card you're stuck on — with a genuinely useful fallback.",
  },
  {
    icon: Route,
    title: "Scenario learning",
    body: "Branching, real-world situational judgement — traffic circles, hazards, dead robots — with consequence feedback.",
  },
  {
    icon: ClipboardCheck,
    title: "Mock exam",
    body: "A full 68-question, 51-to-pass simulation with category breakdown and a complete mistake review.",
  },
  {
    icon: Car,
    title: "Driver's-licence prep",
    body: "Step-by-step “cook-mode” yard-test guides: parallel parking, alley docking, three-point turn, inspection, observation.",
  },
  {
    icon: TrendingUp,
    title: "Streaks & retention",
    body: "A weekly freeze for forgiveness, a readiness trend, and proactive nudges when you keep missing a category.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1120px] scroll-mt-20 px-6 py-16">
      <Reveal className="mb-[42px] max-w-[640px]">
        <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
          Everything you need
        </span>
        <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
          Not another question bank. A coach.
        </h2>
      </Reveal>

      <Stagger
        className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(248px,1fr))]"
        step={55}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="glass hover-elevate group h-full rounded-[18px] p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-primary/20 to-primary/[0.07] text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]">
              <f.icon className="h-[22px] w-[22px]" strokeWidth={2} />
            </div>
            <h3 className="font-display text-[17px] font-semibold tracking-[-0.01em]">{f.title}</h3>
            <p className="mt-2 text-pretty text-[0.93rem] leading-[1.55] text-muted-foreground">
              {f.body}
            </p>
          </div>
        ))}
      </Stagger>
    </section>
  );
}
