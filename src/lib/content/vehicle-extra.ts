import type { Flashcard, Question, Scenario } from "@/types";

/**
 * Second bike & heavy content batch (codes A1/A and 10/14) — the tracks
 * competitors underserve. Same sourcing rules as questions.vehicle.ts:
 * original wording against the NRTA, K53 manuals and SARTSM; exam-exact
 * figures should be re-checked against the current printed manual edition.
 */

export const VEHICLE_EXTRA_QUESTIONS: Question[] = [
  // ── Motorcycle (A1 / A) ─────────────────────────────────────────────────
  {
    id: "vx_mc_learner_passenger",
    categoryId: "rules",
    prompt: "You hold a learner's licence for a motorcycle. Who may ride with you?",
    options: [
      "One licensed adult passenger",
      "Any passenger, as long as they wear a helmet",
      "No passenger at all — you must ride alone",
      "A qualified instructor only",
    ],
    correctIndex: 2,
    explanation:
      "A motorcycle learner may not carry any passenger. Unlike car learners (who must be supervised by a licensed driver), motorcycle learners ride alone — there is no room for a supervisor, so the law removes passengers entirely.",
    difficulty: 1,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_helmet_both",
    categoryId: "rules",
    prompt: "Who must wear a properly fastened protective helmet on a motorcycle?",
    options: [
      "Only the rider",
      "Only the passenger",
      "Both the rider and any passenger",
      "Neither, if travelling under 60 km/h",
    ],
    correctIndex: 2,
    explanation:
      "The rider and every passenger must each wear a protective helmet, properly fastened. An unfastened helmet is treated the same as no helmet — it comes off in the crash it was meant for.",
    difficulty: 1,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_daytime_headlight",
    categoryId: "rules",
    prompt: "When must a motorcycle's headlamp be switched on?",
    options: [
      "Only at night",
      "Only in rain or fog",
      "Whenever the motorcycle is being ridden — day and night",
      "Only on freeways",
    ],
    correctIndex: 2,
    explanation:
      "Motorcycles must ride with the headlamp on at all times, including daylight. A motorcycle's small frontal profile is easy for drivers to miss; the always-on headlamp is a legal conspicuity requirement.",
    difficulty: 1,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_a1_capacity",
    categoryId: "rules",
    prompt: "A code A1 licence covers motorcycles with an engine capacity of:",
    options: ["Up to 50 cc", "Up to 125 cc", "Up to 250 cc", "Any capacity"],
    correctIndex: 1,
    explanation:
      "Code A1 is for motorcycles up to 125 cc. Code A covers motorcycles above 125 cc. Riding a bigger bike than your code allows is unlicensed driving.",
    difficulty: 1,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_lifesaver",
    categoryId: "hazard_awareness",
    prompt: "Before changing lanes, a rider does a 'lifesaver check'. What is it?",
    options: [
      "A quick glance over the shoulder into the blind spot on the side you're moving toward",
      "Flashing the headlight twice",
      "Checking the fuel gauge",
      "Testing both brakes",
    ],
    correctIndex: 0,
    explanation:
      "Mirrors leave a blind spot big enough to hide a car. The lifesaver is a final shoulder glance into that blind spot, done just before you commit to the lane change — after the mirror check and signal.",
    difficulty: 2,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_wet_paint",
    categoryId: "hazard_awareness",
    prompt: "In wet weather, which road surfaces are most likely to make a motorcycle slide?",
    options: [
      "Coarse new tar",
      "Painted road markings, steel manhole covers and fuel spills",
      "Concrete sections",
      "Gravel shoulders only",
    ],
    correctIndex: 1,
    explanation:
      "Painted lines, steel covers and fuel films become dramatically more slippery when wet — often exactly at intersections where you brake and turn. Cross them upright and off the brakes where possible.",
    difficulty: 2,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_following_wet",
    categoryId: "following_distance",
    prompt: "You're riding in rain. Your following distance should be:",
    options: [
      "The same two seconds as in the dry",
      "At least doubled — braking grip and visibility are both reduced",
      "One second, to stay in the car's spray shadow",
      "Following distance doesn't apply to motorcycles",
    ],
    correctIndex: 1,
    explanation:
      "Two wheels have less grip to spare than four. In rain, double the dry-weather gap: stopping distances stretch, spray hides hazards, and a locked wheel on a bike usually means a fall.",
    difficulty: 1,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_blind_spot_position",
    categoryId: "hazard_awareness",
    prompt: "Riding next to a car, slightly behind its front door, is dangerous mainly because:",
    options: [
      "You block the car's mirrors",
      "You are sitting in the driver's blind spot",
      "It is illegal to ride beside a car",
      "Your headlight blinds the driver",
    ],
    correctIndex: 1,
    explanation:
      "That position is squarely in the driver's blind spot — if they change lanes, you have nowhere to go. Ride where you can see the driver's face in their mirror, or pass through the blind spot without lingering.",
    difficulty: 2,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_truck_wind",
    categoryId: "hazard_awareness",
    prompt: "As you overtake a truck on an open road, you should be ready for:",
    options: [
      "The truck speeding up automatically",
      "A sudden push of wind turbulence as you pass its front",
      "Your engine cutting out",
      "Nothing unusual",
    ],
    correctIndex: 1,
    explanation:
      "Big vehicles shed strong air turbulence. As you clear the cab you can be pushed sideways — pass decisively, grip relaxed but firm, and leave lateral space for the shove.",
    difficulty: 2,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_passenger_rules",
    categoryId: "rules",
    prompt: "A licensed rider may only carry a passenger if:",
    options: [
      "The passenger is an adult",
      "The motorcycle has a proper passenger seat and footrests, and the passenger sits astride",
      "The trip is shorter than 10 km",
      "The passenger holds a licence too",
    ],
    correctIndex: 1,
    explanation:
      "A passenger must sit astride on a seat made for them, with footrests, and wear a fastened helmet. Side-saddle passengers, or passengers on a bike without a passenger seat, are illegal and destabilise the machine.",
    difficulty: 2,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_gravel_braking",
    categoryId: "controls",
    prompt: "Braking on gravel or a loose surface, a rider should:",
    options: [
      "Use the front brake hard — it has the most power",
      "Brake early and gently, using both brakes with more rear than usual, bike upright",
      "Use only the front brake",
      "Pull the clutch and coast to a stop",
    ],
    correctIndex: 1,
    explanation:
      "Loose surfaces can't hold hard braking. Brake earlier and softer than on tar, keep the bike upright, and lean on the rear brake more than usual — a locked front wheel on gravel drops the bike almost instantly.",
    difficulty: 2,
    scope: "learners",
    codes: ["A1", "A"],
  },
  {
    id: "vx_mc_load_balance",
    categoryId: "rules",
    prompt: "Carrying goods on a motorcycle is only allowed if the load:",
    options: [
      "Weighs under 5 kg",
      "Is carried in a backpack",
      "Does not interfere with your control or balance and is properly secured",
      "Sits on the fuel tank",
    ],
    correctIndex: 2,
    explanation:
      "Any load must be secured and must not upset the machine's balance or interfere with steering, braking or your view. A shifting load on two wheels becomes a steering input you didn't ask for.",
    difficulty: 2,
    scope: "learners",
    codes: ["A1", "A"],
  },

  // ── Heavy vehicles (10 / 14) ────────────────────────────────────────────
  {
    id: "vx_hv_speed_limit",
    categoryId: "rules",
    prompt: "The general maximum speed for a goods vehicle with a GVM over 9 000 kg is:",
    options: ["100 km/h", "120 km/h", "80 km/h — even where the road sign says 120", "60 km/h everywhere"],
    correctIndex: 2,
    explanation:
      "Heavy goods vehicles (GVM above 9 000 kg) are limited to 80 km/h regardless of the posted limit — a 120 sign does not override the vehicle-class limit. Mass multiplies stopping distance; the law caps the speed to match.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_code10_gvm",
    categoryId: "rules",
    prompt: "A Code 10 (C1) licence covers rigid vehicles with a GVM of:",
    options: [
      "Up to 3 500 kg",
      "Between 3 500 kg and 16 000 kg",
      "Over 16 000 kg, including articulated combinations",
      "Any mass, if fitted with air brakes",
    ],
    correctIndex: 1,
    explanation:
      "Code 10 (C1) is for goods vehicles between 3 500 and 16 000 kg GVM (trailer up to 750 kg). Code 14 (EC) covers the articulated and heavier combinations above that.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_downhill_gear",
    categoryId: "controls",
    prompt: "Before taking a heavy vehicle down a long, steep descent you should:",
    options: [
      "Select a low gear at the top and let engine braking hold the speed",
      "Put the gearbox in neutral to save fuel",
      "Ride the brakes gently the whole way down",
      "Speed up to get the hill over with",
    ],
    correctIndex: 0,
    explanation:
      "Select the low gear before the descent and let the engine hold you back, braking intermittently. Continuous braking overheats and fades the brakes ('brake fade') — the classic cause of runaway trucks. Never coast in neutral.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_air_pressure",
    categoryId: "controls",
    prompt: "A truck with air brakes may only pull away once:",
    options: [
      "The engine has idled for ten minutes",
      "The air pressure has built up to operating level and the low-pressure warning has stopped",
      "The handbrake lever feels loose",
      "The clutch is fully warmed up",
    ],
    correctIndex: 1,
    explanation:
      "Air brakes need system pressure to work at all. Moving off while the low-pressure warning is still active means you may have little or no braking — wait until pressure reaches operating level.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_arrester_bed",
    categoryId: "signs",
    prompt: "The sign for an arrester bed on a steep downhill tells a truck driver:",
    options: [
      "A rest stop is ahead",
      "An escape lane of deep gravel exists ahead to stop a vehicle whose brakes have failed",
      "Trucks are prohibited beyond this point",
      "A weighbridge is ahead",
    ],
    correctIndex: 1,
    explanation:
      "An arrester bed is an emergency escape: a lane of deep, loose gravel that drags a runaway vehicle to a stop. Know where they are on your route's passes — by the time you need one, there is no time to look for it.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_tail_swing",
    categoryId: "hazard_awareness",
    prompt: "Before turning left in a long vehicle, you check the left mirror mainly for:",
    options: [
      "Your trailer's numberplate",
      "Cyclists or cars sliding into the gap you must swing through",
      "The height of the kerb",
      "Oncoming traffic",
    ],
    correctIndex: 1,
    explanation:
      "Long vehicles may need to swing out before a tight left turn, opening a tempting gap on the inside. A cyclist or taxi that slips into that gap is in the trailer's cut-in path — the left mirror check is what saves them.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_following_distance",
    categoryId: "following_distance",
    prompt: "Compared with a car, a loaded heavy vehicle's following distance should be:",
    options: [
      "The same — two seconds",
      "Longer — at least three seconds and more when loaded, downhill or in rain",
      "Shorter, because drivers sit higher",
      "One second per trailer",
    ],
    correctIndex: 1,
    explanation:
      "Mass extends stopping distance dramatically. Keep at least a three-second gap and stretch it when heavily loaded, descending or on a wet road — the truck behind schedule stops no faster than physics allows.",
    difficulty: 1,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_load_secure",
    categoryId: "rules",
    prompt: "The legal requirement for any load on a goods vehicle is that it:",
    options: [
      "Is covered with a net of any kind",
      "Cannot shift, fall, or project dangerously, and does not obscure lights or plates",
      "Weighs less than the driver estimates the axles can carry",
      "Is loaded higher at the back than the front",
    ],
    correctIndex: 1,
    explanation:
      "A load must be secured so it cannot shift or fall, must not project dangerously, and must not cover your lights, reflectors or numberplate. A shifting load changes the vehicle's handling — and a falling one becomes someone else's crash.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_height_clearance",
    categoryId: "hazard_awareness",
    prompt: "Approaching a low bridge marked 3,8 m, the first thing a truck driver must know is:",
    options: [
      "The bridge's age",
      "The exact travelling height of their own vehicle and load",
      "The speed limit on the bridge",
      "Whether cars are behind",
    ],
    correctIndex: 1,
    explanation:
      "Height restriction signs only help if you know your own travelling height, including the load. If you're at or above the marked clearance, stop and find another route — bridges win every argument.",
    difficulty: 1,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_spray_rain",
    categoryId: "hazard_awareness",
    prompt: "In heavy rain, a truck driver should remember that their spray:",
    options: [
      "Cleans the road for others",
      "Can blind overtaking drivers for seconds — keep speed steady and lights on",
      "Only affects motorcycles",
      "Is reduced by driving faster",
    ],
    correctIndex: 1,
    explanation:
      "A heavy vehicle throws up a wall of spray that can white-out an overtaking car's windscreen. Keep your lights on, hold a steady line and speed, and give overtakers the space to get past cleanly.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_railway_clearance",
    categoryId: "hazard_awareness",
    prompt: "A long vehicle should only start crossing a railway line when:",
    options: [
      "The lights have just started flashing — there's still time",
      "It can clear the whole crossing without stopping, with room on the far side",
      "Another truck has crossed first",
      "The gradient is downhill",
    ],
    correctIndex: 1,
    explanation:
      "A long combination takes far longer to clear a crossing than a car, and stopping ON the tracks is the one unforgivable position. Don't enter unless the far side is open and you can clear the crossing completely.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
  {
    id: "vx_hv_overtaking_time",
    categoryId: "rules",
    prompt: "Overtaking in a loaded heavy vehicle differs from a car mainly because:",
    options: [
      "Trucks may use the emergency lane to pass",
      "You need a far longer clear gap — acceleration is slow and the vehicle is long",
      "Trucks always have right of way when passing",
      "You may exceed the speed limit briefly",
    ],
    correctIndex: 1,
    explanation:
      "A loaded truck accelerates slowly and needs a huge distance to complete a pass. If the required gap makes you hesitate, it isn't there — settle back and wait for a passing lane.",
    difficulty: 2,
    scope: "learners",
    codes: ["10", "14"],
  },
];

export const VEHICLE_EXTRA_FLASHCARDS: Flashcard[] = [
  { id: "vxf_mc_learner_alone", categoryId: "rules", front: "Motorcycle learner — passengers?", back: "None, ever. A motorcycle learner rides alone (car learners instead need a licensed supervisor beside them).", difficulty: 1, codes: ["A1", "A"] },
  { id: "vxf_mc_helmets", categoryId: "rules", front: "Helmets on a motorcycle?", back: "Rider AND passenger, properly fastened. Unfastened counts as none.", difficulty: 1, codes: ["A1", "A"] },
  { id: "vxf_mc_headlight", categoryId: "rules", front: "Motorcycle headlamp rule?", back: "On at all times while riding — day and night. Conspicuity is legal, not optional.", difficulty: 1, codes: ["A1", "A"] },
  { id: "vxf_mc_a1", categoryId: "rules", front: "Code A1 vs Code A?", back: "A1: motorcycles up to 125 cc. A: above 125 cc.", difficulty: 1, codes: ["A1", "A"] },
  { id: "vxf_mc_lifesaver", categoryId: "hazard_awareness", front: "The 'lifesaver' check?", back: "Final over-the-shoulder glance into the blind spot before changing lanes — after mirror and signal.", difficulty: 2, codes: ["A1", "A"] },
  { id: "vxf_mc_wet_surfaces", categoryId: "hazard_awareness", front: "Slipperiest wet surfaces for a bike?", back: "Painted markings, steel manhole covers, fuel spills. Cross upright, off the brakes.", difficulty: 2, codes: ["A1", "A"] },
  { id: "vxf_hv_80", categoryId: "rules", front: "Speed cap: goods vehicle GVM > 9 000 kg?", back: "80 km/h — even where the posted limit is 120. Vehicle-class limit wins.", difficulty: 2, codes: ["10", "14"] },
  { id: "vxf_hv_code10", categoryId: "rules", front: "Code 10 (C1) covers?", back: "Rigid goods vehicles 3 500–16 000 kg GVM (trailer ≤ 750 kg). Code 14 (EC): articulated above that.", difficulty: 2, codes: ["10", "14"] },
  { id: "vxf_hv_descent", categoryId: "controls", front: "Long steep descent in a truck?", back: "Low gear selected at the TOP, engine braking holds speed, brake intermittently. Never neutral, never ride the brakes (fade).", difficulty: 2, codes: ["10", "14"] },
  { id: "vxf_hv_air", categoryId: "controls", front: "Air brakes — when may you move off?", back: "Only once pressure reaches operating level and the low-pressure warning stops. No air = no brakes.", difficulty: 2, codes: ["10", "14"] },
  { id: "vxf_hv_left_mirror", categoryId: "hazard_awareness", front: "Left mirror before a tight left turn?", back: "Checking for cyclists/cars slipping into the gap your tail swing opens — they're in the trailer's cut-in path.", difficulty: 2, codes: ["10", "14"] },
  { id: "vxf_hv_3sec", categoryId: "following_distance", front: "Heavy vehicle following distance?", back: "At least 3 seconds — more when loaded, downhill or wet. Mass stretches every stop.", difficulty: 1, codes: ["10", "14"] },
];

export const VEHICLE_EXTRA_SCENARIOS: Scenario[] = [
  {
    id: "vxs_mc_wet_intersection",
    categoryId: "hazard_awareness",
    title: "Wet robot, painted arrows",
    situation:
      "You're riding home in the first rain after weeks of dry weather. Ahead, a traffic light turns amber. The braking zone is covered in painted lane arrows and there's a sheen on the tar.",
    prompt: "What's the safest way to handle the stop?",
    choices: [
      { id: "a", text: "Brake hard on the arrows — the light is about to change", correct: false, consequence: "First rain lifts weeks of oil off the tar, and wet paint is the slickest patch of all. Hard braking there is how bikes go down at intersections." },
      { id: "b", text: "Brake early and progressively on clean tar, easing off over the painted arrows, bike upright", correct: true, consequence: "Exactly. You used the grippy surface for the braking work and crossed the slick paint light on the brakes and upright." },
      { id: "c", text: "Swerve between the arrows while braking", correct: false, consequence: "Swerving AND braking on a slick surface asks the tyres for two jobs they can't do at once there." },
    ],
    debrief:
      "First-rain intersections combine oil film, wet paint and braking zones. Plan stops early, do the braking on clean tar, and be upright and light on the controls over the slippery bits.",
    codes: ["A1", "A"],
  },
  {
    id: "vxs_hv_long_descent",
    categoryId: "controls",
    title: "The pass warns: trucks use low gear",
    situation:
      "You crest a pass in a loaded Code 14 rig. A sign shows a 10% descent for 6 km, with an arrester bed marked 2 km down. Your speed is 70 km/h in a high gear.",
    prompt: "What do you do at the top?",
    choices: [
      { id: "a", text: "Stay in the high gear and control speed with steady brake pressure", correct: false, consequence: "Six kilometres of steady braking overheats the drums — brake fade on a mountain pass is how runaways start." },
      { id: "b", text: "Slow down NOW and select a low gear before the descent, letting the engine hold the speed", correct: true, consequence: "Right. Gear before gradient: the engine does the holding, the brakes stay cool for when you actually need them." },
      { id: "c", text: "Coast in neutral to save fuel and brake as needed", correct: false, consequence: "Neutral removes engine braking entirely — every km/h now has to come off through the brakes alone. This is illegal and lethal in a heavy vehicle." },
    ],
    debrief:
      "The rule is 'right gear before the descent, not during it.' Engine braking holds the mass; the service brakes are for corrections. Note where the arrester bed is as you pass — it's your last resort.",
    codes: ["10", "14"],
  },
  {
    id: "vxs_mc_taxi_blindspot",
    categoryId: "hazard_awareness",
    title: "Alongside the taxi",
    situation:
      "In slow multi-lane traffic you find yourself riding level with a minibus taxi's back door, in the lane to its right. Ahead, passengers are waiting at the kerb.",
    prompt: "What should you do?",
    choices: [
      { id: "a", text: "Hold your position — you have right of way in your lane", correct: false, consequence: "You're invisible in the blind spot of a vehicle famous for sudden lane changes toward waiting passengers. Right of way won't pick the bike up." },
      { id: "b", text: "Adjust speed to move clearly ahead of or behind the taxi, out of its blind spot, expecting it to move left-to-kerb suddenly", correct: true, consequence: "Yes — position plus prediction. You made yourself visible and left room for the move the situation was advertising." },
      { id: "c", text: "Hoot continuously so the driver knows you're there", correct: false, consequence: "A hooter doesn't fix a blind spot, and you're still sitting in the crush zone if it swerves." },
    ],
    debrief:
      "Never linger beside a vehicle, least of all one that stops for passengers. Read the kerb: waiting passengers ahead mean the taxi is coming left — be somewhere else when it does.",
    codes: ["A1", "A"],
  },
];
