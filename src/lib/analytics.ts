"use client";

import posthog from "posthog-js";

/**
 * Product analytics (PostHog), fully gated by NEXT_PUBLIC_POSTHOG_KEY —
 * without it every call is a no-op, so demo/dev deployments send nothing.
 * Pageviews are captured manually (App Router route changes don't reload),
 * and events are named here so the vocabulary stays small and greppable.
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// Must match the region the PostHog project was created in — a project on
// eu.i.posthog.com receiving events at the US host drops them silently, with
// no error anywhere. Set NEXT_PUBLIC_POSTHOG_HOST explicitly in production
// rather than relying on this fallback.
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;

export function initAnalytics(): void {
  if (!KEY || initialized || typeof window === "undefined") return;
  initialized = true;
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // manual — see trackPageview
    capture_pageleave: true,
    autocapture: false, // explicit events only; keeps payloads and noise down
    persistence: "localStorage",
  });
}

export function trackPageview(path: string): void {
  if (!KEY || !initialized) return;
  posthog.capture("$pageview", { $current_url: window.location.origin + path });
}

export type AnalyticsEvent =
  | "signup_completed"
  | "diagnostic_completed"
  | "trial_end_shown"
  | "checkout_started"
  | "plan_activated"
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
  if (!KEY || !initialized) return;
  posthog.capture(event, props);
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
  if (!KEY || !initialized) return;
  posthog.captureException(error, props);
}

/** Tie events to the account (called after sign-in). */
export function identify(userId: string, props?: Record<string, string>): void {
  if (!KEY || !initialized) return;
  posthog.identify(userId, props);
}
