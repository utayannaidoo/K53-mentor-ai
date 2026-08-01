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
    "id": "gen-sign-warning-030-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Hazard ahead. Slow down and approach with caution.",
      "Marked pedestrian crossing ahead.",
      "Steep uphill ahead. You may not cross a No Overtaking line to overtake a slow moving vehicle.",
      "Road ahead narrows from one side."
    ],
    "correctIndex": 0,
    "explanation": "This warning sign: Hazard ahead. Slow down and approach with caution.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-030-04.png"
  },
  {
    "id": "gen-sign-regulatory-020-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Speed limit of 60km/h applies to motorcycles only.",
      "To indicate that road users must drive to the side of an obstruction where the sign is displayed.",
      "No over taking vehicles by goods vehicles for the next 500m.",
      "The maximum speed, in km/h, at which you may drive past this sign."
    ],
    "correctIndex": 0,
    "explanation": "This regulatory sign: Speed limit of 60km/h applies to motorcycles only.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-020-04.png"
  },
  {
    "id": "gen-sign-warning-031-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Height restriction ahead (temporary)",
      "Width restriction ahead (temporary)",
      "Loose stones ahead (temporary)",
      "Uneven road ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Height restriction ahead (temporary)\". Vehicle height regulatory restriction ahead (temporary version).",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-031-06.png"
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
    "id": "gen-sign-regulatory-014-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Parking for the class shown",
      "Bus lane reservation",
      "Parking for police vehicles",
      "Parking for people with disabilities"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Parking for the class shown\". This area is reserved for parking by the class of vehicle shown.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-014-02.png"
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
    "id": "gen-sign-regulatory-006-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Yield",
      "Pedestrian crossing (yield)",
      "No right turn",
      "End of residential area"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Yield\". Give way to all cross-traffic and to pedestrians crossing or about to cross. You need not stop if the way is clear, but must be ready to.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-006-02.png"
  },
  {
    "id": "qs3_staggered_junctions",
    "categoryId": "signs",
    "image": "/signs/warning/warning-035-07.png",
    "prompt": "A warning sign showing staggered junctions means:",
    "options": [
      "Two side roads join close together but not opposite each other — overtaking here is unwise",
      "The road ahead splits into two carriageways",
      "There is a crossroad where all four arms meet",
      "The road ahead zigzags sharply"
    ],
    "correctIndex": 0,
    "explanation": "Staggered junctions produce turning traffic from both sides within a short stretch, and a vehicle waiting in one can hide another. It is a poor place to be overtaking.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-013-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Temporary lane reservation",
      "Parking for the class shown",
      "Bus lane reservation",
      "Reserved stop zone"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Temporary lane reservation\". This portion of roadway is temporarily reserved for the exclusive use of the class of vehicle indicated.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-013-07.png"
  },
  {
    "id": "gen-sign-warning-028-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Temporary uneven, potholed, or bumpy road surface ahead.",
      "Road width regulatory restriction ahead (temporary version).",
      "Soft shoulder at road's edge ahead (temporary version).",
      "Vehicle length regulatory restriction ahead (temporary version)."
    ],
    "correctIndex": 0,
    "explanation": "Uneven road ahead: Temporary uneven, potholed, or bumpy road surface ahead.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-028-03.png"
  },
  {
    "id": "qs4_advance_vs_junction",
    "categoryId": "signs",
    "prompt": "Direction signs usually appear twice — well before a junction and again at it. The advance sign exists so that you can:",
    "options": [
      "Change lanes and adjust speed in good time, rather than deciding at the junction itself",
      "Confirm the distance you have already travelled",
      "Check whether the junction is open",
      "Read the destinations more comfortably at speed"
    ],
    "correctIndex": 0,
    "explanation": "The dangerous manoeuvre is the late one: braking hard or crossing lanes at the exit. Advance signing exists to move that decision back to where it is safe.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-022-01-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Traffic signal — red",
      "Parking for authorised vehicles",
      "Reserved stop zone",
      "End of dual-carriage freeway"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Traffic signal — red\". Steady red: stop and wait.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-022-01.png"
  },
  {
    "id": "q4_sign_derestriction",
    "categoryId": "signs",
    "prompt": "A prohibition sign shown with a diagonal band through the symbol usually indicates:",
    "options": [
      "The prohibition is about to start",
      "The end of that restriction",
      "The restriction applies twice as strongly",
      "The sign is out of order"
    ],
    "correctIndex": 1,
    "explanation": "De-restriction signs repeat the symbol with a crossing band to signal where the restriction ends — e.g. the end of a no-overtaking stretch.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-014-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Parking here is reserved for a vehicle carrying people with disabilities.",
      "The lane on the right of the yellow line is reserved for the exclusive use of the class of vehicle indicated.",
      "The lane on the left of the yellow line is reserved for the exclusive use of authorized public transport vehicles.",
      "This area is reserved for parking by authorized vehicles."
    ],
    "correctIndex": 0,
    "explanation": "Parking for people with disabilities: Parking here is reserved for a vehicle carrying people with disabilities.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-014-03.png"
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
    "id": "qs2_width_limit",
    "categoryId": "signs",
    "prompt": "A red-bordered round sign showing a width in metres between two arrows prohibits:",
    "options": [
      "Vehicles wider than that measurement, including their load",
      "Vehicles carrying abnormal loads of any size",
      "Two vehicles passing each other at that point",
      "Trailers of any width"
    ],
    "correctIndex": 0,
    "explanation": "The limit is the widest point of the vehicle *and* whatever it is carrying — a load that overhangs the body counts.",
    "difficulty": 2,
    "scope": "learners"
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
    "id": "qs3_end_mass_restriction",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-017-03.png",
    "prompt": "This sign repeats a mass restriction with a band struck through it. It means:",
    "options": [
      "The mass restriction no longer applies from this point",
      "The restriction now applies more strictly",
      "The restriction applies only to goods vehicles",
      "A weighbridge is ahead"
    ],
    "correctIndex": 0,
    "explanation": "A struck-through repeat cancels the restriction it shows. Until you pass it, the original limit is still in force however far you have driven.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-017-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "End of headlights-on requirement",
      "End of residential area",
      "End of lane reservation",
      "End of single-carriage freeway"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"End of headlights-on requirement\". You no longer need to drive with your headlights switched on.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-017-02.png"
  },
  {
    "id": "gen-sign-regulatory-012-05-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "To prohibit motorcycles on a part of a carriageway for safety reasons.",
      "To prohibit hawkers in this area during any time of the day or night.",
      "To prohibit vehicles from turning around (u-turn) so that it faces the opposite direction.",
      "To prohibit pedestrians and stationary vehicles."
    ],
    "correctIndex": 0,
    "explanation": "No motorcycles: To prohibit motorcycles on a part of a carriageway for safety reasons.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-012-05.png"
  },
  {
    "id": "gen-sign-warning-040-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Railway crossing",
      "Crosswinds ahead",
      "Danger plate — pass this side",
      "Priority crossroad ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Railway crossing\". Railway crossing. Extra lower plate indicates two or more railway lines.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/warning/warning-040-07.png"
  },
  {
    "id": "gen-sign-information-044-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Modal transfer. At this point you can change your mode of transport, e.",
      "Temporary high speed exit countdown sign.",
      "Information centre where you can obtain information about the local area, directions and so on.",
      "Priority road. The road you are travelling on has priority at the junction ahead."
    ],
    "correctIndex": 0,
    "explanation": "Modal transfer point: Modal transfer. At this point you can change your mode of transport, e.g. from car to train or from train to bus.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/information/information-044-03.png"
  },
  {
    "id": "gen-sign-warning-027-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Steep descent ahead",
      "Cyclists ahead",
      "Road narrows at a bridge",
      "Priority road with crossroad ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Steep descent ahead\". Steep downhill ahead. Change to a lower gear if necessary.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/warning/warning-027-04.png"
  },
  {
    "id": "q2_sign_rumble_strips",
    "categoryId": "signs",
    "prompt": "You feel and hear rumble strips under your tyres. They are there to:",
    "options": [
      "Test your suspension",
      "Alert you — usually to slow down for a hazard, tollgate or stop ahead",
      "Mark the edge of a parking area",
      "Indicate a minimum speed"
    ],
    "correctIndex": 1,
    "explanation": "Rumble strips wake up drowsy or distracted drivers ahead of something important — reduce speed and look for the reason.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-007-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "The area is set aside for pedestrians.",
      "No over taking vehicles by goods vehicles for the next 500m.",
      "Overtaking other vehicles is prohibited until you pass the sign that ends the restriction.",
      "To prohibit vehicles from turning right."
    ],
    "correctIndex": 0,
    "explanation": "Pedestrian priority: The area is set aside for pedestrians. Vehicles may enter only to load/offload or for an emergency, must yield to pedestrians, and may not exceed 15 km/h.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-007-04.png"
  },
  {
    "id": "gen-sign-regulatory-012-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Overtaking other vehicles is prohibited until you pass the sign that ends the restriction.",
      "To prohibit noise, if the noise level of your vehicle is high, you may not proceed past the sign.",
      "To prohibit pedestrians from proceeding past this sign where they could cause danger to themselves and vehicles.",
      "To prohibit hawkers in this area during any time of the day or night."
    ],
    "correctIndex": 0,
    "explanation": "No overtaking: Overtaking other vehicles is prohibited until you pass the sign that ends the restriction.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-012-01.png"
  },
  {
    "id": "gen-sign-warning-029-06-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Reduced visibility can be expected ahead (e.",
      "Vehicle height regulatory restriction ahead.",
      "Water crosses the road at a drift ahead.",
      "Motor gate ahead with cattle grid."
    ],
    "correctIndex": 0,
    "explanation": "Reduced visibility ahead: Reduced visibility can be expected ahead (e.g. frequent mist).",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-029-06.png"
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
    "id": "gen-sign-regulatory-017-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "End of single-carriage freeway",
      "End of headlights-on requirement",
      "End of dual-carriage freeway",
      "End of lane reservation"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"End of single-carriage freeway\". End of single carriage freeway and freeway rules no longer apply.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-017-06.png"
  },
  {
    "id": "gen-sign-regulatory-012-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No pedestrians",
      "No parking",
      "No motorcycles",
      "No left turn"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"No pedestrians\". To prohibit pedestrians from proceeding past this sign where they could cause danger to themselves and vehicles.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-012-07.png"
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
    "id": "gen-sign-warning-031-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Road width regulatory restriction ahead (temporary version).",
      "Temporary uneven, potholed, or bumpy road surface ahead.",
      "Surface step in the road surface ahead (temporary version).",
      "Vehicle length regulatory restriction ahead (temporary version)."
    ],
    "correctIndex": 0,
    "explanation": "Width restriction ahead (temporary): Road width regulatory restriction ahead (temporary version).",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-031-04.png"
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
    "id": "qs4_signal_out_of_order",
    "categoryId": "signs",
    "prompt": "You approach an intersection where the traffic signals are completely dead. You must treat it as:",
    "options": [
      "A four-way stop — stop, then proceed in order of arrival",
      "An intersection where the busier road has priority",
      "An uncontrolled intersection where the right-hand rule alone applies",
      "An intersection you may cross without stopping if it looks clear"
    ],
    "correctIndex": 0,
    "explanation": "A dead robot becomes a four-way stop by default. It works only if every driver does the same thing, which is why the rule is a stop rather than a judgement call.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-037-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Marked pedestrian crossing ahead.",
      "Priority road with secondary crossroad ahead.",
      "Slippery road ahead, especially when wet.",
      "Road narrows at a bridge ahead."
    ],
    "correctIndex": 0,
    "explanation": "Pedestrian crossing ahead: Marked pedestrian crossing ahead.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/warning/warning-037-01.png"
  },
  {
    "id": "gen-sign-regulatory-007-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "This is a manually operated sign, with the word STOP on one side and GO on the other.",
      "Come to a complete stop behind the stop line every time — even if the road is empty — then move off only when it is safe.",
      "To prohibit vehicles from turning left at an intersection.",
      "This area is reserved for parking by authorized vehicles."
    ],
    "correctIndex": 0,
    "explanation": "Stop / Go (manually operated): This is a manually operated sign, with the word STOP on one side and GO on the other. Stop when necessary and proceed cautiously when GO is displayed.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-007-01.png"
  },
  {
    "id": "q_sign_stop",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-006-01.png",
    "prompt": "You approach this sign. What are you legally required to do?",
    "options": [
      "Slow down and proceed only if the way looks clear",
      "Come to a complete stop behind the stop line, then proceed when safe",
      "Stop only if other vehicles are present",
      "Give way to traffic approaching from the left only"
    ],
    "correctIndex": 1,
    "explanation": "A stop sign requires a full stop behind the stop line — wheels no longer turning — every time, even if the road is empty. You may only move off once it is safe.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qs4_pedestrian_signal_meaning",
    "categoryId": "signs",
    "prompt": "A steady red figure on a pedestrian signal instructs pedestrians not to cross. For a driver it signals that:",
    "options": [
      "Pedestrians should be stationary — but someone already crossing still has priority to finish",
      "The crossing is closed and may be driven over freely",
      "Pedestrians have been given a green phase",
      "The signal is faulty"
    ],
    "correctIndex": 0,
    "explanation": "The signal governs when people may start. Anyone already in the road when it changed is still entitled to complete the crossing, and drivers must let them.",
    "difficulty": 2,
    "scope": "learners"
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
    "id": "qs2_restriction_until_cancelled",
    "categoryId": "signs",
    "prompt": "You pass a sign restricting overtaking. In the absence of any further signs, that restriction applies:",
    "options": [
      "Until a sign cancels it or the road situation it governs clearly ends",
      "For exactly one kilometre",
      "Only while you can still see the sign in your mirror",
      "Only until the next intersection"
    ],
    "correctIndex": 0,
    "explanation": "Restrictions run until cancelled. Assuming one has quietly lapsed because you have driven a while is how drivers end up overtaking on the approach to the hazard it was protecting.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-010-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "To indicate that the road or part of it is set aside for use by buses and minibuses only.",
      "The maximum speed, in km/h, at which you may drive past this sign.",
      "To indicate that road users must drive to the side of an obstruction where the sign is displayed.",
      "Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow."
    ],
    "correctIndex": 0,
    "explanation": "Buses and minibuses only: To indicate that the road or part of it is set aside for use by buses and minibuses only.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-010-02.png"
  },
  {
    "id": "q_sign_reg_shape",
    "categoryId": "signs",
    "prompt": "Round signs with a red border give you:",
    "options": [
      "A warning of a hazard ahead",
      "A regulatory order you must obey",
      "Tourist information",
      "Directions to a town"
    ],
    "correctIndex": 1,
    "explanation": "Round, red-bordered signs are regulatory — they give an order you must obey, such as speed limits, no entry or no overtaking.",
    "difficulty": 1,
    "scope": "learners"
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
    "id": "gen-sign-regulatory-011-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No right turn at intersection",
      "No overtaking by goods vehicles",
      "No motorcycles",
      "No left turn at intersection"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"No right turn at intersection\". To prohibit vehicles from turning right at an intersection.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-011-04.png"
  },
  {
    "id": "gen-sign-warning-028-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Speed humps ahead. Slow down and obey any speed limit sign.",
      "Hazard ahead. Slow down and approach with caution.",
      "Jetty edge or river bank ahead, close to the road.",
      "General warning sign, usually with an explanatory plate beneath it."
    ],
    "correctIndex": 0,
    "explanation": "Speed humps ahead: Speed humps ahead. Slow down and obey any speed limit sign.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-028-04.png"
  },
  {
    "id": "gen-sign-warning-029-05-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Drift ahead",
      "Tunnel ahead",
      "Cyclists ahead",
      "Steep descent ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Drift ahead\". Water crosses the road at a drift ahead. Go very slowly and test the brakes afterwards.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-029-05.png"
  },
  {
    "id": "gen-sign-regulatory-009-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "The maximum speed, in km/h, at which you may drive past this sign.",
      "To indicate that the road or part of it is set aside for use by goods vehicles only.",
      "To give drivers an opportunity to follow an alternate route or proceed on the route and pay toll fees.",
      "Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow."
    ],
    "correctIndex": 0,
    "explanation": "Speed limit: The maximum speed, in km/h, at which you may drive past this sign. Exceeding it is an offence.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-009-03.png"
  },
  {
    "id": "gen-sign-warning-029-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Narrow structure ahead",
      "Children ahead",
      "Slow-moving vehicles ahead",
      "Cattle grid ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Narrow structure ahead\". Structure ahead that is less than 5m wide, e.g. bridge.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-029-07.png"
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
    "id": "q6_temp_speed_zone",
    "categoryId": "signs",
    "prompt": "A temporary 40 km/h sign stands at roadworks on a normally 120 km/h freeway. You should:",
    "options": [
      "Keep to 120 until you see workers",
      "Slow to 40 km/h for the length of the works — the temporary limit applies",
      "Average the two limits",
      "Follow the car ahead's speed"
    ],
    "correctIndex": 1,
    "explanation": "The temporary limit replaces the normal one through the works, protecting workers and coping with narrowed, uneven lanes. It's enforced, often by camera.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_sign_brown_tourism",
    "categoryId": "signs",
    "prompt": "A brown road sign with white lettering indicates:",
    "options": [
      "A gravel road ahead",
      "A tourist attraction or place of interest",
      "A rest area for trucks only",
      "A prohibited area"
    ],
    "correctIndex": 1,
    "explanation": "Brown signs are tourism guidance signs — game reserves, wine routes, monuments and similar destinations.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qs2_no_through_road",
    "categoryId": "signs",
    "prompt": "A sign showing a road with a red bar across its far end tells you that:",
    "options": [
      "The road has no through route — you will have to come back the same way",
      "The road is closed to all traffic",
      "The road ahead is a private road",
      "There is a barrier or boom across the road"
    ],
    "correctIndex": 0,
    "explanation": "It marks a cul-de-sac. Useful to spot early, because turning a car — let alone a vehicle with a trailer — at the closed end is often the hard part.",
    "difficulty": 1,
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
    "id": "gen-sign-warning-027-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Tunnel ahead. Switch your headlights on and don't overtake.",
      "General warning sign, usually with an explanatory plate beneath it.",
      "Marked pedestrian crossing ahead.",
      "Steep uphill ahead. You may not cross a No Overtaking line to overtake a slow moving vehicle."
    ],
    "correctIndex": 0,
    "explanation": "Tunnel ahead: Tunnel ahead. Switch your headlights on and don't overtake.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-027-03.png"
  },
  {
    "id": "q2_rules_tow_rope_speed",
    "categoryId": "rules",
    "prompt": "What is the maximum speed when towing another vehicle with a rope?",
    "options": [
      "60 km/h",
      "30 km/h",
      "80 km/h",
      "45 km/h"
    ],
    "correctIndex": 1,
    "explanation": "With a tow rope or chain the limit is 30 km/h. Only a proper drawbar or tow-bar coupling allows normal (higher) towing speeds.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "aarto_q_why_learners_care",
    "categoryId": "rules",
    "prompt": "Why should a learner driver care about AARTO demerit points?",
    "options": [
      "Learners can incur infringements too, and their 6-point threshold is reached quickly",
      "Points only ever apply to truck drivers",
      "Learners are completely exempt from AARTO",
      "Points only matter after you turn 25"
    ],
    "correctIndex": 0,
    "explanation": "A learner on the road can still be fined, and with only a 6-point buffer a single serious infringement can put their licence at risk.",
    "difficulty": 2,
    "scope": "learners",
    "source": "AARTO Act 46 of 1998 & the published demerit-point schedule"
  },
  {
    "id": "qr3_stationary_bus",
    "categoryId": "rules",
    "prompt": "Passing a bus or minibus stopped at the roadside to set down passengers, you should:",
    "options": [
      "Slow right down and watch for people stepping out from in front of and behind it",
      "Maintain speed, since passengers must wait for traffic",
      "Sound your hooter and pass close to save time",
      "Overtake on the left where there is space"
    ],
    "correctIndex": 0,
    "explanation": "A stopped bus hides the people it just dropped off, and they often cross immediately, in front of or behind it. It is one of the most predictable pedestrian hazards on any road.",
    "difficulty": 2,
    "scope": "learners"
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
    "id": "qr4_solid_line_crossing",
    "categoryId": "rules",
    "prompt": "You need to enter a driveway that lies across a solid white centre line. You:",
    "options": [
      "May cross it only so far as is necessary to reach the entrance, and only when it is safe",
      "May never cross a solid line for any reason",
      "May cross it freely, since a driveway is not overtaking",
      "Must drive on to a gap in the line and make a U-turn"
    ],
    "correctIndex": 0,
    "explanation": "The barrier line exists to stop overtaking and cross-traffic conflict, not to seal off every property along the road. Access is the recognised exception, and it is still subject to safety.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr5_horse_rider",
    "categoryId": "rules",
    "prompt": "Passing a horse and rider on a rural road, you should:",
    "options": [
      "Slow right down, pass wide, and avoid sudden noise — a startled horse can move into your path instantly",
      "Pass normally, since the rider is in control",
      "Sound your hooter first so the rider knows you are there",
      "Pass close and quickly to minimise the time alongside"
    ],
    "correctIndex": 0,
    "explanation": "A horse reacts to noise and movement regardless of what the rider wants. Space and quiet are the only things that make the pass predictable.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_funeral_procession",
    "categoryId": "rules",
    "prompt": "You meet a funeral procession or a marked convoy travelling together. The courteous and safe approach is to:",
    "options": [
      "Avoid cutting into the middle of it, and wait rather than force a gap",
      "Overtake the whole procession at speed to clear it quickly",
      "Join the procession to move through traffic faster",
      "Sound your hooter to ask them to make way"
    ],
    "correctIndex": 0,
    "explanation": "Splitting a convoy strands its drivers, who are watching the vehicle ahead rather than the traffic. Ordinary road rules still apply to them and to you.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_rules_tread",
    "categoryId": "rules",
    "prompt": "The minimum legal tyre tread depth is:",
    "options": [
      "1 mm across the tread",
      "3 mm",
      "Smooth tyres are legal",
      "5 mm"
    ],
    "correctIndex": 0,
    "explanation": "A tyre is illegal once the tread is less than 1 mm deep across the full width and circumference. Worn tyres greatly increase stopping distance, especially in the wet.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_roadworthy_purpose",
    "categoryId": "rules",
    "prompt": "A roadworthy certificate certifies that:",
    "options": [
      "The vehicle met the required safety standards when it was examined — it is not a guarantee for the future",
      "The vehicle will remain safe for the life of the certificate",
      "The vehicle's licence fees have been paid",
      "The owner is insured"
    ],
    "correctIndex": 0,
    "explanation": "It is a snapshot. Brakes, tyres and lights all deteriorate afterwards, which is why the driver's own duty to keep the vehicle in a safe condition never transfers to the certificate.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_learner_supervision",
    "categoryId": "rules",
    "prompt": "A learner driver on a public road must be:",
    "options": [
      "Accompanied by a person with a valid licence for that class of vehicle, seated where they can assist",
      "Accompanied only when driving at night",
      "Accompanied by any adult passenger",
      "Alone, so that the examiner can assess them fairly"
    ],
    "correctIndex": 0,
    "explanation": "The supervisor is there to intervene, so they must both hold the right licence and be in a position to help. A licensed passenger asleep in the back is not supervision.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_rule_learner_supervision",
    "categoryId": "rules",
    "prompt": "Driving on a learner's licence, you must:",
    "options": [
      "Drive alone until you're confident",
      "Be accompanied by (and under the supervision of) a licensed driver seated in the vehicle",
      "Only drive after dark when roads are quiet",
      "Display L-plates but may drive alone"
    ],
    "correctIndex": 1,
    "explanation": "A learner may only drive with a validly licensed driver supervising from inside the vehicle — driving alone on a learner's is an offence.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q5_rule_coasting",
    "categoryId": "rules",
    "prompt": "Coasting downhill in neutral (or clutch in) is:",
    "options": [
      "Smart fuel-saving",
      "Prohibited — you lose engine braking and full control of the vehicle",
      "Allowed below 60 km/h",
      "Required for automatic vehicles"
    ],
    "correctIndex": 1,
    "explanation": "Freewheeling removes engine braking exactly where you need it and delays your response. It's an offence, not an economy technique.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_rules_lights_on",
    "categoryId": "rules",
    "prompt": "Your headlamps, rear lamps and number-plate lamp must be lit:",
    "options": [
      "Only when it is fully dark",
      "Between sunset and sunrise, or whenever you cannot clearly see persons or vehicles 150 m ahead",
      "Only on freeways",
      "Only when other cars have theirs on"
    ],
    "correctIndex": 1,
    "explanation": "Lights must be on between sunset and sunrise, and at any time visibility drops so you cannot clearly see a person or vehicle 150 m away (for example in fog or heavy rain).",
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
    "id": "q2_rules_learner_validity",
    "categoryId": "rules",
    "prompt": "How long is a learner's licence valid?",
    "options": [
      "6 months",
      "24 months",
      "5 years",
      "It never expires"
    ],
    "correctIndex": 1,
    "explanation": "A learner's licence is valid for 24 months. If it expires before you pass your driving test, you must apply and test again.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_rules_beam_reach",
    "categoryId": "rules",
    "prompt": "Roughly how far must your headlamp beams illuminate the road?",
    "options": [
      "Main beam 100 m; dipped beam 45 m",
      "Main beam 45 m; dipped beam 100 m",
      "Both beams 200 m",
      "Main beam 30 m; dipped beam 10 m"
    ],
    "correctIndex": 0,
    "explanation": "Main beam must light objects at least 100 m ahead, dipped beam at least 45 m. That's also why overdriving your lights at night is so dangerous.",
    "difficulty": 3,
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
    "id": "qr3_plates_legible",
    "categoryId": "rules",
    "prompt": "Your number plates must be:",
    "options": [
      "Fitted as required and kept legible — obscured or damaged plates are an offence",
      "Legible only at the rear of the vehicle",
      "Cleaned only before a roadworthy test",
      "Visible only when the vehicle is stationary"
    ],
    "correctIndex": 0,
    "explanation": "The plate is how the vehicle is identified after an incident. Mud, a tow bar, a bicycle rack or a cracked plate all defeat that, and all of them are the driver's responsibility.",
    "difficulty": 1,
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
    "id": "q2_rules_livestock",
    "categoryId": "rules",
    "prompt": "You come across cattle being herded across a rural road. You should:",
    "options": [
      "Hoot repeatedly to scatter them",
      "Slow right down or stop, and pass slowly on the herder's signal — animals are unpredictable",
      "Drive through the gap at normal speed",
      "Flash your headlights and keep your speed up"
    ],
    "correctIndex": 1,
    "explanation": "Hooting can panic animals into your path. Slow down, be patient and pass wide and slow when it's clearly safe.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr2_yield_to_pedestrian_turning",
    "categoryId": "rules",
    "prompt": "You are turning into a side road and a pedestrian has already started crossing it. You must:",
    "options": [
      "Give way and let them finish crossing",
      "Proceed, because the pedestrian should have waited for traffic",
      "Sound your hooter to warn them and continue turning",
      "Give way only if they are on a marked crossing"
    ],
    "correctIndex": 0,
    "explanation": "A pedestrian already in the roadway you are turning into has committed to the crossing. Turning across them is both dangerous and an offence.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q5_rule_infant_restraint",
    "categoryId": "rules",
    "prompt": "An infant travelling in a private car must:",
    "options": [
      "Be held firmly by an adult",
      "Travel in an appropriate child restraint (car seat)",
      "Lie on the back seat",
      "Sit on the front passenger's lap with the belt around both"
    ],
    "correctIndex": 1,
    "explanation": "The law requires an appropriate child restraint for infants. In a 60 km/h crash a held baby effectively weighs hundreds of kilograms — no arms can hold that.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_rule_learner_age",
    "categoryId": "rules",
    "prompt": "The minimum age to obtain a learner's licence for a light motor vehicle (Code 8) is:",
    "options": [
      "16",
      "17",
      "18",
      "21"
    ],
    "correctIndex": 1,
    "explanation": "You can hold a Code 8 learner's licence from 17, and a full light-vehicle driving licence from 18.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr4_aarto_points_mechanic",
    "categoryId": "rules",
    "prompt": "Under the AARTO demerit system, points are recorded against:",
    "options": [
      "The driver's own record, so they follow you between vehicles",
      "The vehicle, so selling it clears them",
      "The registered owner only, whoever was driving",
      "The employer, where the vehicle is a company car"
    ],
    "correctIndex": 0,
    "explanation": "The system targets driver behaviour, so the points travel with the person. Changing cars or job does not reset them.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_rules_cellphone",
    "categoryId": "rules",
    "prompt": "Using a cellphone while driving is:",
    "options": [
      "Allowed if you hold it to your ear",
      "Only allowed with a hands-free kit or headset",
      "Allowed at traffic lights",
      "Always allowed"
    ],
    "correctIndex": 1,
    "explanation": "You may not hold a cellphone or two-way radio while driving — you must use a hands-free kit or headset so both hands stay on the wheel.",
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
    "id": "qr5_litter_from_vehicle",
    "categoryId": "rules",
    "prompt": "Throwing litter, a cigarette or any object from a moving vehicle is:",
    "options": [
      "An offence, and a hazard — objects can strike following vehicles or start a veld fire",
      "Acceptable if the item is biodegradable",
      "Only an offence in a national park",
      "Acceptable outside urban areas"
    ],
    "correctIndex": 0,
    "explanation": "A discarded cigarette in dry grass is a standard cause of roadside fires, and anything thrown from a car arrives at the vehicle behind at combined speed.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr3_collision_duty",
    "categoryId": "rules",
    "prompt": "After a collision in which someone is injured, the driver must:",
    "options": [
      "Stop, render what assistance they can, and give their particulars",
      "Move the vehicles and continue if the damage looks minor",
      "Wait only if the other driver asks them to",
      "Leave the scene and report it at a police station later that week"
    ],
    "correctIndex": 0,
    "explanation": "Stopping is not optional, and neither is identifying yourself. Leaving the scene of an injury collision is a serious offence quite apart from any fault for the crash itself.",
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
    "id": "qc5_child_seat_rear",
    "categoryId": "controls",
    "prompt": "A rear-facing child seat must never be fitted:",
    "options": [
      "In a front seat with an active airbag in front of it",
      "In the back seat of any vehicle",
      "In a vehicle with ABS",
      "Behind the driver"
    ],
    "correctIndex": 0,
    "explanation": "An airbag deploys with enormous force into exactly where the child's head is. If the seat must go in front, the airbag has to be deactivated first.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_auto_selector_stationary",
    "categoryId": "controls",
    "prompt": "In an automatic vehicle, you should select Park or Reverse only when the vehicle is:",
    "options": [
      "Completely stationary, with the footbrake applied",
      "Rolling slowly, to make the change smoother",
      "In motion at any speed below walking pace",
      "Being held on the handbrake while still moving"
    ],
    "correctIndex": 0,
    "explanation": "Selecting Park or Reverse against a moving vehicle loads the transmission hard and can damage it. Stop completely on the footbrake first.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_systems_not_substitute",
    "categoryId": "controls",
    "prompt": "ABS, stability control and traction control:",
    "options": [
      "Help within the limits of available grip — they cannot make an unsafe speed safe",
      "Make a vehicle safe at any speed in any conditions",
      "Replace the need to leave a following distance",
      "Only operate above highway speeds"
    ],
    "correctIndex": 0,
    "explanation": "Every one of them works by managing grip that already exists. Drivers who treat them as a safety margin end up using the margin, and there is nothing left when it runs out.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_engine_fire",
    "categoryId": "controls",
    "prompt": "Smoke starts coming from under the bonnet. You should:",
    "options": [
      "Stop, switch off, get everyone well clear, and not open the bonnet fully",
      "Open the bonnet immediately to see what is burning",
      "Keep driving to the nearest garage",
      "Pour water over the bonnet while the engine runs"
    ],
    "correctIndex": 0,
    "explanation": "Lifting the bonnet feeds the fire a rush of air. Switch off to cut the fuel and electrical supply, get people away, and call for help rather than investigating.",
    "difficulty": 3,
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
    "id": "qx_ctrl_securing_on_leaving",
    "categoryId": "controls",
    "prompt": "Before you leave a parked vehicle, you should:",
    "options": [
      "Apply the handbrake firmly, switch off the engine and take the key with you",
      "Leave it in neutral with the engine running if you will only be a moment",
      "Leave the handbrake off so the vehicle can be pushed if needed",
      "Switch off the engine but leave the key in the ignition"
    ],
    "correctIndex": 0,
    "explanation": "Handbrake on, engine off, key with you. A vehicle left running and unattended can be driven off by anyone, and one left without a handbrake can roll on a slope you did not notice.",
    "difficulty": 1,
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
    "id": "qx_ctrl_wet_brake_dry",
    "categoryId": "controls",
    "prompt": "After driving through deep standing water, your brakes may feel weak. The recommended response is to:",
    "options": [
      "Dry them by driving slowly while applying light brake pressure",
      "Brake hard once at speed to clear the water",
      "Stop and wait for them to dry on their own",
      "Pump the handbrake repeatedly while driving"
    ],
    "correctIndex": 0,
    "explanation": "Water between pad and disc kills friction. Gentle, sustained pressure at low speed heats and wipes them dry — and you should test them before you need them in anger.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q_ctrl_mirrors",
    "categoryId": "controls",
    "prompt": "How often should you check your mirrors while driving?",
    "options": [
      "Only when you intend to turn",
      "Regularly — every few seconds and before any manoeuvre",
      "Only at intersections",
      "Once at the start of the trip"
    ],
    "correctIndex": 1,
    "explanation": "Mirrors should be scanned frequently and always before signalling, changing lanes, slowing or turning, so you keep a live picture of the traffic around you.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q8_ctrl_steering_method",
    "categoryId": "controls",
    "prompt": "The K53 steering method uses:",
    "options": [
      "One hand at the top of the wheel",
      "The pull–push method, feeding the wheel with hands roughly at quarter-to-three, without crossing your arms",
      "Crossing your arms for sharp turns",
      "Letting the wheel spin back by itself"
    ],
    "correctIndex": 1,
    "explanation": "Pull–push (feeding the wheel) keeps both hands in control and your arms clear of the airbag. Crossing hands or letting the wheel spin back loses control and marks.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc5_interior_light_night",
    "categoryId": "controls",
    "prompt": "Driving at night with the interior light on is unwise because:",
    "options": [
      "It reflects in the glass and destroys your night vision",
      "It drains the battery quickly",
      "It is an offence in all circumstances",
      "It makes the headlights dimmer"
    ],
    "correctIndex": 0,
    "explanation": "Your eyes adjust to the brightest thing in view, and a lit cabin becomes exactly that. The road outside then looks far darker than it is.",
    "difficulty": 2,
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
    "id": "q2_ctrl_oil_light",
    "categoryId": "controls",
    "prompt": "The oil-pressure warning light comes on while you're driving. You should:",
    "options": [
      "Drive to your destination and check next week",
      "Stop as soon as it is safe and switch the engine off — running on could destroy it",
      "Speed up so you finish the trip before damage occurs",
      "Ignore it if the engine still sounds fine"
    ],
    "correctIndex": 1,
    "explanation": "No oil pressure means the engine is not being lubricated — serious damage happens within minutes. Stop safely, switch off, and investigate.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_misting_demister",
    "categoryId": "controls",
    "prompt": "The windscreen mists up on the inside while you are driving. The most effective response is to:",
    "options": [
      "Use the demister and air conditioning to clear it, wiping only as a stopgap",
      "Wipe it continuously with your hand and drive on",
      "Switch the windscreen wipers to their fastest setting",
      "Open all the windows fully and keep your speed up"
    ],
    "correctIndex": 0,
    "explanation": "Misting is warm damp air meeting cold glass; the demister and air conditioning dry the air and fix the cause. Wiping by hand smears the glass and takes a hand off the wheel.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc5_warning_light_colours",
    "categoryId": "controls",
    "prompt": "On most dashboards, a red warning light rather than an amber one generally means:",
    "options": [
      "Stop as soon as it is safe — red signals a fault that can damage the vehicle or endanger you",
      "The system is working normally",
      "A service is due at your convenience",
      "A bulb somewhere has failed"
    ],
    "correctIndex": 0,
    "explanation": "The colour is a severity code. Amber says get it looked at; red says the thing it monitors is failing now, which is why oil pressure and brakes are red.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q8_ctrl_cockpit_order",
    "categoryId": "controls",
    "prompt": "Before starting the engine (cockpit drill), a sensible order is:",
    "options": [
      "Start engine, then adjust seat and mirrors",
      "Doors closed, seat, head restraint, mirrors, seatbelt; handbrake up and neutral, then start",
      "Seatbelt only, then drive off",
      "Mirrors after you've pulled away"
    ],
    "correctIndex": 1,
    "explanation": "Set everything you can't safely fix while moving — position, mirrors, belt — before you start. Handbrake up and neutral means the car can't lurch on ignition.",
    "difficulty": 2,
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
    "id": "qx_ctrl_washer_wiper_pretrip",
    "categoryId": "controls",
    "prompt": "A pre-trip check of the windscreen wipers should include:",
    "options": [
      "That the blades clear the glass without smearing and that there is washer fluid",
      "Only that the wipers move when switched on",
      "Nothing — wipers are checked at the annual service",
      "That the blades are dry to the touch before driving"
    ],
    "correctIndex": 0,
    "explanation": "A wiper that only moves is not a wiper that works. Perished blades smear and can leave you effectively blind in the first hard rain, and washers are useless without fluid.",
    "difficulty": 1,
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
    "id": "qx_ctrl_observation_before_reverse",
    "categoryId": "controls",
    "prompt": "Before you begin reversing in the yard test, your observation must include:",
    "options": [
      "A look all around, finishing with a look through the rear window in the direction you will travel",
      "A glance in the interior mirror only",
      "A check of the reversing camera screen alone",
      "A look over your right shoulder only"
    ],
    "correctIndex": 0,
    "explanation": "All round first, because a child or cyclist can be anywhere, then eyes where the vehicle is actually going. Mirrors and cameras supplement that look — they don't replace it.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qc3_spongy_pedal",
    "categoryId": "controls",
    "prompt": "The brake pedal feels soft and travels closer to the floor than usual. You should:",
    "options": [
      "Treat it as a brake fault and have it checked before driving further",
      "Pump the pedal and carry on as normal",
      "Adjust the handbrake to compensate",
      "Ignore it unless the brakes stop working entirely"
    ],
    "correctIndex": 0,
    "explanation": "A soft pedal usually means air or fluid loss in the system. It rarely improves on its own, and the failure it precedes tends to arrive when you brake hardest.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_stop_line_missing",
    "categoryId": "intersections",
    "prompt": "At a stop sign where the painted stop line has worn away, you must:",
    "options": [
      "Still stop, at the point where the line would be — the sign creates the duty, not the paint",
      "Proceed with caution, since there is no line to stop at",
      "Stop only if traffic is approaching",
      "Treat it as a yield sign"
    ],
    "correctIndex": 0,
    "explanation": "The marking shows where; the sign says whether. Worn paint changes nothing about the obligation to come to a complete stop.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_int_lane_choice",
    "categoryId": "intersections",
    "prompt": "Painted lane arrows at an intersection are:",
    "options": [
      "Suggestions for smoother traffic flow",
      "Compulsory — in an arrow-marked lane you must travel in the direction shown",
      "Only enforceable in peak hours",
      "For heavy vehicles only"
    ],
    "correctIndex": 1,
    "explanation": "Lane-direction arrows are regulatory road markings. In a left-turn lane you must turn left — if you're there by mistake, make the turn and re-route.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q3_int_mini_circle",
    "categoryId": "intersections",
    "prompt": "At a mini-circle, right of way belongs to:",
    "options": [
      "The vehicle that reaches the circle first",
      "The largest vehicle",
      "The vehicle turning right",
      "Whoever is on the main road"
    ],
    "correctIndex": 0,
    "explanation": "Mini-circles work like courtesy crossings: first to arrive crosses first. That's different from a roundabout, where the circulating traffic from your right has priority.",
    "difficulty": 3,
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
    "id": "q7_int_two_right_lanes",
    "categoryId": "intersections",
    "prompt": "You and another car turn right side-by-side from twin right-turn lanes into a dual carriageway. You should:",
    "options": [
      "Drift across into whichever lane is open",
      "Stay in your own lane throughout the turn, exiting into the matching lane",
      "Cut in front of the other car",
      "Speed up to claim both lanes"
    ],
    "correctIndex": 1,
    "explanation": "Twin turn lanes map onto matching exit lanes: hold your lane through the whole turn. Swinging wide side-swipes the car beside you.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q7_int_given_not_taken",
    "categoryId": "intersections",
    "prompt": "You have right of way at a junction, but another driver edges out anyway. You should:",
    "options": [
      "Hold your course — the rules are on your side",
      "Give way to avoid a collision — right of way is given, never taken",
      "Hoot and accelerate through",
      "Flash your lights and continue"
    ],
    "correctIndex": 1,
    "explanation": "Being right doesn't stop a crash. The K53 principle is that right of way is given: yield to a driver who's taking it, even when the law says it was yours.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_int_blocked",
    "categoryId": "intersections",
    "prompt": "The traffic light is green but the intersection ahead is blocked with traffic. You should:",
    "options": [
      "Move in anyway because it is green",
      "Wait behind the line until you can clear the intersection without blocking it",
      "Hoot until cars move",
      "Use the pavement to get around"
    ],
    "correctIndex": 1,
    "explanation": "Never enter an intersection you cannot clear, even on green. Stopping in the box blocks cross-traffic when their light goes green and causes gridlock.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr3_two_lane_circle_position",
    "categoryId": "intersections",
    "prompt": "On a two-lane traffic circle, taking an exit more than halfway around, you would normally:",
    "options": [
      "Approach in the right-hand lane and move left as you near your exit",
      "Approach in the left-hand lane and stay there throughout",
      "Use whichever lane is emptier and change inside the circle",
      "Straddle both lanes so nobody can pass you"
    ],
    "correctIndex": 0,
    "explanation": "Lane choice on the approach reflects where you are leaving. Entering left for a late exit means crossing traffic inside the circle — the most common collision there.",
    "difficulty": 3,
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
    "id": "qr2_stop_line_position",
    "categoryId": "intersections",
    "prompt": "At a stop street where the stop line is set well back from the corner, the correct procedure is to:",
    "options": [
      "Stop at the line first, then creep forward for a view if buildings block it",
      "Ignore the line and stop where you can see",
      "Stop only once your bonnet is level with the cross street",
      "Stop at the line and proceed regardless, since you have complied"
    ],
    "correctIndex": 0,
    "explanation": "The line is a legal stopping point and a second, edged-out stop is how you actually see. Complying with the line without ever getting a view is a stop you learned nothing from.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q7_int_left_turn_lane_discipline",
    "categoryId": "intersections",
    "prompt": "Turning left at an intersection, the correct road position beforehand is:",
    "options": [
      "In the centre of the road",
      "Close to the left, in the correct lane, having signalled early",
      "In the right-hand lane, then cut across",
      "Wherever there's a gap"
    ],
    "correctIndex": 1,
    "explanation": "Position left in good time so your intention is obvious and you don't swing across other lanes. Early signal, correct lane, then a tidy turn.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q7_int_uncontrolled_right",
    "categoryId": "intersections",
    "prompt": "You and another car reach an unmarked intersection (no signs, robots or lines) at the same moment. Priority goes to:",
    "options": [
      "The faster vehicle",
      "The vehicle on your right",
      "The larger vehicle",
      "Whoever hoots first"
    ],
    "correctIndex": 1,
    "explanation": "At an uncontrolled intersection the first to arrive goes first; if you arrive together, give way to the vehicle on your right. Approach ready to yield either way.",
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
    "id": "q7_int_emergency_side",
    "categoryId": "intersections",
    "prompt": "As you approach a green robot, an ambulance with lights and siren is entering the intersection from your right. You should:",
    "options": [
      "Proceed — your light is green",
      "Stop and give way; an emergency vehicle overrides your green light",
      "Speed up to clear before it arrives",
      "Follow it through the intersection"
    ],
    "correctIndex": 1,
    "explanation": "A green light never outranks an emergency vehicle. Stop and let it through, then proceed when the way is clear — and never tail it through the junction.",
    "difficulty": 2,
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
    "id": "qr5_hz_roadworks_speed",
    "categoryId": "hazard_awareness",
    "prompt": "Temporary speed limits through roadworks apply:",
    "options": [
      "Whenever the signs are displayed, whether or not workers are present",
      "Only when workers are visibly on site",
      "Only during daylight hours",
      "Only to heavy vehicles"
    ],
    "correctIndex": 0,
    "explanation": "The limit is protecting you from the road as much as the workers from you — loose surfaces, missing markings, open trenches and narrowed lanes are all still there at night.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_haz_stray_animal",
    "categoryId": "hazard_awareness",
    "prompt": "A cow wanders into the road ahead on a rural route. The safest response is to:",
    "options": [
      "Swerve hard around it",
      "Slow down and be ready to stop; brake in a straight line rather than swerving violently",
      "Accelerate past before it moves",
      "Hoot and keep your speed"
    ],
    "correctIndex": 1,
    "explanation": "Livestock is unpredictable and there's often more than one. A violent swerve can roll the car or put you in oncoming traffic — slow, straight braking is safer.",
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
    "id": "qr2_hazard_overload_visibility",
    "categoryId": "hazard_awareness",
    "prompt": "A vehicle ahead is piled high with an unsecured load. The safest response is to:",
    "options": [
      "Drop well back and avoid sitting directly behind it",
      "Overtake immediately regardless of the road ahead",
      "Follow closely so you can see any load that shifts",
      "Sound your hooter to alert the driver"
    ],
    "correctIndex": 0,
    "explanation": "Anything that comes off arrives at your windscreen at closing speed. Distance gives you time to see it fall and room to avoid it.",
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
    "id": "qr4_hz_medication",
    "categoryId": "hazard_awareness",
    "prompt": "Prescription or over-the-counter medicine that may cause drowsiness:",
    "options": [
      "Can impair you enough to make driving unsafe and unlawful, even though it is legally obtained",
      "Is always safe because it is legal",
      "Only matters if combined with alcohol",
      "Affects only the first dose"
    ],
    "correctIndex": 0,
    "explanation": "The law is about whether you are fit to drive, not about where the substance came from. Read the label and ask a pharmacist before a long trip.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_haz_night_glare",
    "categoryId": "hazard_awareness",
    "prompt": "An oncoming vehicle's main beams are dazzling you. You should:",
    "options": [
      "Stare at their lights so your eyes adjust",
      "Look slightly left toward your lane edge or the left line, slow down, and don't retaliate with your own beams",
      "Close one eye",
      "Brake to a stop in your lane"
    ],
    "correctIndex": 1,
    "explanation": "Use the left road edge as your steering reference until they've passed. Retaliating with main beam just creates two blind drivers heading at each other.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_haz_smoke",
    "categoryId": "hazard_awareness",
    "prompt": "Smoke from a veld fire is drifting thickly across the road ahead. You should:",
    "options": [
      "Speed up to get through it quickly",
      "Treat it like fog — slow right down, switch on your lights, and be ready to stop",
      "Switch on your brights and maintain speed",
      "Follow closely behind the car ahead"
    ],
    "correctIndex": 1,
    "explanation": "Smoke hides stopped cars and animals just like fog. Slow down, lights on, and don't drive blind into it — vehicles pile up inside smoke banks.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr2_hazard_escape_route",
    "categoryId": "hazard_awareness",
    "prompt": "Keeping an 'escape route' in mind while driving means:",
    "options": [
      "Continuously knowing where you would go if the space ahead suddenly closed",
      "Planning an alternative route in case of traffic",
      "Staying near an off-ramp at all times",
      "Driving in the lane closest to the shoulder"
    ],
    "correctIndex": 0,
    "explanation": "Braking is not always enough. Drivers who avoid collisions usually already knew which way was open, because they had been noticing.",
    "difficulty": 3,
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
    "id": "q2_haz_oncoming_overtaker",
    "categoryId": "hazard_awareness",
    "prompt": "An oncoming car pulls into YOUR lane to overtake and won't make it back in time. You should:",
    "options": [
      "Hold your line — you have right of way",
      "Brake hard and move as far left as safely possible, even onto the shoulder",
      "Swerve right, behind the overtaker",
      "Flash your lights and maintain speed"
    ],
    "correctIndex": 1,
    "explanation": "Being right doesn't survive a head-on. Brake to shed energy and give them the room — left, onto the shoulder if needed. Never swerve right into the lane they came from.",
    "difficulty": 2,
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
    "id": "qr3_hz_reversing_lights",
    "categoryId": "hazard_awareness",
    "prompt": "The first sign that a parked car is about to pull out is usually:",
    "options": [
      "Exhaust smoke, wheels turning slightly, or a head visible in the driver's seat",
      "Its hazard lights coming on",
      "The driver sounding the hooter",
      "Its brake lights going off"
    ],
    "correctIndex": 0,
    "explanation": "Drivers pull out before they indicate, if they indicate at all. The clues are all small and all earlier than the signal — which is why hazard perception is about looking, not waiting.",
    "difficulty": 2,
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
    "id": "qr3_park_angle_reverse_in",
    "categoryId": "parking",
    "prompt": "In an angled (echelon) bay, reversing in rather than nosing in is safer because:",
    "options": [
      "You leave the bay forwards, with a clear view of passing traffic and pedestrians",
      "It is quicker to complete",
      "It puts less strain on the steering",
      "It is the only lawful way to use an angled bay"
    ],
    "correctIndex": 0,
    "explanation": "The difficult, sighted manoeuvre happens on arrival, when you can see. Nosing in means leaving blind, reversing into a lane you cannot properly see.",
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
    "id": "q3_park_kerb_distance",
    "categoryId": "parking",
    "prompt": "When you parallel park on a public road, your wheels must finish:",
    "options": [
      "Within 1 metre of the kerb",
      "Within 450 mm of the edge of the roadway or kerb",
      "Touching the kerb",
      "Anywhere, as long as other traffic can pass"
    ],
    "correctIndex": 1,
    "explanation": "The rule (and the K53 yard-test standard) is to park parallel and within 450 mm of the kerb or roadway edge, facing the direction of traffic.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_park_bridge",
    "categoryId": "parking",
    "prompt": "Stopping your vehicle on or under a bridge, or on a narrow (constricted) section of road, is:",
    "options": [
      "Always fine",
      "A no-stopping situation — you may not stop there",
      "Allowed if briefly",
      "Allowed with hazards on"
    ],
    "correctIndex": 1,
    "explanation": "These are no-stopping places: on or near a bridge and on a constricted part of the road, because they obstruct traffic and sightlines.",
    "difficulty": 3,
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
    "id": "qr3_park_school_gate",
    "categoryId": "parking",
    "prompt": "Stopping right at a school gate at closing time is a poor idea mainly because:",
    "options": [
      "It hides small children from approaching drivers at the exact place they cross",
      "School staff are entitled to that space",
      "It is only an offence during school terms",
      "It blocks the school's own vehicles"
    ],
    "correctIndex": 0,
    "explanation": "Children are short and step out without looking. A car parked across the gate turns the one place drivers most need a clear view into a blind spot.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q9_park_pavement",
    "categoryId": "parking",
    "prompt": "Parking with your wheels up on the pavement (sidewalk) is:",
    "options": [
      "Fine if you leave room to pass",
      "Prohibited — it obstructs pedestrians, who then have to walk in the road",
      "Allowed outside business hours",
      "Allowed for delivery vehicles only"
    ],
    "correctIndex": 1,
    "explanation": "The pavement is for people on foot — prams, wheelchairs and children. Forcing them into the traffic lane to get around your car is exactly what the rule prevents.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q9_fd_sides",
    "categoryId": "following_distance",
    "prompt": "Good following practice keeps space:",
    "options": [
      "Only in front of you",
      "All around — don't sit boxed in alongside other vehicles; keep a buffer to the sides too",
      "Only behind you",
      "Only on the driver's side"
    ],
    "correctIndex": 1,
    "explanation": "A gap ahead is useless if you're hemmed in on both sides with nowhere to go. Keep an escape route open by not driving in others' blind spots or packs.",
    "difficulty": 2,
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
    "id": "q_fd_thinking",
    "categoryId": "following_distance",
    "prompt": "Total stopping distance is made up of:",
    "options": [
      "Braking distance only",
      "Your reaction (thinking) distance plus the braking distance",
      "Only the time the brakes are applied",
      "The distance to the next sign"
    ],
    "correctIndex": 1,
    "explanation": "Stopping distance = thinking distance (while you react) + braking distance. Tiredness, alcohol and distraction lengthen the thinking part; speed and wet roads lengthen the braking part.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_fd_wet",
    "categoryId": "following_distance",
    "prompt": "In rain or poor visibility, your following distance should be:",
    "options": [
      "Reduced to keep up with traffic",
      "Increased to at least three to four seconds",
      "Kept exactly the same",
      "Ignored if you have ABS"
    ],
    "correctIndex": 1,
    "explanation": "Wet roads lengthen braking distance, so increase the gap to at least three to four seconds to give yourself time to stop.",
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
    "id": "q9_fd_why_seconds",
    "categoryId": "following_distance",
    "prompt": "Why is the two-second rule better than 'stay X metres back'?",
    "options": [
      "It's easier to remember",
      "It scales automatically with speed — the faster you go, the bigger the gap it gives",
      "It only works in town",
      "Metres are illegal to use"
    ],
    "correctIndex": 1,
    "explanation": "A fixed distance that's safe at 60 is deadly at 120. Counting seconds stretches the real gap as your speed rises, exactly when you need it most.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr4_fd_assured_clear_distance",
    "categoryId": "following_distance",
    "prompt": "The principle that you must always be able to stop within the distance you can see to be clear means that:",
    "options": [
      "Your safe speed is set by your sight distance, whatever the posted limit says",
      "You may drive at the limit provided your brakes are in order",
      "It applies only at night",
      "It applies only to heavy vehicles"
    ],
    "correctIndex": 0,
    "explanation": "It is the rule underneath fog, night driving, blind crests and bends. If something stationary sits just beyond your view, this principle is what decides whether you hit it.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q11_fd_night_headlights",
    "categoryId": "following_distance",
    "prompt": "At night your speed and following distance should always let you:",
    "options": [
      "Stop within the distance your headlights light up",
      "Keep up with the car in front no matter how fast it goes",
      "Drive on full beam the whole time",
      "Halve the gap you would leave in daylight"
    ],
    "correctIndex": 0,
    "explanation": "If you cannot stop within the lit distance, you are 'over-driving your lights' — a hazard could appear inside your stopping distance before you ever see it.",
    "difficulty": 2,
    "scope": "learners"
  }
];

