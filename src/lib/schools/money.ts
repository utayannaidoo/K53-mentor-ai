/**
 * The school's money, as arithmetic.
 *
 * Pure functions only: the ledger is read from the database, and every figure
 * a school sees is computed here from those rows. There is deliberately no
 * stored balance anywhere (see 0038) — a stored running total drifts, and a
 * number that disagrees with the cash box is worse than no number.
 *
 * All amounts are integer cents. Floating-point rands never reach arithmetic.
 */

export type PaymentMethod = "cash" | "eft" | "card" | "snapscan" | "other";

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  eft: "EFT",
  card: "Card",
  snapscan: "SnapScan",
  other: "Other",
};

export interface PackageRow {
  id: string;
  learner_id: string;
  name: string;
  lessons_included: number | null;
  price_cents: number;
  status: "active" | "used" | "expired" | "refunded";
  sold_on: string;
  expires_on: string | null;
}

export interface PaymentRow {
  id: string;
  learner_id: string;
  package_id: string | null;
  amount_cents: number;
  method: PaymentMethod;
  reference: string | null;
  received_on: string;
  /** Null once the person who took it has deleted their account (0041). */
  received_by: string | null;
  note: string | null;
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
}

/** The parts of a lesson that decide what it costs. */
export interface ChargeableLesson {
  id: string;
  learner_id: string | null;
  package_id: string | null;
  price_cents: number | null;
  status: string;
}

/**
 * A lesson costs money once it happened — or once the learner didn't turn up,
 * which is how SA driving schools treat a no-show. A cancellation costs
 * nothing, and a lesson still in the future hasn't been charged yet.
 */
const CHARGED = new Set(["completed", "no_show"]);

/**
 * What someone typed in an amount field, as cents — or null if it isn't one.
 *
 * South Africans write "R450", "450,50", "450.50", "R 1 200" and "1,200.00",
 * so all of those have to work. The one real ambiguity is a lone separator:
 * followed by one or two digits it is a decimal point ("450,5" → R450.50);
 * followed by three it is a thousands separator ("1,200" → R1 200).
 */
export function parseRand(input: string): number | null {
  let value = input.trim().replace(/^R/i, "").replace(/[\s ]/g, "");
  if (!value) return null;
  const lastComma = value.lastIndexOf(",");
  const lastDot = value.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    // Both present: whichever comes last is the decimal point.
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    value = value.split(thousands).join("").replace(decimal, ".");
  } else if (lastComma !== -1 || lastDot !== -1) {
    const sep = lastComma !== -1 ? "," : ".";
    const parts = value.split(sep);
    const tail = parts[parts.length - 1];
    if (parts.length === 2 && tail.length >= 1 && tail.length <= 2) {
      value = `${parts[0]}.${tail}`;
    } else if (parts.slice(1).every((p) => p.length === 3)) {
      value = parts.join("");
    } else {
      return null;
    }
  }
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents;
}

/** "R450" for whole rands, "R450,50" otherwise — the way it's written in SA. */
export function formatRand(cents: number): string {
  const whole = cents % 100 === 0;
  const formatted = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
  // en-ZA puts a space after the R ("R 450"); a price tag doesn't.
  return formatted.replace(/^(-?)R\s/, "$1R");
}

/**
 * What a learner has been charged, what they've paid, and the difference.
 * `balanceCents` > 0 means they owe the school; < 0 means they're in credit.
 */
export function learnerBalance(
  learnerId: string,
  packages: PackageRow[],
  payments: PaymentRow[],
  lessons: ChargeableLesson[],
): { chargedCents: number; paidCents: number; balanceCents: number } {
  const packageCharges = packages
    .filter((p) => p.learner_id === learnerId && p.status !== "refunded")
    .reduce((sum, p) => sum + p.price_cents, 0);
  const lessonCharges = lessons
    .filter(
      (l) =>
        l.learner_id === learnerId &&
        l.package_id === null &&
        l.price_cents !== null &&
        CHARGED.has(l.status),
    )
    .reduce((sum, l) => sum + (l.price_cents ?? 0), 0);
  const paidCents = payments
    .filter((p) => p.learner_id === learnerId && p.voided_at === null)
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const chargedCents = packageCharges + lessonCharges;
  return { chargedCents, paidCents, balanceCents: chargedCents - paidCents };
}

/**
 * How much of a package is gone. `used` counts lessons that happened (or were
 * missed); `booked` counts ones still on the diary; `left` is what's
 * unclaimed, or null for an open package that isn't counted in lessons.
 */
export function packageUsage(
  pkg: PackageRow,
  lessons: ChargeableLesson[],
): { used: number; booked: number; left: number | null } {
  const mine = lessons.filter((l) => l.package_id === pkg.id);
  const used = mine.filter((l) => CHARGED.has(l.status)).length;
  const booked = mine.filter((l) => l.status === "scheduled").length;
  const left = pkg.lessons_included === null ? null : pkg.lessons_included - used - booked;
  return { used, booked, left };
}

/** Money in during a calendar month (`YYYY-MM`), voided payments excluded. */
export function collectedIn(month: string, payments: PaymentRow[]): number {
  return payments
    .filter((p) => p.voided_at === null && p.received_on.startsWith(month))
    .reduce((sum, p) => sum + p.amount_cents, 0);
}

/**
 * The packages a new booking can draw from: active ones with lessons left
 * (or open ones that aren't counted in lessons). Labelled with the learner's
 * name unless the list is already for a single learner.
 */
export function packageChoices(
  packages: PackageRow[],
  lessons: ChargeableLesson[],
  learnerNames: Map<string, string>,
  learnerId?: string,
): { value: string; label: string }[] {
  return packages
    .filter((p) => p.status === "active" && (!learnerId || p.learner_id === learnerId))
    .map((p) => ({ p, left: packageUsage(p, lessons).left }))
    .filter(({ left }) => left === null || left > 0)
    .map(({ p, left }) => ({
      value: p.id,
      label: [learnerId ? null : learnerNames.get(p.learner_id), p.name, left === null ? null : `${left} left`]
        .filter(Boolean)
        .join(" · "),
    }));
}
