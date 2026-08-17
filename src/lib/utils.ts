import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Liquid-glass surface as utility classes (so it composes onto <Card> and wins
 * over the card's opaque background via tailwind-merge). Pairs the frosted fill
 * with the `shadow-glass` token (which carries the inset top reflection).
 */
export const glass = "glass-edge bg-card/50 backdrop-blur-xl border-border/50 shadow-glass";

/** Most-elevated glass tier — hero cards, product shots, floating panels. */
export const glassFloat = "glass-edge bg-card/[0.66] backdrop-blur-2xl border-border/60 shadow-float";

/** Recessed tier — stat tiles / insets that sit closest to the background. */
export const glassSubtle = "bg-card/40 backdrop-blur-md border-border/45";

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`;
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/** "12 min", "1 h 5 min" — humanises a seconds value. */
export function formatDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours} h ${rem} min` : `${hours} h`;
}

/** Local yyyy-mm-dd — never toISOString, which shifts the day in +SAST. */
export function localIsoDate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Midnight local on the day `date` names, or null if it names nothing. */
function startOfLocalDay(date: string | Date): Date | null {
  if (typeof date === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
    // A bare yyyy-mm-dd is a calendar day, not an instant: Date.parse reads it
    // as UTC midnight, which is 02:00 the same morning in SAST.
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Whole calendar days from today until `date` — 0 is today, negative is past.
 *
 * Counted between local midnights, not as elapsed hours. A test date is a day
 * on a booking slip, so "how many days left" must not depend on the time of
 * day: measuring in hours made a test read as tomorrow's at 01:00 and as
 * today's the morning after it was sat.
 */
export function daysUntil(date: string | Date | null | undefined, now: Date = new Date()) {
  if (!date) return null;
  const target = startOfLocalDay(date);
  if (!target) return null;
  const today = startOfLocalDay(now)!;
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** True when `date` names a day before today — a stale, already-sat test date. */
export function isPastDate(date: string | Date | null | undefined, now: Date = new Date()) {
  const days = daysUntil(date, now);
  return days !== null && days < 0;
}

/** `date` held at or after `min`, so a picker can never emit a past day. */
export function clampDate(date: string, min: string): string {
  return date < min ? min : date;
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-ZA", opts ?? { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(date),
  );
}

/** Stable, dependency-free id for client-generated records. */
export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Rand → ZAR currency string. */
export function formatZar(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
