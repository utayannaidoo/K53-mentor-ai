/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE ONE CONFIG
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every duration, every cut point, every beat in the film is derived from this
 * file. Change a scene's length here and the transitions, the audio cue sheet
 * and the composition duration all follow.
 *
 * ── The grid ───────────────────────────────────────────────────────────────
 * 60 fps, 120 BPM. That makes one beat exactly 30 frames and one bar exactly
 * 120 frames. Every scene boundary in the film lands on a bar line, which is
 * why the edit feels locked to the music rather than laid over it.
 *
 *   1 beat  = 30f  = 0.5s
 *   1 bar   = 120f = 2.0s
 *   1 phrase= 480f = 8.0s (4 bars)
 */

export const FPS = 60;
export const BPM = 120;

/** Frames per beat. 60fps ÷ (120bpm ÷ 60s) = 30. */
export const BEAT = 30;
/** Frames per bar (4 beats). */
export const BAR = 120;

/** `beats(3)` → 90 frames. Use in scenes to keep timings on the grid. */
export const beats = (n: number) => Math.round(n * BEAT);
/** `bars(2)` → 240 frames. */
export const bars = (n: number) => Math.round(n * BAR);

/* ───────────────────────────────────────────────────────────────────────────
 * SCENE DURATIONS (raw — before transition overlap is subtracted)
 * ─────────────────────────────────────────────────────────────────────────── */

export const SCENE = {
  /** Act I — Mystery. One line in the dark. 6.2s */
  mystery: 372,
  /** Act II — Problem. Kinetic chaos, then a hard silence. 11.5s */
  problem: 690,
  /** Act III — Reveal. The emotional peak. 10.6s */
  reveal: 636,
  /** Act IV.1 — Diagnostic. 5.8s */
  diagnostic: 348,
  /** Act IV.2 — Weak spots. 5.7s */
  weakSpots: 342,
  /** Act IV.3 — Practice / spaced repetition. 6.0s */
  practice: 360,
  /** Act IV.4 — AI tutor. 5.7s */
  tutor: 342,
  /** Act V — CTA. Everything slows. 9.9s */
  cta: 595,
} as const;

/* ───────────────────────────────────────────────────────────────────────────
 * TRANSITION OVERLAPS
 *
 * Overlap length is a storytelling choice, not a default. Fast cuts inside the
 * problem act; a long dissolve into the silence before the reveal; a slow
 * blur-out into the CTA so the film exhales.
 * ─────────────────────────────────────────────────────────────────────────── */

export const TRANSITION = {
  /** Mystery → Problem. A snap. The line is cut off mid-breath. */
  mysteryToProblem: 18,
  /** Problem → Reveal. The long one. This is the silence. */
  problemToReveal: 45,
  /** Reveal → Diagnostic. Depth push — we fly *into* the card. */
  revealToDiagnostic: 30,
  /** Feature-to-feature. Short enough to keep momentum, long enough to breathe. */
  diagnosticToWeakSpots: 24,
  weakSpotsToPractice: 24,
  practiceToTutor: 24,
  /** Tutor → CTA. The exhale. */
  tutorToCta: 40,
} as const;

const SUM_SCENES =
  SCENE.mystery +
  SCENE.problem +
  SCENE.reveal +
  SCENE.diagnostic +
  SCENE.weakSpots +
  SCENE.practice +
  SCENE.tutor +
  SCENE.cta;

const SUM_TRANSITIONS =
  TRANSITION.mysteryToProblem +
  TRANSITION.problemToReveal +
  TRANSITION.revealToDiagnostic +
  TRANSITION.diagnosticToWeakSpots +
  TRANSITION.weakSpotsToPractice +
  TRANSITION.practiceToTutor +
  TRANSITION.tutorToCta;

/**
 * 3480 frames = 58.0s.
 *
 * `<Composition durationInFrames>` is written as a literal (the Studio can only
 * edit inline metadata), so this constant exists to *check* that literal. If
 * you change a scene length above, the Studio will warn on mount.
 */
export const TOTAL_FRAMES = SUM_SCENES - SUM_TRANSITIONS;

/**
 * Absolute start frame of each scene on the master timeline, after overlap.
 * The audio cue sheet is written against these, so they must stay derived.
 */
