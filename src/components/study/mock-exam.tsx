"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, ArrowRight, Check, ChevronLeft, ChevronRight, Clock, FileText, Timer, CheckCircle2, XCircle, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { Paywall } from "@/components/app/paywall";
import { SignVisual } from "@/components/shared/sign-visual";
import { ScoreRing } from "@/components/ui/score-ring";
import { SessionRecap } from "@/components/study/session-recap";
import { SecondOpinion } from "@/components/study/second-opinion";
import { useStudyStore } from "@/hooks/use-study-store";
import { sampleMockExam, sampleMiniMock, MINI_MOCK, SECTION_OF, type ExamSection } from "@/lib/diagnostic/select";
import { EXAM_FORMAT } from "@/lib/constants";
import { mocksRemaining } from "@/lib/plan";
import { CATEGORIES, categoryName } from "@/lib/content/categories";
import { sourceFor } from "@/lib/content/provenance";
import { cn } from "@/lib/utils";
import type { CategoryId, CategoryScore, Question } from "@/types";

const LETTERS = ["A", "B", "C", "D"];
const EXAM_SECONDS = 60 * 60;

const SECTION_LABEL: Record<ExamSection, string> = {
  controls: "Vehicle controls",
  signs: "Road signs & markings",
  rules: "Rules of the road",
};
const EXAM_SECTIONS = Object.keys(EXAM_FORMAT.sections) as ExamSection[];

interface ExamResult {
  score: number;
  total: number;
  passed: boolean;
  perCategory: Partial<Record<CategoryId, CategoryScore>>;
}

