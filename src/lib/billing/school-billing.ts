import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SCHOOL_PLAN_MAP, schoolAnnualZar, type SchoolPlanId } from "@/lib/billing/school-plans";
import { disableSubscription, fetchCustomer, type PaystackSubscription } from "@/lib/paystack/client";
import type { ChargeSuccessData } from "@/lib/paystack/apply";

/**
 * Paystack billing for K53 Mentor for Schools — the second product.
 *
 * The rules that make it safe to share one Paystack account, one webhook and
 * one payment_events ledger with the learner app:
 *
 *  1. School money NEVER touches `subscriptions`. That table is the learner
 *     product's, and `remember_partner_first_payment` fires on every write to
 *     it — a school charge there would burn the owner's own once-ever referral
 *     eligibility. Everything here writes `school_subscriptions` only.
 *
 *  2. A charge is a school charge when WE said so at checkout
 *     (metadata.kind = "school_subscription"), or — for renewals, which carry
 *     no metadata — when its plan code is one of the school plan codes below.
 *     Customer codes decide nothing: Paystack keys customers on email, so an
 *     owner who also pays for Premium is ONE customer with two products.
 *
 *  3. Until school plan codes exist in the environment, this module never
 *     reads a school table at all. The webhook consults it for every event;
 *     if it queried school_subscriptions before migration 0035 was applied,
 *     every event would error, get retried, and learner billing would stop.
 *     No school plan codes ⇒ no school events ⇒ nothing to look up.
 *
 *  4. Same shape as the learner grant (src/lib/paystack/apply.ts): THROW on a
 *     money-bearing failure so the ledger row is released and the charge is
 *     retried; swallow cosmetic ones so an applied charge is never replayed.
 *     A superseded-plan disable that fails THROWS — a swallowed disable is a
 *     permanent double charge. An unidentifiable plan is never "different".
 */

export type SchoolCycle = "monthly" | "annual";

/**
 * A failure on something known to be a school event. Its own type so the
 * webhook's learner fallbacks (which swallow ordinary errors and carry on) can
 * rethrow it instead — the event must fail and be retried, not be quietly
 * applied as if it were a learner's.
 */
export class SchoolBillingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchoolBillingError";
  }
}

/** The plan code a webhook payload names, whichever shape Paystack sent. */
export function eventPlanCode(data: unknown): string | undefined {
  const pick = (value: unknown): string | undefined => {
    if (typeof value === "string" && value.length > 0) return value;
    if (value && typeof value === "object") {
      const code = (value as { plan_code?: unknown }).plan_code;
      if (typeof code === "string" && code.length > 0) return code;
    }
    return undefined;
  };
  const d = (data ?? {}) as { plan?: unknown; subscription?: { plan?: unknown } | null };
  return pick(d.plan) ?? pick(d.subscription?.plan);
}

const PLAN_ENV: Record<SchoolPlanId, Record<SchoolCycle, string>> = {
  solo: { monthly: "PAYSTACK_PLAN_SCHOOL_SOLO_MONTHLY", annual: "PAYSTACK_PLAN_SCHOOL_SOLO_ANNUAL" },
  team: { monthly: "PAYSTACK_PLAN_SCHOOL_TEAM_MONTHLY", annual: "PAYSTACK_PLAN_SCHOOL_TEAM_ANNUAL" },
  fleet: { monthly: "PAYSTACK_PLAN_SCHOOL_FLEET_MONTHLY", annual: "PAYSTACK_PLAN_SCHOOL_FLEET_ANNUAL" },
};

/** Every school Plan env key, for the checkout route's boot-time audit. */
export const SCHOOL_PLAN_ENV_KEYS: string[] = Object.values(PLAN_ENV).flatMap((cycles) => Object.values(cycles));

/** The Paystack Plan code for a school plan and cycle, from server env only. */
export function schoolPlanCodeFor(plan: SchoolPlanId, cycle: SchoolCycle): string | undefined {
  const code = process.env[PLAN_ENV[plan][cycle]]?.trim();
  return code ? code : undefined;
}

/** Every configured school plan code, with the plan and cycle it bills. */
function configuredSchoolCodes(): Map<string, { plan: SchoolPlanId; cycle: SchoolCycle }> {
  const codes = new Map<string, { plan: SchoolPlanId; cycle: SchoolCycle }>();
  for (const plan of Object.keys(PLAN_ENV) as SchoolPlanId[]) {
    for (const cycle of ["monthly", "annual"] as SchoolCycle[]) {
      const code = schoolPlanCodeFor(plan, cycle);
      if (code) codes.set(code, { plan, cycle });
    }
  }
  return codes;
}

