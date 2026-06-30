// ─────────────────────────────────────────────────────────────
// K53 Mentor AI — domain model
// Single source of truth for the shapes used across UI, store and API.
// These mirror the Supabase schema in /supabase/migrations.
// ─────────────────────────────────────────────────────────────

/** SA vehicle / licence codes. A1 = light motorcycle (≤125cc), A = motorcycle. */
export type VehicleCode = "8" | "10" | "14" | "A1" | "A";

/**
 * The two subscription tracks. Car = code 8; Bike+Heavy bundles the motorcycle
 * codes (A1/A) with the heavy codes (10/14). Chosen at subscription, it gates
 * which codes onboarding offers.
 */
export type VehicleClass = "car" | "bike_heavy";

/** What the learner is working toward. */
export type LicenceGoal = "learners" | "drivers" | "both";

/** Test scope a piece of content belongs to. */
export type Scope = "learners" | "drivers";

/** The seven diagnostic categories. */
export type CategoryId =
  | "signs"
  | "rules"
  | "controls"
  | "intersections"
  | "parking"
  | "following_distance"
  | "hazard_awareness";

export type SubscriptionTier = "free" | "premium" | "premium_plus";

export type Difficulty = 1 | 2 | 3;

/** Keys for the inline SVG road-sign glyphs. */
export type SignKey =
  | "stop"
  | "yield"
  | "no_entry"
  | "no_overtaking"
  | "speed_60"
  | "speed_120"
  | "pedestrian"
  | "traffic_circle"
  | "t_junction"
  | "robot"
  | "railway"
  | "no_stopping";

/** Top-level groupings of the official SA road-sign catalogue. */
export type SignCategory =
  | "regulatory"
  | "warning"
  | "information"
  | "guidance"
  | "marking";

/**
 * A real road sign extracted from the official K53 manual. Images live under
 * /public/signs and are produced by scripts/extract_signs.py.
 */
export interface RoadSign {
  id: string;
  category: SignCategory;
  subcategory: string;
  name: string;
  meaning: string;
  /** Public path to the rendered PNG, e.g. "/signs/regulatory/regulatory-006-01.png". */
  image: string;
  page: number;
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  description: string;
  scope: Scope;
  /** lucide-react icon name handled by CategoryIcon. */
  icon: string;
}

export interface Question {
  id: string;
  categoryId: CategoryId;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
  scope: Scope;
  sign?: SignKey;
  /** Real road-sign image path (preferred over `sign` glyph). */
  image?: string;
  /** Vehicle codes this item is specific to. Omitted = applies to all codes. */
  codes?: VehicleCode[];
}

export interface Flashcard {
  id: string;
  categoryId: CategoryId;
  front: string;
  back: string;
  difficulty: Difficulty;
  sign?: SignKey;
  /** Real road-sign image path (preferred over `sign` glyph). */
  image?: string;
  /** Vehicle codes this item is specific to. Omitted = applies to all codes. */
  codes?: VehicleCode[];
}

export interface ScenarioChoice {
  id: string;
  text: string;
  correct: boolean;
  consequence: string;
}

export interface Scenario {
  id: string;
  categoryId: CategoryId;
  title: string;
  situation: string;
  prompt: string;
  choices: ScenarioChoice[];
  debrief: string;
  sign?: SignKey;
  /** Real road-sign image path (preferred over `sign` glyph). */
  image?: string;
  /** Vehicle codes this item is specific to. Omitted = applies to all codes. */
  codes?: VehicleCode[];
}

export interface DriverStep {
  n: number;
  title: string;
  instruction: string;
  tip?: string;
}

export interface DriverModule {
  id: string;
  name: string;
  summary: string;
  difficulty: Difficulty;
  estMinutes: number;
  steps: DriverStep[];
  commonFaults: string[];
  /** Which vehicle group the module is for. Omitted = car. */
  group?: "car" | "motorcycle" | "heavy";
}

// ── Spaced repetition ────────────────────────────────────────

export type SrsRating = "again" | "hard" | "good" | "easy";

export interface CardState {
  cardId: string;
  reps: number;
  lapses: number;
  ease: number; // SM-2 ease factor (>= 1.3)
  intervalDays: number;
  due: string; // ISO date
  lastReviewed: string | null;
  mastery: number; // derived 0–100
}

// ── User progress ────────────────────────────────────────────

export type StudyContext = "diagnostic" | "practice" | "mock";

export interface QuestionAttempt {
  id: string;
  questionId: string;
  categoryId: CategoryId;
  correct: boolean;
  selectedIndex: number;
  at: string;
  context: StudyContext;
}

export interface CategoryScore {
  correct: number;
  total: number;
  score: number; // 0–100
}

export interface DiagnosticResult {
  id: string;
  at: string;
  readiness: number; // 0–100
  passProbability: number; // 0–100
  total: number;
  correct: number;
  perCategory: Partial<Record<CategoryId, CategoryScore>>;
  weakCategories: CategoryId[];
  strongCategories: CategoryId[];
}

export interface ScenarioAttempt {
  id: string;
  scenarioId: string;
  categoryId: CategoryId;
  choiceId: string;
  correct: boolean;
  at: string;
}

export interface MockExamAttempt {
  id: string;
  at: string;
  score: number; // correct count
  total: number;
  passed: boolean;
  perCategory: Partial<Record<CategoryId, CategoryScore>>;
  durationSeconds: number;
}

export type SessionType =
  | "diagnostic"
  | "flashcards"
  | "questions"
  | "scenarios"
  | "mock"
  | "tutor"
  | "driver";

export interface StudySession {
  id: string;
  type: SessionType;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastStudyDate: string | null; // yyyy-mm-dd
  freezesRemaining: number;
  freezeRefreshedWeek: string | null;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;
export type KnowledgeLevel = "beginner" | "some" | "confident";
export type StudyFrequency = "casual" | "steady" | "intense";

export interface OnboardingData {
  goal: LicenceGoal;
  vehicleCode: VehicleCode;
  testDate: string | null; // ISO date or null ("not booked")
  confidence: ConfidenceLevel;
  knowledgeLevel: KnowledgeLevel;
  studyFrequency: StudyFrequency;
  priorAttempts: number;
  completedAt: string;
}

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  model?: string;
}

export interface TutorThread {
  id: string;
  title: string;
  contextLabel: string | null; // e.g. "Question · Following distance"
  contextQuestionId: string | null;
  messages: TutorMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyUsage {
  date: string; // yyyy-mm-dd
  flashcards: number;
  questions: number;
  tutor: number;
  scenarios: number;
}

/** The complete persisted user blob (localStorage in demo, Supabase rows in prod). */
export interface UserState {
  version: number;
  profile: Profile | null;
  onboarding: OnboardingData | null;
  tier: SubscriptionTier;
  /** Subscription track (car vs bike+heavy). null until a plan/track is chosen. */
  vehicleClass: VehicleClass | null;
  diagnostics: DiagnosticResult[];
  cardStates: Record<string, CardState>;
  attempts: QuestionAttempt[];
  scenarioAttempts: ScenarioAttempt[];
  mockExams: MockExamAttempt[];
  sessions: StudySession[];
  streak: Streak;
  driverProgress: Record<string, number[]>; // moduleId -> completed step numbers
  tutorThreads: TutorThread[];
  dailyUsage: Record<string, DailyUsage>;
  readinessHistory: { date: string; readiness: number }[];
}