export const STARTER_FLASHCARDS: Flashcard[] = [
  {
    "id": "fc4_brown",
    "categoryId": "signs",
    "front": "Brown signs?",
    "back": "Tourism — attractions and places of interest.",
    "difficulty": 1
  },
  {
    "id": "fcd_qs2_st_andrews_cross",
    "categoryId": "signs",
    "front": "An X-shaped cross sign at a railway line marks:",
    "back": "The cross marks the crossing itself, as opposed to the triangular sign that warned you it was coming. Trains always have right of way — they physically cannot give it.",
    "difficulty": 2
  },
  {
    "id": "fc_no_overtaking",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-012-01.png",
    "front": "What does this sign mean?",
    "back": "No overtaking until you pass the sign that ends the restriction.",
    "difficulty": 2
  },
  {
    "id": "fcd_q6_mark_chevron_barrier",
    "categoryId": "signs",
    "front": "A painted island bordered by a SOLID line means:",
    "back": "You may not enter or cross it — treat it as a solid barrier — A solid border upgrades a painted island to a no-go zone. (A broken border you may cross when it's safe, e.g. to reach a turn lane.)",
    "difficulty": 3
  },
  {
    "id": "fcd_gen-sign-regulatory-017-02-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "End of headlights-on requirement: You no longer need to drive with your headlights switched on.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-017-02.png"
  },
  {
    "id": "fcd_q_sign_de_restriction",
    "categoryId": "signs",
    "front": "A sign with a diagonal line (or grey bars) through a previous regulatory sign means:",
    "back": "The previous restriction now ends / no longer applies — A de-restriction sign cancels a previous regulatory instruction — for example, ending a no-overtaking zone or a speed restriction.",
    "difficulty": 3
  },
  {
    "id": "fc2_school_patrol",
    "categoryId": "signs",
    "front": "Scholar patrol banner out?",
    "back": "Stop completely and stay stopped until the banner is withdrawn from the road.",
    "difficulty": 1
  },
  {
    "id": "fcd_gen-sign-warning-028-05-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Road narrows from both sides: Road ahead narrows from both sides. Keep well to the left.",
    "difficulty": 3,
    "image": "/signs/warning/warning-028-05.png"
  },
  {
    "id": "fc6_barrier_legal",
    "categoryId": "signs",
    "front": "Crossing a barrier (solid) line — how serious?",
    "back": "A traffic offence, not just unwise — even on an empty road.",
    "difficulty": 2
  },
  {
    "id": "fcd_q6_mark_kerb_paint",
    "categoryId": "signs",
    "front": "A painted (coloured) kerb generally indicates:",
    "back": "A stopping or parking restriction — obey it and any accompanying sign — Painted kerbs flag stopping/parking rules (exact colour conventions vary by municipality). Read the nearby sign to know the specific restriction.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs2_blue_vs_red_circle",
    "categoryId": "signs",
    "front": "The essential difference between a blue circular sign and a red-ringed circular sign is that:",
    "back": "Both are compulsory — the difference is direction. Blue commands an action, red forbids one. Reading the shape and colour first tells you which kind of instruction you are getting.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs2_faded_sign",
    "categoryId": "signs",
    "front": "You approach a regulatory sign that is faded, dirty or partly obscured by a branch. You should:",
    "back": "A damaged sign is still a sign, and the restriction it marks is still there. Uncertainty about the instruction is a reason to slow down, not to disregard it.",
    "difficulty": 2
  },
  {
    "id": "fc_ped_priority",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-007-04.png",
    "front": "What does this sign mean?",
    "back": "Pedestrian-priority zone: enter only to load/offload or for emergencies, yield to pedestrians, max 15 km/h.",
    "difficulty": 3
  },
  {
    "id": "fcd_gen-sign-warning-031-05-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Length restriction ahead (temporary): Vehicle length regulatory restriction ahead (temporary version).",
    "difficulty": 3,
    "image": "/signs/warning/warning-031-05.png"
  },
  {
    "id": "fcd_q_sign_ped_crossing",
    "categoryId": "signs",
    "front": "This warning sign tells you that ahead there is a:",
    "back": "The sign warns of a marked pedestrian crossing ahead. Slow down and be prepared to give way to people crossing.",
    "difficulty": 1,
    "image": "/signs/warning/warning-037-01.png"
  },
  {
    "id": "fcd_qs2_lane_control_x",
    "categoryId": "signs",
    "front": "An overhead signal shows a red X above your lane. It means:",
    "back": "That lane is closed ahead — move out of it safely — Overhead lane signals close individual lanes for an incident or works ahead. Change lanes in good time rather than at the obstruction itself.",
    "difficulty": 2
  },
  {
    "id": "fcd_gen-sign-regulatory-017-05-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "End of dual-carriage freeway: End of dual carriage freeway and freeway rules no longer apply.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-017-05.png"
  },
  {
    "id": "fcd_q6_temp_vs_permanent",
    "categoryId": "signs",
    "front": "A permanent sign says 100 km/h; a temporary yellow sign at roadworks says 60 km/h. Which applies?",
    "back": "The temporary 60 — a temporary sign takes precedence over the permanent one it replaces — Temporary signs exist precisely to override the normal ones for changed conditions. Where they conflict, the temporary sign wins.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs2_signals_ahead",
    "categoryId": "signs",
    "front": "A warning sign showing a traffic-light symbol means:",
    "back": "Traffic signals are ahead, possibly hidden by a bend or a crest — These go up where the robot cannot be seen from far enough away. Slow down and be ready to stop — you may come over a rise to find a red and a queue.",
    "difficulty": 2
  },
  {
    "id": "fcd_gen-sign-warning-029-02-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Falling rocks ahead: Falling rocks ahead, especially after rain.",
    "difficulty": 3,
    "image": "/signs/warning/warning-029-02.png"
  },
  {
    "id": "fc6_temp_priority",
    "categoryId": "signs",
    "front": "Temporary vs permanent sign conflict?",
    "back": "Temporary wins — it exists to override the normal one for changed conditions.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs2_hospital_sign",
    "categoryId": "signs",
    "front": "A blue information sign showing an 'H' indicates:",
    "back": "A hospital, where you should expect ambulances and reduce noise — Blue rectangles inform. Around a hospital, expect emergency vehicles arriving from unexpected directions and pedestrians who are distracted or distressed.",
    "difficulty": 1
  },
  {
    "id": "fca_start_date",
    "categoryId": "rules",
    "front": "When do AARTO demerit points start?",
    "back": "1 September 2026 — that's when infringements begin adding points to your record.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_rules_emergency_vehicle",
    "categoryId": "rules",
    "front": "An ambulance approaches with lights and siren. You must:",
    "back": "Give way by moving left and slowing or stopping when it is safe — You are required to give way to emergency vehicles. Move to the left and slow or stop where it is safe — without making a dangerous or illegal manoeuvre.",
    "difficulty": 2
  },
  {
    "id": "fc_freeway_who",
    "categoryId": "rules",
    "front": "Who/what is not allowed on a freeway?",
    "back": "Pedestrians, animals, pedal cycles and very slow vehicles. Learners only if accompanied by a licensed driver.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_rules_being_overtaken",
    "categoryId": "rules",
    "front": "Another vehicle is overtaking you. You should:",
    "back": "Keep left, hold a steady speed and do not accelerate until they have passed — When being overtaken, move safely to the left, keep a steady speed and do not accelerate until the other vehicle has passed.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_rules_livestock",
    "categoryId": "rules",
    "front": "You come across cattle being herded across a rural road. You should:",
    "back": "Slow right down or stop, and pass slowly on the herder's signal — animals are unpredictable — Hooting can panic animals into your path. Slow down, be patient and pass wide and slow when it's clearly safe.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_rules_ped_collision",
    "categoryId": "rules",
    "front": "If a vehicle collides with a pedestrian, the driver:",
    "back": "The law gives pedestrians strong protection: if a vehicle hits a pedestrian, the driver can be prosecuted regardless of who had right of way. Always drive defensively around people on foot.",
    "difficulty": 3
  },
  {
    "id": "fcd_q_rules_divided_solid",
    "categoryId": "rules",
    "front": "A solid line or barrier divides the road. You may:",
    "back": "Not cross it — stay on the left of the division — On a divided road you must stay left of the division. Crossing a solid dividing line is a rule violation; a broken line may be crossed only to overtake or make a legal U-turn.",
    "difficulty": 2
  },
  {
    "id": "fc2_learner_codes",
    "categoryId": "rules",
    "front": "Learner's licence codes and ages?",
    "back": "Code 1 motorcycles (16) · Code 2 vehicles ≤3 500 kg (17) · Code 3 heavier (18). Valid 24 months.",
    "difficulty": 2
  },
  {
    "id": "fc_dip",
    "categoryId": "controls",
    "front": "When must you dip your headlights?",
    "back": "For oncoming traffic and when following another vehicle, to avoid dazzling drivers.",
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
    "id": "fc2_dry_steer",
    "categoryId": "controls",
    "front": "'Dry steering'?",
    "back": "Turning the wheel while stationary — strains the steering and scrubs tyres. Steer while creeping.",
    "difficulty": 3
  },
  {
    "id": "fc8_pole_contact",
    "categoryId": "controls",
    "front": "Touch a pole/kerb/line in a manoeuvre?",
    "back": "Fails that manoeuvre — it represents a real collision.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_ctrl_clutch",
    "categoryId": "controls",
    "front": "What is the main function of the clutch in a manual vehicle?",
    "back": "To engage and disengage the engine from the gearbox when changing gears — The clutch temporarily disconnects engine power from the gearbox so you can select gears or stop without stalling.",
    "difficulty": 1
  },
  {
    "id": "fcd_q8_ctrl_pretrip_exterior",
    "categoryId": "controls",
    "front": "A proper pre-trip walk-around of the OUTSIDE of the vehicle includes checking:",
    "back": "Tyres, fluid leaks under the car, lights and indicators, and the number plates — A ten-second walk-around catches a soft tyre, a leak or a dead brake light before they become a breakdown or a fine — cheap insurance every trip.",
    "difficulty": 1
  },
  {
    "id": "fc8_cockpit",
    "categoryId": "controls",
    "front": "Cockpit drill before starting?",
    "back": "Doors, seat, head restraint, mirrors, belt; handbrake up + neutral, then start.",
    "difficulty": 2
  },
  {
    "id": "fcd_q8_ctrl_hands_on",
    "categoryId": "controls",
    "front": "While driving normally you should keep:",
    "back": "Both hands on the wheel except briefly when changing gear or operating a control — Two hands give the control you need for a sudden swerve. Take a hand off only as long as a gear change or control needs it, then straight back on.",
    "difficulty": 1
  },
  {
    "id": "fcd_q2_int_red_arrow",
    "categoryId": "intersections",
    "front": "A steady red arrow pointing right shows at a robot while the main light is green. You want to turn right. You must:",
    "back": "Wait — the red arrow means your right-turn movement must stop, even though other movements may go — Arrow signals control the specific movement they point to. A red arrow stops that turn regardless of the main light.",
    "difficulty": 2
  },
  {
    "id": "fc7_right_no_arrow",
    "categoryId": "intersections",
    "front": "Turning right, full green, no filter arrow?",
    "back": "Move into the intersection; complete the turn on a safe gap, clearing on amber/red.",
    "difficulty": 3
  },
  {
    "id": "fcd_q_int_emergency_intersection",
    "categoryId": "intersections",
    "front": "You are crossing an intersection on green when an emergency vehicle approaches with sirens. You should:",
    "back": "Clear the intersection, then pull over and give way where it is safe — Do not stop in the intersection. Continue through, then move left and stop where it is safe so the emergency vehicle can pass.",
    "difficulty": 3
  },
  {
    "id": "fc7_left_cyclist",
    "categoryId": "intersections",
    "front": "Key check before a left turn?",
    "back": "Left mirror + blind spot for a cyclist/motorcyclist alongside — avoids the left-hook.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_int_left_position",
    "categoryId": "intersections",
    "front": "The correct position for a left turn at an intersection is:",
    "back": "As close to the left edge as is safe, turning into the nearest lane of the new road — Turn left from the left edge into the left lane. Swinging out first invites vehicles (especially motorcycles) into the gap on your inside.",
    "difficulty": 1
  },
  {
    "id": "fc_dead_robot",
    "categoryId": "intersections",
    "front": "Traffic light not working?",
    "back": "Treat the intersection as a four-way stop.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_int_ped_crossing",
    "categoryId": "intersections",
    "front": "You are turning at an intersection and pedestrians are crossing the road you are entering. You must:",
    "back": "Give way to the pedestrians and let them finish crossing — Turning traffic must give way to pedestrians already crossing the road being entered. Wait for them to clear before completing the turn.",
    "difficulty": 2
  },
  {
    "id": "fc_blind_spot",
    "categoryId": "hazard_awareness",
    "front": "Before changing lanes, besides mirrors?",
    "back": "Do a shoulder check of the blind spot the mirrors can't show (wheels straight).",
    "difficulty": 1
  },
  {
    "id": "fcd_q_haz_brake_fail",
    "categoryId": "hazard_awareness",
    "front": "Your foot brake suddenly fails while driving. Your first actions should be:",
    "back": "If the service brake fails, pump the pedal, change down for engine braking and apply the handbrake gradually (not violently) while steering to a safe stop and warning others.",
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
    "id": "fc9_bus",
    "categoryId": "hazard_awareness",
    "front": "Passing a stopped bus with people around?",
    "back": "Slow, cover the brake — pedestrians (kids) may dart across.",
    "difficulty": 1
  },
  {
    "id": "fc_ball",
    "categoryId": "hazard_awareness",
    "front": "A ball rolls into the road?",
    "back": "A child may follow — slow down and cover the brake.",
    "difficulty": 2
  },
  {
    "id": "fc9_pavement",
    "categoryId": "parking",
    "front": "Parking on the pavement?",
    "back": "Prohibited — it forces pedestrians into the road.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_park_incline_up",
    "categoryId": "parking",
    "front": "When parking facing uphill next to a kerb, you should turn your front wheels:",
    "back": "Away from the kerb (so a roll-back is caught by the kerb) — Facing uphill, turn the wheels away from the kerb so that if the car rolls back the wheels catch the kerb. Apply the handbrake and leave it in gear.",
    "difficulty": 3
  },
  {
    "id": "fc9_angle_out",
    "categoryId": "parking",
    "front": "Leaving an angled bay you nosed into?",
    "back": "Reverse out slowly, full observation, yield until you can see clearly.",
    "difficulty": 2
  },
  {
    "id": "fc11_park_night_rural",
    "categoryId": "parking",
    "front": "Parked on the roadway outside town at night?",
    "back": "Your vehicle must show the required lamps/reflectors so approaching drivers see it in time.",
    "difficulty": 2
  },
  {
    "id": "fcd_q3_park_direction",
    "categoryId": "parking",
    "front": "On a two-way road, you may park:",
    "back": "Only on the left, facing the same direction as the traffic flow — Parking against the flow (on the right of a two-way road) is prohibited — at night your reflectors face the wrong way and pulling off means driving into oncoming traffic.",
    "difficulty": 1
  },
  {
    "id": "fc2_reaction_28m",
    "categoryId": "following_distance",
    "front": "Distance covered in 1 s at 100 km/h?",
    "back": "About 28 m — before your foot even reaches the brake.",
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
    "id": "fc2_gravel_gap",
    "categoryId": "following_distance",
    "front": "Following distance on gravel?",
    "back": "At least double — braking takes far longer and dust hides brake lights. Stay out of the dust cloud.",
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
    "id": "fcd_q_fd_braking",
    "categoryId": "following_distance",
    "front": "Compared to 60 km/h, your braking distance at 120 km/h is roughly:",
    "back": "About four times as long — Braking distance increases with the square of speed — doubling your speed roughly quadruples the distance needed to stop. This is why speed dramatically affects crash severity.",
    "difficulty": 3
  }
];

/** Scenarios are a paid feature (PlanLimits.scenarios is false on free). */
export const STARTER_SCENARIOS: Scenario[] = [];
