import type { Flashcard, Question } from "@/types";

/**
 * Sprint 6 — top-up for the three thinnest categories: hazard_awareness,
 * parking and following_distance. Facts trace to
 * docs/content/facts/hazard-parking-following.md. Only fresh angles — every
 * prompt was checked against the existing bank to avoid duplicates. Universal.
 */
export const HPF_PACK_QUESTIONS: Question[] = [
  // ── HAZARD AWARENESS ────────────────────────────────────────
  {
    id: "q9_haz_scan_ahead",
    categoryId: "hazard_awareness",
    prompt: "Good hazard perception means your eyes should mostly be:",
    options: [
      "Fixed on the bumper of the car directly ahead",
      "Scanning far up the road (about 12 seconds ahead) so you spot hazards early",
      "On the speedometer",
      "On the road surface just in front of your car",
    ],
    correctIndex: 1,
    explanation:
      "Looking well ahead gives you time to plan. Staring at the car in front means you only react when it does — far too late for a developing hazard.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_haz_space_cushion",
    categoryId: "hazard_awareness",
    prompt: "Keeping a 'space cushion' around your vehicle means:",
    options: [
      "Fitting soft bumpers",
      "Keeping space on all sides and always knowing where you'd go if something went wrong",
      "Driving in the middle lane only",
      "Leaving the radio off",
    ],
    correctIndex: 1,
    explanation:
      "Space is time. Room around you — and a planned escape route — turns a sudden hazard into a manageable one instead of a collision.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_haz_crosswind",
    categoryId: "hazard_awareness",
    prompt: "On an exposed bridge in a strong side wind, or as you pass a large truck, you should expect:",
    options: [
      "Nothing unusual",
      "A sideways gust — hold the wheel firmly and be ready to correct",
      "Better grip than normal",
      "Your engine to lose power",
    ],
    correctIndex: 1,
    explanation:
      "Crosswinds shove high-sided vehicles and light cars sideways, and the shelter of a passing truck ends with a sudden gust. A firm grip keeps you in lane.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_haz_smoke",
    categoryId: "hazard_awareness",
    prompt: "Smoke from a veld fire is drifting thickly across the road ahead. You should:",
    options: [
      "Speed up to get through it quickly",
      "Treat it like fog — slow right down, switch on your lights, and be ready to stop",
      "Switch on your brights and maintain speed",
      "Follow closely behind the car ahead",
    ],
    correctIndex: 1,
    explanation:
      "Smoke hides stopped cars and animals just like fog. Slow down, lights on, and don't drive blind into it — vehicles pile up inside smoke banks.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q9_haz_stray_animal",
    categoryId: "hazard_awareness",
    prompt: "A cow wanders into the road ahead on a rural route. The safest response is to:",
    options: [
      "Swerve hard around it",
      "Slow down and be ready to stop; brake in a straight line rather than swerving violently",
      "Accelerate past before it moves",
      "Hoot and keep your speed",
    ],
    correctIndex: 1,
    explanation:
      "Livestock is unpredictable and there's often more than one. A violent swerve can roll the car or put you in oncoming traffic — slow, straight braking is safer.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_haz_road_rage",
    categoryId: "hazard_awareness",
    prompt: "An aggressive driver is tailgating, flashing lights and gesturing at you. You should:",
    options: [
      "Brake-check them to teach a lesson",
      "Stay calm, don't retaliate or make eye contact, and let them pass when it's safe",
      "Speed up to get away",
      "Gesture back and hold your lane",
    ],
    correctIndex: 1,
    explanation:
      "Engaging escalates road rage into a crash or confrontation. Give them the space to leave — your job is to get home safely, not to win.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q9_haz_medication",
    categoryId: "hazard_awareness",
    prompt: "Your medicine's label warns it may cause drowsiness. Before driving you should:",
    options: [
      "Drive anyway — it's not alcohol",
      "Not drive if it impairs you; some medication dulls reactions as much as alcohol",
      "Drive only on quiet roads",
      "Take a double dose to get it over with",
    ],
    correctIndex: 1,
    explanation:
      "Impairment is impairment, whatever the cause. Drowsy medication stretches your reaction time — heed the warning and find another way to travel.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_haz_stationary_bus",
    categoryId: "hazard_awareness",
    prompt: "You're approaching a bus stopped at the roadside with passengers around it. You should:",
    options: [
      "Maintain speed — the bus is stopped, not you",
      "Slow down and cover the brake; people (often children) may step out in front of or behind it",
      "Hoot and pass quickly",
      "Move to the far right and speed up",
    ],
    correctIndex: 1,
    explanation:
      "A stopped bus hides pedestrians who dart across to catch it or after getting off. Slow, brake ready — this is a classic pedestrian-knockdown situation.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q9_haz_debris_swerve",
    categoryId: "hazard_awareness",
    prompt: "An object has fallen off a truck into your lane. Before you react you should:",
    options: [
      "Swerve immediately without looking",
      "Check your mirrors first — braking straight is often safer than a sudden swerve into another vehicle",
      "Close your eyes and hope",
      "Accelerate over it",
    ],
    correctIndex: 1,
    explanation:
      "A panic swerve can put you into a car alongside or into oncoming traffic. A quick mirror check and straight-line braking usually beats an instinctive swerve.",
    difficulty: 2,
    scope: "learners",
  },

  // ── PARKING ─────────────────────────────────────────────────
  {
    id: "q9_park_hill_no_kerb",
    categoryId: "parking",
    prompt: "Parking on a hill where there is NO kerb, you should turn your front wheels:",
    options: [
      "Straight ahead",
      "Towards the edge of the road, so if the car rolls it heads off the road rather than into traffic",
      "Towards the centre of the road",
      "It doesn't matter without a kerb",
    ],
    correctIndex: 1,
    explanation:
      "With no kerb to catch the car, the wheels are your safeguard: pointed at the road edge, a rolling car leaves the road instead of drifting into the traffic lane.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q9_park_secure_steep",
    categoryId: "parking",
    prompt: "To secure a manual car parked on a steep slope, you should:",
    options: [
      "Rely on the handbrake alone",
      "Apply the handbrake firmly AND leave it in gear (first uphill, reverse downhill)",
      "Leave it in neutral so it can be pushed",
      "Just chock one wheel",
    ],
    correctIndex: 1,
    explanation:
      "On a steep hill the handbrake alone can slip. A engaged gear (or 'P' on an automatic) plus wheels turned to the kerb/edge is the belt-and-braces the K53 wants.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_park_leaving_bay",
    categoryId: "parking",
    prompt: "Before pulling out of a parallel parking spot into traffic, you must:",
    options: [
      "Just pull out — parked cars have priority",
      "Do a full observation: mirrors, signal, and a blind-spot/shoulder check for traffic and cyclists",
      "Hoot twice and go",
      "Reverse into the traffic lane first",
    ],
    correctIndex: 1,
    explanation:
      "Emerging from a parked position means giving way to moving traffic. Signal, then check mirrors and blind spot — a cyclist filtering past is easy to miss.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q9_park_dooring",
    categoryId: "parking",
    prompt: "Before opening your door to get out of a parked car, you should:",
    options: [
      "Open it quickly to save time",
      "Check the mirror and glance over your shoulder for cyclists and passing traffic",
      "Only check if you hear a car",
      "Open it fully and step out",
    ],
    correctIndex: 1,
    explanation:
      "A door flung open into a passing cyclist ('dooring') causes serious injury and is an offence. A mirror-and-shoulder check before opening prevents it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q9_park_pavement",
    categoryId: "parking",
    prompt: "Parking with your wheels up on the pavement (sidewalk) is:",
    options: [
      "Fine if you leave room to pass",
      "Prohibited — it obstructs pedestrians, who then have to walk in the road",
      "Allowed outside business hours",
      "Allowed for delivery vehicles only",
    ],
    correctIndex: 1,
    explanation:
      "The pavement is for people on foot — prams, wheelchairs and children. Forcing them into the traffic lane to get around your car is exactly what the rule prevents.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q9_park_corner_visibility",
    categoryId: "parking",
    prompt: "Why should you avoid parking close to a bend or the crest of a hill?",
    options: [
      "It's harder to park there",
      "Your parked car reduces visibility, so approaching drivers see the hazard too late",
      "It's illegal only for trucks",
      "The paint fades faster there",
    ],
    correctIndex: 1,
    explanation:
      "A car parked on a blind bend or crest appears suddenly to others and hides pedestrians. Park where approaching drivers have a clear, early view.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_park_obstruct_line",
    categoryId: "parking",
    prompt: "You should not park where leaving the space would force other drivers to:",
    options: [
      "Use their indicators",
      "Cross a barrier (solid) line or swing into oncoming traffic to get around you",
      "Slow down briefly",
      "Change to a lower gear",
    ],
    correctIndex: 1,
    explanation:
      "A badly chosen spot makes everyone else break the rules or take a risk to pass. Park where the road stays usable and safe for others.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_park_angle_reverse",
    categoryId: "parking",
    prompt: "Leaving an angled (echelon) bay where you nosed in, the safest method is to:",
    options: [
      "Reverse out fast before anyone comes",
      "Reverse out slowly with full observation, edging back until you can see clearly, giving way to passing traffic",
      "Pull forward over the kerb",
      "Wait for someone to wave you out",
    ],
    correctIndex: 1,
    explanation:
      "Backing out of an angled bay is a blind manoeuvre — creep back, keep looking all round, and yield to traffic and pedestrians until you can see it's clear.",
    difficulty: 2,
    scope: "learners",
  },

  // ── FOLLOWING DISTANCE ──────────────────────────────────────
  {
    id: "q9_fd_towing",
    categoryId: "following_distance",
    prompt: "When towing a trailer or caravan, your following distance should be:",
    options: [
      "The same as normal",
      "Greater than normal — the heavier combination takes longer to stop",
      "Shorter, to keep the trailer straight",
      "Irrelevant at low speed",
    ],
    correctIndex: 1,
    explanation:
      "Extra mass means a longer stopping distance and a trailer that can shove you forward under braking. Leave more room than you would solo.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_fd_erratic",
    categoryId: "following_distance",
    prompt: "The car ahead is weaving and braking unpredictably (possibly a learner or distracted driver). You should:",
    options: [
      "Follow closely to pressure them along",
      "Increase your following distance — you need more time to react to their surprises",
      "Overtake immediately regardless of the road",
      "Hoot until they drive better",
    ],
    correctIndex: 1,
    explanation:
      "An unpredictable driver ahead is a hazard you can't control — only your gap. More space buys the reaction time their sudden moves demand.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q9_fd_worn_loaded",
    categoryId: "following_distance",
    prompt: "Your car is fully loaded with passengers and luggage. Compared with driving alone, your following distance should be:",
    options: [
      "Shorter — more weight means more grip",
      "Longer — the heavier car takes more distance to stop",
      "Exactly the same",
      "Zero difference below 80 km/h",
    ],
    correctIndex: 1,
    explanation:
      "More weight lengthens braking distance. A full car (or worn tyres/brakes) stops later than an empty one, so open the gap to match.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_fd_sides",
    categoryId: "following_distance",
    prompt: "Good following practice keeps space:",
    options: [
      "Only in front of you",
      "All around — don't sit boxed in alongside other vehicles; keep a buffer to the sides too",
      "Only behind you",
      "Only on the driver's side",
    ],
    correctIndex: 1,
    explanation:
      "A gap ahead is useless if you're hemmed in on both sides with nowhere to go. Keep an escape route open by not driving in others' blind spots or packs.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_fd_why_seconds",
    categoryId: "following_distance",
    prompt: "Why is the two-second rule better than 'stay X metres back'?",
    options: [
      "It's easier to remember",
      "It scales automatically with speed — the faster you go, the bigger the gap it gives",
      "It only works in town",
      "Metres are illegal to use",
    ],
    correctIndex: 1,
    explanation:
      "A fixed distance that's safe at 60 is deadly at 120. Counting seconds stretches the real gap as your speed rises, exactly when you need it most.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q9_fd_helps_behind",
    categoryId: "following_distance",
    prompt: "Leaving a generous gap to the car ahead also helps the driver BEHIND you because:",
    options: [
      "It doesn't affect them at all",
      "It lets you brake gently and early instead of suddenly, reducing the chance of a chain-reaction rear-end",
      "It makes them drive faster",
      "It blocks them from overtaking",
    ],
    correctIndex: 1,
    explanation:
      "Your gap absorbs the shocks in the traffic ahead so you brake smoothly. Tailgating forces hard braking that ripples back into a pile-up.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q9_fd_approach_queue",
    categoryId: "following_distance",
    prompt: "Approaching stationary or slowing traffic ahead, you should:",
    options: [
      "Keep your speed and brake hard at the last moment",
      "Ease off early and slow gradually, arriving with a gap rather than stopping abruptly",
      "Change lanes without looking",
      "Close right up to the car in front",
    ],
    correctIndex: 1,
    explanation:
      "Braking early and smoothly warns the driver behind and keeps a buffer if the queue lurches. Late, hard braking is how rear-end concertinas start.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q9_fd_new_driver_gap",
    categoryId: "following_distance",
    prompt: "As a newly licensed driver, your following distance should generally be:",
    options: [
      "Shorter than experienced drivers, to keep up",
      "At least the full two seconds (more in poor conditions) — your reactions aren't yet practised",
      "Whatever the car behind you allows",
      "One car length at any speed",
    ],
    correctIndex: 1,
    explanation:
      "Experience shortens reaction time; until you have it, give yourself the full gap and then some. It's the cheapest safety margin you own.",
    difficulty: 1,
    scope: "learners",
  },
];

