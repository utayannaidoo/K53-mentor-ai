// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/gen-content-meta.mjs
// Kept honest by tests/starter-pack.test.ts.
//
// The bundled starter pack: the only content that ships to the browser without
// a paid entitlement. Everything else is served by /api/content/pack and cached
// on the device.
//
// Sized so the free tier never notices the difference — a free learner's daily
// allowance is one diagnostic, ~10 practice questions, one mini mock and one
// section drill, across a seven-day week, all drawing from this pack with room
// to rotate.
// It is also what keeps the free tier working offline and zero-config demo mode
// intact (CLAUDE.md rule 1).
//
// Every item here is universal (no `codes`), so each licence code sees the same
// pack and forCode() is a no-op over it.
import type { Flashcard, Question, Scenario } from "@/types";

export const STARTER_QUESTIONS: Question[] = [
  {
    "id": "qs3_warning_no_obligation",
    "categoryId": "signs",
    "prompt": "A warning sign differs from a regulatory sign in that a warning sign:",
    "options": [
      "Describes what is ahead and leaves the response to your judgement, rather than imposing a specific act",
      "May be ignored if the hazard is not visible",
      "Applies only outside urban areas",
      "Is always advisory and carries no consequence"
    ],
    "correctIndex": 0,
    "explanation": "Ignoring a warning is not itself an offence the way passing a red-ringed prohibition is — but driving without adjusting to a hazard you were warned about is negligent driving.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qs3_no_hooter",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-012-03.png",
    "prompt": "A red-ringed sign showing a hooter crossed out means:",
    "options": [
      "You may not sound your hooter past this sign except in an emergency",
      "Your vehicle's hooter must be disconnected",
      "Hooting is discouraged but not prohibited",
      "The sign applies only to heavy vehicles"
    ],
    "correctIndex": 0,
    "explanation": "These protect hospitals and residential areas from noise. The general rule still stands that a hooter is for warning others of your presence, not for expressing impatience.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q4_sign_grammar_triangle",
    "categoryId": "signs",
    "prompt": "Red-bordered triangular signs (point up) are used to:",
    "options": [
      "Prohibit turning",
      "Warn you of a hazard or change in the road ahead",
      "Show compulsory actions",
      "Mark freeway exits"
    ],
    "correctIndex": 1,
    "explanation": "Warning signs are triangles with a red border. They demand earlier scanning and often a lower speed — the hazard itself follows after the sign.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q4_sign_proceed_direction",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-009-05.png",
    "prompt": "This blue sign with a single arrow means:",
    "options": [
      "One-way street ends ahead",
      "You must proceed only in the direction of the arrow",
      "Overtaking allowed in that direction",
      "Parking that side only"
    ],
    "correctIndex": 1,
    "explanation": "Proceed-direction commands leave no choice: drive only where the arrow points. (The similar-looking one-way sign describes the road; this one orders your movement.)",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-029-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Rocks or stones can fall onto the road ahead from a cutting, especially after rain.",
      "The road gets narrower for a short stretch at a bridge ahead.",
      "Tractors or other slow farm vehicles regularly cross or enter the road ahead.",
      "An overhead structure or height gauge ahead limits vehicle height to the figure shown in metres."
    ],
    "correctIndex": 0,
    "explanation": "Falling rocks ahead: Rocks or stones can fall onto the road ahead from a cutting, especially after rain. Slow down, watch the rock face as well as the surface, and be ready to stop for broken rock lying in your lane.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-029-02.png"
  },
  {
    "id": "gen-sign-information-045-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Accident plate (temporary)",
      "Priority road",
      "Information centre",
      "No through road"
    ],
    "correctIndex": 0,
    "explanation": "This is the information sign \"Accident plate (temporary)\". This yellow plate below another sign warns of an accident on the road ahead. Slow down and be ready to stop for emergency vehicles and people on the road. Keep your eyes on your own lane, because slowing to look at a crash can cause another one.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/information/information-045-07.png"
  },
  {
    "id": "gen-sign-marking-088-05-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "This long white triangle warns that a yield sign or yield line is coming up.",
      "You may not park here during the times shown on the road sign that goes with this line.",
      "These arrows warn that a solid line you may not cross is coming up in the road.",
      "Traffic on neither side may cross these two solid white lines."
    ],
    "correctIndex": 0,
    "explanation": "Yield ahead marking: This long white triangle warns that a yield sign or yield line is coming up. It is advance notice only, so ease off now. Your duty to give way starts at the yield line.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/marking/marking-088-05.png"
  },
  {
    "id": "gen-sign-information-045-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Blind people plate",
      "Modal transfer point",
      "Accident plate (temporary)",
      "Recommended speed plate"
    ],
    "correctIndex": 0,
    "explanation": "This is the information sign \"Blind people plate\". Fitted below another sign, this plate tells you that blind people may be on or crossing the road ahead. Ease off and be prepared to stop for them. Flashing your lights or waving will not help, so wait until they have finished crossing.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/information/information-045-06.png"
  },
  {
    "id": "gen-sign-marking-088-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Cycle crossing",
      "No motorcycles marking",
      "Mini-circle marking",
      "Furcation arrows"
    ],
    "correctIndex": 0,
    "explanation": "This is the road marking \"Cycle crossing\". Two broken lines across the road mark a place where cyclists cross. Slow down and look both ways, and be ready to stop for a rider already on the crossing.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/marking/marking-088-04.png"
  },
  {
    "id": "gen-sign-regulatory-007-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Going straight on or turning right, you must stop in line with the sign or behind the line.",
      "This is a manually operated sign, with the word STOP on one side and GO on the other.",
      "Come to a complete stop behind the stop line every time — even if the road is empty — then move off only when it is safe.",
      "Traffic on all four approaches to this junction has to stop, and the order of stopping decides who goes."
    ],
    "correctIndex": 0,
    "explanation": "Stop, or turn left without stopping: Going straight on or turning right, you must stop in line with the sign or behind the line. Turning left, you may keep moving without stopping if it is safe, but you still give way to cross traffic and pedestrians.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-007-02.png"
  },
  {
    "id": "gen-sign-regulatory-007-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "The area is set aside for pedestrians.",
      "Vehicles may not turn left here, but you may go straight on or turn right.",
      "Turn right at the next junction during these times.",
      "Steady red: stop behind the stop line and stay stopped until the signal changes."
    ],
    "correctIndex": 0,
    "explanation": "Pedestrian priority: The area is set aside for pedestrians. Vehicles may enter only to load/offload or for an emergency, must yield to pedestrians, and may not exceed 15 km/h.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-007-04.png"
  },
  {
    "id": "qs2_crossing_flashing_red",
    "categoryId": "signs",
    "prompt": "Red lights begin flashing at a level crossing as you approach. You must:",
    "options": [
      "Stop before the crossing and wait until the lights stop flashing, even if you cannot see a train",
      "Cross quickly before the train arrives",
      "Proceed if the boom has not yet come down",
      "Stop only if you can hear a train approaching"
    ],
    "correctIndex": 0,
    "explanation": "The lights start well before the train reaches you, and a second train can follow the first. Not seeing a train is not evidence there isn't one.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_sign_solid_white",
    "categoryId": "signs",
    "prompt": "A solid white line along the centre of the road means:",
    "options": [
      "You may cross it freely",
      "You may not cross or straddle it to overtake",
      "It is only advisory",
      "Overtaking is encouraged"
    ],
    "correctIndex": 1,
    "explanation": "A solid (no-overtaking) line may not be crossed or straddled. It is used where overtaking would be dangerous, such as bends and blind rises.",
    "difficulty": 2,
    "scope": "learners"
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
    "id": "gen-sign-marking-083-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "You may not stop here during the times shown on the road sign that goes with this line.",
      "This lane is for buses only, during the times shown on the sign that goes with it.",
      "Yellow arrows in a lane show the direction traffic in that lane must take.",
      "Broad white blocks across the road mark a pedestrian crossing, the zebra-style version."
    ],
    "correctIndex": 0,
    "explanation": "No stopping — broken red line: You may not stop here during the times shown on the road sign that goes with this line. Read the sign before you pull over, because the broken red line only applies during those hours.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/marking/marking-083-03.png"
  },
  {
    "id": "gen-sign-regulatory-006-05-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Pedestrian crossing (yield)",
      "Yield",
      "Parking for people with disabilities",
      "Stop, or turn left without stopping"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Pedestrian crossing (yield)\". Give way to any pedestrians on, or about to enter, the pedestrian crossing on your side of the road.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-006-05.png"
  },
  {
    "id": "q6_mark_kerb_paint",
    "categoryId": "signs",
    "prompt": "A painted (coloured) kerb generally indicates:",
    "options": [
      "Extra-wide parking",
      "A stopping or parking restriction — obey it and any accompanying sign",
      "A cycle lane",
      "A bus-only kerb"
    ],
    "correctIndex": 1,
    "explanation": "Red means no stopping and yellow means no parking. A solid line applies at all times; a broken one applies only during the hours on the sign that goes with it.",
    "difficulty": 2,
    "scope": "learners",
    "source": "SA Learner Driver Manual (Dept of Transport, 2012), p.51; SADC RTSM Vol 1 Ch 7, §§7.2.16-7.2.17"
  },
  {
    "id": "q2_sign_gravel_begins",
    "categoryId": "signs",
    "prompt": "A sign warns that the tarred road ends and gravel begins. What changes?",
    "options": [
      "Nothing — drive exactly as on tar",
      "Braking distances get much longer and grip drops — slow down before the surface changes",
      "You must switch on your main beams",
      "The speed limit no longer applies"
    ],
    "correctIndex": 1,
    "explanation": "Gravel offers far less grip: stopping distances stretch, dust hides hazards and loose stones deflect the wheels. Reduce speed before you reach it, not on it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_sign_ped_blocks",
    "categoryId": "signs",
    "prompt": "Broad painted blocks across the road mark a pedestrian crossing. Approaching it, you must:",
    "options": [
      "Maintain speed unless someone is already halfway across",
      "Slow down and give way to pedestrians on, or clearly about to enter, the crossing",
      "Stop and wave pedestrians across even if none are near",
      "Hoot before crossing the blocks"
    ],
    "correctIndex": 1,
    "explanation": "Zebra-style block markings work like a yield to pedestrians: approach at a speed that lets you stop, and give way to anyone using or stepping onto the crossing.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-008-03-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "One-way roadway (right)",
      "Heavy goods vehicles only",
      "Three-way stop",
      "Alternative route to toll road"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"One-way roadway (right)\". This is to indicate that there is a one-way carriageway to the right, proceed in the direction of the arrow indicated.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-008-03.png"
  },
  {
    "id": "gen-sign-regulatory-012-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No overtaking by goods vehicles",
      "No right turn",
      "No picking up of passengers",
      "No U-turn"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"No overtaking by goods vehicles\". Drivers of heavy motor vehicles may not overtake another heavy vehicle for the next 500 m past this sign. The lorries in the symbol show who the ban is aimed at, so other vehicles may still overtake where road markings and conditions allow it.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-012-02.png"
  },
  {
    "id": "qs3_reservation_meaning",
    "categoryId": "signs",
    "prompt": "On South African signs, a large letter 'R' alongside a vehicle symbol indicates:",
    "options": [
      "A reservation — that road, lane or area is set aside for the class of vehicle shown",
      "A restriction on that class of vehicle",
      "A recommended route for that class of vehicle",
      "A rest area for that class of vehicle"
    ],
    "correctIndex": 0,
    "explanation": "Reservation signs give a space to one class rather than taking it away. Read the symbol to see who it is for — buses, taxis, goods vehicles or the disabled.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-039-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Grader working ahead",
      "Children ahead",
      "Uneven road ahead",
      "Speed humps ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Grader working ahead\". A grader is working on the road ahead, on its own or as part of larger road works. Drive slowly past it, because the full width of the road may not be available, and sand or gravel on the surface can affect how your vehicle handles.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-039-02.png"
  },
  {
    "id": "gen-sign-regulatory-011-06-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "You may not stop here, not even for a moment to drop someone off.",
      "You may not turn left at the intersection ahead.",
      "To prohibit pedestrians from proceeding past this sign where they could cause danger to themselves and vehicles.",
      "To prohibit noise, if the noise level of your vehicle is high, you may not proceed past the sign."
    ],
    "correctIndex": 0,
    "explanation": "No stopping: You may not stop here, not even for a moment to drop someone off. The only exceptions are to obey a traffic light or traffic officer or to avoid a collision. The ban keeps traffic flowing and stops stationary vehicles from blocking other drivers' view.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-011-06.png"
  },
  {
    "id": "gen-sign-marking-082-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "This lane is for bicycles only, so no other vehicle may drive, stop or park in it.",
      "This long white X painted in your lane warns that a railway crossing is coming up.",
      "You may not stop here during the times shown on the road sign that goes with this line.",
      "Come to a complete stop behind this solid white line, and move off only when it is safe."
    ],
    "correctIndex": 0,
    "explanation": "Lane reserved for bicycles: This lane is for bicycles only, so no other vehicle may drive, stop or park in it. A left turn can sweep across it, so check your mirror and blind spot for riders first.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/marking/marking-082-03.png"
  },
  {
    "id": "q_sign_info_colour",
    "categoryId": "signs",
    "prompt": "Blue rectangular signs are generally used to:",
    "options": [
      "Prohibit an action",
      "Give information or a positive instruction, such as a one-way or parking area",
      "Warn of danger ahead",
      "Mark the national speed limit"
    ],
    "correctIndex": 1,
    "explanation": "Blue is used for information and command signs — for example one-way roadways, parking areas and lanes reserved for particular vehicles.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q6_mark_cross_barrier_legal",
    "categoryId": "signs",
    "prompt": "Crossing a solid (barrier) centre line where it applies to you is:",
    "options": [
      "A judgement call left to the driver",
      "A traffic offence, not merely inadvisable",
      "Allowed if no traffic is oncoming",
      "Allowed to pass a cyclist"
    ],
    "correctIndex": 1,
    "explanation": "A barrier line is a regulatory marking. Crossing it is an offence in its own right — the empty road doesn't make it legal.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_sign_no_left",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-011-01.png",
    "prompt": "This sign means:",
    "options": [
      "Left turn ahead",
      "No left turn",
      "Keep left",
      "One-way to the left"
    ],
    "correctIndex": 1,
    "explanation": "A red circle with a black left arrow crossed out prohibits turning left at that point.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qsg_end_toll_road",
    "categoryId": "signs",
    "prompt": "What does this sign indicate?",
    "image": "/signs/regulatory/regulatory-017-01.png",
    "options": [
      "The end of the toll road",
      "The start of a toll road",
      "A toll plaza 500 m ahead",
      "That tolls may not be paid in cash here"
    ],
    "correctIndex": 0,
    "explanation": "A red diagonal cross over a sign is the general way of cancelling it — the restriction or condition it named stops applying from this point.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qsg_qual_local_access",
    "categoryId": "signs",
    "prompt": "A plate reading 'and Local Access Only' beneath a restriction sign means:",
    "image": "/signs/regulatory/regulatory-019-06.png",
    "imageDetail": true,
    "options": [
      "Traffic with business in the area may still use the road",
      "Only residents who live on that street may enter",
      "The road is closed to everyone",
      "Access is allowed only outside business hours"
    ],
    "correctIndex": 0,
    "explanation": "The restriction is aimed at through traffic. If you have a reason to be there — a delivery, a visit, your own driveway — you may still enter; you simply may not use the road as a shortcut.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q6_mark_stop_line_setback",
    "categoryId": "signs",
    "prompt": "At a marked pedestrian crossing, the stop line is set back BEFORE the striped area so that:",
    "options": [
      "Drivers can park on the stripes",
      "A stopped vehicle leaves the crossing itself clear and doesn't block other drivers' view of pedestrians",
      "Cyclists can filter past",
      "The crossing looks longer"
    ],
    "correctIndex": 1,
    "explanation": "Stopping behind the set-back line keeps the crossing open and lets the next lane's driver see pedestrians. Creeping onto the stripes hides the very people it protects.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-011-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No right turn at intersection",
      "No overtaking by goods vehicles",
      "No motorcycles",
      "No hooter"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"No right turn at intersection\". You may not turn right at the intersection ahead. The yellow background marks a temporary version, which binds you just the same, so stay out of any right-turn lane and take another route.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-011-04.png"
  },
  {
    "id": "gen-sign-regulatory-011-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Vehicles may not turn right here, but you may go straight on or turn left.",
      "To prohibit noise, if the noise level of your vehicle is high, you may not proceed past the sign.",
      "You may not turn left at the intersection ahead.",
      "You may not overtake any vehicle for the next 500 m past this sign, or for the distance on a plate below it."
    ],
    "correctIndex": 0,
    "explanation": "No right turn: Vehicles may not turn right here, but you may go straight on or turn left. A yellow disc in place of the white one marks a temporary version, and it binds you just the same.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-011-02.png"
  },
  {
    "id": "gen-sign-regulatory-009-06-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow at the next junction.",
      "The maximum speed, in km/h, at which you may drive past this sign.",
      "To indicate that road users must drive to the side of an obstruction where the sign is displayed.",
      "To indicate that the road or part of it is set aside for use by buses and minibuses only."
    ],
    "correctIndex": 0,
    "explanation": "Proceed in the direction shown (temporary): Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow at the next junction.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-009-06.png"
  },
  {
    "id": "qs2_cyclists_ahead",
    "categoryId": "signs",
    "prompt": "A warning sign showing a bicycle tells you that:",
    "options": [
      "Cyclists are likely to be on or crossing the road ahead",
      "A cycle path replaces the road ahead",
      "Bicycles are prohibited beyond this point",
      "A cycle race is in progress"
    ],
    "correctIndex": 0,
    "explanation": "A warning sign reports what to expect; a prohibition would carry a red ring and a diagonal bar. Expect cyclists, give them room, and check for them before turning across their path.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-017-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "The reserved lane ends here, and all vehicles may now use it.",
      "You no longer have to keep your headlights on from this sign onwards.",
      "The toll road finishes at this sign, so its toll rules no longer apply.",
      "This dual-carriage freeway ends here, and freeway rules no longer apply beyond the sign."
    ],
    "correctIndex": 0,
    "explanation": "End of lane reservation: The reserved lane ends here, and all vehicles may now use it. Check your mirrors and blind spot before moving across, because other traffic may already be travelling in it.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-017-04.png"
  },
  {
    "id": "gen-sign-regulatory-006-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Three approaches to this junction each have a stop sign, so nobody has automatic priority.",
      "Going straight on or turning right, you must stop in line with the sign or behind the line.",
      "This is a manually operated sign, with the word STOP on one side and GO on the other.",
      "Traffic on all four approaches to this junction has to stop, and the order of stopping decides who goes."
    ],
    "correctIndex": 0,
    "explanation": "Three-way stop: Three approaches to this junction each have a stop sign, so nobody has automatic priority. Stop in line with the sign or behind the line, and the vehicle that stopped first moves off first. If you are unsure who that was, yield to the right.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-006-03.png"
  },
  {
    "id": "qs3_reduced_visibility",
    "categoryId": "signs",
    "image": "/signs/warning/warning-029-06.png",
    "prompt": "A warning sign for reduced visibility ahead usually marks a stretch where:",
    "options": [
      "Mist or fog forms frequently — be ready to slow and use dipped headlights",
      "Street lighting has been removed",
      "The sun causes glare at certain times only",
      "Overtaking is prohibited at night"
    ],
    "correctIndex": 0,
    "explanation": "These go up where local conditions produce mist regularly — passes, valleys and coastal stretches. The sign warns you before you are in it, when slowing is still easy.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-marking-087-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Short double white lines warn that a neighbouring lane carries oncoming traffic during certain periods.",
      "The number of lanes increases ahead, in the direction or directions the arrows point.",
      "These painted marks show the space you may park in.",
      "These arrows warn that a solid line you may not cross is coming up in the road."
    ],
    "correctIndex": 0,
    "explanation": "Reversible lane double lines: Short double white lines warn that a neighbouring lane carries oncoming traffic during certain periods. Look for the double-headed arrow that marks the reversible lane, and check which way it is running before you use it.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/marking/marking-087-01.png"
  },
  {
    "id": "gen-sign-warning-029-05-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Water crosses the road at a drift ahead.",
      "The road gets narrower for a short stretch at a bridge ahead.",
      "Two side roads join yours ahead, close together and on opposite sides but not directly across from each other.",
      "A crossroad is coming up, and this sign gives no indication of which road has priority."
    ],
    "correctIndex": 0,
    "explanation": "Drift ahead: Water crosses the road at a drift ahead. Go very slowly and test the brakes afterwards.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-029-05.png"
  },
  {
    "id": "gen-sign-information-045-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Recommended speed plate",
      "Information centre",
      "Freeway exit countdown markers",
      "Modal transfer point"
    ],
    "correctIndex": 0,
    "explanation": "This is the information sign \"Recommended speed plate\". This plate gives the maximum speed recommended for the hazard shown on the sign above it. Road engineers calculate the figure for your safety. It is not a regulatory limit, but if you crash while travelling above it you can still face prosecution.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/information/information-045-02.png"
  },
  {
    "id": "q_sign_no_uturn",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-011-05.png",
    "prompt": "What does this sign prohibit?",
    "options": [
      "Right turns",
      "Making a U-turn",
      "Overtaking",
      "Three-point turns only"
    ],
    "correctIndex": 1,
    "explanation": "This regulatory sign prohibits making a U-turn (turning the vehicle to face the opposite direction) at that point.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-marking-083-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "You may not stop on or next to this solid red line at any time, except in an emergency.",
      "This bay is kept for a vehicle carrying a disabled person, and no other vehicle may park in it.",
      "Yellow arrows in a lane show the direction traffic in that lane must take.",
      "Come to a complete stop behind this solid white line, and move off only when it is safe."
    ],
    "correctIndex": 0,
    "explanation": "No stopping — solid red line: You may not stop on or next to this solid red line at any time, except in an emergency. It is stricter than a yellow line, because even a quick halt to drop someone off is banned.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/marking/marking-083-02.png"
  },
  {
    "id": "qs4_exit_countdown_markers",
    "categoryId": "signs",
    "image": "/signs/information/information-043-01.png",
    "prompt": "The countdown markers with diagonal bars before a freeway exit tell you:",
    "options": [
      "How far the exit is, each bar representing a fixed distance",
      "How many lanes the exit has",
      "The speed limit on the off-ramp",
      "How many exits remain on this route"
    ],
    "correctIndex": 0,
    "explanation": "They count you down to the off-ramp when destination boards are behind you. If you are still in the wrong lane at the last marker, take the next exit instead.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-information-044-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Modal transfer. At this point you can change your mode of transport, e.g. from car to train or from train to bus.",
      "Temporary high speed exit countdown sign.",
      "Fitted below another sign, this plate tells you that blind people may be on or crossing the road ahead.",
      "Each white bar on these signs counts down 100 m to the next freeway exit."
    ],
    "correctIndex": 0,
    "explanation": "Modal transfer point: Modal transfer. At this point you can change your mode of transport, e.g. from car to train or from train to bus.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/information/information-044-03.png"
  },
  {
    "id": "gen-sign-warning-038-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Sheep may be crossing or straying on the road ahead, often where fences are missing.",
      "The gravel road you are on changes to a tarred surface ahead.",
      "Antelope and other wild animals may stray onto the road ahead.",
      "The road gets narrower for a short stretch at a bridge ahead."
    ],
    "correctIndex": 0,
    "explanation": "Sheep ahead: Sheep may be crossing or straying on the road ahead, often where fences are missing. Slow down, watch both sides of the road for the next 2 km and brake rather than swerve if one steps out.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-038-01.png"
  },
  {
    "id": "q_sign_warn_shape",
    "categoryId": "signs",
    "prompt": "What shape and colour are warning signs?",
    "options": [
      "Round and blue",
      "Triangular with a red border",
      "Rectangular and green",
      "Octagonal and red"
    ],
    "correctIndex": 1,
    "explanation": "Warning signs are triangular with a red border and warn of a hazard ahead, such as a bend, crossing or pedestrians.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-037-06-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Horses with no rider may be straying on or crossing the road ahead.",
      "Your road ends ahead at a T-junction set at an angle, so you will have to turn left or right.",
      "Steep uphill ahead. You may not cross a No Overtaking line to overtake a slow moving vehicle.",
      "A crossroad is coming up, and this sign gives no indication of which road has priority."
    ],
    "correctIndex": 0,
    "explanation": "Horses ahead: Horses with no rider may be straying on or crossing the road ahead. Slow down and be ready to brake firmly without swerving. A horse stands high on its legs, so in a collision it can come over the bonnet and into the windscreen.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-037-06.png"
  },
  {
    "id": "q4_sign_speed_min",
    "categoryId": "signs",
    "prompt": "A speed shown in a blue circular sign (not red-ringed) indicates:",
    "options": [
      "The usual maximum speed",
      "A minimum speed — you may not travel slower where conditions allow",
      "The recommended parking duration",
      "A truck-only limit"
    ],
    "correctIndex": 1,
    "explanation": "Blue circle = command, so a number in blue commands a MINIMUM speed (used on freeways). Red ring = maximum. Same number, opposite meaning.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_sign_clearance",
    "categoryId": "signs",
    "prompt": "A sign on a low bridge reads '3,7 m'. What does it mean?",
    "options": [
      "The bridge is 3,7 km ahead",
      "Only vehicles (including load) lower than 3,7 m may pass under it",
      "The maximum speed under the bridge is 37 km/h",
      "The bridge can carry 3,7 tonnes"
    ],
    "correctIndex": 1,
    "explanation": "A clearance sign gives the safe height under the structure. If your vehicle or load is taller, you must find another route.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-014-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Parking for police vehicles",
      "Residential area",
      "Temporary parking reservation",
      "Parking for people with disabilities"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Parking for police vehicles\". Only police vehicles may park in this area. The blue sign with a P marks a parking reservation, and the police badge below the P shows who it is kept for.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-014-07.png"
  },
  {
    "id": "gen-sign-regulatory-009-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Pass on the side shown",
      "Proceed in the direction shown (temporary)",
      "Heavy goods vehicles only",
      "Pedestrians only"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Pass on the side shown\". To indicate that road users must drive to the side of an obstruction where the sign is displayed.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-009-04.png"
  },
  {
    "id": "qs2_hazard_marker",
    "categoryId": "signs",
    "prompt": "Black-and-yellow striped marker boards placed at an obstruction indicate:",
    "options": [
      "A physical hazard at the roadside, and which side of it the traffic must pass",
      "A pedestrian crossing point",
      "A temporary speed restriction",
      "The boundary of a municipal area"
    ],
    "correctIndex": 0,
    "explanation": "They mark the thing itself — a bridge pier, an island nose, a culvert end. The direction the stripes slope shows the side you should be passing on.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_sign_command_blue",
    "categoryId": "signs",
    "prompt": "A round blue sign with a white arrow (a command sign) tells you:",
    "options": [
      "The action shown is recommended but optional",
      "You must perform the action shown — for example keep left of an island",
      "The route is for buses only",
      "You are entering a one-way street"
    ],
    "correctIndex": 1,
    "explanation": "Blue circular command signs are compulsory instructions — 'keep left', 'proceed straight' — with the same legal force as any regulatory sign.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-marking-078-01-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No-crossing double line",
      "Box junction",
      "Disabled persons parking bay",
      "Parking bay markings"
    ],
    "correctIndex": 0,
    "explanation": "This is the road marking \"No-crossing double line\". Traffic on neither side may cross these two solid white lines. The only exception is to get around a stationary vehicle or obstruction in the road. The pair sometimes has a broken line running between them.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/marking/marking-078-01.png"
  },
  {
    "id": "gen-sign-warning-038-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Elephants are known to stray onto the road in this area.",
      "Cattle may be crossing or straying on the road ahead, and where you see one, expect more.",
      "Your road ends at a T-junction ahead, so you will have to turn sharply left or right.",
      "A lesser road crosses your priority road ahead, so crossing traffic should give way to you."
    ],
    "correctIndex": 0,
    "explanation": "Elephants ahead: Elephants are known to stray onto the road in this area. Slow right down, stay in your vehicle and keep your distance. Do not rev or hoot, since either can be taken as a challenge, and move slowly away if one looks agitated.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-038-04.png"
  },
  {
    "id": "q2_sign_two_way",
    "categoryId": "signs",
    "prompt": "After a one-way section, a sign warns of two-way traffic ahead. This means:",
    "options": [
      "You may now overtake freely",
      "Keep left — oncoming vehicles will now share the roadway",
      "The speed limit doubles",
      "The road becomes a freeway"
    ],
    "correctIndex": 1,
    "explanation": "The two-way traffic warning marks the end of one-way running. Move back into the habit of keeping left and expecting oncoming vehicles.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-010-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "This road, or the part of it the sign applies to, is set aside for taxis only.",
      "To indicate that the road or part of it may be used by pedestrians only.",
      "To give drivers an opportunity to follow an alternate route or proceed on the route and pay toll fees.",
      "To indicate that road users must drive to the side of an obstruction where the sign is displayed."
    ],
    "correctIndex": 0,
    "explanation": "Taxis only: This road, or the part of it the sign applies to, is set aside for taxis only. A blue command disc like this tells one class of road user which section to use, so every other driver must keep out, even when it looks empty.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-010-01.png"
  },
  {
    "id": "gen-sign-warning-035-05-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Your road ends ahead at a T-junction set at an angle, so you will have to turn left or right.",
      "Warthogs are known to stray onto the road in this area.",
      "A marked pedestrian crossing is coming up, and people may be on it when you arrive.",
      "More people than usual may be crossing or walking beside the road ahead, with no marked crossing."
    ],
    "correctIndex": 0,
    "explanation": "Skew T-junction ahead: Your road ends ahead at a T-junction set at an angle, so you will have to turn left or right. Because the roads meet at an angle, one of the turns is much tighter than the other, so slow down early and give way to traffic on the road you are joining.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-035-05.png"
  },
  {
    "id": "gen-sign-regulatory-013-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "The lane on the left of the yellow line is reserved for the exclusive use of authorized public transport vehicles.",
      "Only police vehicles may park in this area.",
      "Only the class of vehicle shown by the symbol may park in this area.",
      "This area is set aside for parking, as the white P on the blue sign shows."
    ],
    "correctIndex": 0,
    "explanation": "This regulatory sign: The lane on the left of the yellow line is reserved for the exclusive use of authorized public transport vehicles.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-013-04.png"
  },
  {
    "id": "qr5_overtake_return_gap",
    "categoryId": "rules",
    "prompt": "Having overtaken a vehicle, you should return to the left:",
    "options": [
      "Once you can see the whole vehicle you passed in your interior mirror",
      "As soon as your rear bumper clears its front bumper",
      "Only after passing two more vehicles",
      "Whenever the driver behind flashes you in"
    ],
    "correctIndex": 0,
    "explanation": "Seeing the whole car in the mirror is the reliable test that there is room. Cutting back early is what forces the overtaken driver to brake — and it is how many overtakes end badly.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q5_rule_dim_oncoming",
    "categoryId": "rules",
    "prompt": "When must you dip (dim) your main-beam headlights?",
    "options": [
      "Never — brights are safer",
      "When approaching oncoming traffic or following another vehicle, so you don't blind the driver",
      "Only inside urban areas",
      "Only when flashed by another driver"
    ],
    "correctIndex": 1,
    "explanation": "Main beams blind oncoming drivers and the driver ahead via their mirrors. Dip early — a blinded driver is a hazard aimed at you.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_rules_alcohol",
    "categoryId": "rules",
    "prompt": "The legal blood-alcohol limit for an ordinary driver is below:",
    "options": [
      "0.02 g per 100 ml",
      "0.05 g per 100 ml",
      "0.08 g per 100 ml",
      "There is no legal limit"
    ],
    "correctIndex": 1,
    "explanation": "The limit is a blood-alcohol concentration of less than 0.05 g per 100 ml (0.02 for professional drivers). The safest choice is not to drink and drive at all.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qmr_reverse_longer_than_necessary",
    "categoryId": "rules",
    "prompt": "The rule on reversing is that you may not travel backwards:",
    "options": [
      "For longer than is necessary, and only when it is safe to do so",
      "For more than 20 metres",
      "On any public road",
      "Without a passenger guiding you"
    ],
    "correctIndex": 0,
    "explanation": "There is no fixed distance — the test is necessity. Reversing is the manoeuvre with the worst visibility you routinely perform, so the law asks you to spend as little time doing it as the situation allows.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q2_rules_tow_gap",
    "categoryId": "rules",
    "prompt": "When one vehicle tows another, the gap between them may not exceed:",
    "options": [
      "1,8 metres",
      "3,5 metres",
      "5 metres",
      "10 metres"
    ],
    "correctIndex": 1,
    "explanation": "The towing connection may not be longer than 3,5 m, and the person steering the towed vehicle must hold a valid licence for it.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qmr_no_overtake_stopped_at_crossing",
    "categoryId": "rules",
    "prompt": "A vehicle ahead has stopped at a pedestrian crossing. You may:",
    "options": [
      "Not overtake it",
      "Overtake it slowly on the right",
      "Overtake it if no pedestrian is visible",
      "Overtake it after sounding your hooter"
    ],
    "correctIndex": 0,
    "explanation": "It stopped for a reason you cannot see — a pedestrian hidden by that very vehicle. Overtaking puts you across the crossing at speed exactly where they are walking.",
    "difficulty": 1,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q_rules_seatbelt",
    "categoryId": "rules",
    "prompt": "Who is responsible for ensuring that a child under the prescribed age is restrained?",
    "options": [
      "The child",
      "The driver of the vehicle",
      "Only the parent, if present",
      "Nobody — it is optional"
    ],
    "correctIndex": 1,
    "explanation": "The driver is legally responsible for ensuring all occupants, including children, are properly restrained where seatbelts or child seats are fitted.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qmr_depositing_refuse",
    "categoryId": "rules",
    "prompt": "Depositing fuel, oil, grease, ashes or other refuse onto the road is:",
    "options": [
      "Prohibited",
      "Permitted if cleared within 24 hours",
      "Permitted outside urban areas",
      "Permitted if it is biodegradable"
    ],
    "correctIndex": 0,
    "explanation": "Oil and grease on tarmac are as slippery as ice for a motorcycle, and stay there long after you have gone.",
    "difficulty": 1,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q2_rules_coasting",
    "categoryId": "rules",
    "prompt": "Why should you not coast downhill in neutral or with the clutch held in?",
    "options": [
      "It uses more fuel",
      "You lose engine braking and some control, and the vehicle keeps gaining speed",
      "It damages the hooter",
      "It's fine — coasting is recommended"
    ],
    "correctIndex": 1,
    "explanation": "Coasting removes engine braking, so the brakes must do all the work and can overheat, while your ability to accelerate out of trouble is gone. Stay in gear.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qmr_tow_defective_brakes",
    "categoryId": "rules",
    "prompt": "If the brakes of the towed vehicle are defective, it must be:",
    "options": [
      "Coupled by means of an appropriate tow-bar",
      "Towed with a rope no longer than 1,5 m",
      "Towed only at night",
      "Towed with its hazard lights on"
    ],
    "correctIndex": 0,
    "explanation": "With no brakes of its own, the towed vehicle is stopped entirely by the one in front — which only works if the coupling can push as well as pull.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "aarto_q_paying_fine",
    "categoryId": "rules",
    "prompt": "Does paying an AARTO infringement fine stop the demerit points from being added?",
    "options": [
      "No — paying the fine still records the points",
      "Yes — paying the fine cancels the points",
      "Only if you pay within 24 hours",
      "Only for first offences"
    ],
    "correctIndex": 0,
    "explanation": "The points are recorded whether you pay the fine, receive an enforcement order, or are convicted in court. Paying settles the money, not the points.",
    "difficulty": 3,
    "scope": "learners",
    "source": "AARTO Act 46 of 1998 & the published demerit-point schedule"
  },
  {
    "id": "qr3_hazards_while_moving",
    "categoryId": "rules",
    "prompt": "Driving along with your hazard lights flashing is:",
    "options": [
      "Wrong in normal driving — they hide your indicators, so nobody can read your intentions",
      "A sensible way to warn others that you are driving slowly",
      "Required whenever it rains",
      "The correct signal that you intend to go straight at a circle"
    ],
    "correctIndex": 0,
    "explanation": "With hazards on, both indicators are already flashing, so a turn signal becomes invisible. They are for warning others that you are a stationary hazard, not a running commentary on your speed.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qmr_freeway_hand_signals",
    "categoryId": "rules",
    "prompt": "Hand signals on a freeway are:",
    "options": [
      "Not to be used, unless you are in a situation beyond your control",
      "Required when changing lanes",
      "Required when leaving the freeway",
      "Used in the same way as on any other road"
    ],
    "correctIndex": 0,
    "explanation": "At freeway speeds an arm out of a window is both unreadable and dangerous. The exception exists for a failed indicator on a vehicle you cannot immediately stop.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "aarto_q_when_added",
    "categoryId": "rules",
    "prompt": "AARTO demerit points are added to your record when:",
    "options": [
      "The fine is paid, an enforcement order is issued, or you're convicted in court",
      "Only if a court convicts you",
      "Only if you ignore the fine",
      "The moment a camera flashes, automatically"
    ],
    "correctIndex": 0,
    "explanation": "There are three trigger points: paying the infringement, an enforcement order being issued against you, or a court conviction.",
    "difficulty": 3,
    "scope": "learners",
    "source": "AARTO Act 46 of 1998 & the published demerit-point schedule"
  },
  {
    "id": "qmr_tow_length",
    "categoryId": "rules",
    "prompt": "The tow-rope, tow-bar or chain between two vehicles may not exceed:",
    "options": [
      "3,5 m",
      "1,5 m",
      "5 m",
      "10 m"
    ],
    "correctIndex": 0,
    "explanation": "Long enough to absorb a little slack, short enough that no third vehicle mistakes the gap for a space to move into.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qmr_licence_disc_12_months",
    "categoryId": "rules",
    "prompt": "A vehicle licence disc is valid for:",
    "options": [
      "12 months",
      "6 months",
      "24 months",
      "The life of the vehicle"
    ],
    "correctIndex": 0,
    "explanation": "Twelve months, and it must be displayed. An expired disc is one of the easiest things for an officer to spot from outside the car.",
    "difficulty": 1,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "aarto_q_cancellation",
    "categoryId": "rules",
    "prompt": "Under AARTO, what eventually happens to a driver who is suspended three times?",
    "options": [
      "The licence is cancelled and they must re-apply and re-test",
      "Nothing changes after the third time",
      "They pay a single large fine and continue",
      "The points are wiped clean"
    ],
    "correctIndex": 0,
    "explanation": "A third suspension leads to cancellation — the driver loses the licence entirely and has to start the application and testing process again.",
    "difficulty": 3,
    "scope": "learners",
    "source": "AARTO Act 46 of 1998 & the published demerit-point schedule"
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
    "id": "qr4_refusing_test",
    "categoryId": "rules",
    "prompt": "A driver who refuses to provide a breath or blood specimen when lawfully required to:",
    "options": [
      "Commits an offence by refusing — you cannot avoid the consequences by declining the test",
      "Is within their rights and cannot be charged",
      "May refuse if they have not been drinking",
      "May insist on being tested only at a hospital of their choice"
    ],
    "correctIndex": 0,
    "explanation": "The refusal is itself the offence. Declining is not a way out of a drink-driving charge — it simply adds a second charge to the first.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qmr_tyre_condition",
    "categoryId": "rules",
    "prompt": "Besides tread depth, a legal tyre must have:",
    "options": [
      "No bulges and no visible canvas",
      "A matching brand on the same axle",
      "Been fitted within the last five years",
      "A white sidewall marking"
    ],
    "correctIndex": 0,
    "explanation": "A bulge means the casing has already failed internally and the tyre is holding together on air pressure alone. Visible canvas means it is through the rubber entirely.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qmr_accident_first_step",
    "categoryId": "rules",
    "prompt": "The first thing you must do when involved in any accident is:",
    "options": [
      "Stop your vehicle immediately",
      "Photograph the damage",
      "Exchange insurance details",
      "Move your vehicle off the road"
    ],
    "correctIndex": 0,
    "explanation": "Stopping is what separates an accident from a hit-and-run. Everything else — checking for injuries, calling the police, exchanging details — follows from it.",
    "difficulty": 1,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qr2_right_of_way_given",
    "categoryId": "rules",
    "prompt": "The most accurate way to think about 'right of way' is that it is:",
    "options": [
      "Something another road user gives you, never something you may take",
      "A legal entitlement you may insist on once it is yours",
      "Decided by whichever vehicle is larger",
      "Only relevant at intersections controlled by signs"
    ],
    "correctIndex": 0,
    "explanation": "Being entitled to proceed is not the same as it being safe to. The rules decide who should yield; they cannot make another driver actually do it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q5_rule_herded_animals",
    "categoryId": "rules",
    "prompt": "A herder is moving cattle across the road and signals you to stop. You must:",
    "options": [
      "Hoot to scatter the animals",
      "Stop when signalled and wait — you must comply with the person in charge of the animals",
      "Drive slowly through the herd",
      "Reverse away"
    ],
    "correctIndex": 1,
    "explanation": "You must stop when the person in charge of animals signals it. Hooting scatters livestock into your path — the opposite of what you want.",
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
    "id": "qr4_passengers_goods_area",
    "categoryId": "rules",
    "prompt": "Carrying passengers in the open goods compartment of a bakkie is restricted mainly because:",
    "options": [
      "Occupants there have no restraint and are thrown out in a crash or a hard stop",
      "It makes the vehicle harder to steer",
      "It affects the vehicle's licensing category",
      "It obstructs the driver's rear view"
    ],
    "correctIndex": 0,
    "explanation": "There is nothing to hold anyone in. Even a heavy brake, let alone a collision, ejects an unrestrained person over the side or the tailgate.",
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
    "id": "qmr_accident_moving_vehicle",
    "categoryId": "rules",
    "prompt": "Someone has been injured in the accident. Your vehicle may be moved:",
    "options": [
      "Only with an official's authorisation, and only after its position has been marked",
      "As soon as it is obstructing traffic",
      "Immediately, to clear the road",
      "Only after your insurer has inspected it"
    ],
    "correctIndex": 0,
    "explanation": "Where there are injuries the scene is evidence. If nobody is hurt the rule relaxes — you may move the vehicle if it is obstructing traffic.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qc3_low_pressure_handling",
    "categoryId": "controls",
    "prompt": "Driving on significantly under-inflated tyres affects the vehicle by:",
    "options": [
      "Making steering vague, lengthening stopping distance and overheating the tyre",
      "Improving grip because more rubber touches the road",
      "Affecting only fuel consumption",
      "Making the ride harsher"
    ],
    "correctIndex": 0,
    "explanation": "A soft tyre flexes and builds heat, which is what causes a blowout at speed. It also rolls on its edges, so the part designed to grip is not the part doing the work.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qm_handbrake_release_method",
    "categoryId": "controls",
    "prompt": "The correct way to release a fully engaged parking brake is to:",
    "options": [
      "Lift the lever slightly, press the button fully in, lower it, and release the button last",
      "Press the button and pull the lever up hard",
      "Push the lever straight down without the button",
      "Release the button first, then lower the lever"
    ],
    "correctIndex": 0,
    "explanation": "Lifting first takes the load off the ratchet so the button can move. Releasing the button before the lever is down lets the teeth clatter back into place.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q_ctrl_handbrake_motion",
    "categoryId": "controls",
    "prompt": "The parking brake (handbrake) should generally not be applied:",
    "options": [
      "When parked on a hill",
      "While the vehicle is in motion, except if the service brake fails",
      "When stopped for any length of time",
      "When there is a risk of rolling"
    ],
    "correctIndex": 1,
    "explanation": "Apply the handbrake whenever the vehicle is parked or stopped for a while, but not while moving — the only exception is a service-brake failure.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_abs_not_shorter",
    "categoryId": "controls",
    "prompt": "On loose gravel or snow, ABS may actually:",
    "options": [
      "Lengthen the stopping distance slightly, because a locked wheel would dig in and build a wedge of material",
      "Stop working altogether",
      "Halve the stopping distance",
      "Lock the wheels deliberately for grip"
    ],
    "correctIndex": 0,
    "explanation": "It is a genuine trade-off, not a flaw. You give up a little distance on loose surfaces and get steering control back, which is almost always the better bargain.",
    "difficulty": 3,
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
    "id": "q_ctrl_abs",
    "categoryId": "controls",
    "prompt": "The ABS warning light staying on while driving indicates:",
    "options": [
      "The anti-lock braking system may be faulty",
      "Your seatbelt is undone",
      "The fuel is low",
      "The headlights are on"
    ],
    "correctIndex": 0,
    "explanation": "A persistent ABS light means a possible fault in the anti-lock braking system. Normal braking usually still works, but have it checked promptly.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_tread_water_job",
    "categoryId": "controls",
    "prompt": "The grooves in a tyre's tread exist mainly to:",
    "options": [
      "Channel water out from under the tyre so the rubber can reach the road",
      "Make the tyre grip better on dry tar",
      "Reduce road noise",
      "Help the tyre run cooler"
    ],
    "correctIndex": 0,
    "explanation": "On a dry road a slick would grip best — the grooves are entirely about water. A worn tyre has nowhere to put it, which is why wet grip collapses long before the tyre looks finished.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_engine_light",
    "categoryId": "controls",
    "prompt": "The engine-management warning light comes on and stays on while you drive. It means:",
    "options": [
      "The engine's control system has detected a fault that needs checking",
      "The engine has reached its normal operating temperature",
      "You are due for a licence renewal",
      "The fuel in the tank is of poor quality"
    ],
    "correctIndex": 0,
    "explanation": "It reports a fault the engine's control system has picked up. A steady light usually means drive on gently and get it read; a flashing one means stop as soon as it is safe.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_brake_warning_light",
    "categoryId": "controls",
    "prompt": "You release the handbrake but the brake-system warning light stays on. You should:",
    "options": [
      "Not drive, and have the braking system checked",
      "Keep driving — it always clears once the brakes warm up",
      "Pump the brake pedal a few times and carry on",
      "Ignore it unless the pedal also feels soft"
    ],
    "correctIndex": 0,
    "explanation": "With the handbrake fully released, that light points at the braking system itself — low fluid or a fault. Brakes are not something to diagnose at speed, so don't drive on it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc4_towing_mirror_view",
    "categoryId": "controls",
    "prompt": "Towing a caravan wider than your car, the usual reason for fitting extension mirrors is that:",
    "options": [
      "The standard mirrors show only the caravan, leaving you blind to traffic alongside and behind",
      "The law requires four mirrors on any combination",
      "They reduce buffeting from passing trucks",
      "They make the caravan easier to reverse"
    ],
    "correctIndex": 0,
    "explanation": "A wide load fills the mirror with its own flank. Without extensions you cannot see the lane you are about to move into, which is the manoeuvre that most often goes wrong when towing.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_side_mirror_aim",
    "categoryId": "controls",
    "prompt": "Your side (door) mirrors are best set so that you see:",
    "options": [
      "Mostly the lane beside you, with just a sliver of your own vehicle at the inner edge",
      "As much of your own vehicle's side as possible",
      "Only the sky and the horizon behind you",
      "The same image as the interior mirror"
    ],
    "correctIndex": 0,
    "explanation": "A thin strip of your own car gives you a reference point; the rest of the glass should be doing useful work showing the lane next to you. Filling the mirror with your own bodywork widens your blind spot.",
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
    "id": "qx_ctrl_tyre_blowout",
    "categoryId": "controls",
    "prompt": "A front tyre bursts at speed. You should:",
    "options": [
      "Hold the wheel firmly, ease off the accelerator and slow gradually before pulling off",
      "Brake as hard as you can immediately",
      "Steer sharply onto the shoulder straight away",
      "Pull the handbrake up to stop as quickly as possible"
    ],
    "correctIndex": 0,
    "explanation": "A burst front tyre drags the car toward that side, and hard braking or sharp steering on top of that can spin it. Grip the wheel, lift off, and let the speed fall away before you leave the road.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qc4_hot_coolant_cap",
    "categoryId": "controls",
    "prompt": "The engine has overheated. You should never:",
    "options": [
      "Open the radiator or coolant cap while it is still hot — the system is pressurised and will spray scalding coolant",
      "Switch the engine off",
      "Open the bonnet at all",
      "Let the engine idle to cool down"
    ],
    "correctIndex": 0,
    "explanation": "A hot cooling system is well above boiling point and held there by pressure. Releasing the cap drops the pressure and the coolant flashes to steam, straight at whoever is standing over it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_tyre_pressure_cold",
    "categoryId": "controls",
    "prompt": "Tyre pressures should be checked:",
    "options": [
      "When the tyres are cold, since driving heats the air and raises the reading",
      "Immediately after a long fast drive",
      "Only when a tyre looks flat",
      "Once a year at the roadworthy test"
    ],
    "correctIndex": 0,
    "explanation": "Hot tyres read high, so setting them warm leaves them under-inflated once they cool. Check them before you set off, not at the end of the journey.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_ctrl_clutch_control",
    "categoryId": "controls",
    "prompt": "'Clutch control' (finding the biting point) means:",
    "options": [
      "Pressing the clutch flat to the floor",
      "Releasing the clutch to the point where it starts to take up drive without rolling",
      "Revving hard with the clutch up",
      "Using the clutch as a footrest"
    ],
    "correctIndex": 1,
    "explanation": "The biting point is where the clutch just starts to transmit power and the vehicle neither rolls forward nor back. It is essential for smooth hill starts and slow manoeuvres.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc3_cruise_control_when_not",
    "categoryId": "controls",
    "prompt": "Cruise control should NOT be used:",
    "options": [
      "In heavy traffic, on wet or slippery roads, or on winding roads",
      "On long straight stretches of freeway",
      "When travelling alone",
      "In daylight"
    ],
    "correctIndex": 0,
    "explanation": "Cruise control holds speed when you should be varying it, and adds a step between you and slowing down. In the wet it can also drive a slipping wheel rather than easing off.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qm_wheels_straight_waiting",
    "categoryId": "controls",
    "prompt": "Waiting to turn right at an intersection, your front wheels should point straight ahead because:",
    "options": [
      "Being shunted from behind would otherwise push you into oncoming traffic",
      "It reduces tyre wear while stationary",
      "It makes the turn easier to start",
      "It keeps the steering lock from engaging"
    ],
    "correctIndex": 0,
    "explanation": "A rear-end shunt turns your car into a projectile aimed wherever the wheels point. Straight ahead means you are pushed up the road you are already in. It is three points on the sheet and a great deal more than that in real life.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q8_ctrl_stall_recovery",
    "categoryId": "controls",
    "prompt": "You stall at a traffic light. The correct recovery is to:",
    "options": [
      "Restart quickly while still in gear and revs high",
      "Apply the handbrake, select neutral, restart, then move off with the full procedure",
      "Push the car out of the way",
      "Switch on hazards and wait for help"
    ],
    "correctIndex": 1,
    "explanation": "Handbrake up secures the car, neutral lets it start safely, then move off properly. A panicked restart in gear can jerk you into the intersection.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_blind_spot_meaning",
    "categoryId": "controls",
    "prompt": "The 'blind spot' is:",
    "options": [
      "The area around your vehicle that your mirrors do not show you",
      "The area directly in front of the bonnet",
      "Any part of the road hidden by rain or fog",
      "The gap between your headlights' beams at night"
    ],
    "correctIndex": 0,
    "explanation": "Mirrors cannot cover everything — a vehicle alongside and slightly behind can sit completely unseen. That is why K53 asks for a physical head check, not just a mirror glance, before you change direction.",
    "difficulty": 1,
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
    "id": "qc5_stuck_in_water",
    "categoryId": "controls",
    "prompt": "Your vehicle stalls in rising water. The priority is to:",
    "options": [
      "Get out and to higher ground immediately — the vehicle is replaceable and water rises fast",
      "Stay inside and wait for the water to recede",
      "Try repeatedly to restart the engine",
      "Open the bonnet to dry the electrics"
    ],
    "correctIndex": 0,
    "explanation": "Moving water shifts a car in surprisingly little depth, and doors become impossible to open against pressure. Leaving early is the only reliable option.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qc5_main_beam_when",
    "categoryId": "controls",
    "prompt": "Main-beam headlights should be dipped:",
    "options": [
      "When you meet oncoming traffic and when following another vehicle closely",
      "Only when meeting oncoming traffic",
      "Only in built-up areas",
      "Only when it starts to rain"
    ],
    "correctIndex": 0,
    "explanation": "Following traffic is the half drivers forget. Your main beam fills the mirror of the car ahead and dazzles that driver just as effectively as an oncoming one.",
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
    "id": "qx_ctrl_brake_fade",
    "categoryId": "controls",
    "prompt": "Riding the brakes continuously down a long descent is unwise mainly because:",
    "options": [
      "The brakes overheat and become less effective — brake fade",
      "It wears the tyres out faster than the brakes",
      "The brake lights will burn out from constant use",
      "It uses more fuel than engine braking"
    ],
    "correctIndex": 0,
    "explanation": "Brakes shed speed by turning it into heat, and hot brakes stop working as well just as you need them most. Let a lower gear hold the speed and use the brakes in firm, brief applications.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr3_slip_lane_merge",
    "categoryId": "intersections",
    "prompt": "Joining a main road from an acceleration (slip) lane, you should:",
    "options": [
      "Match the speed of the traffic and merge into a gap, giving way to vehicles already on the road",
      "Stop at the end of the lane and wait for a complete break in traffic",
      "Maintain your speed and expect traffic to move over for you",
      "Merge as early as possible regardless of the gap"
    ],
    "correctIndex": 0,
    "explanation": "The slip lane exists so you can arrive at traffic speed. Stopping at its end forces you to rejoin from a standstill, which is far more dangerous than merging at pace.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_int_dead_robot",
    "categoryId": "intersections",
    "prompt": "The traffic lights at an intersection are out of order. You must:",
    "options": [
      "Proceed at normal speed — lights out means no rules apply",
      "Treat the intersection as a 4-way stop: stop fully, then proceed in turn",
      "Yield only to traffic from the left",
      "Wait for a traffic officer before crossing"
    ],
    "correctIndex": 1,
    "explanation": "A dead robot legally becomes a stop for every direction. Stop completely, take your turn in order of arrival, and watch for drivers who don't.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr4_turn_on_arrow_only",
    "categoryId": "intersections",
    "prompt": "Your traffic signal shows a red light with a green arrow pointing right. You may:",
    "options": [
      "Turn right only, giving way to anything already lawfully in the intersection",
      "Turn right or go straight ahead",
      "Proceed in any direction, since a green arrow overrides the red",
      "Turn right without checking, since the arrow guarantees a clear path"
    ],
    "correctIndex": 0,
    "explanation": "The arrow releases one movement and the red holds the rest. It usually does mean the conflicting streams are stopped — but pedestrians and a vehicle still clearing the box are not.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q7_int_turn_right_no_arrow",
    "categoryId": "intersections",
    "prompt": "Your light is a full green (no right-turn arrow) and you want to turn right, but oncoming traffic is heavy. You should:",
    "options": [
      "Wait behind the stop line until the light turns red",
      "Move forward into the intersection and complete the turn when a safe gap appears — even as the light changes",
      "Turn immediately; green gives you priority",
      "Reverse and wait for a quieter time"
    ],
    "correctIndex": 1,
    "explanation": "With no filter arrow you may edge into the intersection and turn when a gap opens, clearing on amber/red if needed. Waiting behind the line means never getting a turn.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q7_int_circle_gap",
    "categoryId": "intersections",
    "prompt": "Approaching a traffic circle with vehicles already circulating, you must:",
    "options": [
      "Enter immediately — entering traffic has priority",
      "Wait and enter only into a safe gap; vehicles already in the circle have priority",
      "Force your way in so you don't hold up the queue",
      "Stop fully in the circle before choosing an exit"
    ],
    "correctIndex": 1,
    "explanation": "Circulating traffic (coming from your right) has priority. Enter only when there's a real gap — nudging in expecting others to brake causes the typical circle bump.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_traffic_circle_exit_signal",
    "categoryId": "intersections",
    "prompt": "When leaving a traffic circle, you should:",
    "options": [
      "Signal left as you pass the exit before the one you want",
      "Signal right throughout, until you have left",
      "Not signal at all — circles are exempt",
      "Signal left only after you have already begun to exit"
    ],
    "correctIndex": 0,
    "explanation": "Signalling left on the approach to your exit tells drivers waiting to enter that the circle is about to clear. Signalling as you leave tells them nothing in time.",
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
    "id": "qr5_railway_multiple_tracks",
    "categoryId": "intersections",
    "prompt": "At a level crossing with more than one track, the danger after a train passes is that:",
    "options": [
      "A second train may be approaching on another track, hidden by the first",
      "The rails will be slippery",
      "The boom may close again immediately",
      "The crossing surface becomes uneven"
    ],
    "correctIndex": 0,
    "explanation": "The passing train both hides and drowns out the second one. Wait until the signals stop and you can see clearly along every track before crossing.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_int_left_position",
    "categoryId": "intersections",
    "prompt": "The correct position for a left turn at an intersection is:",
    "options": [
      "Swing wide to the right first for a smooth arc",
      "As close to the left edge as is safe, turning into the nearest lane of the new road",
      "From the middle of the road",
      "Any lane, as long as you signal"
    ],
    "correctIndex": 1,
    "explanation": "Turn left from the left edge into the left lane. Swinging out first invites vehicles (especially motorcycles) into the gap on your inside.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_int_circle",
    "categoryId": "intersections",
    "image": "/signs/regulatory/regulatory-007-03.png",
    "prompt": "When entering a traffic circle (roundabout), you must give way to:",
    "options": [
      "Traffic approaching from your left",
      "Traffic already in the circle, approaching from your right",
      "Nobody — circles have no right-of-way rules",
      "Only large vehicles"
    ],
    "correctIndex": 1,
    "explanation": "At a traffic circle you yield to vehicles already in the circle, which approach from your right. Signal left when you are about to exit.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q7_int_minor_major",
    "categoryId": "intersections",
    "prompt": "A minor side road meets a main through road with no stop or yield line. As you approach on the minor road you should:",
    "options": [
      "Continue — you have equal right of way",
      "Give way to traffic on the through road; the terminating road yields",
      "Speed up to merge before the main-road traffic",
      "Stop only if a sign tells you to"
    ],
    "correctIndex": 1,
    "explanation": "Traffic on the road that ends at the junction yields to the through road. Even without a sign, defensive practice is to give way to the established flow.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_int_mini_circle",
    "categoryId": "intersections",
    "prompt": "At a mini-circle, if two vehicles arrive at the same time, priority is given to:",
    "options": [
      "The vehicle on the left",
      "The vehicle that arrived first; if simultaneous, the one on the right",
      "The vehicle going straight",
      "The vehicle turning right"
    ],
    "correctIndex": 1,
    "explanation": "A mini-circle follows first-come-first-go like a four-way stop; when vehicles arrive together, the one on the right has priority. You still pass to the left of the central island.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q_int_ped_crossing",
    "categoryId": "intersections",
    "prompt": "You are turning at an intersection and pedestrians are crossing the road you are entering. You must:",
    "options": [
      "Hoot so they hurry",
      "Give way to the pedestrians and let them finish crossing",
      "Turn around them quickly",
      "Carry on — vehicles have priority"
    ],
    "correctIndex": 1,
    "explanation": "Turning traffic must give way to pedestrians already crossing the road being entered. Wait for them to clear before completing the turn.",
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
    "id": "q3_int_emergency",
    "categoryId": "intersections",
    "prompt": "You're inside an intersection when an ambulance with siren approaches from behind. You should:",
    "options": [
      "Stop immediately where you are",
      "Clear the intersection first, then pull over to the left and stop",
      "Speed up to outrun it",
      "Reverse out of the intersection"
    ],
    "correctIndex": 1,
    "explanation": "Stopping inside the intersection blocks the emergency vehicle's path. Clear the junction, then move left and stop so it can pass.",
    "difficulty": 2,
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
    "id": "q_haz_scan",
    "categoryId": "hazard_awareness",
    "prompt": "Good defensive driving means you should:",
    "options": [
      "Focus only on the car directly ahead",
      "Continuously scan far ahead, to the sides and your mirrors for developing hazards",
      "Drive faster to clear hazards quickly",
      "Rely on other drivers to avoid you"
    ],
    "correctIndex": 1,
    "explanation": "Defensive driving means actively scanning the whole scene — far ahead, the sides and mirrors — so you anticipate hazards early and always have an escape plan.",
    "difficulty": 1,
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
    "id": "q_haz_skid",
    "categoryId": "hazard_awareness",
    "prompt": "Your rear wheels begin to skid to the right. You should:",
    "options": [
      "Brake as hard as you can",
      "Ease off the accelerator and steer gently in the direction the rear is sliding",
      "Steer sharply the opposite way",
      "Pull the handbrake"
    ],
    "correctIndex": 1,
    "explanation": "To correct a skid, ease off the power and steer gently into the slide (the direction the rear is going) to regain alignment. Harsh braking or steering makes it worse.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_haz_breakdown_freeway",
    "categoryId": "hazard_awareness",
    "prompt": "Your car breaks down on a freeway. The safest sequence is:",
    "options": [
      "Stop in your lane and put hazards on",
      "Get fully onto the emergency shoulder, hazards on, triangle at least 45 m behind, and wait away from the traffic side",
      "Abandon the car exactly where it stops",
      "Reverse along the shoulder to the previous off-ramp"
    ],
    "correctIndex": 1,
    "explanation": "Clear the traffic lanes, warn approaching drivers (hazards + triangle 45 m back), and keep yourself and passengers behind the barrier or well clear of the traffic side.",
    "difficulty": 2,
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
    "id": "q2_haz_first_rain",
    "categoryId": "hazard_awareness",
    "prompt": "Why is the road extra slippery in the first minutes of rain after a long dry spell?",
    "options": [
      "Rainwater is naturally oily",
      "Accumulated oil and rubber on the surface float up before being washed away",
      "Tyres shrink in the rain",
      "It isn't — light rain has no effect"
    ],
    "correctIndex": 1,
    "explanation": "The first shower lifts months of oil, diesel and rubber dust into a greasy film. Grip returns somewhat once heavier rain washes it off — treat those first minutes like ice.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q9_haz_medication",
    "categoryId": "hazard_awareness",
    "prompt": "Your medicine's label warns it may cause drowsiness. Before driving you should:",
    "options": [
      "Drive anyway — it's not alcohol",
      "Not drive if it impairs you; some medication dulls reactions as much as alcohol",
      "Drive only on quiet roads",
      "Take a double dose to get it over with"
    ],
    "correctIndex": 1,
    "explanation": "Impairment is impairment, whatever the cause. Drowsy medication stretches your reaction time — heed the warning and find another way to travel.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_haz_scan_ahead",
    "categoryId": "hazard_awareness",
    "prompt": "Good hazard perception means your eyes should mostly be:",
    "options": [
      "Fixed on the bumper of the car directly ahead",
      "Scanning far up the road (about 12 seconds ahead) so you spot hazards early",
      "On the speedometer",
      "On the road surface just in front of your car"
    ],
    "correctIndex": 1,
    "explanation": "Looking well ahead gives you time to plan. Staring at the car in front means you only react when it does — far too late for a developing hazard.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_haz_debris_swerve",
    "categoryId": "hazard_awareness",
    "prompt": "An object has fallen off a truck into your lane. Before you react you should:",
    "options": [
      "Swerve immediately without looking",
      "Check your mirrors first — braking straight is often safer than a sudden swerve into another vehicle",
      "Close your eyes and hope",
      "Accelerate over it"
    ],
    "correctIndex": 1,
    "explanation": "A panic swerve can put you into a car alongside or into oncoming traffic. A quick mirror check and straight-line braking usually beats an instinctive swerve.",
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
    "id": "q9_haz_space_cushion",
    "categoryId": "hazard_awareness",
    "prompt": "Keeping a 'space cushion' around your vehicle means:",
    "options": [
      "Fitting soft bumpers",
      "Keeping space on all sides and always knowing where you'd go if something went wrong",
      "Driving in the middle lane only",
      "Leaving the radio off"
    ],
    "correctIndex": 1,
    "explanation": "Space is time. Room around you — and a planned escape route — turns a sudden hazard into a manageable one instead of a collision.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_hazard_covering_children",
    "categoryId": "hazard_awareness",
    "prompt": "Driving past a school at closing time, the safest assumption is that:",
    "options": [
      "A child may step out from between parked cars without looking",
      "Children will use the marked crossing because they were taught to",
      "The scholar patrol will control all pedestrian movement",
      "Children are only a risk on the school's own side of the road"
    ],
    "correctIndex": 0,
    "explanation": "Children are short, quick and focused on their friends, not on traffic. Plan for the one who doesn't look, because that is the one who will be there.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qmr_overtake_blind_rise",
    "categoryId": "hazard_awareness",
    "prompt": "Overtaking where your view ahead is limited by a blind rise or a curve is:",
    "options": [
      "Prohibited — you cannot see what you are pulling out into",
      "Permitted if you sound your hooter first",
      "Permitted if the road is marked with a broken line",
      "Permitted below 60 km/h"
    ],
    "correctIndex": 0,
    "explanation": "A broken line permits overtaking; it does not promise the road is clear. The line is drawn for average conditions, and your eyes decide the rest.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q_haz_children",
    "categoryId": "hazard_awareness",
    "prompt": "You are driving past a parked ice-cream van with children nearby. You should:",
    "options": [
      "Maintain speed and hoot",
      "Slow down and cover the brake, anticipating a child running into the road",
      "Speed up to pass quickly",
      "Flash your lights and continue"
    ],
    "correctIndex": 1,
    "explanation": "Children are unpredictable and may run out without looking. Reduce speed, cover the brake and be ready to stop.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_park_reverse_bay",
    "categoryId": "parking",
    "prompt": "Why does the K53 system favour reversing INTO a parking bay over reversing out of one?",
    "options": [
      "It looks more professional",
      "You drive out forwards with a clear view, instead of reversing blind into moving traffic",
      "It saves fuel",
      "It is required by law"
    ],
    "correctIndex": 1,
    "explanation": "Reversing into the bay happens in a space you've just seen. Leaving forwards gives you full vision of pedestrians and traffic — the risky move is done in the safe area.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_park_dooring",
    "categoryId": "parking",
    "prompt": "Before opening your door to get out of a parked car, you should:",
    "options": [
      "Open it quickly to save time",
      "Check the mirror and glance over your shoulder for cyclists and passing traffic",
      "Only check if you hear a car",
      "Open it fully and step out"
    ],
    "correctIndex": 1,
    "explanation": "A door flung open into a passing cyclist ('dooring') causes serious injury and is an offence. A mirror-and-shoulder check before opening prevents it.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr2_park_hazard_lights_myth",
    "categoryId": "parking",
    "prompt": "Switching on your hazard lights while stopped somewhere you may not stop:",
    "options": [
      "Does not make it lawful — hazards warn others, they do not create permission",
      "Makes a brief stop lawful anywhere",
      "Is required whenever you park legally",
      "Transfers responsibility to passing drivers"
    ],
    "correctIndex": 0,
    "explanation": "Hazards say 'I am a hazard', which is an admission rather than an excuse. If stopping there is prohibited, it stays prohibited with the lights flashing.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qm_park_penalty",
    "categoryId": "parking",
    "prompt": "The consequence of breaching the parking restrictions is:",
    "options": [
      "A fine, and possibly having your vehicle impounded",
      "A fine only",
      "Demerit points only",
      "A warning on the first occasion"
    ],
    "correctIndex": 0,
    "explanation": "Impoundment is the part people forget. A car left somewhere that blocks traffic or emergency access can be towed, and recovering it costs considerably more than the fine.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q2_park_direction",
    "categoryId": "parking",
    "prompt": "When parking parallel on a two-way road you must park:",
    "options": [
      "Facing oncoming traffic so you can see it when leaving",
      "On the left side, facing the same direction as the traffic flow",
      "On whichever side has more shade",
      "Half on the sidewalk to leave more room"
    ],
    "correctIndex": 1,
    "explanation": "Park on the left, with the flow. Parking against the flow confuses other drivers and at night shows them your (dark) rear instead of reflectors and lamps set up for it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_park_incline_up",
    "categoryId": "parking",
    "prompt": "When parking facing uphill next to a kerb, you should turn your front wheels:",
    "options": [
      "Toward the kerb",
      "Away from the kerb (so a roll-back is caught by the kerb)",
      "Straight ahead",
      "Fully to the right always"
    ],
    "correctIndex": 1,
    "explanation": "Facing uphill, turn the wheels away from the kerb so that if the car rolls back the wheels catch the kerb. Apply the handbrake and leave it in gear.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr3_park_taxi_rank",
    "categoryId": "parking",
    "prompt": "Parking a private car in a marked taxi rank is:",
    "options": [
      "Not allowed — the rank is reserved for the class of vehicle marked",
      "Allowed outside peak hours",
      "Allowed if no taxis are present",
      "Allowed for up to fifteen minutes"
    ],
    "correctIndex": 0,
    "explanation": "A reserved rank is class-restricted the same way a bus lane is. Occupying it pushes taxis into the traffic lane to load, which is the hazard the rank prevents.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q9_park_angle_reverse",
    "categoryId": "parking",
    "prompt": "Leaving an angled (echelon) bay where you nosed in, the safest method is to:",
    "options": [
      "Reverse out fast before anyone comes",
      "Reverse out slowly with full observation, edging back until you can see clearly, giving way to passing traffic",
      "Pull forward over the kerb",
      "Wait for someone to wave you out"
    ],
    "correctIndex": 1,
    "explanation": "Backing out of an angled bay is a blind manoeuvre — creep back, keep looking all round, and yield to traffic and pedestrians until you can see it's clear.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q11_park_stop_vs_park",
    "categoryId": "parking",
    "prompt": "How does a 'no stopping' restriction differ from a 'no parking' one?",
    "options": [
      "They mean exactly the same thing",
      "No stopping forbids halting even for a moment; no parking still lets you halt briefly to load or set down a passenger",
      "No parking is stricter than no stopping",
      "No stopping only applies at night"
    ],
    "correctIndex": 1,
    "explanation": "A no-stopping zone (red kerb line / red-ringed sign) means you may not halt at all. A no-parking restriction lets you stop momentarily to pick up or drop off, but you may not leave the vehicle or wait.",
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
    "id": "qr3_fd_convoy",
    "categoryId": "following_distance",
    "prompt": "Travelling as part of a group of vehicles on a long trip, the safe approach is to:",
    "options": [
      "Keep normal following distances and let the group spread out",
      "Stay tightly bunched so nobody gets separated",
      "Match the lead vehicle's speed exactly regardless of the gap",
      "Drive two abreast so the group stays together"
    ],
    "correctIndex": 0,
    "explanation": "Bunching turns one driver's mistake into a multi-vehicle crash, and a tight convoy leaves overtaking traffic nowhere to pull in. Arrange to regroup at stops instead.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_fd_tailgated",
    "categoryId": "following_distance",
    "prompt": "If the vehicle behind you is following too closely (tailgating), the safest response is to:",
    "options": [
      "Brake suddenly to warn them",
      "Increase your own following distance to the car ahead and let them pass",
      "Speed up well over the limit",
      "Switch on your hazards and stop"
    ],
    "correctIndex": 1,
    "explanation": "Tailgating removes your safety buffer. Increase the gap in front so you can brake gently, and allow the tailgater to overtake when it is safe.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_fd_helps_behind",
    "categoryId": "following_distance",
    "prompt": "Leaving a generous gap to the car ahead also helps the driver BEHIND you because:",
    "options": [
      "It doesn't affect them at all",
      "It lets you brake gently and early instead of suddenly, reducing the chance of a chain-reaction rear-end",
      "It makes them drive faster",
      "It blocks them from overtaking"
    ],
    "correctIndex": 1,
    "explanation": "Your gap absorbs the shocks in the traffic ahead so you brake smoothly. Tailgating forces hard braking that ripples back into a pile-up.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q2_fd_taxi_gap",
    "categoryId": "following_distance",
    "prompt": "Driving behind a minibus taxi in town, the wise following strategy is:",
    "options": [
      "Close the gap so it can't stop suddenly",
      "Add extra following distance — taxis stop frequently and often without warning",
      "Overtake immediately, wherever you are",
      "Match its speed exactly at one car length"
    ],
    "correctIndex": 1,
    "explanation": "Taxis stop for passengers anywhere, sometimes without indicating. The extra second or two of space is what turns a sudden stop into a non-event.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr3_fd_tunnel_gap",
    "categoryId": "following_distance",
    "prompt": "Following another vehicle through a long tunnel, you should:",
    "options": [
      "Keep your normal gap or more — there is no shoulder and no way around a stopped vehicle",
      "Close up so more vehicles fit through at once",
      "Switch off your headlights to avoid dazzle",
      "Overtake early to get clear of the tunnel"
    ],
    "correctIndex": 0,
    "explanation": "A tunnel removes every escape route at once: no shoulder, no verge, nowhere to swerve. The gap in front is the only space you have.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_fd_two_second_why_time",
    "categoryId": "following_distance",
    "prompt": "The following-distance rule is expressed in seconds rather than metres because:",
    "options": [
      "A time gap automatically scales with speed, whereas a fixed distance does not",
      "Seconds are easier to measure with a watch",
      "Metres vary between vehicle types",
      "It matches the way speed limits are written"
    ],
    "correctIndex": 0,
    "explanation": "The reaction time you need barely changes with speed, but the ground it covers does. Counting seconds gives you the right gap at 60 and at 120 without any arithmetic.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_fd_wet_grip_loss",
    "categoryId": "following_distance",
    "prompt": "Your following distance should be increased in the wet mainly because:",
    "options": [
      "Tyres have less grip, so the braking part of your stopping distance grows",
      "Your reaction time slows down in cold weather",
      "Brake lights are harder to see in rain",
      "Wet roads make the engine less responsive"
    ],
    "correctIndex": 0,
    "explanation": "Reaction time is much the same wet or dry; what changes is how much road the tyres need once you are on the brakes. That is the part the bigger gap has to cover.",
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
    "id": "q3_fd_speed_square",
    "categoryId": "following_distance",
    "prompt": "If you double your speed, your braking distance becomes roughly:",
    "options": [
      "Double",
      "Four times as long",
      "Half",
      "The same — brakes are brakes"
    ],
    "correctIndex": 1,
    "explanation": "Braking distance grows with the square of speed: 120 km/h needs about four times the braking distance of 60 km/h, not twice.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr3_fd_lateral_space",
    "categoryId": "following_distance",
    "prompt": "Keeping space to the SIDES of your vehicle matters because:",
    "options": [
      "Your escape route in an emergency is sideways as often as it is forwards",
      "It reduces wind resistance",
      "It is required only for heavy vehicles",
      "It keeps your mirrors cleaner"
    ],
    "correctIndex": 0,
    "explanation": "Braking is not always enough. Drivers who avoid a collision usually steer into a space they already knew was there — which means not driving boxed in alongside others.",
    "difficulty": 3,
    "scope": "learners"
  }
];

