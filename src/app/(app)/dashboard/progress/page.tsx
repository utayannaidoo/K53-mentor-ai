"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
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
import { Band, BandTitle, Figure, FigureRow, SheetBlock } from "@/components/progress/progress-sheet";
import { AchievementGrid, NextAchievement } from "@/components/engagement/achievement-grid";
import { MasteryMap } from "@/components/engagement/mastery-map";
import { RankLedger } from "@/components/engagement/rank-ledger";
import { ShareCard } from "@/components/engagement/share-card";
import { StudyHeatmap } from "@/components/engagement/study-heatmap";
import { useStudyStore } from "@/hooks/use-study-store";
import {
  achievementInputs,
  achievementViews,
  nextUpAchievement,
} from "@/lib/achievements";
import { EXAM_FORMAT, SECTION_LABEL, type ExamSection } from "@/lib/constants";
import { activityByDay, buildHeatmap } from "@/lib/dashboard/day-strip";
import { blockingSection, sectionCompetence } from "@/lib/diagnostic/scoring";
import { passChanceStory } from "@/lib/diagnostic/pass-chance";
import { LICENCE_RANK_INDEX, MASTERY_STAMP_AT } from "@/lib/engagement";
import { bestStudyTime, mostImproved } from "@/lib/insights";
import { categoryName } from "@/lib/content/categories";
import { categoryMastery } from "@/lib/dashboard/mastery";
import { mistakeStats } from "@/lib/learning/mistakes";
import { hasFeature, PLAN_MAP } from "@/lib/billing/plans";
import { formatDuration, formatDate, cn } from "@/lib/utils";
import { todayKey } from "@/lib/store/local-store";
import { ProgressNavigator } from "@/components/onboarding/route-navigator";

/**
 * Progress — five sheets, each one bordered object with hairline bands inside
 * and its label outside. A document with headings, not a grid of cards.
 *
 * This page was nine identical glass cards: the same radius, padding, heading
 * size and depth tier from top to bottom, which is the composition `TodaySheet`
 * was built to escape. Nothing on it was more important than anything else, so
 * "Readiness" — the number that helps a learner track preparation — sat in the
 * same 2×4 grid as "Longest streak", with nothing nearby to explain what action
 * the category evidence supported.
 *
 * The running order is data, not layout (see `order` below), because which sheet
 * should lead depends on whether the learner has done anything yet.
 */

/** Streak lengths that get a named state rather than a larger integer. */
const STREAK_MILESTONES = [
  { at: 100, label: "Century" },
  { at: 30, label: "A month unbroken" },
  { at: 7, label: "A full week" },
  { at: 3, label: "Getting going" },
] as const;

