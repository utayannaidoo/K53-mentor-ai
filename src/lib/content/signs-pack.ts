import type { Flashcard, Question } from "@/types";
import { signImg } from "./signs";

/**
 * Sprint 1 — Signs pack. Generated from the fact base in
 * docs/content/facts/signs.md: the manual-extracted sign catalogue
 * (signs.catalog.json), SARTSM class grammar, high-yield confusion pairs and
 * road markings. Images are real manual crops via signImg(); items covering
 * signs without a verified image ship text-first.
 */
export const SIGNS_PACK_QUESTIONS: Question[] = [
  // ── Sign-system grammar ─────────────────────────────────────
  {
    id: "q4_sign_grammar_red_ring",
    categoryId: "signs",
    prompt: "A circular sign with a red ring around a symbol means:",
    options: [
      "A warning of the hazard shown",
      "The action or vehicle shown is prohibited",
      "The action shown is compulsory",
      "Information only",
    ],
    correctIndex: 1,
    explanation:
      "The sign grammar: red-ringed circle = prohibition, plain blue circle = command, red-bordered triangle = warning. Read the shape and colour before the symbol.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_grammar_blue",
    categoryId: "signs",
    prompt: "A plain blue circular sign with a white symbol is a:",
    options: [
      "Prohibition — you may not do what is shown",
      "Command — you MUST do what is shown",
      "Warning of a hazard",
      "Tourism direction",
    ],
    correctIndex: 1,
    explanation:
      "Blue circles are command signs: keep left, proceed in the arrow's direction, switch headlamps on. They order an action, not forbid one.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_grammar_triangle",
    categoryId: "signs",
    prompt: "Red-bordered triangular signs (point up) are used to:",
    options: [
      "Prohibit turning",
      "Warn you of a hazard or change in the road ahead",
      "Show compulsory actions",
      "Mark freeway exits",
    ],
    correctIndex: 1,
    explanation:
      "Warning signs are triangles with a red border. They demand earlier scanning and often a lower speed — the hazard itself follows after the sign.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_temporary",
    categoryId: "signs",
    prompt: "The same sign on a YELLOW background instead of white means:",
    options: [
      "It is advisory only",
      "It is a temporary sign (e.g. roadworks) with the same legal force as the permanent one",
      "It applies to taxis only",
      "It applies at night only",
    ],
    correctIndex: 1,
    explanation:
      "Yellow-background signs are temporary versions used at roadworks and incidents. A temporary 60 limit is just as enforceable as a permanent one.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_shapes_unique",
    categoryId: "signs",
    prompt: "Why do the stop sign (octagon) and yield sign (inverted triangle) have unique shapes?",
    options: [
      "Tradition from older manuals",
      "So they can be recognised from behind or when covered in dirt/snow",
      "To be cheaper to manufacture",
      "The shapes have no meaning",
    ],
    correctIndex: 1,
    explanation:
      "The two most safety-critical signs are the only ones with their shapes — recognisable even when the face is unreadable or seen from the back.",
    difficulty: 3,
    scope: "learners",
  },

  // ── Commands (verified catalogue signs) ─────────────────────
  {
    id: "q4_sign_headlights_cmd",
    categoryId: "signs",
    image: signImg("headlights_on"),
    prompt: "This blue command sign requires you to:",
    options: [
      "Switch your headlamps on (dipped) to see and be seen",
      "Flash your headlights at oncoming traffic",
      "Use fog lamps only",
      "Switch all lights off in the tunnel",
    ],
    correctIndex: 0,
    explanation:
      "The headlamps-on command appears before tunnels and permanent low-visibility stretches: lights on, in the dip position — brights would blind oncoming drivers.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_pass_side",
    categoryId: "signs",
    image: signImg("pass_side"),
    prompt: "This command sign at an obstruction tells you to:",
    options: [
      "Stop before the obstruction",
      "Pass the obstruction on the side the arrow indicates",
      "Turn around",
      "Give way to oncoming traffic",
    ],
    correctIndex: 1,
    explanation:
      "Pass-on-this-side commands stand on islands and works barriers: you must drive past on the indicated side, never the other.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_proceed_direction",
    categoryId: "signs",
    image: signImg("proceed_direction"),
    prompt: "This blue sign with a single arrow means:",
    options: [
      "One-way street ends ahead",
      "You must proceed only in the direction of the arrow",
      "Overtaking allowed in that direction",
      "Parking that side only",
    ],
    correctIndex: 1,
    explanation:
      "Proceed-direction commands leave no choice: drive only where the arrow points. (The similar-looking one-way sign describes the road; this one orders your movement.)",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_circle_clockwise",
    categoryId: "signs",
    image: signImg("circle_clockwise"),
    prompt: "At a junction displaying this sign you must:",
    options: [
      "Move in a clockwise direction around the circle",
      "Stop before entering",
      "Turn left only",
      "Reverse out — the road is closed",
    ],
    correctIndex: 0,
    explanation:
      "The traffic-circle command means circulate clockwise (keeping the island on your right in SA's left-hand traffic) and yield per the circle rules.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Prohibitions (verified catalogue signs) ─────────────────
  {
    id: "q4_sign_no_left_int",
    categoryId: "signs",
    image: signImg("no_left_intersection"),
    prompt: "This sign at an intersection prohibits:",
    options: [
      "Turning left at the intersection",
      "Overtaking on the left",
      "Parking on the left",
      "Entering the intersection at all",
    ],
    correctIndex: 0,
    explanation:
      "No-left-turn at an intersection. Everything else — straight, right (unless also signed) — remains allowed.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_no_ot_trucks",
    categoryId: "signs",
    image: signImg("no_overtaking_trucks"),
    prompt: "This sign restricts overtaking for:",
    options: [
      "All vehicles",
      "Goods vehicles — they may not overtake for the next 500 m",
      "Motorcycles only",
      "Vehicles towing trailers",
    ],
    correctIndex: 1,
    explanation:
      "The truck-symbol no-overtaking sign binds goods vehicles only, typically on climbs where a slow truck overtaking a slower one blocks the road for kilometres.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_no_hooter",
    categoryId: "signs",
    image: signImg("no_hooter"),
    prompt: "In the area after this sign you may not:",
    options: [
      "Use your hooter / make excessive noise (except to warn of real danger)",
      "Play the radio",
      "Drive a diesel vehicle",
      "Exceed 60 km/h",
    ],
    correctIndex: 0,
    explanation:
      "Noise-prohibition zones protect hospitals and similar areas. A genuine danger warning is still allowed — casual hooting is not.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_reserved_lane",
    categoryId: "signs",
    image: signImg("reserved_lane_bus"),
    prompt: "A reservation sign with a bus symbol above a lane means:",
    options: [
      "Buses may not use this lane",
      "The lane (left of the solid yellow line) is for the exclusive use of buses",
      "Bus stop ahead",
      "All heavy vehicles must use this lane",
    ],
    correctIndex: 1,
    explanation:
      "Reservation signs dedicate a lane to the class shown. Other vehicles stay out of it except to cross for a turn where permitted.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_no_stopping_vs_parking",
    categoryId: "signs",
    prompt: "The difference between a NO STOPPING and a NO PARKING restriction is:",
    options: [
      "They mean the same thing",
      "No stopping bans even a brief halt; no parking still allows briefly stopping to load or drop off",
      "No stopping applies only to trucks",
      "No parking applies only at night",
    ],
    correctIndex: 1,
    explanation:
      "No-stopping is the stricter one: wheels may not stop turning there at all. Under no-parking you may pause to set down a passenger, but not leave the vehicle.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_derestriction",
    categoryId: "signs",
    prompt: "A prohibition sign shown with a diagonal band through the symbol usually indicates:",
    options: [
      "The prohibition is about to start",
      "The end of that restriction",
      "The restriction applies twice as strongly",
      "The sign is out of order",
    ],
    correctIndex: 1,
    explanation:
      "De-restriction signs repeat the symbol with a crossing band to signal where the restriction ends — e.g. the end of a no-overtaking stretch.",
    difficulty: 3,
    scope: "learners",
  },

  // ── Classics re-drilled with variation ──────────────────────
  {
    id: "q4_sign_stop_vs_yield",
    categoryId: "signs",
    image: signImg("stop"),
    prompt: "The key difference between STOP and YIELD is:",
    options: [
      "There is none — both mean slow down",
      "STOP requires a complete halt every time; YIELD requires giving way, stopping only if necessary",
      "YIELD applies only to trucks",
      "STOP applies only when traffic is visible",
    ],
    correctIndex: 1,
    explanation:
      "At a stop sign your wheels must stop turning even on an empty road. At a yield you keep moving if the way is genuinely clear — but must be ready to stop.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_no_entry_vs_oneway",
    categoryId: "signs",
    image: signImg("no_entry"),
    prompt: "You face this sign at the mouth of a street. It tells you:",
    options: [
      "The street is one-way in your favour",
      "No vehicle may enter from this side — traffic flows towards you",
      "Pedestrians only beyond this point",
      "Road closed to trucks",
    ],
    correctIndex: 1,
    explanation:
      "No-entry guards the wrong end of one-way streets. Entering means meeting the full flow head-on.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_robot_amber_meaning",
    categoryId: "signs",
    image: signImg("robot_amber"),
    prompt: "A steady amber traffic signal means:",
    options: [
      "Speed up — red is coming",
      "Stop, unless you are so close that you cannot stop safely",
      "Proceed with a hoot",
      "The signal is out of order",
    ],
    correctIndex: 1,
    explanation:
      "Amber is legally a stop signal with one exception: when a safe stop is no longer possible. It is never an invitation to accelerate.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_flashing_red",
    categoryId: "signs",
    prompt: "A FLASHING red traffic signal at an intersection means:",
    options: [
      "The same as a steady red — wait for green",
      "Stop completely, then proceed when safe (treat like a stop sign)",
      "The intersection is closed",
      "Emergency vehicles only",
    ],
    correctIndex: 1,
    explanation:
      "Flashing red = stop sign behaviour: full stop, take your turn, go when clear. Steady red = remain stopped until the light changes.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_green_arrow",
    categoryId: "signs",
    prompt: "A green ARROW signal (rather than a full green disc) means:",
    options: [
      "You may proceed in any direction",
      "You may proceed only in the direction of the arrow — that movement is protected",
      "Only taxis may proceed",
      "The robot is malfunctioning",
    ],
    correctIndex: 1,
    explanation:
      "A green arrow authorises just that movement, with conflicting streams held on red — which is why turning on an arrow is safer than turning on a full green.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_railway_action",
    categoryId: "signs",
    image: signImg("railway"),
    prompt: "Approaching this warning sign, the correct behaviour is to:",
    options: [
      "Speed up to clear the crossing quickly",
      "Slow down, look and listen for trains, and be ready to stop — never stop ON the tracks",
      "Hoot continuously over the crossing",
      "Stop on the tracks and check both ways",
    ],
    correctIndex: 1,
    explanation:
      "Railway crossings kill because drivers queue onto the tracks. Only enter the crossing when your exit is clear, and obey booms and flashing signals absolutely.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_children_response",
    categoryId: "signs",
    image: signImg("children"),
    prompt: "Past this warning sign the K53 defensive response is to:",
    options: [
      "Maintain speed but hoot at intervals",
      "Reduce speed, cover the brake and scan verges and parked cars for children",
      "Switch on headlights",
      "Change to a higher gear",
    ],
    correctIndex: 1,
    explanation:
      "Children are small, fast and unpredictable — near schools expect one to appear from between parked cars. Speed down, foot ready.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_steep_descent_action",
    categoryId: "signs",
    image: signImg("steep_descent"),
    prompt: "Seeing this sign at the top of a long hill, you should:",
    options: [
      "Coast down in neutral to save fuel",
      "Select a lower gear BEFORE descending so engine braking holds your speed",
      "Ride the brakes the whole way down",
      "Overtake slower traffic before the hill",
    ],
    correctIndex: 1,
    explanation:
      "Engine braking preserves your brakes for emergencies; constant braking overheats them exactly where you need them most. Coasting in neutral is illegal and dangerous.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_sign_speed_min",
    categoryId: "signs",
    prompt: "A speed shown in a blue circular sign (not red-ringed) indicates:",
    options: [
      "The usual maximum speed",
      "A minimum speed — you may not travel slower where conditions allow",
      "The recommended parking duration",
      "A truck-only limit",
    ],
    correctIndex: 1,
    explanation:
      "Blue circle = command, so a number in blue commands a MINIMUM speed (used on freeways). Red ring = maximum. Same number, opposite meaning.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q4_sign_guidance_green",
    categoryId: "signs",
    prompt: "Large green boards over or beside a freeway are:",
    options: [
      "Regulatory — they must be obeyed like a stop sign",
      "Guidance signs — routes, destinations and exits to help you plan lanes early",
      "Advertising",
      "Temporary roadworks signs",
    ],
    correctIndex: 1,
    explanation:
      "Green guidance boards don't command anything, but reading them late is how drivers swerve across three lanes at an exit. Read early, move early.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_sign_brown_tourism",
    categoryId: "signs",
    prompt: "Brown road signs indicate:",
    options: [
      "Gravel roads",
      "Tourist attractions and places of interest",
      "Military areas",
      "Roads without cell reception",
    ],
    correctIndex: 1,
    explanation:
      "Brown is the tourism colour in the SADC sign system — game reserves, wine routes, viewpoints.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Road markings ───────────────────────────────────────────
  {
    id: "q4_mark_stop_line",
    categoryId: "signs",
    prompt: "A solid white line painted ACROSS your lane at an intersection is:",
    options: [
      "A yield line — slow down",
      "A stop line — stop behind it (with a stop sign/red signal)",
      "The start of a pedestrian crossing",
      "Decoration marking the intersection",
    ],
    correctIndex: 1,
    explanation:
      "Solid across the lane = stop line; a BROKEN line across = yield line. Stop with your front wheels behind the solid line, not on it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_mark_centre_broken",
    categoryId: "signs",
    prompt: "A broken white centre line means:",
    options: [
      "Overtaking is prohibited",
      "You may cross it to overtake or turn WHEN it is safe and legal to do so",
      "The road is one-way",
      "Cycles only beyond the line",
    ],
    correctIndex: 1,
    explanation:
      "Broken centre lines permit crossing — the line never makes an unsafe overtake safe. Solid (barrier) lines remove the permission entirely.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q4_mark_barrier_side",
    categoryId: "signs",
    prompt: "The centre of the road has a solid line and a broken line side by side. Which applies to you?",
    options: [
      "Always the solid line",
      "The line nearest to your side of the road",
      "Always the broken line",
      "Whichever the driver prefers",
    ],
    correctIndex: 1,
    explanation:
      "Combination lines are read from your own lane: solid on your side = no crossing for you; broken on your side = you may cross when safe, even while oncoming traffic may not.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_mark_painted_island",
    categoryId: "signs",
    prompt: "An area of diagonal white stripes painted on the road surface (painted island) means:",
    options: [
      "Extra grip zone for braking",
      "Keep off — drive around it, crossing only in a genuine emergency",
      "Free parking area",
      "Pedestrian zone",
    ],
    correctIndex: 1,
    explanation:
      "Painted islands separate or channel traffic streams. Using one as a shortcut or overtaking lane defeats its purpose and is an offence.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_mark_yellow_edge",
    categoryId: "signs",
    prompt: "A continuous yellow line along the LEFT edge of the roadway indicates:",
    options: [
      "The start of a cycle lane",
      "No stopping alongside it (except emergencies or where a sign permits)",
      "Overflow parking",
      "The road narrows ahead",
    ],
    correctIndex: 1,
    explanation:
      "The yellow edge line is a no-stopping instruction painted onto the road itself — common where a stopped car would block visibility or flow.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_mark_arrow_lane",
    categoryId: "signs",
    prompt: "You're in a lane with a painted LEFT-turn arrow but you want to go straight. You must:",
    options: [
      "Go straight anyway — arrows are advisory",
      "Turn left as the arrow requires, then find a safe place to re-route",
      "Stop and reverse into the correct lane",
      "Hoot and change lanes inside the intersection",
    ],
    correctIndex: 1,
    explanation:
      "Lane arrows are regulatory. Making the 'wrong' legal turn and re-routing costs a minute; forcing your intended move across traffic causes collisions.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q4_mark_ped_block",
    categoryId: "signs",
    prompt: "Broad white stripes painted across the road (zebra-style) mark:",
    options: [
      "A speed hump",
      "A pedestrian crossing — give way to pedestrians on or entering it",
      "The end of the speed limit",
      "A bus stop",
    ],
    correctIndex: 1,
    explanation:
      "At a marked pedestrian crossing, people on foot have right of way. Approach at a speed that lets you stop for someone stepping out.",
    difficulty: 1,
    scope: "learners",
  },
];

export const SIGNS_PACK_FLASHCARDS: Flashcard[] = [
  // Grammar
  { id: "fc4_grammar_circle_red", categoryId: "signs", front: "Red-ringed circle?", back: "Prohibition — the action/vehicle shown is forbidden.", difficulty: 1 },
  { id: "fc4_grammar_circle_blue", categoryId: "signs", front: "Plain blue circle?", back: "Command — you MUST do what is shown.", difficulty: 1 },
  { id: "fc4_grammar_triangle", categoryId: "signs", front: "Red-bordered triangle?", back: "Warning — hazard or road change ahead. Scan and slow.", difficulty: 1 },
  { id: "fc4_grammar_yellow_bg", categoryId: "signs", front: "Sign on a yellow background?", back: "Temporary (roadworks) — same legal force as the permanent white version.", difficulty: 1 },
  { id: "fc4_grammar_shapes", categoryId: "signs", front: "Only two signs with unique shapes?", back: "Stop (octagon) and yield (inverted triangle) — recognisable even unreadable or from behind.", difficulty: 3 },
  { id: "fc4_grammar_derestrict", categoryId: "signs", front: "Symbol repeated with a diagonal band?", back: "End of that restriction (e.g. end of no-overtaking).", difficulty: 3 },

  // Commands / prohibitions (with real images)
  { id: "fc4_headlights", categoryId: "signs", image: signImg("headlights_on"), front: "Blue sign with headlamp symbol?", back: "Command: switch headlamps on (dipped) — see and be seen.", difficulty: 2 },
  { id: "fc4_pass_side", categoryId: "signs", image: signImg("pass_side"), front: "Arrow angled past an obstruction?", back: "Command: pass the obstruction on the indicated side only.", difficulty: 2 },
  { id: "fc4_circle_cmd", categoryId: "signs", image: signImg("circle_clockwise"), front: "Blue circular-arrows sign at a junction?", back: "Traffic circle: circulate clockwise; yield per circle rules.", difficulty: 2 },
  { id: "fc4_no_left_int", categoryId: "signs", image: signImg("no_left_intersection"), front: "Red-ringed left arrow at an intersection?", back: "No left turn at this intersection.", difficulty: 1 },
  { id: "fc4_no_ot_trucks", categoryId: "signs", image: signImg("no_overtaking_trucks"), front: "No-overtaking sign with a truck symbol?", back: "Goods vehicles may not overtake (next 500 m). Cars unaffected.", difficulty: 2 },
  { id: "fc4_no_hooter", categoryId: "signs", image: signImg("no_hooter"), front: "Hooter in a red-ringed circle?", back: "No excessive noise/hooting past this sign — except to warn of real danger.", difficulty: 2 },
  { id: "fc4_reserved_bus", categoryId: "signs", image: signImg("reserved_lane_bus"), front: "Bus symbol reservation sign over a lane?", back: "Lane reserved exclusively for buses (left of the solid yellow line).", difficulty: 2 },
  { id: "fc4_no_stopping", categoryId: "signs", front: "No stopping vs no parking?", back: "No stopping: not even a brief halt. No parking: brief stop to load/drop allowed, leaving the car isn't.", difficulty: 2 },
  { id: "fc4_speed_blue", categoryId: "signs", front: "Speed number in a BLUE circle?", back: "MINIMUM speed command (freeways). Red ring = maximum.", difficulty: 3 },

  // Signals
  { id: "fc4_flashing_red", categoryId: "signs", front: "Flashing red signal?", back: "Treat as a stop sign: full stop, then go when safe.", difficulty: 2 },
  { id: "fc4_flashing_amber", categoryId: "signs", front: "Flashing amber signal?", back: "Proceed with caution — give way as the signs/rules at the junction require.", difficulty: 2 },
  { id: "fc4_green_arrow", categoryId: "signs", front: "Green arrow vs full green?", back: "Arrow = only that movement, protected. Full green = go if clear, but turns must still yield.", difficulty: 2 },
  { id: "fc4_robot_amber", categoryId: "signs", image: signImg("robot_amber"), front: "Steady amber?", back: "Stop — unless you're too close to stop safely. Never an invitation to accelerate.", difficulty: 1 },

  // Warnings
  { id: "fc4_children_sign", categoryId: "signs", image: signImg("children"), front: "Children warning triangle — response?", back: "Slow, cover the brake, scan between parked cars. Expect the unexpected sprint.", difficulty: 1 },
  { id: "fc4_railway_sign", categoryId: "signs", image: signImg("railway"), front: "Railway crossing warning?", back: "Slow, look and listen; enter only when your exit is clear — never queue on the tracks.", difficulty: 1 },
  { id: "fc4_descent", categoryId: "signs", image: signImg("steep_descent"), front: "Steep descent warning?", back: "Low gear BEFORE the hill; engine braking saves your brakes. Never coast in neutral.", difficulty: 2 },

  // Guidance / info
  { id: "fc4_green_boards", categoryId: "signs", front: "Green freeway boards?", back: "Guidance: routes, destinations, exits. Read early, change lanes early.", difficulty: 1 },
  { id: "fc4_brown", categoryId: "signs", front: "Brown signs?", back: "Tourism — attractions and places of interest.", difficulty: 1 },

  // Road markings
  { id: "fc4_mark_across", categoryId: "signs", front: "Line ACROSS your lane: solid vs broken?", back: "Solid = stop line. Broken = yield line.", difficulty: 1 },
  { id: "fc4_mark_centre", categoryId: "signs", front: "Centre line: broken vs solid?", back: "Broken: may cross when safe. Solid (barrier): may not cross at all.", difficulty: 1 },
  { id: "fc4_mark_combo", categoryId: "signs", front: "Solid + broken centre lines together?", back: "Obey the line NEAREST your side of the road.", difficulty: 2 },
  { id: "fc4_mark_island", categoryId: "signs", front: "Diagonal stripes painted on the tar?", back: "Painted island — keep off except in a genuine emergency.", difficulty: 2 },
  { id: "fc4_mark_arrows", categoryId: "signs", front: "Painted lane arrow — advisory or law?", back: "Regulatory: in an arrow lane you must move in that direction, even if there by mistake.", difficulty: 2 },
  { id: "fc4_mark_zebra", categoryId: "signs", front: "Broad white stripes across the road?", back: "Pedestrian crossing — give way to pedestrians on or entering it.", difficulty: 1 },
  { id: "fc4_mark_yellow", categoryId: "signs", front: "Continuous yellow edge line?", back: "No stopping alongside it (emergencies excepted).", difficulty: 2 },
];
