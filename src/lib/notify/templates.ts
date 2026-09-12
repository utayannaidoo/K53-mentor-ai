import { SITE_URL } from "@/lib/constants";
import { PLAN_MAP } from "@/lib/billing/plans";
import { categoryName } from "@/lib/content/categories";
import type { CategoryId } from "@/types";
import { pluralize } from "@/lib/utils";

/**
 * Email copy for the study-nudge notifications. Tone rules: specific, warm,
 * never shaming — the point is a low-friction way back in, not guilt.
 */

export type NotificationType = "streak_risk" | "due_review" | "dormant_3d" | "dormant_7d";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

interface TemplateInput {
  firstName: string;
  streak: number;
  longest: number;
  dueCards: number;
  /** Whole days until the learner's test (SAST calendar), when one is booked. */
  daysToTest?: number | null;
}

/**
 * The learner's own deadline is the most honest urgency a nudge can carry —
 * more motivating than any streak, and true. Shown only while the test is
 * close enough to act on; a date that has passed or sits months out says
 * nothing useful.
 */
function testCountdown(days: number | null | undefined): string | null {
  if (days == null || !Number.isFinite(days) || days < 0 || days > 60) return null;
  if (days === 0) return "Your test is today — a quick review now is worth it.";
  return `${days} ${pluralize(days, "day")} to your test.`;
}

const BRAND = "#2C5F4F";

/**
 * Which footer note to show. Reminder emails carry the reminders opt-out;
 * transactional ones (receipts, dunning, security) get a neutral service note
 * instead — the opt-out line would be wrong (and phishy) on those.
 */
type FooterKind = "reminders" | "transactional" | "lead";

function footerHtml(kind: FooterKind, unsubscribeUrl?: string | null): string {
  const style = 'style="font-size:12px;color:#8a938e;margin:18px 4px 0;line-height:1.5;"';
  if (kind === "lead") {
    // No account, so no preferences page to point at: the opt-out has to be
    // in the mail itself.
    return `<p ${style}>
        You asked us to email your K53 plan. ${
          unsubscribeUrl
            ? `<a href="${unsubscribeUrl}" style="color:#8a938e;">Unsubscribe</a> and we'll stop.`
            : `Reply with "stop" and we'll take you off.`
        }
      </p>`;
  }
  if (kind === "transactional") {
    return `<p ${style}>
        This is a service email about your K53 Mentor AI account. Manage your account
        <a href="${SITE_URL}/account" style="color:#8a938e;">here</a>.
      </p>`;
  }
  return `<p ${style}>
        You're getting study reminders because they're on in your
        <a href="${SITE_URL}/account" style="color:#8a938e;">account preferences</a> — switch them off there any time.
      </p>`;
}

/**
 * `ctaPath` is normally an in-app path ("/dashboard") and gets SITE_URL
 * prefixed. One email — the dunning nudge — needs to point at Paystack's hosted
 * card-update page instead, so an absolute `https://` URL is passed through
 * untouched. Without this, the prefix would silently produce
 * `https://k53mentorai.co.zahttps://paystack.com/…` in the one email whose
 * whole purpose is that link.
 */
function ctaHref(ctaPath: string): string {
  return /^https?:\/\//i.test(ctaPath) ? ctaPath : `${SITE_URL}${ctaPath}`;
}

function wrap(
  bodyHtml: string,
  ctaLabel: string,
  ctaPath: string,
  footer: FooterKind = "reminders",
  unsubscribeUrl?: string | null,
): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f6f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
      <p style="font-size:15px;font-weight:700;color:${BRAND};margin:0 0 20px;">K53 Mentor AI</p>
      <div style="background:#ffffff;border-radius:14px;padding:28px;border:1px solid #e4e7e5;">
        ${bodyHtml}
        <a href="${ctaHref(ctaPath)}"
           style="display:inline-block;margin-top:20px;background:${BRAND};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:10px;">
          ${ctaLabel}
        </a>
      </div>
      ${footerHtml(footer, unsubscribeUrl)}
    </div>
  </body>
</html>`;
}

/** Escape user-controlled values before they land in email HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function p(text: string): string {
  return `<p style="font-size:14px;line-height:1.6;color:#33403a;margin:0 0 8px;">${text}</p>`;
}

function h(text: string): string {
  return `<p style="font-size:18px;font-weight:700;color:#1d2724;margin:0 0 12px;">${text}</p>`;
}

/** "3 September 2026", or null when there is no usable date. */
function longDate(iso?: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Receipt + welcome, sent by the Paystack webhook on a successful charge.
 *
 * Names the renewal explicitly. A subscription that renews without ever having
 * said so is the classic complaint, and the receipt is the one message everyone
 * opens — so it is where the recurring nature belongs, alongside the amount.
 */
export function buildPaymentReceiptEmail(input: {
  firstName: string;
  planName: string;
  amountZar: number;
  /** Next charge date, when Paystack told us one. */
  renewsOn?: string | null;
}): EmailContent {
  const name = esc(input.firstName) || "there";
  const plan = esc(input.planName);
  const amount = `R ${input.amountZar.toFixed(2).replace(/\.00$/, "")}`;
  const renews = longDate(input.renewsOn);
  const renewLine = renews
    ? `This plan renews automatically on ${renews} at ${amount}, until you cancel.`
    : `This plan renews automatically until you cancel.`;
  const subject = `Payment received — ${input.planName} is active`;
  const text =
    `Hi ${input.firstName || "there"} — we've received your ${amount} payment and your ${input.planName} plan is now active. ` +
    `Your study plan, mock exams and AI tutor are unlocked.\n\n` +
    `${renewLine} Cancel any time and you keep access to the end of the period you've paid for.\n\n` +
    `Start studying: ${SITE_URL}/dashboard\n\nManage or cancel: ${SITE_URL}/account/billing`;
  const html = wrap(
    h("Payment received — you're all set") +
      p(`Hi ${name} — we've received your <strong>${amount}</strong> payment and your <strong>${plan}</strong> plan is now active.`) +
      p("Your personalised study plan, full mock exams and AI tutor are unlocked. See you on the road.") +
      p(`${esc(renewLine)} Cancel any time and you keep access to the end of the period you&rsquo;ve paid for.`) +
      p(`<span style="color:#8a938e;font-size:12px;">Manage or cancel from your <a href="${SITE_URL}/account/billing" style="color:#8a938e;">billing page</a>.</span>`),
    "Start studying",
    "/dashboard",
    "transactional",
  );
  return { subject, html, text };
}

