import type { Question } from "@/types";

/**
 * K53-aligned question bank. Content is structured around the official
 * South African K53 manual (rules of the road, road signs, vehicle controls).
 * Not affiliated with or endorsed by the RTMC.
 */
export const QUESTIONS: Question[] = [
  // ── ROAD SIGNS ─────────────────────────────────────────────
  {
    id: "q_sign_stop",
    categoryId: "signs",
    sign: "stop",
    prompt: "You approach this sign. What are you legally required to do?",
    options: [
      "Slow down and proceed only if the way looks clear",
      "Come to a complete stop behind the stop line, then proceed when safe",
      "Stop only if other vehicles are present",
      "Give way to traffic approaching from the left only",
    ],
    correctIndex: 1,
    explanation:
      "A stop sign requires a full stop behind the stop line — wheels no longer turning — every time, even if the road is empty. You may only move off once it is safe.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_yield",
    categoryId: "signs",
    sign: "yield",
    prompt: "This triangular sign with the point facing down means:",
    options: [
      "Stop completely before the line",
      "Yield — give right of way to other traffic and pedestrians",
      "No entry for any vehicle",
      "You have right of way",
    ],
    correctIndex: 1,
    explanation:
      "A yield (give-way) sign means you do not have to stop if the way is clear, but you must give right of way to crossing traffic and pedestrians and be ready to stop.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_no_entry",
    categoryId: "signs",
    sign: "no_entry",
    prompt: "What does a red circle with a white horizontal bar mean?",
    options: [
      "No stopping",
      "No entry for vehicles in this direction",
      "One-way street ahead",
      "No overtaking",
    ],
    correctIndex: 1,
    explanation:
      "A solid red disc with a white horizontal bar is a 'no entry' sign — vehicles may not proceed past it in that direction.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_no_overtaking",
    categoryId: "signs",
    sign: "no_overtaking",
    prompt: "This sign shows two cars side by side in a red circle. It means:",
    options: [
      "Two lanes merge ahead",
      "Overtaking is prohibited",
      "Keep left unless overtaking",
      "Dual carriageway begins",
    ],
    correctIndex: 1,
    explanation:
      "The 'no overtaking' sign prohibits passing other vehicles until you pass the sign that ends the restriction. It is a regulatory (red-bordered) sign.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_speed60",
    categoryId: "signs",
    sign: "speed_60",
    prompt: "You see a red circle with '60' inside. This indicates:",
    options: [
      "A recommended cruising speed of 60 km/h",
      "The maximum legal speed is 60 km/h",
      "The minimum speed is 60 km/h",
      "60 metres to the next sign",
    ],
    correctIndex: 1,
    explanation:
      "A number in a red circle is a regulatory speed-limit sign showing the maximum speed allowed — here 60 km/h. Exceeding it is an offence.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_default_urban",
    categoryId: "signs",
    prompt: "In the absence of any speed-limit sign, the default maximum speed in an urban area is:",
    options: ["40 km/h", "60 km/h", "80 km/h", "100 km/h"],
    correctIndex: 1,
    explanation:
      "Where no sign states otherwise, the general speed limit is 60 km/h in urban areas, 100 km/h on public roads outside urban areas, and 120 km/h on freeways.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_pedestrian",
    categoryId: "signs",
    sign: "pedestrian",
    prompt: "A triangular sign with a red border showing a person walking warns you that:",
    options: [
      "Pedestrians are prohibited",
      "There is a pedestrian crossing or pedestrians may be in the road ahead",
      "A school zone has ended",
      "You must sound your hooter",
    ],
    correctIndex: 1,
    explanation:
      "Triangular red-bordered signs are warning signs. This one warns of pedestrians ahead — reduce speed and be ready to stop.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_railway",
    categoryId: "signs",
    sign: "railway",
    prompt: "What should you do when approaching an uncontrolled railway crossing?",
    options: [
      "Maintain speed and cross quickly",
      "Slow down, look both ways and be prepared to stop for trains",
      "Sound your hooter and proceed",
      "Stop only if a train is visible",
    ],
    correctIndex: 1,
    explanation:
      "At a railway crossing you must slow down, look in both directions and be ready to stop. Trains always have right of way and cannot stop quickly.",
    difficulty: 2,
    scope: "learners",
  },

  // ── RULES OF THE ROAD ──────────────────────────────────────
  {
    id: "q_rules_freeway_speed",
    categoryId: "rules",
    prompt: "The general maximum speed limit on a South African freeway is:",
    options: ["100 km/h", "110 km/h", "120 km/h", "140 km/h"],
    correctIndex: 2,
    explanation:
      "Unless a sign states otherwise, the maximum speed on a freeway is 120 km/h.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_rules_alcohol",
    categoryId: "rules",
    prompt: "The legal blood-alcohol limit for an ordinary driver is below:",
    options: [
      "0.02 g per 100 ml",
      "0.05 g per 100 ml",
      "0.08 g per 100 ml",
      "There is no legal limit",
    ],
    correctIndex: 1,
    explanation:
      "The limit is a blood-alcohol concentration of less than 0.05 g per 100 ml (0.02 for professional drivers). The safest choice is not to drink and drive at all.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_seatbelt",
    categoryId: "rules",
    prompt: "Who is responsible for ensuring that a child under the prescribed age is restrained?",
    options: [
      "The child",
      "The driver of the vehicle",
      "Only the parent, if present",
      "Nobody — it is optional",
    ],
    correctIndex: 1,
    explanation:
      "The driver is legally responsible for ensuring all occupants, including children, are properly restrained where seatbelts or child seats are fitted.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_hand_signal",
    categoryId: "rules",
    prompt: "A driver extends their right arm straight out of the window. This hand signal means:",
    options: [
      "I am slowing down or stopping",
      "I intend to turn right or move to the right",
      "I intend to turn left",
      "It is safe for you to overtake",
    ],
    correctIndex: 1,
    explanation:
      "A straight, extended right arm indicates an intention to turn right or move right. An arm rotated upward indicates a left turn; an arm moved up and down indicates slowing/stopping.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_keep_left",
    categoryId: "rules",
    prompt: "On a multi-lane public road you should generally:",
    options: [
      "Drive in the right lane at all times",
      "Keep to the left and use the right lane only to overtake",
      "Use whichever lane is emptiest",
      "Straddle two lanes for safety",
    ],
    correctIndex: 1,
    explanation:
      "The keep-left/pass-right rule applies: travel in the left lane and use lanes to the right only when overtaking, then return to the left.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_rules_emergency_triangle",
    categoryId: "rules",
    prompt: "If you break down on a freeway, where should the emergency warning triangle be placed?",
    options: [
      "Directly behind the vehicle",
      "About 45 metres behind the vehicle",
      "On the roof of the vehicle",
      "Triangles are not required",
    ],
    correctIndex: 1,
    explanation:
      "The warning triangle must be placed at least 45 metres behind the vehicle on a freeway so approaching traffic has time to react.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_rules_tread",
    categoryId: "rules",
    prompt: "The minimum legal tyre tread depth is:",
    options: ["1 mm across the tread", "3 mm", "Smooth tyres are legal", "5 mm"],
    correctIndex: 0,
    explanation:
      "A tyre is illegal once the tread is less than 1 mm deep across the full circumference. Worn tyres greatly increase stopping distance, especially in the wet.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_yellow_line",
    categoryId: "rules",
    prompt: "What does a solid yellow line at the edge of the road indicate?",
    options: [
      "An emergency / breakdown lane that is not a normal travelling lane",
      "A dedicated overtaking lane",
      "A bus-only lane at all times",
      "The centre of the road",
    ],
    correctIndex: 0,
    explanation:
      "The yellow line marks the edge-of-road / emergency lane. It is not a travelling lane; driving in it to let others pass is only permitted in limited, safe circumstances.",
    difficulty: 3,
    scope: "learners",
  },

  // ── VEHICLE CONTROLS ───────────────────────────────────────
  {
    id: "q_ctrl_clutch",
    categoryId: "controls",
    prompt: "What is the main function of the clutch in a manual vehicle?",
    options: [
      "To brake the vehicle",
      "To engage and disengage the engine from the gearbox when changing gears",
      "To increase fuel flow",
      "To operate the indicators",
    ],
    correctIndex: 1,
    explanation:
      "The clutch temporarily disconnects engine power from the gearbox so you can select gears or stop without stalling.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_ctrl_handbrake",
    categoryId: "controls",
    prompt: "Before starting the engine during the K53 pre-trip routine, the handbrake should be:",
    options: ["Released", "Fully engaged", "Half engaged", "Removed"],
    correctIndex: 1,
    explanation:
      "The handbrake must be fully engaged before you start the vehicle so it cannot roll. This is a marked item in the K53 starting procedure.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_ctrl_temp",
    categoryId: "controls",
    prompt: "While driving, the temperature gauge moves into the red zone. You should:",
    options: [
      "Keep driving to reach your destination faster",
      "Stop as soon as it is safe and switch off the engine to let it cool",
      "Switch on the air conditioner",
      "Pour cold water on the engine immediately",
    ],
    correctIndex: 1,
    explanation:
      "A reading in the red means the engine is overheating. Stop safely and switch off to avoid serious damage; never open the radiator cap while it is hot.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_ctrl_abs",
    categoryId: "controls",
    prompt: "The ABS warning light staying on while driving indicates:",
    options: [
      "The anti-lock braking system may be faulty",
      "Your seatbelt is undone",
      "The fuel is low",
      "The headlights are on",
    ],
    correctIndex: 0,
    explanation:
      "A persistent ABS light means a possible fault in the anti-lock braking system. Normal braking usually still works, but have it checked promptly.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_ctrl_mirrors",
    categoryId: "controls",
    prompt: "How often should you check your mirrors while driving?",
    options: [
      "Only when you intend to turn",
      "Regularly — roughly every 5–8 seconds and before any manoeuvre",
      "Only at intersections",
      "Once at the start of the trip",
    ],
    correctIndex: 1,
    explanation:
      "Mirrors should be scanned frequently (every few seconds) and always before signalling, changing lanes, slowing or turning, so you keep a live picture of the traffic around you.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_ctrl_headlights",
    categoryId: "controls",
    prompt: "When must you dip (lower) your headlights from bright to dim?",
    options: [
      "Never, brights are always safer",
      "When following or approaching another vehicle, to avoid dazzling the driver",
      "Only in heavy rain",
      "Only inside tunnels",
    ],
    correctIndex: 1,
    explanation:
      "You must dip your lights within 150 m of an oncoming vehicle and when following another vehicle, so you do not dazzle other drivers.",
    difficulty: 2,
    scope: "learners",
  },

  // ── INTERSECTIONS ──────────────────────────────────────────
  {
    id: "q_int_4way_order",
    categoryId: "intersections",
    prompt: "At a four-way stop, who has the right of way?",
    options: [
      "The largest vehicle",
      "The vehicle that stopped first proceeds first",
      "The fastest vehicle",
      "Vehicles turning left always go first",
    ],
    correctIndex: 1,
    explanation:
      "At a four-way stop, vehicles proceed in the order they arrived and stopped. If two stop at the same time, the vehicle on the right (or going straight over a turning vehicle) generally yields appropriately.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_int_4way_same_time",
    categoryId: "intersections",
    prompt: "Two vehicles reach a four-way stop at exactly the same time, side by side. Who goes first?",
    options: [
      "The vehicle on the left",
      "The vehicle on the right",
      "Whoever hoots first",
      "Both at once",
    ],
    correctIndex: 1,
    explanation:
      "When vehicles stop simultaneously, the one on the right has right of way and the driver on the left should yield.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_int_circle",
    categoryId: "intersections",
    sign: "traffic_circle",
    prompt: "When entering a traffic circle (roundabout), you must give way to:",
    options: [
      "Traffic approaching from your left",
      "Traffic already in the circle and approaching from your right",
      "Nobody — circles have no right-of-way rules",
      "Only large vehicles",
    ],
    correctIndex: 1,
    explanation:
      "At a traffic circle you yield to vehicles already in the circle, which approach from your right. Signal left when you are about to exit.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_int_mini_circle",
    categoryId: "intersections",
    prompt: "At a mini-circle, if two vehicles arrive at the same time, priority is given to:",
    options: [
      "The vehicle on the right",
      "The vehicle that arrived first; if simultaneous, the one on the right",
      "The vehicle going straight",
      "The vehicle turning right",
    ],
    correctIndex: 1,
    explanation:
      "A mini-circle follows first-come-first-go like a four-way stop; when vehicles arrive together, the one on the right has priority. You still pass to the left of the central island.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_int_robot_dead",
    categoryId: "intersections",
    prompt: "A traffic light (robot) is completely out of order. You should treat the intersection as:",
    options: [
      "A freeway on-ramp",
      "A four-way stop",
      "A yield-only junction",
      "Closed — turn around",
    ],
    correctIndex: 1,
    explanation:
      "When traffic signals are not working, the intersection must be treated as a four-way stop: stop, then proceed in turn.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_int_turn_right",
    categoryId: "intersections",
    prompt: "You are turning right at an intersection. Oncoming traffic is approaching. You should:",
    options: [
      "Turn quickly before they arrive",
      "Yield to oncoming traffic and only turn when there is a safe gap",
      "Expect oncoming traffic to stop for you",
      "Sound your hooter and turn",
    ],
    correctIndex: 1,
    explanation:
      "A right-turning driver must give way to oncoming traffic going straight or turning left, and only complete the turn when there is a safe gap.",
    difficulty: 2,
    scope: "learners",
  },

  // ── PARKING & STOPPING ─────────────────────────────────────
  {
    id: "q_park_crossing",
    categoryId: "parking",
    prompt: "You may not stop your vehicle within how many metres of a pedestrian crossing?",
    options: ["3 metres", "9 metres", "15 metres", "There is no restriction"],
    correctIndex: 1,
    explanation:
      "You may not stop within 9 metres of a pedestrian crossing (on the approach side), because it blocks the view of pedestrians for other drivers.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_park_facing",
    categoryId: "parking",
    prompt: "When parking on a public road, your vehicle should be:",
    options: [
      "Facing oncoming traffic on the right side",
      "Parked on the left, facing the direction of travel",
      "Parked anywhere convenient",
      "Double-parked if no space is open",
    ],
    correctIndex: 1,
    explanation:
      "Park as near as possible to the left edge of the roadway, facing the direction of travel, unless road markings indicate otherwise.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_park_hydrant",
    categoryId: "parking",
    sign: "no_stopping",
    prompt: "Parking next to a fire hydrant is:",
    options: [
      "Allowed for up to 10 minutes",
      "Prohibited — it can block emergency access",
      "Allowed if your hazards are on",
      "Allowed at night only",
    ],
    correctIndex: 1,
    explanation:
      "You may not park alongside a fire hydrant. Emergency services must have unobstructed access at all times.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_park_incline",
    categoryId: "parking",
    prompt: "When parking facing downhill, you should turn your front wheels:",
    options: [
      "Toward the kerb",
      "Away from the kerb",
      "Straight ahead",
      "It makes no difference",
    ],
    correctIndex: 0,
    explanation:
      "Facing downhill, turn the wheels toward the kerb so that if the vehicle rolls it is stopped by the kerb. Also engage the handbrake and leave it in gear.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_park_no_stopping",
    categoryId: "parking",
    sign: "no_stopping",
    prompt: "A 'no stopping' sign (red circle, red cross) means:",
    options: [
      "You may stop briefly to drop off passengers",
      "You may not stop at all, even momentarily, in that zone",
      "You may park for under 5 minutes",
      "You may stop only to load goods",
    ],
    correctIndex: 1,
    explanation:
      "A no-stopping sign prohibits stopping for any reason within the zone — stricter than a no-parking sign, which only prohibits leaving the vehicle parked.",
    difficulty: 2,
    scope: "learners",
  },

  // ── FOLLOWING DISTANCE ─────────────────────────────────────
  {
    id: "q_fd_two_second",
    categoryId: "following_distance",
    prompt: "In good conditions, the recommended minimum following distance is:",
    options: [
      "Half a second",
      "The two-second rule",
      "Ten car lengths regardless of speed",
      "As close as possible to save fuel",
    ],
    correctIndex: 1,
    explanation:
      "The two-second rule scales with speed: pick a fixed point, and you should pass it at least two seconds after the vehicle ahead. Increase this in poor conditions.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_fd_wet",
    categoryId: "following_distance",
    prompt: "In rain or poor visibility, your following distance should be:",
    options: [
      "Reduced to keep up with traffic",
      "Increased to at least three to four seconds",
      "Kept exactly the same",
      "Ignored if you have ABS",
    ],
    correctIndex: 1,
    explanation:
      "Wet roads lengthen braking distance, so increase the gap to at least three to four seconds to give yourself time to stop.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_fd_tailgated",
    categoryId: "following_distance",
    prompt: "If the vehicle behind you is following too closely (tailgating), the safest response is to:",
    options: [
      "Brake suddenly to warn them",
      "Increase your own following distance to the car ahead and let them pass",
      "Speed up well over the limit",
      "Switch on your hazards and stop",
    ],
    correctIndex: 1,
    explanation:
      "Tailgating removes your safety buffer. Increase the gap in front so you can brake gently, and allow the tailgater to overtake when it is safe.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_fd_braking",
    categoryId: "following_distance",
    prompt: "Compared to 60 km/h, your braking distance at 120 km/h is roughly:",
    options: [
      "About the same",
      "Twice as long",
      "About four times as long",
      "Shorter, because of momentum",
    ],
    correctIndex: 2,
    explanation:
      "Braking distance increases with the square of speed — doubling your speed roughly quadruples the distance needed to stop. This is why speed dramatically affects crash severity.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_fd_following_truck",
    categoryId: "following_distance",
    prompt: "Why should you leave a larger gap when following a heavy truck?",
    options: [
      "Trucks accelerate faster than cars",
      "Your view ahead is blocked and trucks need more space to stop",
      "Trucks are not allowed on the same road",
      "It saves fuel",
    ],
    correctIndex: 1,
    explanation:
      "A large vehicle blocks your view of the road ahead and may stop or slow unexpectedly; a bigger gap improves your sightline and reaction time.",
    difficulty: 2,
    scope: "learners",
  },

  // ── HAZARD AWARENESS ───────────────────────────────────────
  {
    id: "q_haz_scan",
    categoryId: "hazard_awareness",
    prompt: "Good defensive driving means you should:",
    options: [
      "Focus only on the car directly ahead",
      "Continuously scan far ahead, to the sides and your mirrors for developing hazards",
      "Drive faster to clear hazards quickly",
      "Rely on other drivers to avoid you",
    ],
    correctIndex: 1,
    explanation:
      "Defensive driving means actively scanning the whole scene — far ahead, the sides and mirrors — so you anticipate hazards early and always have an escape plan.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_haz_children",
    categoryId: "hazard_awareness",
    prompt: "You are driving past a parked ice-cream van with children nearby. You should:",
    options: [
      "Maintain speed and hoot",
      "Slow down and cover the brake, anticipating a child running into the road",
      "Speed up to pass quickly",
      "Flash your lights and continue",
    ],
    correctIndex: 1,
    explanation:
      "Children are unpredictable and may run out without looking. Reduce speed, cover the brake and be ready to stop.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_haz_fatigue",
    categoryId: "hazard_awareness",
    prompt: "You start feeling drowsy on a long drive. The safest action is to:",
    options: [
      "Open the window and push on",
      "Stop in a safe place and rest before continuing",
      "Drink coffee and double your speed",
      "Turn the music up loud",
    ],
    correctIndex: 1,
    explanation:
      "Fatigue badly impairs reaction time and judgement. The only real fix is to stop somewhere safe and rest; tricks like fresh air only mask the problem briefly.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_haz_blind_spot",
    categoryId: "hazard_awareness",
    prompt: "Before changing lanes, in addition to checking your mirrors you must:",
    options: [
      "Sound your hooter",
      "Glance over your shoulder to check the blind spot",
      "Switch on your headlights",
      "Nothing — mirrors show everything",
    ],
    correctIndex: 1,
    explanation:
      "Mirrors leave a blind spot beside and behind the vehicle. A quick shoulder check before changing lanes catches a vehicle the mirrors cannot show.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_haz_aquaplane",
    categoryId: "hazard_awareness",
    prompt: "If your vehicle begins to aquaplane (skim on water), you should:",
    options: [
      "Brake hard immediately",
      "Ease off the accelerator and hold the steering steady until grip returns",
      "Accelerate to push through the water",
      "Swerve sharply to one side",
    ],
    correctIndex: 1,
    explanation:
      "During aquaplaning the tyres lose contact with the road. Avoid sudden braking or steering — gently lift off the accelerator and keep the wheel steady until the tyres regain grip.",
    difficulty: 3,
    scope: "learners",
  },
];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export function questionsByCategory(categoryId: Question["categoryId"]) {
  return QUESTIONS.filter((q) => q.categoryId === categoryId);
}