/** True when at least one school plan code is configured. */
export function isSchoolBillingConfigured(): boolean {
  return configuredSchoolCodes().size > 0;
}

/** True when `code` is one of the school product's Paystack Plans. */
export function isSchoolPlanCode(code: string | null | undefined): boolean {
  return Boolean(code) && configuredSchoolCodes().has(code!);
}

export function schoolPlanFromCode(
  code: string | null | undefined,
): { plan: SchoolPlanId; cycle: SchoolCycle } | null {
  return code ? (configuredSchoolCodes().get(code) ?? null) : null;
}

/** What a school plan costs per charge, in cents — what checkout sends. */
export function schoolChargeCents(plan: SchoolPlanId, cycle: SchoolCycle): number {
  const def = SCHOOL_PLAN_MAP[plan];
  return (cycle === "annual" ? schoolAnnualZar(def) : def.monthlyZar) * 100;
}

function planCodeOf(s: Pick<PaystackSubscription, "plan">): string | undefined {
  const plan = s.plan;
  if (!plan) return undefined;
  const code = typeof plan === "string" ? plan : plan.plan_code;
  return typeof code === "string" && code.length > 0 ? code : undefined;
}

/**
 * A school's first charge (or a plan change) through our own checkout.
 *
 * The plan comes from the PLAN CODE Paystack actually billed, not from the
 * metadata we sent — if the two disagree, the money is what's true.
 */