export const HPF_PACK_FLASHCARDS: Flashcard[] = [
  // Hazard
  { id: "fc9_scan", categoryId: "hazard_awareness", front: "Where should your eyes mostly be?", back: "Scanning ~12 seconds up the road — not fixed on the bumper ahead.", difficulty: 2 },
  { id: "fc9_cushion", categoryId: "hazard_awareness", front: "Space cushion?", back: "Keep room all round and always know your escape route.", difficulty: 2 },
  { id: "fc9_crosswind", categoryId: "hazard_awareness", front: "Passing a truck / on an exposed bridge?", back: "Expect a sideways gust — grip firmly, be ready to correct.", difficulty: 2 },
  { id: "fc9_smoke", categoryId: "hazard_awareness", front: "Veld-fire smoke across the road?", back: "Treat like fog — slow right down, lights on, ready to stop.", difficulty: 1 },
  { id: "fc9_stray", categoryId: "hazard_awareness", front: "Animal wanders into the road?", back: "Slow, brake in a straight line — don't swerve violently.", difficulty: 2 },
  { id: "fc9_rage", categoryId: "hazard_awareness", front: "Aggressive tailgater flashing at you?", back: "Don't retaliate — let them pass, keep your distance.", difficulty: 1 },
  { id: "fc9_meds", categoryId: "hazard_awareness", front: "Medicine says 'may cause drowsiness'?", back: "Don't drive if impaired — it can dull you like alcohol.", difficulty: 2 },
  { id: "fc9_bus", categoryId: "hazard_awareness", front: "Passing a stopped bus with people around?", back: "Slow, cover the brake — pedestrians (kids) may dart across.", difficulty: 1 },
  { id: "fc9_debris", categoryId: "hazard_awareness", front: "Object in your lane — swerve or brake?", back: "Mirror-check first; straight-line braking often beats a panic swerve.", difficulty: 2 },

  // Parking
  { id: "fc9_hill_no_kerb", categoryId: "parking", front: "Parking on a hill with NO kerb?", back: "Front wheels towards the road edge — a rolling car leaves the road, not the lane.", difficulty: 3 },
  { id: "fc9_secure_steep", categoryId: "parking", front: "Securing a manual on a steep slope?", back: "Handbrake firmly + leave it in gear (1st uphill / reverse downhill).", difficulty: 2 },
  { id: "fc9_leave_bay", categoryId: "parking", front: "Pulling out of a parallel spot?", back: "Mirrors, signal, blind-spot check — give way to traffic and cyclists.", difficulty: 1 },
  { id: "fc9_door", categoryId: "parking", front: "Before opening your door?", back: "Check mirror + over your shoulder for cyclists ('dooring' is an offence).", difficulty: 1 },
  { id: "fc9_pavement", categoryId: "parking", front: "Parking on the pavement?", back: "Prohibited — it forces pedestrians into the road.", difficulty: 1 },
  { id: "fc9_corner", categoryId: "parking", front: "Why not park on a bend/crest?", back: "Your car cuts visibility — others see the hazard too late.", difficulty: 2 },
  { id: "fc9_angle_out", categoryId: "parking", front: "Leaving an angled bay you nosed into?", back: "Reverse out slowly, full observation, yield until you can see clearly.", difficulty: 2 },

  // Following distance
  { id: "fc9_towing", categoryId: "following_distance", front: "Following distance when towing?", back: "Greater — the heavier combination takes longer to stop.", difficulty: 2 },
  { id: "fc9_erratic", categoryId: "following_distance", front: "Car ahead weaving/braking oddly?", back: "Increase your gap — you need more reaction time.", difficulty: 1 },
  { id: "fc9_loaded", categoryId: "following_distance", front: "Car full of passengers/luggage?", back: "Longer gap — more weight = longer stopping distance.", difficulty: 2 },
  { id: "fc9_why_seconds", categoryId: "following_distance", front: "Why 2-seconds beats fixed metres?", back: "It scales with speed — bigger gap the faster you go.", difficulty: 2 },
  { id: "fc9_helps_behind", categoryId: "following_distance", front: "How does your gap help the driver behind?", back: "You brake gently/early instead of hard — prevents chain-reaction rear-ends.", difficulty: 3 },
  { id: "fc9_new_driver", categoryId: "following_distance", front: "Following distance as a new driver?", back: "At least the full 2 seconds (more in poor conditions) — reactions aren't practised yet.", difficulty: 1 },
];
