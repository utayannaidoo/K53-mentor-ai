"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { SignVisual, SignPreload } from "@/components/shared/sign-visual";
import { signQuestionAlt } from "@/lib/content/sign-alt";
import { CategoryIcon } from "@/components/shared/category-icon";
import { CATEGORIES } from "@/lib/content/categories";
import { sampleDiagnostic } from "@/lib/diagnostic/select";
import { useContentPool } from "@/components/content/content-provider";
import { studyCodeOf } from "@/lib/billing/plans";
import { scoreDiagnostic } from "@/lib/diagnostic/scoring";
import { useStudyStore } from "@/hooks/use-study-store";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import type { Question } from "@/types";
import {
  MAX_DRAFT_AGE_MS,
  clearDiagnosticDraft,
  loadDiagnosticDraft,
  saveDiagnosticDraft,
  validateDiagnosticDraft,
  type DiagnosticDraft,
} from "@/lib/study/exam-draft";

const LETTERS = ["A", "B", "C", "D"];

/**
 * The diagnostic sits outside the app shell, so it has to wait for the account
 * itself. The question set is sampled once, on first render — sample it before
 * the account lands and the whole diagnostic is drawn from an unresolved
 * licence code (another vehicle track's questions, or the entire bank).
 */
export function DiagnosticRunner() {
  const { ready, accountHydrated } = useStudyStore();
  if (!ready || !accountHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <DiagnosticQuiz />;
}

/**
 * How long the chosen option stays lit before the next question replaces it.
 *
 * The diagnostic deliberately does not reveal whether the answer was right —
 * it is an assessment, and the breakdown comes at the end. But it does show
 * WHICH option was picked, and at the old 280ms that confirmation was gone
 * before the eye could land on it: the screen just changed. Long enough to
 * register the tap, short enough that 15 questions still move briskly.
 */
const ADVANCE_MS = 650;

function DiagnosticQuiz() {
  const router = useRouter();
  const { state, isAuthed, recordQuestionAttempt, recordDiagnostic, recordSession } =
    useStudyStore();
  const { questions: bank, full } = useContentPool();
  // Wall-clock length of the diagnostic — recorded as a study session so
  // "Time studied" doesn't pretend the assessment took zero minutes.
  const startRef = React.useRef(Date.now());

  const [questions, setQuestions] = React.useState(() =>
    sampleDiagnostic(
      bank,
      state.attempts,
      studyCodeOf(state),
      state.onboarding?.worryCategories ?? [],
    ),
  );
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [responses, setResponses] = React.useState<
    { questionId: string; categoryId: (typeof CATEGORIES)[number]["id"]; correct: boolean; selectedIndex: number }[]
  >([]);
  const [phase, setPhase] = React.useState<"quiz" | "analyzing">("quiz");
  const [lit, setLit] = React.useState(0);
  // ── Reload resume ──
  // A diagnostic interrupted by a refresh or closed tab. Restoring replays the
  // recorded responses WITHOUT re-recording attempts (those were written live
  // before the interruption) and drops the learner at the first unanswered
  // question. Completion side-effects stay intact for free: the paper simply
  // continues to its end and goes through the normal recordDiagnostic path.
  const [resumeOffer, setResumeOffer] = React.useState<DiagnosticDraft | null>(null);

  // Id → question lookups over the CURRENT pool. The bank can still be the
  // bundled starter pack when this first runs — the effect below re-runs when
  // a fuller pack lands.
  const bankIds = React.useMemo(() => new Set(bank.map((q) => q.id)), [bank]);
  const bankById = React.useMemo(() => new Map(bank.map((q) => [q.id, q] as const)), [bank]);

  // Offer the saved diagnostic back before anything else renders. Same rules
  // as the mock exam's draft: age, owner, resolvable ids, coherent shape. Runs
  // once per mount per bank identity — a cold load usually validates against
  // the starter pack first, so drafts drawn from the full bank only surface
  // once the sync lands. Guarded to the pre-answer state: once this session
  // has started (resumed or otherwise) the draft must be left alone — it is
  // deliberately kept alive until completion, so a refresh during the final
  // analysis window still resumes rather than dropping the score.
  React.useEffect(() => {
    if (resumeOffer !== null || phase !== "quiz" || responses.length > 0) return;
    const saved = loadDiagnosticDraft();
    if (!saved) return;
    const verdict = validateDiagnosticDraft(saved, {
      profileId: state.profile?.id ?? null,
      bankQuestionIds: bankIds,
      maxAgeMs: MAX_DRAFT_AGE_MS,
    });
    if (!verdict.ok) {
      // Expired drafts are debris — clear them outright. Other refusals may be
      // transient (bank still syncing, account still hydrating).
      if (verdict.reason === "stale") clearDiagnosticDraft();
      return;
    }
    setResumeOffer(verdict.draft);
  }, [resumeOffer, phase, responses.length, bankIds, state.profile?.id]);

  // The full bank arrives after mount, so a set sampled from the bundled
  // starter pack is a placeholder — thinner category coverage than the
  // diagnostic plan assumes, and possibly zero items in some categories for
  // motorcycle/heavy codes. Rebuild ONCE when the pool upgrades, and only
  // while the paper is still completely untouched: swapping questions under
  // someone mid-diagnostic would invalidate answers already given, and a
  // resumed draft is already drawn from whatever bank validated it.
  const sampledFromFull = React.useRef(full);
  React.useEffect(() => {
    if (!full || sampledFromFull.current) return;
    if (phase !== "quiz" || responses.length > 0 || resumeOffer !== null) return;
    sampledFromFull.current = true;
    setQuestions(
      sampleDiagnostic(
        bank,
        state.attempts,
        studyCodeOf(state),
        state.onboarding?.worryCategories ?? [],
      ),
    );
    setIndex(0);
    // Sampling reads this render's state/pool by design; re-running on every
    // change would reshuffle the paper under the learner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  const current = questions[index];
  const total = questions.length;

  /**
   * Synchronous re-entry lock.
   *
   * `selected !== null` alone is not a guard: it only becomes true after React
   * re-renders, so several clicks landing in the same tick (a fast double-tap
   * on a slow phone, or a stuck pointer) all read `null`, each record an
   * attempt and each schedule an advance — burning several questions and
   * answering them with whatever sat under the finger. A ref flips
   * immediately, before any state write, so the second click in a burst is
   * already too late.
   *
   * Released by the effect below rather than inside the timeout, so the lock
   * lifts only once the next question has actually rendered. On the final
   * question `index` never changes again, which correctly leaves it latched.
   */
  const answering = React.useRef(false);
  React.useEffect(() => {
    answering.current = false;
  }, [index]);

  /**
   * The completion side-effects, in one place. Extracted from answer() so the
   * resume path can drive the SAME sequence when it restores a paper whose
   * answers were already all given (a refresh during the analysis window).
   *
   * The draft is cleared only after recordDiagnostic — the whole point of the
   * draft is that a refresh before this moment resumes instead of silently
   * dropping the score row, the CP and the redirect.
   */
  function finishQuiz(finalResponses: typeof responses) {
    setPhase("analyzing");
    window.setTimeout(() => {
      const result = scoreDiagnostic(finalResponses);
      recordDiagnostic(result);
      recordSession("diagnostic", Math.round((Date.now() - startRef.current) / 1000));
      // Activation. Finishing the diagnostic is the moment the product
      // first shows a learner something they didn't know about themselves,
      // so it is the retention split worth measuring everything else against.
      track("diagnostic_completed", {
        readiness: result.readiness,
        pass_probability: result.passProbability,
        correct: result.correct,
        total: result.total,
        weakest: result.weakCategories[0] ?? "none",
      });
      clearDiagnosticDraft();
      router.push("/diagnostic/results");
    }, 3000);
  }

  function answer(optionIndex: number) {
    if (answering.current || selected !== null) return;
    answering.current = true;
    setSelected(optionIndex);
    const correct = optionIndex === current.correctIndex;
    const response = {
      questionId: current.id,
      categoryId: current.categoryId,
      correct,
      selectedIndex: optionIndex,
    };
    recordQuestionAttempt({ ...response, context: "diagnostic" });
    const nextResponses = [...responses, response];
    setResponses(nextResponses);
    // Crash insurance: persist the paper's shape and everything answered so
    // far, so a refresh here resumes rather than restarting at question 1.
    saveDiagnosticDraft({
      kind: "diagnostic",
      savedAt: new Date().toISOString(),
      ownerProfileId: state.profile?.id ?? null,
      questionIds: questions.map((q) => q.id),
      responses: nextResponses.map((r) => ({
        questionId: r.questionId,
        selectedIndex: r.selectedIndex,
      })),
      index: Math.min(index + 1, total - 1),
    });

    window.setTimeout(() => {
      setSelected(null);
      if (index + 1 >= total) {
        finishQuiz(nextResponses);
      } else {
        setIndex((i) => i + 1);
      }
    }, ADVANCE_MS);
  }

  /** Throw the offered draft away and continue with a fresh paper. */
  function discardDraft() {
    clearDiagnosticDraft();
    setResumeOffer(null);
  }

  /**
   * Rebuild the saved paper from the CURRENT pool and drop the learner back
   * in. Responses are replayed as full records graded against the rebuilt
   * questions (option order can't be reproduced across a reload — see
   * exam-draft.ts), and previously-recorded attempts are NOT re-recorded:
   * those writes already happened live before the interruption.
   */
  function resumeQuiz() {
    const d = resumeOffer;
    if (!d) return;
    const qs: Question[] = [];
    for (const id of d.questionIds) {
      const found = bankById.get(id);
      if (!found) {
        discardDraft();
        return;
      }
      qs.push(found);
    }
    const byId = new Map(qs.map((q) => [q.id, q] as const));
    const restored = d.responses.flatMap((r) => {
      const q = byId.get(r.questionId);
      if (!q) return [];
      return [
        {
          questionId: r.questionId,
          categoryId: q.categoryId,
          correct: r.selectedIndex === q.correctIndex,
          selectedIndex: r.selectedIndex,
        },
      ];
    });
    setQuestions(qs);
    setResponses(restored);
    setResumeOffer(null);
    // Everything was already answered (refresh during the analysis window) —
    // go straight to completion so no question gets asked twice.
    if (restored.length >= qs.length) {
      finishQuiz(restored);
      return;
    }
    startRef.current = Date.now();
    setIndex(restored.length);
  }

  // Sequentially "light up" categories during analysis.
  React.useEffect(() => {
    if (phase !== "analyzing") return;
    const id = window.setInterval(() => {
      setLit((n) => Math.min(n + 1, CATEGORIES.length));
    }, 320);
    return () => window.clearInterval(id);
  }, [phase]);

  if (phase === "analyzing") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
          Analysing your answers across 7 categories…
        </h1>
        <p className="mt-2 text-muted-foreground">Building your personalised plan</p>
        <div className="mt-8 grid max-w-md grid-cols-4 gap-3 sm:grid-cols-7">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.id}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300",
                i < lit
                  ? "border-primary bg-primary/10 text-primary scale-100"
                  : "border-border bg-card text-muted-foreground/40 scale-95",
              )}
            >
              <CategoryIcon id={cat.id} className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // A thin bank can sample zero questions for a licence code (the starter pack
  // carries few motorcycle/heavy items). `current` would then be undefined and
  // the very first render crashed at current.id — say so instead of white-
  // screening. (Sits after every hook: the hook order must stay unconditional.)
  if (total === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Logo />
        <h1 className="mt-6 font-display text-xl font-semibold tracking-tight">
          The diagnostic isn&apos;t available for your licence code yet
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t build a question set for this device. You can start practising right
          away — your plan will fill in as you go.
        </p>
        <Link
          href={isAuthed ? "/dashboard" : "/"}
          className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
        >
          {isAuthed ? "Go to dashboard" : "Back to home"}
        </Link>
      </div>
    );
  }

  // An interrupted diagnostic gets first claim on the screen: resuming is the
  // only way its completion side-effects (score row, CP, redirect) ever land,
  // so the offer replaces the quiz entirely until answered. A fresh paper was
  // already sampled by the state initializer — it simply waits unused if the
  // learner resumes.
  if (resumeOffer) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Logo />
        <h1 className="mt-6 font-display text-xl font-semibold tracking-tight">
          You have an unfinished diagnostic
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {resumeOffer.responses.length} of {resumeOffer.questionIds.length} answered. Pick up
          where you left off — your earlier answers still count.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button size="lg" onClick={resumeQuiz}>
            Resume
          </Button>
          <Button variant="outline" size="lg" onClick={discardDraft}>
            Start over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        {/* The only way off this screen used to be the browser's back button —
            there was not a single link on the page. Guests go back to
            marketing; a signed-in learner who bails mid-quiz stays inside the
            product (the dashboard re-prompts the diagnostic) instead of being
            dumped onto the landing page with their answers gone. */}
        <Link href={isAuthed ? "/dashboard" : "/"} aria-label="K53 Mentor AI home">
          <Logo />
        </Link>
        <span className="font-mono text-sm text-muted-foreground">
          {index + 1}/{total}
        </span>
      </header>

      <div className="mx-auto w-full max-w-xl px-6">
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          aria-valuetext={`Question ${index + 1} of ${total}`}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Advancing a question swaps the whole panel with no announcement, so a
          screen-reader user had no idea the question had changed. */}
      <p aria-live="polite" className="sr-only">
        Question {index + 1} of {total}. {current.prompt}
      </p>

      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 py-8">
        <div key={current.id} className="w-full max-w-xl animate-fade-in">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Question {index + 1}
          </p>
          {(current.image || current.sign) && (
            <div className="mt-4">
              <SignVisual
                image={current.image}
                sign={current.sign}
                alt={signQuestionAlt(current.image, current.categoryId)}
                // The sign *is* the question — 80px on a 375px phone was a squint.
                className="h-32 w-32 sm:h-36 sm:w-36"
                priority
              />
            </div>
          )}
          <SignPreload image={questions[index + 1]?.image} />
          <h1 className="mt-3 text-balance font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            {current.prompt}
          </h1>

          <div className="mt-6 space-y-3">
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={selected !== null}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                  selected === i
                    ? "border-primary bg-primary/[0.04]"
                    : "border-border hover:border-primary/40",
                  selected !== null && selected !== i && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors",
                    selected === i ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                  )}
                >
                  {LETTERS[i]}
                </span>
                <span className="text-foreground">{opt}</span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            No pressure — there&apos;s no fail here, just useful signal.
          </p>
        </div>
      </main>
    </div>
  );
}
