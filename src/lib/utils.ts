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

/** Whole days from now until `date` (negative = in the past). */
export function daysUntil(date: string | Date | null | undefined) {
  if (!date) return null;
  const target = new Date(date).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
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
