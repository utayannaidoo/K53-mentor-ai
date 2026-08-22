"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Car,
  Layers,
  CalendarClock,
  Sparkles,
  Gauge,
  Bike,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { OptionCard } from "@/components/onboarding/option-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { SIZE_BY_FREQUENCY } from "@/lib/plan";
import { CATEGORIES } from "@/lib/content/categories";
import { cn, daysUntil, isPastDate, localIsoDate } from "@/lib/utils";
import type {
  CategoryId,
  ConfidenceLevel,
  KnowledgeLevel,
  LicenceGoal,
  StudyFrequency,
  VehicleCode,
} from "@/types";

const TOTAL_STEPS = 7; // excluding the welcome screen

/**
 * The wizard's answers survive a reload. Phone calls, app switches, low-memory
 * tab eviction and accidental pull-to-refresh are all routine on the devices
 * this is built for, and losing seven screens of answers to any of them is the
 * most expensive thing that can happen at the top of the funnel.
 */
const DRAFT_KEY = "k53mentor.onboarding.draft.v1";

interface WizardDraft {
  step: number;
  goal: LicenceGoal | null;
  vehicleCode: VehicleCode | null;
  testDate: string;
  noDate: boolean;
  driversTestDate: string;
  noDriversDate: boolean;
  priorAttempts: number;
  confidence: ConfidenceLevel | null;
  worryCategories: CategoryId[];
  knowledge: KnowledgeLevel | null;
  frequency: StudyFrequency | null;
}

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  1: "Totally lost",
  2: "Shaky",
  3: "Getting there",
  4: "Fairly good",
  5: "Pretty confident",
};

// Whitelists for draft restore. The draft comes from localStorage, which the
// user (or a corrupt write) controls — restoring it blindly once let a tampered
// `vehicleCode: "99"` flow through the wizard into labels and content gates.
// Truthiness checks alone can't catch that; enum membership can.
const GOALS: readonly LicenceGoal[] = ["learners", "drivers", "both"];
const VEHICLE_CODES: readonly VehicleCode[] = ["8", "10", "14", "A1", "A"];
const KNOWLEDGE_LEVELS: readonly KnowledgeLevel[] = ["beginner", "some", "confident"];
const FREQUENCIES: readonly StudyFrequency[] = ["casual", "steady", "intense"];

const CODE_LABEL: Record<VehicleCode, string> = {
  "8": "Car (Code 08)",
  A: "Motorcycle (Code A)",
  A1: "Motorcycle (Code A1)",
  "10": "Heavy (Code 10)",
  "14": "Heavy (Code 14)",
};

function weeksAway(dateStr: string): number | null {
  const days = daysUntil(dateStr);
  if (days === null || days < 0) return null;
  return Math.max(1, Math.round(days / 7));
}

