"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CornerDownRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Clock,
  XCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing } from "@/components/ui/score-ring";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { SessionProgress, type SessionOutcome } from "@/components/ui/session-progress";
import { SessionNavRow } from "@/components/ui/session-nav";
import { Paywall } from "@/components/app/paywall";
import { SignVisual } from "@/components/shared/sign-visual";
import { CategoryIcon } from "@/components/shared/category-icon";
import { SessionRecap } from "@/components/study/session-recap";
import { NextStepCard } from "@/components/study/next-step-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { hasFeature, STUDY_SESSION_SIZE, studyCodeOf } from "@/lib/billing/plans";
import { orderScenariosByFreshness } from "@/lib/diagnostic/select";
import { countDueTomorrow, mockRetestStatus } from "@/lib/plan";
import type { SessionRecapData } from "@/lib/ai/coach";
import {
  nextStepAfterScenarios,
  type CategoryMisses,
} from "@/lib/learning/next-step";
import { forCode } from "@/lib/content/vehicle";
import { useContentPool } from "@/components/content/content-provider";
import { categoryName } from "@/lib/content/categories";
import { haptics } from "@/lib/haptics";
import { shuffle, cn } from "@/lib/utils";
import type { CategoryId, Scenario, ScenarioChoice } from "@/types";

