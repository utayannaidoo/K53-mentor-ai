import type { CategoryId } from "@/types";

export const APP_NAME = "K53 Mentor AI";
export const APP_SHORT = "K53 Mentor";
export const APP_TAGLINE =
  "Pass your licence faster with an AI coach that knows exactly what you need to study.";
export const APP_DESCRIPTION =
  "K53 Mentor AI diagnoses your weak spots in minutes, then builds a personalised, spaced-repetition study plan for the South African learner's and driver's licence tests — not just another question bank.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Bare host, for copy that reads as a domain rather than a link — the share
 * card, placeholder addresses. Derived from SITE_URL rather than written out,
 * because the hardcoded version drifted: the share image spent months telling
 * WhatsApp recipients to visit a domain the project does not own.
 * Regex rather than `new URL()` so a malformed env value degrades instead of
 * throwing at module scope in a client bundle.
 */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "").replace(/\/+$/, "");

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

export type ExamSection = keyof typeof EXAM_FORMAT.sections;

/**
 * Which exam section each study category is examined under.
 *
 * Lives beside the exam format rather than in the question sampler, because the
 * readiness model needs it too — a pass probability that ignores the
 * per-section rule is just the overall average wearing a percentage sign.
 */
export const SECTION_OF: Record<CategoryId, ExamSection> = {
  controls: "controls",
  signs: "signs",
  rules: "rules",
  intersections: "rules",
  parking: "rules",
  following_distance: "rules",
  hazard_awareness: "rules",
};

/**
 * Public support/refund inbox, rendered on /contact and /refunds.
 *
 * Interim: a role address rather than a personal one, which is the part that
 * mattered — a learner emailing about a refund should not be mailing someone's
 * name. Swap to `support@k53mentorai.co.za` once Cloudflare Email Routing
 * forwards it (see docs/ops/launch-runbook.md §5); the Gmail stays the
 * destination behind it, so nothing breaks on the day it changes.
 */
export const SUPPORT_EMAIL = "support.k53mentor@gmail.com";

/**
 * Operator details disclosed on /contact.
 *
 * ECTA s43 requires an electronic-commerce provider to publish its legal name,
 * registration number and street address; POPIA s55 requires a named
 * Information Officer to receive access and deletion requests. Both are
 * rendered only when set, so an unfilled field degrades to a shorter page
 * rather than an empty heading — but shipping with them blank means the
 * disclosure obligation is still outstanding.
 */
export const BUSINESS = {
  /** Registered company name, or your full name if trading as a sole proprietor. */
  legalName: "",
  /** CIPC registration number. Omit if trading as a sole proprietor. */
  registrationNumber: "",
  /** Street address — a postal box does not satisfy ECTA s43. */
  address: "",
  /** POPIA s55 Information Officer. Usually the owner for a business this size. */
  informationOfficer: "",
} as const;
