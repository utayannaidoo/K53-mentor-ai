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
    "id": "gen-sign-regulatory-006-01-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Come to a complete stop behind the stop line every time — even if the road is empty — then move off only when it is safe.",
      "This is a manually operated sign, with the word STOP on one side and GO on the other.",
      "You no longer need to drive with your headlights switched on.",
      "Give way to all cross-traffic and to pedestrians crossing or about to cross."
    ],
    "correctIndex": 0,
    "explanation": "Stop: Come to a complete stop behind the stop line every time — even if the road is empty — then move off only when it is safe.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-006-01.png"
  },
  {
    "id": "gen-sign-regulatory-009-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "To give drivers an opportunity to follow an alternate route or proceed on the route and pay toll fees.",
      "Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow.",
      "The maximum speed, in km/h, at which you may drive past this sign.",
      "To indicate that road users must drive to the side of an obstruction where the sign is displayed."
    ],
    "correctIndex": 0,
    "explanation": "Alternative route to toll road: To give drivers an opportunity to follow an alternate route or proceed on the route and pay toll fees.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-009-02.png"
  },
  {
    "id": "q4_sign_reserved_lane",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-013-01.png",
    "prompt": "A reservation sign with a bus symbol above a lane means:",
    "options": [
      "Buses may not use this lane",
      "The lane (left of the solid yellow line) is for the exclusive use of buses",
      "Bus stop ahead",
      "All heavy vehicles must use this lane"
    ],
    "correctIndex": 1,
    "explanation": "Reservation signs dedicate a lane to the class shown. Other vehicles stay out of it except to cross for a turn where permitted.",
    "difficulty": 2,
    "scope": "learners"
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
    "explanation": "This is the regulatory sign \"No overtaking by goods vehicles\". No over taking vehicles by goods vehicles for the next 500m.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-012-02.png"
  },
  {
    "id": "q_sign_robot_amber",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-022-03.png",
    "prompt": "A steady amber (yellow) traffic signal means:",
    "options": [
      "Speed up to clear the intersection",
      "Stop, unless you are so close that stopping cannot be done safely",
      "The light is faulty — ignore it",
      "Give way to the left only"
    ],
    "correctIndex": 1,
    "explanation": "Amber means stop. You should only continue if you are so close to the line that stopping suddenly would be unsafe. It is a warning that red is next, not a cue to accelerate.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-marking-079-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Parking bay markings",
      "Box junction",
      "No-overtaking line ahead",
      "Pedestrian crossing markings"
    ],
    "correctIndex": 0,
    "explanation": "This is the road marking \"Parking bay markings\". Parking bay:",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/marking/marking-079-04.png"
  },
  {
    "id": "gen-sign-regulatory-009-05-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow.",
      "To indicate that road users must drive to the side of an obstruction where the sign is displayed.",
      "To indicate that you must move in a clockwise direction at the junction.",
      "To indicate that the road or part of it is set aside for use by goods vehicles only."
    ],
    "correctIndex": 0,
    "explanation": "Proceed in the direction shown: Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-009-05.png"
  },
  {
    "id": "gen-sign-regulatory-014-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Time-limited parking",
      "Dual-carriage freeway begins",
      "Residential area",
      "Bus lane reservation"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Time-limited parking\". This area is reserved for parking, up to a maximum of 60 minutes.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-014-06.png"
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
    "id": "gen-sign-marking-077-05-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No-overtaking line",
      "No parking — broken yellow line",
      "Yield line",
      "No-crossing double line"
    ],
    "correctIndex": 0,
    "explanation": "This is the road marking \"No-overtaking line\". No overtaking line: part of the vehicle to cross the line, except to access property on the other",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/marking/marking-077-05.png"
  },
  {
    "id": "gen-sign-information-044-03-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Modal transfer point",
      "Recommended speed plate",
      "Freeway exit countdown markers",
      "Priority road"
    ],
    "correctIndex": 0,
    "explanation": "This is the information sign \"Modal transfer point\". Modal transfer. At this point you can change your mode of transport, e.g. from car to train or from train to bus.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/information/information-044-03.png"
  },
  {
    "id": "gen-sign-warning-029-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Jetty edge or river bank ahead, close to the road.",
      "Road narrows at a bridge ahead.",
      "Hazard ahead. Slow down and approach with caution.",
      "Priority road with secondary crossroad ahead."
    ],
    "correctIndex": 0,
    "explanation": "Jetty or river bank ahead: Jetty edge or river bank ahead, close to the road.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-029-04.png"
  },
  {
    "id": "qs2_loose_stones",
    "categoryId": "signs",
    "prompt": "A warning sign showing stones flying up from a vehicle's wheels means:",
    "options": [
      "Loose stones or chippings ahead — drop your speed and your following distance",
      "The road ahead is closed to vehicles without mudflaps",
      "A gravel road begins permanently",
      "Stone-throwing has been reported in the area"
    ],
    "correctIndex": 0,
    "explanation": "Loose chippings are usually fresh surfacing. Speed flings them into windscreens — including yours — and grip is poorer than it looks, so leave a bigger gap.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_sign_yield_ped",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-006-05.png",
    "prompt": "What must you do at this sign?",
    "options": [
      "Sound your hooter to warn pedestrians",
      "Give way to pedestrians on, or about to enter, the crossing on your side",
      "Stop only if a pedestrian is already in the road",
      "Proceed — pedestrians must wait for vehicles"
    ],
    "correctIndex": 1,
    "explanation": "This sign warns of a pedestrian crossing where you must give way to any pedestrians on, or about to step onto, the crossing on your side of the road.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-013-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Reserved stop zone",
      "Temporary parking reservation",
      "Parking for people with disabilities",
      "Bus lane reservation"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Reserved stop zone\". This stop zone is reserved for the exclusive use of the class of vehicle and organization shown by the symbol and logo.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-013-06.png"
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
    "explanation": "This is the regulatory sign \"No right turn at intersection\". To prohibit vehicles from turning right at an intersection.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-011-04.png"
  },
  {
    "id": "qs2_end_of_restriction",
    "categoryId": "signs",
    "prompt": "A sign repeating a restriction with a diagonal line struck through it means:",
    "options": [
      "That particular restriction now ends",
      "The restriction is temporarily suspended",
      "The restriction now applies more strictly",
      "The restriction applies only to heavy vehicles"
    ],
    "correctIndex": 0,
    "explanation": "The struck-through version cancels the restriction it repeats. Until you pass it — or a sign setting a new limit — the original one is still in force.",
    "difficulty": 2,
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
    "id": "gen-sign-regulatory-007-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "A traffic circle (mini-circle or roundabout) is ahead.",
      "End of lane use reservation and all vehicles may now use this lane.",
      "End of residential area and rules for a residential area no longer apply.",
      "End of single carriage freeway and freeway rules no longer apply."
    ],
    "correctIndex": 0,
    "explanation": "Traffic circle ahead: A traffic circle (mini-circle or roundabout) is ahead.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-007-03.png"
  },
  {
    "id": "q_sign_default_rural",
    "categoryId": "signs",
    "prompt": "On a public road outside an urban area, with no sign shown, the default speed limit is:",
    "options": [
      "80 km/h",
      "100 km/h",
      "120 km/h",
      "There is no limit"
    ],
    "correctIndex": 1,
    "explanation": "Outside urban areas the default limit is 100 km/h unless a sign shows otherwise; on a freeway it is 120 km/h.",
    "difficulty": 2,
    "scope": "learners"
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
    "id": "gen-sign-regulatory-010-04-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Heavy goods vehicles only",
      "Buses and minibuses only",
      "Taxis only",
      "Pass on the side shown"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Heavy goods vehicles only\". To indicate that the road or part of it is set aside for use by goods vehicles with a gross vehicle mass or gross combination mass exceeding the mass indicated in tons by a number on such a sign.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-010-04.png"
  },
  {
    "id": "gen-sign-regulatory-014-03-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Parking for people with disabilities",
      "Reserved stop zone",
      "Bus lane reservation",
      "Parking reservation"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Parking for people with disabilities\". Parking here is reserved for a vehicle carrying people with disabilities.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-014-03.png"
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
    "explanation": "This is the information sign \"Blind people plate\". Blind people.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/information/information-045-06.png"
  },
  {
    "id": "gen-sign-warning-028-02-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Tarred road begins",
      "Slippery road ahead",
      "Pedestrians ahead",
      "Crossroad ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Tarred road begins\". Gravel road becomes a tarred road ahead.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-028-02.png"
  },
  {
    "id": "gen-sign-information-043-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "No through road ahead, as indicated by the red bar.",
      "Temporary high speed exit countdown sign.",
      "High speed freeway exit countdown signs.",
      "Priority road. The road you are travelling on has priority at the junction ahead."
    ],
    "correctIndex": 0,
    "explanation": "No through road: No through road ahead, as indicated by the red bar.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/information/information-043-03.png"
  },
  {
    "id": "gen-sign-warning-038-03-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Warthogs ahead",
      "Trams ahead",
      "Elephants ahead",
      "Staggered junctions ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Warthogs ahead\". Warthogs ahead.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-038-03.png"
  },
  {
    "id": "gen-sign-regulatory-008-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "This is to indicate that there is a one-way carriageway to the left, proceed in the direction of the arrow indicated.",
      "Turn right at the next junction during these times.",
      "Overtaking other vehicles is prohibited until you pass the sign that ends the restriction.",
      "Goods vehicles must travel at 50km/h or faster."
    ],
    "correctIndex": 0,
    "explanation": "One-way roadway (left): This is to indicate that there is a one-way carriageway to the left, proceed in the direction of the arrow indicated.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-008-02.png"
  },
  {
    "id": "gen-sign-regulatory-011-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "To prohibit vehicles from turning left at an intersection.",
      "To prohibit noise, if the noise level of your vehicle is high, you may not proceed past the sign.",
      "Overtaking other vehicles is prohibited until you pass the sign that ends the restriction.",
      "To prohibit vehicles from turning around (u-turn) so that it faces the opposite direction."
    ],
    "correctIndex": 0,
    "explanation": "No left turn at intersection: To prohibit vehicles from turning left at an intersection.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-011-03.png"
  },
  {
    "id": "gen-sign-regulatory-010-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Cyclists and pedestrians only",
      "Pass on the side shown",
      "Pedestrians only",
      "Alternative route to toll road"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Cyclists and pedestrians only\". To indicate that the road or part of it may be used by cyclists and pedestrians only. Indicates to cyclists and pedestrians which part of the road they may use.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-010-07.png"
  },
  {
    "id": "gen-sign-regulatory-017-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "You no longer need to drive with your headlights switched on.",
      "End of dual carriage freeway and freeway rules no longer apply.",
      "End of residential area and rules for a residential area no longer apply.",
      "Vehicle mass restriction no longer applies."
    ],
    "correctIndex": 0,
    "explanation": "End of headlights-on requirement: You no longer need to drive with your headlights switched on.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-017-02.png"
  },
  {
    "id": "gen-sign-regulatory-012-01-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "No overtaking",
      "No left turn",
      "No parking",
      "No hawkers"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"No overtaking\". Overtaking other vehicles is prohibited until you pass the sign that ends the restriction.",
    "difficulty": 1,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-012-01.png"
  },
  {
    "id": "gen-sign-warning-028-07-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Road narrows at a bridge",
      "Warthogs ahead",
      "Jetty or river bank ahead",
      "Road works ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Road narrows at a bridge\". Road narrows at a bridge ahead. Slow down and approach with caution.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-028-07.png"
  },
  {
    "id": "gen-sign-warning-028-01-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Gravel road begins",
      "Reduced visibility ahead",
      "Road narrows from both sides",
      "Height restriction ahead"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Gravel road begins\". Tarred road becomes a gravel road ahead, with loose stones that can damage windscreens and paintwork.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-028-01.png"
  },
  {
    "id": "gen-sign-regulatory-009-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Proceed in the direction shown (temporary)",
      "Goods vehicles only",
      "Pedestrians only",
      "Cyclists and pedestrians only"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"Proceed in the direction shown (temporary)\". Indicates the direction in which you must proceed, drive only in the direction indicated by the arrow at the next junction.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-009-06.png"
  },
  {
    "id": "gen-sign-warning-035-06-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "Side road junction ahead",
      "Horses ahead",
      "Falling rocks ahead",
      "General warning"
    ],
    "correctIndex": 0,
    "explanation": "This is the warning sign \"Side road junction ahead\". Side road junction ahead.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/warning/warning-035-06.png"
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
    "explanation": "This is the information sign \"Recommended speed plate\". Recommended speed.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/information/information-045-02.png"
  },
  {
    "id": "qs2_slippery",
    "categoryId": "signs",
    "prompt": "A warning sign showing a car with curved skid marks behind it means:",
    "options": [
      "The road ahead is slippery — reduce speed and avoid sudden steering or braking",
      "Skidding is common because the road is always wet",
      "The road ahead is used for driver training",
      "Anti-lock brakes are required beyond this point"
    ],
    "correctIndex": 0,
    "explanation": "Slippery-road signs go up where the surface loses grip — polished tar, frequent spillage, or a bend that catches water. Everything you do there should be gradual.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-029-06-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Reduced visibility can be expected ahead (e.g. frequent mist).",
      "General warning sign, usually with an explanatory plate beneath it.",
      "Speed humps ahead. Slow down and obey any speed limit sign.",
      "Steep uphill ahead. You may not cross a No Overtaking line to overtake a slow moving vehicle."
    ],
    "correctIndex": 0,
    "explanation": "Reduced visibility ahead: Reduced visibility can be expected ahead (e.g. frequent mist).",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-029-06.png"
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
    "id": "gen-sign-warning-030-03-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Road width regulatory restriction ahead.",
      "Tarred road becomes a gravel road ahead, with loose stones that can damage windscreens and paintwork.",
      "General warning sign, usually with an explanatory plate beneath it.",
      "Construction vehicles entering or crossing the road ahead."
    ],
    "correctIndex": 0,
    "explanation": "Width restriction ahead: Road width regulatory restriction ahead.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-030-03.png"
  },
  {
    "id": "gen-sign-information-043-05-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Priority road. The road you are travelling on has priority at the junction ahead.",
      "Temporary high speed exit countdown sign.",
      "High speed freeway exit countdown signs.",
      "Modal transfer. At this point you can change your mode of transport, e.g. from car to train or from train to bus."
    ],
    "correctIndex": 0,
    "explanation": "Priority road: Priority road. The road you are travelling on has priority at the junction ahead.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/information/information-043-05.png"
  },
  {
    "id": "gen-sign-regulatory-014-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "This area is reserved for parking by the class of vehicle shown.",
      "This stop zone is reserved for the exclusive use of the class of vehicle and organization shown by the symbol and logo.",
      "Parking here is reserved for a vehicle carrying people with disabilities.",
      "The lane on the right of the yellow line is reserved for the exclusive use of the class of vehicle indicated."
    ],
    "correctIndex": 0,
    "explanation": "Parking for the class shown: This area is reserved for parking by the class of vehicle shown.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-014-02.png"
  },
  {
    "id": "qs2_uneven",
    "categoryId": "signs",
    "prompt": "A warning sign showing an uneven or bumpy road surface means you should:",
    "options": [
      "Reduce speed — the surface ahead is rough enough to affect your control",
      "Expect roadworks with a flag person",
      "Change to a lower gear to protect the gearbox",
      "Move into the right-hand lane"
    ],
    "correctIndex": 0,
    "explanation": "A rough surface upsets steering and braking, and at speed it can throw a light vehicle or a motorcycle off line. The sign asks for less speed, not a lane change.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-warning-031-04-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "Road width regulatory restriction ahead (temporary version).",
      "Loose stones on road surface ahead (temporary version).",
      "Soft shoulder at road's edge ahead (temporary version).",
      "Temporary uneven, potholed, or bumpy road surface ahead."
    ],
    "correctIndex": 0,
    "explanation": "Width restriction ahead (temporary): Road width regulatory restriction ahead (temporary version).",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/warning/warning-031-04.png"
  },
  {
    "id": "qsg_qualifier_principle",
    "categoryId": "signs",
    "prompt": "A small rectangular plate is mounted directly beneath a road sign. Its job is to:",
    "options": [
      "Limit when, where or to whom the sign above it applies",
      "Repeat the sign above it for drivers further back",
      "Show which authority erected the sign",
      "Warn that the sign above is about to be removed"
    ],
    "correctIndex": 0,
    "explanation": "These are qualifier plates, and they are not decoration — the plate is what decides whether the sign applies to you at this moment. Read the pair together or you will obey a restriction that was never yours, or ignore one that was.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_sign_stop_vs_yield_line",
    "categoryId": "signs",
    "prompt": "What is the difference between a solid and a broken white line painted across your lane?",
    "options": [
      "Solid = yield line, broken = stop line",
      "Solid = stop line (stop behind it), broken = yield line (give way, stop only if needed)",
      "Both mean the same thing",
      "They only apply to trucks"
    ],
    "correctIndex": 1,
    "explanation": "A solid transverse line is a stop line — your front wheels must not cross it while stopped. A broken transverse line marks a yield: give way, and stop only if the way isn't clear.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_sign_ped_crossing",
    "categoryId": "signs",
    "image": "/signs/warning/warning-037-01.png",
    "prompt": "This warning sign tells you that ahead there is a:",
    "options": [
      "Bus stop",
      "Marked pedestrian crossing",
      "Place where pedestrians are banned",
      "Picnic site"
    ],
    "correctIndex": 1,
    "explanation": "The sign warns of a marked pedestrian crossing ahead. Slow down and be prepared to give way to people crossing.",
    "difficulty": 1,
    "scope": "learners"
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
    "id": "gen-sign-regulatory-017-01-name",
    "categoryId": "signs",
    "prompt": "Which sign is this?",
    "options": [
      "End of toll road",
      "End of headlights-on requirement",
      "End of single-carriage freeway",
      "End of dual-carriage freeway"
    ],
    "correctIndex": 0,
    "explanation": "This is the regulatory sign \"End of toll road\". End of toll road.",
    "difficulty": 2,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-017-01.png"
  },
  {
    "id": "gen-sign-regulatory-013-02-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "The curved yellow line indicates the start of a lane reserved for the exclusive use of the class of vehicle indicated.",
      "This area is reserved for parking by the class of vehicle shown.",
      "This area is reserved for parking by authorized vehicles.",
      "This area is reserved for parking by police vehicles."
    ],
    "correctIndex": 0,
    "explanation": "This regulatory sign: The curved yellow line indicates the start of a lane reserved for the exclusive use of the class of vehicle indicated.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-013-02.png"
  },
  {
    "id": "q6_temp_detour",
    "categoryId": "signs",
    "prompt": "A temporary DETOUR sign points away from your normal route because the road ahead is closed. You should:",
    "options": [
      "Ignore it and push through the closure",
      "Follow the detour — temporary route signs override the normal route while in place",
      "Wait at the closure until it reopens",
      "Reverse and find your own way"
    ],
    "correctIndex": 1,
    "explanation": "Detour signs reroute you around a closure or hazard. They take priority over the usual direction until the situation clears.",
    "difficulty": 1,
    "scope": "learners"
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
    "id": "q2_sign_robot_green",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-022-04.png",
    "prompt": "The robot ahead is a steady green. You may:",
    "options": [
      "Proceed immediately — green guarantees the way is clear",
      "Proceed, but only once you've checked the intersection is clear and it is safe",
      "Proceed only if turning left",
      "Speed up so you get through before it changes"
    ],
    "correctIndex": 1,
    "explanation": "Green gives you the right to proceed — it does not guarantee safety. Check for red-light runners, pedestrians still crossing and blocked exits before entering.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q6_temp_flagperson",
    "categoryId": "signs",
    "prompt": "At roadworks a flag person turns their board to STOP. You must:",
    "options": [
      "Slow down but keep rolling if the road looks clear",
      "Stop completely — the STOP board is a lawful stop instruction",
      "Wave to ask permission and proceed",
      "Ignore it; only officers can stop you"
    ],
    "correctIndex": 1,
    "explanation": "The STOP-GO board carries legal authority at the works. STOP means stop and wait; when it turns to GO you proceed with caution through the site.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "gen-sign-regulatory-012-06-meaning",
    "categoryId": "signs",
    "prompt": "What does this road sign mean?",
    "options": [
      "To prohibit hawkers in this area during any time of the day or night.",
      "To prohibit pedestrians from proceeding past this sign where they could cause danger to themselves and vehicles.",
      "To prohibit motorcycles on a part of a carriageway for safety reasons.",
      "No over taking vehicles by goods vehicles for the next 500m."
    ],
    "correctIndex": 0,
    "explanation": "No hawkers: To prohibit hawkers in this area during any time of the day or night.",
    "difficulty": 3,
    "scope": "learners",
    "image": "/signs/regulatory/regulatory-012-06.png"
  },
  {
    "id": "qsg_no_passenger_pickup",
    "categoryId": "signs",
    "prompt": "What does this sign prohibit?",
    "image": "/signs/regulatory/regulatory-012-04.png",
    "options": [
      "Picking up passengers along the stretch of road indicated",
      "Hitchhiking by pedestrians only",
      "Overtaking on the left",
      "Parking for longer than 500 m of roadway"
    ],
    "correctIndex": 0,
    "explanation": "Aimed at the stopping that picking someone up requires, which on a fast or narrow road is the actual hazard. It typically covers a stated distance rather than a single point.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr2_animal_drawn",
    "categoryId": "rules",
    "prompt": "You come up behind an animal-drawn cart on a rural road. You should:",
    "options": [
      "Slow right down and pass wide only when you can see well ahead — animals can move unpredictably",
      "Sound your hooter continuously so the driver moves over",
      "Overtake immediately, since the cart is travelling slowly",
      "Follow closely so you can pass at the first opportunity"
    ],
    "correctIndex": 0,
    "explanation": "A hooter or a close pass can startle the animal into the road. Treat it like any slow vehicle that might swerve without warning: space and patience.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qmr_divided_road_crossing",
    "categoryId": "rules",
    "prompt": "Where a road is divided by a painted line or a physical barrier, you may cross it:",
    "options": [
      "Only at an opening or space specifically provided",
      "Anywhere, provided it is safe",
      "Only outside urban areas",
      "Only to make a U-turn"
    ],
    "correctIndex": 0,
    "explanation": "The division exists to keep opposing traffic apart. Crossing it anywhere else puts you head-on into a lane whose drivers have no reason to expect you.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q_rules_overtake_left",
    "categoryId": "rules",
    "prompt": "Overtaking on the left is permitted when:",
    "options": [
      "You are in a hurry",
      "The vehicle ahead is turning right (or has signalled right), or the road is a one-way",
      "There is a solid yellow edge line",
      "It is never permitted"
    ],
    "correctIndex": 1,
    "explanation": "You may pass on the left when the vehicle ahead is turning or signalling right, or on a one-way road — but never by crossing the yellow left edge line.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qmr_hampering_control",
    "categoryId": "rules",
    "prompt": "The rule against letting a person, animal or load hamper your control of the vehicle covers your ability to:",
    "options": [
      "Observe, hear, signal, slow down and change direction",
      "Reach the radio and climate controls",
      "See the instrument panel only",
      "Reach the handbrake only"
    ],
    "correctIndex": 0,
    "explanation": "It is written broadly on purpose. A dog on your lap, a passenger against your shoulder or a load blocking the rear window each defeats a different one of those five, and any one of them is enough.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qmr_body_protruding",
    "categoryId": "rules",
    "prompt": "Having part of your body protruding from the vehicle while driving is prohibited, except when:",
    "options": [
      "You are executing a hand signal",
      "You are reversing",
      "The vehicle is stationary in traffic",
      "You are checking a blind spot"
    ],
    "correctIndex": 0,
    "explanation": "The hand-signal exception is the only one, and it applies to passengers as well as the driver — an arm out of a rear window is an offence, not a joke.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qmr_smoke_fumes",
    "categoryId": "rules",
    "prompt": "Running an engine that gives off excessive smoke or fumes is:",
    "options": [
      "Prohibited",
      "Permitted while the engine warms up",
      "Permitted on diesel vehicles",
      "Permitted outside urban areas"
    ],
    "correctIndex": 0,
    "explanation": "Both an emissions matter and a visibility one — a smoking exhaust blinds the driver behind you. It also usually means a fault worth fixing before it becomes a breakdown.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qmr_seatbelt_beltless_seat",
    "categoryId": "rules",
    "prompt": "An adult passenger may not sit in a seat without a seat belt if:",
    "options": [
      "Another seat fitted with a belt is available",
      "The journey is longer than 20 km",
      "The vehicle is travelling above 60 km/h",
      "They are over the age of 65"
    ],
    "correctIndex": 0,
    "explanation": "Belted seats are filled first. It stops the beltless seat being treated as an ordinary option when a safe one is standing empty.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qmr_main_beam_100m",
    "categoryId": "rules",
    "prompt": "Main beam (bright) headlights should be able to illuminate objects up to:",
    "options": [
      "100 m ahead",
      "45 m ahead",
      "250 m ahead",
      "500 m ahead"
    ],
    "correctIndex": 0,
    "explanation": "If your brights fall well short of that, they need aiming or replacing — you are outdriving your lights every time you use them.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qmr_tow_steering_control",
    "categoryId": "rules",
    "prompt": "A licensed driver must sit in the towed vehicle to steer it, unless:",
    "options": [
      "Its front wheels are clear of the ground, or a device controls the steering",
      "The tow is under 5 km",
      "The towing vehicle is a recovery truck",
      "It is being towed at under 30 km/h"
    ],
    "correctIndex": 0,
    "explanation": "Someone or something has to steer it. Lifting the front wheels or fitting a steering device removes the need for a person; nothing else does.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qr4_reckless_vs_negligent",
    "categoryId": "rules",
    "prompt": "The difference between negligent driving and reckless driving is essentially:",
    "options": [
      "Negligent driving falls short of the care a reasonable driver would take; reckless driving shows deliberate disregard for the danger created",
      "Negligent driving happens in town and reckless driving on freeways",
      "Negligent driving involves damage and reckless driving does not",
      "They are two names for the same offence"
    ],
    "correctIndex": 0,
    "explanation": "It is a question of state of mind, not of outcome. Reckless is the graver charge because the driver knew the risk and drove on anyway — which is why no crash needs to happen for it to be proved.",
    "difficulty": 3,
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
    "id": "qmr_tow_passengers",
    "categoryId": "rules",
    "prompt": "Passengers in a towed vehicle are:",
    "options": [
      "Not allowed, unless the towed vehicle is a semi-trailer",
      "Allowed if they wear seat belts",
      "Allowed if a licensed driver is steering",
      "Allowed on journeys under 5 km"
    ],
    "correctIndex": 0,
    "explanation": "A towed vehicle usually has no brakes, no power steering and no engine to move it out of trouble. There is no reason for anyone to be in it who is not steering it.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qr5_slow_lane_freeway",
    "categoryId": "rules",
    "prompt": "A vehicle unable to maintain a reasonable freeway speed should:",
    "options": [
      "Keep to the left-hand lane and let faster traffic pass",
      "Use the right-hand lane to stay out of merging traffic",
      "Travel in the middle lane at all times",
      "Use the shoulder to keep the lanes clear"
    ],
    "correctIndex": 0,
    "explanation": "Freeway lanes are ordered by speed, so a slow vehicle in a fast lane forces everyone around it. The shoulder is never an answer — it is for emergencies only.",
    "difficulty": 1,
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
    "id": "q_rules_unattended",
    "categoryId": "rules",
    "prompt": "Before leaving your vehicle unattended you must:",
    "options": [
      "Leave the engine running",
      "Apply the parking brake (and take steps to stop it moving) and switch off the engine",
      "Leave it in neutral with the engine on",
      "Leave the keys in the ignition"
    ],
    "correctIndex": 1,
    "explanation": "You may not leave a vehicle unattended without setting the parking brake or otherwise preventing it from moving, and you may not leave the engine running unattended.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qmr_shoulder_conditions",
    "categoryId": "rules",
    "prompt": "Moving onto the shoulder to let a vehicle overtake is permitted only when all of these hold:",
    "options": [
      "Single-lane road, between sunrise and sunset, and 150 m of clear view ahead",
      "Any road, at any time, if the shoulder is paved",
      "Outside urban areas only, at any hour",
      "When the vehicle behind flashes its lights"
    ],
    "correctIndex": 0,
    "explanation": "Three conditions, all required. The shoulder is where pedestrians and stopped vehicles are, which is why the courtesy is fenced in so tightly — and why driving on it continuously is prohibited outright.",
    "difficulty": 3,
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
    "id": "qr4_licence_disc_display",
    "categoryId": "rules",
    "prompt": "The vehicle licence disc must be displayed on the windscreen so that:",
    "options": [
      "It can be read from outside the vehicle — an expired or hidden disc is an offence",
      "The driver can check the expiry date while driving",
      "It shields the driver from glare",
      "It proves the vehicle is insured"
    ],
    "correctIndex": 0,
    "explanation": "It is a public record that the vehicle is licensed for the road, so it has to face outward. Keeping a valid one in the cubbyhole is the same as not having it.",
    "difficulty": 1,
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
    "id": "qr5_road_workers",
    "categoryId": "rules",
    "prompt": "At roadworks, a flag person turns their board from GO to STOP as you approach. You must:",
    "options": [
      "Stop — the board is a lawful instruction, the same as a road sign",
      "Continue if the road ahead looks clear",
      "Slow down but keep moving through",
      "Stop only if machinery is crossing"
    ],
    "correctIndex": 0,
    "explanation": "The flag person is holding a single lane for alternating traffic. Driving past a STOP board sends you into oncoming vehicles that have been released.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qmr_accident_report_24h",
    "categoryId": "rules",
    "prompt": "After an accident you must report it at the nearest police station within:",
    "options": [
      "24 hours, with your driving licence on you",
      "7 days, with proof of insurance",
      "48 hours, with the other driver present",
      "Immediately, or not at all"
    ],
    "correctIndex": 0,
    "explanation": "Twenty-four hours, and take your licence — turning up without it turns one problem into two.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q2_rules_caravan_people",
    "categoryId": "rules",
    "prompt": "May passengers ride inside a caravan or trailer while it is being towed?",
    "options": [
      "Yes, if they are seated",
      "No — no person may be carried in a towed caravan or trailer",
      "Yes, but only adults",
      "Only on gravel roads"
    ],
    "correctIndex": 1,
    "explanation": "Riding in a towed caravan or trailer is prohibited — it has no crash protection and the combination can sway or detach.",
    "difficulty": 1,
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
    "id": "qm_seatbelt_reversing",
    "categoryId": "controls",
    "prompt": "The requirement to wear a seat belt:",
    "options": [
      "Does not apply while you are reversing",
      "Applies at all times without exception",
      "Does not apply below 40 km/h",
      "Does not apply to the driver, only to passengers"
    ],
    "correctIndex": 0,
    "explanation": "The exemption exists so you can turn far enough to look properly out of the rear window. It ends the moment you select a forward gear.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qc5_dirty_lights",
    "categoryId": "controls",
    "prompt": "After a long trip on a dusty or wet road, headlights and tail lights should be:",
    "options": [
      "Wiped clean — a film of dirt cuts their output dramatically",
      "Left alone, since the lenses are sealed",
      "Cleaned only at a service",
      "Polished with an abrasive to restore brightness"
    ],
    "correctIndex": 0,
    "explanation": "A grey film costs a surprising share of the light getting out and of your visibility to others. It is a thirty-second job with the same effect as an upgrade.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc5_reversing_camera_limits",
    "categoryId": "controls",
    "prompt": "A reversing camera or parking sensors should be treated as:",
    "options": [
      "An aid that supplements looking around — they miss things approaching from the side",
      "A complete replacement for looking over your shoulder",
      "Reliable enough to reverse at normal road speed",
      "Accurate for judging the speed of approaching vehicles"
    ],
    "correctIndex": 0,
    "explanation": "A camera frames what is directly behind. A child running in from the side, or a cyclist coming up the kerb, arrives from outside that frame — and sensors rarely see them in time.",
    "difficulty": 2,
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
    "id": "qx_ctrl_signal_no_permission",
    "categoryId": "controls",
    "prompt": "Signalling your intention to pull out means that:",
    "options": [
      "You have told others what you intend — you must still check it is safe before moving",
      "Other traffic is now obliged to make room for you",
      "You have right of way over vehicles already in the lane",
      "You no longer need to check your blind spot"
    ],
    "correctIndex": 0,
    "explanation": "An indicator asks; it does not take. The observation still decides whether you go, which is why the look comes after the signal and immediately before the move.",
    "difficulty": 2,
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
    "id": "qx_ctrl_power_steering_heavy",
    "categoryId": "controls",
    "prompt": "The steering suddenly becomes very heavy while driving, though the engine is still running. You should:",
    "options": [
      "Keep a firm two-handed grip, slow down and stop somewhere safe to investigate",
      "Let go of the wheel briefly to see if it self-centres",
      "Speed up, since power steering works better at speed",
      "Carry on to your destination — heavy steering is normal when warm"
    ],
    "correctIndex": 0,
    "explanation": "Heavy steering with the engine running points at a power-steering failure. The car still steers, but it needs real effort — hold on with both hands, shed speed, and get off the road.",
    "difficulty": 3,
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
    "id": "qx_ctrl_handbrake_hard_park",
    "categoryId": "controls",
    "prompt": "When parking on a steep slope, the handbrake should be:",
    "options": [
      "Applied firmly, with a gear (or Park) selected as well",
      "Applied only lightly, to avoid straining the cable",
      "Left off, with the vehicle in neutral",
      "Replaced by leaving the footbrake pressed"
    ],
    "correctIndex": 0,
    "explanation": "On a slope the handbrake alone carries the whole load. Leaving a gear engaged — or Park in an automatic — gives a second line of defence if the cable slips.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qm_neutral_position",
    "categoryId": "controls",
    "prompt": "On a typical manual gearbox, the neutral passage sits:",
    "options": [
      "Between the 3rd and 4th gear positions",
      "Between 1st and 2nd",
      "To the far left, beyond 1st",
      "Behind 5th"
    ],
    "correctIndex": 0,
    "explanation": "The lever is spring-loaded to rest there, which is why 3rd and 4th are the easiest gears to find blind. First and reverse both need the lever moved across that passage first.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q8_ctrl_hands_on",
    "categoryId": "controls",
    "prompt": "While driving normally you should keep:",
    "options": [
      "One hand on the wheel and one on the gear lever at all times",
      "Both hands on the wheel except briefly when changing gear or operating a control",
      "Both hands off on straight roads",
      "One hand resting out the window"
    ],
    "correctIndex": 1,
    "explanation": "Two hands give the control you need for a sudden swerve. Take a hand off only as long as a gear change or control needs it, then straight back on.",
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
    "id": "q8_ctrl_progressive_brake",
    "categoryId": "controls",
    "prompt": "Smooth, safe braking means you:",
    "options": [
      "Stamp hard at the last moment",
      "Look well ahead and brake progressively (squeeze) in good time",
      "Pump the brakes rapidly on dry roads",
      "Brake only with the handbrake"
    ],
    "correctIndex": 1,
    "explanation": "Progressive braking — early, squeezed, easing off as you stop — keeps the car stable and passengers comfortable, and leaves room if something changes.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc5_rear_skid_correct",
    "categoryId": "controls",
    "prompt": "The back of the car slides out to the right in a bend. You should:",
    "options": [
      "Ease off, look where you want to go and steer gently in the direction the rear is sliding",
      "Brake hard immediately",
      "Steer sharply the opposite way",
      "Accelerate hard to pull the car straight"
    ],
    "correctIndex": 0,
    "explanation": "Steering into the slide points the front wheels where the car is actually travelling and lets it line up again. Braking or a sharp correction usually swaps one skid for a worse one in the other direction.",
    "difficulty": 3,
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
    "id": "qx_ctrl_doors_closed",
    "categoryId": "controls",
    "prompt": "During the cockpit drill, the doors must be:",
    "options": [
      "Closed and secure before the vehicle moves",
      "Left slightly ajar so you can hear traffic",
      "Unlocked and open until you have adjusted the mirrors",
      "Locked only after you have moved off"
    ],
    "correctIndex": 0,
    "explanation": "All doors closed and secure is part of the pre-drive routine — an unlatched door can swing open in a turn and is a scored item on test.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_ctrl_clutch",
    "categoryId": "controls",
    "prompt": "What is the main function of the clutch in a manual vehicle?",
    "options": [
      "To brake the vehicle",
      "To engage and disengage the engine from the gearbox when changing gears",
      "To increase fuel flow",
      "To operate the indicators"
    ],
    "correctIndex": 1,
    "explanation": "The clutch temporarily disconnects engine power from the gearbox so you can select gears or stop without stalling.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q_ctrl_footbrake",
    "categoryId": "controls",
    "prompt": "When using the foot (service) brake, you should:",
    "options": [
      "Stamp on it hard with your left foot",
      "Apply it smoothly and progressively with your right foot, keeping both hands on the wheel",
      "Pump it rapidly at all times",
      "Use it only together with the handbrake"
    ],
    "correctIndex": 1,
    "explanation": "Brake smoothly and progressively with the right foot, ideally on a straight course, without locking the wheels, while keeping both hands on the steering wheel for control.",
    "difficulty": 2,
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
    "id": "qc5_spare_check",
    "categoryId": "controls",
    "prompt": "The most commonly neglected item in a pre-trip check is:",
    "options": [
      "The spare wheel's pressure and the presence of the jack and wheel spanner",
      "The interior mirror",
      "The fuel gauge",
      "The horn"
    ],
    "correctIndex": 0,
    "explanation": "A flat spare and a missing spanner are discovered at the roadside in the dark, which is the worst possible moment. Check them before a long trip, not during one.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qx_ctrl_brake_light_check",
    "categoryId": "controls",
    "prompt": "During a pre-trip walk-around, brake lights are best checked by:",
    "options": [
      "Having someone press the brake pedal while you look, or using a reflective surface behind you",
      "Pressing the pedal yourself and listening for a click",
      "Assuming they work if the dashboard shows no warning",
      "Checking them only when the vehicle goes for a service"
    ],
    "correctIndex": 0,
    "explanation": "Brake lights only light while the pedal is down, so they cannot be checked from the driver's seat alone. A helper, or the reflection in a window or wall behind you, is how you actually confirm them.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q8_ctrl_right_gear",
    "categoryId": "controls",
    "prompt": "Choosing the correct gear for your speed means:",
    "options": [
      "Always using the highest gear to save fuel",
      "Matching the gear to the road speed — not labouring in too high a gear or over-revving in too low",
      "Staying in first gear in town",
      "Changing gear as rarely as possible"
    ],
    "correctIndex": 1,
    "explanation": "The right gear keeps the engine in its comfortable range, ready to respond. Too high labours and stalls; too low over-revs and wastes control and fuel.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qm_handbrake_before_neutral",
    "categoryId": "controls",
    "prompt": "When securing the vehicle at a stop, the parking brake is applied:",
    "options": [
      "Before the gear lever goes into neutral",
      "After selecting neutral",
      "Only if the road is on a slope",
      "At the same time as the clutch is released"
    ],
    "correctIndex": 0,
    "explanation": "Neutral first leaves a moment where nothing is holding the car. Brake first, and there is no such moment — which is exactly what the examiner is watching the order for.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qr4_turning_traffic_yield_straight",
    "categoryId": "intersections",
    "prompt": "Two vehicles approach an intersection from opposite directions; one is going straight and the other turning across its path. Generally:",
    "options": [
      "The turning vehicle gives way to the one going straight",
      "The vehicle going straight gives way to the turning one",
      "Whichever arrives first proceeds, regardless of direction",
      "The larger vehicle proceeds first"
    ],
    "correctIndex": 0,
    "explanation": "Turning across an oncoming stream is the manoeuvre that creates the conflict, so the obligation sits with the driver making it.",
    "difficulty": 1,
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
    "id": "q_int_turn_right",
    "categoryId": "intersections",
    "prompt": "You are turning right at an intersection. Oncoming traffic is approaching. You should:",
    "options": [
      "Turn quickly before they arrive",
      "Yield to oncoming traffic and only turn when there is a safe gap",
      "Expect oncoming traffic to stop for you",
      "Sound your hooter and turn"
    ],
    "correctIndex": 1,
    "explanation": "A right-turning driver must give way to oncoming traffic going straight or turning left, and only complete the turn when there is a safe gap.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q7_int_stale_green",
    "categoryId": "intersections",
    "prompt": "A robot has been green for a while as you approach at speed. The best defensive action is to:",
    "options": [
      "Accelerate to get through before it changes",
      "Ease off, cover the brake and be ready to stop — a 'stale' green is about to change",
      "Maintain speed and assume it stays green",
      "Hoot to warn cross traffic"
    ],
    "correctIndex": 1,
    "explanation": "A long-standing green is a stale green: it will change. Anticipate amber, ease off and cover the brake so you're not forced to gamble on beating the light.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr2_yield_no_stop_needed",
    "categoryId": "intersections",
    "prompt": "At a yield sign with a completely clear road, you:",
    "options": [
      "May proceed without stopping, provided you have genuinely checked and can give way if needed",
      "Must always come to a complete stop first",
      "Must stop only if another vehicle is visible",
      "May proceed without slowing at all"
    ],
    "correctIndex": 0,
    "explanation": "Yield requires you to be able to give way, not necessarily to stop. That means arriving slowly enough that stopping is still an option.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_int_uncontrolled",
    "categoryId": "intersections",
    "prompt": "You approach an intersection with no signs, robots or markings. You must:",
    "options": [
      "Proceed at normal speed — no control means no rules",
      "Slow down, be ready to stop, and give way to any vehicle already in or entering the intersection before you",
      "Always come to a complete stop",
      "Hoot and proceed first"
    ],
    "correctIndex": 1,
    "explanation": "An uncontrolled intersection still has rules: approach at a speed that lets you stop, and yield to traffic that reaches or enters it before you do.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_int_four_way",
    "categoryId": "intersections",
    "prompt": "At a 4-way stop, who proceeds first?",
    "options": [
      "The vehicle on the widest road",
      "Vehicles proceed in the order they arrived and stopped",
      "The vehicle turning left",
      "Whoever hoots first"
    ],
    "correctIndex": 1,
    "explanation": "A 4-way stop works on first-to-stop, first-to-go. If two vehicles stop at the same moment, be ready to yield — never force the sequence.",
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
    "id": "qr5_filter_lane_yield",
    "categoryId": "intersections",
    "prompt": "A dedicated left-turn filter lane separated by an island means you:",
    "options": [
      "Still give way to traffic and pedestrians on the road you are joining, unless a signal releases you",
      "Have automatic right of way into the new road",
      "Need not check for pedestrians",
      "May proceed without slowing"
    ],
    "correctIndex": 0,
    "explanation": "The island separates you from the intersection; it does not grant priority. Filter lanes are exactly where drivers roll out without looking because the geometry feels like a slip road.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr3_blocked_box_wait",
    "categoryId": "intersections",
    "prompt": "Traffic ahead is stationary and your green light is about to change. You should:",
    "options": [
      "Wait behind the line — entering now would leave you stranded in the intersection",
      "Move into the intersection so you are first away when it clears",
      "Move up as far as the middle of the intersection",
      "Follow the car in front regardless of the space beyond"
    ],
    "correctIndex": 0,
    "explanation": "A vehicle stuck in the intersection blocks every other direction's phase. The green permits you to go; it does not promise there is anywhere to arrive.",
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
    "id": "qr2_emergency_at_red",
    "categoryId": "intersections",
    "prompt": "You are stopped at a red light and an ambulance behind you needs to get through. You should:",
    "options": [
      "Move aside only when you can do so safely and lawfully, without entering the intersection against the red",
      "Drive through the red light immediately to clear the way",
      "Stay exactly where you are under all circumstances",
      "Reverse to create a gap"
    ],
    "correctIndex": 0,
    "explanation": "Helping an emergency vehicle never requires committing an offence that endangers cross-traffic. Make room where you safely can; the ambulance is trained to work around a red.",
    "difficulty": 3,
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
    "id": "qr3_hz_low_sun_others",
    "categoryId": "hazard_awareness",
    "prompt": "Driving with the low sun behind you, the extra risk is that:",
    "options": [
      "Drivers coming toward you are dazzled and may not see you at all",
      "Your own brakes will fade in the heat",
      "Your headlights become less effective",
      "Your tyres lose grip in the glare"
    ],
    "correctIndex": 0,
    "explanation": "The dazzle you should worry about is the one you are not experiencing. Oncoming drivers are looking straight into it, so assume they have not seen you and give them room.",
    "difficulty": 3,
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
    "id": "q11_haz_total_brake_failure",
    "categoryId": "hazard_awareness",
    "prompt": "Your foot brake goes right to the floor with no effect while driving. Your first actions should be to:",
    "options": [
      "Switch the engine off immediately and coast",
      "Pump the pedal, change down to a lower gear and apply the handbrake gently while steering to safety",
      "Steer sharply off the road at once",
      "Take both hands off the wheel and brace"
    ],
    "correctIndex": 1,
    "explanation": "Pumping can restore some pressure, engine braking in a low gear slows you, and a gentle handbrake avoids a skid. Switching off the engine risks losing steering assistance and locking the wheel.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr5_hz_crash_scene_pass",
    "categoryId": "hazard_awareness",
    "prompt": "Passing the scene of a crash on the opposite carriageway, the main risk to you is:",
    "options": [
      "Slowing to look, which causes collisions in your own direction",
      "Debris crossing the median",
      "Emergency vehicles turning across you",
      "Losing radio reception"
    ],
    "correctIndex": 0,
    "explanation": "Rubbernecking causes a second crash behind the first with grim regularity. Keep your eyes on your own lane and your speed steady unless you are actually stopping to help.",
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
    "id": "qr2_hazard_emerging_vehicle",
    "categoryId": "hazard_awareness",
    "prompt": "You are passing a line of driveways in a residential street. The defensive approach is to:",
    "options": [
      "Cover the brake and watch for reversing lights and movement in each opening",
      "Maintain speed and rely on the other driver to check before emerging",
      "Move to the middle of the road to gain distance",
      "Sound your hooter as you pass each driveway"
    ],
    "correctIndex": 0,
    "explanation": "A vehicle reversing out of a driveway has almost no view of the road. Reversing lights and any movement in the gap are your only early warning.",
    "difficulty": 2,
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
    "id": "qr3_hz_queue_hazards",
    "categoryId": "hazard_awareness",
    "prompt": "Coming to a stop at the back of stationary traffic on a fast road, a useful precaution is to:",
    "options": [
      "Switch on your hazard lights briefly to warn drivers still approaching",
      "Switch off your lights so you are not mistaken for a moving vehicle",
      "Sound your hooter to alert following traffic",
      "Get out and warn traffic on foot"
    ],
    "correctIndex": 0,
    "explanation": "This is one of the few moving-traffic uses of hazard lights: you have become a stationary hazard on a road where others are still travelling fast.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q_haz_fatigue",
    "categoryId": "hazard_awareness",
    "prompt": "You start feeling drowsy on a long drive. The safest action is to:",
    "options": [
      "Open the window and push on",
      "Stop in a safe place and rest before continuing",
      "Drink coffee and double your speed",
      "Turn the music up loud"
    ],
    "correctIndex": 1,
    "explanation": "Fatigue badly impairs reaction time and judgement. The only real fix is to stop somewhere safe and rest; tricks like fresh air only mask the problem briefly.",
    "difficulty": 2,
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
    "id": "qr3_park_abreast",
    "categoryId": "parking",
    "prompt": "Parking alongside another already-parked vehicle, leaving a narrow gap for traffic, is:",
    "options": [
      "An obstruction — the roadway must stay usable by passing traffic",
      "Acceptable if you stay with the vehicle",
      "Acceptable during off-peak hours",
      "Acceptable if your hazard lights are on"
    ],
    "correctIndex": 0,
    "explanation": "Double parking narrows the road to a single lane and forces oncoming traffic into conflict. Staying in the car does not widen the road.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_park_narrow_road",
    "categoryId": "parking",
    "prompt": "You may not park alongside or directly opposite another vehicle where the roadway is:",
    "options": [
      "Narrower than 5 m",
      "Narrower than 9 m",
      "Narrower than 12 m",
      "A one-way street"
    ],
    "correctIndex": 1,
    "explanation": "On a roadway less than 9 m wide, parking next to or opposite another vehicle squeezes moving traffic into an unsafe gap.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qr4_park_narrow_road_both_sides",
    "categoryId": "parking",
    "prompt": "On a narrow residential street with vehicles already parked on one side, parking opposite them is:",
    "options": [
      "Likely to be an obstruction — what remains must still let traffic, including emergency vehicles, through",
      "Acceptable, since both sides are equally available",
      "Acceptable if you park close to the kerb",
      "Only a problem during the day"
    ],
    "correctIndex": 0,
    "explanation": "A fire engine or ambulance needs a continuous width, not an average one. Streets where residents park both sides are exactly where crews get stuck.",
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
    "id": "qr2_park_children_exit",
    "categoryId": "parking",
    "prompt": "Parked at the kerb with children in the car, you should let them get out:",
    "options": [
      "On the kerb side only, and only once you have checked for cyclists and traffic",
      "On whichever side is closest to where they are going",
      "On the traffic side, so you can watch them cross",
      "Immediately, before you switch the engine off"
    ],
    "correctIndex": 0,
    "explanation": "Children step out without looking. The kerb side puts the vehicle between them and the traffic, and the check catches a cyclist coming up the gutter.",
    "difficulty": 1,
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
    "id": "qr4_park_blocking_hydrant",
    "categoryId": "parking",
    "prompt": "Parking in front of a fire hydrant is prohibited because:",
    "options": [
      "It costs the fire service time they may not have — they cannot wait for you to move",
      "Vehicles corrode from the water",
      "Hydrants are municipal property that may not be approached",
      "It is only prohibited during dry seasons"
    ],
    "correctIndex": 0,
    "explanation": "Crews connect to the nearest hydrant on arrival. A car parked over it means either a longer run of hose or a broken window to pass one through.",
    "difficulty": 1,
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
    "id": "qm_stop_rail_reserve",
    "categoryId": "parking",
    "prompt": "Stopping within the rail reserve at a level crossing is:",
    "options": [
      "Prohibited",
      "Permitted while the boom is up",
      "Permitted if you stay in the vehicle",
      "Permitted for up to two minutes"
    ],
    "correctIndex": 0,
    "explanation": "A train cannot swerve and cannot stop in the distance it can see you. Never enter a crossing at all unless the road beyond is clear enough for you to leave it.",
    "difficulty": 1,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q_park_no_stopping",
    "categoryId": "parking",
    "prompt": "A 'no stopping' restriction (red circle / red kerb line) means:",
    "options": [
      "You may stop briefly to drop off passengers",
      "You may not stop at all, even momentarily, in that zone",
      "You may park for under 5 minutes",
      "You may stop only to load goods"
    ],
    "correctIndex": 1,
    "explanation": "No stopping prohibits stopping for any reason in the zone — stricter than no parking, which only prohibits leaving the vehicle parked.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr3_fd_dazzle_gap",
    "categoryId": "following_distance",
    "prompt": "Dazzled by the headlights of an oncoming vehicle at night, you should:",
    "options": [
      "Look to the left edge of the road, slow down, and keep your distance from anything ahead",
      "Look directly at the lights so your eyes adjust faster",
      "Switch your own lights to main beam in response",
      "Close one eye until they have passed"
    ],
    "correctIndex": 0,
    "explanation": "Looking away from the source preserves what night vision you have, and the left edge still gives you the road's line. Speed is the only other thing you control.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_fd_approach_queue",
    "categoryId": "following_distance",
    "prompt": "Approaching stationary or slowing traffic ahead, you should:",
    "options": [
      "Keep your speed and brake hard at the last moment",
      "Ease off early and slow gradually, arriving with a gap rather than stopping abruptly",
      "Change lanes without looking",
      "Close right up to the car in front"
    ],
    "correctIndex": 1,
    "explanation": "Braking early and smoothly warns the driver behind and keeps a buffer if the queue lurches. Late, hard braking is how rear-end concertinas start.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q3_fd_two_second_how",
    "categoryId": "following_distance",
    "prompt": "How do you actually measure a 2-second following distance?",
    "options": [
      "Stay two car-lengths behind at any speed",
      "When the vehicle ahead passes a fixed point, count 'one-thousand-and-one, one-thousand-and-two' — you must not reach that point before you finish",
      "Keep the vehicle's tyres visible in your windscreen",
      "Stay 20 metres behind"
    ],
    "correctIndex": 1,
    "explanation": "The 2-second rule self-adjusts to speed: pick a pole or mark, and count from when the car ahead passes it. Reaching it early means you're too close.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "q2_fd_reaction_100",
    "categoryId": "following_distance",
    "prompt": "At 100 km/h, roughly how far do you travel during one second of reaction time?",
    "options": [
      "About 5 metres",
      "About 28 metres",
      "About 100 metres",
      "About 60 metres"
    ],
    "correctIndex": 1,
    "explanation": "100 km/h ≈ 28 m per second — before your foot even reaches the brake. That's why tailgating at speed leaves no physical way to stop in time.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "q3_fd_tailgater",
    "categoryId": "following_distance",
    "prompt": "A vehicle is tailgating you. The defensive response is to:",
    "options": [
      "Brake sharply to warn them off",
      "Increase YOUR following distance ahead and let them pass when safe",
      "Speed up to restore their gap",
      "Ignore it — their gap is their problem"
    ],
    "correctIndex": 1,
    "explanation": "You can't control their gap, only yours. More space ahead lets you brake gently and early, protecting both of you; then let the tailgater by.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q3_fd_wet",
    "categoryId": "following_distance",
    "prompt": "In rain or poor visibility, your following distance should become:",
    "options": [
      "2 seconds — the rule never changes",
      "At least 4 seconds — braking distances roughly double on a wet road",
      "1 second, to see past the spray",
      "Whatever the car behind you allows"
    ],
    "correctIndex": 1,
    "explanation": "Wet tar gives less grip and spray hides hazards. Doubling the gap to 4 seconds buys back the braking distance the water took away.",
    "difficulty": 1,
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
    "id": "qr2_following_reason_space",
    "categoryId": "following_distance",
    "prompt": "The single biggest benefit of a generous following distance is that it:",
    "options": [
      "Buys time — the one thing you cannot manufacture once something goes wrong",
      "Reduces fuel consumption",
      "Lets you travel faster overall",
      "Keeps your vehicle cleaner in the wet"
    ],
    "correctIndex": 0,
    "explanation": "Every emergency response you have — braking, steering, deciding — is bought with time. Distance is simply how you store it in advance.",
    "difficulty": 1,
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
  }
];