export async function applySchoolCharge(admin: SupabaseClient, data: ChargeSuccessData): Promise<void> {
  const meta = data.metadata ?? {};
  const schoolId = meta.school_id;
  const paidCode = data.plan?.plan_code;
  const bought = schoolPlanFromCode(paidCode);
  if (!schoolId || !bought) {
    // Ours by metadata, but not a school plan we know how to grant. Refusing
    // to guess is safer than granting the wrong seats; ops can reconcile.
    console.error(
      `applySchoolCharge: charge ${data.reference} is marked as a school subscription but ` +
        `has school ${schoolId ?? "missing"} and plan code ${paidCode ?? "missing"}; nothing granted`,
    );
    return;
  }
  if (meta.plan && meta.plan !== bought.plan) {
    console.error(
      `applySchoolCharge: charge ${data.reference} metadata says ${meta.plan} but Paystack billed ` +
        `${bought.plan} (${paidCode}); granting what was billed`,
    );
  }
  const expected = schoolChargeCents(bought.plan, bought.cycle);
  if (typeof data.amount === "number" && data.amount !== expected) {
    // Same stance as the learner grant: the buyer paid in good faith, so the
    // grant stands and the mismatch is surfaced for someone to fix the Plan.
    console.error(
      `PRICE MISMATCH on school charge ${data.reference}: expected ${expected} cents for ` +
        `${bought.plan}/${bought.cycle}, Paystack charged ${data.amount}. Granted anyway.`,
    );
  }

  // Who was paying for this school before this charge. Read BEFORE the grant
  // overwrites it, and acted on before the grant too — see stopPreviousPayer.
  const { data: before, error: beforeError } = await admin
    .from("school_subscriptions")
    .select("provider_customer_id, provider_subscription_id")
    .eq("school_id", schoolId)
    .maybeSingle();
  if (beforeError) throw new Error(`applySchoolCharge: could not read the school's billing: ${beforeError.message}`);
  await stopPreviousPayer(before as PreviousPayer | null, data.customer.customer_code, schoolId);

  const seats = SCHOOL_PLAN_MAP[bought.plan].seats;
  const { data: updated, error } = await admin
    .from("school_subscriptions")
    .update({
      plan: bought.plan,
      status: "active",
      seats,
      provider: "paystack",
      provider_customer_id: data.customer.customer_code,
      plan_code: paidCode,
      paid_at: new Date().toISOString(),
      last_charge_reference: data.reference,
      cancel_at_period_end: false,
      refunded_at: null,
      // Cleared until the new subscription is recorded below. A stale code
      // would let the disable event for the OLD subscription match this row
      // and flag a just-paid school as ending. A stale period end would be
      // worse: a school that lapsed months ago would pay and stay read-only,
      // because its last period ended long before the retry slack. Null means
      // "paid, period not yet known", which 0040 treats as writable.
      provider_subscription_id: null,
      current_period_end: null,
    })
    .eq("school_id", schoolId)
    .select("id");
  if (error) throw new Error(`applySchoolCharge: grant failed: ${error.message}`);
  if (!updated || updated.length === 0) {
    // The school was deleted between checkout and payment. Retrying cannot
    // help, so this does not throw — it is logged for a refund.
    console.error(
      `applySchoolCharge: no school_subscriptions row for school ${schoolId}; charge ${data.reference} ` +
        `was paid but could not be granted — refund or reconcile by hand`,
    );
    return;
  }

  // Record which Paystack subscription the row now represents and when its
  // period ends, BEFORE disabling anything: the subscription.disable events a
  // plan change triggers must find the row already pointing at the new one.
  let customer: Awaited<ReturnType<typeof fetchCustomer>> | null = null;
  try {
    customer = await fetchCustomer(data.customer.customer_code);
  } catch (err) {
    console.error(`applySchoolCharge: customer lookup failed after granting ${data.reference}`, err);
  }
  // Two live subscriptions on the SAME plan — a double-click on checkout, or a
  // resubscribe racing a cancel — would both renew. Keep one, the same way
  // the learner grant picks its survivor (apply.ts, isLaterSubscription).
  const samePlan = (customer?.subscriptions ?? []).filter(
    (s) => s.status === "active" && planCodeOf(s) === paidCode,
  );
  const current = samePlan.reduce<PaystackSubscription | undefined>(
    (kept, s) => (kept === undefined || isLater(s, kept) ? s : kept),
    undefined,
  );
  if (current) {
    const { error: recordError } = await admin
      .from("school_subscriptions")
      .update({
        provider_subscription_id: current.subscription_code,
        cancel_at_period_end: false,
        ...(current.next_payment_date
          ? { current_period_end: new Date(current.next_payment_date).toISOString() }
          : {}),
      })
      .eq("school_id", schoolId);
    if (recordError) {
      console.error(`applySchoolCharge: could not record subscription for school ${schoolId}`, recordError.message);
    }
  }

  // A plan change leaves the OLD school plan billing beside the new one.
  // Disable it — but only a subscription whose code is KNOWN to be another
  // SCHOOL plan. Learner plans are the other product; unknown codes are
  // untouchable (see the superseded-plan note in apply.ts).
  const stale = (customer?.subscriptions ?? []).filter((s) => {
    if (s.status !== "active") return false;
    if (current && s.subscription_code === current.subscription_code) return false;
    const code = planCodeOf(s);
    return Boolean(code) && code !== paidCode && isSchoolPlanCode(code);
  });
  for (const s of stale) {
    console.error(
      `applySchoolCharge: disabling superseded school subscription ${s.subscription_code} ` +
        `(plan ${planCodeOf(s)} ≠ paid ${paidCode}) for customer ${data.customer.customer_code}`,
    );
    await disableSubscription(s.subscription_code, s.email_token);
  }

  // Same-plan duplicates last, and best-effort, as in the learner grant: the
  // row already names the survivor, so each duplicate's disable event is
  // ignored, and throwing here would replay a charge that has been applied.
  for (const dup of samePlan) {
    if (dup.subscription_code === current?.subscription_code) continue;
    try {
      await disableSubscription(dup.subscription_code, dup.email_token);
      console.error(
        `applySchoolCharge: disabled DUPLICATE school subscription ${dup.subscription_code} ` +
          `(plan ${paidCode}, customer ${data.customer.customer_code}); kept ${current?.subscription_code}`,
      );
    } catch (err) {
      console.error(
        `applySchoolCharge: FAILED to disable duplicate school subscription ${dup.subscription_code} — ` +
          `it will keep billing until disabled by hand`,
        err,
      );
    }
  }
}

interface PreviousPayer {
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
}

/**
 * Ownership moved (transfer_school_ownership) and the NEW owner has now paid,
 * while the OLD owner's subscription — on their own Paystack customer, their
 * own card — is still renewing. The stale-plan cleanup only ever sees the
 * paying customer's subscriptions, so without this two people would be billed
 * for one school, indefinitely.
 *
 * Runs before the grant, so that a retry still knows who the previous payer
 * was, and THROWS when the disable fails: a swallowed disable is a permanent
 * double charge. Only an ACTIVE subscription is disabled, which is what makes
 * the retry harmless — the second time round it is already non-renewing.
 */
async function stopPreviousPayer(
  before: PreviousPayer | null,
  payingCustomer: string,
  schoolId: string,
): Promise<void> {
  const previousCustomer = before?.provider_customer_id;
  const previousSub = before?.provider_subscription_id;
  if (!previousCustomer || !previousSub || previousCustomer === payingCustomer) return;

  const previous = await fetchCustomer(previousCustomer);
  const live = previous.subscriptions.find((s) => s.subscription_code === previousSub && s.status === "active");
  if (!live) return;
  console.error(
    `applySchoolCharge: school ${schoolId} is now paid by ${payingCustomer}; stopping the previous ` +
      `payer's subscription ${previousSub} (customer ${previousCustomer})`,
  );
  await disableSubscription(live.subscription_code, live.email_token);
}

