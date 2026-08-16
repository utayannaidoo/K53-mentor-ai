"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  Flame,
  Lock,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MasteryBar } from "@/components/ui/mastery-bar";
import { buttonVariants } from "@/components/ui/button";
import { ReadinessPlot } from "@/components/dashboard/readiness-plot";
import { Band, BandTitle, Figure, FigureRow, Sheet, SheetLabel } from "@/components/progress/progress-sheet";
import { AchievementGrid, NextAchievement } from "@/components/engagement/achievement-grid";
import { MasteryMap } from "@/components/engagement/mastery-map";
import { RankLedger } from "@/components/engagement/rank-ledger";
import { ShareCard } from "@/components/engagement/share-card";
import { StudyHeatmap } from "@/components/engagement/study-heatmap";
import { Reveal } from "@/components/shared/reveal";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  achievementInputs,
  achievementViews,
  nextUpAchievement,
} from "@/lib/achievements";
import { EXAM_FORMAT, SECTION_LABEL, type ExamSection } from "@/lib/constants";
import { activityByDay, buildHeatmap } from "@/lib/dashboard/day-strip";
import { blockingSection } from "@/lib/diagnostic/scoring";
import { LICENCE_RANK_INDEX, MASTERY_STAMP_AT } from "@/lib/engagement";
import { bestStudyTime, mostImproved } from "@/lib/insights";
import { categoryName } from "@/lib/content/categories";
import { categoryMastery } from "@/lib/dashboard/mastery";
import { mistakeStats } from "@/lib/learning/mistakes";
import { hasFeature, PLAN_MAP } from "@/lib/billing/plans";
import { formatDuration, formatDate, cn } from "@/lib/utils";

/**
 * Progress — five sheets, in a ledger's reading order.
 *
 * This page was nine identical glass cards: the same radius, padding, heading
 * size and depth tier from top to bottom, which is the composition `TodaySheet`
 * was built to escape. Nothing on it was more important than anything else, so
 * "Readiness" — the number that decides whether a learner books the test — sat
 * in the same 2×4 grid as "Longest streak", and "Predicted pass" sat six tiles
 * away from the figure it contradicts, with nothing between them to explain it.
 *
 * The order is the argument now: the verdict, the figures that qualify it, the
 * habit that produced it, what has been mastered, where that puts you, and the
 * record. Each section is one sheet whose divisions are hairline bands, and the
 * labels sit outside the sheets — a document with headings, not a grid of cards.
 */

/** Streak lengths that get a named state rather than a larger integer. */
const STREAK_MILESTONES = [
  { at: 100, label: "Century" },
  { at: 30, label: "A month unbroken" },
  { at: 7, label: "A full week" },
  { at: 3, label: "Getting going" },
] as const;