/**
 * What a lapsed or cancelled account still gets each day, in words. Read from
 * the plan definition so an email can never quote a number the app no longer
 * honours.
 */
function freeFloor(): string {
  const floor = PLAN_MAP.free.limits.afterTrial;
  if (!floor) return "nothing";
  return `${floor.questions} ${pluralize(floor.questions, "question")} and ${floor.flashcards} ${pluralize(floor.flashcards, "flashcard")} a day`;
}

/**
 * Sent a few days before a cancelled subscription's paid period runs out.
 *
 * This is the one warning someone gets that access is about to stop, and it
 * names exactly what they keep and what they lose. The seven-day free
 * week is anchored to signup and long spent by now, but a small daily
 * allowance (PlanLimits.afterTrial) survives it, so this says "you drop to
 * N a day" rather than "you'll move to our Free plan", which would imply
 * the paid loop continues.
 */
export function buildSubscriptionEndingEmail(input: {
  firstName: string;
  planName: string;
  endsOn: string;
  daysLeft: number;
}): EmailContent {
  const name = esc(input.firstName) || "there";
  const plan = esc(input.planName);
  const when = longDate(input.endsOn) ?? "shortly";
  const days = input.daysLeft;
  const dayPhrase = days <= 1 ? "tomorrow" : `in ${days} days`;
  const subject = `Your ${input.planName} access ends ${dayPhrase}`;
  const text =
    `Hi ${input.firstName || "there"} — your ${input.planName} plan was cancelled and your access ends on ${when}.\n\n` +
    `Nothing has been charged and nothing will be. When it ends you drop to the free daily allowance, ` +
    `${freeFloor()}, and mock exams, scenarios and the AI tutor stop.

` +
    `If you're still working towards your test, resubscribing before ${when} keeps everything going without a gap. ` +
    `Your progress, streak and readiness score are safe either way.\n\n` +
    `Resubscribe: ${SITE_URL}/account/billing`;
  const html = wrap(
    h(`Your access ends ${esc(dayPhrase)}`) +
      p(`Hi ${name} — your <strong>${plan}</strong> plan was cancelled, and your access ends on <strong>${esc(when)}</strong>.`) +
      p(`Nothing has been charged and nothing will be. When it ends you drop to the free daily allowance, ${esc(freeFloor())}, and mock exams, scenarios and the AI tutor stop on that date.`) +
      p("If you're still working towards your test, resubscribing before then keeps everything running without a gap. Your progress, streak and readiness score are safe either way.") ,
    "Resubscribe",
    "/account/billing",
    "transactional",
  );
  return { subject, html, text };
}

