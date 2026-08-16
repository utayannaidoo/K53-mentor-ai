// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/gen-content-meta.mjs
// Kept honest by tests/starter-pack.test.ts.
//
// The bundled starter pack: the only content that ships to the browser without
// a paid entitlement. Everything else is served by /api/content/pack and cached
// on the device.
//
// Sized so the free tier never notices the difference — a free learner's
// lifetime allowance is one diagnostic, ~15 practice questions, one mini mock
// and one section drill, all of which draw from this pack with room to rotate.
// It is also what keeps the free tier working offline and zero-config demo mode
// intact (CLAUDE.md rule 1).
//
// Every item here is universal (no `codes`), so each licence code sees the same
// pack and forCode() is a no-op over it.
import type { Flashcard, Question, Scenario } from "@/types";

export const STARTER_QUESTIONS: Question[] = [
  {
    "id": "q_sign_box_junction",
    "categoryId": "signs",
    "prompt": "Yellow criss-cross lines painted in a box at an intersection mean:",
    "options": [
      "Park inside the box",
      "Do not enter the box unless your exit is clear",
      "Stop inside the box and wait",
      "Pedestrian crossing"
    ],
    "correctIndex": 1,
    "explanation": "A yellow box junction must be kept clear: do not enter it unless your exit is clear, so you never block cross-traffic.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q4_mark_arrow_lane",
    "categoryId": "signs",
    "prompt": "You're in a lane with a painted LEFT-turn arrow but you want to go straight. You must:",
    "options": [
      "Go straight anyway — arrows are advisory",
      "Turn left as the arrow requires, then find a safe place to re-route",
      "Stop and reverse into the correct lane",
      "Hoot and change lanes inside the intersection"
    ],
    "correctIndex": 1,
    "explanation": "Lane arrows are regulatory. Making the 'wrong' legal turn and re-routing costs a minute; forcing your intended move across traffic causes collisions.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-017-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "End of single-carriage freeway",
      "Reserved stop zone",
      "One-way roadway (left)",
      "Proceed in the direction shown"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"End of single-carriage freeway\". End of single carriage freeway and freeway rules no longer apply.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-017-06.png"
  },
  {
    "id": "gen-sign-warning-030-01-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Length restriction ahead",
      "Construction vehicles ahead",
      "Loose stones ahead (temporary)",
      "Priority road with crossroad ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Length restriction ahead\". Vehicle length regulatory restriction ahead.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-030-01.png"
  },
  {
    "id": "gen-sign-regulatory-022-03-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Traffic signal — amber",
      "Goods vehicles only",
      "No right turn",
      "Pedestrian priority"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Traffic signal — amber\". Steady amber: stop, unless you are too close to stop safely.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-022-03.png"
  },
  {
    "id": "gen-sign-regulatory-013-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "The curved yellow line indicates the start of a lane reserved for the exclusive use of the class of vehicle indicated.",
      "Vehicle mass restriction no longer applies.",
      "End of single carriage freeway and freeway rules no longer apply.",
      "Give way to all cross-traffic and to pedestrians crossing or about to cross."
    ],
    "correctIndex": 0,
    "explanation": "This regulatory sign: The curved yellow line indicates the start of a lane reserved for the exclusive use of the class of vehicle indicated.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-013-02.png"
  },
  {
    "id": "gen-sign-regulatory-014-03-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Parking for people with disabilities",
      "Time-limited parking",
      "One-way roadway (left)",
      "End of lane reservation"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Parking for people with disabilities\". Parking here is reserved for a vehicle carrying people with disabilities.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-014-03.png"
  },
  {
    "id": "qs3_pass_side_shown",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-009-04.png",
    "prompt": "This blue command sign at an obstruction tells you:",
    "options": [
      "Which side of the obstruction you must pass",
      "That the road ahead is one-way",
      "That you must turn at the next junction",
      "That the obstruction may be passed on either side"
    ],
    "correctIndex": 0,
    "explanation": "It governs the object immediately in front of you — an island, a works barrier, a bridge pier — rather than the road beyond it. Blue circle, so it is a command.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-information-043-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Temporary high speed exit countdown sign.",
      "Information centre where you can obtain information about the local area, directions and so on.",
      "Modal transfer. At this point you can change your mode of transport, e.",
      "No through road ahead, as indicated by the red bar."
    ],
    "correctIndex": 0,
    "explanation": "This information sign: Temporary high speed exit countdown sign. Example shown: 300m to the exit.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/information/information-043-02.png"
  },
  {
    "id": "qs3_bus_lane_reservation",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-013-01.png",
    "prompt": "This blue sign shows a bus, a large 'R', and a yellow line down one side. It means:",
    "options": [
      "The lane on the marked side of the yellow line is reserved for buses",
      "Buses are prohibited from the lane shown",
      "Buses stop at this point",
      "All vehicles must give way to buses here"
    ],
    "correctIndex": 0,
    "explanation": "The 'R' is for reservation, and the yellow line on the sign shows which side of the real yellow line the reserved lane lies. Using it in an ordinary car is an offence.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "gen-sign-information-043-03-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No through road",
      "Modal transfer point",
      "Priority road",
      "Freeway exit countdown markers"
    ],
    "correctIndex": 0,
    "explanation": "This is the information sign \"No through road\". No through road ahead, as indicated by the red bar.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/information/information-043-03.png"
  },
  {
    "id": "qs2_signals_ahead",
    "categoryId": "signs",
    "prompt": "A warning sign showing a traffic-light symbol means:",
    "options": [
      "Traffic signals are ahead, possibly hidden by a bend or a crest",
      "The signals ahead are out of order",
      "The signals ahead are controlled by a traffic officer",
      "You may proceed without stopping if the way is clear"
    ],
    "correctIndex": 0,
    "explanation": "These go up where the robot cannot be seen from far enough away. Slow down and be ready to stop — you may come over a rise to find a red and a queue.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qs2_hospital_sign",
    "categoryId": "signs",
    "prompt": "A blue information sign showing an 'H' indicates:",
    "options": [
      "A hospital, where you should expect ambulances and reduce noise",
      "A helipad for air ambulances only",
      "A hazardous-goods depot",
      "A heavy-vehicle inspection point"
    ],
    "correctIndex": 0,
    "explanation": "Blue rectangles inform. Around a hospital, expect emergency vehicles arriving from unexpected directions and pedestrians who are distracted or distressed.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_sign_yellow_line",
    "categoryId": "signs",
    "prompt": "What does a solid yellow line at the edge of the road indicate?",
    "options": [
      "The edge of the roadway / emergency lane — not a normal travelling lane",
      "A dedicated overtaking lane",
      "A bus-only lane at all times",
      "The centre of the road"
    ],
    "correctIndex": 0,
    "explanation": "The yellow line marks the edge of the roadway. It is not a travelling lane, and you may not cross it to overtake on the left.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_sign_lane_arrows",
    "categoryId": "signs",
    "prompt": "You are in a lane with a painted left-turn arrow. At the intersection you must:",
    "options": [
      "Go straight if the road ahead looks clear",
      "Turn left — lane-use arrows are compulsory once you're in that lane",
      "Stop and wait for a traffic officer",
      "Reverse out of the lane"
    ],
    "correctIndex": 1,
    "explanation": "Painted lane arrows are regulatory. If you're in a turn lane by mistake, you must make the turn and re-route afterwards — changing course in the intersection is illegal and dangerous.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qs3_temp_surface_step",
    "categoryId": "signs",
    "image": "/signs/warning/warning-031-01.png",
    "prompt": "A temporary sign warning of a step in the road surface means:",
    "options": [
      "There is a vertical drop between surface levels — cross it slowly and squarely",
      "The road rises steeply ahead",
      "A speed hump has been installed",
      "The surface changes from tar to gravel"
    ],
    "correctIndex": 0,
    "explanation": "Resurfacing often leaves one lane lower than the next. Taken at an angle or at speed, that edge can deflect the steering or damage a tyre and rim.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_sign_temp_yellow",
    "categoryId": "signs",
    "prompt": "Road signs with a yellow background at roadworks are:",
    "options": [
      "Suggestions that only apply to construction vehicles",
      "Temporary signs — they carry the same legal force as permanent signs",
      "Advertisements placed by the contractor",
      "Only valid during working hours"
    ],
    "correctIndex": 1,
    "explanation": "Yellow-background signs are temporary (usually at roadworks) and must be obeyed exactly like permanent signs, including temporary speed limits.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-037-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Pedestrians ahead",
      "General warning",
      "Cattle grid ahead",
      "Agricultural vehicles ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Pedestrians ahead\". Pedestrians ahead.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/warning/warning-037-02.png"
  },
  {
    "id": "q_sign_one_way",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-008-02.png",
    "prompt": "This blue sign with a white arrow indicates:",
    "options": [
      "You must turn left at the next junction",
      "A one-way roadway — traffic flows only in the direction of the arrow",
      "Keep left to allow overtaking",
      "A detour to the left"
    ],
    "correctIndex": 1,
    "explanation": "A white arrow on a blue rectangle marks a one-way roadway; all traffic travels only in the direction the arrow points.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-information-043-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "No through road to the left (or right), as indicated by the red bar.",
      "Information centre where you can obtain information about the local area, directions and so on.",
      "Modal transfer. At this point you can change your mode of transport, e.",
      "High speed freeway exit countdown signs."
    ],
    "correctIndex": 0,
    "explanation": "This information sign: No through road to the left (or right), as indicated by the red bar.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/information/information-043-04.png"
  },
  {
    "id": "gen-sign-regulatory-010-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Heavy goods vehicles only",
      "End of lane reservation",
      "End of single-carriage freeway",
      "Parking for the class shown"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Heavy goods vehicles only\". To indicate that the road or part of it is set aside for use by goods vehicles with a gross vehicle mass or gross combination mass exceeding the mass indicated in tons by a number on such a sign.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-010-04.png"
  },
  {
    "id": "q4_sign_children_response",
    "categoryId": "signs",
    "image": "/signs/warning/warning-037-03.png",
    "prompt": "Past this warning sign the K53 defensive response is to:",
    "options": [
      "Maintain speed but hoot at intervals",
      "Reduce speed, cover the brake and scan verges and parked cars for children",
      "Switch on headlights",
      "Change to a higher gear"
    ],
    "correctIndex": 1,
    "explanation": "Children are small, fast and unpredictable — near schools expect one to appear from between parked cars. Speed down, foot ready.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-040-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Overhead structure marker",
      "Road narrows from both sides",
      "Railway crossing",
      "Side road junction ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Overhead structure marker\". Danger plate. Marks the position of an overhead structure across the road.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-040-04.png"
  },
  {
    "id": "q_sign_broken_white",
    "categoryId": "signs",
    "prompt": "A broken white line painted along the centre of the road means:",
    "options": [
      "You may never cross it",
      "You may cross it to overtake when it is safe and legal to do so",
      "It marks the edge of the road",
      "Parking is allowed on the line"
    ],
    "correctIndex": 1,
    "explanation": "A broken centre line may be crossed when it is safe — for example to overtake. A solid centre line may not be crossed.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-009-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "The maximum speed, in km/h, at which you may drive past this sign.",
      "This area is reserved for parking by police vehicles.",
      "This area is temporarily reserved for parking by the class of vehicle shown.",
      "To prohibit motorcycles on a part of a carriageway for safety reasons."
    ],
    "correctIndex": 0,
    "explanation": "Speed limit: The maximum speed, in km/h, at which you may drive past this sign. Exceeding it is an offence.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-009-03.png"
  },
  {
    "id": "qs2_mass_limit",
    "categoryId": "signs",
    "prompt": "A red-bordered round sign showing a mass in tonnes means:",
    "options": [
      "Vehicles exceeding that mass may not proceed — usually because a structure cannot carry them",
      "Loads above that mass must be declared at a weighbridge",
      "That is the maximum mass the road surface prefers",
      "Only abnormal-load permits above that mass are affected"
    ],
    "correctIndex": 0,
    "explanation": "Mass restrictions protect bridges and weak surfaces. Exceeding one risks a collapse, so it is enforced against the driver regardless of who loaded the vehicle.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qs2_tunnel",
    "categoryId": "signs",
    "prompt": "Approaching a sign warning of a tunnel ahead, you should:",
    "options": [
      "Switch your headlights on and not overtake inside the tunnel",
      "Switch to parking lights only to avoid dazzling others",
      "Sound your hooter before entering",
      "Increase speed to clear the tunnel quickly"
    ],
    "correctIndex": 0,
    "explanation": "Your eyes take time to adjust going in and coming out, and a tunnel gives you nowhere to go. Lights on so you are seen, and no overtaking.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-011-01-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No left turn",
      "Proceed clockwise at the junction",
      "Alternative route to toll road",
      "Parking for the class shown"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"No left turn\". versions have a yellow disc. To prohibit vehicles from turning left.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-011-01.png"
  },
  {
    "id": "gen-sign-regulatory-017-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "End of lane reservation",
      "End of single-carriage freeway",
      "No pedestrians",
      "No right turn"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"End of lane reservation\". End of lane use reservation and all vehicles may now use this lane.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-017-04.png"
  },
  {
    "id": "gen-sign-warning-027-05-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Steep ascent ahead",
      "Uneven road ahead",
      "Danger plate — pass this side",
      "Width restriction ahead (temporary)"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Steep ascent ahead\". Steep uphill ahead. You may not cross a No Overtaking line to overtake a slow moving vehicle.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/warning/warning-027-05.png"
  },
  {
    "id": "gen-sign-warning-029-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Reduced visibility ahead",
      "Drift ahead",
      "Width restriction ahead (temporary)",
      "Narrow structure ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Reduced visibility ahead\". Reduced visibility can be expected ahead (e.g. frequent mist).",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-029-06.png"
  },
  {
    "id": "gen-sign-regulatory-006-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Come to a complete stop behind the stop line every time — even if the road is empty — then move off only when it is safe.",
      "Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow at the next junction.",
      "The curved yellow line indicates the start of a lane reserved for the exclusive use of the class of vehicle indicated.",
      "Steady green: you may proceed if the way is clear."
    ],
    "correctIndex": 0,
    "explanation": "Stop: Come to a complete stop behind the stop line every time — even if the road is empty — then move off only when it is safe.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-006-01.png"
  },
  {
    "id": "gen-sign-regulatory-013-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Temporary lane reservation",
      "Temporary parking reservation",
      "Parking for authorised vehicles",
      "End of residential area"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Temporary lane reservation\". This portion of roadway is temporarily reserved for the exclusive use of the class of vehicle indicated.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-013-07.png"
  },
  {
    "id": "q2_sign_officer_overrides",
    "categoryId": "signs",
    "prompt": "A traffic officer signals you through a red robot. You should:",
    "options": [
      "Wait for green anyway — the robot takes priority",
      "Obey the officer — a traffic officer's signal overrides robots and signs",
      "Hoot to confirm before moving",
      "Reverse away from the intersection"
    ],
    "correctIndex": 1,
    "explanation": "A traffic officer's directions rank above traffic signals and signs. Follow the officer's instruction, carefully.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-031-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Road width regulatory restriction ahead (temporary version).",
      "Water crosses the road at a drift ahead.",
      "Marks the place and direction of a sharp bend in the road.",
      "Steep uphill ahead. You may not cross a No Overtaking line to overtake a slow moving vehicle."
    ],
    "correctIndex": 0,
    "explanation": "Width restriction ahead (temporary): Road width regulatory restriction ahead (temporary version).",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-031-04.png"
  },
  {
    "id": "gen-sign-regulatory-006-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Yield",
      "No entry",
      "Time-limited parking",
      "Cyclists and pedestrians only"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Yield\". Give way to all cross-traffic and to pedestrians crossing or about to cross. You need not stop if the way is clear, but must be ready to.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-006-02.png"
  },
  {
    "id": "gen-sign-warning-040-06-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Marks the position of a separation in the road (e.",
      "Vehicle height regulatory restriction ahead (temporary version).",
      "Marks the place and direction of a sharp bend in the road.",
      "Gate, railway boom or barrier ahead."
    ],
    "correctIndex": 0,
    "explanation": "This warning sign: Marks the position of a separation in the road (e.g. at a freeway exit).",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-040-06.png"
  },
  {
    "id": "q2_sign_bus_lane",
    "categoryId": "signs",
    "prompt": "A lane marked as reserved for buses may be used by a private car:",
    "options": [
      "Whenever the lane is empty",
      "Not at all while the reservation applies — except briefly where signs allow crossing to turn",
      "During weekends only, automatically",
      "If you switch on your hazard lights"
    ],
    "correctIndex": 1,
    "explanation": "Reserved lanes (BUS, minibus-taxi, cycle lanes) are off-limits to other vehicles while the reservation applies. Signs state the operative times and any exceptions.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q4_mark_stop_line",
    "categoryId": "signs",
    "prompt": "A solid white line painted ACROSS your lane at an intersection is:",
    "options": [
      "A yield line — slow down",
      "A stop line — stop behind it (with a stop sign/red signal)",
      "The start of a pedestrian crossing",
      "Decoration marking the intersection"
    ],
    "correctIndex": 1,
    "explanation": "Solid across the lane = stop line; a BROKEN line across = yield line. Stop with your front wheels behind the solid line, not on it.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q4_sign_temporary",
    "categoryId": "signs",
    "prompt": "The same sign on a YELLOW background instead of white means:",
    "options": [
      "It is advisory only",
      "It is a temporary sign (e.g. roadworks) with the same legal force as the permanent one",
      "It applies to taxis only",
      "It applies at night only"
    ],
    "correctIndex": 1,
    "explanation": "Yellow-background signs are temporary versions used at roadworks and incidents. A temporary 60 limit is just as enforceable as a permanent one.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q6_temp_why_yellow",
    "categoryId": "signs",
    "prompt": "Why are temporary signs printed on a yellow background?",
    "options": [
      "Yellow paint is cheapest",
      "The high-visibility colour instantly flags that conditions have changed from normal — re-assess",
      "To match construction vehicles",
      "It has no particular meaning"
    ],
    "correctIndex": 1,
    "explanation": "Yellow shouts 'something's different here'. The moment you see it, drop your assumptions about the road and read what's changed.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-040-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Danger plate. Pass the hazard on the side to which the arrowhead points.",
      "Road ahead narrows from one side.",
      "Road width regulatory restriction ahead.",
      "Tarred road becomes a gravel road ahead, with loose stones that can damage windscreens and paintwork."
    ],
    "correctIndex": 0,
    "explanation": "Danger plate — pass this side: Danger plate. Pass the hazard on the side to which the arrowhead points.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-040-01.png"
  },
  {
    "id": "gen-sign-regulatory-014-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Parking for the class shown",
      "Parking reservation",
      "Heavy goods vehicles only",
      "No left turn"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Parking for the class shown\". This area is reserved for parking by the class of vehicle shown.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-014-02.png"
  },
  {
    "id": "qs2_sign_conflict_officer",
    "categoryId": "signs",
    "prompt": "A permanent sign and a traffic officer's directions conflict. You must:",
    "options": [
      "Follow the traffic officer",
      "Follow the permanent sign, since it is the law",
      "Stop and wait for the officer to leave",
      "Choose whichever is safer in your judgement"
    ],
    "correctIndex": 0,
    "explanation": "A person directing traffic outranks the signage, because they can see the situation the signs were never designed for — a crash, a failed robot, a closure.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-information-043-05-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Priority road. The road you are travelling on has priority at the junction ahead.",
      "No through road ahead, as indicated by the red bar.",
      "Information centre where you can obtain information about the local area, directions and so on.",
      "Temporary high speed exit countdown sign."
    ],
    "correctIndex": 0,
    "explanation": "Priority road: Priority road. The road you are travelling on has priority at the junction ahead.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/information/information-043-05.png"
  },
  {
    "id": "q_sign_steep_descent",
    "categoryId": "signs",
    "image": "/signs/warning/warning-027-04.png",
    "prompt": "This warning sign means a steep descent is ahead. The best response is to:",
    "options": [
      "Coast in neutral to save fuel",
      "Select a lower gear before the descent so the engine helps control your speed",
      "Brake hard continuously all the way down",
      "Speed up to get it over with"
    ],
    "correctIndex": 1,
    "explanation": "On a steep downhill, change to a lower gear so engine braking helps control speed. Riding the brakes the whole way can overheat and fade them.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qs2_causeway",
    "categoryId": "signs",
    "prompt": "A sign warning that the road ahead crosses a low-water bridge or causeway means you should:",
    "options": [
      "Be prepared to find water flowing over the road, and not enter if you cannot judge its depth",
      "Expect a toll booth at the bridge",
      "Reduce speed only when it is raining",
      "Cross quickly to avoid being caught by rising water"
    ],
    "correctIndex": 0,
    "explanation": "Low-water crossings flood fast and moving water floats a car in surprisingly little depth. If you cannot see the surface, you cannot know it is still there — wait or turn around.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-022-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Steady green: you may proceed if the way is clear.",
      "To indicate that the road or part of it is set aside for use by buses and minibuses only.",
      "To give drivers an opportunity to follow an alternate route or proceed on the route and pay toll fees.",
      "Parking here is reserved for a vehicle carrying people with disabilities."
    ],
    "correctIndex": 0,
    "explanation": "Traffic signal — green: Steady green: you may proceed if the way is clear.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-022-04.png"
  },
  {
    "id": "qs4_bus_signal_bar",
    "categoryId": "signs",
    "prompt": "A traffic signal showing a white horizontal bar or bus symbol applies to:",
    "options": [
      "Public-transport vehicles in a reserved lane, not to general traffic",
      "All traffic, as an alternative to the normal signal",
      "Pedestrians crossing at that point",
      "Vehicles turning right only"
    ],
    "correctIndex": 0,
    "explanation": "Dedicated signals release the bus lane on its own phase, often a few seconds early. Ordinary traffic obeys the ordinary signal beside it.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-027-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Gate, railway boom or barrier ahead.",
      "Gravel road becomes a tarred road ahead.",
      "Road width regulatory restriction ahead.",
      "Falling rocks ahead, especially after rain."
    ],
    "correctIndex": 0,
    "explanation": "Gate / railway boom ahead: Gate, railway boom or barrier ahead.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/warning/warning-027-02.png"
  },
  {
    "id": "gen-sign-warning-028-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Tarred road becomes a gravel road ahead, with loose stones that can damage windscreens and paintwork.",
      "Surface step in the road surface ahead (temporary version).",
      "Vehicle length regulatory restriction ahead (temporary version).",
      "Road ahead narrows from one side."
    ],
    "correctIndex": 0,
    "explanation": "Gravel road begins: Tarred road becomes a gravel road ahead, with loose stones that can damage windscreens and paintwork.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-028-01.png"
  },
  {
    "id": "gen-sign-regulatory-010-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Buses and minibuses only",
      "No hawkers",
      "Reserved stop zone",
      "Yield"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Buses and minibuses only\". To indicate that the road or part of it is set aside for use by buses and minibuses only.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-010-02.png"
  },
  {
    "id": "qs2_climbing_lane",
    "categoryId": "signs",
    "prompt": "A sign announcing a climbing (passing) lane ahead is most useful because it tells you:",
    "options": [
      "There will shortly be a safe, marked place to pass slow traffic — so you need not force a pass now",
      "Slow vehicles are prohibited beyond that point",
      "Overtaking is prohibited until the lane begins",
      "The gradient ahead requires a lower gear"
    ],
    "correctIndex": 0,
    "explanation": "Most dangerous overtaking on a rural road happens within a few kilometres of a climbing lane the driver didn't know was coming. Waiting costs a minute.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qs2_sign_placement_distance",
    "categoryId": "signs",
    "prompt": "Warning signs are placed some distance before the hazard itself so that:",
    "options": [
      "You have time to slow down and adjust before you reach it",
      "They can be read from a side road",
      "They are easier to maintain away from the hazard",
      "They apply from the sign onwards indefinitely"
    ],
    "correctIndex": 0,
    "explanation": "The gap is the point: a warning you meet at the hazard is useless. Faster roads get longer approach distances for the same reason.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qs4_general_warning_plate",
    "categoryId": "signs",
    "image": "/signs/warning/warning-029-03.png",
    "prompt": "A warning triangle showing an exclamation mark usually means:",
    "options": [
      "A hazard not covered by a specific sign — read the plate beneath it for what it is",
      "The road ahead is closed",
      "A traffic signal is out of order",
      "The previous warning no longer applies"
    ],
    "correctIndex": 0,
    "explanation": "It is the catch-all for anything without its own symbol. Without reading the plate underneath you know only that something is coming, which is precisely half the message.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_sign_ped_priority",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-007-04.png",
    "prompt": "This sign marks a pedestrian-priority area. Inside it you may:",
    "options": [
      "Drive normally as long as you hoot",
      "Enter only to load/offload or for an emergency, give way to pedestrians, and not exceed 15 km/h",
      "Never enter under any circumstances",
      "Park for up to 30 minutes"
    ],
    "correctIndex": 1,
    "explanation": "A pedestrian-priority zone is set aside for people on foot. Vehicles may enter only to load/offload or in an emergency, must yield to pedestrians, and may not exceed 15 km/h unless a sign allows more.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-009-05-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow.",
      "To prohibit pedestrians and stationary vehicles.",
      "Give way to any pedestrians on, or about to enter, the pedestrian crossing on your side of the road.",
      "End of single carriage freeway and freeway rules no longer apply."
    ],
    "correctIndex": 0,
    "explanation": "Proceed in the direction shown: Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-009-05.png"
  },
  {
    "id": "gen-sign-warning-028-05-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Road narrows from both sides",
      "Length restriction ahead (temporary)",
      "Surface step ahead (temporary)",
      "Width restriction ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Road narrows from both sides\". Road ahead narrows from both sides. Keep well to the left.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-028-05.png"
  },
  {
    "id": "gen-sign-regulatory-010-07-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "To indicate that the road or part of it may be used by cyclists and pedestrians only.",
      "To give drivers an opportunity to follow an alternate route or proceed on the route and pay toll fees.",
      "Parking here is reserved for a vehicle carrying people with disabilities.",
      "Steady amber: stop, unless you are too close to stop safely."
    ],
    "correctIndex": 0,
    "explanation": "Cyclists and pedestrians only: To indicate that the road or part of it may be used by cyclists and pedestrians only. Indicates to cyclists and pedestrians which part of the road they may use.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-010-07.png"
  },
  {
    "id": "q2_sign_guidance_green",
    "categoryId": "signs",
    "prompt": "Large green boards above or beside a freeway show:",
    "options": [
      "Tourist attractions in the area",
      "Direction guidance — routes, destinations and exits",
      "Mandatory speed limits",
      "General warnings of hazards ahead"
    ],
    "correctIndex": 1,
    "explanation": "Green guidance signs help you navigate: route numbers, destinations and exit information. Read them early so you can change lanes in good time.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q3_rule_speed_urban",
    "categoryId": "rules",
    "prompt": "Unless a sign says otherwise, the general speed limit in an urban area is:",
    "options": [
      "40 km/h",
      "60 km/h",
      "80 km/h",
      "100 km/h"
    ],
    "correctIndex": 1,
    "explanation": "The default limits are 60 km/h in urban areas, 100 km/h on public roads outside urban areas, and 120 km/h on freeways — signs can lower any of them.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr4_aarto_paying_fine",
    "categoryId": "rules",
    "prompt": "Paying an AARTO infringement notice rather than contesting it:",
    "options": [
      "Settles the fine but does not remove the demerit points attached to that infringement",
      "Cancels the infringement entirely, including any points",
      "Doubles the points as an admission",
      "Has no effect on your record either way"
    ],
    "correctIndex": 0,
    "explanation": "Paying is an admission, so the points follow. Drivers who assume a paid fine is the end of it are exactly the ones surprised by a suspension later.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_rules_load_rear",
    "categoryId": "rules",
    "prompt": "How far may a load legally project beyond the rear of your vehicle, and what must you do?",
    "options": [
      "Up to 3 m with no marking",
      "Up to 1,8 m, and the projection must be clearly marked (e.g. red flag by day)",
      "Any distance if you drive slowly",
      "Loads may never project at the rear"
    ],
    "correctIndex": 1,
    "explanation": "The rear projection limit is 1,8 m. Projecting loads must be marked so other drivers can see them — a red flag in daylight, a red light at night.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_rules_throwing",
    "categoryId": "rules",
    "prompt": "Throwing an object from a moving vehicle is:",
    "options": [
      "Legal if it's biodegradable",
      "An offence — it can endanger other road users and is prohibited",
      "Legal on gravel roads",
      "Only illegal on freeways"
    ],
    "correctIndex": 1,
    "explanation": "Objects from vehicles become hazards for motorcyclists, cyclists and cars behind you, and littering from a vehicle is an offence.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_rules_door_open",
    "categoryId": "rules",
    "prompt": "Before opening your door on the traffic side, the law requires you to:",
    "options": [
      "Open it quickly so it's not in the way for long",
      "Make sure it's safe — you may not open a door into the path of traffic or leave it open longer than necessary",
      "Switch on your hazard lights first, then open it freely",
      "Hoot twice"
    ],
    "correctIndex": 1,
    "explanation": "Check mirrors and look back for cyclists, motorcyclists and cars before opening. An opened door counts as an obstruction you're responsible for.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr5_driver_responsible_condition",
    "categoryId": "rules",
    "prompt": "Responsibility for a vehicle being in a safe, roadworthy condition when it is driven rests with:",
    "options": [
      "The driver, alongside the owner — you cannot rely on someone else having checked it",
      "The owner only, if that is a different person",
      "The last workshop that serviced it",
      "The testing station that issued the certificate"
    ],
    "correctIndex": 0,
    "explanation": "You are the one operating it on the road, so the defect is yours at that moment. 'It is not my car' is not a defence for driving with failed brakes or no lights.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_headlights_courtesy",
    "categoryId": "rules",
    "prompt": "Flashing your headlights at another driver is best understood as:",
    "options": [
      "A warning that you are there — it does not grant them permission to proceed",
      "A recognised signal that you are giving way",
      "A legal instruction the other driver must obey",
      "The correct way to indicate you intend to overtake"
    ],
    "correctIndex": 0,
    "explanation": "There is no legal meaning to a flash, and drivers read it both ways. Waving someone into a gap you cannot fully see is how people get hit.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q5_rule_hand_signal_right",
    "categoryId": "rules",
    "prompt": "Your indicators fail. To signal a RIGHT turn by hand you:",
    "options": [
      "Point straight up out of the window",
      "Extend your right arm horizontally, straight out of the window",
      "Wave your arm in circles",
      "Flash your headlights twice"
    ],
    "correctIndex": 1,
    "explanation": "Arm straight out = turning right. Rotating the extended arm anticlockwise = slowing/stopping. Hand signals are the legal fallback when lamps fail.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q5_rule_belt_responsible",
    "categoryId": "rules",
    "prompt": "Who is legally responsible for ensuring passengers wear their seatbelts?",
    "options": [
      "Each passenger for themselves",
      "The driver",
      "The vehicle owner",
      "Nobody — belts are voluntary for adults"
    ],
    "correctIndex": 1,
    "explanation": "The driver must ensure every occupant uses a belt where one is fitted. 'They didn't want to' is not a defence at a roadblock or in a crash.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_rules_ped_collision",
    "categoryId": "rules",
    "prompt": "If a vehicle collides with a pedestrian, the driver:",
    "options": [
      "Is never at fault if the pedestrian jaywalked",
      "Will be prosecuted, irrespective of who had right of way",
      "Only faces a fine if speeding",
      "Has no responsibility"
    ],
    "correctIndex": 1,
    "explanation": "The law gives pedestrians strong protection: if a vehicle hits a pedestrian, the driver can be prosecuted regardless of who had right of way. Always drive defensively around people on foot.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr2_roadblock",
    "categoryId": "rules",
    "prompt": "You are signalled to stop at a roadblock. You should:",
    "options": [
      "Stop where directed, keep your hands visible, and produce your licence when asked",
      "Slow down but continue if you are in a hurry",
      "Stop only if a marked patrol vehicle is present",
      "Reverse and take an alternative route"
    ],
    "correctIndex": 0,
    "explanation": "Failing to stop when directed is an offence in itself. Stop where indicated and produce your driving licence on demand.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_rules_bus_speed",
    "categoryId": "rules",
    "prompt": "The general maximum speed for a bus or minibus on a freeway is:",
    "options": [
      "120 km/h",
      "100 km/h",
      "80 km/h",
      "60 km/h"
    ],
    "correctIndex": 1,
    "explanation": "Buses and minibuses are limited to 100 km/h even where the posted freeway limit is 120 km/h.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q5_rule_overtake_where_not",
    "categoryId": "rules",
    "prompt": "Where is overtaking PROHIBITED even without a sign?",
    "options": [
      "On any rural road",
      "Where you can't see the road ahead is clear — e.g. on a blind rise or curve, or when approaching a pedestrian crossing",
      "Within 5 km of a town",
      "Behind a truck"
    ],
    "correctIndex": 1,
    "explanation": "The standing rule: only overtake when you can see the way is clear and can return to your side safely. Blind rises, curves and crossings fail that test by definition.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q5_rule_signal_timing",
    "categoryId": "rules",
    "prompt": "How early must you signal before turning or changing lanes?",
    "options": [
      "As you start the manoeuvre",
      "In good time — long enough for others to see, understand and react before you move",
      "Exactly 3 seconds",
      "Signalling is optional if the road looks empty"
    ],
    "correctIndex": 1,
    "explanation": "A signal given during the manoeuvre is a commentary, not a warning. Signal early, check mirrors and blind spot, then act.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_rules_divided_solid",
    "categoryId": "rules",
    "prompt": "A solid line or barrier divides the road. You may:",
    "options": [
      "Cross it whenever traffic is light",
      "Not cross it — stay on the left of the division",
      "Cross it to reach a shop on the right",
      "Cross it only at night"
    ],
    "correctIndex": 1,
    "explanation": "On a divided road you must stay left of the division. Crossing a solid dividing line is a rule violation; a broken line may be crossed only to overtake or make a legal U-turn.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr3_footwear_control",
    "categoryId": "rules",
    "prompt": "Driving in loose sandals or with wet, slippery shoes matters because:",
    "options": [
      "You must stay in proper control — footwear that slips off or jams under a pedal takes that away",
      "It is specifically banned in the K53 syllabus",
      "It only matters in a manual vehicle",
      "It only affects the handbrake"
    ],
    "correctIndex": 0,
    "explanation": "The rule that bites is the general duty to remain in full control. A sandal wedged under the brake pedal is the moment that duty is tested, and no separate footwear regulation is needed to make it your fault.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_rules_being_overtaken",
    "categoryId": "rules",
    "prompt": "Another vehicle is overtaking you. You should:",
    "options": [
      "Speed up so they cannot pass",
      "Keep left, hold a steady speed and do not accelerate until they have passed",
      "Brake hard to let them in",
      "Move to the right"
    ],
    "correctIndex": 1,
    "explanation": "When being overtaken, move safely to the left, keep a steady speed and do not accelerate until the other vehicle has passed.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_rules_overtake_blind",
    "categoryId": "rules",
    "prompt": "You may not overtake:",
    "options": [
      "On a straight, clear road",
      "On a blind rise, a curve, or where your view ahead is limited",
      "When a broken line allows it and the road is clear",
      "On a one-way street"
    ],
    "correctIndex": 1,
    "explanation": "Never overtake on a blind rise, bend or anywhere your view of oncoming traffic is limited, or where a sign or solid line prohibits it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_rule_cellphone",
    "categoryId": "rules",
    "prompt": "While driving, holding a cellphone in your hand or against your head is:",
    "options": [
      "Allowed for calls under a minute",
      "An offence — a phone may only be used completely hands-free",
      "Allowed at red traffic lights",
      "Allowed for navigation only"
    ],
    "correctIndex": 1,
    "explanation": "Holding or supporting a phone with any part of your body while driving is prohibited. Even hands-free, a conversation stretches your reaction distance.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_rules_cyclist_gap",
    "categoryId": "rules",
    "prompt": "When overtaking a cyclist you should leave a lateral gap of at least:",
    "options": [
      "Half a metre",
      "One metre",
      "Ten centimetres",
      "There is no guideline"
    ],
    "correctIndex": 1,
    "explanation": "Pass cyclists with at least 1 m of space (more at higher speed) — they may swerve for potholes, drains or wind gusts.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q5_rule_reversing",
    "categoryId": "rules",
    "prompt": "You need to reverse out of a driveway across a busy pavement. The K53 approach is:",
    "options": [
      "Reverse quickly to minimise time in the danger zone",
      "Full observation before AND during the reverse — pedestrians and traffic have right of way over your blind manoeuvre",
      "Hoot twice and reverse",
      "Ask a passenger to wave you out and rely on their signal"
    ],
    "correctIndex": 1,
    "explanation": "Reversing is legally limited to what is safe and necessary. Across a pavement you're crossing pedestrian space blind — look through the rear window and mirrors continuously, and stop the instant anything enters your path.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_rules_ped_freeway",
    "categoryId": "rules",
    "prompt": "Pedestrians on a freeway are:",
    "options": [
      "Allowed if they keep to the emergency lane",
      "Prohibited — freeways are for motor traffic only",
      "Allowed at night only",
      "Allowed if crossing quickly"
    ],
    "correctIndex": 1,
    "explanation": "Pedestrians, cyclists and animal-drawn vehicles may not be on a freeway. As a driver, still stay alert — people do walk on freeways illegally.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q5_rule_overtake_left",
    "categoryId": "rules",
    "prompt": "Overtaking on the LEFT is lawful when:",
    "options": [
      "The vehicle ahead is driving slowly",
      "The vehicle ahead is turning right (and passing left is safe), or on a multi-lane road with lanes in your direction",
      "You are late",
      "Never, under any circumstances"
    ],
    "correctIndex": 1,
    "explanation": "Left is the exception, not the rule: a right-turner you can safely pass on the left, marked multi-lane roads, or an officer's direction. Anywhere else, overtake right.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_rules_seatbelt_moving",
    "categoryId": "rules",
    "prompt": "When are seatbelts compulsory?",
    "options": [
      "Only on freeways",
      "Whenever you are in a moving vehicle and a seatbelt is fitted",
      "Only for the driver",
      "Only at night"
    ],
    "correctIndex": 1,
    "explanation": "Seatbelts must be worn whenever you are in a moving vehicle where they are fitted. A child between 3 and 14 (and under 1.5 m) must use an appropriate restraint.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q5_rule_following_emergency_scene",
    "categoryId": "rules",
    "prompt": "Passing a crash scene, your legal and defensive duty is to:",
    "options": [
      "Slow down for a good look and take photos",
      "Pass slowly and carefully without stopping unnecessarily, obeying officers — rubbernecking causes secondary crashes",
      "Stop and direct traffic yourself",
      "Hoot to announce your approach"
    ],
    "correctIndex": 1,
    "explanation": "Unless you're involved or providing help, keep moving carefully under direction. Distracted gawking is a leading cause of the next collision.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_rules_learner_freeway",
    "categoryId": "rules",
    "prompt": "A learner driver on a freeway:",
    "options": [
      "May never use a freeway",
      "May drive on a freeway only if accompanied by a properly licensed driver",
      "May drive alone if over 18",
      "May drive alone at any time"
    ],
    "correctIndex": 1,
    "explanation": "A learner may drive on a freeway only when accompanied by a person who holds a valid licence for that class of vehicle.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr5_overtake_prohibited_where",
    "categoryId": "rules",
    "prompt": "Even with no sign or barrier line, overtaking is prohibited or unsafe:",
    "options": [
      "Approaching a rise, a bend, an intersection or a pedestrian crossing — anywhere your view is not certain",
      "Only where a solid line is painted",
      "Only in urban areas",
      "Only when a vehicle is towing"
    ],
    "correctIndex": 0,
    "explanation": "Markings cannot cover every hazard, so the underlying duty is to see the road you are committing to. If you cannot see far enough to complete the pass and return, you may not start it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_rules_emergency_vehicle",
    "categoryId": "rules",
    "prompt": "An ambulance approaches with lights and siren. You must:",
    "options": [
      "Stop dead immediately wherever you are",
      "Give way by moving left and slowing or stopping when it is safe",
      "Race ahead to clear the road",
      "Ignore it unless it hoots"
    ],
    "correctIndex": 1,
    "explanation": "You are required to give way to emergency vehicles. Move to the left and slow or stop where it is safe — without making a dangerous or illegal manoeuvre.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr5_abnormal_load_escort",
    "categoryId": "rules",
    "prompt": "You meet an abnormal load with escort vehicles displaying flashing lights. You should:",
    "options": [
      "Follow the escort's directions, slow down, and be prepared to pull over or stop",
      "Overtake quickly before the road narrows",
      "Ignore the escorts, since they are not traffic officers",
      "Maintain speed and pass on the left"
    ],
    "correctIndex": 0,
    "explanation": "Abnormal loads take up more than their lane and cannot manoeuvre. The escorts are there because the load's driver cannot see or avoid you — they are managing the road on its behalf.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr3_tow_rope_steering",
    "categoryId": "rules",
    "prompt": "When a broken-down car is towed on a rope, the towed vehicle:",
    "options": [
      "Must have a licensed driver at its wheel to steer and brake it",
      "May be left empty as long as the rope is short",
      "Should be left in gear so it cannot roll",
      "Needs no driver if the towing vehicle is heavier"
    ],
    "correctIndex": 0,
    "explanation": "A rope only pulls — it does not steer or stop the vehicle behind it. Someone competent has to be at that wheel, and both vehicles must be lit and signalled as a combination.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_ctrl_temp",
    "categoryId": "controls",
    "prompt": "While driving, the temperature gauge moves into the red zone. You should:",
    "options": [
      "Keep driving to reach your destination faster",
      "Stop as soon as it is safe and switch off the engine to let it cool",
      "Switch on the air conditioner",
      "Pour cold water on the engine immediately"
    ],
    "correctIndex": 1,
    "explanation": "A reading in the red means the engine is overheating. Stop safely and switch off to avoid serious damage; never open the radiator cap while it is hot.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_interior_mirror_aim",
    "categoryId": "controls",
    "prompt": "The interior (rear-view) mirror is correctly adjusted when it:",
    "options": [
      "Frames the whole rear window with as little of the car's interior as possible",
      "Shows mostly the back seat so you can watch passengers",
      "Points at the road surface just behind the rear bumper",
      "Shows the same view as the left side mirror"
    ],
    "correctIndex": 0,
    "explanation": "Aim the interior mirror to fill it with the rear window. Anything else — seats, roof lining, your own head — is view you have given away.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc3_bonnet_unlatched",
    "categoryId": "controls",
    "prompt": "The bonnet feels loose or the warning light shows it is not properly closed. You should:",
    "options": [
      "Stop and close it properly — at speed it can fly up and block your view entirely",
      "Drive slowly with your head out of the window",
      "Continue and close it at your destination",
      "Rely on the safety catch to hold it"
    ],
    "correctIndex": 0,
    "explanation": "A bonnet that opens at speed covers the whole windscreen at once. The secondary catch is a backup, not a licence to drive with the primary one undone.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc5_documents_carry",
    "categoryId": "controls",
    "prompt": "Before a long trip, the sensible document check is:",
    "options": [
      "That your licence is valid and with you, and the vehicle's licence disc has not expired",
      "That the radio licence is paid",
      "That the service book is in the glovebox",
      "That the original purchase invoice is on board"
    ],
    "correctIndex": 0,
    "explanation": "Both are things you can fix at home in five minutes and cannot fix at a roadblock. Expiry dates are easy to lose track of when nothing prompts you.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_auto_creep",
    "categoryId": "controls",
    "prompt": "An automatic car in Drive tends to 'creep' forward at idle. This means you should:",
    "options": [
      "Keep the footbrake applied while stopped in Drive",
      "Select Park at every stop, however brief",
      "Rest your left foot on the accelerator to hold it",
      "Switch the engine off whenever you stop"
    ],
    "correctIndex": 0,
    "explanation": "In Drive the car wants to move the moment your foot leaves the brake. Keep the brake on while stopped — that creep is exactly what nudges cars into the one in front.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc4_seat_belt_twisted",
    "categoryId": "controls",
    "prompt": "A seatbelt that is twisted along its length:",
    "options": [
      "Concentrates the crash load onto a narrow strip instead of spreading it — untwist it before driving",
      "Works exactly as well, since the webbing is the same",
      "Will not lock in a crash",
      "Is only a problem for rear passengers"
    ],
    "correctIndex": 0,
    "explanation": "The belt is wide because spreading the force is the whole design. Twisted, it becomes a strap that cuts rather than restrains.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_abs_pedal_feel",
    "categoryId": "controls",
    "prompt": "Braking hard in a car with ABS, the pedal shudders and buzzes under your foot. You should:",
    "options": [
      "Keep firm pressure on the pedal and steer where you need to go",
      "Release the pedal at once — the brakes are failing",
      "Pump the pedal on and off rapidly yourself",
      "Pull the handbrake up to help stop"
    ],
    "correctIndex": 0,
    "explanation": "That pulsing is ABS doing its job, releasing and reapplying far faster than any foot could. Stay on the pedal — ABS is what lets you keep steering while braking hard.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_wet_brake_test",
    "categoryId": "controls",
    "prompt": "After driving through standing water, you should:",
    "options": [
      "Test the brakes gently at low speed and dry them with light pressure if they feel weak",
      "Brake hard once at speed to clear them",
      "Assume they are fine if the pedal feels normal",
      "Drive faster so airflow dries them"
    ],
    "correctIndex": 0,
    "explanation": "Water between pad and disc removes most of the friction. Light, sustained pressure at low speed heats and wipes them dry — and the test tells you whether you needed to.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_wheel_alignment_symptom",
    "categoryId": "controls",
    "prompt": "A car that pulls steadily to one side on a level, straight road most likely has:",
    "options": [
      "A tyre pressure or wheel alignment problem — it also wears tyres unevenly",
      "A faulty handbrake",
      "Too much oil in the engine",
      "A blown fuse"
    ],
    "correctIndex": 0,
    "explanation": "You end up holding a constant correction without noticing, which is tiring and hides what the car is really doing. It also scrubs a tyre out long before its time.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qc5_skid_cause",
    "categoryId": "controls",
    "prompt": "Skids are almost always caused by:",
    "options": [
      "The driver asking more of the tyres than the surface can give — braking, steering or accelerating too hard for the conditions",
      "Faulty brakes",
      "Bad luck with the road surface",
      "Driving too slowly for the conditions"
    ],
    "correctIndex": 0,
    "explanation": "Grip is a budget shared between turning, stopping and accelerating. A skid is what happens when you spend more than you have, which is why smoothness is the whole defence.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_fuel_wrong_type",
    "categoryId": "controls",
    "prompt": "You realise you have put the wrong fuel in the tank. You should:",
    "options": [
      "Not start the engine, and have the vehicle attended to before it is run",
      "Start it and drive gently to a workshop",
      "Top up with the correct fuel to dilute it",
      "Start it and let it idle to clear the system"
    ],
    "correctIndex": 0,
    "explanation": "As long as the wrong fuel stays in the tank the damage is limited. Starting the engine pumps it through the whole fuel system and turns an inconvenience into a large bill.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q8_ctrl_observe_every_move",
    "categoryId": "controls",
    "prompt": "In the yard and road test, how often must you do a full observation (mirrors + blind spot)?",
    "options": [
      "Once, at the start",
      "Before every movement — moving off, changing direction and reversing",
      "Only when other vehicles are near",
      "Only before turning right"
    ],
    "correctIndex": 1,
    "explanation": "The examiner watches your head. A fresh mirror-and-blind-spot check before each movement is scored every time — a missed 'look' is a classic loss of points.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc3_headlight_aim_loaded",
    "categoryId": "controls",
    "prompt": "With a heavily loaded boot, your headlights may:",
    "options": [
      "Aim too high and dazzle oncoming drivers, so the beam should be adjusted if the car allows it",
      "Aim too low and become useless",
      "Be unaffected — headlights are fixed",
      "Automatically switch to main beam"
    ],
    "correctIndex": 0,
    "explanation": "Weight in the back lifts the nose and lifts the beam with it. Many cars have a levelling control for exactly this; using it is the difference between lighting the road and blinding people.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qc4_roof_load_handling",
    "categoryId": "controls",
    "prompt": "Carrying a heavy load on a roof rack affects the vehicle by:",
    "options": [
      "Raising its centre of gravity, making it lean more in corners and less stable in a swerve",
      "Improving stability by adding weight",
      "Having no effect provided the load is strapped down",
      "Affecting only fuel consumption"
    ],
    "correctIndex": 0,
    "explanation": "Weight up high is the worst place for it. The car rolls further in a corner and recovers less willingly from a sudden avoidance — and its overall height has changed too.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qc5_smoothness_principle",
    "categoryId": "controls",
    "prompt": "The single most useful habit for avoiding skids is:",
    "options": [
      "Doing everything progressively — braking, steering and accelerating smoothly rather than suddenly",
      "Keeping a hand on the handbrake",
      "Driving in a lower gear at all times",
      "Using the brakes as little as possible"
    ],
    "correctIndex": 0,
    "explanation": "Sudden inputs are what break traction. A smooth driver is using the same grip more gradually, which is why they rarely find its limit by accident.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_ctrl_engine_braking",
    "categoryId": "controls",
    "prompt": "On a long descent, selecting a lower gear helps because:",
    "options": [
      "It saves fuel by switching the engine off",
      "Engine braking helps control speed and reduces strain on the brakes",
      "It makes the car go faster",
      "It is required by law on all hills"
    ],
    "correctIndex": 1,
    "explanation": "A lower gear lets engine braking hold your speed on a downhill, so the brakes do not overheat. You should not, however, change down purely to replace braking.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_ctrl_seat_setup",
    "categoryId": "controls",
    "prompt": "When should you adjust your seat, headrest and mirrors?",
    "options": [
      "While driving, one at a time",
      "Before you start driving, as part of your pre-drive checks",
      "Only before a long trip",
      "Adjustment is the passenger's job"
    ],
    "correctIndex": 1,
    "explanation": "Set your seating position, headrest height and all mirrors before moving off. Adjusting on the move takes your attention and hands away from driving.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q8_ctrl_reverse_stationary",
    "categoryId": "controls",
    "prompt": "You should select REVERSE gear only when the vehicle is:",
    "options": [
      "Rolling slowly forward",
      "Completely stationary",
      "In second gear",
      "On a downhill slope"
    ],
    "correctIndex": 1,
    "explanation": "Engaging reverse while still moving forward grinds the gearbox. Come to a full stop first, then select reverse.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_parallel_finish",
    "categoryId": "controls",
    "prompt": "A parallel parking attempt in the yard test is completed correctly when the vehicle:",
    "options": [
      "Ends up fully inside the marked bay without having touched a pole or line",
      "Is inside the bay, with light contact on the poles being acceptable",
      "Is roughly in the bay, provided it took only one movement",
      "Is parked in the bay at any angle, as long as it fits"
    ],
    "correctIndex": 0,
    "explanation": "Finish inside the demarcated bay with nothing touched. Contact with a pole or line is a fail item — the bay stands in for the real cars you would otherwise be hitting.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_signal_timing",
    "categoryId": "controls",
    "prompt": "Your indicator should be switched on:",
    "options": [
      "In good time before the manoeuvre, so others can act on it",
      "At the exact moment you begin to turn the wheel",
      "Only once you have already started changing lane",
      "After the manoeuvre, to confirm what you did"
    ],
    "correctIndex": 0,
    "explanation": "A signal is a warning of intent, so it has to arrive before the action. Signal too late and it reports what you are already doing, which helps nobody.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc5_handbrake_ratchet",
    "categoryId": "controls",
    "prompt": "A handbrake that pulls up much further than it used to:",
    "options": [
      "Needs adjustment — it may not hold the vehicle on a slope",
      "Is working better as the cable stretches",
      "Should simply be pulled harder",
      "Is normal and needs no attention"
    ],
    "correctIndex": 0,
    "explanation": "Cables stretch and shoes wear, so the lever travels further for less braking. The first real test of a neglected handbrake is usually a hill, which is a poor place to find out.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_eyes_on_road_gear",
    "categoryId": "controls",
    "prompt": "While changing gear, your eyes should stay:",
    "options": [
      "On the road ahead — the gear lever is found by feel",
      "On the gear lever, to be certain of the gear",
      "On the rev counter until the change is complete",
      "On the mirrors for the whole gear change"
    ],
    "correctIndex": 0,
    "explanation": "A glance down is a car-length or more travelled blind. Gear changes are learnt by feel precisely so your eyes never leave the road.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc5_demist_fastest",
    "categoryId": "controls",
    "prompt": "The fastest way to clear a misted-up windscreen is to:",
    "options": [
      "Use the demister with the air conditioning on, which dries the air",
      "Wipe it with a cloth and drive on",
      "Open all the windows and drive faster",
      "Turn the heater off so the glass cools"
    ],
    "correctIndex": 0,
    "explanation": "Misting is moisture condensing on cold glass. Air conditioning removes the moisture rather than just moving it around, which is why it clears far faster than wiping.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_ctrl_wipers_demister",
    "categoryId": "controls",
    "prompt": "Your windscreen fogs up in heavy rain. Before driving on you should:",
    "options": [
      "Wipe a small peephole with your hand and carry on",
      "Use the demister/air-con and wipers until you have full, clear vision",
      "Open the window and look out of it",
      "Follow the tail lights ahead closely so you don't get lost"
    ],
    "correctIndex": 1,
    "explanation": "Driving without full vision is driving blind. Use the demister, heated rear window and wipers — and pull over safely if you still can't see.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc5_wipers_smear",
    "categoryId": "controls",
    "prompt": "Wiper blades that smear rather than clear the screen:",
    "options": [
      "Should be replaced — smearing into low sun or oncoming headlights is close to blindness",
      "Only need cleaning with water",
      "Are normal once blades are a few months old",
      "Can be ignored if the rain is light"
    ],
    "correctIndex": 0,
    "explanation": "A smeared screen is fine until you drive into glare, at which point the whole windscreen goes opaque. It is one of the cheapest fixes on the car.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr3_green_but_pedestrian",
    "categoryId": "intersections",
    "prompt": "Your light turns green while a pedestrian is still crossing in front of you. You:",
    "options": [
      "Wait for them to finish crossing before moving off",
      "Move off slowly, since your light gives you priority",
      "Sound your hooter to hurry them along",
      "Drive around behind them"
    ],
    "correctIndex": 0,
    "explanation": "A green light permits movement; it does not clear the road of people already in it. Someone who is halfway across cannot simply stop and go back.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr3_circle_exit_crossing",
    "categoryId": "intersections",
    "prompt": "Leaving a traffic circle, the hazard most often missed is:",
    "options": [
      "Pedestrians crossing the exit road you are turning into",
      "Vehicles entering the circle behind you",
      "The camber of the circle itself",
      "Traffic on the opposite side of the circle"
    ],
    "correctIndex": 0,
    "explanation": "Attention is still on the circle when the vehicle is already leaving it, and the exit is exactly where people cross. The look has to move to where the car is going.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_int_rail_multi_track",
    "categoryId": "intersections",
    "prompt": "At a railway crossing with multiple tracks, a train has just passed. You should:",
    "options": [
      "Cross immediately behind it",
      "Wait and check both directions again — a second train may be hidden behind the first",
      "Follow the vehicle in front closely across",
      "Cross if the first train is more than 100 m away"
    ],
    "correctIndex": 1,
    "explanation": "The passing train hides the far track. Only cross once you can see clearly in both directions on every track — and never stop on the tracks.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_box_junction_entry",
    "categoryId": "intersections",
    "prompt": "You may only enter an intersection when:",
    "options": [
      "There is room for you to clear it completely on the far side",
      "Your light is green, regardless of the traffic ahead",
      "The vehicle in front has begun to move",
      "You can get at least halfway across"
    ],
    "correctIndex": 0,
    "explanation": "Stopping inside an intersection blocks the phase for every other direction. A green light permits you to go; it does not promise you somewhere to arrive.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q7_int_zip_merge",
    "categoryId": "intersections",
    "prompt": "Two lanes of moving traffic are merging into one where a lane ends. The correct method is to:",
    "options": [
      "Force your way to the front",
      "Zip merge — take turns, one vehicle from each lane, merging in good time",
      "Stop and wait for a total gap",
      "Straddle both lanes to block others"
    ],
    "correctIndex": 1,
    "explanation": "A zip merge alternates one car from each lane. Merging early and taking turns keeps traffic moving; racing to the front or blocking causes the jam.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_int_emergency_intersection",
    "categoryId": "intersections",
    "prompt": "You are crossing an intersection on green when an emergency vehicle approaches with sirens. You should:",
    "options": [
      "Stop immediately in the middle of the intersection",
      "Clear the intersection, then pull over and give way where it is safe",
      "Reverse out of the intersection",
      "Ignore it — you have green"
    ],
    "correctIndex": 1,
    "explanation": "Do not stop in the intersection. Continue through, then move left and stop where it is safe so the emergency vehicle can pass.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr5_officer_signal_stop",
    "categoryId": "intersections",
    "prompt": "A traffic officer directing traffic holds up a hand with the palm toward you. This means:",
    "options": [
      "Stop — and remain stopped until they signal you forward",
      "Slow down but proceed",
      "Turn in the direction they are facing",
      "Proceed with caution"
    ],
    "correctIndex": 0,
    "explanation": "Officer signals outrank the lights and the signs, because they are managing something the fixed signalling cannot see. Their instruction is the one that counts.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_int_multilane_circle",
    "categoryId": "intersections",
    "prompt": "Approaching a multi-lane traffic circle, which lane should you choose?",
    "options": [
      "Always the right-hand lane",
      "Left lane to turn left or go straight; right lane to turn right or go all the way around — as the arrows mark",
      "Whichever lane is shortest",
      "Straddle both lanes for flexibility"
    ],
    "correctIndex": 1,
    "explanation": "Choose your lane before entering: generally left lane for left/straight, right lane for right/full circle, following the painted arrows — and don't change lanes inside the circle.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_pedestrian_crossing_overtake",
    "categoryId": "intersections",
    "prompt": "A vehicle ahead of you has stopped at a pedestrian crossing. You should:",
    "options": [
      "Stop behind it and not overtake — it has almost certainly stopped for someone you cannot see",
      "Overtake carefully if the crossing looks clear from your position",
      "Sound your hooter and pass",
      "Overtake on the left where there is room"
    ],
    "correctIndex": 0,
    "explanation": "The stopped vehicle is the warning. Overtaking it puts you onto the crossing at speed exactly where the pedestrian it stopped for is walking.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_int_yield_sign",
    "categoryId": "intersections",
    "image": "/signs/regulatory/regulatory-006-02.png",
    "prompt": "You reach a junction controlled by this sign. You must:",
    "options": [
      "Always come to a complete stop",
      "Give way to traffic on the through road and proceed only when clear",
      "Take right of way over the through road",
      "Stop only if a vehicle is within 50 m"
    ],
    "correctIndex": 1,
    "explanation": "A yield sign means give way: slow down, be ready to stop, and only enter the through road when there is a safe gap. You need not stop if it is already clear.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_int_green_arrow",
    "categoryId": "intersections",
    "prompt": "A green arrow shown at a traffic signal means:",
    "options": [
      "You may go only in the direction of the arrow, when safe",
      "All traffic may proceed",
      "Stop and wait",
      "Pedestrians have right of way over the arrow"
    ],
    "correctIndex": 0,
    "explanation": "A green arrow gives right of way to move in the direction it points, provided the way is clear. Other movements must still wait for their signal.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_emergency_stopped_shoulder",
    "categoryId": "intersections",
    "prompt": "Passing an emergency vehicle stopped on the shoulder with its lights flashing, you should:",
    "options": [
      "Slow down and move over a lane if you safely can, leaving room for people working beside it",
      "Maintain speed, since it is stationary and off the roadway",
      "Stop until it moves off",
      "Sound your hooter to signal that you have seen it"
    ],
    "correctIndex": 0,
    "explanation": "Paramedics and officers work with their backs to fast traffic and no protection at all. Space and reduced speed are the only things standing between them and a passing vehicle.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_int_scholar_patrol",
    "categoryId": "intersections",
    "prompt": "A scholar patrol lowers its banners across the road ahead. You must:",
    "options": [
      "Slow down and weave through carefully",
      "Come to a complete stop and remain stopped until the banners are lifted off the roadway",
      "Hoot to warn the children",
      "Proceed if no children are on your side"
    ],
    "correctIndex": 1,
    "explanation": "Scholar-patrol banners carry the force of a stop instruction. Stay stopped until the banners — not just the children — are out of the road.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q7_int_yield_vs_stop",
    "categoryId": "intersections",
    "prompt": "The difference between a stop street and a YIELD sign at a junction is:",
    "options": [
      "They are identical",
      "A stop street needs a full stop every time; at a yield you may keep moving if the way is genuinely clear",
      "A yield needs a full stop; a stop street does not",
      "Yield applies only to trucks"
    ],
    "correctIndex": 1,
    "explanation": "Stop = always halt. Yield = give way, roll through only when clear. Treating a yield like a stop wastes flow; treating a stop like a yield fails your test.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q7_int_blind_junction",
    "categoryId": "intersections",
    "prompt": "A parked truck hides your view as you approach an intersection you must cross. You should:",
    "options": [
      "Cross quickly while you have a gap in what you can see",
      "Creep forward slowly until you can actually see both ways, then proceed when clear",
      "Rely on hearing for approaching traffic",
      "Hoot once and go"
    ],
    "correctIndex": 1,
    "explanation": "You can't yield to what you can't see. Edge out just far enough to get a clear view before committing — never cross on an assumption.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_hazard_wet_first_rain",
    "categoryId": "hazard_awareness",
    "prompt": "Approaching a large puddle spanning your lane at speed, the main risk is that:",
    "options": [
      "It can pull the steering sharply and hide a pothole beneath it",
      "It will dirty your windscreen",
      "Your brakes will fail permanently",
      "The engine will stall immediately"
    ],
    "correctIndex": 0,
    "explanation": "Water drags on whichever wheels hit it first, which twists the steering, and you cannot see what the surface is doing underneath. Slow down before it, not in it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_hz_microsleep",
    "categoryId": "hazard_awareness",
    "prompt": "The most dangerous thing about a 'micro-sleep' at the wheel is that:",
    "options": [
      "The driver is often unaware it happened at all",
      "It always lasts more than a minute",
      "It only occurs after midnight",
      "It affects only professional drivers"
    ],
    "correctIndex": 0,
    "explanation": "You cannot take action against something you did not notice. That is why the warning signs — drifting, missed turns, heavy eyes — matter more than how sleepy you feel.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_hz_phone_handsfree",
    "categoryId": "hazard_awareness",
    "prompt": "Using a hands-free phone while driving:",
    "options": [
      "Still divides your attention — the main risk is the conversation, not the handset",
      "Removes the risk entirely, which is why it is permitted",
      "Is more dangerous than holding the phone",
      "Only affects inexperienced drivers"
    ],
    "correctIndex": 0,
    "explanation": "Drivers deep in a call look at hazards without registering them. Legal is not the same as safe, and a passenger conversation differs because the passenger sees the road too.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q_haz_blind_spot",
    "categoryId": "hazard_awareness",
    "prompt": "Before changing lanes, in addition to checking your mirrors you must:",
    "options": [
      "Sound your hooter",
      "Glance over your shoulder to check the blind spot",
      "Switch on your headlights",
      "Nothing — mirrors show everything"
    ],
    "correctIndex": 1,
    "explanation": "Mirrors leave a blind spot beside and behind the vehicle. A quick shoulder check before changing lanes catches a vehicle the mirrors cannot show. Keep your wheels straight while you check.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q9_haz_crosswind",
    "categoryId": "hazard_awareness",
    "prompt": "On an exposed bridge in a strong side wind, or as you pass a large truck, you should expect:",
    "options": [
      "Nothing unusual",
      "A sideways gust — hold the wheel firmly and be ready to correct",
      "Better grip than normal",
      "Your engine to lose power"
    ],
    "correctIndex": 1,
    "explanation": "Crosswinds shove high-sided vehicles and light cars sideways, and the shelter of a passing truck ends with a sudden gust. A firm grip keeps you in lane.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q11_haz_oncoming_in_lane",
    "categoryId": "hazard_awareness",
    "prompt": "An oncoming car pulls out to overtake and is now heading straight at you in your lane. You should:",
    "options": [
      "Hold your line and expect them to move back",
      "Brake firmly and move as far left as is safe, even onto the shoulder",
      "Swerve right into the oncoming lane",
      "Accelerate to pass them before they reach you"
    ],
    "correctIndex": 1,
    "explanation": "Braking and going left opens the gap and uses the space they have vacated. Swerving right could put you head-on with them as they try to pull back in.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr4_hz_fatigue_only_cure",
    "categoryId": "hazard_awareness",
    "prompt": "The only reliable remedy for driver fatigue is:",
    "options": [
      "To stop and rest properly — coffee, fresh air and loud music delay it at best",
      "Opening the windows and turning the radio up",
      "Drinking a caffeinated drink and continuing",
      "Driving faster to finish the journey sooner"
    ],
    "correctIndex": 0,
    "explanation": "The tricks buy minutes and mask how impaired you already are. Micro-sleeps of a few seconds happen without the driver noticing, and at open-road speed that is hundreds of metres unattended.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr3_hz_animals_night",
    "categoryId": "hazard_awareness",
    "prompt": "Your headlights pick up an animal's eyes at the roadside at night. You should:",
    "options": [
      "Slow down and be ready for it to move unpredictably, including into your path",
      "Sound your hooter and maintain speed",
      "Switch to main beam and accelerate past",
      "Swerve immediately to the other side of the road"
    ],
    "correctIndex": 0,
    "explanation": "Animals bolt in whichever direction they happen to face, and often toward the light. Speed is the only variable you control, and swerving blind on a rural road risks far worse.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_hazard_indicator_trust",
    "categoryId": "hazard_awareness",
    "prompt": "A vehicle waiting at a side road is indicating that it will turn away from you. You should:",
    "options": [
      "Wait until it actually begins to move that way before you commit",
      "Proceed immediately, since it has signalled its intention",
      "Flash your lights to confirm it should go",
      "Sound your hooter as you pass"
    ],
    "correctIndex": 0,
    "explanation": "Indicators get left on from the last turn, and drivers change their minds. Movement is evidence; a blinking light is only a claim.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_haz_pothole",
    "categoryId": "hazard_awareness",
    "prompt": "You spot a deep pothole in your lane at the last moment. The safest response is usually to:",
    "options": [
      "Swerve sharply into the next lane without checking",
      "Brake firmly in a straight line beforehand; if you can't avoid it, release the brakes just before impact",
      "Accelerate over it",
      "Close your eyes and hold tight"
    ],
    "correctIndex": 1,
    "explanation": "An unchecked swerve trades a damaged rim for a collision. Lose speed in a straight line; releasing the brakes at impact lets the wheel roll through rather than dig in.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_haz_fog_bank",
    "categoryId": "hazard_awareness",
    "prompt": "You see a dense fog bank across the road ahead. Before entering it you should:",
    "options": [
      "Switch to main beam for maximum light",
      "Slow down first, switch to dipped beams, and increase following distance",
      "Stop in your lane until it lifts",
      "Follow the car ahead closely so you don't lose it"
    ],
    "correctIndex": 1,
    "explanation": "Main beam reflects off fog and blinds you. Shed speed before you enter, use dipped beams (and fog lights if fitted), and never stop on the roadway itself.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_hz_aquaplane_response",
    "categoryId": "hazard_awareness",
    "prompt": "If your steering suddenly goes light and unresponsive in heavy rain, you are probably aquaplaning. You should:",
    "options": [
      "Ease off the accelerator, hold the wheel straight, and avoid braking hard until grip returns",
      "Brake firmly to slow down as fast as possible",
      "Steer sharply to find grip",
      "Accelerate to push through the water"
    ],
    "correctIndex": 0,
    "explanation": "The tyres are riding on water and have nothing to grip. Any sudden input lands the instant contact returns — which is when it throws the car. Do nothing abrupt and let speed fall.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q_haz_aquaplane",
    "categoryId": "hazard_awareness",
    "prompt": "If your vehicle begins to aquaplane (skim on water), you should:",
    "options": [
      "Brake hard immediately",
      "Ease off the accelerator and hold the steering steady until grip returns",
      "Accelerate to push through the water",
      "Swerve sharply to one side"
    ],
    "correctIndex": 1,
    "explanation": "During aquaplaning the tyres lose contact with the road. Avoid sudden braking or steering — gently lift off the accelerator and keep the wheel steady until the tyres regain grip.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr3_hz_load_shifting",
    "categoryId": "hazard_awareness",
    "prompt": "The vehicle ahead is visibly leaning or swaying as it corners. The safest assumption is:",
    "options": [
      "Its load may be badly secured or shifting — drop back and do not sit alongside it",
      "The driver is inexperienced but the vehicle is fine",
      "It has a slow puncture that will fix itself",
      "It is normal for any loaded vehicle"
    ],
    "correctIndex": 0,
    "explanation": "A swaying load can come off or roll the vehicle. Neither is survivable from directly behind or alongside, and both are entirely avoidable by giving it room.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_haz_stationary_bus",
    "categoryId": "hazard_awareness",
    "prompt": "You're approaching a bus stopped at the roadside with passengers around it. You should:",
    "options": [
      "Maintain speed — the bus is stopped, not you",
      "Slow down and cover the brake; people (often children) may step out in front of or behind it",
      "Hoot and pass quickly",
      "Move to the far right and speed up"
    ],
    "correctIndex": 1,
    "explanation": "A stopped bus hides pedestrians who dart across to catch it or after getting off. Slow, brake ready — this is a classic pedestrian-knockdown situation.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr2_park_loading_zone",
    "categoryId": "parking",
    "prompt": "A marked loading zone may be used:",
    "options": [
      "For loading or offloading goods, not as general parking while you run errands",
      "By any vehicle at any time",
      "Only by vehicles displaying a disabled permit",
      "Only outside business hours"
    ],
    "correctIndex": 0,
    "explanation": "The bay exists so delivery vehicles are not forced to double-park in the traffic lane. Occupying it for anything else pushes them there.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_park_obstruct_line",
    "categoryId": "parking",
    "prompt": "You should not park where leaving the space would force other drivers to:",
    "options": [
      "Use their indicators",
      "Cross a barrier (solid) line or swing into oncoming traffic to get around you",
      "Slow down briefly",
      "Change to a lower gear"
    ],
    "correctIndex": 1,
    "explanation": "A badly chosen spot makes everyone else break the rules or take a risk to pass. Park where the road stays usable and safe for others.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_park_bay",
    "categoryId": "parking",
    "prompt": "Where parking bays are marked, you must:",
    "options": [
      "Park across two bays for safety",
      "Park within a single demarcated bay, never on the sidewalk or verge",
      "Park on the pavement to leave the road clear",
      "Park wherever there is shade"
    ],
    "correctIndex": 1,
    "explanation": "Always park within a single demarcated bay. Parking on a sidewalk, verge or pavement is not allowed.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q3_park_crossing",
    "categoryId": "parking",
    "prompt": "You may NOT stop your vehicle:",
    "options": [
      "Alongside a park",
      "On or over a pedestrian crossing",
      "Within 100 m of a school",
      "Anywhere on a gravel road"
    ],
    "correctIndex": 1,
    "explanation": "Stopping on a pedestrian crossing blocks the protected path and forces people into live traffic. Stop behind the line, never on the crossing.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr4_park_facing_wrong_night",
    "categoryId": "parking",
    "prompt": "Parking at night on an unlit public road facing against the traffic is particularly dangerous because:",
    "options": [
      "Your rear reflectors and lights face away from approaching traffic, so you are far harder to see",
      "The handbrake works less well in the dark",
      "It drains the battery faster",
      "It is only a problem for unlicensed vehicles"
    ],
    "correctIndex": 0,
    "explanation": "Reflectors are engineered to bounce headlights back to the driver behind. Turned the wrong way they do nothing, and an unlit parked car on a dark road is nearly invisible.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_park_corner_visibility",
    "categoryId": "parking",
    "prompt": "Why should you avoid parking close to a bend or the crest of a hill?",
    "options": [
      "It's harder to park there",
      "Your parked car reduces visibility, so approaching drivers see the hazard too late",
      "It's illegal only for trucks",
      "The paint fades faster there"
    ],
    "correctIndex": 1,
    "explanation": "A car parked on a blind bend or crest appears suddenly to others and hides pedestrians. Park where approaching drivers have a clear, early view.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr3_park_traffic_island",
    "categoryId": "parking",
    "prompt": "Stopping on a traffic island or painted median is:",
    "options": [
      "Prohibited — it is not roadway, and a vehicle there obstructs sightlines and pedestrian refuge",
      "Permitted if your hazard lights are on",
      "Permitted for loading only",
      "Permitted where the island is wide enough"
    ],
    "correctIndex": 0,
    "explanation": "Islands separate conflicting streams and give pedestrians somewhere to wait mid-crossing. A vehicle parked on one removes both functions at once.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_park_double",
    "categoryId": "parking",
    "prompt": "'Double parking' (stopping in the traffic lane next to a parked car) is:",
    "options": [
      "Allowed with hazard lights on",
      "Prohibited — you're obstructing a traffic lane",
      "Allowed for deliveries only",
      "Allowed for up to two minutes"
    ],
    "correctIndex": 1,
    "explanation": "Hazard lights don't legalise obstruction. Stopping beside a parked vehicle blocks the lane and hides pedestrians stepping out.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr5_park_corner_visibility",
    "categoryId": "parking",
    "prompt": "Parking close to a street corner is restricted mainly because:",
    "options": [
      "It hides emerging traffic and pedestrians from each other at the exact point they meet",
      "Corners have weaker road surfaces",
      "It makes street cleaning difficult",
      "It is only restricted in commercial areas"
    ],
    "correctIndex": 0,
    "explanation": "A vehicle parked at the corner forces drivers to nose right out into the junction to see. It converts an ordinary turn into a blind one for everybody.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_park_against_flow",
    "categoryId": "parking",
    "prompt": "Parking facing against the direction of traffic on a two-way road is a problem mainly because:",
    "options": [
      "Your lights and reflectors face the wrong way and you must cross traffic to leave",
      "It makes the vehicle harder to lock",
      "It is only permitted for goods vehicles",
      "It shortens the distance to the kerb"
    ],
    "correctIndex": 0,
    "explanation": "Rear reflectors and lights are designed to be seen by traffic approaching from behind. Facing the wrong way removes that, and getting out means crossing the road from a standstill.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_fd_motorcycle_gap",
    "categoryId": "following_distance",
    "prompt": "When following a motorcycle, your gap should be:",
    "options": [
      "Shorter — motorcycles are small and easy to see past",
      "At least the normal 2 seconds, and more in the wet — bikes can stop quickly and fall in a slide",
      "Exactly one car length",
      "Irrelevant — motorcycles must give way to cars"
    ],
    "correctIndex": 1,
    "explanation": "A motorcycle can brake hard and, if it falls, stops almost instantly. Following one closely turns their small mistake into your collision.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_fd_two_second",
    "categoryId": "following_distance",
    "prompt": "In good conditions, the recommended minimum following distance for a light vehicle is:",
    "options": [
      "Half a second",
      "About a two-second gap (the K53 minimum)",
      "Ten car lengths regardless of speed",
      "As close as possible to save fuel"
    ],
    "correctIndex": 1,
    "explanation": "The two-second rule is the K53 minimum and scales with speed: you should pass a fixed point at least two seconds after the vehicle ahead. Three seconds is the recommended safe gap.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q9_fd_towing",
    "categoryId": "following_distance",
    "prompt": "When towing a trailer or caravan, your following distance should be:",
    "options": [
      "The same as normal",
      "Greater than normal — the heavier combination takes longer to stop",
      "Shorter, to keep the trailer straight",
      "Irrelevant at low speed"
    ],
    "correctIndex": 1,
    "explanation": "Extra mass means a longer stopping distance and a trailer that can shove you forward under braking. Leave more room than you would solo.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_following_downhill_load",
    "categoryId": "following_distance",
    "prompt": "Going downhill, your following distance should be increased because:",
    "options": [
      "Gravity adds to your momentum, so the same brakes need more distance to stop you",
      "Brake lights are harder to see on a slope",
      "Engine braking is unavailable on a descent",
      "Tyres grip better uphill than downhill"
    ],
    "correctIndex": 0,
    "explanation": "The slope is working with your momentum and against your brakes. The gap that was adequate on the flat is no longer adequate on the way down.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_fd_stopping_parts",
    "categoryId": "following_distance",
    "prompt": "Which of these stretches your REACTION distance the most?",
    "options": [
      "Worn brake pads",
      "Fatigue, alcohol or looking at a phone — anything that delays perceiving the hazard",
      "Underinflated tyres",
      "A heavy load"
    ],
    "correctIndex": 1,
    "explanation": "Brakes, tyres and load change your braking distance. Reaction distance is decided by your brain — and fatigue, alcohol and distraction all add unslowed metres before you even touch the pedal.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_fd_gravel",
    "categoryId": "following_distance",
    "prompt": "On a gravel road your following distance should be:",
    "options": [
      "The same as tar",
      "At least doubled — braking takes far longer and dust hides the vehicle ahead",
      "Halved, to stay out of the dust cloud",
      "Exactly 2 seconds"
    ],
    "correctIndex": 1,
    "explanation": "Loose gravel roughly doubles braking distances, and the leading vehicle's dust can hide its brake lights completely. Hang well back, out of the dust.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr5_fd_merging_gap_courtesy",
    "categoryId": "following_distance",
    "prompt": "A vehicle needs to merge into your lane from a slip road. Leaving a gap for it:",
    "options": [
      "Keeps traffic flowing and costs you almost nothing — refusing forces them to stop or cut in",
      "Gives up your right of way and should be avoided",
      "Is only necessary for heavy vehicles",
      "Encourages dangerous driving"
    ],
    "correctIndex": 0,
    "explanation": "Merging traffic has to go somewhere. A driver forced to stop at the end of a slip road then rejoins from a standstill, which is far more dangerous than the gap you gave up.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_following_stale_gap",
    "categoryId": "following_distance",
    "prompt": "A following distance judged as safe at 60 km/h in town becomes inadequate on the open road because:",
    "options": [
      "The same time gap covers far more ground at higher speed",
      "Rural roads are always in worse condition",
      "Brakes work less well when warm",
      "There is less traffic to warn you of hazards"
    ],
    "correctIndex": 0,
    "explanation": "This is why the rule is counted in seconds rather than car lengths: the time you need stays roughly constant while the distance it represents grows with speed.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr3_fd_emergency_lane_gap",
    "categoryId": "following_distance",
    "prompt": "Traffic on a freeway slows to a crawl and an ambulance is approaching from behind. Drivers should:",
    "options": [
      "Move as far to the sides as they safely can to open a path between the lanes",
      "All move into the emergency lane on the left",
      "Stop where they are and switch off",
      "Speed up to clear the area ahead"
    ],
    "correctIndex": 0,
    "explanation": "Opening a channel between lanes gives the ambulance a continuous path. Everyone crowding into the left lane blocks the very shoulder an emergency vehicle may need.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q_fd_downhill",
    "categoryId": "following_distance",
    "prompt": "When following another vehicle down a long, steep hill, you should:",
    "options": [
      "Close the gap to use their slipstream",
      "Increase the gap, because stopping distances are longer downhill",
      "Switch off the engine",
      "Keep exactly two seconds regardless"
    ],
    "correctIndex": 1,
    "explanation": "Gravity lengthens stopping distance downhill, so leave a bigger gap and use a lower gear to help control your speed.",
    "difficulty": 2,
    "scope": "learners"
  }
];

