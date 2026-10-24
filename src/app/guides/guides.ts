/**
 * The guide catalogue — one place for the index page, the sitemap, the share
 * cards and each guide's "last updated" line.
 *
 * `updated` is the ISO date the guide was last substantively revised. It lives
 * here rather than on each page because the sitemap needs it too: a
 * `lastModified` that is a real editorial date is a signal crawlers use, and
 * the only honest way to emit one is from the same value the page displays.
 */
export const GUIDES = [
  {
    slug: "how-the-k53-learners-test-works",
    title: "How the K53 learner's licence test works",
    description:
      "What's actually in the test, how long you get, what to bring, and how the booking process works.",
    updated: "2026-08-01",
  },
  {
    slug: "k53-pass-mark-and-test-format",
    title: "K53 pass marks & test format, explained",
    description:
      "64 questions, three sections, and a pass mark in EACH section — the structure most people only discover on test day.",
    updated: "2026-08-01",
  },
  {
    slug: "which-licence-code-8-10-14",
    title: "Code 8 vs Code 10 vs Code 14: which licence do you need?",
    description:
      "What each South African licence code covers, the age requirements, and how motorcycles (A1/A) fit in.",
    updated: "2026-08-01",
  },
  {
    slug: "aarto-demerit-points",
    title: "AARTO demerit points: rollout status and what learners should know",
    description:
      "Why AARTO rollout dates can change, where to check the official status, and why it matters once you are licensed.",
    updated: "2026-09-05",
  },
  {
    slug: "k53-mock-test",
    title: "K53 mock tests: how to practise like it's test day",
    description:
      "Why answering questions isn't the same as being ready — how to run a timed, scored mock that rehearses the real pass-mark rules.",
    updated: "2026-08-22",
  },
  {
    slug: "k53-road-signs-explained",
    title: "South African road signs explained: shapes, colours & categories",
    description:
      "Regulatory, warning and guidance signs — what each shape and colour is allowed to tell you, and how the test examines them.",
    updated: "2026-08-22",
  },
  {
    slug: "book-your-learners-licence",
    title: "Booking your learner's licence: DLTC, documents & validity",
    description:
      "Where to book, what to take to the testing centre, what the eye test involves, and how long your learner's licence lasts.",
    updated: "2026-08-22",
  },
  {
    slug: "k53-road-markings",
    title: "K53 road markings explained: lines, blocks & arrows",
    description:
      "What every painted line, block and arrow on South African roads means — and how markings are examined in the learner's test.",
    updated: "2026-08-22",
  },
  {
    slug: "failed-learners-test",
    title: "Failed the learner's licence test? What happens next",
    description:
      "Retry rules, how to rebook, what the marks sheet tells you, and how to turn a near-miss into a pass on the next sitting.",
    updated: "2026-08-22",
  },
  {
    slug: "k53-rules-of-the-road",
    title: "K53 rules of the road: speed limits, distances & the numbers to know",
    description:
      "The speed limits, parking and stopping distances, alcohol limits and overtaking rules the learner's test asks about — in one place.",
    updated: "2026-10-11",
  },
  {
    slug: "four-way-stop-right-of-way",
    title: "Four-way stops, traffic circles & right of way in South Africa",
    description:
      "Who goes first at a four-way stop, a traffic circle, a flashing robot and an unmarked junction — the right-of-way rules, plainly.",
    updated: "2026-10-11",
  },
  {
    slug: "k53-vehicle-controls",
    title: "K53 vehicle controls: the 8 questions that sink strong attempts",
    description:
      "Clutch, brake, accelerator, gears, parking brake, steering and mirrors — what each control does and how the test asks about it.",
    updated: "2026-10-11",
  },
  {
    slug: "k53-driving-test",
    title: "The K53 driver's licence test: yard test and road test explained",
    description:
      "How the practical driving test is structured, how the points system works, and the mistakes that end the test on the spot.",
    updated: "2026-10-11",
  },
  {
    slug: "k53-parallel-parking-alley-docking",
    title: "K53 parallel parking, alley docking, three-point turn & incline start",
    description:
      "The four yard-test manoeuvres step by step — how many movements you get, what the examiner scores, and what disqualifies you.",
    updated: "2026-10-11",
  },
  {
    slug: "k53-pre-trip-inspection",
    title: "K53 pre-trip inspection: the exterior and interior checks in order",
    description:
      "The walk-around the examiner times, the interior checks, and what you must say out loud before the yard test starts.",
    updated: "2026-10-11",
  },
  {
    slug: "motorcycle-learners-licence",
    title: "Motorcycle learner's licence (Code A & A1): what to study",
    description:
      "Ages, the rules that apply only to riders, and what the motorcycle learner's test covers that the car one doesn't.",
    updated: "2026-10-11",
  },
  {
    slug: "code-10-code-14-learners-licence",
    title: "Code 10 & Code 14 learner's licence: the heavy vehicle test",
    description:
      "What changes when you write the heavy-vehicle learner's — following distance, speed limits, air brakes and combination vehicles.",
    updated: "2026-10-11",
  },
] as const;

export type GuideSlug = (typeof GUIDES)[number]["slug"];