/**
 * Welcome, sent once when an account is first confirmed.
 *
 * Free signups previously got nothing — the only welcome in the system was
 * bundled into the payment receipt, so the people still deciding whether to pay
 * were the ones who heard from us least. This is also the email that sets the
 * expectation the whole product rests on: ten minutes a day, not cramming.
 *
 * Deliberately not a sales pitch. It names the free week honestly, including
 * that it ends, and points at the one action worth taking first. The upgrade
 * argument is the product working, not this email.
 */
export function buildWelcomeEmail(input: {
  firstName: string;
  trialDays: number;
}): EmailContent {
  const name = esc(input.firstName) || "there";
  const days = input.trialDays;
  const subject = "Welcome to K53 Mentor AI — start with the diagnostic";
  const text =
    `Hi ${input.firstName || "there"} — welcome aboard.\n\n` +
    `Start with the diagnostic. It takes about five minutes and works out which topics ` +
    `you're actually weak on, so your daily practice goes there instead of spreading thin.\n\n` +
    `Your free week: full flashcards and questions every day for ${days} days, a mini mock ` +
    `daily, and the AI tutor. It refills each morning and stops after ${days} days.\n\n` +
    `What passes this test is ten minutes a day, not one long cram the night before. ` +
    `The whole app is built around that.\n\nStart here: ${SITE_URL}/dashboard`;
  const html = wrap(
    h("Welcome — let's find what you actually need to study") +
      p(`Hi ${name}, good to have you.`) +
      p(
        "<strong>Start with the diagnostic.</strong> It takes about five minutes and works out which topics you're actually weak on, so your daily practice goes there instead of spreading thin across everything.",
      ) +
      p(
        `Your free week gives you full flashcards and questions every day for ${days} days, a mini mock daily, and the AI tutor. It refills each morning and stops after ${days} days.`,
      ) +
      p(
        "One thing worth knowing: what passes this test is ten minutes a day, not one long cram the night before. The whole app is built around that.",
      ),
    "Start the diagnostic",
    "/dashboard",
    "transactional",
  );
  return { subject, html, text };
}

/**
 * Dunning nudge, sent when a subscription renewal charge fails.
 *
 * `manageUrl` is Paystack's hosted card-update page for this exact
 * subscription. When we can generate it, it goes straight in the email: this
 * message arrives *because* a card needs replacing, so making the reader sign
 * in and find a button first is friction at the worst possible moment. When we
 * can't (Paystack unreachable), the CTA falls back to the billing page, which
 * has the same button behind one more click.
 *
 * It used to say "cancel and resubscribe with the new card" — advice that asked
 * someone whose payment had just failed to give up their subscription first.
 */
export function buildPaymentFailedEmail(input: {
  firstName: string;
  planName: string;
  manageUrl?: string | null;
}): EmailContent {
  const name = esc(input.firstName) || "there";
  const plan = esc(input.planName);
  const subject = "Your K53 Mentor payment didn't go through";
  const fixUrl = input.manageUrl || `${SITE_URL}/account/billing`;
  const text =
    `Hi ${input.firstName || "there"} — the renewal payment for your ${input.planName} plan didn't go through, ` +
    `usually a card that expired or was replaced. No stress: your plan stays active while we retry.\n\n` +
    `Update your card: ${fixUrl}\n\n` +
    `The card form is hosted by Paystack — we never see your card details.`;
  const html = wrap(
    h("Your renewal payment didn't go through") +
      p(`Hi ${name} — the renewal for your <strong>${plan}</strong> plan failed, usually a card that expired or was replaced.`) +
      p("Your plan stays active while the payment is retried. Putting a new card on it takes a minute and nothing else changes — same plan, same price, no gap.") +
      p(`<span style="color:#8a938e;font-size:12px;">The card form is hosted by Paystack; we never see your card details.</span>`),
    "Update my card",
    fixUrl, // absolute Paystack link or the billing page — ctaHref handles both
    "transactional",
  );
  return { subject, html, text };
}

