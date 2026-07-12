import type { Flashcard, Question } from "@/types";

/**
 * Sprint 7 — motorcycle (A/A1) & heavy (10/14) depth. Facts trace to
 * docs/content/facts/bike-heavy.md. Code-gated so each learner only sees their
 * own vehicle group. Bike = codes ["A"] (covers A/A1); heavy = ["10","14"]
 * general or ["14"] articulated-specific. Only fresh angles (existing coded
 * prompts were checked for duplicates).
 */
export const BIKE_HEAVY_PACK_QUESTIONS: Question[] = [
  // ── MOTORCYCLE (A / A1) ─────────────────────────────────────
  {
    id: "q10_mc_countersteer",
    categoryId: "controls",
    codes: ["A"],
    prompt: "To make a motorcycle lean and turn LEFT at normal road speed, you:",
    options: [
      "Turn the handlebar to the right",
      "Press (push) the LEFT bar forward — countersteering leans the bike left",
      "Lean your body only, hands off",
      "Pull the front brake",
    ],
    correctIndex: 1,
    explanation:
      "Above walking pace a bike countersteers: a gentle push on the left bar leans it left. Understanding this is what lets you steer precisely and swerve in an emergency.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q10_mc_lane_position",
    categoryId: "controls",
    codes: ["A"],
    prompt: "The best general lane position for a motorcycle is:",
    options: [
      "The oily strip in the centre of the lane",
      "A dominant/buffer position that maximises your visibility and space, away from the slippery centre",
      "As close to the kerb as possible",
      "Right on the centre line",
    ],
    correctIndex: 1,
    explanation:
      "The centre strip collects oil and is slippery; the edges hide you and gather debris. A buffer position keeps you visible with an escape route on each side.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_mc_cornering",
    categoryId: "controls",
    codes: ["A"],
    prompt: "The K53 cornering routine for a motorcycle is best summed up as:",
    options: [
      "Brake hard in the corner, then accelerate",
      "Slow–look–lean–roll: set your speed before the bend, look through it, lean, then roll on the throttle",
      "Keep a constant speed and stare at the road just ahead",
      "Coast through in neutral",
    ],
    correctIndex: 1,
    explanation:
      "Get your braking done before the turn, look to where you want to exit, lean, and gently roll on the power. Braking mid-corner is what stands a bike up and runs it wide.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q10_mc_both_brakes",
    categoryId: "controls",
    codes: ["A"],
    prompt: "For the shortest safe stop on a dry road, a motorcyclist should:",
    options: [
      "Use the rear brake only",
      "Use BOTH brakes, with more emphasis on the front (it does most of the stopping)",
      "Use the front brake only, as hard as possible",
      "Change down and coast to a stop",
    ],
    correctIndex: 1,
    explanation:
      "Both brakes together stop you fastest; the front does the bulk of the work in the dry. On loose or wet surfaces ease off the front to avoid locking the wheel.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_mc_smidsy",
    categoryId: "hazard_awareness",
    codes: ["A"],
    prompt: "The safest mindset about how car drivers see you on a motorcycle is to:",
    options: [
      "Assume they've seen you because you have right of way",
      "Assume they HAVEN'T seen you — ride to be visible and keep an escape route",
      "Rely on your hooter to be noticed",
      "Ride in their blind spot to be safe",
    ],
    correctIndex: 1,
    explanation:
      "'Sorry mate, I didn't see you' is the commonest cause of bike crashes. Ride as if you're invisible: bright gear, headlamp on, good lane position, always an out.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_mc_gravel",
    categoryId: "hazard_awareness",
    codes: ["A"],
    prompt: "Riding onto a loose gravel or sandy patch, you should:",
    options: [
      "Grab the front brake and stop",
      "Stay relaxed and upright, off the front brake, with smooth throttle and steering",
      "Lean the bike over hard",
      "Accelerate sharply to power through",
    ],
    correctIndex: 1,
    explanation:
      "On loose surfaces the front wheel washes out easily. Keep it upright, avoid sudden inputs and the front brake, and let the bike track through gently.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q10_mc_preride",
    categoryId: "controls",
    codes: ["A"],
    prompt: "A sound pre-ride check on a motorcycle covers:",
    options: [
      "Only the fuel level",
      "Tyres, controls (brakes/throttle/clutch), lights & indicators, oil/fluids and chain tension",
      "Just the mirrors",
      "Nothing — bikes are simple",
    ],
    correctIndex: 1,
    explanation:
      "A bike gives less warning than a car and no cage to protect you. A quick tyres–controls–lights–oil–chain check before every ride catches faults before they bite.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q10_mc_stop_position",
    categoryId: "controls",
    codes: ["A"],
    prompt: "Stopped at a red robot on a motorcycle, you should:",
    options: [
      "Select neutral and relax with both feet up",
      "Stay in gear with a foot down and watch your mirror for a vehicle that may not stop behind you",
      "Switch the engine off",
      "Sit directly on the centre line",
    ],
    correctIndex: 1,
    explanation:
      "In gear you can move off instantly — including out of the way of a car braking too late. Watching your mirror at a stop is a rider's rear-end insurance.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_mc_look_through",
    categoryId: "controls",
    codes: ["A"],
    prompt: "When taking a bend or avoiding a hazard on a motorcycle, you should look:",
    options: [
      "Down at your front wheel",
      "To where you WANT to go — the bike follows your eyes",
      "At the hazard itself",
      "At your speedometer",
    ],
    correctIndex: 1,
    explanation:
      "A bike goes where you look. Fix on the obstacle (target fixation) and you'll steer into it; look at the escape path and you'll ride to it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_mc_wind_blast",
    categoryId: "hazard_awareness",
    codes: ["A"],
    prompt: "As a large truck passes you (or you pass it) on the open road, expect:",
    options: [
      "Smoother air behind it",
      "A blast of turbulence that can push the bike sideways — grip firmly and hold your line",
      "Your engine to stall",
      "Better grip from the draft",
    ],
    correctIndex: 1,
    explanation:
      "The bow wave and wake of a big vehicle shove a light motorcycle around. Anticipate it, firm up on the bars, and don't be surprised into a wobble.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_mc_pillion",
    categoryId: "controls",
    codes: ["A"],
    prompt: "A pillion (passenger) on your motorcycle should:",
    options: [
      "Lean the opposite way to you for balance",
      "Hold on, keep their feet on the pegs and lean WITH you through corners",
      "Sit as far back as possible",
      "Put their feet down at every stop",
    ],
    correctIndex: 1,
    explanation:
      "A passenger who fights the lean upsets the bike. They should move with you and keep their feet on the pegs — brief them before they get on.",
    difficulty: 2,
    scope: "learners",
  },

  // ── HEAVY (Code 10 / 14) ────────────────────────────────────
  {
    id: "q10_hv_low_air",
    categoryId: "controls",
    codes: ["10", "14"],
    prompt: "While driving, the low air-pressure warning (buzzer/light) activates. You should:",
    options: [
      "Carry on to the next depot",
      "Stop safely as soon as possible and not drive on — the brakes can fail as pressure falls",
      "Pump the brake pedal to build pressure",
      "Switch the warning off and continue",
    ],
    correctIndex: 1,
    explanation:
      "Air brakes rely on system pressure. When it drops far enough the brakes stop working (or the spring brakes slam on). Stop and fix the leak before going anywhere.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_hv_rollover",
    categoryId: "hazard_awareness",
    codes: ["10", "14"],
    prompt: "Why must a heavy vehicle (especially loaded or a tanker) slow right down for a traffic circle or off-ramp?",
    options: [
      "To save fuel",
      "Its high centre of gravity makes it prone to rolling over in a tight curve",
      "Trucks are not allowed in circles",
      "To let cars overtake",
    ],
    correctIndex: 1,
    explanation:
      "A tall, loaded truck tips long before a car would. Curves and off-ramps are classic rollover spots — take them far slower than the posted limit suggests.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_hv_offtracking",
    categoryId: "hazard_awareness",
    codes: ["14"],
    prompt: "When an articulated truck turns a corner, the trailer's rear wheels:",
    options: [
      "Follow the exact path of the front wheels",
      "Track INSIDE the tractor's path (cut in) — so the driver must swing wide and watch for cyclists/kerbs",
      "Swing outward only",
      "Lift off the ground",
    ],
    correctIndex: 1,
    explanation:
      "Off-tracking means the trailer cuts the corner tighter than the cab. Drivers swing wide to compensate — and other road users must never sit up the inside of a turning truck.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q10_hv_coupling_lock",
    categoryId: "controls",
    codes: ["14"],
    prompt: "After coupling a trailer to the tractor's fifth wheel, you must confirm that:",
    options: [
      "The trailer looks roughly lined up",
      "The kingpin is fully engaged and locked by the jaws (safety catch on), then verify with a tug test",
      "The landing legs are still down",
      "The mudflaps are clean",
    ],
    correctIndex: 1,
    explanation:
      "A kingpin that isn't locked in can drop the trailer as you pull away. Check the jaws are closed and the safety catch is set, then a gentle tug test proves it's holding.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q10_hv_reverse_artic",
    categoryId: "controls",
    codes: ["14"],
    prompt: "Reversing an articulated combination straight requires you to:",
    options: [
      "Steer the same way you want the trailer to go, quickly",
      "Make small, opposite steering corrections and use a banksman or get out and look",
      "Reverse fast so the trailer stays straight",
      "Lock the diff and hold the wheel still",
    ],
    correctIndex: 1,
    explanation:
      "The trailer swings opposite to your steering, so you correct with small inputs the 'wrong' way and constantly counter. Rear vision is poor — use a spotter and check on foot.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q10_hv_axle_load",
    categoryId: "controls",
    codes: ["10", "14"],
    prompt: "Even when a load is within the vehicle's total GVM, you must still:",
    options: [
      "Pile it over the rear axle for traction",
      "Distribute it so no single axle is overloaded",
      "Put it all at the front",
      "Ignore where it sits",
    ],
    correctIndex: 1,
    explanation:
      "An axle can be over its limit while the total is legal. Overloaded axles wreck tyres, brakes and the road — and steering/braking suffer. Spread the weight correctly.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q10_hv_overload_effect",
    categoryId: "hazard_awareness",
    codes: ["10", "14"],
    prompt: "The main safety effect of overloading a heavy vehicle is:",
    options: [
      "Better grip and shorter stops",
      "Longer braking distance, overheating tyres/brakes and instability — as well as being illegal",
      "Nothing, if you drive slowly",
      "Improved fuel economy",
    ],
    correctIndex: 1,
    explanation:
      "Extra mass takes longer to stop and cooks the brakes and tyres. Overloading causes blowouts and brake failure on descents — the reason it's heavily fined.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_hv_dangerous_goods",
    categoryId: "rules",
    codes: ["10", "14"],
    prompt: "Transporting dangerous goods, the vehicle must display:",
    options: [
      "Nothing special",
      "The correct hazard placards/diamonds, and the driver must hold a PrDP (dangerous-goods category)",
      "Only a red flag",
      "A green cross",
    ],
    correctIndex: 1,
    explanation:
      "Placards warn emergency services what they're dealing with in a crash, and the D-category PrDP means the driver is vetted and trained for the load.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_hv_dual_tyre",
    categoryId: "controls",
    codes: ["10", "14"],
    prompt: "Checking the tyres on a dual (twin) wheel set, you must:",
    options: [
      "Check the outer tyre only",
      "Check BOTH tyres — a deflated inner tyre is easy to miss and overloads its partner",
      "Kick them and move on",
      "Only check pressure once a month",
    ],
    correctIndex: 1,
    explanation:
      "A flat inner tyre on a dual set hides behind the outer one, then the good tyre carries double load and fails. Check and feel both every pre-trip.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q10_hv_uncouple",
    categoryId: "controls",
    codes: ["14"],
    prompt: "The correct order when uncoupling a trailer is to:",
    options: [
      "Release the kingpin, then lower the landing legs",
      "Apply the trailer parking brake and lower/secure the landing legs BEFORE releasing the kingpin",
      "Just drive the tractor away",
      "Disconnect the air lines only",
    ],
    correctIndex: 1,
    explanation:
      "The trailer must be braked and standing on its legs before you unlock the kingpin — otherwise it drops or rolls the moment the tractor pulls out.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q10_hv_brake_fade",
    categoryId: "hazard_awareness",
    codes: ["10", "14"],
    prompt: "'Brake fade' on a long descent happens when:",
    options: [
      "The brake fluid freezes",
      "Continuous braking overheats the brakes until they lose effectiveness — avoided by using a low gear and engine/retarder braking",
      "The air tanks are too full",
      "You brake too gently",
    ],
    correctIndex: 1,
    explanation:
      "Riding the service brakes down a long hill bakes them until they barely work. Select a low gear at the top and let engine braking / the retarder hold the speed.",
    difficulty: 2,
    scope: "learners",
  },
];