export const STARTER_FLASHCARDS: Flashcard[] = [
  {
    "id": "fcd_qs4_general_warning_plate",
    "categoryId": "signs",
    "front": "A warning triangle showing an exclamation mark usually means:",
    "back": "It is the catch-all for anything without its own symbol. Without reading the plate underneath you know only that something is coming, which is precisely half the message.",
    "difficulty": 2,
    "image": "/signs/warning/warning-029-03.png"
  },
  {
    "id": "fcd_qs3_parking_reservation",
    "categoryId": "signs",
    "front": "A blue sign marking an area reserved for parking tells you:",
    "back": "Parking is permitted in that area, subject to any plate beneath the sign — Blue reservation signs permit rather than prohibit. The plate underneath is what narrows it — a vehicle class, a time limit or a payment requirement.",
    "difficulty": 2,
    "image": "/signs/regulatory/regulatory-014-01.png"
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
    "id": "fc4_grammar_yellow_bg",
    "categoryId": "signs",
    "front": "Sign on a yellow background?",
    "back": "Temporary (roadworks) — same legal force as the permanent white version.",
    "difficulty": 1
  },
  {
    "id": "fcd_qs2_blue_vs_red_circle",
    "categoryId": "signs",
    "front": "The essential difference between a blue circular sign and a red-ringed circular sign is that:",
    "back": "Both are compulsory — the difference is direction. Blue commands an action, red forbids one. Reading the shape and colour first tells you which kind of instruction you are getting.",
    "difficulty": 2
  },
  {
    "id": "fcd_gen-sign-information-045-06-name",
    "categoryId": "signs",
    "front": "Which sign is this?",
    "back": "This is the information sign \"Blind people plate\". Blind people.",
    "difficulty": 2,
    "image": "/signs/information/information-045-06.png"
  },
  {
    "id": "fcd_qs2_delineator_posts",
    "categoryId": "signs",
    "front": "Reflective marker posts spaced along the edge of a rural road are there mainly to:",
    "back": "Show the line of the road ahead at night or in poor visibility — They trace the road's course beyond your headlights, so you can read a curve before you are in it. They are guidance, not permission to use the verge.",
    "difficulty": 2
  },
  {
    "id": "fc2_brown_signs",
    "categoryId": "signs",
    "front": "Brown road signs?",
    "back": "Tourism guidance — attractions and places of interest.",
    "difficulty": 1
  },
  {
    "id": "fcd_gen-sign-warning-029-01-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Slippery road ahead: Slippery road ahead, especially when wet. Drive with caution.",
    "difficulty": 3,
    "image": "/signs/warning/warning-029-01.png"
  },
  {
    "id": "fc4_mark_arrows",
    "categoryId": "signs",
    "front": "Painted lane arrow — advisory or law?",
    "back": "Regulatory: in an arrow lane you must move in that direction, even if there by mistake.",
    "difficulty": 2
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
    "id": "fc4_circle_cmd",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-009-07.png",
    "front": "Blue circular-arrows sign at a junction?",
    "back": "Traffic circle: circulate clockwise; yield per circle rules.",
    "difficulty": 2
  },
  {
    "id": "fsg_red_cross_cancels",
    "categoryId": "signs",
    "front": "What does a red diagonal cross over a sign mean?",
    "back": "It cancels the sign — the restriction or condition it named stops applying from that point. That is how 'end of toll road' and 'end of headlights-on' are shown.",
    "difficulty": 2
  },
  {
    "id": "fcd_q6_mark_white_edge",
    "categoryId": "signs",
    "front": "A continuous WHITE line along the left edge of your lane is:",
    "back": "The edge (fog) line marking the left boundary of the travelled lane — useful in poor visibility — The white edge line shows where your lane ends and the shoulder begins. In rain or mist it's a vital reference for staying in lane.",
    "difficulty": 2
  },
  {
    "id": "fc4_grammar_circle_red",
    "categoryId": "signs",
    "front": "Red-ringed circle?",
    "back": "Prohibition — the action/vehicle shown is forbidden.",
    "difficulty": 1
  },
  {
    "id": "fcd_qs2_mass_limit",
    "categoryId": "signs",
    "front": "A red-bordered round sign showing a mass in tonnes means:",
    "back": "Mass restrictions protect bridges and weak surfaces. Exceeding one risks a collapse, so it is enforced against the driver regardless of who loaded the vehicle.",
    "difficulty": 2
  },
  {
    "id": "fc6_keep_clear",
    "categoryId": "signs",
    "front": "'KEEP CLEAR' painted on the road?",
    "back": "Leave it open — never stop or queue over it.",
    "difficulty": 1
  },
  {
    "id": "fcd_gen-sign-warning-028-03-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Uneven road ahead: Temporary uneven, potholed, or bumpy road surface ahead.",
    "difficulty": 3,
    "image": "/signs/warning/warning-028-03.png"
  },
  {
    "id": "fcd_gen-sign-regulatory-021-03-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "This regulatory sign: Overtaking prohibited for the next 2km.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-021-03.png"
  },
  {
    "id": "fc4_mark_across",
    "categoryId": "signs",
    "front": "Line ACROSS your lane: solid vs broken?",
    "back": "Solid = stop line. Broken = yield line.",
    "difficulty": 1
  },
  {
    "id": "fc_robot_red",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-022-01.png",
    "front": "Steady red robot?",
    "back": "Stop behind the line and wait until it turns green and the way is clear.",
    "difficulty": 1
  },
  {
    "id": "fc6_studs_colours",
    "categoryId": "signs",
    "front": "Cat's-eye stud colours (SA)?",
    "back": "White = lanes/centre · red = left edge · yellow = right edge.",
    "difficulty": 3
  },
  {
    "id": "fc_divided",
    "categoryId": "rules",
    "front": "Crossing a road's dividing line?",
    "back": "Stay left of it. Never cross a solid division; cross a broken one only to overtake or make a legal U-turn.",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_rules_caravan_people",
    "categoryId": "rules",
    "front": "May passengers ride inside a caravan or trailer while it is being towed?",
    "back": "No — no person may be carried in a towed caravan or trailer — Riding in a towed caravan or trailer is prohibited — it has no crash protection and the combination can sway or detach.",
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
    "id": "fca_when_added",
    "categoryId": "rules",
    "front": "When are demerit points added?",
    "back": "When the fine is paid, an enforcement order is issued, or you're convicted in court.",
    "difficulty": 3
  },
  {
    "id": "fc5_freeway_banned",
    "categoryId": "rules",
    "front": "Banned from freeways?",
    "back": "Pedestrians, animals, pedal cycles, motorcycles under 50 cm³.",
    "difficulty": 2
  },
  {
    "id": "fmr_freeway_learner",
    "categoryId": "rules",
    "front": "Can you drive on a freeway with a learner's licence?",
    "back": "Yes — provided you are accompanied by someone holding a valid driving licence of the same category, exactly as on any other road.",
    "difficulty": 2
  },
  {
    "id": "fca_meaning",
    "categoryId": "rules",
    "front": "What does AARTO stand for?",
    "back": "Administrative Adjudication of Road Traffic Offences — the demerit + fine system.",
    "difficulty": 1
  },
  {
    "id": "fc_ped_rights",
    "categoryId": "rules",
    "front": "Hit a pedestrian — who is prosecuted?",
    "back": "The driver, irrespective of who had right of way. Drive defensively around pedestrians.",
    "difficulty": 3
  },
  {
    "id": "fcd_q8_ctrl_cover_brake",
    "categoryId": "controls",
    "front": "'Covering the brake' means:",
    "back": "Near schools, crossings and blind spots, hovering over the brake shaves crucial metres off your reaction — you're already halfway to stopping if a child steps out.",
    "difficulty": 2
  },
  {
    "id": "fc_accelerator",
    "categoryId": "controls",
    "front": "Function of the accelerator?",
    "back": "Controls engine power to increase or ease the vehicle's speed.",
    "difficulty": 1
  },
  {
    "id": "fcd_q8_ctrl_right_gear",
    "categoryId": "controls",
    "front": "Choosing the correct gear for your speed means:",
    "back": "The right gear keeps the engine in its comfortable range, ready to respond. Too high labours and stalls; too low over-revs and wastes control and fuel.",
    "difficulty": 2
  },
  {
    "id": "fc8_reverse_look",
    "categoryId": "controls",
    "front": "Observing while reversing?",
    "back": "Look over your shoulder through the rear window — not just mirrors/camera.",
    "difficulty": 2
  },
  {
    "id": "fc_clutch_control",
    "categoryId": "controls",
    "front": "What is the clutch 'biting point'?",
    "back": "Where the clutch just starts to take up drive and the car won't roll — key for hill starts and slow control.",
    "difficulty": 2
  },
  {
    "id": "fcd_qx_ctrl_blind_spot_meaning",
    "categoryId": "controls",
    "front": "The 'blind spot' is:",
    "back": "Mirrors cannot cover everything — a vehicle alongside and slightly behind can sit completely unseen. That is why K53 asks for a physical head check, not just a mirror glance, before you change direction.",
    "difficulty": 1
  },
  {
    "id": "fm_biting_point_revs",
    "categoryId": "controls",
    "front": "What do the revs do at the biting point?",
    "back": "Set about 1 000 r/min, ease the clutch out, and the revs drop to around 750 as the engine takes up the car's weight. Without a rev counter: the bonnet lifts slightly.",
    "difficulty": 3
  },
  {
    "id": "fc8_hands_on",
    "categoryId": "controls",
    "front": "Hands while driving?",
    "back": "Both on the wheel except briefly to change gear or use a control.",
    "difficulty": 1
  },
  {
    "id": "fc_box_clear",
    "categoryId": "intersections",
    "front": "Green light but the intersection is blocked?",
    "back": "Wait behind the line — never enter an intersection you can't clear.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_int_green_arrow",
    "categoryId": "intersections",
    "front": "A green arrow shown at a traffic signal means:",
    "back": "You may go only in the direction of the arrow, when safe — A green arrow gives right of way to move in the direction it points, provided the way is clear. Other movements must still wait for their signal.",
    "difficulty": 2
  },
  {
    "id": "fc3_int_dead_robot",
    "categoryId": "intersections",
    "front": "Traffic lights out of order?",
    "back": "Treat as a 4-way stop: full stop, proceed in order of arrival, expect others not to.",
    "difficulty": 1
  },
  {
    "id": "fcd_q2_int_green_ped_still",
    "categoryId": "intersections",
    "front": "Your light turns green but an elderly pedestrian is still crossing your side. You must:",
    "back": "Wait until they have safely cleared your path before moving — Pedestrians lawfully in the intersection keep right of way until they've crossed. Green lets you go only when the way is actually clear.",
    "difficulty": 1
  },
  {
    "id": "fc2_red_arrow",
    "categoryId": "intersections",
    "front": "Steady red arrow?",
    "back": "That movement stops — even if the main light is green.",
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
    "id": "fcd_q2_int_uncontrolled",
    "categoryId": "intersections",
    "front": "You approach an intersection with no signs, robots or markings. You must:",
    "back": "An uncontrolled intersection still has rules: approach at a speed that lets you stop, and yield to traffic that reaches or enters it before you do.",
    "difficulty": 2
  },
  {
    "id": "fc_skid",
    "categoryId": "hazard_awareness",
    "front": "Rear wheels start to skid?",
    "back": "Ease off the power and steer gently into the slide; avoid harsh braking or steering.",
    "difficulty": 3
  },
  {
    "id": "fc_aquaplane",
    "categoryId": "hazard_awareness",
    "front": "If you start to aquaplane?",
    "back": "Ease off the accelerator, hold the wheel steady, avoid hard braking until grip returns.",
    "difficulty": 3
  },
  {
    "id": "fcd_q_haz_brake_fail",
    "categoryId": "hazard_awareness",
    "front": "Your foot brake suddenly fails while driving. Your first actions should be:",
    "back": "If the service brake fails, pump the pedal, change down for engine braking and apply the handbrake gradually (not violently) while steering to a safe stop and warning others.",
    "difficulty": 3
  },
  {
    "id": "fcd_q_haz_skid",
    "categoryId": "hazard_awareness",
    "front": "Your rear wheels begin to skid to the right. You should:",
    "back": "To correct a skid, ease off the power and steer gently into the slide (the direction the rear is going) to regain alignment. Harsh braking or steering makes it worse.",
    "difficulty": 3
  },
  {
    "id": "fcd_q_haz_children",
    "categoryId": "hazard_awareness",
    "front": "You are driving past a parked ice-cream van with children nearby. You should:",
    "back": "Slow down and cover the brake, anticipating a child running into the road — Children are unpredictable and may run out without looking. Reduce speed, cover the brake and be ready to stop.",
    "difficulty": 2
  },
  {
    "id": "fc11_park_bridge",
    "categoryId": "parking",
    "front": "Stopping on/under a bridge or on a narrow section of road?",
    "back": "A no-stopping situation — you may not stop there at all.",
    "difficulty": 2
  },
  {
    "id": "fmr_abandoned",
    "categoryId": "parking",
    "front": "When does a parked vehicle count as abandoned?",
    "back": "After **24 hours** outside an urban area, or **7 days** within one — or immediately if it obstructs, sits in a prohibited or no-stopping area, or has no licence or registration number. Abandoned vehicles are removed and impounded.",
    "difficulty": 3
  },
  {
    "id": "fc11_park_freeway",
    "categoryId": "parking",
    "front": "Stopping or parking on a freeway?",
    "back": "Prohibited except in a genuine emergency (or where an authorised sign allows it).",
    "difficulty": 1
  },
  {
    "id": "fc3_park_unattended",
    "categoryId": "parking",
    "front": "Leaving the car unattended?",
    "back": "Engine off, handbrake set, vehicle secured so it can't move or be driven away.",
    "difficulty": 1
  },
  {
    "id": "fc9_corner",
    "categoryId": "parking",
    "front": "Why not park on a bend/crest?",
    "back": "Your car cuts visibility — others see the hazard too late.",
    "difficulty": 2
  },
  {
    "id": "fc3_fd_queue",
    "categoryId": "following_distance",
    "front": "Gap when stopped in a queue?",
    "back": "See the rear tyres of the car ahead touching the tar — enough room to steer out without reversing.",
    "difficulty": 2
  },
  {
    "id": "fc_truck_gap",
    "categoryId": "following_distance",
    "front": "Following a heavy truck?",
    "back": "Leave a bigger gap (about 6 s) — it blocks your view and needs more room to stop.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_fd_tailgated",
    "categoryId": "following_distance",
    "front": "If the vehicle behind you is following too closely (tailgating), the safest response is to:",
    "back": "Increase your own following distance to the car ahead and let them pass — Tailgating removes your safety buffer. Increase the gap in front so you can brake gently, and allow the tailgater to overtake when it is safe.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_fd_night",
    "categoryId": "following_distance",
    "front": "At night or in fog, your following distance should be:",
    "back": "Increased, because you can see less and need more reaction time — Reduced visibility shortens how far ahead you can see hazards, so increase your gap and reduce speed at night and in fog.",
    "difficulty": 2
  },
  {
    "id": "fc9_erratic",
    "categoryId": "following_distance",
    "front": "Car ahead weaving/braking oddly?",
    "back": "Increase your gap — you need more reaction time.",
    "difficulty": 1
  }
];

/** Scenarios are a paid feature (PlanLimits.scenarios is false on free). */
export const STARTER_SCENARIOS: Scenario[] = [];