/**
 * Operator alert: Paystack charged an amount the site does not advertise.
 *
 * Goes to SUPPORT_EMAIL, never to a customer. Deliberately plain — this is a
 * page, not marketing, and the person reading it needs the reference and the
 * two numbers, not a hero heading. The buyer already has their tier; what is
 * broken is a Plan amount in the Paystack dashboard, and only a human can fix
 * that.
 */
export function buildPriceMismatchAlertEmail(input: {
  reference: string;
  plan: string;
  cycle: string;
  problem: string;
  expectedCents: number | null;
  actualCents: number | null;
  buyerEmail: string;
}): EmailContent {
  const rand = (c: number | null) => (c === null ? "unknown" : `R ${(c / 100).toFixed(2)}`);
  const subject = `[K53 billing] Price mismatch on ${input.reference}`;
  const lines = [
    `Paystack charged an amount that does not match plans.ts.`,
    ``,
    `Reference:  ${input.reference}`,
    `Plan:       ${input.plan} (${input.cycle})`,
    `Advertised: ${rand(input.expectedCents)}`,
    `Charged:    ${rand(input.actualCents)}`,
    `Buyer:      ${input.buyerEmail}`,
    ``,
    input.problem,
    ``,
    `The tier WAS granted — the buyer paid in good faith and withholding it would`,
    `punish them for our configuration. What needs fixing is the Plan amount in the`,
    `Paystack dashboard, or the price in src/lib/billing/plans.ts, whichever is wrong.`,
    ``,
    `Run scripts/paystack-reconcile.mjs to see every Plan at once.`,
  ];
  const html =
    `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;` +
    `line-height:1.6;color:#1d2724;white-space:pre-wrap;">${esc(lines.join("\n"))}</pre>`;
  return { subject, html, text: lines.join("\n") };
}

/**
 * One-time code to confirm an account deletion. Used by OAuth-only accounts,
 * which have no password to reauthenticate with. `code` is server-generated
 * (digits only) but still escaped, on principle — email HTML never trusts input.
 */
export function buildAccountDeletionCodeEmail(input: {
  firstName: string;
  code: string;
}): EmailContent {
  const name = esc(input.firstName) || "there";
  const code = esc(input.code);
  const subject = "Your account deletion code";
  const text =
    `Hi ${input.firstName || "there"} — your K53 Mentor account deletion code is ${input.code}. ` +
    `It expires in 10 minutes. Enter it on the account page to permanently delete your account. ` +
    `Didn't request this? Ignore this email — nothing will be deleted.`;
  const html = wrap(
    h("Confirm account deletion") +
      p(`Hi ${name} — enter this code on the account page to permanently delete your account:`) +
      `<p style="font-size:30px;font-weight:700;letter-spacing:6px;color:#1d2724;margin:14px 0;">${code}</p>` +
      p(`<span style="color:#8a938e;font-size:12px;">The code expires in 10 minutes. Didn't request this? Ignore this email — nothing will be deleted.</span>`),
    "Go to account",
    "/account",
    "transactional",
  );
  return { subject, html, text };
}

/**
 * Learner confirmation that a queued money-back refund completed. Sent by the
 * retry cron when Paystack finally accepts the reversal — possibly days after
 * the learner cancelled, which is exactly why this email exists: without it
 * the only signal is a line on a bank statement.
 *
 * `amountZar` may be null when Paystack's verify call failed; the copy still
 * works, it just can't name the figure.
 */
