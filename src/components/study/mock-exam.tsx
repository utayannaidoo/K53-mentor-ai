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
import {
  MAX_DRAFT_AGE_MS,
  clearMockDraft,
  loadMockDraft,
  saveMockDraft,
  scaledPassMark,
  validateMockDraft,
  type ExamDraft,
} from "@/lib/study/exam-draft";
import { nextStepAfterMock, nextStepAfterMini } from "@/lib/learning/next-step";
import { CATEGORIES, categoryName } from "@/lib/content/categories";
import { sourceFor } from "@/lib/content/provenance";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { CategoryId, CategoryScore, Question } from "@/types";

const LETTERS = ["A", "B", "C", "D"];
const EXAM_SECONDS = 60 * 60;

/** Below this much time left, a saved draft is no longer worth a resume tap. */
const RESUME_MIN_LEFT_MS = 30_000;

const EXAM_SECTIONS = Object.keys(EXAM_FORMAT.sections) as ExamSection[];

interface ExamResult {
  score: number;
  total: number;
  passed: boolean;
  perCategory: Partial<Record<CategoryId, CategoryScore>>;
}

/**
 * The paper the URL asks for, BEFORE sampling: advertised question count,
 * pass mark and clock. The sampler may return fewer questions than advertised
 * (a thin starter-pack bank), and that gap is exactly what `scaledPassMark`
 * corrects for at sample time — this function is the "requested" side of that
 * ratio, and the single derivation the timer, the draft and the intro share.
 */