export function ScenarioPlayer() {
  const { state, recordScenarioAttempt, recordSession } = useStudyStore();
  const { scenarios, full, status, sync } = useContentPool();
  // Least-recently-seen first, then a session-sized slice — the two only work
  // together. Serving the whole pool (as this used to) replays every scenario
  // every session no matter how it is ordered; slicing without the rotation
  // would just hand out a random dozen and repeat some of them next time.
  function buildQueue() {
    return orderScenariosByFreshness(
      forCode(scenarios, studyCodeOf(state)),
      state.scenarioAttempts,
    )
      .slice(0, STUDY_SESSION_SIZE)
      .map((s) => ({ ...s, choices: shuffle(s.choices) }));
  }

  const [queue, setQueue] = React.useState(buildQueue);
  const startRef = React.useRef(Date.now());
  const cpStartRef = React.useRef(state.cp);
  const [i, setI] = React.useState(0);
  const [chosen, setChosen] = React.useState<(string | null)[]>(() =>
    new Array(queue.length).fill(null),
  );
  const sessionRecorded = React.useRef(false);

  /**
   * Scenarios are the one mode with NOTHING in the bundled starter pack — the
   * whole library is paid content behind /api/content/pack. The pool is always
   * the starter pack on first render (the fetch, and even the Cache Storage
   * read, resolve after mount), so a queue snapshotted there was always empty,
   * `i >= queue.length` was true immediately, and the player opened on its own
   * "0/0 scenarios judged correctly" summary. Tapping "New scenarios" rebuilt
   * from the by-then-loaded pack, which is why it worked on the second go.
   *
   * Rebuild once when the pack lands, and only while the session is untouched
   * so it can't swap the queue out from under someone mid-answer.
   */
  const builtFromFullPool = React.useRef(full);
  React.useEffect(() => {
    if (!full || builtFromFullPool.current) return;
    if (chosen.some((c) => c !== null)) return;
    builtFromFullPool.current = true;
    const next = buildQueue();
    setQueue(next);
    setChosen(new Array(next.length).fill(null));
    setI(0);
    // buildQueue reads this render's state and pool by design; re-running it on
    // every state change would reshuffle the session under the learner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  // Start a fresh session in place. A link back to this same route wouldn't
  // remount the component, so rebuild the queue from current state
  // (orderScenariosByFreshness deprioritises the scenarios just judged) and
  // reset the per-session state instead.
  function restart() {
    const next = buildQueue();
    setQueue(next);
    setChosen(new Array(next.length).fill(null));
    startRef.current = Date.now();
    cpStartRef.current = state.cp;
    sessionRecorded.current = false;
    setI(0);
  }

  if (!hasFeature(state.tier, "scenarios")) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Paywall
          feature="scenarios"
          featureKey="scenarios"
          title="Scenarios are a Premium feature"
          description="Branching, real-world situational practice — traffic circles, hazards, dead robots — is where the rules click. Unlock the full scenario library with Premium."
          cta="Unlock scenarios"
          icon={<Sparkles className="h-6 w-6" />}
        />
      </div>
    );
  }

  /**
   * An empty queue is never a finished session. Falling through to the summary
   * below told a learner who had judged nothing that they were done, with a
   * "New scenarios" button as the only way out.
   */
  if (queue.length === 0) {
    if (status === "error") {
      return (
        <div className="mx-auto max-w-md py-10">
          <EmptyState
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Couldn't load the scenarios"
            description="The scenario library lives on our servers and this device couldn't reach them. Your progress is safe — try again in a moment."
            action={
              <Button onClick={sync}>
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            }
          />
        </div>
      );
    }
    // Data-saver pauses the automatic download, so this state is not progress
    // toward anything — it used to render an endless skeleton with no way
    // forward. Offer the tap the provider deliberately waited for.
    if (status === "paused") {
      return (
        <div className="mx-auto max-w-md py-10">
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="Scenarios haven't been downloaded yet"
            description="Data saver is on, so the scenario library (~a few MB) waits for you. Download it once and it stays available offline."
            action={
              <Button onClick={sync}>
                <RotateCcw className="h-4 w-4" /> Download scenarios
              </Button>
            }
          />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-2xl py-10" aria-busy="true">
        <p className="sr-only">Loading scenarios…</p>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-9 w-3/4" />
        <Skeleton className="mt-3 h-16 w-full" />
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((n) => (
            <Skeleton key={n} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const correctCount = chosen.reduce((n, cid, idx) => {
    const c = queue[idx].choices.find((ch) => ch.id === cid);
    return n + (c?.correct ? 1 : 0);
  }, 0);

  if (i >= queue.length) {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    const perCategory = new Map<CategoryId, { correct: number; total: number }>();
    const wrongByCat: CategoryMisses = {};
    const missed: {
      scenario: Scenario;
      chosen: ScenarioChoice | null;
      correctChoice: ScenarioChoice | undefined;
    }[] = [];
    queue.forEach((sc, idx) => {
      const choice = sc.choices.find((ch) => ch.id === chosen[idx]);
      const tally = perCategory.get(sc.categoryId) ?? { correct: 0, total: 0 };
      tally.total += 1;
      if (choice?.correct) tally.correct += 1;
      else {
        wrongByCat[sc.categoryId] = (wrongByCat[sc.categoryId] ?? 0) + 1;
        missed.push({
          scenario: sc,
          chosen: choice ?? null,
          correctChoice: sc.choices.find((ch) => ch.correct),
        });
      }
      perCategory.set(sc.categoryId, tally);
    });
    return (
      <Summary
        correct={correctCount}
        total={queue.length}
        seconds={seconds}
        cpEarned={state.cp - cpStartRef.current}
        onPlayMore={restart}
        wrongByCategory={wrongByCat}
        perCategory={[...perCategory.entries()]}
        missed={missed}
        mockRetestDue={mockRetestStatus(state).due}
        recap={{
          mode: "scenarios",
          correct: correctCount,
          total: queue.length,
          seconds,
          weakCategories: [
            ...new Set(missed.map((m) => categoryName(m.scenario.categoryId))),
          ].slice(0, 2),
          dueTomorrow: countDueTomorrow(state),
        }}
      />
    );
  }

  const sc = queue[i];
  const chosenId = chosen[i];
  const revealed = chosenId !== null;
  const isLast = i + 1 >= queue.length;
  // Every scenario reveals its verdict on choice, so the bar can carry it.
  const outcomes: SessionOutcome[] = queue.map((scenario, idx) => {
    const id = chosen[idx];
    if (id === null) return "pending";
    return scenario.choices.find((c) => c.id === id)?.correct ? "correct" : "wrong";
  });

  function choose(choiceId: string) {
    if (chosen[i] !== null) return; // already answered
    const choice = sc.choices.find((c) => c.id === choiceId)!;
    if (choice.correct) haptics.success();
    else haptics.error();
    setChosen((prev) => {
      const copy = [...prev];
      copy[i] = choiceId;
      return copy;
    });
    recordScenarioAttempt({
      scenarioId: sc.id,
      categoryId: sc.categoryId,
      choiceId,
      correct: choice.correct,
    });
  }

  function goPrev() {
    setI((x) => Math.max(0, x - 1));
  }
  function goNext() {
    if (chosen[i] === null) return; // can't advance until answered
    if (isLast) {
      haptics.celebrate();
      if (!sessionRecorded.current) {
        recordSession("scenarios", Math.round((Date.now() - startRef.current) / 1000));
        sessionRecorded.current = true;
      }
      setI(queue.length);
    } else {
      setI((x) => x + 1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <Link href="/study" className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </Link>
        <SessionProgress
          completed={i + (revealed ? 1 : 0)}
          total={queue.length}
          index={i}
          outcomes={outcomes}
        />
        <span className="font-mono text-xs text-muted-foreground">
          {i + 1}/{queue.length}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <NavButton dir="prev" onClick={goPrev} disabled={i === 0} className="hidden sm:flex" />

        <div key={sc.id} className="mx-auto min-w-0 max-w-2xl flex-1 animate-fade-in">
          <div className="flex items-center gap-3">
            <Badge variant="accent" className="gap-1">
              <CategoryIcon id={sc.categoryId} className="h-3 w-3" /> {categoryName(sc.categoryId)}
            </Badge>
            {(sc.image || sc.sign) && (
              <SignVisual image={sc.image} sign={sc.sign} alt={sc.title} className="h-12 w-12" priority />
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{sc.title}</h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">{sc.situation}</p>
          <p className="mt-4 font-medium text-foreground">{sc.prompt}</p>

          <div className="mt-5 space-y-3">
            {sc.choices.map((choice) => {
              const isChosen = chosenId === choice.id;
              const showAs = revealed
                ? choice.correct
                  ? "correct"
                  : isChosen
                    ? "wrong"
                    : "muted"
                : "default";
              return (
                <div key={choice.id}>
                  <button
                    onClick={() => choose(choice.id)}
                    disabled={revealed}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                      showAs === "default" && "border-border hover:border-primary/40",
                      showAs === "correct" && "border-success bg-success/[0.06]",
                      showAs === "wrong" && "border-warning bg-warning/[0.06]",
                      showAs === "muted" && "border-border opacity-60",
                    )}
                  >
                    {revealed && choice.correct ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    ) : revealed && isChosen ? (
                      <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                    ) : (
                      <span className="h-5 w-5 shrink-0 rounded-full border-2 border-border" />
                    )}
                    <span className="text-foreground">{choice.text}</span>
                  </button>

                  {/* Branching consequence */}
                  {isChosen && (
                    <div className="ml-5 mt-2 flex gap-2 animate-fade-in">
                      <CornerDownRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div
                        className={cn(
                          "flex-1 rounded-lg border p-3 text-sm",
                          choice.correct
                            ? "border-success/30 bg-success/[0.05]"
                            : "border-warning/30 bg-warning/[0.05]",
                        )}
                      >
                        {choice.consequence}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {revealed && (
            <div className="mt-5 animate-fade-in rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
              <p className="text-sm font-semibold text-primary">Why it matters</p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{sc.debrief}</p>
            </div>
          )}
        </div>

        <NavButton dir="next" onClick={goNext} disabled={!revealed} finish={isLast} className="hidden sm:flex" />
      </div>

      {/* Phones: advance under the choices in thumb reach — see SessionNavRow. */}
      <SessionNavRow
        onPrev={goPrev}
        onNext={goNext}
        prevDisabled={i === 0}
        nextDisabled={!revealed}
        nextLabel="Next scenario"
        finish={isLast}
        finishLabel="Finish session"
      />
    </div>
  );
}

function NavButton({
  dir,
  onClick,
  disabled,
  finish,
  className,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  finish?: boolean;
  className?: string;
}) {
  const Icon = dir === "prev" ? ChevronLeft : finish ? Check : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous scenario" : finish ? "Finish" : "Next scenario"}
      className={cn(
        // Callers pass `hidden sm:flex`; `hidden` sorts after `flex` in
        // Tailwind's display group, so it wins below `sm`.
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
        disabled
          ? "cursor-not-allowed border-border/40 text-muted-foreground/30"
          : dir === "next"
            ? "press border-primary bg-primary text-primary-foreground hover:brightness-110"
            : "press border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function fmtDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function Summary({
  correct,
  total,
  seconds,
  cpEarned,
  recap,
  onPlayMore,
  wrongByCategory,
  perCategory,
  missed,
  mockRetestDue,
}: {
  correct: number;
  total: number;
  seconds: number;
  cpEarned: number;
  recap: SessionRecapData;
  onPlayMore: () => void;
  /** Misses by category for this session — feeds the targeted next step. */
  wrongByCategory: CategoryMisses;
  /** This session's score per category touched, weakest first below. */
  perCategory: [CategoryId, { correct: number; total: number }][];
  /** The situations misjudged this session, with both sides of each call. */
  missed: {
    scenario: Scenario;
    chosen: ScenarioChoice | null;
    correctChoice: ScenarioChoice | undefined;
  }[];
  /** Whether the pass predictor is due a recalibration. */
  mockRetestDue: boolean;
}) {
  const acc = total ? Math.round((correct / total) * 100) : 0;
  const nextStep = nextStepAfterScenarios({ wrongByCategory, mockRetestDue });
  // Weakest category leads — the bars exist to aim the follow-up work.
  const catRows = [...perCategory].sort(
    ([, a], [, b]) => a.correct / a.total - b.correct / b.total,
  );
  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="sr-only">Scenario session results</h1>
      <Card className="animate-scale-in p-8 text-center">
        <div className="flex justify-center">
          <ScoreRing value={acc} size={180} label={`${correct}/${total}`} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">scenarios judged correctly</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {cpEarned > 0 && (
            <Badge variant="default" className="gap-1 font-mono text-sm">
              <Zap className="h-3.5 w-3.5" /> +{cpEarned} CP
            </Badge>
          )}
          {seconds > 0 && (
            <Badge variant="outline" className="gap-1 font-mono text-sm">
              <Clock className="h-3.5 w-3.5" /> {fmtDuration(seconds)}
            </Badge>
          )}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant={nextStep ? "outline" : undefined} onClick={onPlayMore}>
            New scenarios
          </Button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: nextStep ? "outline" : "default" }))}
          >
            Back to dashboard
          </Link>
        </div>
      </Card>

      {nextStep && (
        <NextStepCard
          className="mt-5"
          title={nextStep.title}
          body={nextStep.body}
          href={nextStep.href}
          cta={nextStep.cta}
          onRepeat={onPlayMore}
        />
      )}

      {catRows.length > 0 && (
        <Card className="mt-5 p-6">
          <h2 className="font-display text-lg font-semibold">This session by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap any category to practise it.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {catRows.map(([cat, s]) => (
              <Link key={cat} href={`/study/questions?category=${cat}`} className="group block">
                <MasteryBar
                  label={<span className="group-hover:text-primary">{categoryName(cat)}</span>}
                  value={(s.correct / s.total) * 100}
                  count={`${s.correct}/${s.total}`}
                />
              </Link>
            ))}
          </div>
        </Card>
      )}

      {missed.length > 0 && (
        <Card className="mt-5 p-6">
          <h2 className="font-display text-lg font-semibold">
            Review your judgement calls ({missed.length})
          </h2>
          <ul className="mt-4 space-y-4">
            {missed.map(({ scenario, chosen, correctChoice }) => (
              <li key={scenario.id} className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">{scenario.title}</p>
                {correctChoice && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-success">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {correctChoice.text}
                  </p>
                )}
                {chosen && (
                  <div className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <span>You chose: {chosen.text}</span>
                  </div>
                )}
                {chosen && chosen.consequence && (
                  <p className="mt-2 rounded-lg border border-warning/30 bg-warning/[0.05] px-3 py-2 text-xs leading-relaxed text-foreground">
                    {chosen.consequence}
                  </p>
                )}
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {scenario.debrief}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <SessionRecap data={recap} className="mt-5" />
    </div>
  );
}