export function buildRefundProcessedEmail(input: {
  firstName: string;
  amountZar: number | null;
}): EmailContent {
  const name = esc(input.firstName) || "there";
  const amount =
    input.amountZar === null ? null : `R ${input.amountZar.toFixed(2).replace(/\.00$/, "")}`;
  const subject = "Your refund has been processed";
  const text =
    `Hi ${input.firstName || "there"} — good news: ${amount ? `your ${amount} refund` : "your refund"} has been processed and is on its way back to your card. ` +
    `Banks typically take 5–10 business days to show it on your statement.\n\n` +
    `Nothing further is needed from you, and your study progress stays exactly where it was.\n\n` +
    `Manage your plan any time: ${SITE_URL}/account/billing`;
  const html = wrap(
    h("Refund processed") +
      p(`Hi ${name} — ${amount ? `your <strong>${amount}</strong> refund` : "your refund"} has been processed and is on its way back to your card.`) +
      p("Banks typically take 5–10 business days to show it on your statement. Nothing further is needed from you, and your progress stays exactly where it was."),
    "Go to billing",
    "/account/billing",
    "transactional",
  );
  return { subject, html, text };
}

/**
 * Operator alert: a queued money-back refund exhausted its retries.
 *
 * Goes to SUPPORT_EMAIL, never to a customer — same plain style as the price
 * mismatch alert. The learner's money is owed; only a human can issue it from
 * the Paystack dashboard once the balance covers it.
 */
export function buildQueuedRefundAlertEmail(input: {
  reference: string;
  userId: string;
  attempts: number;
  lastError: string | null;
}): EmailContent {
  const subject = `[K53 billing] Queued refund gave up: ${input.reference}`;
  const lines = [
    `A money-back refund could not be completed automatically.`,
    ``,
    `Reference:  ${input.reference}`,
    `User:       ${input.userId}`,
    `Attempts:   ${input.attempts}`,
    `Last error: ${input.lastError ?? "(none recorded)"}`,
    ``,
    `The learner cancelled inside the 7-day window and was told their refund`,
    `is processing. It isn't going through on its own — issue it manually from`,
    `the Paystack dashboard (Transactions → the charge → Refund) once the`,
    `balance covers it, then mark the pending_refunds row 'refunded'.`,
  ];
  const html =
    `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;` +
    `line-height:1.6;color:#1d2724;white-space:pre-wrap;">${esc(lines.join("\n"))}</pre>`;
  return { subject, html, text: lines.join("\n") };
}

/**
 * Operator alert: a learner cancelled their plan.
 *
 * Goes to SUPPORT_EMAIL on EVERY self-serve cancellation — this is the churn
 * signal, not a task list. Billing and any money-back refund are already
 * handled automatically by the cancel route and the retry cron; the one case
 * that DOES need a human arrives as a separate "Queued refund gave up" alert.
 */
export function buildCancellationAlertEmail(input: {
  userEmail: string;
  userId: string;
  plan: string;
  outcome: string;
  daysActive: number | null;
  reference?: string | null;
  accessUntil?: string | null;
}): EmailContent {
  const subject = `[K53 billing] Cancellation: ${input.plan} — ${input.userEmail}`;
  const lines = [
    `A learner cancelled their plan.`,
    ``,
    `Learner:     ${input.userEmail} (${input.userId})`,
    `Plan:        ${input.plan}`,
    `Outcome:     ${input.outcome}`,
    ...(input.reference ? [`Reference:   ${input.reference}`] : []),
    ...(input.accessUntil ? [`Access until: ${input.accessUntil}`] : []),
    `Days active: ${input.daysActive ?? "unknown"}`,
    ``,
    `Billing is already stopped at Paystack and any money-back refund is handled`,
    `automatically. No action needed unless a separate "Queued refund gave up"`,
    `alert follows for the same reference.`,
  ];
  const html =
    `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;` +
    `line-height:1.6;color:#1d2724;white-space:pre-wrap;">${esc(lines.join("\n"))}</pre>`;
  return { subject, html, text: lines.join("\n") };
}

/**
 * Operator alert: a customer opened a payment dispute (chargeback).
 *
 * Goes to SUPPORT_EMAIL, never to a customer. A dispute is decided by Paystack's
 * flow, not ours — the app deliberately does not downgrade on the event; if it
 * resolves against us, refund.processed strips the tier automatically. What a
 * human may be able to change is the OUTCOME: evidence submitted in time.
 */