/** Latest period wins; equal or unknown periods fall back to the higher code. */
function isLater(a: PaystackSubscription, b: PaystackSubscription): boolean {
  const end = (s: PaystackSubscription) => {
    const ms = s.next_payment_date ? Date.parse(s.next_payment_date) : NaN;
    return Number.isFinite(ms) ? ms : Number.NEGATIVE_INFINITY;
  };
  if (end(a) !== end(b)) return end(a) > end(b);
  return a.subscription_code > b.subscription_code;
}

/**
 * A school renewal: no metadata (Paystack initiated it), a school plan code.
 * Scoped by customer AND plan code, so an owner's learner subscription on the
 * same customer can never be touched.
 */
export async function applySchoolRenewal(admin: SupabaseClient, data: ChargeSuccessData): Promise<void> {
  const paidCode = data.plan?.plan_code;
  const customerCode = data.customer?.customer_code;
  if (!paidCode || !customerCode) return;

  let period: { current_period_end: string } | Record<string, never> = {};
  try {
    const customer = await fetchCustomer(customerCode);
    const sub = customer.subscriptions.find((s) => s.status === "active" && planCodeOf(s) === paidCode);
    if (sub?.next_payment_date) period = { current_period_end: new Date(sub.next_payment_date).toISOString() };
  } catch (err) {
    console.error("applySchoolRenewal: period lookup failed", err);
  }

  const { error } = await admin
    .from("school_subscriptions")
    .update({
      status: "active",
      cancel_at_period_end: false,
      paid_at: new Date().toISOString(),
      last_charge_reference: data.reference,
      ...period,
    })
    .eq("provider_customer_id", customerCode)
    .eq("plan_code", paidCode);
  if (error) throw new Error(`applySchoolRenewal: update failed: ${error.message}`);
}

export interface SchoolEventTarget {
  id: string;
  school_id: string;
  provider_subscription_id: string | null;
  current_period_end: string | null;
}

/**
 * Decide whether a lifecycle webhook is about a SCHOOL subscription, and if so
 * which row. Returns null for every learner event — the caller then runs the
 * learner handling exactly as before.
 *
 * Evidence, strongest first: the event's subscription code matches a school
 * row; its plan code is a school plan; the charge reference is the one a
 * school row last recorded. With no school plan codes configured it returns
 * null WITHOUT querying (rule 3 above).
 */
export async function findSchoolEventTarget(
  admin: SupabaseClient,
  evidence: {
    subscriptionCode?: string | null;
    planCode?: string | null;
    customerCode?: string | null;
    reference?: string | null;
  },
): Promise<SchoolEventTarget | null> {
  if (!isSchoolBillingConfigured()) return null;
  const definitelySchool = isSchoolPlanCode(evidence.planCode);
  const columns = "id, school_id, provider_subscription_id, current_period_end";

  const lookups: Array<() => PromiseLike<{ data: unknown; error: { message: string } | null }>> = [];
  if (evidence.subscriptionCode) {
    lookups.push(() =>
      admin.from("school_subscriptions").select(columns).eq("provider_subscription_id", evidence.subscriptionCode!).limit(1),
    );
  }
  if (evidence.reference) {
    lookups.push(() =>
      admin.from("school_subscriptions").select(columns).eq("last_charge_reference", evidence.reference!).limit(1),
    );
  }
  if (definitelySchool && evidence.customerCode) {
    lookups.push(() =>
      admin
        .from("school_subscriptions")
        .select(columns)
        .eq("provider_customer_id", evidence.customerCode!)
        .eq("plan_code", evidence.planCode!)
        .limit(1),
    );
  }

  for (const lookup of lookups) {
    const { data, error } = await lookup();
    if (error) {
      // Definitely ours: fail so the event is retried rather than mis-routed
      // to the learner handling. Merely possible: treat as not-school and let
      // the learner path's own identity guards decide.
      if (definitelySchool) throw new SchoolBillingError(`school event lookup failed: ${error.message}`);
      console.error("findSchoolEventTarget: lookup failed; treating as a learner event", error.message);
      return null;
    }
    const row = (data as SchoolEventTarget[] | null)?.[0];
    if (row) return row;
  }
  if (definitelySchool) {
    console.error(
      `findSchoolEventTarget: school plan ${evidence.planCode} event matched no school row ` +
        `(subscription ${evidence.subscriptionCode ?? "?"}, customer ${evidence.customerCode ?? "?"})`,
    );
  }
  return null;
}

