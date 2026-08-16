"use client";

import * as React from "react";
import {
  Award,
  BadgeCheck,
  Brain,
  CheckCheck,
  Crosshair,
  Eraser,
  Eye,
  FileText,
  Flame,
  Lock,
  Map,
  Route,
  Stamp,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import type { AchievementView } from "@/lib/achievements";
import { cn } from "@/lib/utils";

/**
 * The achievement wall.
 *
 * Three decisions worth keeping if this is edited:
 *
 * 1. **No metals.** Bronze/silver/gold is the obvious tier language and it is
 *    unavailable here: the Road Atlas palette has no metallic tokens, and every
 *    tint on this page is contract-tested (tests/contrast.test.ts). Tier reads
 *    from the pips instead, and the top tier switches to `--accent` — which is
 *    also the one move that keeps a maxed badge distinguishable from an earned
 *    one, since `--primary` and `--success` are the same green in light mode.
 * 2. **Locked shows its requirement.** A blank silhouette is a locked door with
 *    no label on it. The whole point of showing what has not been earned is that
 *    the learner can decide to go and earn it.
 * 3. **Squares, not circles.** Mastery rings and passport stamps are both
 *    circular and both already on this page; a third circle would read as a
 *    fourth copy of the same idea.
 */

const ICONS: Record<string, LucideIcon> = {
  Award,
  BadgeCheck,
  Brain,
  CheckCheck,
  Crosshair,
  Eraser,
  Eye,
  FileText,
  Flame,
  Map,
  Route,
  Stamp,
  Undo2,
};

function Medallion({ view }: { view: AchievementView }) {
  const { achievement, tier, earned, maxed, value, nextTier } = view;
  const Icon = ICONS[achievement.icon] ?? Award;
  // Accent means "you took this as far as it goes", which only says anything
  // where there was a distance to go. A single-tier milestone is earned or not;
  // painting it top-tier would rank one finished mock above a maxed streak.
  const top = earned && maxed && achievement.tiers.length > 1;

  // Always-visible status. A hover tooltip would put the requirement — the whole
  // reason for showing a locked badge — behind an interaction phones do not have.
  const status = earned
    ? achievement.tiers[tier].name
    : nextTier
      ? `${Math.min(value, nextTier.threshold)} / ${nextTier.threshold}`
      : "Locked";

  return (
    <div
      className="flex w-full flex-col items-center gap-1.5 text-center"
      title={earned ? `${achievement.name} — ${status}` : achievement.description}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-500 ease-soft",
          top
            ? "glass-edge border border-accent/45 bg-accent/[0.12] text-accent"
            : earned
              ? "border border-primary/40 bg-primary/10 text-primary"
              : "border border-dashed border-border text-muted-foreground/45",
        )}
      >
        {earned ? <Icon className="h-6 w-6" /> : <Lock className="h-4 w-4" />}
      </span>

      {/* Tier pips. One per tier, filled to the level earned. */}
      {achievement.tiers.length > 1 && (
        <span className="flex items-center gap-1" aria-hidden>
          {achievement.tiers.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 w-1 rounded-full",
                i <= tier ? (top ? "bg-accent" : "bg-primary") : "bg-border",
              )}
            />
          ))}
        </span>
      )}

      <span
        className={cn(
          "text-2xs font-medium leading-tight",
          earned ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {achievement.name}
      </span>
      <span className="text-2xs leading-tight text-muted-foreground/80 tabular-nums">{status}</span>
    </div>
  );
}

export function AchievementGrid({
  views,
  className,
}: {
  views: AchievementView[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 lg:grid-cols-7",
        className,
      )}
    >
      {views.map((v) => (
        <li key={v.achievement.id} className="flex justify-center">
          <Medallion view={v} />
        </li>
      ))}
    </ul>
  );
}

/**
 * The one achievement worth naming above the wall — closest to its next tier.
 * A grid answers "what is there"; this answers "what should I do", which is the
 * only question a progress page is really for.
 */
export function NextAchievement({ view }: { view: AchievementView }) {
  const { achievement, value, nextTier, progress } = view;
  if (!nextTier) return null;
  const Icon = ICONS[achievement.icon] ?? Award;

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-medium">
            {achievement.name}
            <span className="ml-1.5 font-normal text-muted-foreground">{nextTier.name}</span>
          </p>
          <p className="shrink-0 font-mono text-2xs tabular-nums text-muted-foreground">
            {Math.min(value, nextTier.threshold)}/{nextTier.threshold}
          </p>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700 ease-glass"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