export function buildDisputeAlertEmail(input: {
  reference: string | null;
  customerCode: string | null;
  customerEmail: string | null;
  amountCents: number | null;
  status: string | null;
}): EmailContent {
  const amount =
    input.amountCents === null ? "unknown" : `R ${(input.amountCents / 100).toFixed(2)}`;
  const subject = `[K53 billing] Chargeback opened${input.reference ? `: ${input.reference}` : ""}`;
  const lines = [
    `A customer opened a payment dispute (chargeback).`,
    ``,
    `Reference:  ${input.reference ?? "(not in payload)"}`,
    `Customer:   ${input.customerEmail ?? "(email unavailable)"} (${input.customerCode ?? "?"})`,
    `Amount:     ${amount}`,
    `Status:     ${input.status ?? "(not stated)"}`,
    ``,
    `Respond with evidence via the Paystack dashboard before its deadline —`,
    `after that the bank decides unopposed. Access is NOT revoked while the`,
    `dispute is open; if it resolves against us, the refund.processed webhook`,
    `downgrades the tier automatically.`,
  ];
  const html =
    `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;` +
    `line-height:1.6;color:#1d2724;white-space:pre-wrap;">${esc(lines.join("\n"))}</pre>`;
  return { subject, html, text: lines.join("\n") };
}

export function buildEmail(type: NotificationType, input: TemplateInput): EmailContent {
  const content = buildNudge(type, input);
  const countdown = testCountdown(input.daysToTest);
  if (!countdown) return content;
  // Appended to every nudge type, above the button in HTML and before the
  // link line in text, so it reads as part of the message.
  return {
    subject: content.subject,
    html: content.html.replace(
      '<a href="',
      `<p style="font-size:14px;line-height:1.6;color:#1d2724;font-weight:600;margin:12px 0 0;">${countdown}</p>\n        <a href="`,
    ),
    text: content.text.replace(/\n\n(?=[^\n]*https?:\/\/[^\n]*$)/, ` ${countdown}\n\n`),
  };
}

function buildNudge(type: NotificationType, input: TemplateInput): EmailContent {
  const { streak, longest, dueCards } = input;
  // The name is profile data the user typed — escape it so a crafted "name"
  // can't inject markup into the email HTML.
  const name = esc(input.firstName) || "there";

  switch (type) {
    case "streak_risk": {
      const subject = `Your ${streak}-day streak ends at midnight 🔥`;
      const text =
        `Hi ${name} — your ${streak}-day study streak is still alive, but only until midnight. ` +
        `Five quiet minutes of flashcards keeps it going.\n\nStudy now: ${SITE_URL}/study/flashcards`;
      const html = wrap(
        h(`Your ${streak}-day streak ends at midnight`) +
          p(`Hi ${name} — you haven't studied yet today, and your ${streak}-day run is on the line.`) +
          p(`Five quiet minutes of flashcards is all it takes to keep it alive.`),
        "Keep my streak",
        "/study/flashcards",
      );
      return { subject, html, text };
    }
    case "due_review": {
      const count = dueCards > 0 ? `${dueCards} ${pluralize(dueCards, "flashcard")}` : "Your flashcards";
      const subject = dueCards > 0 ? `${count} are ready for review` : "Your reviews are ready";
      const text =
        `Hi ${name} — ${count.toLowerCase()} ${dueCards === 1 ? "is" : "are"} due for review. ` +
        `Spaced repetition works because you show up right about now — a few minutes keeps what you've learned from fading.\n\n` +
        `Review now: ${SITE_URL}/study/flashcards`;
      const html = wrap(
        h(`${count} ${dueCards === 1 ? "is" : "are"} ready for review`) +
          p(`Hi ${name} — the timing isn't random: these are due right when you'd start forgetting them.`) +
          p(`A few minutes now locks them in for much longer.`),
        "Review now",
        "/study/flashcards",
      );
      return { subject, html, text };
    }
    case "dormant_3d": {
      const subject = "Your K53 plan is holding your place";
      const text =
        `Hi ${name} — it's been a few days. No stress: your progress is exactly where you left it, ` +
        `and today's plan takes about 10 minutes.\n\nPick it up: ${SITE_URL}/dashboard`;
      const html = wrap(
        h("Your plan is holding your place") +
          p(`Hi ${name} — it's been a few days. No stress: your progress is exactly where you left it.`) +
          p(`Today's plan takes about 10 minutes, and it starts with your weakest area.`),
        "Pick up where I left off",
        "/dashboard",
      );
      return { subject, html, text };
    }
    case "dormant_7d": {
      const bestBit =
        longest > 1 ? ` You've built a ${longest}-day streak before — you can do it again.` : "";
      const subject = "Ready when you are — your K53 progress is safe";
      const text =
        `Hi ${name} — a week away happens to everyone. Everything you learned is still there, ` +
        `and one short session brings it back fast.${bestBit}\n\nEase back in: ${SITE_URL}/dashboard`;
      const html = wrap(
        h("Ready when you are") +
          p(`Hi ${name} — a week away happens to everyone. Everything you learned is still banked.`) +
          p(`One short session brings it back fast.${bestBit}`),
        "Ease back in",
        "/dashboard",
      );
      return { subject, html, text };
    }
  }
}

