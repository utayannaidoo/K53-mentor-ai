"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Sparkles, Target } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ScoreRing } from "@/components/ui/score-ring";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CategoryIcon } from "@/components/shared/category-icon";
import { categoryName, CATEGORIES } from "@/lib/content/categories";
import { diagnosticFocusCategories } from "@/lib/diagnostic/focus";
import { generateTodayPlan } from "@/lib/plan";
import { EXAM_FORMAT, SECTION_LABEL, SECTION_OF, type ExamSection } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useStudyStore } from "@/hooks/use-study-store";
import type { CategoryId, CategoryScore, DiagnosticResult } from "@/types";

export function DiagnosticResults() {
  const router = useRouter();
  const { ready, state, isAuthed, hasOnboarded, readiness } = useStudyStore();
  const latest = state.diagnostics[state.diagnostics.length - 1];

  React.useEffect(() => {
    if (!ready || latest) return;
    // A deep link with nothing to show must not quietly restart a 15-question
    // quiz on someone who can't see why. Signed-in learners are routed like
    // /continue routes them — the dashboard's alert band then offers the
    // diagnostic deliberately, with an explanation. Guests ARE the funnel:
    // for them the quiz is the front door, so starting it is correct.
    router.replace(!isAuthed ? "/diagnostic" : hasOnboarded ? "/dashboard" : "/onboarding");
  }, [ready, latest, isAuthed, hasOnboarded, router]);

  if (!ready || !latest) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const retakerLine = buildRetakerLine(state.onboarding?.priorAttempts ?? 0);
  const plan = generateTodayPlan(state, readiness);

  // The headline is the raw share correct, so it agrees with the "x/15" beside
  // it. The weighted readiness figure used to sit there instead: "36%" next to
  // "6/15" (40%) read as two different scores for the same fifteen answers.
  const scorePct = latest.total ? Math.round((latest.correct / latest.total) * 100) : 0;
  const sections = sectionResults(latest.perCategory);

  const strongest = latest.strongCategories[0];
  const focus = diagnosticFocusCategories(latest);
  const focusTitle =
    focus.length > 1 ? `Focus on these ${focus.length} areas first` : "Here’s what to focus on";

  return (
    <div className="min-h-dvh bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-2xl px-6 pb-20">
        {/* Reward moment */}
        <div className="flex flex-col items-center text-center">
          <Badge variant="default" className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" /> Starting check complete
          </Badge>
          <h1 className="mb-4 font-display text-2xl font-semibold">Your starting baseline</h1>
          <ScoreRing value={scorePct} size={208} label="Correct" />
          <div className="mt-5 flex items-center gap-6">
            <Stat icon={<Target className="h-4 w-4" />} label="Scored" value={`${latest.correct}/${latest.total}`} />
          </div>
          {retakerLine && (
            <p className="mt-2 max-w-md text-balance text-sm font-medium text-primary">
              {retakerLine}
            </p>
          )}
          <p className="mt-3 max-w-md text-balance text-sm text-muted-foreground">
            This short check shows how you answered these {latest.total} questions, not your chance
            of passing the real test. Practise each section and take a full mock to build more evidence.
          </p>
        </div>

        {/* The aha moment: the real test is passed section by section, so put
            each section's answers next to the mark that section needs. */}
        <Card className="mt-10 p-6">
          <h2 className="font-display text-lg font-semibold">Against the real pass marks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The learner&apos;s test is passed section by section — a strong total can&apos;t cover
            a weak section.
          </p>
          <ul className="mt-5 divide-y divide-border/60">
            {sections.map((s) => (
              <li key={s.section} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{SECTION_LABEL[s.section]}</p>
                  <p className="text-xs text-muted-foreground">
                    Test needs {s.pass} of {s.questions} ({s.needPct}%)
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="tabular font-mono text-sm font-semibold">
                    {s.total ? `${s.correct}/${s.total}` : "—"}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-2xs font-semibold",
                      s.total === 0
                        ? "bg-muted text-muted-foreground"
                        : s.onTrack
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning",
                    )}
                  >
                    {s.total === 0 ? "Not sampled" : s.onTrack ? "At the pass line" : "Below the pass line"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            A few questions per section points you somewhere to start — a full 64-question mock is
            what shows where you&apos;d really land.
          </p>
        </Card>

        {/* Focus areas (always visible) */}
        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg font-semibold">{focusTitle}</h2>
          {strongest && (
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;re strongest in{" "}
              <span className="font-medium text-success">{categoryName(strongest)}</span>. Let&apos;s
              fix the gaps below first.
            </p>
          )}
          {/* Only promised when there is something to tap — a learner who
              cleared every category sees no focus list at all. */}
          {focus.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {focus.length > 1
                ? "These were tied among your lowest scores, so each is an equal first priority."
                : "Tap it to start practising."}
            </p>
          )}
          <div className="mt-5 space-y-4">
            {focus.map((cat) => (
              <Link key={cat} href={`/study/questions?category=${cat}`} className="group block">
                <MasteryBar
                  label={<span className="group-hover:text-primary">{categoryName(cat)}</span>}
                  value={latest.perCategory[cat]?.score ?? 0}
                  icon={<CategoryIcon id={cat} className="h-4 w-4 text-muted-foreground" />}
                />
              </Link>
            ))}
          </div>
        </Card>

        {/* Full breakdown + plan (gated until signup) */}
        <div className="relative mt-6">
          {/* aria-hidden as well as blurred: without it a screen reader read
              the entire "locked" breakdown aloud, so the gate only existed for
              sighted users. */}
          <div
            aria-hidden={!isAuthed}
            className={isAuthed ? "" : "pointer-events-none select-none blur-[6px]"}
          >
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold">Full category breakdown</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {CATEGORIES.map((cat) => (
                  <MasteryBar
                    key={cat.id}
                    label={cat.short}
                    value={latest.perCategory[cat.id]?.score ?? readiness.perCategory[cat.id]}
                    icon={<CategoryIcon id={cat.id} className="h-4 w-4 text-muted-foreground" />}
                  />
                ))}
              </div>
            </Card>

            <Card className="mt-6 p-6">
              <h2 className="font-display text-lg font-semibold">Your first study session</h2>
              <ul className="mt-4 space-y-3">
                {plan.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.subtitle}</p>
                    </div>
                    <span className="font-mono text-2xs text-muted-foreground">~{task.estMinutes} min</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {!isAuthed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="mx-4 max-w-sm p-6 text-center shadow-soft-lg">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">Save this plan</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Create a free account to see every category, keep your first study session and
                  start studying — about 30 seconds with Google.
                </p>
                <Button className="mt-5 w-full" size="lg" onClick={() => router.push("/signup")}>
                  Create my free account <ArrowRight />
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">No credit card required.</p>
                {/* Someone who already has an account and re-ran the diagnostic
                    had no way forward from here at all. */}
                <p className="mt-2 text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </Card>
            </div>
          )}
        </div>

        {isAuthed && (
          <Button size="xl" className="mt-8 w-full" onClick={() => router.push("/dashboard")}>
            See today&apos;s plan <ArrowRight />
          </Button>
        )}
      </main>
    </div>
  );
}

