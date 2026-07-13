import type { Flashcard, Question } from "@/types";

/**
 * Conversion pack — squeezes more study surface out of content we already
 * trust, in both directions:
 *
 *  • Direction A (questions → flashcards): the thin-flashcard categories
 *    (parking, following_distance, intersections, hazard_awareness) had strong
 *    questions with no flashcard twin. Each fact below is turned into an
 *    active-recall card. No new regulation is introduced — every card mirrors a
 *    fact already carried by a question in the bank.
 *  • Direction B (flashcards → questions): facts that lived only as flashcards
 *    get a proper multiple-choice question with hand-written distractors from
 *    the same fact family. Every prompt was checked against the existing bank so
 *    the normalized-prompt dedupe gate stays green.
 *
 * Universal unless a code is set. IDs use the q11_/fc11_ batch prefix.
 */

export const CONVERTED_PACK_QUESTIONS: Question[] = [
  // ── PARKING (Direction B) ───────────────────────────────────
  {
    id: "q11_park_stop_vs_park",
    categoryId: "parking",
    prompt: "How does a 'no stopping' restriction differ from a 'no parking' one?",
    options: [
      "They mean exactly the same thing",
      "No stopping forbids halting even for a moment; no parking still lets you halt briefly to load or set down a passenger",
      "No parking is stricter than no stopping",
      "No stopping only applies at night",
    ],
    correctIndex: 1,
    explanation:
      "A no-stopping zone (red kerb line / red-ringed sign) means you may not halt at all. A no-parking restriction lets you stop momentarily to pick up or drop off, but you may not leave the vehicle or wait.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q11_park_hydrant_reason",
    categoryId: "parking",
    prompt: "Why is it an offence to park alongside a fire hydrant?",
    options: [
      "It scratches the paint on your car",
      "Emergency services must have unobstructed access to the water supply",
      "Hydrants leak onto parked cars",
      "It is only an offence during the day",
    ],
    correctIndex: 1,
    explanation:
      "Fire crews need to reach a hydrant instantly. A car parked across it can cost the minutes that decide whether a fire is contained.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q11_park_verge_pedestrians",
    categoryId: "parking",
    prompt: "Leaving your car half on the pavement 'to keep it out of the road' is:",
    options: [
      "A good idea that keeps traffic flowing",
      "Not allowed — it forces pedestrians, prams and wheelchairs into the roadway",
      "Allowed if two wheels stay on the road",
      "Allowed only outside shops",
    ],
    correctIndex: 1,
    explanation:
      "The pavement belongs to pedestrians. Parking on it pushes people — often children or wheelchair users — out into moving traffic.",
    difficulty: 1,
    scope: "learners",
  },
  // ── FOLLOWING DISTANCE (Direction B) ────────────────────────
  {
    id: "q11_fd_night_headlights",
    categoryId: "following_distance",
    prompt: "At night your speed and following distance should always let you:",
    options: [
      "Stop within the distance your headlights light up",
      "Keep up with the car in front no matter how fast it goes",
      "Drive on full beam the whole time",
      "Halve the gap you would leave in daylight",
    ],
    correctIndex: 0,
    explanation:
      "If you cannot stop within the lit distance, you are 'over-driving your lights' — a hazard could appear inside your stopping distance before you ever see it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q11_fd_cut_in",
    categoryId: "following_distance",
    prompt: "A car overtakes you and tucks back in close, right in front of you. You should:",
    options: [
      "Flash your lights and stay close behind it",
      "Ease off the accelerator to rebuild your following gap",
      "Overtake it straight back",
      "Brake hard to make a point",
    ],
    correctIndex: 1,
    explanation:
      "Your safe gap has just been eaten up. Gently dropping back re-opens it — chasing or braking hard only creates a new hazard.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q11_fd_approaching_queue",
    categoryId: "following_distance",
    prompt: "You can see stationary or slowing traffic building up ahead. The smoothest, safest approach is to:",
    options: [
      "Keep your speed and brake hard at the last moment",
      "Ease off early and slow gradually so you arrive with a gap already open",
      "Change lanes repeatedly to stay moving",
      "Close right up on the car in front",
    ],
    correctIndex: 1,
    explanation:
      "Slowing early gives the drivers behind time to react too, and leaves you a cushion if the queue stops suddenly. Late braking risks a chain-reaction rear-end.",
    difficulty: 2,
    scope: "learners",
  },
  // ── INTERSECTIONS (Direction B) ─────────────────────────────
  {
    id: "q11_int_amber_meaning",
    categoryId: "intersections",
    prompt: "A steady amber (yellow) traffic light means:",
    options: [
      "Speed up to beat the red",
      "Stop before the line if you can do so safely; the red is about to show",
      "Give way to the right and continue",
      "The lights are faulty — treat it as a four-way stop",
    ],
    correctIndex: 1,
    explanation:
      "Amber is a warning that red is coming. You stop unless you are so close that stopping would be dangerous — it is not a signal to accelerate.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q11_int_second_train",
    categoryId: "intersections",
    prompt: "A train has just cleared a level crossing that has more than one track. Before you move off you should:",
    options: [
      "Go immediately — one train per crossing is the rule",
      "Look and listen both ways again; a second train may be hidden behind the first",
      "Reverse away from the crossing",
      "Sound your hooter and drive across",
    ],
    correctIndex: 1,
    explanation:
      "On multi-track crossings a passing train can mask a second one coming the other way. Always re-check both directions before crossing.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q11_int_scholar_patrol",
    categoryId: "intersections",
    prompt: "A scholar patrol steps out and lowers its banners across the road ahead. You must:",
    options: [
      "Slow down but keep rolling through the gap",
      "Stop completely and stay stopped until the banners are lifted clear of the road",
      "Sound your hooter so the children hurry",
      "Drive around the patrol on the right",
    ],
    correctIndex: 1,
    explanation:
      "Lowered scholar-patrol banners have the force of a stop signal. You remain stationary until they are raised off the roadway again.",
    difficulty: 1,
    scope: "learners",
  },
  // ── HAZARD AWARENESS (Direction B) ──────────────────────────
  {
    id: "q11_haz_low_sun",
    categoryId: "hazard_awareness",
    prompt: "You are driving straight into low, dazzling sun. The safest response is to:",
    options: [
      "Speed up to get out of the glare sooner",
      "Slow down, use the sun visor and leave a bigger following gap",
      "Close your eyes briefly when it is worst",
      "Switch on your bright (main) beams",
    ],
    correctIndex: 1,
    explanation:
      "Low sun can wash out pedestrians and brake lights entirely. Slowing and lengthening your gap buys the reaction time the glare steals.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q11_haz_total_brake_failure",
    categoryId: "hazard_awareness",
    prompt: "Your foot brake goes right to the floor with no effect while driving. Your first actions should be to:",
    options: [
      "Switch the engine off immediately and coast",
      "Pump the pedal, change down to a lower gear and apply the handbrake gently while steering to safety",
      "Steer sharply off the road at once",
      "Take both hands off the wheel and brace",
    ],
    correctIndex: 1,
    explanation:
      "Pumping can restore some pressure, engine braking in a low gear slows you, and a gentle handbrake avoids a skid. Switching off the engine risks losing steering assistance and locking the wheel.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q11_haz_freeway_breakdown",
    categoryId: "hazard_awareness",
    prompt: "Your car breaks down on a freeway. The safest sequence is to:",
    options: [
      "Stop in the lane, switch on hazards and phone for help",
      "Get fully onto the emergency shoulder, switch on hazards, place a warning triangle well behind, and wait away from the traffic side",
      "Push the car across all lanes to the far side",
      "Stand behind the car to warn traffic",
    ],
    correctIndex: 1,
    explanation:
      "Getting off the live lanes and standing clear of the traffic side is what keeps you alive. A triangle at least 45 m back warns approaching drivers in time.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q11_haz_oncoming_in_lane",
    categoryId: "hazard_awareness",
    prompt: "An oncoming car pulls out to overtake and is now heading straight at you in your lane. You should:",
    options: [
      "Hold your line and expect them to move back",
      "Brake firmly and move as far left as is safe, even onto the shoulder",
      "Swerve right into the oncoming lane",
      "Accelerate to pass them before they reach you",
    ],
    correctIndex: 1,
    explanation:
      "Braking and going left opens the gap and uses the space they have vacated. Swerving right could put you head-on with them as they try to pull back in.",
    difficulty: 3,
    scope: "learners",
  },
];

