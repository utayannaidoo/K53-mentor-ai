import { SITE_URL } from "@/lib/constants";
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
}

const BRAND = "#2C5F4F";

/**
 * Which footer note to show. Reminder emails carry the reminders opt-out;
 * transactional ones (receipts, dunning, security) get a neutral service note
 * instead — the opt-out line would be wrong (and phishy) on those.
 */
type FooterKind = "reminders" | "transactional";

function footerHtml(kind: FooterKind): string {
  const style = 'style="font-size:12px;color:#8a938e;margin:18px 4px 0;line-height:1.5;"';
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

function wrap(
  bodyHtml: string,
  ctaLabel: string,
  ctaPath: string,
  footer: FooterKind = "reminders",
): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f6f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
      <p style="font-size:15px;font-weight:700;color:${BRAND};margin:0 0 20px;">K53 Mentor AI</p>
      <div style="background:#ffffff;border-radius:14px;padding:28px;border:1px solid #e4e7e5;">
        ${bodyHtml}
        <a href="${SITE_URL}${ctaPath}"
           style="display:inline-block;margin-top:20px;background:${BRAND};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:10px;">
          ${ctaLabel}
        </a>
      </div>
      ${footerHtml(footer)}
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

/** Receipt + welcome, sent by the Paystack webhook on a successful charge. */
export function buildPaymentReceiptEmail(input: {
  firstName: string;
  planName: string;
  amountZar: number;
}): EmailContent {
  const name = esc(input.firstName) || "there";
  const plan = esc(input.planName);
  const amount = `R ${input.amountZar.toFixed(2).replace(/\.00$/, "")}`;
  const subject = `Payment received — ${input.planName} is active`;
  const text =
    `Hi ${input.firstName || "there"} — we've received your ${amount} payment and your ${input.planName} plan is now active. ` +
    `Your study plan, mock exams and AI tutor are unlocked.\n\nStart studying: ${SITE_URL}/dashboard\n\n` +
    `Manage or cancel any time: ${SITE_URL}/account/billing`;
  const html = wrap(
    h("Payment received — you're all set") +
      p(`Hi ${name} — we've received your <strong>${amount}</strong> payment and your <strong>${plan}</strong> plan is now active.`) +
      p("Your personalised study plan, full mock exams and AI tutor are unlocked. See you on the road.") +
      p(`<span style="color:#8a938e;font-size:12px;">Manage or cancel any time from your <a href="${SITE_URL}/account/billing" style="color:#8a938e;">billing page</a>.</span>`),
    "Start studying",
    "/dashboard",
    "transactional",
  );
  return { subject, html, text };
}

/** Dunning nudge, sent when a subscription renewal charge fails. */
export function buildPaymentFailedEmail(input: { firstName: string; planName: string }): EmailContent {
  const name = esc(input.firstName) || "there";
  const plan = esc(input.planName);
  const subject = "Your K53 Mentor payment didn't go through";
  const text =
    `Hi ${input.firstName || "there"} — the renewal payment for your ${input.planName} plan didn't go through. ` +
    `No stress: your plan is still active while we retry. If your card details changed, cancel and resubscribe with the new card.\n\n` +
    `Billing: ${SITE_URL}/account/billing`;
  const html = wrap(
    h("Your renewal payment didn't go through") +
      p(`Hi ${name} — the renewal for your <strong>${plan}</strong> plan failed, usually a card that expired or changed.`) +
      p("Your plan stays active while the payment is retried. If your card details changed, the quickest fix is to cancel and resubscribe with the new card."),
    "Fix my billing",
    "/account/billing",
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

export function buildEmail(type: NotificationType, input: TemplateInput): EmailContent {
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