export const STARTER_FLASHCARDS: Flashcard[] = [
  {
    "id": "fcd_qsg_blue_disc_commands",
    "categoryId": "signs",
    "front": "A road sign consisting of a white symbol on a solid blue disc is:",
    "back": "Blue discs command, red rings prohibit. The distinction is worth learning as a rule rather than sign by sign, because it tells you what a sign wants even when you have never seen that particular symbol.",
    "difficulty": 2
  },
  {
    "id": "fcd_qsg_qual_local_access",
    "categoryId": "signs",
    "front": "A plate reading 'and Local Access Only' beneath a restriction sign means:",
    "back": "The restriction is aimed at through traffic. If you have a reason to be there — a delivery, a visit, your own driveway — you may still enter; you simply may not use the road as a shortcut.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-019-06.png"
  },
  {
    "id": "fcd_qs3_time_limited_parking",
    "categoryId": "signs",
    "front": "A parking reservation sign showing a time limit means:",
    "back": "You may park there only up to the period shown, after which you must move — A time-limited bay turns over so more drivers can use it. Overstaying is a parking offence whether or not the bay is needed at that moment.",
    "difficulty": 2,
    "image": "/signs/regulatory/regulatory-014-06.png"
  },
  {
    "id": "fcd_gen-sign-regulatory-014-03-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Parking for people with disabilities: Parking here is only for a vehicle carrying people with disabilities. The wheelchair symbol below the P shows who it is kept for, and the same symbol may be painted in the bay itself.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-014-03.png"
  },
  {
    "id": "fcd_gen-sign-regulatory-017-05-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "End of dual-carriage freeway: This dual-carriage freeway ends here, and freeway rules no longer apply beyond the sign. Expect road users a freeway keeps out, such as pedestrians, cyclists and tractors, and check the speed limit now in…",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-017-05.png"
  },
  {
    "id": "fc6_temp_cones",
    "categoryId": "signs",
    "front": "Cones/barricades at roadworks?",
    "back": "Follow the coned path only. Never enter or move the barriers.",
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
    "id": "fcd_qs4_general_warning_plate",
    "categoryId": "signs",
    "front": "A warning triangle showing an exclamation mark usually means:",
    "back": "It is the catch-all for anything without its own symbol. Without reading the plate underneath you know only that something is coming, which is precisely half the message.",
    "difficulty": 2,
    "image": "/signs/warning/warning-029-03.png"
  },
  {
    "id": "fc_ped_warn",
    "categoryId": "signs",
    "image": "/signs/warning/warning-037-02.png",
    "front": "What does this warning sign mean?",
    "back": "Pedestrians may be in or near the road ahead — slow down and be ready to stop.",
    "difficulty": 1
  },
  {
    "id": "fcd_qsg_qualifier_ignore_plate",
    "categoryId": "signs",
    "front": "You read the main sign but not the plate beneath it. The risk is that you:",
    "back": "Both errors are real. A '60' with a motorcycle plate does not slow a car down; a 'no right turn' with a bus plate does not stop a car turning. Reading only half the message gets you the wrong answer in both directions.",
    "difficulty": 2
  },
  {
    "id": "fcd_gen-sign-marking-079-04-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Parking bay markings: These painted marks show the space you may park in. Keep the whole vehicle inside one marked bay, and never park on the sidewalk or verge.",
    "difficulty": 3,
    "image": "/signs/marking/marking-079-04.png"
  },
  {
    "id": "fc_yield",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-006-02.png",
    "front": "What does this sign require?",
    "back": "YIELD: give right of way to crossing traffic and pedestrians. You need not stop if clear, but must be ready to.",
    "difficulty": 1
  },
  {
    "id": "fcd_gen-sign-warning-040-02-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "This warning sign: Marks the place and direction of a sharp bend in the road.",
    "difficulty": 3,
    "image": "/signs/warning/warning-040-02.png"
  },
  {
    "id": "fcd_q2_sign_brown_tourism",
    "categoryId": "signs",
    "front": "A brown road sign with white lettering indicates:",
    "back": "A tourist attraction or place of interest — Brown signs are tourism guidance signs — game reserves, wine routes, monuments and similar destinations.",
    "difficulty": 1
  },
  {
    "id": "fcd_qs2_climbing_lane",
    "categoryId": "signs",
    "front": "A sign announcing a climbing (passing) lane ahead is most useful because it tells you:",
    "back": "Most dangerous overtaking on a rural road happens within a few kilometres of a climbing lane the driver didn't know was coming. Waiting costs a minute.",
    "difficulty": 2
  },
  {
    "id": "fcd_gen-sign-regulatory-011-06-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "No stopping: You may not stop here, not even for a moment to drop someone off. The only exceptions are to obey a traffic light or traffic officer or to avoid a collision.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-011-06.png"
  },
  {
    "id": "fcd_q_sign_reg_shape",
    "categoryId": "signs",
    "front": "Round signs with a red border give you:",
    "back": "A regulatory order you must obey — Round, red-bordered signs are regulatory — they give an order you must obey, such as speed limits, no entry or no overtaking.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_sign_de_restriction",
    "categoryId": "signs",
    "front": "A sign with a diagonal line (or grey bars) through a previous regulatory sign means:",
    "back": "The previous restriction now ends / no longer applies — A de-restriction sign cancels a previous regulatory instruction — for example, ending a no-overtaking zone or a speed restriction.",
    "difficulty": 3
  },
  {
    "id": "fcd_qsg_qualifier_principle",
    "categoryId": "signs",
    "front": "A small rectangular plate is mounted directly beneath a road sign. Its job is to:",
    "back": "These are qualifier plates, and they are not decoration — the plate is what decides whether the sign applies to you at this moment. Read the pair together or you will obey a restriction that was never yours, or ignore one that was.",
    "difficulty": 2
  },
  {
    "id": "fcd_q4_sign_no_stopping_vs_parking",
    "categoryId": "signs",
    "front": "The difference between a NO STOPPING and a NO PARKING restriction is:",
    "back": "No-stopping is the stricter one: wheels may not stop turning there at all. Under no-parking you may pause to set down a passenger, but not leave the vehicle.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs2_crossing_flashing_red",
    "categoryId": "signs",
    "front": "Red lights begin flashing at a level crossing as you approach. You must:",
    "back": "The lights start well before the train reaches you, and a second train can follow the first. Not seeing a train is not evidence there isn't one.",
    "difficulty": 1
  },
  {
    "id": "fsg_blue_vs_red",
    "categoryId": "signs",
    "front": "Blue disc versus red ring — what is the difference?",
    "back": "A blue disc commands (you must). A red ring prohibits (you may not). Same number in each means opposite things: red ring = maximum speed, blue disc = minimum speed.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_rules_learner_validity",
    "categoryId": "rules",
    "front": "How long is a learner's licence valid?",
    "back": "A learner's licence is valid for 24 months. If it expires before you pass your driving test, you must apply and test again.",
    "difficulty": 1
  },
  {
    "id": "fc5_signal_early",
    "categoryId": "rules",
    "front": "When to signal?",
    "back": "In good time BEFORE the manoeuvre — others must see, understand and react first.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_rules_freeway_stop",
    "categoryId": "rules",
    "front": "Stopping on a freeway is:",
    "back": "Prohibited except in an emergency or a designated stopping area — You may not stop on a freeway except for an emergency or in a designated stopping area. Pedestrians, animals and pedal cycles are also not allowed on freeways.",
    "difficulty": 2
  },
  {
    "id": "fmr_seatbelt_rules",
    "categoryId": "rules",
    "front": "The seat-belt rules beyond 'wear one'.",
    "back": "Exception while reversing or parking · a child under 14 sits in the back unless taller than 1,5 m · infants under 3 need an appropriate restraint (not in public transport) · an adult may not take a beltless seat while a belted one is free · fitted belts must work.",
    "difficulty": 3
  },
  {
    "id": "fc2_officer",
    "categoryId": "rules",
    "front": "Officer's signal vs red robot?",
    "back": "The traffic officer overrides robots and signs — obey the officer.",
    "difficulty": 1
  },
  {
    "id": "fc2_ped_freeway",
    "categoryId": "rules",
    "front": "Pedestrians on freeways?",
    "back": "Prohibited — but stay alert, people do walk there illegally.",
    "difficulty": 1
  },
  {
    "id": "fca_start_date",
    "categoryId": "rules",
    "front": "Where should you verify current AARTO demerit-point rollout dates?",
    "back": "Use the latest official Department of Transport or South African Government notice because rollout dates can change.",
    "difficulty": 1
  },
  {
    "id": "fca_learner_threshold",
    "categoryId": "rules",
    "front": "Learner driver's demerit-point threshold?",
    "back": "6 points — stricter than the 15 allowed for a fully licensed driver.",
    "difficulty": 2
  },
  {
    "id": "fcd_qx_ctrl_seatbelt_before_start",
    "categoryId": "controls",
    "front": "In the cockpit routine, your seatbelt should be fastened:",
    "back": "After the seat, head restraint and mirrors are set, and before you move off — Set the seat first — the belt only sits correctly once you are in your final driving position. Then belt up, and only then move off.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_ctrl_footbrake",
    "categoryId": "controls",
    "front": "When using the foot (service) brake, you should:",
    "back": "Brake smoothly and progressively with the right foot, ideally on a straight course, without locking the wheels, while keeping both hands on the steering wheel for control.",
    "difficulty": 2
  },
  {
    "id": "fc8_hands_on",
    "categoryId": "controls",
    "front": "Hands while driving?",
    "back": "Both on the wheel except briefly to change gear or use a control.",
    "difficulty": 1
  },
  {
    "id": "fcd_q2_ctrl_headrest",
    "categoryId": "controls",
    "front": "The correct headrest position is:",
    "back": "Top of the headrest about level with the top of your head, close to it — A properly set headrest catches your head in a rear-end crash and prevents whiplash. Too low and your neck bends over it.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_ctrl_clutch_control",
    "categoryId": "controls",
    "front": "'Clutch control' (finding the biting point) means:",
    "back": "The biting point is where the clutch just starts to transmit power and the vehicle neither rolls forward nor back. It is essential for smooth hill starts and slow manoeuvres.",
    "difficulty": 2
  },
  {
    "id": "fc8_ride_clutch",
    "categoryId": "controls",
    "front": "Riding the clutch — why bad?",
    "back": "Wears it out and cuts your control. Foot off except to change gear or move off/stop.",
    "difficulty": 2
  },
  {
    "id": "fc2_dry_steer",
    "categoryId": "controls",
    "front": "'Dry steering'?",
    "back": "Turning the wheel while stationary — strains the steering and scrubs tyres. Steer while creeping.",
    "difficulty": 3
  },
  {
    "id": "fc_accelerator",
    "categoryId": "controls",
    "front": "Function of the accelerator?",
    "back": "Controls engine power to increase or ease the vehicle's speed.",
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
    "id": "fc_box_clear",
    "categoryId": "intersections",
    "front": "Green light but the intersection is blocked?",
    "back": "Wait behind the line — never enter an intersection you can't clear.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_int_4way_same_time",
    "categoryId": "intersections",
    "front": "Two vehicles reach a four-way stop at exactly the same time, side by side. Who goes first?",
    "back": "The vehicle on the right — When vehicles stop simultaneously, the one on the right has right of way and the driver on the left should yield.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_int_multilane_circle",
    "categoryId": "intersections",
    "front": "Approaching a multi-lane traffic circle, which lane should you choose?",
    "back": "Choose your lane before entering: generally left lane for left/straight, right lane for right/full circle, following the painted arrows — and don't change lanes inside the circle.",
    "difficulty": 2
  },
  {
    "id": "fc11_int_slipway",
    "categoryId": "intersections",
    "front": "Joining a road via a slip lane?",
    "back": "Give way to traffic already on the road you're joining; merge only into a safe gap.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_int_ped_crossing",
    "categoryId": "intersections",
    "front": "You are turning at an intersection and pedestrians are crossing the road you are entering. You must:",
    "back": "Give way to the pedestrians and let them finish crossing — Turning traffic must give way to pedestrians already crossing the road being entered. Wait for them to clear before completing the turn.",
    "difficulty": 2
  },
  {
    "id": "fc3_int_blocked_box",
    "categoryId": "intersections",
    "front": "Green light, blocked intersection?",
    "back": "Wait behind the line until your exit is clear — never trap yourself in the box.",
    "difficulty": 2
  },
  {
    "id": "fc11_haz_low_sun",
    "categoryId": "hazard_awareness",
    "front": "Driving into low, blinding sun?",
    "back": "Slow down, use the sun visor and increase your following distance.",
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
    "id": "fcd_q_haz_aquaplane",
    "categoryId": "hazard_awareness",
    "front": "If your vehicle begins to aquaplane (skim on water), you should:",
    "back": "During aquaplaning the tyres lose contact with the road. Avoid sudden braking or steering — gently lift off the accelerator and keep the wheel steady until the tyres regain grip.",
    "difficulty": 3
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
    "id": "fc9_door",
    "categoryId": "parking",
    "front": "Before opening your door?",
    "back": "Check mirror + over your shoulder for cyclists ('dooring' is an offence).",
    "difficulty": 1
  },
  {
    "id": "fc_park_intersection",
    "categoryId": "parking",
    "front": "How close to an intersection may you park?",
    "back": "No closer than 5 metres.",
    "difficulty": 3
  },
  {
    "id": "fc2_park_kerb",
    "categoryId": "parking",
    "front": "Parallel-park distance from the kerb?",
    "back": "Close and parallel — within about 450 mm, wheels straight.",
    "difficulty": 2
  },
  {
    "id": "fc_park_uphill",
    "categoryId": "parking",
    "front": "Parking facing uphill — wheels?",
    "back": "Turn front wheels away from the kerb so a roll-back is caught; handbrake on, in gear.",
    "difficulty": 3
  },
  {
    "id": "fcd_q2_park_double",
    "categoryId": "parking",
    "front": "'Double parking' (stopping in the traffic lane next to a parked car) is:",
    "back": "Prohibited — you're obstructing a traffic lane — Hazard lights don't legalise obstruction. Stopping beside a parked vehicle blocks the lane and hides pedestrians stepping out.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_fd_measure",
    "categoryId": "following_distance",
    "front": "How do you check your following distance with the two-second rule?",
    "back": "Pick a fixed point; you should reach it at least two seconds after the car ahead — Choose a fixed object ahead. When the vehicle in front passes it, start counting — you should not reach the same point in under two seconds.",
    "difficulty": 2
  },
  {
    "id": "fc11_fd_following_bike",
    "categoryId": "following_distance",
    "front": "Following a motorcycle?",
    "back": "Keep at least the normal 2 seconds, more in the wet — bikes can stop fast and may fall in a slide.",
    "difficulty": 2
  },
  {
    "id": "fc9_new_driver",
    "categoryId": "following_distance",
    "front": "Following distance as a new driver?",
    "back": "At least the full 2 seconds (more in poor conditions) — reactions aren't practised yet.",
    "difficulty": 1
  },
  {
    "id": "fc2_gravel_gap",
    "categoryId": "following_distance",
    "front": "Following distance on gravel?",
    "back": "At least double — braking takes far longer and dust hides brake lights. Stay out of the dust cloud.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_fd_truck",
    "categoryId": "following_distance",
    "front": "Following a heavy goods vehicle, the recommended safe gap is roughly:",
    "back": "Larger — around six seconds — because it blocks your view and needs more room to stop — A heavy vehicle blocks your view and needs more distance to stop, so keep a larger gap — about six seconds — and pull back so you can see past it.",
    "difficulty": 2
  }
];

/** Scenarios are a paid feature (PlanLimits.scenarios is false on free). */
export const STARTER_SCENARIOS: Scenario[] = [];
