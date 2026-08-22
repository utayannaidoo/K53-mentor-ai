"use client";

/**
 * Product analytics (PostHog), fully gated by NEXT_PUBLIC_POSTHOG_KEY —
 * without it every call is a no-op, so demo/dev deployments send nothing.
 *
 * posthog-js is loaded DYNAMICALLY, and that is load-bearing: statically it
 * cost ~60KB gzipped inside the chunk shared by every route on the site —
 * paid by every visitor on SA mobile data before this page's first question,
 * including the marketing pages whose whole job is to load fast on a weak
 * signal. Now the library is fetched after hydration, off the critical path,
 * and not at all when unconfigured.
 *
 * The public API stays synchronous: callers keep writing plain `track(...)`.
 * Calls that land before the library has loaded are buffered (in call order)
 * and flushed on load, so nothing fired during first paint is lost — the
 * diagnostic-start event a learner triggers 300ms into the session still
 * arrives. Ordering holds because `.then` callbacks on one promise resolve in
 * registration order.
 *
 * Pageviews are captured manually (App Router route changes don't reload).
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// Must match the region the PostHog project was created in — a project on
// eu.i.posthog.com receiving events at the US host drops them silently, with
// no error anywhere. Set NEXT_PUBLIC_POSTHOG_HOST explicitly in production
// rather than relying on this fallback.
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type PostHog = typeof import("posthog-js").default;

let instance: PostHog | null = null;
let loading: Promise<void> | null = null;
/** Ops captured before init finished; flushed in order once it has. */
let buffer: Array<(ph: PostHog) => void> = [];
/** Buffered ops are non-critical telemetry — never let the queue grow unbounded. */
const BUFFER_CAP = 100;

function load(): Promise<void> {
  if (!loading) {
    loading = import("posthog-js")
      .then((m) => {
        const ph = m.default;
        ph.init(KEY!, {
          api_host: HOST,
          capture_pageview: false, // manual — see trackPageview
          capture_pageleave: true,
          autocapture: false, // explicit events only; keeps payloads and noise down
          persistence: "localStorage",
        });
        return ph;
      })
      .then((ph) => {
        instance = ph;
        const ops = buffer;
        buffer = [];
        for (const op of ops) {
          try {
            op(ph);
          } catch {
            /* one bad event must not kill the flush */
          }
        }
      })
      // Analytics is never allowed to break the app — an ad-blocker or a
      // failed chunk fetch just means no telemetry this page load.
      .catch(() => {});
  }
  return loading;
}

function run(op: (ph: PostHog) => void): void {
  if (!KEY || typeof window === "undefined") return;
  if (instance) {
    op(instance);
    return;
  }
  if (buffer.length < BUFFER_CAP) buffer.push(op);
  void load();
}

/** Boots PostHog (no-op without a key). Called by AnalyticsProvider on mount. */
export function initAnalytics(): void {
  if (!KEY || typeof window === "undefined") return;
  void load();
}

export function trackPageview(path: string): void {
  // Resolve the URL now: a buffered pageview must describe where the learner
  // was when it fired, not where they are when the flush happens.
  const url = window.location.origin + path;
  run((ph) => ph.capture("$pageview", { $current_url: url }));
}

export type AnalyticsEvent =
  | "signup_completed"
  | "diagnostic_completed"
  | "trial_end_shown"
  | "checkout_started"
  | "plan_activated"
  | "payment_return_unverified"
  /**
   * The other end of `plan_activated`. Without it the funnel could show people
   * arriving and never show them leaving, so retention was unanswerable — you
   * could count subscribers but not how long they stayed. `refunded` separates
   * a money-back cancellation inside the 7-day window from someone leaving
   * months later; those are different problems wearing the same event name.
   */
  | "subscription_cancelled"
  | "mock_completed"
  | "drill_started"
  | "drill_completed"
  /**
   * Tutor events. `provider` on tutor_message_sent is the load-bearing one:
   * when a provider is down or out of credit the cascade falls through to the
   * local explainer and the learner is served the lesser product without
   * anything erroring. A breakdown by provider is the only place that shows
   * up — and, because the fallback costs roughly nine times DeepSeek, it is
   * also the cheapest margin alarm available.
   */
  | "tutor_message_sent"
  | "tutor_cap_hit"
  | "tutor_topup_shown"
  | "tutor_topup_completed"
  | "tts_used"
  | "referral_link_copied"
  | "share_card_shared"
  | "share_card_downloaded"
  | "share_text_copied"
  | "guided_step_completed"
  | "guided_paywall_shown"
  | "paywall_viewed"
  | "paywall_cta_clicked"
  | "landing_preview_interacted";

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>): void {
  run((ph) => ph.capture(event, props));
}

/**
 * Send an exception to PostHog's error tracking, which groups repeats into one
 * issue and can alert on a spike.
 *
 * This runs alongside the POST to /api/log rather than replacing it: the log
 * line is the only report that still works when analytics is unconfigured or
 * blocked, and ad blockers drop a meaningful share of PostHog traffic on SA
 * mobile. Two sinks, neither load-bearing on its own.
 */
export function captureException(error: Error, props?: Record<string, string>): void {
  run((ph) => ph.captureException(error, props));
}

/** Tie events to the account (called after sign-in). */
export function identify(userId: string, props?: Record<string, string>): void {
  run((ph) => ph.identify(userId, props));
}
