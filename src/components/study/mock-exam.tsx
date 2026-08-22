"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, ArrowRight, Check, ChevronLeft, ChevronRight, Clock, FileText, Timer, CheckCircle2, XCircle, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { SessionProgress } from "@/components/ui/session-progress";
import { SessionNavRow } from "@/components/ui/session-nav";
import { Paywall } from "@/components/app/paywall";
import { SignVisual, SignPreload } from "@/components/shared/sign-visual";
import { signQuestionAlt } from "@/lib/content/sign-alt";
import { ScoreRing } from "@/components/ui/score-ring";
import { SessionRecap } from "@/components/study/session-recap";
import { NextStepCard } from "@/components/study/next-step-card";
import { SecondOpinion } from "@/components/study/second-opinion";
import { useStudyStore } from "@/hooks/use-study-store";
import { sampleMockExam, sampleMiniMock, sampleSectionDrill, fullMockPassed, miniMockConfig, MINI_MOCK, MINI_MOCK_LENGTHS, SECTION_DRILL, SECTION_OF, type ExamSection } from "@/lib/diagnostic/select";
import { useContentPool } from "@/components/content/content-provider";
import { studyCodeOf } from "@/lib/billing/plans";
import { EXAM_FORMAT, SECTION_LABEL } from "@/lib/constants";
import { track } from "@/lib/analytics";
import { mocksRemaining, drillsRemaining } from "@/lib/plan";
import { nextStepAfterMock } from "@/lib/learning/next-step";
import { CATEGORIES, categoryName } from "@/lib/content/categories";
import { sourceFor } from "@/lib/content/provenance";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { CategoryId, CategoryScore, Question } from "@/types";

