/**
 * Dates and times in the school's own timezone.
 *
 * The server renders in UTC on Vercel. For a school in Johannesburg (UTC+2)
 * that means "today" is wrong between midnight and 02:00, and every lesson
 * time is two hours off, unless the timezone is applied explicitly. Every
 * date the school sees goes through here for that reason — never through a
 * bare `new Date().toISOString().slice(0, 10)`.
 */

export const DEFAULT_SCHOOL_TZ = "Africa/Johannesburg";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** `YYYY-MM-DD` for an instant, as the school's wall clock shows it. */
export function schoolDay(instant: Date, tz: string = DEFAULT_SCHOOL_TZ): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function isIsoDay(value: string | undefined | null): value is string {
  if (!value || !ISO_DAY.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isClockTime(value: string | undefined | null): value is string {
  return Boolean(value && HH_MM.test(value));
}

/** The UTC offset of `tz` at `instant`, in minutes (Johannesburg: +120). */
export function offsetMinutes(instant: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/**
 * The instant a wall-clock `day` + `time` denotes in `tz`.
 *
 * Resolved in two passes so it stays correct for a timezone with daylight
 * saving, even though South Africa has none: guess with the offset at that
 * moment, then correct with the offset at the guess.
 */
export function zonedInstant(day: string, time: string, tz: string = DEFAULT_SCHOOL_TZ): Date {
  const naive = new Date(`${day}T${time}:00Z`);
  const first = new Date(naive.getTime() - offsetMinutes(naive, tz) * 60_000);
  return new Date(naive.getTime() - offsetMinutes(first, tz) * 60_000);
}

/** [start, end) of a school day, as instants, for querying the diary. */
export function dayBounds(day: string, tz: string = DEFAULT_SCHOOL_TZ): { start: Date; end: Date } {
  const start = zonedInstant(day, "00:00", tz);
  const next = new Date(`${day}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const end = zonedInstant(next.toISOString().slice(0, 10), "00:00", tz);
  return { start, end };
}

/** The day before or after, as `YYYY-MM-DD`. Pure calendar arithmetic. */
export function shiftDay(day: string, by: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + by);
  return date.toISOString().slice(0, 10);
}

/** "14:00" in the school's timezone. */
export function clockTime(iso: string, tz: string = DEFAULT_SCHOOL_TZ): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

/**
 * "Friday, 18 September" / "Wednesday, 1 January" for a `YYYY-MM-DD`.
 * Assembled from parts because en-ZA pads the day ("01 January") and en-GB
 * drops the comma; neither reads the way a person would write it.
 */
export function longDay(day: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).formatToParts(new Date(`${day}T12:00:00Z`));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")}`;
}

/** "Fri 18 Sep, 14:00" for a lesson list outside the day view. */
export function shortDateTime(iso: string, tz: string = DEFAULT_SCHOOL_TZ): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}