/**
 * A learner's testimonial, forwarded to SUPPORT_EMAIL for review before it is
 * published anywhere.
 *
 * Deliberately an email rather than a table: nothing about this needs to be
 * queryable, review is a human reading it once, and a new table would need a
 * migration applied by hand in production. Plain and escaped, like the other
 * operator alerts.
 */
export function buildTestimonialEmail(input: {
  quote: string;
  displayName?: string;
  kind: "learners" | "drivers";
  userId: string;
  email: string | null;
}): EmailContent {
  const test = input.kind === "drivers" ? "driver's licence" : "learner's licence";
  const subject = `Testimonial from a ${test} pass`;
  const lines = [
    `A learner who just passed their ${test} agreed to have this published.`,
    ``,
    `Quote: ${input.quote}`,
    `Publish as: ${input.displayName || "(no name given — publish anonymously)"}`,
    `Account: ${input.userId}${input.email ? ` (${input.email})` : ""}`,
    ``,
    `They ticked the consent box on the test-day dialog. Do not publish more`,
    `than the name above, and drop it on request.`,
  ];
  const html =
    `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;` +
    `line-height:1.6;color:#1d2724;white-space:pre-wrap;">${esc(lines.join("\n"))}</pre>`;
  return { subject, html, text: lines.join("\n") };
}

/**
 * The starting-check plan, emailed to a visitor who has not made an account.
 *
 * Their result lives in a browser they may not come back to, so this is the
 * copy of it they keep. It names the weakest sections (the reason the check
 * was worth doing) and offers the account as the thing that keeps the plan
 * going, rather than as a toll gate.
 */
export function buildPlanEmail(input: {
  score: number;
  correct: number;
  total: number;
  weakCategories: CategoryId[];
  unsubscribeUrl: string | null;
}): EmailContent {
  const focus = input.weakCategories.slice(0, 3).map((c) => categoryName(c));
  const first = focus[0];
  const scoreLine = `You scored ${input.correct} of ${input.total} (${input.score}%) on the starting check.`;
  const focusLine = focus.length
    ? `Your weakest areas, worst first: ${focus.join(", ")}.`
    : `You were even across the categories — a full mock is the next useful measurement.`;
  const subject = first ? `Your K53 plan: start with ${first}` : "Your K53 plan";
  const text =
    `${scoreLine}\n\n${focusLine}\n\n` +
    `Ten minutes a day on the weakest area first is what moves a section over its pass mark. ` +
    `A free account keeps this plan, your streak and your readiness score as you go.\n\n` +
    `Pick it up here: ${SITE_URL}/signup`;
  const html = wrap(
    h(first ? `Start with ${esc(first)}` : "Your K53 plan") +
      p(esc(scoreLine)) +
      p(esc(focusLine)) +
      p(
        "Ten minutes a day on the weakest area first is what moves a section over its pass mark. " +
          "A free account keeps this plan, your streak and your readiness score as you go.",
      ),
    "Keep my plan",
    "/signup",
    "lead",
    input.unsubscribeUrl,
  );
  return { subject, html, text };
}