export const AT = (() => {
  const mystery = 0;
  const problem = mystery + SCENE.mystery - TRANSITION.mysteryToProblem;
  const reveal = problem + SCENE.problem - TRANSITION.problemToReveal;
  const diagnostic = reveal + SCENE.reveal - TRANSITION.revealToDiagnostic;
  const weakSpots =
    diagnostic + SCENE.diagnostic - TRANSITION.diagnosticToWeakSpots;
  const practice = weakSpots + SCENE.weakSpots - TRANSITION.weakSpotsToPractice;
  const tutor = practice + SCENE.practice - TRANSITION.practiceToTutor;
  const cta = tutor + SCENE.tutor - TRANSITION.tutorToCta;
  return { mystery, problem, reveal, diagnostic, weakSpots, practice, tutor, cta };
})();

/* ───────────────────────────────────────────────────────────────────────────
 * MOTION CHARACTER
 *
 * Four springs, and nothing else. A film reads as one hand when every element
 * accelerates the same way; the moment you have nine bespoke curves it reads as
 * a template. `SPRING.settle` carries roughly 80% of the movement in this film.
 * ─────────────────────────────────────────────────────────────────────────── */

export const SPRING = {
  /** The house curve. Confident arrival, no visible bounce. */
  settle: { damping: 200, mass: 1, stiffness: 100 },
  /** Weighted. For anything large or heavy — panels, the camera, the logo. */
  heavy: { damping: 200, mass: 2.4, stiffness: 92 },
  /** A single degree of overshoot. Press releases, chips, counters landing. */
  snap: { damping: 15, mass: 0.55, stiffness: 190 },
  /** Barely-there overshoot for UI that should feel touched, not thrown. */
  tactile: { damping: 22, mass: 0.4, stiffness: 260 },
} as const;

/**
 * Camera intensity multipliers. Drop `handheld` to 0 for a locked-off render;
 * drop `parallax` for a flat 2D version.
 */
export const CAMERA = {
  handheld: 1,
  parallax: 1,
  /** Global perspective depth in stage units. Lower = more dramatic 3D. */
  perspective: 1600,
} as const;

/**
 * Motion blur is expensive: `samples` extra renders per frame, on the frames
 * that use it. It is armed for three moves in the film (see
 * `docs/ANIMATION.md`) and nowhere else.
 */
export const MOTION_BLUR = {
  enabled: true,
  /** Shutter angle equivalent. 180° is the cinematic default. */
  shutterAngle: 180,
  samples: 8,
} as const;

/** Film grain and atmosphere. Set `grain.opacity` to 0 for a clinical look. */
export const ATMOSPHERE = {
  grain: { opacity: 0.055, scale: 1.6 },
  /**
   * Dither. NOT a stylistic choice — this is what stops 8-bit banding drawing
   * contour rings through every glow in the film. Lower it and the rings come
   * back; h.264 will not save you. Only set to 0 for a 10-bit master.
   */
  dither: 0.045,
  vignette: { strength: 0.62 },
  particles: { count: 46, speed: 1 },
  /** Chromatic fringing on the reveal only. Keep under 2 or it reads as a bug. */
  aberration: 1.4,
} as const;

/* ───────────────────────────────────────────────────────────────────────────
 * COPY
 *
 * Kept here so a rewrite never means hunting through eight scene files, and so
 * the whole script can be read in one place. Every number below is the app's
 * real number — see `src/components/landing/`.
 * ─────────────────────────────────────────────────────────────────────────── */

export const COPY = {
  mystery: "It's not a hard test.",
  problemHook: ["So why do", "6 in 10", "fail it?"],
  problemChaos: ["EVERYTHING", "EQUALLY", "GUESSWORK", "AGAIN"],
  revealLine: "Know exactly where you stand.",
  product: "K53 Mentor AI",
  features: {
    diagnostic: { kicker: "Diagnostic", line: "Fifteen questions. One honest number." },
    weakSpots: { kicker: "Weak spots", line: "It finds what's actually holding you back." },
    practice: { kicker: "Daily plan", line: "Ten minutes. The right ten minutes." },
    tutor: { kicker: "AI Tutor", line: "And when you're stuck, it explains the why." },
  },
  cta: {
    line: "Pass first time.",
    sub: "Start free — no card needed.",
    url: "k53mentorai.co.za",
  },
} as const;

/** Real product data. Sourced from the live landing page, not invented. */
export const DATA = {
  readiness: 78,
  passProbability: 82,
  weekDelta: 6,
  diagnosticQuestions: 15,
  mockQuestions: 68,
  mockToPass: 51,
  categories: 7,
  minutesPerDay: 10,
  breakdown: [
    { label: "Rules of the road", value: 88, tone: "green" },
    { label: "Vehicle controls", value: 81, tone: "green" },
    { label: "Road signs", value: 64, tone: "ochre" },
    { label: "Road markings", value: 59, tone: "ochre" },
  ],
} as const;