export const BIKE_HEAVY_PACK_FLASHCARDS: Flashcard[] = [
  // Motorcycle
  { id: "fc10_mc_countersteer", categoryId: "controls", codes: ["A"], front: "Countersteering — turn left how?", back: "Push the LEFT bar forward; the bike leans and goes left (above walking pace).", difficulty: 3 },
  { id: "fc10_mc_position", categoryId: "controls", codes: ["A"], front: "Best lane position on a bike?", back: "Dominant/buffer position for visibility and space — avoid the oily centre strip.", difficulty: 2 },
  { id: "fc10_mc_corner", categoryId: "controls", codes: ["A"], front: "Cornering routine?", back: "Slow–look–lean–roll: speed set before the bend, look through it, lean, roll on.", difficulty: 3 },
  { id: "fc10_mc_brakes", categoryId: "controls", codes: ["A"], front: "Shortest dry stop on a bike?", back: "Both brakes, more front (does most of the stopping). Ease the front on wet/loose.", difficulty: 2 },
  { id: "fc10_mc_smidsy", categoryId: "hazard_awareness", codes: ["A"], front: "How do car drivers see you?", back: "Assume they DON'T — ride visible, headlamp on, keep an escape route.", difficulty: 2 },
  { id: "fc10_mc_gravel", categoryId: "hazard_awareness", codes: ["A"], front: "Loose gravel patch?", back: "Upright, relaxed, off the front brake, smooth inputs.", difficulty: 3 },
  { id: "fc10_mc_preride", categoryId: "controls", codes: ["A"], front: "Pre-ride check covers?", back: "Tyres, controls, lights, oil/fluids, chain tension.", difficulty: 1 },
  { id: "fc10_mc_stop", categoryId: "controls", codes: ["A"], front: "Stopped at a robot on a bike?", back: "In gear, foot down, watch the mirror for a car not stopping behind you.", difficulty: 2 },
  { id: "fc10_mc_look", categoryId: "controls", codes: ["A"], front: "Where to look in a bend/emergency?", back: "Where you WANT to go — the bike follows your eyes.", difficulty: 2 },
  { id: "fc10_mc_pillion", categoryId: "controls", codes: ["A"], front: "How should a pillion ride?", back: "Hold on, feet on the pegs, lean WITH you — never fight the lean.", difficulty: 2 },

  // Heavy
  { id: "fc10_hv_low_air", categoryId: "controls", codes: ["10", "14"], front: "Low air-pressure warning while driving?", back: "Stop safely and don't drive on — the brakes can fail.", difficulty: 2 },
  { id: "fc10_hv_rollover", categoryId: "hazard_awareness", codes: ["10", "14"], front: "Why slow right down in circles/off-ramps?", back: "High centre of gravity → rollover risk, especially loaded/tankers.", difficulty: 2 },
  { id: "fc10_hv_offtrack", categoryId: "hazard_awareness", codes: ["14"], front: "Trailer wheels on a turn?", back: "Track INSIDE the cab's path (cut in) — swing wide, watch cyclists/kerbs.", difficulty: 3 },
  { id: "fc10_hv_coupling", categoryId: "controls", codes: ["14"], front: "After coupling the fifth wheel?", back: "Kingpin fully locked in the jaws + safety catch, then a tug test.", difficulty: 3 },
  { id: "fc10_hv_reverse", categoryId: "controls", codes: ["14"], front: "Reversing an artic straight?", back: "Small OPPOSITE steering corrections; use a banksman / get out and look.", difficulty: 3 },
  { id: "fc10_hv_axle", categoryId: "controls", codes: ["10", "14"], front: "Load within GVM — still a duty?", back: "Distribute it so no single axle is overloaded.", difficulty: 3 },
  { id: "fc10_hv_overload", categoryId: "hazard_awareness", codes: ["10", "14"], front: "Effect of overloading?", back: "Longer braking, overheating tyres/brakes, instability — and it's illegal.", difficulty: 2 },
  { id: "fc10_hv_dg", categoryId: "rules", codes: ["10", "14"], front: "Carrying dangerous goods?", back: "Display hazard placards + hold a PrDP (D category).", difficulty: 2 },
  { id: "fc10_hv_dual", categoryId: "controls", codes: ["10", "14"], front: "Dual (twin) tyre check?", back: "Check BOTH — a flat inner hides and overloads its partner.", difficulty: 2 },
  { id: "fc10_hv_uncouple", categoryId: "controls", codes: ["14"], front: "Uncoupling order?", back: "Trailer brake + landing legs down BEFORE releasing the kingpin.", difficulty: 3 },
  { id: "fc10_hv_fade", categoryId: "hazard_awareness", codes: ["10", "14"], front: "Brake fade?", back: "Overheated brakes lose effect on long descents — use a low gear + engine/retarder.", difficulty: 2 },
];