const LETTERS = ["A", "B", "C", "D"];
const EXAM_SECONDS = 60 * 60;

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
  // Length is chosen on the intro screen and carried in the URL, so a learner
  // can bookmark or share the exact drill they like.
  const nParam = Number(sp.get("n"));
  const miniLength = MINI_MOCK_LENGTHS.some((l) => l.total === nParam) ? nParam : MINI_MOCK.total;
  // Memoised so `submit`'s dependency array stays stable — a fresh object each
  // render would rebuild the callback on every tick of the countdown.
  const miniCfg = React.useMemo(() => miniMockConfig(miniLength), [miniLength]);
  // Drill mode: one exam section at its real size and pass mark.
  const drillParam = sp.get("section") as ExamSection | null;
  const drill: ExamSection | null =
    sp.get("mode") === "drill" && drillParam && drillParam in EXAM_FORMAT.sections
      ? drillParam
      : null;
  const passMark = drill
    ? SECTION_DRILL[drill].passMark
    : mini
      ? miniCfg.passMark
      : EXAM_FORMAT.passMark;
  // Named `bank` deliberately: `questions` below is the paper currently being
  // sat, and sampling from that instead of the bank builds an empty exam.
  const { questions: bank } = useContentPool();
  const [phase, setPhase] = React.useState<"intro" | "exam" | "results">("intro");
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<number[]>([]);
  const [i, setI] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState(EXAM_SECONDS);
  // Mini results live here. Minis feed the predictor AND are recorded to
  // state.mockExams with a `mini` flag, so the daily mock allowances count them.
  const [miniResult, setMiniResult] = React.useState<ExamResult | null>(null);
  const startRef = React.useRef(0);
  // Fire-once guard: submit() is reachable from the X button, "Submit now",
  // the finish arrow AND the timer expiry. A racing double-click used to push
  // two identical exam rows and double the CP.
  const submittedRef = React.useRef(false);
  // Pass probability before this exam's answers hit the readiness model —
  // shown against the recomputed value so the learner sees the number move.
  const preProbRef = React.useRef<number | null>(null);
  const cpStartRef = React.useRef<number | null>(null);

  const remainingMocks = drill ? drillsRemaining(state) : mocksRemaining(state, mini ? "mini" : "full");

  const submit = React.useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const correct = questions.reduce((n, q, idx) => n + (answers[idx] === q.correctIndex ? 1 : 0), 0);
    const perCategory: Partial<Record<CategoryId, CategoryScore>> = {};
    for (const cat of CATEGORIES) {
      const idxs = questions.map((q, idx) => ({ q, idx })).filter((x) => x.q.categoryId === cat.id);
      if (!idxs.length) continue;
      const c = idxs.filter((x) => answers[x.idx] === x.q.correctIndex).length;
      perCategory[cat.id] = { correct: c, total: idxs.length, score: Math.round((c / idxs.length) * 100) };
    }
    const mark = drill ? SECTION_DRILL[drill].passMark : mini ? miniCfg.passMark : EXAM_FORMAT.passMark;
    // Minis and drills aren't sectioned, so they keep their single mark. A full
    // paper goes through fullMockPassed, which requires each section's own mark
    // as well as the total — the rule the DLTC actually applies.
    const passed =
      mini || drill
        ? correct >= mark
        : fullMockPassed(
            Object.fromEntries(
              EXAM_SECTIONS.map((s) => [
                s,
                questions.filter(
                  (q, idx) => SECTION_OF[q.categoryId] === s && answers[idx] === q.correctIndex,
                ).length,
              ]),
            ) as Record<ExamSection, number>,
          );
    const durationSeconds = Math.round((Date.now() - startRef.current) / 1000);
    const responses = questions.map((q, idx) => ({
      questionId: q.id,
      categoryId: q.categoryId,
      correct: answers[idx] === q.correctIndex,
      selectedIndex: answers[idx],
    }));
    if (drill) {
      // Drills carry their section so the per-plan drill allowance can count
      // them; like minis, they feed the readiness model but aren't full mocks.
      recordMockExam(
        { score: correct, total: questions.length, passed, perCategory, durationSeconds, drill },
        responses,
      );
      setMiniResult({ score: correct, total: questions.length, passed, perCategory });
      track("drill_completed", { section: drill, passed });
    } else if (mini) {
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
    // Drills report themselves above; this covers the two that are actually
    // mock papers. `kind` keeps the daily mini distinct from the full 64 —
    // they are very different signals and averaging them hides both.
    if (!drill) {
      track("mock_completed", {
        kind: mini ? "mini" : "full",
        score: correct,
        total: questions.length,
        passed,
        duration_s: durationSeconds,
      });
    }
    recordSession("mock", durationSeconds);
    // Finishing a full mock is the biggest moment in the app — mark it.
    haptics.celebrate();
    setPhase("results");
  }, [answers, questions, mini, drill, miniCfg, recordMockExam, recordSession]);

  // Countdown timer. The remainder is derived from the absolute deadline
  // (start + allotted seconds), not decremented once per tick: background
  // tabs throttle timers to roughly one firing a minute, so a tick chain
  // silently pauses the moment the tab is hidden — while wall-clock time,
  // which is what durationSeconds records, keeps running. An absolute
  // deadline keeps the countdown honest and makes switching apps mid-paper
  // a way to buy time.
  React.useEffect(() => {
    if (phase !== "exam") return;
    const seconds = drill ? SECTION_DRILL[drill].seconds : mini ? miniCfg.seconds : EXAM_SECONDS;
    const deadline = startRef.current + seconds * 1000;
    let timeoutId = 0;
    const tick = () => {
      const left = Math.ceil((deadline - Date.now()) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) {
        submit();
        return;
      }
      timeoutId = window.setTimeout(tick, 500);
    };
    tick();
    return () => window.clearTimeout(timeoutId);
  }, [phase, drill, mini, miniCfg, submit]);

  function start() {
    const qs = drill
      ? sampleSectionDrill(bank, drill, state.attempts, studyCodeOf(state))
      : mini
        ? sampleMiniMock(bank, state.attempts, studyCodeOf(state), readiness.weakCategories, miniCfg.total)
        : sampleMockExam(bank, state.attempts, studyCodeOf(state));
    if (drill) track("drill_started", { section: drill });
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(-1));
    setI(0);
    setSecondsLeft(drill ? SECTION_DRILL[drill].seconds : mini ? miniCfg.seconds : EXAM_SECONDS);
    startRef.current = Date.now();
    // Reset the fire-once guard: "Take another" starts a fresh paper, and a
    // guard left over from the previous submission made every submit path —
    // button, arrow, nav row AND timer expiry — silently no-op until reload.
    submittedRef.current = false;
    preProbRef.current = readiness.passProbability;
    cpStartRef.current = state.cp;
    setPhase("exam");
  }

  if (remainingMocks <= 0 && phase === "intro") {
    const free = state.tier === "free";
    return (
      <div className="mx-auto max-w-md py-10">
        {drill ? (
          <Paywall
            feature="section_drill"
            plan={free ? "premium" : "premium_plus"}
            title={free ? "That's today's free section drill" : "You've done today's 5 section drills"}
            description={
              free
                ? "One timed drill a day is included in your free week. Premium gives you 5 section drills a day — signs, rules or controls, each at its real pass mark."
                : "Your daily allowance resets tomorrow. Premium Plus removes drill limits entirely."
            }
            cta={free ? "Unlock 5 drills a day" : "See Premium Plus"}
          />
        ) : free && !mini ? (
          <Paywall
            feature="mock_exam"
            plan="premium"
            title="Full mock exams are a Premium feature"
            description="The real 64-question exam experience — timed, scored and mapped to your weak areas. Your free week includes a 15-question mini mock every day instead."
            cta="Unlock full mocks"
          />
        ) : free ? (
          <Paywall
            feature="mini_mock"
            plan="premium"
            title="That's today's free mini mock"
            description="You get one a day through your free week. Premium gives you 3 full mocks and 5 mini mocks every day until test day."
            cta="Unlock daily mocks"
          />
        ) : (
          <Paywall
            feature={mini ? "mini_mock" : "mock_exam"}
            plan="premium_plus"
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
            {mini || drill ? <Timer className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            {drill ? `${SECTION_LABEL[drill]} drill` : mini ? "Mini mock" : "Full mock exam"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {drill
              ? `The real test's ${SECTION_LABEL[drill].toLowerCase()} section on its own — ${SECTION_DRILL[drill].total} questions at the real pace, and you need ${SECTION_DRILL[drill].passMark} to pass, exactly like on test day.`
              : mini
                ? `${miniCfg.total} questions at the real test's pass ratio, weighted toward your weakest areas — pick a length below.`
                : `${EXAM_FORMAT.totalQuestions} questions, just like the real test. You must reach the pass mark in every section. The clock starts when you begin.`}
          </p>
          {/* Three across leaves each tile ~38px of content at 320px, and the
              word "Questions" needs 62px — so the labels painted straight over
              their own borders and into the next tile, with nothing clipping
              them. No padding or type tweak closes a 24px gap at three columns,
              so the row reflows to two below `sm` and keeps three above. */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Stat label="Questions" value={`${drill ? SECTION_DRILL[drill].total : mini ? miniCfg.total : EXAM_FORMAT.totalQuestions}`} />
            <Stat label="To pass" value={`${passMark}`} />
            <Stat label="Time" value={drill ? `${Math.round(SECTION_DRILL[drill].seconds / 60)} min` : mini ? `${Math.round(miniCfg.seconds / 60)} min` : "60 min"} />
          </div>
          {!mini && !drill && (
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

          {/* Framed by intent, not by count — nobody sits down wanting "10
              questions"; they want to know if they still remember it. */}
          {mini && (
            <div className="mt-5 grid grid-cols-2 gap-2 text-left">
              {MINI_MOCK_LENGTHS.map((l) => (
                <Link
                  key={l.total}
                  href={`/study/mock-exam?mode=mini&n=${l.total}`}
                  scroll={false}
                  aria-current={l.total === miniCfg.total ? "true" : undefined}
                  className={cn(
                    "press rounded-xl border-2 p-3 transition-colors",
                    l.total === miniCfg.total
                      ? "border-primary bg-primary/[0.05]"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="block text-sm font-semibold text-foreground">{l.label}</span>
                  <span className="block text-xs text-muted-foreground">{l.blurb}</span>
                  <span className="mt-1 block font-mono text-2xs text-muted-foreground">
                    {l.total} questions · pass {miniMockConfig(l.total).passMark}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <Button size="xl" className="mt-7 w-full" onClick={start}>
            Start {drill ? "drill" : mini ? "mini mock" : "mock exam"} <ArrowRight />
          </Button>
          {drill && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
              {EXAM_SECTIONS.filter((s) => s !== drill).map((s) => (
                <Link
                  key={s}
                  href={`/study/mock-exam?mode=drill&section=${s}`}
                  className="font-medium text-primary hover:underline"
                >
                  {SECTION_LABEL[s]} instead
                </Link>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
            <Link
              href={mini || drill ? "/study/mock-exam" : "/study/mock-exam?mode=mini"}
              className="font-medium text-primary hover:underline"
            >
              {mini || drill ? "Do the full 64-question mock" : "Short on time? Try the mini mock"}
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
    const last: ExamResult | undefined = mini || drill
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
    const failedSections = mini || drill
      ? []
      : sectionScores.filter((s) => s.correct < s.pass).map((s) => SECTION_LABEL[s.section]);
    const weakCategories = (Object.keys(last.perCategory) as CategoryId[])
      .sort((a, b) => last.perCategory[a]!.score - last.perCategory[b]!.score)
      .slice(0, 2)
      .map(categoryName);
    // The paper just named exactly where the learner stands — route the next
    // move at it. A failed section gets its own drill while the miss is fresh;
    // with the drill allowance spent, untimed practice on the weakest category
    // carries the same intent. A passed full paper recommends nothing.
    const mockNextStep =
      !mini && !drill
        ? nextStepAfterMock({
            failedSections: sectionScores
              .filter((s) => s.correct < s.pass)
              .map(({ section, correct, total }) => ({ section, correct, total })),
            drillsLeft: drillsRemaining(state),
            weakestCategoryId:
              (Object.keys(last.perCategory) as CategoryId[]).sort(
                (a, b) => last.perCategory[a]!.score - last.perCategory[b]!.score,
              )[0] ?? null,
          })
        : null;
    return (
      <div className="mx-auto max-w-2xl">
        {/* Results phase renders only h2 sections below, so the page's h1 is
            this visually-hidden one naming what was just completed. */}
        <h1 className="sr-only">
          {drill ? "Section drill results" : mini ? "Mini mock results" : "Mock exam results"}
        </h1>
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
                ? drill
                  ? `${SECTION_LABEL[drill]} section passed 🎉`
                  : mini
                    ? "Mini mock passed 🎉"
                    : "You passed 🎉"
                : last.score >= passMark
                  ? "Failed on a section"
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

          {/* Say the consequence out loud. The per-section table below is
              accurate but silent — a learner reading "52/64" beside a green
              ring should not have to work out for themselves that the DLTC
              would still have failed them. */}
          {!mini && !drill && failedSections.length > 0 && (
            <p className="mt-4 rounded-xl border border-warning/30 bg-warning/[0.06] px-4 py-3 text-sm leading-relaxed text-foreground">
              {last.score >= passMark ? (
                <>
                  You cleared the overall mark ({last.score}/{last.total}) but missed the pass mark
                  in <strong>{failedSections.join(" and ")}</strong>. On the real paper every
                  section must pass on its own — this would have been a fail.
                </>
              ) : (
                <>
                  Below the mark in <strong>{failedSections.join(" and ")}</strong>. Each section
                  has to clear its own pass mark on test day, so that&apos;s where the work is.
                </>
              )}
            </p>
          )}
        </Card>

        {mockNextStep && (
          <NextStepCard
            className="mt-5"
            title={mockNextStep.title}
            body={mockNextStep.body}
            href={mockNextStep.href}
            cta={mockNextStep.cta}
          />
        )}

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

        {!mini && !drill && (
        <Card className="mt-5 p-6">
          <h2 className="font-display text-lg font-semibold">By section</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The real test requires passing every section, not just the overall mark.
          </p>
          <div className="mt-4 space-y-2">
            {sectionScores.map((s) => {
              const passed = s.correct >= s.pass;
              return (
                <div key={s.section} className="rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{SECTION_LABEL[s.section]}</span>
                    <Badge variant={passed ? "success" : "warning"}>{passed ? "Pass" : "Fail"}</Badge>
                  </div>
                  {/* The tick is the pass mark. "3 short" beats making the
                      learner subtract 22 from 19 to find out where they stand. */}
                  <MasteryBar
                    className="mt-2"
                    label={<span className="sr-only">{SECTION_LABEL[s.section]} score</span>}
                    value={(s.correct / s.total) * 100}
                    threshold={(s.pass / s.total) * 100}
                    thresholdLabel={`Pass mark ${s.pass} of ${s.total}`}
                    count={`${s.correct}/${s.total} · need ${s.pass}`}
                  />
                </div>
              );
            })}
          </div>
        </Card>
        )}

        <Card className="mt-5 p-6">
          <h2 className="font-display text-lg font-semibold">By category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap any category to practise it.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(Object.keys(last.perCategory) as CategoryId[]).map((cat) => (
              <Link key={cat} href={`/study/questions?category=${cat}`} className="group block">
                <MasteryBar
                  label={<span className="group-hover:text-primary">{categoryName(cat)}</span>}
                  value={last.perCategory[cat]!.score}
                  count={`${last.perCategory[cat]!.correct}/${last.perCategory[cat]!.total}`}
                />
              </Link>
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

        <div className="mt-6 flex flex-wrap justify-center gap-3">
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
    // Exam conditions — correctness stays hidden until submit, so this is a
    // neutral acknowledgement rather than a right/wrong signal.
    haptics.tap();
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
        {/* Answered or not — never right or wrong. The paper is still open, and
            a green tick mid-exam would hand the learner a mark the real DLTC
            would not. On a full 64 the segments fall away and this is the plain
            bar it has always been. */}
        <SessionProgress
          completed={i + 1}
          total={questions.length}
          index={i}
          outcomes={answers.map((a) => (a >= 0 ? "done" : "pending"))}
        />
        <span className={cn("flex items-center gap-1 font-mono text-xs", secondsLeft < 300 ? "text-danger" : "text-muted-foreground")}>
          <Clock className="h-3.5 w-3.5" /> {mm}:{ss}
        </span>
      </div>

      <div className="mx-auto mt-3 flex max-w-xl items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">Question {i + 1} of {questions.length}</span>
        <button onClick={submit} className="text-xs font-medium text-primary hover:underline">Submit now</button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <ExamNavButton dir="prev" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} className="hidden sm:flex" />

        <div key={i} className="mx-auto min-w-0 max-w-xl flex-1 animate-fade-in">
          {(q.image || q.sign) && (
            <div className="mb-4">
              <SignVisual image={q.image} sign={q.sign} alt={signQuestionAlt(q.image, q.categoryId)} className="h-20 w-20" detail={q.imageDetail} priority />
            </div>
          )}
          <SignPreload image={questions[i + 1]?.image} />
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
          className="hidden sm:flex"
        />
      </div>

      {/* Phones: advance/submit under the answers, in thumb reach — see
          SessionNavRow. Submit keeps the exam's neutral tone until the end. */}
      <SessionNavRow
        onPrev={() => setI((x) => Math.max(0, x - 1))}
        onNext={() => (i + 1 >= questions.length ? submit() : setI((x) => x + 1))}
        prevDisabled={i === 0}
        nextDisabled={!answered}
        nextLabel="Next question"
        finish={i + 1 >= questions.length}
        finishLabel="Submit exam"
      />
    </div>
  );
}

/** Round side-arrow controls (desktop) — same interaction pattern as question practice. */
function ExamNavButton({
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
      aria-label={dir === "prev" ? "Previous question" : finish ? "Submit exam" : "Next question"}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="tabular font-mono text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
