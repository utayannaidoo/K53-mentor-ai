"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NaviGuide, type NaviGuideStep } from "@/components/onboarding/navi-guide";
import { useStudyStore } from "@/hooks/use-study-store";

/**
 * A route-local part of Navi's first-run tour. The URL flag makes each page
 * responsible for its own targets, so a slow page load cannot highlight the
 * previous route's DOM or require the app shell to know page internals.
 */
export function RouteNavigator({
  tourId,
  label,
  steps,
  currentPath,
  nextPath,
  finishLabel,
  onDismiss,
  onFinish,
}: {
  tourId: string;
  label: string;
  steps: readonly NaviGuideStep[];
  currentPath: string;
  nextPath?: string;
  finishLabel: string;
  onDismiss?: () => void;
  onFinish?: () => void;
}) {
  const router = useRouter();
  const { completeFirstRunTour } = useStudyStore();
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    setActive(new URLSearchParams(window.location.search).get("tour") === "1");
  }, []);

  if (!active) return null;

  function dismiss() {
    setActive(false);
    // Skipping any route closes the whole first-run orientation. Leaving the
    // flag armed would re-open the dashboard tour later and turn "Skip" into a
    // trap; this does not change a paid entitlement or unlock a feature.
    completeFirstRunTour();
    onDismiss?.();
    router.replace(currentPath);
  }

  function finish() {
    setActive(false);
    onFinish?.();
    if (nextPath) router.push(nextPath);
  }

  return (
    <NaviGuide
      steps={steps}
      onDismiss={dismiss}
      onFinish={finish}
      finishLabel={finishLabel}
      label={label}
      tourId={tourId}
    />
  );
}

const TUTOR_STEPS: readonly NaviGuideStep[] = [
  {
    target: "[data-tutorial='tutor-chat-header']",
    eyebrow: "Meet Navi",
    title: "This is your K53 study companion",
    body: "Ask for the why behind a rule, a plain-language explanation, or a worked example. Navi keeps the conversation tied to your study context when you arrive from a question.",
  },
  {
    target: "[data-tutorial='tutor-prompts']",
    eyebrow: "Start easily",
    title: "Use a prompt when you do not know what to ask",
    body: "These quick prompts turn common sticking points into a first message. They are a shortcut, not a different tutor mode.",
  },
  {
    target: "[data-tutorial='tutor-composer']",
    eyebrow: "Ask your way",
    title: "Type your own road question here",
    body: "Describe the rule, sign or situation in your own words. Free includes a small allowance; paid plans keep the full coaching loop open with a larger daily allowance.",
  },
];

export function TutorPageNavigator() {
  return (
    <RouteNavigator
      tourId="tutor"
      label="Navi's AI tutor tour"
      steps={TUTOR_STEPS}
      currentPath="/tutor"
      nextPath="/dashboard/progress?tour=1"
      finishLabel="See my progress"
    />
  );
}

const PROGRESS_STEPS: readonly NaviGuideStep[] = [
  {
    target: "[data-tutorial='progress-verdict']",
    eyebrow: "Read your result",
    title: "Progress explains what your readiness means",
    body: "After the starting check, this page separates the overall verdict from the three K53 section pass marks. Before then, it stays honest and asks you to measure first.",
  },
  {
    target: "[data-tutorial='progress-mastery']",
    eyebrow: "Find the gaps",
    title: "The mastery map turns answers into next steps",
    body: "Each category is grounded in answers you have actually given. Use the map and mistake notebook to decide where another practice session will help most.",
  },
  {
    target: "[data-tutorial='progress-habit']",
    eyebrow: "Build a habit",
    title: "Your study rhythm lives here",
    body: "The heatmap, streak and time studied show the habit behind the score. Free keeps a short recent window; paid plans retain the full history and advanced rhythm insights.",
  },
  {
    target: "[data-tutorial='progress-record']",
    eyebrow: "Keep the evidence",
    title: "Mocks and your Driving Passport complete the picture",
    body: "Mock results show how you perform under pressure, while the shareable passport gives you a compact progress snapshot. Locked history is previewed here and does not unlock until the plan does.",
  },
];

export function ProgressNavigator() {
  return (
    <RouteNavigator
      tourId="progress"
      label="Navi's Progress tour"
      steps={PROGRESS_STEPS}
      currentPath="/dashboard/progress"
      nextPath="/licence-prep?tour=1"
      finishLabel="Preview Licence Prep"
    />
  );
}

const LICENCE_PREP_STEPS: readonly NaviGuideStep[] = [
  {
    target: "[data-tutorial='licence-overview']",
    eyebrow: "Driver's licence",
    title: "This is the yard-test side of your journey",
    body: "Licence Prep is separate from learner's-test practice: it gathers manoeuvres, vehicle-specific checks and the preparation that comes after the learner's licence.",
  },
  {
    target: "[data-tutorial='licence-eye-test']",
    eyebrow: "Know the admin step",
    title: "Try the DLTC-style eye-test screener",
    body: "The eye-test entry explains the tumbling-E check you face before booking. The full interactive screener is part of Premium Plus.",
  },
  {
    target: "[data-tutorial='licence-modules']",
    eyebrow: "Practise the yard",
    title: "Every module is visible before you upgrade",
    body: "Browse the manoeuvres, time estimates and step counts now. On Free, the modules remain a clear preview and their lock sends you to plans; a paid entitlement is required to open the lessons.",
  },
];

export function LicencePrepNavigator() {
  return (
    <RouteNavigator
      tourId="licence-prep"
      label="Navi's Licence Prep tour"
      steps={LICENCE_PREP_STEPS}
      currentPath="/licence-prep"
      nextPath="/account?tour=1"
      finishLabel="Preview Account"
    />
  );
}

const ACCOUNT_STEPS: readonly NaviGuideStep[] = [
  {
    target: "[data-tutorial='account-profile']",
    eyebrow: "Your account",
    title: "Keep your sign-in and identity details here",
    body: "Your name, email and member date are shown here. Your study progress stays attached to this account when you sign in on another device.",
  },
  {
    target: "[data-tutorial='account-plan']",
    eyebrow: "Your plan",
    title: "Manage billing without losing your progress",
    body: "This is where you can compare plans, upgrade and manage an active subscription. Paid access comes from the confirmed server subscription; the tour never unlocks anything by itself.",
  },
  {
    target: "[data-tutorial='account-study-profile']",
    eyebrow: "Keep it relevant",
    title: "Change your goal or licence code any time",
    body: "Your vehicle code is a study preference, not a product tier. Update it here and the questions, controls and licence-prep preview follow it.",
  },
  {
    target: "[data-tutorial='account-preferences']",
    eyebrow: "Make it yours",
    title: "Tune the app for your device",
    body: "Switch theme, turn on data saver, manage offline content and choose email reminders from Preferences. When you are ready, Navi sends you back to Today.",
  },
];

export function AccountNavigator({ onFinish }: { onFinish: () => void }) {
  return (
    <RouteNavigator
      tourId="account"
      label="Navi's Account tour"
      steps={ACCOUNT_STEPS}
      currentPath="/account"
      finishLabel="Finish with Today"
      onFinish={onFinish}
    />
  );
}