/** Each exam section's starting-check answers beside the mark it needs. */
function sectionResults(perCategory: DiagnosticResult["perCategory"]) {
  return (Object.keys(EXAM_FORMAT.sections) as ExamSection[]).map((section) => {
    let correct = 0;
    let total = 0;
    for (const [cat, score] of Object.entries(perCategory) as [CategoryId, CategoryScore | undefined][]) {
      if (score && SECTION_OF[cat] === section) {
        correct += score.correct;
        total += score.total;
      }
    }
    const { questions, pass } = EXAM_FORMAT.sections[section];
    return {
      section,
      correct,
      total,
      questions,
      pass,
      needPct: Math.round((pass / questions) * 100),
      // Compared as ratios, not rounded percentages, so 3/4 against 6/8 is "at".
      onTrack: total > 0 && correct * questions >= pass * total,
    };
  });
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </span>
      <span className="tabular mt-0.5 font-mono text-xl font-semibold">{value}</span>
    </div>
  );
}

/** A different opening for learners who've sat this test before — the plan
 * exists precisely so the next attempt isn't a guess. */
function buildRetakerLine(priorAttempts: number): string | null {
  if (priorAttempts <= 0) return null;
  if (priorAttempts === 1)
    return "Last time you walked in blind. This time you'll walk in knowing exactly where your gaps are.";
  return "You've been here before — the difference now is a plan built on your actual weak spots.";
}