export default function ProgressPage() {
  const { state, readiness } = useStudyStore();

  const totalSeconds = state.sessions.reduce((s, x) => s + x.durationSeconds, 0);
  // Questions actually attempted. A timed mock records every slot at submit,
  // including the ones left blank (`selectedIndex` -1), and counting those here
  // both inflated "Questions" and halved the accuracy beside it — the same
  // blanks that were dragging the readiness model down. See accuracyForCategory.
  const attempted = React.useMemo(
    () => state.attempts.filter((a) => a.selectedIndex >= 0),
    [state.attempts],
  );
  const answered = attempted.length;
  const correct = attempted.filter((a) => a.correct).length;
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const advanced = hasFeature(state.tier, "advancedAnalytics");
  const hasAttempts = answered > 0;

  // Free plan sees the last week; the rest stays visible as a blurred teaser
  // rather than silently vanishing. One paywall treatment on the page, not three.
  const fullHistory = PLAN_MAP[state.tier].limits.progressHistory === "full";
  const HEAT_WEEKS = fullHistory ? 12 : 4;

  const cutoffKey = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);
  const visibleHistory = fullHistory
    ? state.readinessHistory
    : state.readinessHistory.filter((h) => h.date >= cutoffKey);
  const hiddenPoints = state.readinessHistory.length - visibleHistory.length;

  // Week-over-week movement — the figure a lifetime total cannot give you.
  const delta = React.useMemo(() => {
    const h = state.readinessHistory;
    if (h.length < 2) return null;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const key = weekAgo.toISOString().slice(0, 10);
    const before = [...h].reverse().find((p) => p.date <= key) ?? h[0];
    return readiness.readiness - before.readiness;
  }, [state.readinessHistory, readiness.readiness]);

  const heatDays = React.useMemo(
    () =>
      buildHeatmap({
        counts: activityByDay([state.sessions, attempted, state.scenarioAttempts]),
        weeks: HEAT_WEEKS,
      }),
    [state.sessions, attempted, state.scenarioAttempts, HEAT_WEEKS],
  );

  const mastery = React.useMemo(
    () => categoryMastery(readiness.perCategory),
    [readiness.perCategory],
  );
  const stamped = mastery.filter((m) => m.value >= MASTERY_STAMP_AT).length;
  const blocking = blockingSection(readiness.perCategory);
  const mistakes = React.useMemo(() => mistakeStats(state), [state]);

  const views = React.useMemo(
    () =>
      achievementViews(
        achievementInputs(state, readiness.perCategory, state.rankAchieved >= LICENCE_RANK_INDEX),
        state.achievements,
      ),
    [state, readiness.perCategory],
  );
  const nextUp = nextUpAchievement(views);
  const unlocked = views.filter((v) => v.earned).length;

  // Section competence, from the categories examined under each section. The
  // three-bar picture is the honest answer to "would I pass" — the exam is
  // three separate minimums, not one average.
  const sections = React.useMemo(() => {
    const out: { id: ExamSection; value: number; required: number }[] = [];
    for (const id of Object.keys(EXAM_FORMAT.sections) as ExamSection[]) {
      const rows = mastery.filter((m) => m.section === id);
      if (rows.length === 0) continue;
      const { questions, pass } = EXAM_FORMAT.sections[id];
      out.push({
        id,
        value: Math.round(rows.reduce((s, r) => s + r.value, 0) / rows.length),
        required: Math.round((pass / questions) * 100),
      });
    }
    return out;
  }, [mastery]);

  const streakMilestone = STREAK_MILESTONES.find((m) => state.streak.current >= m.at) ?? null;
  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaTone =
    delta && delta > 0 ? "text-success" : delta && delta < 0 ? "text-danger" : "text-muted-foreground";

  return (
    <div className="mx-auto max-w-5xl pb-6">
      <PageHeader title="Progress" description="Your readiness, mastery and study habits over time." />

      {/* ── 1. Where you stand ─────────────────────────────────────────────
          Deliberately NOT wrapped in `Reveal`. This sheet is above the fold on
          every device, so there is no scroll for a scroll-reveal to react to —
          it would be animation for its own sake, on the one section where
          starting at opacity 0 costs the most if the observer never fires. */}
      <div>
        <SheetLabel>Where you stand</SheetLabel>
        <Sheet float>
          <div className="grid gap-px bg-border/40 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
            <div className="flex flex-row items-end justify-between gap-6 bg-card/[0.01] px-5 py-6 sm:px-6 lg:flex-col lg:items-start lg:justify-start lg:gap-0">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Readiness
                </p>
                <p className="mt-1.5 font-mono text-6xl font-semibold leading-none tabular-nums">
                  {readiness.readiness}
                  <span className="align-top text-2xl text-muted-foreground">%</span>
                </p>
                <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-medium", deltaTone)}>
                  <DeltaIcon className="h-3.5 w-3.5" />
                  {delta === null
                    ? "First week"
                    : delta === 0
                      ? "Level with last week"
                      : `${delta > 0 ? "+" : ""}${delta} in 7 days`}
                </p>
              </div>
            </div>

            {/* The line it has traced. The plot prints no figure of its own —
                the number above is the same fact, four times the size. */}
            <div className="min-w-0 bg-card/[0.01] pb-2 pr-2 pt-4">
              <ReadinessPlot data={visibleHistory} current={readiness.readiness} />
            </div>
          </div>

          <FigureRow>
            <Figure label="Predicted pass" value={`${readiness.passProbability}%`} />
            <Figure label="Accuracy" value={hasAttempts ? `${accuracy}%` : "—"} />
            <Figure label="Questions" value={answered.toLocaleString()} />
            <Figure label="Time studied" value={formatDuration(totalSeconds)} />
          </FigureRow>

          {/* The one band that resolves the contradiction above it: readiness and
              predicted pass can look wildly apart, and the reason is always a
              single section sitting under its own mark. */}
          {hasAttempts && (
            <Band tone={blocking ? "warning" : "success"} className="flex flex-wrap items-center justify-between gap-3">
              <p className="min-w-0 text-sm leading-relaxed">
                {blocking ? (
                  <>
                    <span className="font-medium text-warning">{SECTION_LABEL[blocking]}</span> is
                    under its own mark — that is what holds your predicted pass down.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-success">Every section</span> is clearing its
                    own mark.
                  </>
                )}
              </p>
              <Link
                href={blocking ? `/study/mock-exam?mode=drill&section=${blocking}` : "/study/mock-exam"}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}
              >
                {blocking ? `Drill ${SECTION_LABEL[blocking].toLowerCase()}` : "Take a full mock"}
                <ArrowRight />
              </Link>
            </Band>
          )}

          <Band>
            <BandTitle
              aside={
                <span className="text-2xs text-muted-foreground">
                  Pass mark per section
                </span>
              }
            >
              The paper
            </BandTitle>
            <ul className="mt-3.5 space-y-3">
              {sections.map((s) => (
                <li key={s.id}>
                  <MasteryBar
                    label={SECTION_LABEL[s.id]}
                    value={hasAttempts ? s.value : 0}
                    threshold={s.required}
                    thresholdLabel={`Pass mark ${EXAM_FORMAT.sections[s.id].pass} of ${EXAM_FORMAT.sections[s.id].questions}`}
                    count={hasAttempts ? `${s.value}% / ${s.required}%` : `— / ${s.required}%`}
                  />
                </li>
              ))}
            </ul>
          </Band>
        </Sheet>
      </div>

      {/* ── 2. Your habit ──────────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-8">
          <SheetLabel
            aside={
              !fullHistory ? (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" /> 4 weeks on Free
                </Badge>
              ) : undefined
            }
          >
            Your habit
          </SheetLabel>
          <Sheet>
            <Band divided={false}>
              <StudyHeatmap days={heatDays} />
            </Band>

            <FigureRow className="sm:grid-cols-3">
              <Figure
                label="Current streak"
                value={state.streak.current}
                unit={state.streak.current === 1 ? "day" : "days"}
                tone={streakMilestone ? "text-accent" : undefined}
              />
              <Figure
                label="Longest"
                value={state.streak.longest}
                unit={state.streak.longest === 1 ? "day" : "days"}
              />
              <Figure label="Freezes left" value={state.streak.freezesRemaining} />
            </FigureRow>

            {streakMilestone && (
              <Band tone="primary" className="flex items-center gap-2.5">
                <Flame className="h-4 w-4 shrink-0 text-accent" />
                <p className="text-sm">
                  <span className="font-medium">{streakMilestone.label}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {state.streak.current} days without a gap.
                  </span>
                </p>
              </Band>
            )}

            <Band>
              <BandTitle
                aside={
                  !advanced ? (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" /> Premium Plus
                    </Badge>
                  ) : undefined
                }
              >
                Rhythm
              </BandTitle>
              {advanced ? (
                <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Insight
                    label="Sharpest time of day"
                    value={(() => {
                      const t = bestStudyTime(state.attempts);
                      return t ? `${t.label} · ${t.accuracy}%` : "Not enough data yet";
                    })()}
                  />
                  <Insight
                    label="Most improved"
                    value={(() => {
                      const m = mostImproved(state.attempts);
                      return m ? `${categoryName(m.categoryId)} +${m.delta}%` : "Not enough data yet";
                    })()}
                  />
                  <Insight
                    label="Average session"
                    value={
                      state.sessions.length
                        ? formatDuration(totalSeconds / state.sessions.length)
                        : "—"
                    }
                  />
                </dl>
              ) : (
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-md text-sm text-muted-foreground">
                    When you answer best, which category is climbing fastest, and how long you
                    actually sit down for.
                  </p>
                  <Link
                    href="/account/billing"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Upgrade
                  </Link>
                </div>
              )}
            </Band>
          </Sheet>
        </div>
      </Reveal>

      {/* ── 3. Mastery ─────────────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-8">
          <SheetLabel
            aside={
              <span className="font-mono text-2xs tabular-nums text-muted-foreground">
                {stamped}/{mastery.length} stamped
              </span>
            }
          >
            Mastery
          </SheetLabel>
          <Sheet>
            <Band divided={false}>
              <p className="mb-4 text-sm text-muted-foreground">
                Weakest first, so the map is also the list. The tick on each ring is the pass mark
                that category is judged against — {MASTERY_STAMP_AT}% stamps it for good.
              </p>
              <MasteryMap perCategory={readiness.perCategory} />
            </Band>

            {mistakes.everMissed > 0 && (
              <Band className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 text-sm">
                  <span className="font-medium">Mistake notebook</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {mistakes.open} open, {mistakes.retired} re-earned.
                  </span>
                </p>
                {/* Plain practice, not a mode: the practice queue already puts
                    open mistakes in front (see question-practice's buildQueue),
                    so a dedicated URL would promise a screen that isn't there. */}
                {mistakes.open > 0 && (
                  <Link
                    href="/study/questions"
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}
                  >
                    Practise them <ArrowRight />
                  </Link>
                )}
              </Band>
            )}
          </Sheet>
        </div>
      </Reveal>

      {/* ── 4. Standing ────────────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-8">
          <SheetLabel
            aside={
              <span className="font-mono text-2xs tabular-nums text-muted-foreground">
                {unlocked}/{views.length} unlocked
              </span>
            }
          >
            Standing
          </SheetLabel>
          <Sheet>
            <Band divided={false}>
              <BandTitle>The road to licence</BandTitle>
              <RankLedger
                className="mt-4"
                rankAchieved={state.rankAchieved}
                inputs={{
                  cp: state.cp,
                  readiness: readiness.readiness,
                  hasPassedMock: state.mockExams.some((m) => m.passed && !m.mini && !m.drill),
                }}
              />
            </Band>

            {nextUp && (
              <Band>
                <p className="mb-2.5 text-2xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Next up
                </p>
                <NextAchievement view={nextUp} />
              </Band>
            )}

            <Band>
              <BandTitle>Achievements</BandTitle>
              <AchievementGrid className="mt-4" views={views} />
            </Band>
          </Sheet>
        </div>
      </Reveal>

      {/* ── 5. The record ──────────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-8">
          <SheetLabel
            aside={
              <Link
                href="/study/mock-exam"
                className="text-2xs font-medium text-primary hover:underline"
              >
                Take a mock
              </Link>
            }
          >
            The record
          </SheetLabel>
          <Sheet>
            <Band divided={false}>
              <BandTitle>Mock exams</BandTitle>
              {state.mockExams.length === 0 ? (
                <div className="mt-3">
                  <EmptyState
                    icon={<FileText className="h-6 w-6" />}
                    title="No mock exams yet"
                    description="A full 64-question mock is the best test of real readiness — it mirrors the actual K53 paper."
                    action={
                      <Link href="/study/mock-exam" className={cn(buttonVariants())}>
                        Take your first mock
                      </Link>
                    }
                  />
                </div>
              ) : (
                <MockList mocks={state.mockExams} />
              )}
            </Band>

            {!fullHistory && hiddenPoints > 0 && (
              <Band className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 text-sm text-muted-foreground">
                  {hiddenPoints} earlier {hiddenPoints === 1 ? "day" : "days"} of history is kept,
                  but not shown on Free.
                </p>
                <Link
                  href="/account/billing"
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}
                >
                  <Lock className="h-3 w-3" /> See it all
                </Link>
              </Band>
            )}

            <Band>
              <BandTitle>Share it</BandTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Send your card to the group chat — a study buddy makes the streak easier to keep.
              </p>
              <div className="mt-4 max-w-xl">
                <ShareCard />
              </div>
            </Band>
          </Sheet>
        </div>
      </Reveal>
    </div>
  );
}

/** Newest first, capped — the list used to grow without bound. */
const MOCKS_SHOWN = 8;

function MockList({ mocks }: { mocks: { id: string; score: number; total: number; passed: boolean; at: string; mini?: boolean; drill?: string }[] }) {
  const [expanded, setExpanded] = React.useState(false);
  const ordered = React.useMemo(() => [...mocks].reverse(), [mocks]);
  const shown = expanded ? ordered : ordered.slice(0, MOCKS_SHOWN);

  return (
    <>
      <ul className="mt-3 divide-y divide-border/50">
        {shown.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-medium tabular-nums">
                  {m.score}/{m.total}
                  {m.mini && (
                    <span className="ml-1.5 text-2xs font-normal text-muted-foreground">Mini</span>
                  )}
                  {m.drill && (
                    <span className="ml-1.5 text-2xs font-normal capitalize text-muted-foreground">
                      {m.drill} drill
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(m.at)}</p>
              </div>
            </div>
            <Badge variant={m.passed ? "success" : "warning"}>
              {m.passed ? "Passed" : "Not yet"}
            </Badge>
          </li>
        ))}
      </ul>
      {ordered.length > MOCKS_SHOWN && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="press mt-3 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
        >
          {expanded ? "Show fewer" : `Show all ${ordered.length}`}
        </button>
      )}
    </>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-2xs uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
