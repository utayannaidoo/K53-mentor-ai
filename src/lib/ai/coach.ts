/**
 * Coach copy — shared shapes + deterministic local fallbacks.
 *
 * The /api/coach route asks the LLM (fast tier) for a plan rationale or a
 * session recap; these templates are what the app shows when no provider is
 * configured (demo mode) or a call fails, so the coach voice never goes silent.
 * Imported by both the route (server) and the study UI (client) — keep it
 * dependency-free.
 */

export interface PlanRationaleData {
  firstName?: string;
  /** Display name of the weakest category, e.g. "Road signs". */
  weakestCategory?: string;
  /** That category's current competence, 0–100. */
  weakestPct?: number;
  /** Whether the weak spot is self-reported (onboarding) rather than measured. */
  fromWorry?: boolean;
  dueCards?: number;
  daysToTest?: number | null;
  streak?: number;
}

export type RecapMode = "flashcards" | "questions" | "scenarios" | "mock";

export interface SessionRecapData {
  mode: RecapMode;
  correct?: number;
  total?: number;
  seconds?: number;
  /** Display names of the categories missed most this session, worst first. */
  weakCategories?: string[];
  /** Flashcards only: how many were rated "Again". */
  againCount?: number;
  /** Mock exam only. */
  passed?: boolean;
  failedSections?: string[];
  passProbabilityBefore?: number;
  passProbabilityAfter?: number;
  /** Cards that come due by end of tomorrow — the reason to come back. */
  dueTomorrow?: number;
}

export function localPlanRationale(d: PlanRationaleData): string {
  const due = d.dueCards ?? 0;
  const dueBit = due > 0 ? `, plus ${due} review${due === 1 ? "" : "s"} due to keep the rest fresh` : "";
  const urgency =
    d.daysToTest != null && d.daysToTest > 0 && d.daysToTest <= 21
      ? ` — ${d.daysToTest} day${d.daysToTest === 1 ? "" : "s"} to test day`
      : "";

  if (d.weakestCategory && d.fromWorry) {
    return `You told us ${d.weakestCategory} worries you most, so today starts there${dueBit}${urgency}.`;
  }
  if (d.weakestCategory && d.weakestPct != null) {
    return `${d.weakestCategory} is sitting at ${d.weakestPct}%, so today starts there${dueBit}${urgency}.`;
  }
  if (due > 0) {
    return `${due} review${due === 1 ? "" : "s"} came due — clearing them first keeps everything you've learned from fading${urgency}.`;
  }
  return `Today's mix keeps your reviews on schedule and pushes your weakest area up${urgency}.`;
}

/** "A", "A and B", "A, B and C". */
function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// ── Second opinion — re-explain a missed question differently ─

export interface SecondOpinionData {
  /** The question as shown to the learner. */
  prompt: string;
  /** The correct option's text. */
  correct: string;
  /** The option the learner chose (wrongly). */
  chosen?: string;
  /** The standard explanation that didn't land. */
  explanation: string;
}

export function localSecondOpinion(d: SecondOpinionData): string {
  const contrast = d.chosen
    ? ` "${d.chosen}" feels plausible, but ask what the rule is protecting — that's what it misses.`
    : "";
  return (
    `Try it from the road, not the rulebook: picture yourself in the situation — ${d.prompt} ` +
    `The safe, legal move is "${d.correct}".${contrast} ` +
    `If it still feels fuzzy, ask the tutor to walk through a real example step by step.`
  );
}

export function localSessionRecap(d: SessionRecapData): string {
  const acc =
    d.total && d.total > 0 && d.correct != null ? Math.round((d.correct / d.total) * 100) : null;
  const weak = d.weakCategories?.[0];
  const tomorrow =
    d.dueTomorrow && d.dueTomorrow > 0
      ? ` ${d.dueTomorrow} card${d.dueTomorrow === 1 ? " comes" : "s come"} due tomorrow — a short session keeps the chain going.`
      : "";

  switch (d.mode) {
    case "flashcards": {
      const total = d.total ?? 0;
      const tripped =
        d.againCount && d.againCount > 0
          ? ` ${d.againCount} tripped you up — they'll come back sooner, which is the system working.`
          : " Your recall is holding strong.";
      return `That's ${total} card${total === 1 ? "" : "s"} reviewed.${tripped}${tomorrow}`;
    }
    case "questions": {
      const score = acc != null ? `You scored ${d.correct}/${d.total} (${acc}%).` : "Session done.";
      const focus = weak
        ? ` ${weak} is still the one to watch — a few more reps there will move your readiness fastest.`
        : " Solid work across the board.";
      return `${score}${focus}${tomorrow}`;
    }
    case "scenarios": {
      const score = acc != null ? `You judged ${d.correct}/${d.total} scenarios correctly.` : "Scenarios done.";
      const focus = weak
        ? ` The ${weak.toLowerCase()} situations are where to slow down and think K53 procedure.`
        : " Your judgement is sharpening.";
      return `${score}${focus}${tomorrow}`;
    }
    case "mock": {
      const moved =
        d.passProbabilityBefore != null &&
        d.passProbabilityAfter != null &&
        d.passProbabilityAfter !== d.passProbabilityBefore
          ? ` Your predicted pass moved from ${d.passProbabilityBefore}% to ${d.passProbabilityAfter}%.`
          : "";
      if (d.passed) {
        return `You passed with ${d.correct}/${d.total} — that's real-test standard.${moved} One more clean mock and you can book with confidence.`;
      }
      const sections =
        d.failedSections && d.failedSections.length > 0
          ? ` The gap is in ${listJoin(d.failedSections)} — that's where the quickest marks are.`
          : weak
            ? ` Focus on ${weak} next — that's where the quickest marks are.`
            : "";
      return `${d.correct}/${d.total} this time.${moved}${sections} Every mock teaches the paper's rhythm — the next one will feel more familiar.`;
    }
  }
}