export type SchoolLifecycleEvent =
  | "invoice.payment_failed"
  | "subscription.disable"
  | "subscription.not_renew"
  | "refund.processed"
  | "charge.dispute.create";

/**
 * The question every lifecycle webhook asks first: is this a driving school's
 * event? If so it is applied to school_subscriptions and the answer is
 * "school"; otherwise the answer is "learner" and nothing has been touched.
 *
 * An event whose plan code is a SCHOOL plan is the school's even when no
 * school row matches it — the old plan being disabled after a plan change is
 * the everyday case. It is answered "school" all the same, and so dropped,
 * because the learner handling resolves rows by customer code, and an owner
 * who also studies is the same Paystack customer as their school.
 */
export async function routeSchoolEvent(
  admin: SupabaseClient,
  event: SchoolLifecycleEvent,
  evidence: {
    subscriptionCode?: string | null;
    planCode?: string | null;
    customerCode?: string | null;
    reference?: string | null;
  },
): Promise<"school" | "learner"> {
  const target = await findSchoolEventTarget(admin, evidence);
  if (target) {
    // A month paid for with referral credit is refunded on purpose (0042):
    // the plan carries on. Every other refund ends it.
    if (event === "refund.processed" && evidence.reference && (await isCreditRedemption(admin, evidence.reference))) {
      return "school";
    }
    await applySchoolLifecycle(admin, event, target, evidence.subscriptionCode);
    return "school";
  }
  return isSchoolPlanCode(evidence.planCode) ? "school" : "learner";
}

/** Postgres and PostgREST's two ways of saying "that table does not exist". */
const MISSING_TABLE = new Set(["42P01", "PGRST205"]);

/**
 * Whether a refunded school charge was paid for with referral credit — a free
 * month, not the end of the plan (see src/lib/billing/school-credit.ts). A
 * redemption that was later reversed does not count. No ledger table (0042
 * not applied) means no redemption can exist; any other failure throws, so the
 * refund event is retried rather than guessed at — guessing wrong either ends
 * a plan that was paid for or keeps one that was refunded.
 */
export async function isCreditRedemption(admin: SupabaseClient, reference: string): Promise<boolean> {
  const { data, error } = await admin
    .from("school_credit_ledger")
    .select("id, kind, reverses")
    .eq("charge_reference", reference);
  if (error) {
    if (error.code && MISSING_TABLE.has(error.code)) return false;
    throw new SchoolBillingError(`credit redemption lookup failed: ${error.message}`);
  }
  const rows = (data ?? []) as { id: string; kind: string; reverses: string | null }[];
  const reversed = new Set(rows.filter((r) => r.kind === "reversed").map((r) => r.reverses));
  return rows.some((r) => r.kind === "redeemed" && !reversed.has(r.id));
}

/**
 * Apply a lifecycle event to a school row the webhook already identified.
 * Mirrors the learner semantics in the webhook route: a disable while the
 * paid period is still running only stops the renewal; a refund ends it now;
 * a dispute is annotation only.
 */
export async function applySchoolLifecycle(
  admin: SupabaseClient,
  event: SchoolLifecycleEvent,
  target: SchoolEventTarget,
  eventSubscriptionCode?: string | null,
): Promise<void> {
  // The identity guard the learner handlers use: an event naming a different
  // subscription than the row records (a superseded plan being disabled after
  // a change) must not touch the row.
  if (
    eventSubscriptionCode &&
    target.provider_subscription_id &&
    eventSubscriptionCode !== target.provider_subscription_id &&
    (event === "subscription.disable" || event === "subscription.not_renew" || event === "invoice.payment_failed")
  ) {
    console.error(`${event} for superseded school subscription ${eventSubscriptionCode}; row keeps ${target.provider_subscription_id}`);
    return;
  }

  let values: Record<string, unknown>;
  switch (event) {
    case "invoice.payment_failed":
      values = { status: "past_due" };
      break;
    case "subscription.disable": {
      const stillPaidFor = target.current_period_end ? Date.parse(target.current_period_end) > Date.now() : false;
      values = stillPaidFor ? { cancel_at_period_end: true } : { status: "canceled", cancel_at_period_end: false };
      break;
    }
    case "subscription.not_renew":
      values = { cancel_at_period_end: true };
      break;
    case "refund.processed":
      values = { status: "canceled", refunded_at: new Date().toISOString() };
      break;
    case "charge.dispute.create":
      values = { disputed_at: new Date().toISOString() };
      break;
  }
  const { error } = await admin.from("school_subscriptions").update(values).eq("id", target.id);
  if (error) throw new SchoolBillingError(`school ${event} failed: ${error.message}`);
}