export const STARTER_FLASHCARDS: Flashcard[] = [
  {
    "id": "fcd_gen-sign-regulatory-019-04-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "This regulatory sign: Parking only if you pay the parking fee.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-019-04.png"
  },
  {
    "id": "fcd_qs2_hairpin",
    "categoryId": "signs",
    "front": "A warning sign showing the road doubling back sharply on itself indicates:",
    "back": "A hairpin bend, needing a much lower speed than an ordinary curve — A hairpin turns through nearly 180 degrees. Long vehicles may need most of the road to get round, so approach slowly and expect oncoming traffic to be wide.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_sign_gravel_begins",
    "categoryId": "signs",
    "front": "A sign warns that the tarred road ends and gravel begins. What changes?",
    "back": "Gravel offers far less grip: stopping distances stretch, dust hides hazards and loose stones deflect the wheels. Reduce speed before you reach it, not on it.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs4_pedestrian_signal_meaning",
    "categoryId": "signs",
    "front": "A steady red figure on a pedestrian signal instructs pedestrians not to cross. For a driver it signals that:",
    "back": "The signal governs when people may start. Anyone already in the road when it changed is still entitled to complete the crossing, and drivers must let them.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_sign_cyclists",
    "categoryId": "signs",
    "front": "This triangular warning sign means:",
    "back": "Cyclists may be on the road ahead — A red triangle with a bicycle warns that cyclists may be on or crossing the road ahead. Give them room and be ready to slow down.",
    "difficulty": 2,
    "image": "/signs/warning/warning-037-04.png"
  },
  {
    "id": "fc4_mark_centre",
    "categoryId": "signs",
    "front": "Centre line: broken vs solid?",
    "back": "Broken: may cross when safe. Solid (barrier): may not cross at all.",
    "difficulty": 1
  },
  {
    "id": "fc_steep_down",
    "categoryId": "signs",
    "image": "/signs/warning/warning-027-04.png",
    "front": "What does this warning sign mean?",
    "back": "Steep descent ahead — select a lower gear so engine braking helps control your speed.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs2_hazard_marker",
    "categoryId": "signs",
    "front": "Black-and-yellow striped marker boards placed at an obstruction indicate:",
    "back": "A physical hazard at the roadside, and which side of it the traffic must pass — They mark the thing itself — a bridge pier, an island nose, a culvert end. The direction the stripes slope shows the side you should be passing on.",
    "difficulty": 2
  },
  {
    "id": "fcd_gen-sign-regulatory-010-04-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Heavy goods vehicles only: To indicate that the road or part of it is set aside for use by goods vehicles with a gross vehicle mass or gross combination mass exceeding the mass indicated in tons by a number on such a sign.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-010-04.png"
  },
  {
    "id": "fcd_q6_mark_chevron_barrier",
    "categoryId": "signs",
    "front": "A painted island bordered by a SOLID line means:",
    "back": "You may not enter or cross it — treat it as a solid barrier — A solid border upgrades a painted island to a no-go zone. (A broken border you may cross when it's safe, e.g. to reach a turn lane.)",
    "difficulty": 3
  },
  {
    "id": "fcd_q2_sign_officer_overrides",
    "categoryId": "signs",
    "front": "A traffic officer signals you through a red robot. You should:",
    "back": "Obey the officer — a traffic officer's signal overrides robots and signs — A traffic officer's directions rank above traffic signals and signs. Follow the officer's instruction, carefully.",
    "difficulty": 1
  },
  {
    "id": "fcd_qs3_agricultural_vehicles",
    "categoryId": "signs",
    "front": "A warning sign showing a tractor means you should expect:",
    "back": "Tractors travel far below the limit, are often wider than a lane, and turn into gateways that are hard to see. The closing speed catches drivers out on open rural roads.",
    "difficulty": 1,
    "image": "/signs/warning/warning-038-07.png"
  },
  {
    "id": "fcd_q4_sign_derestriction",
    "categoryId": "signs",
    "front": "A prohibition sign shown with a diagonal band through the symbol usually indicates:",
    "back": "The end of that restriction — De-restriction signs repeat the symbol with a crossing band to signal where the restriction ends — e.g. the end of a no-overtaking stretch.",
    "difficulty": 3
  },
  {
    "id": "fc6_temp_priority",
    "categoryId": "signs",
    "front": "Temporary vs permanent sign conflict?",
    "back": "Temporary wins — it exists to override the normal one for changed conditions.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs2_mass_limit",
    "categoryId": "signs",
    "front": "A red-bordered round sign showing a mass in tonnes means:",
    "back": "Mass restrictions protect bridges and weak surfaces. Exceeding one risks a collapse, so it is enforced against the driver regardless of who loaded the vehicle.",
    "difficulty": 2
  },
  {
    "id": "fcd_q4_mark_yellow_edge",
    "categoryId": "signs",
    "front": "A continuous yellow line along the LEFT edge of the roadway indicates:",
    "back": "No stopping alongside it (except emergencies or where a sign permits) — The yellow edge line is a no-stopping instruction painted onto the road itself — common where a stopped car would block visibility or flow.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_sign_guidance_green",
    "categoryId": "signs",
    "front": "Large green boards above or beside a freeway show:",
    "back": "Direction guidance — routes, destinations and exits — Green guidance signs help you navigate: route numbers, destinations and exit information. Read them early so you can change lanes in good time.",
    "difficulty": 1
  },
  {
    "id": "fcd_qs4_exit_countdown_markers",
    "categoryId": "signs",
    "front": "The countdown markers with diagonal bars before a freeway exit tell you:",
    "back": "How far the exit is, each bar representing a fixed distance — They count you down to the off-ramp when destination boards are behind you. If you are still in the wrong lane at the last marker, take the next exit instead.",
    "difficulty": 2,
    "image": "/signs/information/information-043-01.png"
  },
  {
    "id": "fcd_qs4_general_warning_plate",
    "categoryId": "signs",
    "front": "A warning triangle showing an exclamation mark usually means:",
    "back": "It is the catch-all for anything without its own symbol. Without reading the plate underneath you know only that something is coming, which is precisely half the message.",
    "difficulty": 2,
    "image": "/signs/warning/warning-029-03.png"
  },
  {
    "id": "fc_no_uturn",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-011-05.png",
    "front": "What does this sign prohibit?",
    "back": "No U-turn (you may not turn to face the opposite direction here).",
    "difficulty": 1
  },
  {
    "id": "fcd_qs2_falling_rocks",
    "categoryId": "signs",
    "front": "A warning sign showing rocks tumbling down a slope tells you to expect:",
    "back": "Rock can already be lying in the lane or can come down as you pass. Keep away from the cutting side where the road allows, and don't stop under an unstable slope.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs2_distance_board",
    "categoryId": "signs",
    "front": "A green board listing towns with numbers beside them shows:",
    "back": "The distance in kilometres to each of those places along that route — Distance boards let you plan fuel and rest stops. Reading one is also a cheap way to confirm you took the right road out of a junction.",
    "difficulty": 1
  },
  {
    "id": "fc2_door",
    "categoryId": "rules",
    "front": "Opening your door on the traffic side?",
    "back": "Only when safe — check mirrors and look back for bikes first. Don't leave it open longer than necessary.",
    "difficulty": 1
  },
  {
    "id": "fc5_hooter",
    "categoryId": "rules",
    "front": "Legal hooter use?",
    "back": "Only to warn of danger. Everything else is noise — and an offence.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_rules_being_overtaken",
    "categoryId": "rules",
    "front": "Another vehicle is overtaking you. You should:",
    "back": "Keep left, hold a steady speed and do not accelerate until they have passed — When being overtaken, move safely to the left, keep a steady speed and do not accelerate until the other vehicle has passed.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_rules_overtake_blind",
    "categoryId": "rules",
    "front": "You may not overtake:",
    "back": "On a blind rise, a curve, or where your view ahead is limited — Never overtake on a blind rise, bend or anywhere your view of oncoming traffic is limited, or where a sign or solid line prohibits it.",
    "difficulty": 2
  },
  {
    "id": "fca_what_is",
    "categoryId": "rules",
    "front": "What is an AARTO demerit point?",
    "back": "A point added for a traffic infringement; enough of them suspend your licence.",
    "difficulty": 1
  },
  {
    "id": "fc_freeway_who",
    "categoryId": "rules",
    "front": "Who/what is not allowed on a freeway?",
    "back": "Pedestrians, animals, pedal cycles and very slow vehicles. Learners only if accompanied by a licensed driver.",
    "difficulty": 2
  },
  {
    "id": "fc3_rule_demerits",
    "categoryId": "rules",
    "front": "AARTO demerit thresholds?",
    "back": "Learner: suspension over 6 points. Licensed: over 15. Each point over = 3-month suspension; 1 point expires per clean 3 months.",
    "difficulty": 3
  },
  {
    "id": "fcd_q2_rules_learner_ages",
    "categoryId": "rules",
    "front": "Which learner's licence codes exist, and from what ages?",
    "back": "Learner's licences: Code 1 for motorcycles (from 16 — under 16½ limited to ≤125 cm³), Code 2 for vehicles up to 3 500 kg GVM (from 17), Code 3 for heavier vehicles (from 18).",
    "difficulty": 2
  },
  {
    "id": "fc8_pretrip_ext",
    "categoryId": "controls",
    "front": "Pre-trip walk-around checks?",
    "back": "Tyres, leaks under the car, lights/indicators, number plates, clean glass.",
    "difficulty": 1
  },
  {
    "id": "fc_mirror_freq",
    "categoryId": "controls",
    "front": "How often to check mirrors?",
    "back": "Every few seconds, and always before signalling, turning, slowing or changing lanes.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_ctrl_temp",
    "categoryId": "controls",
    "front": "While driving, the temperature gauge moves into the red zone. You should:",
    "back": "Stop as soon as it is safe and switch off the engine to let it cool — A reading in the red means the engine is overheating. Stop safely and switch off to avoid serious damage; never open the radiator cap while it is hot.",
    "difficulty": 2
  },
  {
    "id": "fcd_q8_ctrl_yard_contact",
    "categoryId": "controls",
    "front": "During a yard manoeuvre your vehicle touches a pole (or the demarcation line). This:",
    "back": "Fails that manoeuvre — contact with a pole, kerb or line is a fail — A pole represents another car or a wall. Touching a pole, kerb or line fails the manoeuvre, because in the real world that's a collision.",
    "difficulty": 2
  },
  {
    "id": "fc_clutch",
    "categoryId": "controls",
    "front": "Function of the clutch?",
    "back": "Engages/disengages the engine from the gearbox so you can change gear or stop without stalling.",
    "difficulty": 1
  },
  {
    "id": "fc2_dry_steer",
    "categoryId": "controls",
    "front": "'Dry steering'?",
    "back": "Turning the wheel while stationary — strains the steering and scrubs tyres. Steer while creeping.",
    "difficulty": 3
  },
  {
    "id": "fcd_q8_ctrl_yard_manoeuvres",
    "categoryId": "controls",
    "front": "Which set of manoeuvres is tested in the K53 yard test?",
    "back": "Turn in the road (3-point), alley docking, parallel parking and incline start — The yard test checks turn-in-the-road, alley docking, parallel parking and the incline start — the everyday manoeuvres you'll need in tight spaces.",
    "difficulty": 2
  },
  {
    "id": "fc8_pole_contact",
    "categoryId": "controls",
    "front": "Touch a pole/kerb/line in a manoeuvre?",
    "back": "Fails that manoeuvre — it represents a real collision.",
    "difficulty": 2
  },
  {
    "id": "fc_t_junction",
    "categoryId": "intersections",
    "front": "On the terminating road at a T-junction?",
    "back": "Give way to traffic on the continuous through road.",
    "difficulty": 2
  },
  {
    "id": "fc7_left_position",
    "categoryId": "intersections",
    "front": "Road position for a left turn?",
    "back": "Close to the left, correct lane, signalled early.",
    "difficulty": 1
  },
  {
    "id": "fc7_sequence",
    "categoryId": "intersections",
    "front": "Order of actions before a turn?",
    "back": "Mirrors → signal (early) → blind spot → turn.",
    "difficulty": 1
  },
  {
    "id": "fc7_stop_empty",
    "categoryId": "intersections",
    "front": "Stop street on an empty road?",
    "back": "Full stop behind the line every time — 'looked clear' is a fail.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_int_blocked",
    "categoryId": "intersections",
    "front": "The traffic light is green but the intersection ahead is blocked with traffic. You should:",
    "back": "Wait behind the line until you can clear the intersection without blocking it — Never enter an intersection you cannot clear, even on green. Stopping in the box blocks cross-traffic when their light goes green and causes gridlock.",
    "difficulty": 2
  },
  {
    "id": "fc11_int_scholar_patrol",
    "categoryId": "intersections",
    "front": "Scholar patrol lowers its banners across the road?",
    "back": "Stop completely and stay stopped until the banners are lifted clear of the roadway.",
    "difficulty": 1
  },
  {
    "id": "fc7_circle_gap",
    "categoryId": "intersections",
    "front": "Entering a circle with traffic circulating?",
    "back": "Circulating traffic (from your right) has priority — enter only on a safe gap.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_haz_children",
    "categoryId": "hazard_awareness",
    "front": "You are driving past a parked ice-cream van with children nearby. You should:",
    "back": "Slow down and cover the brake, anticipating a child running into the road — Children are unpredictable and may run out without looking. Reduce speed, cover the brake and be ready to stop.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_haz_oncoming_overtaker",
    "categoryId": "hazard_awareness",
    "front": "An oncoming car pulls into YOUR lane to overtake and won't make it back in time. You should:",
    "back": "Being right doesn't survive a head-on. Brake to shed energy and give them the room — left, onto the shoulder if needed. Never swerve right into the lane they came from.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_haz_blind_spot",
    "categoryId": "hazard_awareness",
    "front": "Before changing lanes, in addition to checking your mirrors you must:",
    "back": "Glance over your shoulder to check the blind spot — Mirrors leave a blind spot beside and behind the vehicle. A quick shoulder check before changing lanes catches a vehicle the mirrors cannot show. Keep your wheels straight while you check.",
    "difficulty": 1
  },
  {
    "id": "fc_skid",
    "categoryId": "hazard_awareness",
    "front": "Rear wheels start to skid?",
    "back": "Ease off the power and steer gently into the slide; avoid harsh braking or steering.",
    "difficulty": 3
  },
  {
    "id": "fc2_blowout",
    "categoryId": "hazard_awareness",
    "front": "Tyre bursts at speed?",
    "back": "Grip the wheel, ease off, keep straight — brake gently only once under control.",
    "difficulty": 3
  },
  {
    "id": "fc9_leave_bay",
    "categoryId": "parking",
    "front": "Pulling out of a parallel spot?",
    "back": "Mirrors, signal, blind-spot check — give way to traffic and cyclists.",
    "difficulty": 1
  },
  {
    "id": "fc9_hill_no_kerb",
    "categoryId": "parking",
    "front": "Parking on a hill with NO kerb?",
    "back": "Front wheels towards the road edge — a rolling car leaves the road, not the lane.",
    "difficulty": 3
  },
  {
    "id": "fciol_hydrant_15",
    "categoryId": "parking",
    "front": "Parking distance from a fire hydrant?",
    "back": "1,5 m clear either side of it. (Reg 305 also: 9 m from a pedestrian crossing, 5 m from an intersection.)",
    "difficulty": 3
  },
  {
    "id": "fc3_park_downhill",
    "categoryId": "parking",
    "front": "Wheels when parked downhill at a kerb?",
    "back": "Turned INTO the kerb (plus handbrake and gear) — the kerb catches a rolling car.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_park_crossing",
    "categoryId": "parking",
    "front": "You may not stop your vehicle within how many metres of a pedestrian crossing?",
    "back": "You may not stop within 9 metres of a pedestrian crossing on the approach side, because it blocks other drivers' view of pedestrians.",
    "difficulty": 3
  },
  {
    "id": "fc3_fd_stopping",
    "categoryId": "following_distance",
    "front": "Total stopping distance =",
    "back": "Reaction distance + braking distance. A tired or distracted brain stretches the first part badly.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_fd_three_second",
    "categoryId": "following_distance",
    "front": "In good conditions, the recommended safe following distance is:",
    "back": "Three seconds — count from when the car ahead passes a fixed point — Two seconds is the bare K53 minimum; three seconds gives you genuine reaction-plus-braking room and self-adjusts with speed.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_fd_two_second",
    "categoryId": "following_distance",
    "front": "In good conditions, the recommended minimum following distance for a light vehicle is:",
    "back": "About a two-second gap (the K53 minimum) — The two-second rule is the K53 minimum and scales with speed: you should pass a fixed point at least two seconds after the vehicle ahead. Three seconds is the recommended safe gap.",
    "difficulty": 1
  },
  {
    "id": "fc2_taxi_gap",
    "categoryId": "following_distance",
    "front": "Following a minibus taxi in town?",
    "back": "Add extra distance — they stop for passengers anywhere, often without warning.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_fd_wet",
    "categoryId": "following_distance",
    "front": "In rain or poor visibility, your following distance should be:",
    "back": "Increased to at least three to four seconds — Wet roads lengthen braking distance, so increase the gap to at least three to four seconds to give yourself time to stop.",
    "difficulty": 2
  }
];

/** Scenarios are a paid feature (PlanLimits.scenarios is false on free). */
export const STARTER_SCENARIOS: Scenario[] = [];
