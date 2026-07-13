export const APP_NAME = "K53 Mentor AI";
export const APP_SHORT = "K53 Mentor";
export const APP_TAGLINE =
  "Pass your licence faster with an AI coach that knows exactly what you need to study.";
export const APP_DESCRIPTION =
  "K53 Mentor AI diagnoses your weak spots in minutes, then builds a personalised, spaced-repetition study plan for the South African learner's and driver's licence tests — not just another question bank.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** National first-time pass-rate figure used as the core marketing hook. */
export const PASS_RATE_NOW = 40;
export const PASS_RATE_BEFORE = 68;

/**
 * Official learner's licence test format (per the K53 manual, p4).
 * 64 questions across three sections — you must reach the pass mark in EACH
 * section as well as overall.
 */
export const EXAM_FORMAT = {
  totalQuestions: 64,
  passMark: 51, // 23 + 22 + 6
  // Per-section minimums on the real learner's test.
  sections: {
    controls: { questions: 8, pass: 6 },
    signs: { questions: 28, pass: 23 },
    rules: { questions: 28, pass: 22 },
  },
} as const;

// Interim support/refund inbox until a branded address is set up.
export const SUPPORT_EMAIL = "utayan.naidoo@gmail.com";
