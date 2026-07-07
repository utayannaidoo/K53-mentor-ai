"use client";

import posthog from "posthog-js";

/**
 * Product analytics (PostHog), fully gated by NEXT_PUBLIC_POSTHOG_KEY —
 * without it every call is a no-op, so demo/dev deployments send nothing.
 * Pageviews are captured manually (App Router route changes don't reload),
 * and events are named here so the vocabulary stays small and greppable.
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
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
  | "mock_completed"
  | "referral_link_copied";

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>): void {
  if (!KEY || !initialized) return;
  posthog.capture(event, props);
}

/** Tie events to the account (called after sign-in). */
export function identify(userId: string, props?: Record<string, string>): void {
  if (!KEY || !initialized) return;
  posthog.identify(userId, props);
}