export const CONVERTED_PACK_FLASHCARDS: Flashcard[] = [
  // ── PARKING (Direction A) ───────────────────────────────────
  {
    id: "fc11_park_bridge",
    categoryId: "parking",
    front: "Stopping on/under a bridge or on a narrow section of road?",
    back: "A no-stopping situation — you may not stop there at all.",
    difficulty: 2,
  },
  {
    id: "fc11_park_freeway",
    categoryId: "parking",
    front: "Stopping or parking on a freeway?",
    back: "Prohibited except in a genuine emergency (or where an authorised sign allows it).",
    difficulty: 1,
  },
  {
    id: "fc11_park_driveway",
    categoryId: "parking",
    front: "Parking across a private driveway or entrance?",
    back: "Not allowed — you may not obstruct any entrance or exit.",
    difficulty: 1,
  },
  {
    id: "fc11_park_disabled_bay",
    categoryId: "parking",
    front: "Using a bay reserved for disabled persons without a permit?",
    back: "An offence — reserved bays are only for permit holders displaying the disc.",
    difficulty: 1,
  },
  {
    id: "fc11_park_night_rural",
    categoryId: "parking",
    front: "Parked on the roadway outside town at night?",
    back: "Your vehicle must show the required lamps/reflectors so approaching drivers see it in time.",
    difficulty: 2,
  },
  {
    id: "fc11_park_reverse_bay",
    categoryId: "parking",
    front: "Why reverse INTO a bay rather than out of one?",
    back: "You drive out forwards with a clear view, instead of reversing blind into moving traffic.",
    difficulty: 2,
  },
  // ── FOLLOWING DISTANCE (Direction A) ────────────────────────
  {
    id: "fc11_fd_night_range",
    categoryId: "following_distance",
    front: "Safe night speed rule?",
    back: "Keep your speed and gap so you can stop within the distance your headlights light up.",
    difficulty: 2,
  },
  {
    id: "fc11_fd_following_bike",
    categoryId: "following_distance",
    front: "Following a motorcycle?",
    back: "Keep at least the normal 2 seconds, more in the wet — bikes can stop fast and may fall in a slide.",
    difficulty: 2,
  },
  {
    id: "fc11_fd_cut_in",
    categoryId: "following_distance",
    front: "Someone overtakes and cuts back in close ahead?",
    back: "Ease off to rebuild your 2-second gap behind them.",
    difficulty: 2,
  },
  {
    id: "fc11_fd_queue",
    categoryId: "following_distance",
    front: "Approaching traffic slowing or stopping ahead?",
    back: "Ease off early and slow gradually, arriving with a gap rather than stopping abruptly.",
    difficulty: 2,
  },
  {
    id: "fc11_fd_sides",
    categoryId: "following_distance",
    front: "Where should you keep space, not just in front?",
    back: "All around — don't sit boxed in alongside other vehicles; keep a buffer to the sides too.",
    difficulty: 2,
  },
  // ── INTERSECTIONS (Direction A) ─────────────────────────────
  {
    id: "fc11_int_amber",
    categoryId: "intersections",
    front: "A steady amber (yellow) light?",
    back: "Stop before the line if you safely can — red is coming. Continue only if stopping would be dangerous.",
    difficulty: 1,
  },
  {
    id: "fc11_int_second_train",
    categoryId: "intersections",
    front: "One train just passed a multi-track crossing?",
    back: "Look and listen both ways again — a second train may be hidden behind the first.",
    difficulty: 2,
  },
  {
    id: "fc11_int_slipway",
    categoryId: "intersections",
    front: "Joining a road via a slip lane?",
    back: "Give way to traffic already on the road you're joining; merge only into a safe gap.",
    difficulty: 2,
  },
  {
    id: "fc11_int_scholar_patrol",
    categoryId: "intersections",
    front: "Scholar patrol lowers its banners across the road?",
    back: "Stop completely and stay stopped until the banners are lifted clear of the roadway.",
    difficulty: 1,
  },
  // ── HAZARD AWARENESS (Direction A) ──────────────────────────
  {
    id: "fc11_haz_low_sun",
    categoryId: "hazard_awareness",
    front: "Driving into low, blinding sun?",
    back: "Slow down, use the sun visor and increase your following distance.",
    difficulty: 2,
  },
  {
    id: "fc11_haz_brake_fail",
    categoryId: "hazard_awareness",
    front: "Foot brake suddenly fails while driving?",
    back: "Pump the pedal, change to a lower gear and use the handbrake gently while steering to safety.",
    difficulty: 3,
  },
  {
    id: "fc11_haz_freeway_breakdown",
    categoryId: "hazard_awareness",
    front: "Broken down on a freeway?",
    back: "Get fully onto the shoulder, hazards on, warning triangle 45 m+ behind, wait away from the traffic side.",
    difficulty: 2,
  },
  {
    id: "fc11_haz_oncoming_overtaker",
    categoryId: "hazard_awareness",
    front: "Oncoming car overtaking straight at you in your lane?",
    back: "Brake firmly and move as far left as is safe, even onto the shoulder.",
    difficulty: 3,
  },
];