export default function ProgressPage() {
  const { state, readiness, hasDiagnostic } = useStudyStore();

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
  // Readiness and pass probability rely on a full, cross-category starting
  // assessment. The scoring model still carries an internal prior before the
  // diagnostic, but that prior is not user progress and must never be printed.
  const hasAssessment = hasDiagnostic;

  // Free plan sees the last week; the rest stays visible as a blurred teaser
  // rather than silently vanishing. One paywall treatment on the page, not three.
  const fullHistory = PLAN_MAP[state.tier].limits.progressHistory === "full";
  const HEAT_WEEKS = fullHistory ? 12 : 4;

  const cutoffKey = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    // History dates are local keys; a UTC slice here shifts the free-tier
    // window two hours across midnight in SA.
    return todayKey(d);
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
    const key = todayKey(weekAgo);
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
  const blocking = hasAssessment ? blockingSection(readiness.perCategory) : null;
  const passChance = hasAssessment
    ? passChanceStory(readiness.passProbability, readiness.perCategory)
    : null;
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
  // three separate minimums, not one average. Values come from the same
  // weighted sectionCompetence the pass-probability model uses: an unweighted
  // category average here could read "71% — below the mark" beside a verdict
  // computed from a weighted 74%, and one of them would be a lie.
  const sections = React.useMemo(() => {
    const out: { id: ExamSection; value: number; required: number }[] = [];
    for (const id of Object.keys(EXAM_FORMAT.sections) as ExamSection[]) {
      const rows = mastery.filter((m) => m.section === id);
      if (rows.length === 0) continue;
      const { questions, pass } = EXAM_FORMAT.sections[id];
      out.push({
        id,
        value: Math.round(sectionCompetence(readiness.perCategory, id)),
        required: Math.round((pass / questions) * 100),
      });
    }
    return out;
  }, [mastery, readiness.perCategory]);

  /**
   * The verdict, in words.
   *
   * This sheet used to open the page the way Today does — the readiness figure
   * at `text-6xl` with the plot beside it — which meant the two pages a learner
   * moves between showed the same number, the same delta and the same chart.
   * Today's job is the balance; this page's job is what the balance *means*, so
   * the sentence is the headline and the figures qualify it underneath.
   */
  const verdict = React.useMemo(() => {
    if (!hasAssessment) {
      return {
        tone: "text-foreground",
        lead: "No verdict yet.",
        rest: "",
        support:
          "Complete the 15-question starting check and this page will show your real baseline — never a placeholder score.",
        cta: { href: "/diagnostic", label: "Take the starting check" },
      };
    }
    if (blocking) {
      const othersClear = sections.every((s) => s.id === blocking || s.value >= s.required);
      // Framed as the next thing to lift, not a sentence passed on the learner.
      return {
        tone: "text-primary",
        lead: SECTION_LABEL[blocking],
        rest: " is the one to lift next.",
        support: [
          othersClear
            ? "Every other section is clearing its own mark — this is the only thing in the way."
            : "The test is three separate minimums, not one average — and this section sits furthest below its own.",
          passChance?.liftLine,
        ]
          .filter(Boolean)
          .join(" "),
        cta: {
          href: `/study/mock-exam?mode=drill&section=${blocking}`,
          label: `Drill ${SECTION_LABEL[blocking].toLowerCase()}`,
        },
      };
    }
    return {
      tone: "text-success",
      lead: "Every section is above",
      rest: " its required mark.",
      support:
        "Confirm that category evidence under timed conditions before deciding you are ready for the real test.",
      cta: { href: "/study/mock-exam", label: "Confirm it on a full mock" },
    };
  }, [hasAssessment, blocking, sections, passChance]);

  const streakMilestone = STREAK_MILESTONES.find((m) => state.streak.current >= m.at) ?? null;
  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaTone =
    delta && delta > 0 ? "text-success" : delta && delta < 0 ? "text-danger" : "text-muted-foreground";

  /**
   * The running order.
   *
   * Standing leads once there is anything to stand on: assessment is the reason
   * to open this page and a discouraging thing to land on, so a learner who is
   * behind meets their rank and their streak before a sentence telling them they
   * would fail.
   *
   * On an empty account that argument inverts. There is no rank, no streak and
   * no badge yet, so leading with Standing is "Garage · 0/13 unlocked" — a wall
   * of locks and an empty ledger. The verdict's empty state is the one band on
   * the page with something to say to someone who has not started: it asks them
   * to, and carries the only call to action that makes sense at zero.
   */
  const order = hasAttempts
    ? (["standing", "habit", "verdict", "mastery", "record"] as const)
    : (["verdict", "standing", "habit", "mastery", "record"] as const);

  const sheets = {
    standing: {
      label: "Standing",
      aside: (
        <span className="font-mono text-2xs tabular-nums text-muted-foreground">
          {unlocked}/{views.length} unlocked
        </span>
      ),
      body: (
        <>
          <Band divided={false}>
            <BandTitle>The road to licence</BandTitle>
            <RankLedger
              className="mt-4"
              rankAchieved={state.rankAchieved}
              readinessMeasured={hasAssessment}
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
        </>
      ),
    },

    habit: {
      label: "Your habit",
      aside: !fullHistory ? (
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" /> 4 weeks on Free
        </Badge>
      ) : undefined,
      body: (
        <>
          <Band divided={false}>
            <BandTitle>Days studied</BandTitle>
            <StudyHeatmap className="mt-4" days={heatDays} />
          </Band>

          <FigureRow>
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
            <Figure label="Time studied" value={formatDuration(totalSeconds)} />
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
                  href="/account/billing?buy=premium_plus"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Upgrade
                </Link>
              </div>
            )}
          </Band>
        </>
      ),
    },

    /* Labelled "The verdict" rather than "Where you stand", which is what it
       answers but no longer what it can be called: "Standing" leads the page for
       anyone with attempts, and two headings a reader has to hold apart is one
       too many. */
    verdict: {
      label: "The verdict",
      aside: undefined,
      body: (
        <>
          <Band divided={false} className="py-6 sm:py-7">
            <p className="font-display text-2xl font-semibold leading-[1.18] tracking-tight text-balance sm:text-3xl">
              <span className={verdict.tone}>{verdict.lead}</span>
              {verdict.rest}
            </p>
            <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-muted-foreground">
              {verdict.support}
            </p>
            <Link href={verdict.cta.href} className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
              {verdict.cta.label} <ArrowRight />
            </Link>
          </Band>

          {/* The figures that qualify it. Readiness is one of four here rather
              than the headline: it already leads the dashboard and rides in the
              app-shell header, and on this page the sentence outranks it. */}
          <FigureRow>
            <Figure label="Readiness" value={hasAssessment ? `${readiness.readiness}%` : "—"} />
            <Figure
              label="Pass chance"
              value={passChance ? passChance.display : "—"}
              tone={passChance?.tone}
            />
            <Figure label="Accuracy" value={hasAttempts ? `${accuracy}%` : "—"} />
            <Figure label="Questions" value={answered.toLocaleString()} />
          </FigureRow>

          <Band className="pb-0">
            <BandTitle
              aside={
                hasAssessment ? (
                  <span className={cn("flex items-center gap-1.5 text-xs font-medium", deltaTone)}>
                    <DeltaIcon className="h-3.5 w-3.5" />
                    {delta === null
                      ? "First week"
                      : delta === 0
                        ? "Level with last week"
                        : `${delta > 0 ? "+" : ""}${delta} in 7 days`}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Awaiting starting check</span>
                )
              }
            >
              How it has moved
            </BandTitle>
          </Band>
          <div className="min-w-0 pb-1 pr-2">
            <ReadinessPlot
              data={hasAssessment ? visibleHistory : []}
              current={readiness.readiness}
              unmeasured={!hasAssessment}
            />
          </div>

          <Band>
            <BandTitle
              aside={<span className="text-2xs text-muted-foreground">Pass mark per section</span>}
            >
              The paper
            </BandTitle>
            <ul className="mt-3.5 space-y-3">
              {sections.map((s) => (
                <li key={s.id}>
                  <MasteryBar
                    label={SECTION_LABEL[s.id]}
                    value={hasAssessment ? s.value : 0}
                    threshold={s.required}
                    thresholdLabel={`Pass mark ${EXAM_FORMAT.sections[s.id].pass} of ${EXAM_FORMAT.sections[s.id].questions}`}
                    count={hasAssessment ? `${s.value}% / ${s.required}%` : `— / ${s.required}%`}
                  />
                </li>
              ))}
            </ul>
          </Band>
        </>
      ),
    },

    mastery: {
      label: "Mastery",
      aside: (
        <span className="font-mono text-2xs tabular-nums text-muted-foreground">
          {stamped}/{mastery.length} stamped
        </span>
      ),
      body: (
        <>
          <Band divided={false}>
            <p className="mb-4 text-sm text-muted-foreground">
              {hasAssessment
                ? "Weakest first, so the map is also the list. "
                : "Each category stays unscored until it has real evidence. "}
              The tick on each ring is the pass mark that category is judged against —{" "}
              {MASTERY_STAMP_AT}% stamps it for good.
            </p>
            <MasteryMap
              perCategory={readiness.perCategory}
              evidence={readiness.perCategoryEvidence}
            />
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
        </>
      ),
    },

    record: {
      label: "The record",
      // -my/py cancel, so the row keeps its height and the label its baseline;
      // only the thumb target grows (16px tall was not one).
      aside: (
        <Link
          href="/study/mock-exam"
          className="-my-2.5 inline-block py-2.5 text-2xs font-medium text-primary hover:underline"
        >
          Take a mock
        </Link>
      ),
      body: (
        <>
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
                {hiddenPoints} earlier {hiddenPoints === 1 ? "day" : "days"} of history is kept, but
                not shown on Free.
              </p>
              <Link
                href="/account/billing?buy=premium"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}
              >
                <Lock className="h-3 w-3" /> See it all
              </Link>
            </Band>
          )}

          <Band>
            <BandTitle>Share it</BandTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Your Driving Passport — the verdict, the work behind it, and where you stand in every
              category. Send it to the group chat; a study buddy makes the streak easier to keep.
            </p>
            {hasAssessment ? (
              <div className="mt-4 max-w-xl">
                <ShareCard />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Your shareable Driving Passport appears after the starting check, once it has real
                readiness and category scores to show.
              </p>
            )}
          </Band>
        </>
      ),
    },
  };

  return (
    <div className="mx-auto max-w-5xl pb-6">
      <PageHeader title="Progress" description="Your readiness, mastery and study habits over time." />
      {order.map((key, i) => (
        <SheetBlock
          key={key}
          first={i === 0}
          label={sheets[key].label}
          aside={sheets[key].aside}
          tutorial={`progress-${key}`}
        >
          {sheets[key].body}
        </SheetBlock>
      ))}
      <ProgressNavigator />
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