export function MockExam() {
  const { state, readiness, recordMockExam, recordSession } = useStudyStore();
  const sp = useSearchParams();
  // Mini mode: 15 questions at the real pass ratio, weighted to weak areas.
  const mini = sp.get("mode") === "mini";
  const passMark = mini ? MINI_MOCK.passMark : EXAM_FORMAT.passMark;
  const [phase, setPhase] = React.useState<"intro" | "exam" | "results">("intro");
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<number[]>([]);
  const [i, setI] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState(EXAM_SECONDS);
  // Mini results live here — minis feed the predictor but are not full mocks,
  // so nothing is written to state.mockExams.
  const [miniResult, setMiniResult] = React.useState<ExamResult | null>(null);
  const startRef = React.useRef(0);
  // Pass probability before this exam's answers hit the readiness model —
  // shown against the recomputed value so the learner sees the number move.
  const preProbRef = React.useRef<number | null>(null);
  const cpStartRef = React.useRef<number | null>(null);

  const remainingMocks = mocksRemaining(state, mini ? "mini" : "full");

  const submit = React.useCallback(() => {
    const correct = questions.reduce((n, q, idx) => n + (answers[idx] === q.correctIndex ? 1 : 0), 0);
    const perCategory: Partial<Record<CategoryId, CategoryScore>> = {};
    for (const cat of CATEGORIES) {
      const idxs = questions.map((q, idx) => ({ q, idx })).filter((x) => x.q.categoryId === cat.id);
      if (!idxs.length) continue;
      const c = idxs.filter((x) => answers[x.idx] === x.q.correctIndex).length;
      perCategory[cat.id] = { correct: c, total: idxs.length, score: Math.round((c / idxs.length) * 100) };
    }
    const mark = mini ? MINI_MOCK.passMark : EXAM_FORMAT.passMark;
    const passed = correct >= mark;
    const durationSeconds = Math.round((Date.now() - startRef.current) / 1000);
    const responses = questions.map((q, idx) => ({
      questionId: q.id,
      categoryId: q.categoryId,
      correct: answers[idx] === q.correctIndex,
      selectedIndex: answers[idx],
    }));
    if (mini) {
      // Minis are recorded with a `mini` flag so the plan's per-day/lifetime
      // mock limits can count them; readiness still learns from every answer.
      recordMockExam(
        { score: correct, total: questions.length, passed, perCategory, durationSeconds, mini: true },
        responses,
      );
      setMiniResult({ score: correct, total: questions.length, passed, perCategory });
    } else {
      recordMockExam(
        { score: correct, total: questions.length, passed, perCategory, durationSeconds },
        responses,
      );
    }
    recordSession("mock", durationSeconds);
    setPhase("results");
  }, [answers, questions, mini, recordMockExam, recordSession]);

  // Countdown timer.
  React.useEffect(() => {
    if (phase !== "exam") return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, secondsLeft, submit]);

  function start() {
    const qs = mini
      ? sampleMiniMock(state.attempts, state.onboarding?.vehicleCode, readiness.weakCategories)
      : sampleMockExam(state.attempts, state.onboarding?.vehicleCode);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(-1));
    setI(0);
    setSecondsLeft(mini ? MINI_MOCK.seconds : EXAM_SECONDS);
    startRef.current = Date.now();
    preProbRef.current = readiness.passProbability;
    cpStartRef.current = state.cp;
    setPhase("exam");
  }

  if (remainingMocks <= 0 && phase === "intro") {
    const free = state.tier === "free";
    return (
      <div className="mx-auto max-w-md py-10">
        {free && !mini ? (
          <Paywall
            feature="mock_exam"
            title="Full mock exams are a Premium feature"
            description="The real 64-question exam experience — timed, scored and mapped to your weak areas. Your free trial includes one 15-question mini mock instead."
            cta="Unlock full mocks"
          />
        ) : free ? (
          <Paywall
            feature="mini_mock"
            title="You've used your free mini mock"
            description="That pressure-check was a one-off on the free plan. Premium gives you 3 full mocks and 5 mini mocks every day until test day."
            cta="Keep testing yourself"
          />
        ) : (
          <Paywall
            feature={mini ? "mini_mock" : "mock_exam"}
            title={mini ? "You've done today's 5 mini mocks" : "You've done today's 3 full mocks"}
            description="Your daily allowance resets tomorrow. Premium Plus removes mock limits entirely."
            cta="See Premium Plus"
          />
        )}
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg py-10">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {mini ? <Timer className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            {mini ? "Mini mock" : "Full mock exam"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mini
              ? `${MINI_MOCK.total} questions at the real test's pass ratio, weighted toward your weakest areas. A pressure check that fits in a break.`
              : `${EXAM_FORMAT.totalQuestions} questions, just like the real test. You must reach the pass mark in every section. The clock starts when you begin.`}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <Stat label="Questions" value={`${mini ? MINI_MOCK.total : EXAM_FORMAT.totalQuestions}`} />
            <Stat label="To pass" value={`${passMark}`} />
            <Stat label="Time" value={mini ? "12 min" : "60 min"} />
          </div>
          {!mini && (
            <div className="mt-4 space-y-1.5 text-left">
              {EXAM_SECTIONS.map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{SECTION_LABEL[s]}</span>
                  <span className="font-mono text-xs text-foreground">
                    {EXAM_FORMAT.sections[s].questions} Q · pass {EXAM_FORMAT.sections[s].pass}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Button size="xl" className="mt-7 w-full" onClick={start}>
            Start {mini ? "mini mock" : "mock exam"} <ArrowRight />
          </Button>
          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            <Link
              href={mini ? "/study/mock-exam" : "/study/mock-exam?mode=mini"}
              className="font-medium text-primary hover:underline"
            >
              {mini ? "Do the full 64-question mock" : "Short on time? Try the mini mock"}
            </Link>
            <Link href="/study" className="text-muted-foreground hover:text-foreground">
              Not now
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "results") {
    const last: ExamResult | undefined = mini
      ? (miniResult ?? undefined)
      : state.mockExams[state.mockExams.length - 1];
    if (!last) return null;
    const wrong = questions
      .map((q, idx) => ({ q, idx }))
      .filter((x) => answers[x.idx] !== x.q.correctIndex);
    const sectionScores = EXAM_SECTIONS.map((s) => {
      const idxs = questions
        .map((q, idx) => ({ q, idx }))
        .filter((x) => SECTION_OF[x.q.categoryId] === s);
      const correct = idxs.filter((x) => answers[x.idx] === x.q.correctIndex).length;
      return { section: s, correct, total: idxs.length, pass: EXAM_FORMAT.sections[s].pass };
    });
    const preProb = preProbRef.current;
    const postProb = readiness.passProbability;
    const probDelta = preProb != null ? postProb - preProb : null;
    const failedSections = mini
      ? []
      : sectionScores.filter((s) => s.correct < s.pass).map((s) => SECTION_LABEL[s.section]);
    const weakCategories = (Object.keys(last.perCategory) as CategoryId[])
      .sort((a, b) => last.perCategory[a]!.score - last.perCategory[b]!.score)
      .slice(0, 2)
      .map(categoryName);
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <ScoreRing
            value={Math.round((last.score / last.total) * 100)}
            size={180}
            label={`${last.score}/${last.total}`}
            tone={last.passed ? "success" : "warning"}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant={last.passed ? "success" : "warning"} className="text-sm">
              {last.passed
                ? mini
                  ? "Mini mock passed 🎉"
                  : "You passed 🎉"
                : `${passMark - last.score} short of passing`}
            </Badge>
            {cpStartRef.current !== null && state.cp > cpStartRef.current && (
              <Badge variant="default" className="gap-1 font-mono text-sm">
                <Zap className="h-3.5 w-3.5" /> +{state.cp - cpStartRef.current} CP
              </Badge>
            )}
          </div>
          {preProb != null && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              Predicted pass:{" "}
              <span className="font-mono">{preProb}%</span>
              <ArrowRight className="h-3.5 w-3.5" />
              <span className={cn("flex items-center gap-1 font-mono font-semibold", probDelta && probDelta < 0 ? "text-warning" : "text-success")}>
                {postProb}%
                {probDelta !== null && probDelta !== 0 && (
                  probDelta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />
                )}
              </span>
            </p>
          )}
        </Card>

        <SessionRecap
          className="mt-5"
          data={{
            mode: "mock",
            correct: last.score,
            total: last.total,
            passed: last.passed,
            failedSections,
            weakCategories,
            passProbabilityBefore: preProb ?? undefined,
            passProbabilityAfter: postProb,
          }}
        />

        {!mini && (
        <Card className="mt-5 p-6">
          <h2 className="font-display text-lg font-semibold">By section</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The real test requires passing every section, not just the overall mark.
          </p>
          <div className="mt-4 space-y-2">
            {sectionScores.map((s) => {
              const passed = s.correct >= s.pass;
              return (
                <div
                  key={s.section}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <span className="text-sm font-medium text-foreground">{SECTION_LABEL[s.section]}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {s.correct}/{s.total} · need {s.pass}
                    </span>
                    <Badge variant={passed ? "success" : "warning"}>{passed ? "Pass" : "Fail"}</Badge>
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        )}

        <Card className="mt-5 p-6">
          <h2 className="font-display text-lg font-semibold">By category</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(Object.keys(last.perCategory) as CategoryId[]).map((cat) => (
              <MasteryBar
                key={cat}
                label={categoryName(cat)}
                value={last.perCategory[cat]!.score}
                count={`${last.perCategory[cat]!.correct}/${last.perCategory[cat]!.total}`}
              />
            ))}
          </div>
        </Card>

        {wrong.length > 0 && (
          <Card className="mt-5 p-6">
            <h2 className="font-display text-lg font-semibold">Review your mistakes ({wrong.length})</h2>
            <ul className="mt-4 space-y-4">
              {wrong.slice(0, 15).map(({ q, idx }) => (
                <li key={`${q.id}-${idx}`} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">{q.prompt}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" /> {q.options[q.correctIndex]}
                  </p>
                  {answers[idx] >= 0 && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4 text-warning" /> You chose: {q.options[answers[idx]]}
                    </p>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{q.explanation}</p>
                  <p className="mt-1 text-2xs text-muted-foreground/80">Based on: {sourceFor(q)}</p>
                  <SecondOpinion key={q.id} question={q} chosenIndex={answers[idx]} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => setPhase("intro")}>Take another</Button>
          <Link href="/dashboard" className={cn(buttonVariants())}>Back to dashboard</Link>
        </div>
      </div>
    );
  }

  // Exam phase
  const q = questions[i];
  const answered = answers[i] >= 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  function choose(optionIndex: number) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[i] = optionIndex;
      return copy;
    });
  }

  // Exam UI mirrors the practice screen: progress on top, the question in a
  // centered column, round prev/next arrows flanking it (finish = submit).
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <button onClick={submit} className="text-muted-foreground hover:text-foreground" aria-label="Submit and exit">
          <X className="h-5 w-5" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
        </div>
        <span className={cn("flex items-center gap-1 font-mono text-xs", secondsLeft < 300 ? "text-danger" : "text-muted-foreground")}>
          <Clock className="h-3.5 w-3.5" /> {mm}:{ss}
        </span>
      </div>

      <div className="mx-auto mt-3 flex max-w-xl items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">Question {i + 1} of {questions.length}</span>
        <button onClick={submit} className="text-xs font-medium text-primary hover:underline">Submit now</button>
      </div>

      <div className="mt-5 flex items-center gap-2 sm:gap-3">
        <ExamNavButton dir="prev" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} />

        <div key={i} className="mx-auto min-w-0 max-w-xl flex-1 animate-fade-in">
          {(q.image || q.sign) && (
            <div className="mb-4">
              <SignVisual image={q.image} sign={q.sign} alt={categoryName(q.categoryId)} className="h-20 w-20" />
            </div>
          )}
          <h1 className="text-balance font-display text-xl font-semibold leading-snug tracking-tight">{q.prompt}</h1>
          <div className="mt-5 space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => choose(idx)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                  answers[i] === idx ? "border-primary bg-primary/[0.04]" : "border-border hover:border-primary/40",
                )}
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold", answers[i] === idx ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
                  {LETTERS[idx]}
                </span>
                <span className="text-foreground">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <ExamNavButton
          dir="next"
          onClick={() => (i + 1 >= questions.length ? submit() : setI((x) => x + 1))}
          disabled={!answered}
          finish={i + 1 >= questions.length}
        />
      </div>
    </div>
  );
}

/** Round side-arrow controls — same interaction pattern as question practice. */
function ExamNavButton({
  dir,
  onClick,
  disabled,
  finish,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  finish?: boolean;
}) {
  const Icon = dir === "prev" ? ChevronLeft : finish ? Check : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous question" : finish ? "Submit exam" : "Next question"}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="tabular font-mono text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