function requestedConfig(
  mode: ExamDraft["mode"],
  drillSection: ExamSection | null,
  miniTotal: number,
): { total: number; mark: number; seconds: number } {
  if (mode === "drill" && drillSection) {
    const cfg = SECTION_DRILL[drillSection];
    return { total: cfg.total, mark: cfg.passMark, seconds: cfg.seconds };
  }
  if (mode === "mini") {
    const cfg = miniMockConfig(miniTotal);
    return { total: cfg.total, mark: cfg.passMark, seconds: cfg.seconds };
  }
  return { total: EXAM_FORMAT.totalQuestions, mark: EXAM_FORMAT.passMark, seconds: EXAM_SECONDS };
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
  // Mode as the resume-draft system names it — also the key requestedConfig
  // switches on.
  const draftMode: ExamDraft["mode"] = drill ? "drill" : mini ? "mini" : "full";
  // Advertised shape of this url's paper. Memoised so it can sit in effect
  // and callback dependency arrays without churning.
  const requested = React.useMemo(
    () => requestedConfig(draftMode, drill, miniLength),
    [draftMode, drill, miniLength],
  );
  const passMark = requested.mark;
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
  // The paper JUST submitted — the results screen renders this rather than
  // reading the store's last row, which a cross-tab adoption could have
  // replaced between submit and render.
  const [justSubmitted, setJustSubmitted] = React.useState<ExamResult | null>(null);
  const startRef = React.useRef(0);
  // Fire-once guard: submit() is reachable from the X button, "Submit now",
  // the finish arrow AND the timer expiry. A racing double-click used to push
  // two identical exam rows and double the CP.
  const submittedRef = React.useRef(false);
  // Pass probability before this exam's answers hit the readiness model —
  // shown against the recomputed value so the learner sees the number move.
  const preProbRef = React.useRef<number | null>(null);
  const cpStartRef = React.useRef<number | null>(null);
  // ── Crash/reload resume ──
  // A validated draft of an interrupted paper, awaiting the learner's verdict
  // on the intro screen. null = nothing worth offering.
  const [resumeOffer, setResumeOffer] = React.useState<ExamDraft | null>(null);
  // The pass mark computed from the ACTUAL sampled paper, stashed at sample
  // time (start/resume). A thin bank can hand back fewer questions than were
  // requested; grading and every displayed "pass at N" for minis/drills then
  // use this instead of the advertised figure, so the pass RATIO stays honest.
  // Full papers are deliberately exempt — the official 64-question format is
  // kept verbatim (sampleMockExam returns 64 or nothing). Keyed by paper
  // configuration so a value left by one mode can't leak onto another's intro.
  const [paperMark, setPaperMark] = React.useState<{ key: string; mark: number } | null>(null);

  const remainingMocks = drill ? drillsRemaining(state) : mocksRemaining(state, mini ? "mini" : "full");

  // Resume rebuilds papers by id, so it needs id → question lookups over the
  // CURRENT pool. Recomputed when the pack lands: on first mount this may only
  // cover the starter pack.
  const bankIds = React.useMemo(() => new Set(bank.map((q) => q.id)), [bank]);
  const bankById = React.useMemo(() => new Map(bank.map((q) => [q.id, q] as const)), [bank]);
  // Identifies which paper configuration a stashed pass mark belongs to — a
  // query-string switch between modes/lengths must fall back to advertised.
  const paperKey = `${draftMode}:${drill ?? ""}:${mini ? miniLength : ""}`;
  // The one pass mark every display and the grading path agree on: scaled to
  // the actual paper for minis/drills once one has been sampled, the official
  // section-mark regime's overall figure for full papers.
  const effectivePassMark =
    !mini && !drill
      ? EXAM_FORMAT.passMark
      : paperMark && paperMark.key === paperKey
        ? paperMark.mark
        : passMark;

  const submit = React.useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    // The paper just completed — its crash insurance goes with it. Cleared
    // before any async work so a reload during recording can't resurrect a
    // paper that was already graded.
    clearMockDraft();
    const correct = questions.reduce((n, q, idx) => n + (answers[idx] === q.correctIndex ? 1 : 0), 0);
    const perCategory: Partial<Record<CategoryId, CategoryScore>> = {};
    for (const cat of CATEGORIES) {
      const idxs = questions.map((q, idx) => ({ q, idx })).filter((x) => x.q.categoryId === cat.id);
      if (!idxs.length) continue;
      const c = idxs.filter((x) => answers[x.idx] === x.q.correctIndex).length;
      perCategory[cat.id] = { correct: c, total: idxs.length, score: Math.round((c / idxs.length) * 100) };
    }
    // Minis and drills grade against the sample-time scaled mark: a thin bank
    // shrinks the paper, not the pass ratio. Full papers keep the official
    // mark — fullMockPassed below applies every section's own bar regardless.
    const mark = mini || drill ? effectivePassMark : EXAM_FORMAT.passMark;
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
    // The result the learner is about to see, captured at submit time. The
    // results screen used to read state.mockExams[last] instead — correct in
    // isolation, but a cross-tab adoption landing between submit and render
    // could display a DIFFERENT paper than the one just sat.
    setJustSubmitted({ score: correct, total: questions.length, passed, perCategory });
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
  }, [answers, questions, mini, drill, effectivePassMark, recordMockExam, recordSession]);

  // Countdown timer. The remainder is derived from the absolute deadline
  // (start + allotted seconds), not decremented once per tick: background
  // tabs throttle timers to roughly one firing a minute, so a tick chain
  // silently pauses the moment the tab is hidden — while wall-clock time,
  // which is what durationSeconds records, keeps running. An absolute
  // deadline keeps the countdown honest and makes switching apps mid-paper
  // a way to buy time.
  React.useEffect(() => {
    if (phase !== "exam") return;
    const deadline = startRef.current + requested.seconds * 1000;
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
  }, [phase, requested, submit]);

  // ── Reload resume ──
  // Offer the saved paper back while the intro shows. Deliberately re-runs
  // when the bank identity changes: the first validation after a cold load
  // usually runs against the starter pack, so a draft drawn from the full
  // bank fails id resolution until the paid pack finishes syncing — at which
  // point this fires again and the offer appears.
  React.useEffect(() => {
    if (phase !== "intro") return;
    const saved = loadMockDraft();
    if (!saved) {
      // No draft behind the current offer any more (submit cleared it, say) —
      // drop the offer too, or a stale card would outlive its paper.
      setResumeOffer(null);
      return;
    }
    const verdict = validateMockDraft(saved, {
      profileId: state.profile?.id ?? null,
      mode: draftMode,
      drillSection: drill,
      secondsAllotted: requested.seconds,
      bankQuestionIds: bankIds,
      maxAgeMs: MAX_DRAFT_AGE_MS,
    });
    if (!verdict.ok) {
      setResumeOffer(null);
      // Expired drafts are cleared outright — nothing can ever revive them.
      // Every other refusal may be transient (bank still loading, account
      // still hydrating), so those drafts stay where they are.
      if (verdict.reason === "stale") clearMockDraft();
      return;
    }
    const remainingMs = verdict.draft.deadlineMs - Date.now();
    if (remainingMs >= verdict.draft.secondsAllotted * 1000) {
      // The clock was never touched: nothing was really "started", so there
      // is no paper to resume. Draft kept — Start will overwrite it anyway.
      setResumeOffer(null);
      return;
    }
    if (remainingMs <= RESUME_MIN_LEFT_MS) {
      // Under 30 seconds the paper is effectively dead. Clear it rather than
      // let it linger as debris behind an offer nobody can use.
      clearMockDraft();
      setResumeOffer(null);
      return;
    }
    setResumeOffer(verdict.draft);
  }, [phase, bankIds, state.profile?.id, draftMode, drill, requested]);

  /**
   * Rewrite the persisted draft after every in-exam change. Unthrottled on
   * purpose — each write is one tiny JSON blob, and the write IS the crash
   * insurance: a refresh the instant after an answer must keep that answer.
   */
  function persistDraft(nextAnswers: number[], nextIndex: number) {
    if (questions.length === 0) return;
    saveMockDraft({
      kind: "mock",
      savedAt: new Date().toISOString(),
      ownerProfileId: state.profile?.id ?? null,
      mode: draftMode,
      drillSection: drill,
      questionIds: questions.map((q) => q.id),
      answers: nextAnswers,
      index: nextIndex,
      // Derived exactly like the timer's deadline: absolute wall-clock, so
      // reloading neither pauses nor extends the paper.
      deadlineMs: startRef.current + requested.seconds * 1000,
      secondsAllotted: requested.seconds,
    });
  }

  /** Throw the offered paper away — the learner chose a fresh start. */
  function discardDraft() {
    clearMockDraft();
    setResumeOffer(null);
  }

  /**
   * Put the learner back into their saved paper: resolve every id through the
   * CURRENT pool preserving order, restore answers/index, and rebuild the
   * clock from the absolute deadline. `startRef` is rewound to the original
   * start moment (deadline − allotment) so durationSeconds reports the whole
   * sitting honestly — the interruption counts as exam time, exactly as it
   * would have had the tab stayed open.
   */
  function resumeExam() {
    const d = resumeOffer;
    if (!d) return;
    const qs: Question[] = [];
    for (const id of d.questionIds) {
      const found = bankById.get(id);
      if (!found) {
        // The bank shrank between offering and clicking (an entitlement lapse,
        // say). Refuse honestly rather than seat a shorter paper than the one
        // that was started.
        discardDraft();
        return;
      }
      qs.push(found);
    }
    startRef.current = d.deadlineMs - d.secondsAllotted * 1000;
    setQuestions(qs);
    setAnswers([...d.answers]);
    setI(Math.min(d.index, qs.length - 1));
    setSecondsLeft(Math.max(0, Math.ceil((d.deadlineMs - Date.now()) / 1000)));
    submittedRef.current = false;
    preProbRef.current = readiness.passProbability;
    cpStartRef.current = state.cp;
    // Same sample-time mark logic as start(): the rebuilt paper's length may
    // differ from advertised, so grade it on its own ratio (minis/drills only).
    if (mini || drill) {
      setPaperMark({ key: paperKey, mark: scaledPassMark(requested.total, requested.mark, qs.length) });
    }
    setResumeOffer(null);
    setPhase("exam");
  }

  /** Prev arrow / bottom row — persists the index change with the draft. */
  function goPrev() {
    const prev = Math.max(0, i - 1);
    setI(prev);
    persistDraft(answers, prev);
  }

  /** Next arrow / bottom row — advancing past the final question submits. */
  function advanceOrSubmit() {
    if (i + 1 >= questions.length) {
      submit();
      return;
    }
    setI(i + 1);
    persistDraft(answers, i + 1);
  }

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
    setSecondsLeft(requested.seconds);
    const startedAt = Date.now();
    startRef.current = startedAt;
    // Reset the fire-once guard: "Take another" starts a fresh paper, and a
    // guard left over from the previous submission made every submit path —
    // button, arrow, nav row AND timer expiry — silently no-op until reload.
    submittedRef.current = false;
    preProbRef.current = readiness.passProbability;
    cpStartRef.current = state.cp;
    // Starting fresh supersedes any resume offer still on screen.
    setResumeOffer(null);
    // Crash insurance, written before the first tick: the sampled paper's ids
    // plus an ABSOLUTE deadline, so a mid-paper reload can rebuild everything
    // (the countdown itself is derived from start + allotment, see above).
    saveMockDraft({
      kind: "mock",
      savedAt: new Date(startedAt).toISOString(),
      ownerProfileId: state.profile?.id ?? null,
      mode: draftMode,
      drillSection: drill,
      questionIds: qs.map((q) => q.id),
      answers: new Array(qs.length).fill(-1),
      index: 0,
      deadlineMs: startedAt + requested.seconds * 1000,
      secondsAllotted: requested.seconds,
    });
    // Honest numbers for THIS exact paper: if the bank came up short of the
    // requested length, both the grading bar and every displayed "pass at N"
    // shrink with it instead of quietly failing learners on missing content.
    // Full papers stash nothing — their official mark never moves.
    if (mini || drill) {
      setPaperMark({ key: paperKey, mark: scaledPassMark(requested.total, requested.mark, qs.length) });
    }
    setPhase("exam");
  }

  // ── Resume card (rendered on the intro screen, above the intro content) ──
  // A static snapshot of the remaining time is fine here: the card is a
  // decision point, not a live countdown — the clock itself restarts honestly
  // from the deadline the moment they tap Resume.
  const msLeft = resumeOffer ? Math.max(0, resumeOffer.deadlineMs - Date.now()) : 0;
  const resumeMinutes = Math.floor(msLeft / 60_000);
  const resumeSeconds = Math.floor((msLeft % 60_000) / 1000);
  const resumeTitle = drill
    ? `${SECTION_LABEL[drill]} drill`
    : mini
      ? "Mini mock"
      : "Full mock exam";

  const resumeCard = resumeOffer ? (
    <Card className="p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Timer className="h-5 w-5" />
      </div>
      <h2 className="mt-3 font-display text-lg font-semibold tracking-tight">
        You have an unfinished paper
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {resumeTitle} · question {resumeOffer.index + 1} of {resumeOffer.questionIds.length},{" "}
        {resumeMinutes} min {resumeSeconds} sec left on the clock.
      </p>
      {/* Resuming deliberately ignores the daily mock allowance: this paper
          already spent it when it started. Starting something NEW below is
          what the gate still applies to. */}
      <Button size="lg" className="mt-5 w-full" onClick={resumeExam}>
        Resume <ArrowRight />
      </Button>
      <Button variant="outline" size="lg" className="mt-2 w-full" onClick={discardDraft}>
        Discard
      </Button>
    </Card>
  ) : null;

  // An unfinished paper already spent its allowance — resuming must NOT be
  // gated behind mocks the learner no longer has. With an offer standing, the
  // resume card replaces the paywall entirely: starting something new stays
  // gated, finishing what was started does not.
  if (phase === "intro" && remainingMocks <= 0 && resumeOffer) {
    return (
      <div className="mx-auto max-w-md py-10">{resumeCard}</div>
    );
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
        {resumeCard}
        <Card className={cn("p-8 text-center", resumeOffer && "mt-5")}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {mini || drill ? <Timer className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            {drill ? `${SECTION_LABEL[drill]} drill` : mini ? "Mini mock" : "Full mock exam"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {drill
              ? `The real test's ${SECTION_LABEL[drill].toLowerCase()} section on its own — ${SECTION_DRILL[drill].total} questions at the real pace, and you need ${effectivePassMark} to pass, exactly like on test day.`
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
            {/* The scaled mark once a paper exists for this configuration —
                before that, the advertised figure is all we can honestly say. */}
            <Stat label="To pass" value={`${effectivePassMark}`} />
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
                    {/* Advertised marks — each length only learns its actual
                        sampled size (and scaled mark) once a paper is built. */}
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
    // The paper just sat — captured at submit, immune to concurrent store
    // writes. Falls back to the store's last row only if somehow missing.
    const last: ExamResult | undefined =
      justSubmitted ??
      (mini || drill ? (miniResult ?? undefined) : state.mockExams[state.mockExams.length - 1]);
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
    // move at it. A failed full-mock section gets its own drill while the miss
    // is fresh; with the drill allowance spent, untimed practice on the weakest
    // category carries the same intent. Minis and drills have no section marks
    // to fail, so their lowest-scoring category is the one honest pointer. A
    // passed paper of any length recommends nothing.
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
        : nextStepAfterMini({ passed: last.passed, perCategory: last.perCategory });
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
                : last.score >= effectivePassMark
                  ? "Failed on a section"
                  : `${effectivePassMark - last.score} short of passing`}
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
    const copy = [...answers];
    copy[i] = optionIndex;
    setAnswers(copy);
    persistDraft(copy, i);
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
        <ExamNavButton dir="prev" onClick={goPrev} disabled={i === 0} className="hidden sm:flex" />

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
          onClick={advanceOrSubmit}
          disabled={!answered}
          finish={i + 1 >= questions.length}
          className="hidden sm:flex"
        />
      </div>

      {/* Phones: advance/submit under the answers, in thumb reach — see
          SessionNavRow. Submit keeps the exam's neutral tone until the end. */}
      <SessionNavRow
        onPrev={goPrev}
        onNext={advanceOrSubmit}
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
