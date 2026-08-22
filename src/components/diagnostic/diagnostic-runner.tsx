"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
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
  const { questions: bank } = useContentPool();
  // Wall-clock length of the diagnostic — recorded as a study session so
  // "Time studied" doesn't pretend the assessment took zero minutes.
  const startRef = React.useRef(Date.now());

  const [questions] = React.useState(() =>
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

    window.setTimeout(() => {
      setSelected(null);
      if (index + 1 >= total) {
        setPhase("analyzing");
        window.setTimeout(() => {
          const result = scoreDiagnostic(nextResponses);
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
          router.push("/diagnostic/results");
        }, 3000);
      } else {
        setIndex((i) => i + 1);
      }
    }, ADVANCE_MS);
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
