import type { Question } from "@/types";
import { signImg } from "./signs";

/**
 * Second question bank — written to roughly double the pool per vehicle code
 * so mock exams and daily practice stop recycling the same items. Facts are
 * drawn from the National Road Traffic Act / official K53 syllabus (verified
 * against current SA sources); wording is original.
 *
 * Universal items carry no `codes`; code-specific items are tagged and match
 * by vehicle group ("A" covers A/A1, "14" covers 10/14).
 */
export const EXTRA_QUESTIONS: Question[] = [
  // ── ROAD SIGNS, SIGNALS & MARKINGS (universal) ──────────────
  {
    id: "q2_sign_one_way_right",
    categoryId: "signs",
    image: signImg("one_way_right"),
    prompt: "You see this blue sign with an arrow pointing right. It tells you that:",
    options: [
      "You must turn right at the next intersection",
      "The roadway carries traffic in one direction only — the direction of the arrow",
      "Overtaking is only allowed on the right",
      "Parking is allowed on the right-hand side",
    ],
    correctIndex: 1,
    explanation:
      "A one-way sign means every vehicle on that roadway travels in the direction of the arrow. Never enter a one-way street against the arrow.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_no_right",
    categoryId: "signs",
    image: signImg("no_right_turn"),
    prompt: "What does this sign prohibit?",
    options: [
      "Overtaking on the right",
      "Turning right at this point",
      "Stopping on the right-hand side",
      "U-turns only",
    ],
    correctIndex: 1,
    explanation:
      "A red-bordered circle with a right-turn arrow crossed out prohibits the right turn. You must choose another legal route.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_robot_green",
    categoryId: "signs",
    image: signImg("robot_green"),
    prompt: "The robot ahead is a steady green. You may:",
    options: [
      "Proceed immediately — green guarantees the way is clear",
      "Proceed, but only once you've checked the intersection is clear and it is safe",
      "Proceed only if turning left",
      "Speed up so you get through before it changes",
    ],
    correctIndex: 1,
    explanation:
      "Green gives you the right to proceed — it does not guarantee safety. Check for red-light runners, pedestrians still crossing and blocked exits before entering.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_steep_ascent",
    categoryId: "signs",
    image: signImg("steep_ascent"),
    prompt: "This sign warns of a steep upward gradient. What should you expect and do?",
    options: [
      "Coast in neutral to save fuel",
      "Expect slow-moving vehicles ahead; select a gear that keeps your speed steady",
      "Overtake as many vehicles as possible before the hill",
      "Switch on your hazard lights for the climb",
    ],
    correctIndex: 1,
    explanation:
      "On a steep climb heavy vehicles slow right down. Change to a lower gear early to hold momentum, and only overtake where it is legal and clearly safe.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_temp_yellow",
    categoryId: "signs",
    prompt: "Road signs with a yellow background at roadworks are:",
    options: [
      "Suggestions that only apply to construction vehicles",
      "Temporary signs — they carry the same legal force as permanent signs",
      "Advertisements placed by the contractor",
      "Only valid during working hours",
    ],
    correctIndex: 1,
    explanation:
      "Yellow-background signs are temporary (usually at roadworks) and must be obeyed exactly like permanent signs, including temporary speed limits.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_guidance_green",
    categoryId: "signs",
    prompt: "Large green boards above or beside a freeway show:",
    options: [
      "Tourist attractions in the area",
      "Direction guidance — routes, destinations and exits",
      "Mandatory speed limits",
      "General warnings of hazards ahead",
    ],
    correctIndex: 1,
    explanation:
      "Green guidance signs help you navigate: route numbers, destinations and exit information. Read them early so you can change lanes in good time.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_brown_tourism",
    categoryId: "signs",
    prompt: "A brown road sign with white lettering indicates:",
    options: [
      "A gravel road ahead",
      "A tourist attraction or place of interest",
      "A rest area for trucks only",
      "A prohibited area",
    ],
    correctIndex: 1,
    explanation:
      "Brown signs are tourism guidance signs — game reserves, wine routes, monuments and similar destinations.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_warn_tjunction",
    categoryId: "signs",
    prompt: "A triangular warning sign showing a T-shaped symbol means:",
    options: [
      "A tollgate is ahead",
      "The road you are on ends ahead at a T-junction — be ready to yield or stop",
      "Trucks may not proceed",
      "A tram line crosses ahead",
    ],
    correctIndex: 1,
    explanation:
      "The T-junction warning tells you your road terminates ahead. Slow down and prepare to give way to traffic on the through road.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_slippery",
    categoryId: "signs",
    prompt: "You pass a warning sign for a slippery road surface. The correct response is to:",
    options: [
      "Brake hard now to test your grip",
      "Reduce speed and use gentle steering, braking and acceleration through the section",
      "Change to your highest gear",
      "Drive in the middle of the road",
    ],
    correctIndex: 1,
    explanation:
      "On a slippery surface, sudden inputs break traction. Slow down beforehand and keep every control input smooth — especially in the wet.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_road_narrows",
    categoryId: "signs",
    prompt: "A warning sign shows the road narrowing ahead. You should:",
    options: [
      "Accelerate to get through the narrow section first",
      "Slow down and be prepared to yield to oncoming traffic",
      "Sound your hooter continuously through the section",
      "Straddle the centre line for extra space",
    ],
    correctIndex: 1,
    explanation:
      "Where the roadway narrows there may not be room for two vehicles. Adjust speed early and give way rather than force the gap.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_two_way",
    categoryId: "signs",
    prompt: "After a one-way section, a sign warns of two-way traffic ahead. This means:",
    options: [
      "You may now overtake freely",
      "Keep left — oncoming vehicles will now share the roadway",
      "The speed limit doubles",
      "The road becomes a freeway",
    ],
    correctIndex: 1,
    explanation:
      "The two-way traffic warning marks the end of one-way running. Move back into the habit of keeping left and expecting oncoming vehicles.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_gravel_begins",
    categoryId: "signs",
    prompt: "A sign warns that the tarred road ends and gravel begins. What changes?",
    options: [
      "Nothing — drive exactly as on tar",
      "Braking distances get much longer and grip drops — slow down before the surface changes",
      "You must switch on your main beams",
      "The speed limit no longer applies",
    ],
    correctIndex: 1,
    explanation:
      "Gravel offers far less grip: stopping distances stretch, dust hides hazards and loose stones deflect the wheels. Reduce speed before you reach it, not on it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_wild_animals",
    categoryId: "signs",
    prompt: "You see a warning sign for wild animals (e.g. a kudu symbol). When is the risk highest?",
    options: [
      "At midday in clear weather",
      "At dawn and dusk, when animals move and are hard to see",
      "Only in summer",
      "Only when a game fence is visible",
    ],
    correctIndex: 1,
    explanation:
      "Animals are most active — and least visible — around sunrise and sunset. Slow down, scan the verges and be ready to brake in a straight line.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_command_blue",
    categoryId: "signs",
    prompt: "A round blue sign with a white arrow (a command sign) tells you:",
    options: [
      "The action shown is recommended but optional",
      "You must perform the action shown — for example keep left of an island",
      "The route is for buses only",
      "You are entering a one-way street",
    ],
    correctIndex: 1,
    explanation:
      "Blue circular command signs are compulsory instructions — 'keep left', 'proceed straight' — with the same legal force as any regulatory sign.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_stop_vs_yield_line",
    categoryId: "signs",
    prompt: "What is the difference between a solid and a broken white line painted across your lane?",
    options: [
      "Solid = yield line, broken = stop line",
      "Solid = stop line (stop behind it), broken = yield line (give way, stop only if needed)",
      "Both mean the same thing",
      "They only apply to trucks",
    ],
    correctIndex: 1,
    explanation:
      "A solid transverse line is a stop line — your front wheels must not cross it while stopped. A broken transverse line marks a yield: give way, and stop only if the way isn't clear.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_painted_island",
    categoryId: "signs",
    prompt: "A painted island (an area of diagonal white stripes on the tar) may be:",
    options: [
      "Used as an extra overtaking lane",
      "Driven on only in an emergency — normally you must keep off it",
      "Used for parking during off-peak hours",
      "Crossed whenever traffic is heavy",
    ],
    correctIndex: 1,
    explanation:
      "Painted islands separate traffic streams. You may not drive, overtake or park on them — only cross in a genuine emergency.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_lane_arrows",
    categoryId: "signs",
    prompt: "You are in a lane with a painted left-turn arrow. At the intersection you must:",
    options: [
      "Go straight if the road ahead looks clear",
      "Turn left — lane-use arrows are compulsory once you're in that lane",
      "Stop and wait for a traffic officer",
      "Reverse out of the lane",
    ],
    correctIndex: 1,
    explanation:
      "Painted lane arrows are regulatory. If you're in a turn lane by mistake, you must make the turn and re-route afterwards — changing course in the intersection is illegal and dangerous.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_bus_lane",
    categoryId: "signs",
    prompt: "A lane marked as reserved for buses may be used by a private car:",
    options: [
      "Whenever the lane is empty",
      "Not at all while the reservation applies — except briefly where signs allow crossing to turn",
      "During weekends only, automatically",
      "If you switch on your hazard lights",
    ],
    correctIndex: 1,
    explanation:
      "Reserved lanes (BUS, minibus-taxi, cycle lanes) are off-limits to other vehicles while the reservation applies. Signs state the operative times and any exceptions.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_school_patrol",
    categoryId: "signs",
    prompt: "A scholar patrol holds its stop banner out across the road. You must:",
    options: [
      "Slow down and drive around the children",
      "Stop completely and remain stopped until the banner is withdrawn",
      "Hoot so the children hurry up",
      "Proceed if no children are on your side of the road",
    ],
    correctIndex: 1,
    explanation:
      "A displayed scholar-patrol sign is a legal stop instruction. Stop and stay stopped until the banners are removed from the roadway.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_rumble_strips",
    categoryId: "signs",
    prompt: "You feel and hear rumble strips under your tyres. They are there to:",
    options: [
      "Test your suspension",
      "Alert you — usually to slow down for a hazard, tollgate or stop ahead",
      "Mark the edge of a parking area",
      "Indicate a minimum speed",
    ],
    correctIndex: 1,
    explanation:
      "Rumble strips wake up drowsy or distracted drivers ahead of something important — reduce speed and look for the reason.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_clearance",
    categoryId: "signs",
    prompt: "A sign on a low bridge reads '3,7 m'. What does it mean?",
    options: [
      "The bridge is 3,7 km ahead",
      "Only vehicles (including load) lower than 3,7 m may pass under it",
      "The maximum speed under the bridge is 37 km/h",
      "The bridge can carry 3,7 tonnes",
    ],
    correctIndex: 1,
    explanation:
      "A clearance sign gives the safe height under the structure. If your vehicle or load is taller, you must find another route.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_sign_officer_overrides",
    categoryId: "signs",
    prompt: "A traffic officer signals you through a red robot. You should:",
    options: [
      "Wait for green anyway — the robot takes priority",
      "Obey the officer — a traffic officer's signal overrides robots and signs",
      "Hoot to confirm before moving",
      "Reverse away from the intersection",
    ],
    correctIndex: 1,
    explanation:
      "A traffic officer's directions rank above traffic signals and signs. Follow the officer's instruction, carefully.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_ped_blocks",
    categoryId: "signs",
    prompt: "Broad painted blocks across the road mark a pedestrian crossing. Approaching it, you must:",
    options: [
      "Maintain speed unless someone is already halfway across",
      "Slow down and give way to pedestrians on, or clearly about to enter, the crossing",
      "Stop and wave pedestrians across even if none are near",
      "Hoot before crossing the blocks",
    ],
    correctIndex: 1,
    explanation:
      "Zebra-style block markings work like a yield to pedestrians: approach at a speed that lets you stop, and give way to anyone using or stepping onto the crossing.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_sign_speed_hump",
    categoryId: "signs",
    prompt: "A warning sign shows a speed hump ahead. The correct technique is to:",
    options: [
      "Brake hard on top of the hump",
      "Slow down before the hump and cross it at a steady low speed",
      "Accelerate so you clear it quickly",
      "Swerve around it using the oncoming lane",
    ],
    correctIndex: 1,
    explanation:
      "Do your braking before the hump, then cross gently. Braking on the hump unsettles the vehicle; swerving into oncoming traffic is far worse.",
    difficulty: 1,
    scope: "learners",
  },

  // ── RULES OF THE ROAD (universal) ───────────────────────────
  {
    id: "q2_rules_accident_duty",
    categoryId: "rules",
    prompt: "You are involved in a crash in which someone is injured. Which duty applies?",
    options: [
      "Drive to the nearest garage and phone a friend",
      "Stop immediately, help the injured, exchange details and report to the police within 24 hours",
      "Leave if the other driver admits fault",
      "Only report it if the damage looks expensive",
    ],
    correctIndex: 1,
    explanation:
      "After a crash you must stop, assist any injured people, give your details — and report the crash to the police within 24 hours (immediately if someone is hurt and no officer attended).",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_rules_tow_rope_speed",
    categoryId: "rules",
    prompt: "What is the maximum speed when towing another vehicle with a rope?",
    options: ["60 km/h", "30 km/h", "80 km/h", "45 km/h"],
    correctIndex: 1,
    explanation:
      "With a tow rope or chain the limit is 30 km/h. Only a proper drawbar or tow-bar coupling allows normal (higher) towing speeds.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_rules_tow_gap",
    categoryId: "rules",
    prompt: "When one vehicle tows another, the gap between them may not exceed:",
    options: ["1,8 metres", "3,5 metres", "5 metres", "10 metres"],
    correctIndex: 1,
    explanation:
      "The towing connection may not be longer than 3,5 m, and the person steering the towed vehicle must hold a valid licence for it.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_rules_caravan_people",
    categoryId: "rules",
    prompt: "May passengers ride inside a caravan or trailer while it is being towed?",
    options: [
      "Yes, if they are seated",
      "No — no person may be carried in a towed caravan or trailer",
      "Yes, but only adults",
      "Only on gravel roads",
    ],
    correctIndex: 1,
    explanation:
      "Riding in a towed caravan or trailer is prohibited — it has no crash protection and the combination can sway or detach.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_load_rear",
    categoryId: "rules",
    prompt: "How far may a load legally project beyond the rear of your vehicle, and what must you do?",
    options: [
      "Up to 3 m with no marking",
      "Up to 1,8 m, and the projection must be clearly marked (e.g. red flag by day)",
      "Any distance if you drive slowly",
      "Loads may never project at the rear",
    ],
    correctIndex: 1,
    explanation:
      "The rear projection limit is 1,8 m. Projecting loads must be marked so other drivers can see them — a red flag in daylight, a red light at night.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_rules_door_open",
    categoryId: "rules",
    prompt: "Before opening your door on the traffic side, the law requires you to:",
    options: [
      "Open it quickly so it's not in the way for long",
      "Make sure it's safe — you may not open a door into the path of traffic or leave it open longer than necessary",
      "Switch on your hazard lights first, then open it freely",
      "Hoot twice",
    ],
    correctIndex: 1,
    explanation:
      "Check mirrors and look back for cyclists, motorcyclists and cars before opening. An opened door counts as an obstruction you're responsible for.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_reversing",
    categoryId: "rules",
    prompt: "The rule for reversing on a public road is:",
    options: [
      "Reverse only when safe, and no further than is necessary",
      "Reversing is always prohibited",
      "You may reverse any distance if your hazards are on",
      "Reverse only at night when roads are quiet",
    ],
    correctIndex: 0,
    explanation:
      "You may reverse only if it can be done safely and you may not reverse further than the situation actually requires.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_coasting",
    categoryId: "rules",
    prompt: "Why should you not coast downhill in neutral or with the clutch held in?",
    options: [
      "It uses more fuel",
      "You lose engine braking and some control, and the vehicle keeps gaining speed",
      "It damages the hooter",
      "It's fine — coasting is recommended",
    ],
    correctIndex: 1,
    explanation:
      "Coasting removes engine braking, so the brakes must do all the work and can overheat, while your ability to accelerate out of trouble is gone. Stay in gear.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_rules_hooter",
    categoryId: "rules",
    prompt: "When may you legally use your hooter?",
    options: [
      "To greet friends",
      "Only when reasonably necessary for road safety — to warn of danger",
      "To hurry slow traffic along",
      "Any time during daylight hours",
    ],
    correctIndex: 1,
    explanation:
      "The hooter is a warning device, not a communication tool. Use it only to alert others to danger.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_night_parked_lights",
    categoryId: "rules",
    prompt: "You park on an unlit public road at night. Your vehicle must:",
    options: [
      "Show nothing — parked cars need no lights",
      "Be visible — show parking/rear lights unless the road is well lit or an exemption applies",
      "Keep its headlights on main beam",
      "Have its hazard lights flashing all night",
    ],
    correctIndex: 1,
    explanation:
      "A vehicle left on a dark road must be visible to approaching traffic. Where street lighting doesn't make it clearly visible, parking lamps are required.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_rules_cyclist_gap",
    categoryId: "rules",
    prompt: "When overtaking a cyclist you should leave a lateral gap of at least:",
    options: ["Half a metre", "One metre", "Ten centimetres", "There is no guideline"],
    correctIndex: 1,
    explanation:
      "Pass cyclists with at least 1 m of space (more at higher speed) — they may swerve for potholes, drains or wind gusts.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_ped_freeway",
    categoryId: "rules",
    prompt: "Pedestrians on a freeway are:",
    options: [
      "Allowed if they keep to the emergency lane",
      "Prohibited — freeways are for motor traffic only",
      "Allowed at night only",
      "Allowed if crossing quickly",
    ],
    correctIndex: 1,
    explanation:
      "Pedestrians, cyclists and animal-drawn vehicles may not be on a freeway. As a driver, still stay alert — people do walk on freeways illegally.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_beam_reach",
    categoryId: "rules",
    prompt: "Roughly how far must your headlamp beams illuminate the road?",
    options: [
      "Main beam 100 m; dipped beam 45 m",
      "Main beam 45 m; dipped beam 100 m",
      "Both beams 200 m",
      "Main beam 30 m; dipped beam 10 m",
    ],
    correctIndex: 0,
    explanation:
      "Main beam must light objects at least 100 m ahead, dipped beam at least 45 m. That's also why overdriving your lights at night is so dangerous.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_rules_bus_speed",
    categoryId: "rules",
    prompt: "The general maximum speed for a bus or minibus on a freeway is:",
    options: ["120 km/h", "100 km/h", "80 km/h", "60 km/h"],
    correctIndex: 1,
    explanation:
      "Buses and minibuses are limited to 100 km/h even where the posted freeway limit is 120 km/h.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_rules_livestock",
    categoryId: "rules",
    prompt: "You come across cattle being herded across a rural road. You should:",
    options: [
      "Hoot repeatedly to scatter them",
      "Slow right down or stop, and pass slowly on the herder's signal — animals are unpredictable",
      "Drive through the gap at normal speed",
      "Flash your headlights and keep your speed up",
    ],
    correctIndex: 1,
    explanation:
      "Hooting can panic animals into your path. Slow down, be patient and pass wide and slow when it's clearly safe.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_throwing",
    categoryId: "rules",
    prompt: "Throwing an object from a moving vehicle is:",
    options: [
      "Legal if it's biodegradable",
      "An offence — it can endanger other road users and is prohibited",
      "Legal on gravel roads",
      "Only illegal on freeways",
    ],
    correctIndex: 1,
    explanation:
      "Objects from vehicles become hazards for motorcyclists, cyclists and cars behind you, and littering from a vehicle is an offence.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_licence_carry",
    categoryId: "rules",
    prompt: "While driving on a learner's licence you must:",
    options: [
      "Leave the licence at home for safekeeping",
      "Carry the learner's licence with you and be supervised by a validly licensed driver",
      "Display an 'L' plate but nothing else",
      "Only drive between 06:00 and 18:00",
    ],
    correctIndex: 1,
    explanation:
      "A learner must have the learner's licence in the vehicle and drive under supervision of someone holding a valid licence for that vehicle class, seated where they can reach the controls' area (front passenger seat).",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_rules_prof_alcohol",
    categoryId: "rules",
    prompt: "The blood-alcohol limit for professional drivers (e.g. truck and taxi drivers) is:",
    options: [
      "The same as private drivers — below 0,05 g/100 ml",
      "Stricter — below 0,02 g/100 ml",
      "There is no limit for professionals",
      "Below 0,08 g/100 ml",
    ],
    correctIndex: 1,
    explanation:
      "Professional drivers are held to under 0,02 g/100 ml — effectively zero. Private drivers must stay under 0,05 g/100 ml.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_rules_learner_ages",
    categoryId: "rules",
    prompt: "Which learner's licence codes exist, and from what ages?",
    options: [
      "Code 1 (motorcycles) from 16; Code 2 (light vehicles) from 17; Code 3 (all vehicles) from 18",
      "One code for everything, from age 16",
      "Code 1 from 14; Code 2 from 15; Code 3 from 16",
      "Codes A, B and C, all from age 18",
    ],
    correctIndex: 0,
    explanation:
      "Learner's licences: Code 1 for motorcycles (from 16 — under 16½ limited to ≤125 cm³), Code 2 for vehicles up to 3 500 kg GVM (from 17), Code 3 for heavier vehicles (from 18).",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_rules_learner_validity",
    categoryId: "rules",
    prompt: "How long is a learner's licence valid?",
    options: ["6 months", "24 months", "5 years", "It never expires"],
    correctIndex: 1,
    explanation:
      "A learner's licence is valid for 24 months. If it expires before you pass your driving test, you must apply and test again.",
    difficulty: 1,
    scope: "learners",
  },

  // ── VEHICLE CONTROLS (universal) ────────────────────────────
  {
    id: "q2_ctrl_hazards",
    categoryId: "controls",
    prompt: "When should you use your hazard warning lights?",
    options: [
      "Whenever it rains",
      "When your stationary vehicle is a hazard, or briefly to warn traffic behind of danger ahead",
      "While parking illegally 'just for a minute'",
      "To thank other drivers",
    ],
    correctIndex: 1,
    explanation:
      "Hazards mark your vehicle as a danger — a breakdown, or a moment's warning of a sudden obstruction ahead. They don't legalise stopping where stopping is prohibited.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_ctrl_wipers_demister",
    categoryId: "controls",
    prompt: "Your windscreen fogs up in heavy rain. Before driving on you should:",
    options: [
      "Wipe a small peephole with your hand and carry on",
      "Use the demister/air-con and wipers until you have full, clear vision",
      "Open the window and look out of it",
      "Follow the tail lights ahead closely so you don't get lost",
    ],
    correctIndex: 1,
    explanation:
      "Driving without full vision is driving blind. Use the demister, heated rear window and wipers — and pull over safely if you still can't see.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_ctrl_oil_light",
    categoryId: "controls",
    prompt: "The oil-pressure warning light comes on while you're driving. You should:",
    options: [
      "Drive to your destination and check next week",
      "Stop as soon as it is safe and switch the engine off — running on could destroy it",
      "Speed up so you finish the trip before damage occurs",
      "Ignore it if the engine still sounds fine",
    ],
    correctIndex: 1,
    explanation:
      "No oil pressure means the engine is not being lubricated — serious damage happens within minutes. Stop safely, switch off, and investigate.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_ctrl_battery_light",
    categoryId: "controls",
    prompt: "The battery/charging warning light stays on while driving. What does it tell you?",
    options: [
      "The battery is full",
      "The charging system has failed — electrics are running off the battery and will eventually die",
      "You must add battery water immediately while driving",
      "Your headlights are on",
    ],
    correctIndex: 1,
    explanation:
      "A charging fault means limited electrical time left (lights, wipers, ignition). Plan a safe stop and get it checked before the battery drains.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_ctrl_seat_setup",
    categoryId: "controls",
    prompt: "When should you adjust your seat, headrest and mirrors?",
    options: [
      "While driving, one at a time",
      "Before you start driving, as part of your pre-drive checks",
      "Only before a long trip",
      "Adjustment is the passenger's job",
    ],
    correctIndex: 1,
    explanation:
      "Set your seating position, headrest height and all mirrors before moving off. Adjusting on the move takes your attention and hands away from driving.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_ctrl_headrest",
    categoryId: "controls",
    prompt: "The correct headrest position is:",
    options: [
      "As low as possible so it doesn't block vision",
      "Top of the headrest about level with the top of your head, close to it",
      "Removed for comfort",
      "Touching your shoulders",
    ],
    correctIndex: 1,
    explanation:
      "A properly set headrest catches your head in a rear-end crash and prevents whiplash. Too low and your neck bends over it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_ctrl_ignition_moving",
    categoryId: "controls",
    prompt: "Why must you never switch the ignition off while the vehicle is moving?",
    options: [
      "The radio will reset",
      "You can lock the steering and lose power assistance for steering and brakes",
      "It wears out the key",
      "The doors will lock automatically",
    ],
    correctIndex: 1,
    explanation:
      "Switching off can engage the steering lock and kills the engine-driven assistance — the wheel goes solid and the brake pedal becomes very hard. Only switch off once stopped.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_ctrl_dry_steering",
    categoryId: "controls",
    prompt: "Turning the steering wheel while the vehicle is completely stationary ('dry steering') is discouraged because it:",
    options: [
      "Is illegal on public roads",
      "Strains the steering components and scrubs the tyres unnecessarily",
      "Cancels your indicators",
      "Uses excessive fuel",
    ],
    correctIndex: 1,
    explanation:
      "Steer while creeping slowly instead — dry steering loads the steering mechanism and wears the tyre contact patch for no benefit.",
    difficulty: 3,
    scope: "learners",
  },

  // ── INTERSECTIONS (universal) ───────────────────────────────
  {
    id: "q2_int_uncontrolled",
    categoryId: "intersections",
    prompt: "You approach an intersection with no signs, robots or markings. You must:",
    options: [
      "Proceed at normal speed — no control means no rules",
      "Slow down, be ready to stop, and give way to any vehicle already in or entering the intersection before you",
      "Always come to a complete stop",
      "Hoot and proceed first",
    ],
    correctIndex: 1,
    explanation:
      "An uncontrolled intersection still has rules: approach at a speed that lets you stop, and yield to traffic that reaches or enters it before you do.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_int_left_position",
    categoryId: "intersections",
    prompt: "The correct position for a left turn at an intersection is:",
    options: [
      "Swing wide to the right first for a smooth arc",
      "As close to the left edge as is safe, turning into the nearest lane of the new road",
      "From the middle of the road",
      "Any lane, as long as you signal",
    ],
    correctIndex: 1,
    explanation:
      "Turn left from the left edge into the left lane. Swinging out first invites vehicles (especially motorcycles) into the gap on your inside.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_int_multilane_circle",
    categoryId: "intersections",
    prompt: "Approaching a multi-lane traffic circle, which lane should you choose?",
    options: [
      "Always the right-hand lane",
      "Left lane to turn left or go straight; right lane to turn right or go all the way around — as the arrows mark",
      "Whichever lane is shortest",
      "Straddle both lanes for flexibility",
    ],
    correctIndex: 1,
    explanation:
      "Choose your lane before entering: generally left lane for left/straight, right lane for right/full circle, following the painted arrows — and don't change lanes inside the circle.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_int_green_ped_still",
    categoryId: "intersections",
    prompt: "Your light turns green but an elderly pedestrian is still crossing your side. You must:",
    options: [
      "Edge forward so they hurry",
      "Wait until they have safely cleared your path before moving",
      "Hoot once, then drive around them",
      "Proceed — green means the pedestrian is at fault",
    ],
    correctIndex: 1,
    explanation:
      "Pedestrians lawfully in the intersection keep right of way until they've crossed. Green lets you go only when the way is actually clear.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_int_red_arrow",
    categoryId: "intersections",
    prompt: "A steady red arrow pointing right shows at a robot while the main light is green. You want to turn right. You must:",
    options: [
      "Turn right — the main green covers everything",
      "Wait — the red arrow means your right-turn movement must stop, even though other movements may go",
      "Turn right after hooting",
      "Treat the arrow as a yield",
    ],
    correctIndex: 1,
    explanation:
      "Arrow signals control the specific movement they point to. A red arrow stops that turn regardless of the main light.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_int_rail_multi_track",
    categoryId: "intersections",
    prompt: "At a railway crossing with multiple tracks, a train has just passed. You should:",
    options: [
      "Cross immediately behind it",
      "Wait and check both directions again — a second train may be hidden behind the first",
      "Follow the vehicle in front closely across",
      "Cross if the first train is more than 100 m away",
    ],
    correctIndex: 1,
    explanation:
      "The passing train hides the far track. Only cross once you can see clearly in both directions on every track — and never stop on the tracks.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_int_slipway",
    categoryId: "intersections",
    prompt: "Joining a road via a slip lane (a separate curved left-turn lane), you must:",
    options: [
      "Enter the new road at speed — slip lanes have right of way",
      "Yield to traffic already on the road you're joining, merging only into a safe gap",
      "Stop at the top of the slip lane in all cases",
      "Use hazard lights while merging",
    ],
    correctIndex: 1,
    explanation:
      "A slip lane usually ends in a yield: adjust speed, watch for a safe gap, and merge without forcing traffic on the through road to brake.",
    difficulty: 2,
    scope: "learners",
  },

  // ── PARKING & STOPPING (universal) ──────────────────────────
  {
    id: "q2_park_narrow_road",
    categoryId: "parking",
    prompt: "You may not park alongside or directly opposite another vehicle where the roadway is:",
    options: ["Narrower than 5 m", "Narrower than 9 m", "Narrower than 12 m", "A one-way street"],
    correctIndex: 1,
    explanation:
      "On a roadway less than 9 m wide, parking next to or opposite another vehicle squeezes moving traffic into an unsafe gap.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_park_direction",
    categoryId: "parking",
    prompt: "When parking parallel on a two-way road you must park:",
    options: [
      "Facing oncoming traffic so you can see it when leaving",
      "On the left side, facing the same direction as the traffic flow",
      "On whichever side has more shade",
      "Half on the sidewalk to leave more room",
    ],
    correctIndex: 1,
    explanation:
      "Park on the left, with the flow. Parking against the flow confuses other drivers and at night shows them your (dark) rear instead of reflectors and lamps set up for it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_park_kerb_gap",
    categoryId: "parking",
    prompt: "How close to the kerb should you finish a parallel park?",
    options: [
      "Within about 450 mm, reasonably parallel",
      "Within 2 m is fine",
      "Touching the kerb",
      "Distance doesn't matter if you're straight",
    ],
    correctIndex: 0,
    explanation:
      "Finish close (about 450 mm or less) and parallel, wheels straight — a car sticking out into the traffic lane is a hazard, and in the K53 yard test it costs you points.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_park_bus_stop",
    categoryId: "parking",
    prompt: "Stopping your car in a marked bus stop is:",
    options: [
      "Fine for under five minutes",
      "Prohibited while the demarcation applies — buses must be able to pull in",
      "Allowed if you stay in the car",
      "Allowed outside peak hours automatically",
    ],
    correctIndex: 1,
    explanation:
      "A demarcated bus stop is reserved. Forcing a bus to stop in the traffic lane endangers its passengers and blocks the road.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_park_double",
    categoryId: "parking",
    prompt: "'Double parking' (stopping in the traffic lane next to a parked car) is:",
    options: [
      "Allowed with hazard lights on",
      "Prohibited — you're obstructing a traffic lane",
      "Allowed for deliveries only",
      "Allowed for up to two minutes",
    ],
    correctIndex: 1,
    explanation:
      "Hazard lights don't legalise obstruction. Stopping beside a parked vehicle blocks the lane and hides pedestrians stepping out.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_park_unattended_check",
    categoryId: "parking",
    prompt: "Before leaving your parked vehicle unattended you must:",
    options: [
      "Leave it in neutral with the engine idling for a quick exit",
      "Stop the engine, apply the parking brake and take reasonable steps so it can't move or be a danger",
      "Leave the key in the ignition for the car guard",
      "Only lock the doors",
    ],
    correctIndex: 1,
    explanation:
      "Engine off, handbrake firmly on (in gear on a slope, wheels turned appropriately), key removed — an unattended vehicle must not be able to roll or be set in motion.",
    difficulty: 1,
    scope: "learners",
  },

  // ── FOLLOWING DISTANCE (universal) ──────────────────────────
  {
    id: "q2_fd_three_second",
    categoryId: "following_distance",
    prompt: "In good conditions, the recommended safe following distance is:",
    options: [
      "One second",
      "Three seconds — count from when the car ahead passes a fixed point",
      "One car length regardless of speed",
      "Ten seconds at all times",
    ],
    correctIndex: 1,
    explanation:
      "Two seconds is the bare K53 minimum; three seconds gives you genuine reaction-plus-braking room and self-adjusts with speed.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_fd_stopped_hill",
    categoryId: "following_distance",
    prompt: "Stopped behind another vehicle on an uphill, how much gap should you leave?",
    options: [
      "Bumper to bumper to stop queue-jumpers",
      "Enough to see where its rear tyres meet the road — room if it rolls back, and room to pull around",
      "At least 20 metres",
      "No rule applies when stopped",
    ],
    correctIndex: 1,
    explanation:
      "Seeing the vehicle's rear tyres on the tar is the practical gap check: you're clear of a roll-back on the pull-away and can steer around if it stalls or breaks down.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_fd_gravel",
    categoryId: "following_distance",
    prompt: "On a gravel road your following distance should be:",
    options: [
      "The same as tar",
      "At least doubled — braking takes far longer and dust hides the vehicle ahead",
      "Halved, to stay out of the dust cloud",
      "Exactly 2 seconds",
    ],
    correctIndex: 1,
    explanation:
      "Loose gravel roughly doubles braking distances, and the leading vehicle's dust can hide its brake lights completely. Hang well back, out of the dust.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_fd_reaction_100",
    categoryId: "following_distance",
    prompt: "At 100 km/h, roughly how far do you travel during one second of reaction time?",
    options: ["About 5 metres", "About 28 metres", "About 100 metres", "About 60 metres"],
    correctIndex: 1,
    explanation:
      "100 km/h ≈ 28 m per second — before your foot even reaches the brake. That's why tailgating at speed leaves no physical way to stop in time.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_fd_taxi_gap",
    categoryId: "following_distance",
    prompt: "Driving behind a minibus taxi in town, the wise following strategy is:",
    options: [
      "Close the gap so it can't stop suddenly",
      "Add extra following distance — taxis stop frequently and often without warning",
      "Overtake immediately, wherever you are",
      "Match its speed exactly at one car length",
    ],
    correctIndex: 1,
    explanation:
      "Taxis stop for passengers anywhere, sometimes without indicating. The extra second or two of space is what turns a sudden stop into a non-event.",
    difficulty: 1,
    scope: "learners",
  },

  // ── HAZARD AWARENESS (universal) ────────────────────────────
  {
    id: "q2_haz_night_rural",
    categoryId: "hazard_awareness",
    prompt: "Driving through an unlit rural area at night, the biggest pedestrian danger is:",
    options: [
      "Pedestrians always carry lights, so there's little danger",
      "People in dark clothing walking on or beside the road — often invisible until very close",
      "Pedestrians only cross at marked crossings",
      "Reflective clothing dazzling you",
    ],
    correctIndex: 1,
    explanation:
      "Dark-clothed pedestrians (sometimes impaired) on unlit roads are among SA's biggest night-time killers. Slow down, use main beam when no traffic is around, and scan the verges.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_haz_pothole",
    categoryId: "hazard_awareness",
    prompt: "You spot a deep pothole in your lane at the last moment. The safest response is usually to:",
    options: [
      "Swerve sharply into the next lane without checking",
      "Brake firmly in a straight line beforehand; if you can't avoid it, release the brakes just before impact",
      "Accelerate over it",
      "Close your eyes and hold tight",
    ],
    correctIndex: 1,
    explanation:
      "An unchecked swerve trades a damaged rim for a collision. Lose speed in a straight line; releasing the brakes at impact lets the wheel roll through rather than dig in.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_haz_fog_bank",
    categoryId: "hazard_awareness",
    prompt: "You see a dense fog bank across the road ahead. Before entering it you should:",
    options: [
      "Switch to main beam for maximum light",
      "Slow down first, switch to dipped beams, and increase following distance",
      "Stop in your lane until it lifts",
      "Follow the car ahead closely so you don't lose it",
    ],
    correctIndex: 1,
    explanation:
      "Main beam reflects off fog and blinds you. Shed speed before you enter, use dipped beams (and fog lights if fitted), and never stop on the roadway itself.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_haz_blowout",
    categoryId: "hazard_awareness",
    prompt: "A front tyre bursts at freeway speed. The correct response is to:",
    options: [
      "Brake as hard as possible immediately",
      "Grip the wheel firmly, ease off the accelerator, keep straight, and brake gently once under control",
      "Swerve to the emergency lane immediately",
      "Pull the handbrake",
    ],
    correctIndex: 1,
    explanation:
      "Hard braking on a burst tyre pulls the car violently toward the flat. Hold it straight, let speed bleed off, then ease over and stop in a safe place.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_haz_oncoming_overtaker",
    categoryId: "hazard_awareness",
    prompt: "An oncoming car pulls into YOUR lane to overtake and won't make it back in time. You should:",
    options: [
      "Hold your line — you have right of way",
      "Brake hard and move as far left as safely possible, even onto the shoulder",
      "Swerve right, behind the overtaker",
      "Flash your lights and maintain speed",
    ],
    correctIndex: 1,
    explanation:
      "Being right doesn't survive a head-on. Brake to shed energy and give them the room — left, onto the shoulder if needed. Never swerve right into the lane they came from.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_haz_first_rain",
    categoryId: "hazard_awareness",
    prompt: "Why is the road extra slippery in the first minutes of rain after a long dry spell?",
    options: [
      "Rainwater is naturally oily",
      "Accumulated oil and rubber on the surface float up before being washed away",
      "Tyres shrink in the rain",
      "It isn't — light rain has no effect",
    ],
    correctIndex: 1,
    explanation:
      "The first shower lifts months of oil, diesel and rubber dust into a greasy film. Grip returns somewhat once heavier rain washes it off — treat those first minutes like ice.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_haz_night_glare",
    categoryId: "hazard_awareness",
    prompt: "An oncoming vehicle's main beams are dazzling you. You should:",
    options: [
      "Stare at their lights so your eyes adjust",
      "Look slightly left toward your lane edge or the left line, slow down, and don't retaliate with your own beams",
      "Close one eye",
      "Brake to a stop in your lane",
    ],
    correctIndex: 1,
    explanation:
      "Use the left road edge as your steering reference until they've passed. Retaliating with main beam just creates two blind drivers heading at each other.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_haz_breakdown_freeway",
    categoryId: "hazard_awareness",
    prompt: "Your car breaks down on a freeway. The safest sequence is:",
    options: [
      "Stop in your lane and put hazards on",
      "Get fully onto the emergency shoulder, hazards on, triangle at least 45 m behind, and wait away from the traffic side",
      "Abandon the car exactly where it stops",
      "Reverse along the shoulder to the previous off-ramp",
    ],
    correctIndex: 1,
    explanation:
      "Clear the traffic lanes, warn approaching drivers (hazards + triangle 45 m back), and keep yourself and passengers behind the barrier or well clear of the traffic side.",
    difficulty: 2,
    scope: "learners",
  },

  // ── CAR-SPECIFIC (Code 8) ───────────────────────────────────
  {
    id: "q2_car_child_restraint",
    categoryId: "rules",
    codes: ["8"],
    prompt: "A child under three years old travelling in your car must:",
    options: [
      "Sit on an adult's lap, held tightly",
      "Be secured in an appropriate child restraint (car seat)",
      "Sit in the front for supervision",
      "Simply wear the adult seatbelt",
    ],
    correctIndex: 1,
    explanation:
      "Children under 3 must ride in a proper child restraint. An adult's arms — or an adult belt on a small body — cannot hold a child in a crash.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_car_airbag_childseat",
    categoryId: "rules",
    codes: ["8"],
    prompt: "A rear-facing baby seat should never be placed:",
    options: [
      "On the back seat",
      "On a front seat with an active airbag",
      "Behind the driver",
      "In a station wagon",
    ],
    correctIndex: 1,
    explanation:
      "A deploying front airbag strikes the back of a rear-facing seat with enormous force. Use the rear seat, or deactivate the airbag if the front seat is unavoidable.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_car_auto_feet",
    categoryId: "controls",
    codes: ["8"],
    prompt: "In an automatic car, the recommended technique is to:",
    options: [
      "Brake with the left foot and accelerate with the right",
      "Use only the right foot for both accelerator and brake; the left foot rests",
      "Use both feet on the brake for extra power",
      "Keep the left foot on the selector",
    ],
    correctIndex: 1,
    explanation:
      "One-foot operation prevents pressing brake and accelerator together and preserves the reflex that 'off the accelerator' precedes braking.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_car_power_steering",
    categoryId: "controls",
    codes: ["8"],
    prompt: "If your engine dies while driving, the steering and brakes will:",
    options: [
      "Stop working entirely — you cannot control the car",
      "Still work, but feel much heavier — steer and brake with firm effort and stop safely",
      "Work normally",
      "Lock immediately",
    ],
    correctIndex: 1,
    explanation:
      "Power assistance dies with the engine, but the mechanical systems remain. Expect heavy steering and a hard pedal, keep the ignition on (steering unlocked) and pull off safely.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_car_cruise_wet",
    categoryId: "hazard_awareness",
    codes: ["8"],
    prompt: "Why should cruise control not be used on wet or slippery roads?",
    options: [
      "It uses more fuel in rain",
      "It can hold or increase power while the tyres aquaplane, and it delays your throttle response",
      "It disables the wipers",
      "It's fine to use in any weather",
    ],
    correctIndex: 1,
    explanation:
      "You want your foot governing the power in low grip — instantly easing off at the first sign of aquaplaning. Cruise control removes that feel and reaction.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_car_spare_kit",
    categoryId: "controls",
    codes: ["8"],
    prompt: "A sensible pre-trip check of your puncture kit includes:",
    options: [
      "Nothing — punctures are rare",
      "Spare wheel inflated, jack and wheel spanner present and working",
      "Only checking the spare exists",
      "Checking the radio works",
    ],
    correctIndex: 1,
    explanation:
      "A flat spare or missing spanner turns a 20-minute wheel change into being stranded. Check the kit before long trips.",
    difficulty: 1,
    scope: "learners",
  },

  // ── MOTORCYCLE-SPECIFIC (Code A / A1) ───────────────────────
  {
    id: "q2_mc_headlight_always",
    categoryId: "rules",
    codes: ["A"],
    prompt: "When must a motorcycle's headlamp be switched on?",
    options: [
      "Only at night",
      "At all times while riding — day and night",
      "Only in rain or fog",
      "Only on freeways",
    ],
    correctIndex: 1,
    explanation:
      "Motorcycles must ride with the headlamp on whenever in use. It's also your best conspicuity tool — most car-vs-bike crashes start with 'I didn't see the bike'.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_mc_learner_pillion",
    categoryId: "rules",
    codes: ["A"],
    prompt: "May you carry a passenger while riding on a motorcycle learner's licence?",
    options: [
      "Yes, if they hold a full licence",
      "No — a learner motorcyclist may not carry a passenger",
      "Yes, family members only",
      "Yes, during daylight",
    ],
    correctIndex: 1,
    explanation:
      "Unlike car learners (who ride WITH a supervisor), motorcycle learners ride alone — carrying any passenger on a learner's licence is prohibited.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_mc_gear_beyond_helmet",
    categoryId: "hazard_awareness",
    codes: ["A"],
    prompt: "Beyond the legally required helmet, sensible riding gear includes:",
    options: [
      "Nothing else matters",
      "Gloves, an abrasion-resistant jacket, sturdy boots and eye protection",
      "Sandals for better gear-lever feel",
      "Dark clothing to reduce glare for other drivers",
    ],
    correctIndex: 1,
    explanation:
      "Tar at any speed shreds skin. Gloves, jacket, boots and eye protection are the difference between bruises and skin grafts — high-visibility colours help you be seen too.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_mc_visor",
    categoryId: "hazard_awareness",
    codes: ["A"],
    prompt: "A badly scratched helmet visor is most dangerous when:",
    options: [
      "Riding at midday",
      "Riding at night or into low sun — scratches scatter light into blinding glare",
      "It looks bad but never affects vision",
      "Riding below 60 km/h",
    ],
    correctIndex: 1,
    explanation:
      "Scratches turn oncoming headlights and low sun into a starburst across your entire view. Replace a scratched visor — it's cheap compared to what it hides.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_mc_tyre_check",
    categoryId: "controls",
    codes: ["A"],
    prompt: "Motorcycle tyre pressures should be checked:",
    options: [
      "Once a year",
      "Regularly and when cold — the bike's grip, handling and braking all ride on two small contact patches",
      "Only before long trips",
      "Only by a dealer",
    ],
    correctIndex: 1,
    explanation:
      "With only two wheels there's no spare grip. Wrong pressures change the bike's steering and can cause instability — check cold, to the manufacturer's figures.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q2_mc_chain",
    categoryId: "controls",
    codes: ["A"],
    prompt: "Your pre-ride check finds the drive chain hanging visibly slack. You should:",
    options: [
      "Ride gently — chains fix themselves",
      "Adjust (or have adjusted) the tension first — a jumping or snapping chain can lock the rear wheel",
      "Oil it and ride at full speed",
      "Remove the chain guard",
    ],
    correctIndex: 1,
    explanation:
      "A loose chain can jump the sprocket or snap and wrap the wheel — a rear-wheel lock at speed. Tension and lubrication are core pre-ride items.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_mc_paint_wet",
    categoryId: "hazard_awareness",
    codes: ["A"],
    prompt: "In the wet, painted road markings and steel plates should be treated as:",
    options: [
      "Normal surface",
      "Very slippery — cross them upright, off the brakes, with gentle throttle",
      "Grippier than tar",
      "Places to brake harder",
    ],
    correctIndex: 1,
    explanation:
      "Wet paint, manhole covers and steel plates offer a fraction of tar's grip. Plan lines to cross them as upright and unloaded as possible.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_mc_pillion_rules",
    categoryId: "rules",
    codes: ["A"],
    prompt: "To legally and safely carry a pillion passenger (full licence), the motorcycle and passenger must have:",
    options: [
      "Nothing specific — hold on tight",
      "A proper passenger seat and footrests, with the passenger seated astride facing forward, wearing a helmet",
      "Only a helmet for the rider",
      "A sidecar",
    ],
    correctIndex: 1,
    explanation:
      "Pillions need a real seat, footrests, a fastened helmet, and must sit astride facing forward. Remember braking and handling change noticeably with a passenger.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_mc_target_fixation",
    categoryId: "hazard_awareness",
    codes: ["A"],
    prompt: "'Target fixation' on a motorcycle means:",
    options: [
      "Focusing on your speedometer",
      "You tend to steer where you stare — so in trouble, look at your escape path, not at the obstacle",
      "Fixing your eyes on the horizon at all times",
      "Watching only your mirrors",
    ],
    correctIndex: 1,
    explanation:
      "The bike follows your eyes. Staring at the pothole, car or barrier pulls you into it — train yourself to look at the gap you want.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_mc_group_riding",
    categoryId: "rules",
    codes: ["A"],
    prompt: "Riding in a group on the open road, the recommended formation is:",
    options: [
      "Side by side in pairs",
      "Staggered — alternating left and right of the lane, dropping to single file for corners and narrow roads",
      "As close together as possible",
      "Random spacing",
    ],
    correctIndex: 1,
    explanation:
      "A staggered formation keeps following distance to the bike directly ahead while keeping the group compact — and every rider still owns a full lane position for hazards.",
    difficulty: 2,
    scope: "learners",
  },

  // ── HEAVY-SPECIFIC (Code 10 / 14) ───────────────────────────
  {
    id: "q2_hv_arrester_bed",
    categoryId: "hazard_awareness",
    codes: ["14"],
    prompt: "Your brakes are failing on a long mountain descent and an arrester bed is signposted ahead. You should:",
    options: [
      "Avoid it — it will damage the truck",
      "Commit to the arrester bed early and steer positively into it",
      "Try to coast to the bottom in neutral",
      "Pull the trailer handbrake only",
    ],
    correctIndex: 1,
    explanation:
      "Arrester beds exist to stop runaways — deep gravel absorbs the energy. Deciding early matters: past the bed, options run out fast. Vehicle damage is trivial next to a runaway truck.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_hv_descent_gear",
    categoryId: "controls",
    codes: ["14"],
    prompt: "The correct gear for a long steep descent in a heavy vehicle is selected:",
    options: [
      "Halfway down, once speed builds",
      "Before the descent starts — a low gear, so engine braking and the retarder control speed with brakes in reserve",
      "Neutral, to save fuel",
      "Top gear for stability",
    ],
    correctIndex: 1,
    explanation:
      "Rule of thumb: go down in the gear you'd climb it in, selected at the top. Trying to downshift mid-descent with an overspeeding engine can leave you stuck in neutral.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_hv_blind_spots",
    categoryId: "hazard_awareness",
    codes: ["14"],
    prompt: "The largest blind spots on a truck are:",
    options: [
      "There are none with big mirrors",
      "Directly behind the trailer, close along the left side, and right below the windscreen line",
      "Only on the right",
      "Above the cab",
    ],
    correctIndex: 1,
    explanation:
      "Cars and pedestrians vanish behind the trailer, down the passenger side and right in front of the high cab. Check long and use every mirror before turning or changing lanes — especially left.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_hv_load_secure",
    categoryId: "rules",
    codes: ["14"],
    prompt: "After securing a load with straps or chains, good practice is to:",
    options: [
      "Never touch them again",
      "Stop and re-check tension a short distance into the trip — loads settle and lashings loosen",
      "Loosen them at the first stop for the load's comfort",
      "Check them only at the destination",
    ],
    correctIndex: 1,
    explanation:
      "Loads shift and settle in the first kilometres, slackening the lashings. A quick early re-check (and regular checks after) keeps the load — and everyone around it — safe.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_hv_height_route",
    categoryId: "rules",
    codes: ["14"],
    prompt: "The general legal maximum height for a loaded vehicle in South Africa is:",
    options: ["3,0 m", "4,3 m", "5,5 m", "There is no limit"],
    correctIndex: 1,
    explanation:
      "4,3 m is the general limit. Know your actual travelling height and plan routes around lower structures — a clearance sign lower than your height means finding another road.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_hv_tail_swing",
    categoryId: "hazard_awareness",
    codes: ["14"],
    prompt: "'Tail swing' on a long vehicle means:",
    options: [
      "The trailer wags at speed",
      "As you turn, the rear overhang swings OUT the opposite way — it can strike poles, cars or pedestrians beside you",
      "The cab leans in corners",
      "The load shifts backward",
    ],
    correctIndex: 1,
    explanation:
      "Turning right swings the rear overhang left (and vice versa). Check the mirrors on the outside of the turn before committing, especially leaving a stop with people alongside.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_hv_speed_80",
    categoryId: "rules",
    codes: ["14"],
    prompt: "A goods vehicle with GVM over 9 000 kg is limited to what maximum speed, even on a 120 km/h freeway?",
    options: ["120 km/h", "80 km/h", "100 km/h", "60 km/h"],
    correctIndex: 1,
    explanation:
      "Heavy goods vehicles (GVM > 9 t) may not exceed 80 km/h anywhere. The energy and stopping distance of a loaded truck at speed are simply unmanageable.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_hv_moving_brake_test",
    categoryId: "controls",
    codes: ["14"],
    prompt: "Shortly after moving off, a professional driver performs:",
    options: [
      "A hooter test",
      "A gentle rolling brake test at low speed to confirm the brakes actually work under way",
      "A top-speed run",
      "Nothing — the pre-trip covered it",
    ],
    correctIndex: 1,
    explanation:
      "Gauge pressure standing still doesn't prove the foundation brakes work. A low-speed rolling check confirms braking on both vehicle and trailer before you need them for real.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q2_hv_prdp_dangerous",
    categoryId: "rules",
    codes: ["14"],
    prompt: "To transport dangerous goods you need a professional driving permit (PrDP) of category:",
    options: ["G (goods)", "D (dangerous goods)", "P (passengers)", "No PrDP is needed"],
    correctIndex: 1,
    explanation:
      "PrDP categories: G for goods, P for passengers, D for dangerous goods (which includes the G and P requirements plus extra vetting).",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q2_hv_fatigue_plan",
    categoryId: "hazard_awareness",
    codes: ["14"],
    prompt: "On a long-haul trip, the professional approach to fatigue is to:",
    options: [
      "Push through — deadlines come first",
      "Plan rest stops into the schedule and stop at the first signs of drowsiness — microsleeps at 80 km/h are lethal",
      "Rely on energy drinks",
      "Open the window and turn up the radio",
    ],
    correctIndex: 1,
    explanation:
      "A 4-second microsleep at 80 km/h is ~90 m unseen. Stimulants mask, not fix, fatigue — only sleep does. Build the stops into the plan before you leave.",
    difficulty: 1,
    scope: "learners",
  },
];