export function OnboardingWizard() {
  const router = useRouter();
  const { completeOnboarding, state, isAuthed } = useStudyStore();

  const firstName = state.profile?.name?.split(" ")[0] ?? null;

  const [step, setStep] = React.useState(0);
  const [goal, setGoal] = React.useState<LicenceGoal | null>(null);
  const [vehicleCode, setVehicleCode] = React.useState<VehicleCode | null>(null);
  const [testDate, setTestDate] = React.useState<string>("");
  const [noDate, setNoDate] = React.useState(false);
  const [driversTestDate, setDriversTestDate] = React.useState<string>("");
  const [noDriversDate, setNoDriversDate] = React.useState(false);
  const [priorAttempts, setPriorAttempts] = React.useState<number>(0);
  const [confidence, setConfidence] = React.useState<ConfidenceLevel | null>(null);
  const [worryCategories, setWorryCategories] = React.useState<CategoryId[]>([]);
  const [knowledge, setKnowledge] = React.useState<KnowledgeLevel | null>(null);
  const [frequency, setFrequency] = React.useState<StudyFrequency | null>(null);

  const todayIso = React.useMemo(() => localIsoDate(), []);
  const testDateInPast = isPastDate(testDate || null);
  const driversDateInPast = isPastDate(driversTestDate || null);

  // Restore after mount, not via lazy initial state: these pages are statically
  // prerendered, so reading storage during render would desync hydration.
  const restored = React.useRef(false);
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Partial<WizardDraft>;
        if (typeof d.step === "number") setStep(Math.min(Math.max(d.step, 0), TOTAL_STEPS));
        if (d.goal && GOALS.includes(d.goal)) setGoal(d.goal);
        if (d.vehicleCode && VEHICLE_CODES.includes(d.vehicleCode)) setVehicleCode(d.vehicleCode);
        if (typeof d.testDate === "string") setTestDate(d.testDate);
        if (typeof d.noDate === "boolean") setNoDate(d.noDate);
        if (typeof d.driversTestDate === "string") setDriversTestDate(d.driversTestDate);
        if (typeof d.noDriversDate === "boolean") setNoDriversDate(d.noDriversDate);
        if (typeof d.priorAttempts === "number") setPriorAttempts(d.priorAttempts);
        // Confidence is 1–5 by construction of the number check below — but a
        // tampered 7 would render an empty scale, so bound it too.
        if (
          typeof d.confidence === "number" &&
          d.confidence >= 1 &&
          d.confidence <= 5 &&
          Number.isInteger(d.confidence)
        ) {
          setConfidence(d.confidence as ConfidenceLevel);
        }
        if (Array.isArray(d.worryCategories)) {
          setWorryCategories(
            d.worryCategories.filter((c): c is CategoryId =>
              CATEGORIES.some((cat) => cat.id === c),
            ),
          );
        }
        if (d.knowledge && KNOWLEDGE_LEVELS.includes(d.knowledge)) setKnowledge(d.knowledge);
        if (d.frequency && FREQUENCIES.includes(d.frequency)) setFrequency(d.frequency);
      }
    } catch {
      // Corrupt or unavailable storage (private mode, quota) just means a fresh start.
    }
    restored.current = true;
  }, []);

  React.useEffect(() => {
    if (!restored.current) return; // never overwrite the draft with the initial blanks
    const draft: WizardDraft = {
      step,
      goal,
      vehicleCode,
      testDate,
      noDate,
      driversTestDate,
      noDriversDate,
      priorAttempts,
      confidence,
      worryCategories,
      knowledge,
      frequency,
    };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage full or blocked — the wizard still works, it just won't resume.
    }
  }, [
    step,
    goal,
    vehicleCode,
    testDate,
    noDate,
    driversTestDate,
    noDriversDate,
    priorAttempts,
    confidence,
    worryCategories,
    knowledge,
    frequency,
  ]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  function toggleWorry(id: CategoryId) {
    setWorryCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  // Auto-advance steps fire on a 240ms delay so the selection is visible before
  // the screen changes. Without this latch a double-tap — routine on a slow
  // phone — queues two advances and silently skips the next question, which for
  // the licence-code step means studying the wrong vehicle's content entirely.
  const advancing = React.useRef(false);
  React.useEffect(() => {
    advancing.current = false;
  }, [step]);

  /** Set a value then auto-advance for single-tap steps. */
  function pick<T>(setter: (v: T) => void, value: T) {
    if (advancing.current) return;
    advancing.current = true;
    setter(value);
    window.setTimeout(next, 240);
  }

  function finish() {
    // Whatever they picked here is the code, full stop — no plan may override
    // it, and it is what every study surface reads from this point on.
    const code: VehicleCode = vehicleCode ?? "8";
    completeOnboarding({
      goal: goal ?? "learners",
      vehicleCode: code,
      // A resumed draft can carry a date that was upcoming when it was saved and
      // isn't any more — step 3 blocks a past date, but a draft restored past it
      // is never re-validated. Better no date than a countdown that lies.
      testDate: noDate || testDateInPast ? null : testDate || null,
      driversTestDate:
        goal === "both" ? (noDriversDate || driversDateInPast ? null : driversTestDate || null) : null,
      confidence: confidence ?? 3,
      worryCategories,
      knowledgeLevel: knowledge ?? "some",
      studyFrequency: frequency ?? "steady",
      priorAttempts,
    });
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
    router.push("/diagnostic");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-app">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
        {/* Only a signed-out visitor can meaningfully log in here. For a
            signed-in user the link was a silent trap: /login bounces straight
            back to the app router, so tapping it looked like the wizard ate
            their progress. */}
        {!isAuthed && (
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
        )}
      </header>

      {step > 0 && (
        <div className="mx-auto w-full max-w-lg px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={back}
              className="-m-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {step}/{TOTAL_STEPS}
            </span>
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 py-8">
        <div key={step} className="w-full max-w-lg animate-fade-in">
          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
                Meet your AI driving coach
              </h1>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                K53 Mentor AI figures out exactly what you need to study — in the next 5 minutes.
                First, a few quick questions so your plan fits you.
              </p>
              <Button size="xl" className="mt-8 w-full sm:w-auto" onClick={next}>
                Get started <ArrowRight />
              </Button>
            </div>
          )}

          {/* Step 1 — Goal */}
          {step === 1 && (
            <Step title="What are you working toward?" subtitle="We'll tailor your plan to the right test.">
              <div className="space-y-3">
                <OptionCard selected={goal === "learners"} onClick={() => pick(setGoal, "learners")} icon={<GraduationCap className="h-5 w-5" />} title="Learner's licence" description="Rules of the road, signs and vehicle controls" />
                <OptionCard selected={goal === "drivers"} onClick={() => pick(setGoal, "drivers")} icon={<Car className="h-5 w-5" />} title="Driver's licence" description="Parking, manoeuvres and the yard test" />
                <OptionCard selected={goal === "both"} onClick={() => pick(setGoal, "both")} icon={<Layers className="h-5 w-5" />} title="Both" description="The full journey, learner's to licensed" />
              </div>
            </Step>
          )}

          {/* Step 2 — Vehicle code */}
          {step === 2 && (
            <Step
              title="Which licence are you after?"
              subtitle="This decides which controls, signs and content you'll get — and you can change it any time in your account."
            >
              <div className="space-y-3">
                <OptionCard selected={vehicleCode === "8"} onClick={() => pick(setVehicleCode, "8")} icon={<Car className="h-5 w-5" />} title="Car · Code 08 (B)" description="Cars and light vehicles up to 3 500 kg" />
                <OptionCard selected={vehicleCode === "A"} onClick={() => pick(setVehicleCode, "A")} icon={<Bike className="h-5 w-5" />} title="Motorcycle · Code A / A1" description="Any motorcycle — light (≤125 cc) or larger" />
                <OptionCard selected={vehicleCode === "14"} onClick={() => pick(setVehicleCode, "14")} icon={<Gauge className="h-5 w-5" />} title="Heavy · Code 10 / 14" description="Rigid and articulated heavy vehicles over 3 500 kg" />
              </div>
            </Step>
          )}

          {/* Step 3 — Test date(s) */}
          {step === 3 && (
            <Step
              title={goal === "both" ? "When are your tests?" : "When's your test?"}
              subtitle={`${vehicleCode ? `${CODE_LABEL[vehicleCode]} it is. ` : ""}We'll build your plan backward from this date — even a rough guess helps.`}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="learners-test-date"
                    className={cn(
                      "mb-1.5 block text-sm font-medium text-foreground",
                      goal !== "both" && "sr-only",
                    )}
                  >
                    Learner&apos;s test date
                  </label>
                  <Input
                    id="learners-test-date"
                    type="date"
                    value={testDate}
                    min={todayIso}
                    aria-invalid={testDateInPast || undefined}
                    aria-describedby={testDateInPast ? "learners-test-date-error" : undefined}
                    onChange={(e) => {
                      setTestDate(e.target.value);
                      setNoDate(false);
                    }}
                    className="h-12 text-base"
                  />
                  {testDateInPast && (
                    <p id="learners-test-date-error" role="alert" className="mt-1.5 text-sm text-danger">
                      That date has already passed — pick your upcoming test date, or tap
                      &ldquo;I haven&apos;t booked yet&rdquo;.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setNoDate(true);
                      setTestDate("");
                    }}
                    className={cn(
                      "mt-2 w-full rounded-lg border-2 py-3 text-sm font-medium transition-colors",
                      noDate ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    I haven&apos;t booked yet
                  </button>
                </div>

                {goal === "both" && (
                  <div>
                    <label
                      htmlFor="drivers-test-date"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Driver&apos;s test date
                    </label>
                    <Input
                      id="drivers-test-date"
                      type="date"
                      value={driversTestDate}
                      min={todayIso}
                      aria-invalid={driversDateInPast || undefined}
                      aria-describedby={driversDateInPast ? "drivers-test-date-error" : undefined}
                      onChange={(e) => {
                        setDriversTestDate(e.target.value);
                        setNoDriversDate(false);
                      }}
                      className="h-12 text-base"
                    />
                    {driversDateInPast && (
                      <p id="drivers-test-date-error" role="alert" className="mt-1.5 text-sm text-danger">
                        That date has already passed — pick your upcoming test date, or tap
                        &ldquo;I haven&apos;t booked yet&rdquo;.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setNoDriversDate(true);
                        setDriversTestDate("");
                      }}
                      className={cn(
                        "mt-2 w-full rounded-lg border-2 py-3 text-sm font-medium transition-colors",
                        noDriversDate ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      I haven&apos;t booked yet
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <p className="mb-2 text-sm font-medium text-foreground">Have you taken this test before?</p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3].map((n) => (
                      <Chip key={n} active={priorAttempts === n} onClick={() => setPriorAttempts(n)}>
                        {n === 0 ? "First time" : n === 3 ? "3+ times" : `${n} time${n > 1 ? "s" : ""}`}
                      </Chip>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={
                    (!testDate && !noDate) ||
                    testDateInPast ||
                    (goal === "both" && ((!driversTestDate && !noDriversDate) || driversDateInPast))
                  }
                  onClick={next}
                >
                  Continue <ArrowRight />
                </Button>
              </div>
            </Step>
          )}

          {/* Step 4 — Confidence */}
          {step === 4 && (
            <Step title="Right now, how ready do you feel?" subtitle="Be honest — this just helps us calibrate, not judge.">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-end justify-between gap-2">
                  {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((n) => (
                    <button
                      key={n}
                      onClick={() => pick<ConfidenceLevel>(setConfidence, n)}
                      className={cn(
                        "flex h-14 flex-1 items-center justify-center rounded-lg border-2 font-mono text-lg font-semibold transition-all",
                        confidence === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{CONFIDENCE_LABELS[1]}</span>
                  <span>{CONFIDENCE_LABELS[5]}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={next}
                className="mx-auto mt-4 block text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Skip — not sure yet
              </button>
            </Step>
          )}

          {/* Step 5 — Worry categories */}
          {step === 5 && (
            <Step
              title="What worries you most?"
              subtitle={(() => {
                const wks = testDate ? weeksAway(testDate) : null;
                return wks !== null
                  ? `Your test is in ${wks} ${wks === 1 ? "week" : "weeks"} — let's spend them on what actually worries you. Your diagnostic will lean into these.`
                  : "Pick as many as apply — your diagnostic will lean into these.";
              })()}
            >
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c.id}
                    active={worryCategories.includes(c.id)}
                    onClick={() => toggleWorry(c.id)}
                  >
                    <CategoryIcon id={c.id} className="h-3.5 w-3.5" />
                    {c.name}
                  </Chip>
                ))}
              </div>
              <Button size="lg" className="mt-6 w-full" onClick={next}>
                Continue <ArrowRight />
              </Button>
            </Step>
          )}

          {/* Step 6 — Habits */}
          {step === 6 && (
            <Step
              title="How will you study?"
              subtitle={
                confidence
                  ? `You said you're feeling "${CONFIDENCE_LABELS[confidence].toLowerCase()}" — we'll size your daily plan to match.`
                  : "We'll size your daily plan to match."
              }
            >
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Your starting knowledge</p>
                  {/* Full-width rows below `sm`: three across left each tile
                      ~72px at 320px, wrapping every label and leaving the row
                      looking broken rather than merely compact. */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(
                      [
                        ["beginner", "Beginner"],
                        ["some", "Some basics"],
                        ["confident", "Confident"],
                      ] as [KnowledgeLevel, string][]
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        onClick={() => setKnowledge(k)}
                        className={cn(
                          "min-h-12 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors",
                          knowledge === k ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">How often will you practise?</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(
                      [
                        ["casual", "A few times a week"],
                        ["steady", "Daily, 10 min"],
                        ["intense", "Daily, 30 min+"],
                      ] as [StudyFrequency, string][]
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        onClick={() => setFrequency(k)}
                        className={cn(
                          "min-h-12 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors",
                          frequency === k ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button size="lg" className="w-full" disabled={!knowledge || !frequency} onClick={next}>
                  Continue <ArrowRight />
                </Button>
                <button
                  type="button"
                  onClick={next}
                  className="mx-auto block text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Skip — use defaults
                </button>
              </div>
            </Step>
          )}

          {/* Step 7 — Personalised summary: proof the answers mattered. */}
          {step === 7 && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarClock className="h-8 w-8" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
                {firstName ? `${firstName}, your plan is ready` : "Your plan is ready"}
              </h1>

              <div className="mx-auto mt-6 max-w-md space-y-3 rounded-xl border border-border bg-card p-5 text-left">
                <SummaryRow
                  label="Studying for"
                  value={CODE_LABEL[vehicleCode ?? "8"]}
                />
                <SummaryRow
                  label="Test date"
                  value={(() => {
                    if (!testDate) return "Not booked yet — we'll pace you steadily";
                    const wks = weeksAway(testDate);
                    return wks !== null
                      ? `In ${wks} ${wks === 1 ? "week" : "weeks"} — your plan counts down to it`
                      : "Booked";
                  })()}
                />
                <SummaryRow
                  label="Daily session"
                  value={(() => {
                    const s = SIZE_BY_FREQUENCY[frequency ?? "steady"];
                    return `~${frequency === "intense" ? 20 : frequency === "casual" ? 7 : 10} min · up to ${s.flashMax} flashcards + ${s.questions} questions`;
                  })()}
                />
                {worryCategories.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Your diagnostic leans into
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {worryCategories.map((id) => {
                        const c = CATEGORIES.find((x) => x.id === id);
                        return c ? (
                          <span
                            key={id}
                            className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                          >
                            <CategoryIcon id={id} className="h-3 w-3" /> {c.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                First, a quick 15-question check across all 7 categories — no pressure, no fail —
                so your plan targets your real gaps, not guesses.
              </p>
              <Button size="xl" className="mt-6 w-full sm:w-auto" onClick={finish}>
                Start my diagnostic <ArrowRight />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-balance font-display text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
