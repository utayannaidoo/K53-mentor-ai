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
    "id": "qm_incline_neutral_purpose",
    "categoryId": "controls",
    "prompt": "On the incline start you are required to put the gear into neutral after stopping. The reason is to:",
    "options": [
      "Prove that the parking brake alone holds the vehicle on the slope",
      "Let the engine idle down",
      "Save fuel while waiting",
      "Make the gear easier to select afterwards"
    ],
    "correctIndex": 0,
    "explanation": "In gear with the clutch down, you cannot tell whether the brake is holding the car or the transmission is. Neutral removes the doubt — which is the whole point of testing an incline start.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qm_str_eng_penalty",
    "categoryId": "controls",
    "prompt": "On the road test, failing to start the engine first time costs:",
    "options": [
      "One point for every attempt after the first",
      "Nothing — you may try as often as you like",
      "Five points",
      "An immediate failure on the second attempt"
    ],
    "correctIndex": 0,
    "explanation": "Cheap individually, but it compounds, and repeated cranking usually means a step of the starting procedure was skipped rather than a fault with the car.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qm_yard_sig_can_cost",
    "categoryId": "controls",
    "prompt": "Leaving your indicator on after finishing a yard manoeuvre costs:",
    "options": [
      "4 points",
      "1 point",
      "Nothing if it self-cancels later",
      "The test is stopped"
    ],
    "correctIndex": 0,
    "explanation": "A signal that outlives the manoeuvre tells everyone around you that you are still about to move, which is worse than no signal at all. Cancelling is scored separately from signalling, at 4 points.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qm_gear_change_cornering",
    "categoryId": "controls",
    "prompt": "Changing gear while you are actually cornering costs:",
    "options": [
      "4 points",
      "1 point",
      "Nothing",
      "An immediate failure"
    ],
    "correctIndex": 0,
    "explanation": "It takes a hand off the wheel at the moment you most need both. Choose the gear before the corner and leave it alone until you are straight.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q_ctrl_handbrake",
    "categoryId": "controls",
    "prompt": "Before starting the engine during the K53 pre-trip routine, the handbrake should be:",
    "options": [
      "Released",
      "Fully engaged",
      "Half engaged",
      "Removed"
    ],
    "correctIndex": 1,
    "explanation": "The handbrake must be fully engaged before you start the vehicle so it cannot roll. This is a marked item in the K53 starting procedure.",
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
    "id": "qm_gear_coasting",
    "categoryId": "controls",
    "prompt": "Selecting neutral before the vehicle has stopped ('gear coasting') costs:",
    "options": [
      "3 points",
      "1 point",
      "Nothing",
      "An immediate failure"
    ],
    "correctIndex": 0,
    "explanation": "In neutral the engine can no longer help slow or steady the car, and you cannot accelerate out of trouble. Stay in gear until the vehicle is stopped, then select neutral.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qm_yard_obs_cost",
    "categoryId": "controls",
    "prompt": "Failing to do the full 360° observation before a yard movement costs you:",
    "options": [
      "5 points",
      "1 point",
      "2 points",
      "Nothing — it is only a recommendation"
    ],
    "correctIndex": 0,
    "explanation": "Observation is the most expensive single item on the yard sheet at 5 points, and it is scored on every movement. Two missed checks cost more than most learners lose in the whole rest of the test.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q8_ctrl_moving_off_look",
    "categoryId": "controls",
    "prompt": "Just before pulling away from the kerb, in addition to your mirrors you must:",
    "options": [
      "Sound the hooter",
      "Glance over your right shoulder to check the blind spot for traffic and cyclists",
      "Rev the engine",
      "Switch on your hazards"
    ],
    "correctIndex": 1,
    "explanation": "Mirrors miss the blind spot beside and behind you. A shoulder glance before moving off catches the cyclist or car the mirror never showed.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qc3_fog_lights_use",
    "categoryId": "controls",
    "prompt": "Rear fog lights should be:",
    "options": [
      "Switched on only when visibility is genuinely poor, and off again once it clears",
      "Left on at night for extra visibility",
      "Used instead of headlights in rain",
      "Used whenever you are on a freeway"
    ],
    "correctIndex": 0,
    "explanation": "A rear fog light is far brighter than a tail light. In clear conditions it dazzles the driver behind and masks your brake lights — the opposite of what you want them to see.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qm_pretrip_fluids_declaration",
    "categoryId": "controls",
    "prompt": "Under the bonnet, the pre-trip inspection expects you to account for:",
    "options": [
      "Oil, water, brake fluid and the condition of the visible engine belts",
      "Only the oil level",
      "Battery terminals and spark plugs",
      "Nothing — the bonnet is not part of the check"
    ],
    "correctIndex": 0,
    "explanation": "Four fluids-and-belts items, and you may state that you have checked them rather than dismantling anything. A snapped belt strands you as surely as an empty tank.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qc3_over_revving",
    "categoryId": "controls",
    "prompt": "Holding the engine near the top of the rev counter between gear changes:",
    "options": [
      "Wastes fuel and stresses the engine without adding useful acceleration",
      "Is necessary to keep the engine from stalling",
      "Improves fuel consumption",
      "Is required before every gear change"
    ],
    "correctIndex": 0,
    "explanation": "Past a point the engine is making noise rather than progress. Changing up as the car gains speed is quieter, cheaper and easier on the machinery.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qm_yard_stall_cost",
    "categoryId": "controls",
    "prompt": "You stall during a yard manoeuvre. The correct response is to:",
    "options": [
      "Lose one point, then restart using the full starting procedure",
      "Restart immediately in gear and carry on",
      "Abandon the manoeuvre and ask to begin the test again",
      "Wait for the examiner to restart the vehicle for you"
    ],
    "correctIndex": 0,
    "explanation": "A stall is a single point, so it is recoverable — but the recovery is scored too. Go back through the whole starting procedure rather than stabbing at the key, or you turn one cheap point into several.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qc3_convex_mirror_distance",
    "categoryId": "controls",
    "prompt": "A convex (curved) door mirror gives a wider view but:",
    "options": [
      "Makes vehicles appear smaller and further away than they really are",
      "Makes vehicles appear closer than they really are",
      "Shows an accurate distance in all conditions",
      "Removes the blind spot entirely"
    ],
    "correctIndex": 0,
    "explanation": "The wider field comes at the cost of scale, so a car that looks comfortably back may be right beside you. It is another reason the blind-spot check is a head turn, not a glance.",
    "difficulty": 3,
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
    "id": "qm_sim_obs_before_signal",
    "categoryId": "controls",
    "prompt": "In the yard sequence checks, the 360° observation is done:",
    "options": [
      "Before you indicate",
      "After you indicate",
      "Only if the examiner is watching",
      "At the same time as releasing the parking brake"
    ],
    "correctIndex": 0,
    "explanation": "You look first, then announce. Indicating before you have looked commits you to a direction you have not yet checked is safe — and the examiner scores the order, not just the fact that both happened.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qc3_block_gear_change",
    "categoryId": "controls",
    "prompt": "Changing directly from a higher gear to a much lower one (for example fifth to second) when slowing:",
    "options": [
      "Is acceptable when the road speed suits the gear you select — you need not work down through every gear",
      "Is always wrong; every gear must be used in turn",
      "Will damage the gearbox in any modern car",
      "Is only permitted in an automatic"
    ],
    "correctIndex": 0,
    "explanation": "Brakes do the slowing; gears match the engine to the speed you have reached. Selecting the gear that suits that speed is both smoother and less work than shuffling down through each one.",
    "difficulty": 3,
    "scope": "learners"
  },
  {
    "id": "qm_alley_two_attempts",
    "categoryId": "controls",
    "prompt": "How many attempts are you allowed at alley docking?",
    "options": [
      "Two",
      "One",
      "Three",
      "As many as fit inside the time limit"
    ],
    "correctIndex": 0,
    "explanation": "Two — provided the first attempt did not roll and did not touch a pole. Knowing you have a spare is worth a lot: it stops the panicky over-correction that causes pole contact in the first place.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "qx_ctrl_speedometer",
    "categoryId": "controls",
    "prompt": "The speedometer's role while you drive is to:",
    "options": [
      "Tell you your road speed so you can match it to the limit and conditions",
      "Show how many kilometres the vehicle has travelled in total",
      "Show how hard the engine is working",
      "Indicate how much fuel remains"
    ],
    "correctIndex": 0,
    "explanation": "Speed is judged on the instrument, not on feel — you acclimatise to speed quickly, which is exactly why you must glance at the speedometer rather than trust your senses.",
    "difficulty": 1,
    "scope": "learners"
  },
  {
    "id": "qr5_yield_to_right_circle",
    "categoryId": "intersections",
    "prompt": "At a mini-circle where vehicles arrive at the same time from different arms, priority goes to:",
    "options": [
      "The vehicle on the right, once anything already in the circle has cleared",
      "The largest vehicle",
      "Whoever enters the circle fastest",
      "The vehicle going straight ahead"
    ],
    "correctIndex": 0,
    "explanation": "Traffic already circulating clears first, and simultaneous arrivals resolve by the right-hand rule. Mini-circles work on courtesy as much as on rules, so arrive slowly.",
    "difficulty": 2,
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
    "id": "q7_int_circle_signal_exit",
    "categoryId": "intersections",
    "prompt": "Inside a traffic circle, when should you switch on your LEFT indicator?",
    "options": [
      "Never — indicators aren't used in circles",
      "As you pass the exit BEFORE the one you intend to take",
      "Only after you've left the circle",
      "Before entering the circle"
    ],
    "correctIndex": 1,
    "explanation": "Signalling left as you pass the previous exit tells following and waiting drivers you're about to leave, so they can move. It's the courtesy that keeps circles flowing.",
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
    "id": "qr4_flashing_amber_signal",
    "categoryId": "intersections",
    "prompt": "A traffic signal showing a single flashing amber means:",
    "options": [
      "Proceed with caution, giving way as the situation requires",
      "Stop completely, as at a stop sign",
      "The signal is out of order and rules do not apply",
      "You have absolute right of way"
    ],
    "correctIndex": 0,
    "explanation": "A flashing amber hands the judgement back to you. It is a warning to approach ready to yield, not a licence to carry on at speed.",
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
    "id": "qr2_left_turn_cyclist",
    "categoryId": "intersections",
    "prompt": "Before turning left at a junction, the road user most easily missed is:",
    "options": [
      "A cyclist or motorcyclist coming up on your left, alongside or just behind you",
      "A vehicle approaching from the right",
      "A pedestrian on the far side of the junction",
      "A vehicle following directly behind you"
    ],
    "correctIndex": 0,
    "explanation": "Turning left sweeps your vehicle across exactly where a cyclist would be. A mirror check plus a glance over the left shoulder is what finds them.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr3_yield_line_position",
    "categoryId": "intersections",
    "prompt": "The broken line painted across your lane at a yield sign marks:",
    "options": [
      "The point at which you must be able to give way to traffic on the road you are joining",
      "A place you must always come to a complete stop",
      "The boundary of a pedestrian crossing",
      "Where the speed limit changes"
    ],
    "correctIndex": 0,
    "explanation": "The line is where the obligation bites. You need not stop on it if the way is genuinely clear, but you must arrive slowly enough that stopping there is still possible.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q7_int_observation_sequence",
    "categoryId": "intersections",
    "prompt": "The correct order of actions before turning at a junction is:",
    "options": [
      "Turn, then signal",
      "Mirrors, signal in good time, blind-spot check, then turn",
      "Signal and turn at the same moment",
      "Blind spot only, then turn"
    ],
    "correctIndex": 1,
    "explanation": "Mirror–signal–blind spot–manoeuvre. Signalling early tells others your plan; the blind-spot check catches what mirrors miss before you commit.",
    "difficulty": 1,
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
    "id": "qr5_hz_eating_driving",
    "categoryId": "hazard_awareness",
    "prompt": "Eating, drinking or reaching for something while driving matters because:",
    "options": [
      "It can leave you without proper control, which is an offence regardless of whether anything is spilled",
      "It is specifically banned by name in the regulations",
      "It only matters in a manual vehicle",
      "It is only a problem on freeways"
    ],
    "correctIndex": 0,
    "explanation": "There is no separate offence for a sandwich — the duty to remain in full control covers it. A hot drink spilled at the wrong moment is how that duty gets tested.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q2_haz_night_rural",
    "categoryId": "hazard_awareness",
    "prompt": "Driving through an unlit rural area at night, the biggest pedestrian danger is:",
    "options": [
      "Pedestrians always carry lights, so there's little danger",
      "People in dark clothing walking on or beside the road — often invisible until very close",
      "Pedestrians only cross at marked crossings",
      "Reflective clothing dazzling you"
    ],
    "correctIndex": 1,
    "explanation": "Dark-clothed pedestrians (sometimes impaired) on unlit roads are among SA's biggest night-time killers. Slow down, use main beam when no traffic is around, and scan the verges.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qmr_stationary_bus",
    "categoryId": "hazard_awareness",
    "prompt": "Passing a stationary bus, you should be especially alert for:",
    "options": [
      "Passengers stepping out from in front of or behind it",
      "The bus pulling off without indicating",
      "Luggage falling from the roof",
      "The bus reversing"
    ],
    "correctIndex": 0,
    "explanation": "A bus is a solid wall you cannot see past, and the people it just released are crossing the road it hides. Slow down and widen your line.",
    "difficulty": 2,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
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
    "id": "q_haz_brake_fail",
    "categoryId": "hazard_awareness",
    "prompt": "Your foot brake suddenly fails while driving. Your first actions should be:",
    "options": [
      "Switch off the engine and steer hard",
      "Pump the brake, change to a lower gear and use the handbrake gently while steering to safety",
      "Jump out of the vehicle",
      "Accelerate to a service station"
    ],
    "correctIndex": 1,
    "explanation": "If the service brake fails, pump the pedal, change down for engine braking and apply the handbrake gradually (not violently) while steering to a safe stop and warning others.",
    "difficulty": 3,
    "scope": "learners"
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
    "id": "qr2_hazard_scan_pattern",
    "categoryId": "hazard_awareness",
    "prompt": "Good scanning while driving means you:",
    "options": [
      "Keep your eyes moving — far ahead, near, mirrors, instruments — rather than fixing on one point",
      "Stare at the vehicle immediately ahead so you react to it fastest",
      "Watch the road surface just in front of your bonnet",
      "Check your mirrors only before a manoeuvre"
    ],
    "correctIndex": 0,
    "explanation": "A fixed stare stops finding new information within seconds. Moving eyes build a picture that includes things not yet in your path.",
    "difficulty": 2,
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
    "id": "qr4_hz_first_rain_oil",
    "categoryId": "hazard_awareness",
    "prompt": "The road is at its most slippery:",
    "options": [
      "In the first minutes of rain after a long dry spell, when oil and rubber lift off the surface",
      "After several hours of steady rain",
      "Once the rain has stopped and the road is drying",
      "Only when the temperature is near freezing"
    ],
    "correctIndex": 0,
    "explanation": "Dry weather leaves a film of oil, diesel and rubber dust. The first rain floats it rather than washing it away, and grip is worse then than in a downpour an hour later.",
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
    "id": "qm_park_actuating_mechanism",
    "categoryId": "parking",
    "prompt": "Parking on the actuating mechanism of a traffic signal is:",
    "options": [
      "Prohibited — it is the sensor that tells the signal a vehicle is waiting",
      "Permitted outside peak hours",
      "Permitted, since it cannot be damaged by a parked car",
      "Only prohibited for heavy vehicles"
    ],
    "correctIndex": 0,
    "explanation": "The loop buried in the road surface is how the intersection knows to give your direction a green. A car parked on it can leave a whole approach permanently skipped.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q_park_crossing",
    "categoryId": "parking",
    "prompt": "You may not stop your vehicle within how many metres of a pedestrian crossing?",
    "options": [
      "3 metres",
      "9 metres",
      "15 metres",
      "There is no restriction"
    ],
    "correctIndex": 1,
    "explanation": "You may not stop within 9 metres of a pedestrian crossing on the approach side, because it blocks other drivers' view of pedestrians.",
    "difficulty": 3,
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
    "id": "qm_park_sidewalk_hawker",
    "categoryId": "parking",
    "prompt": "The general ban on parking on the sidewalk has one recognised exception, for:",
    "options": [
      "A vehicle being used by a street vendor or hawker",
      "Any vehicle displaying hazard lights",
      "Deliveries of under fifteen minutes",
      "Vehicles too wide for the roadway"
    ],
    "correctIndex": 0,
    "explanation": "A narrow exception, and not a general licence to mount the pavement. The sidewalk belongs to pedestrians — including wheelchair users and parents with prams, who have to enter the road to get around you.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "q_park_facing",
    "categoryId": "parking",
    "prompt": "When parking on a public road, your vehicle should be:",
    "options": [
      "Facing oncoming traffic on the right side",
      "Parked on the left, facing the direction of travel",
      "Parked anywhere convenient",
      "Double-parked if no space is open"
    ],
    "correctIndex": 1,
    "explanation": "Park as near as possible to the left edge of the roadway, facing the direction of travel, within a demarcated bay where one is provided.",
    "difficulty": 2,
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
    "id": "q9_park_secure_steep",
    "categoryId": "parking",
    "prompt": "To secure a manual car parked on a steep slope, you should:",
    "options": [
      "Rely on the handbrake alone",
      "Apply the handbrake firmly AND leave it in gear (first uphill, reverse downhill)",
      "Leave it in neutral so it can be pushed",
      "Just chock one wheel"
    ],
    "correctIndex": 1,
    "explanation": "On a steep hill the handbrake alone can slip. A engaged gear (or 'P' on an automatic) plus wheels turned to the kerb/edge is the belt-and-braces the K53 wants.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qm_ped_crossing_approach_side",
    "categoryId": "parking",
    "prompt": "The 9 m rule at a pedestrian crossing applies specifically to the approach side. The reason is:",
    "options": [
      "A vehicle stopped there hides waiting pedestrians from drivers coming up behind",
      "Pedestrians always cross from that side",
      "It gives buses room to pull in",
      "It marks where the road markings begin"
    ],
    "correctIndex": 0,
    "explanation": "Everything about the crossing depends on the approaching driver seeing someone about to step out. Park in that nine metres and you have removed their only warning.",
    "difficulty": 3,
    "scope": "learners",
    "source": "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed."
  },
  {
    "id": "qr3_park_verge_services",
    "categoryId": "parking",
    "prompt": "Parking with two wheels up on a grass verge in a suburban street:",
    "options": [
      "Can obstruct pedestrians and damage what is buried under it, and is not a right you have",
      "Is always acceptable if it keeps the road clear",
      "Is acceptable provided the verge is dry",
      "Is only a problem for heavy vehicles"
    ],
    "correctIndex": 0,
    "explanation": "The verge is the pedestrian's road, and pushing them into the traffic lane — especially someone with a pram or a wheelchair — is the cost of that convenience.",
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
    "id": "q3_fd_night",
    "categoryId": "following_distance",
    "prompt": "At night your safe speed and following distance should let you stop:",
    "options": [
      "Within the distance lit by your headlights",
      "Within 10 metres",
      "Anywhere — brake lights ahead give enough warning",
      "Within the length of two cars"
    ],
    "correctIndex": 0,
    "explanation": "You can only avoid what you can see. Driving so fast that your stopping distance exceeds your headlights' reach means overdriving your lights.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "q9_fd_worn_loaded",
    "categoryId": "following_distance",
    "prompt": "Your car is fully loaded with passengers and luggage. Compared with driving alone, your following distance should be:",
    "options": [
      "Shorter — more weight means more grip",
      "Longer — the heavier car takes more distance to stop",
      "Exactly the same",
      "Zero difference below 80 km/h"
    ],
    "correctIndex": 1,
    "explanation": "More weight lengthens braking distance. A full car (or worn tyres/brakes) stops later than an empty one, so open the gap to match.",
    "difficulty": 2,
    "scope": "learners"
  },
  {
    "id": "qr3_fd_being_overtaken",
    "categoryId": "following_distance",
    "prompt": "A vehicle begins overtaking you on a single-lane road. You should:",
    "options": [
      "Hold or ease your speed and keep left, giving them room to complete the pass",
      "Accelerate to make the overtake shorter",
      "Move toward the centre line so they cannot cut back in early",
      "Brake hard so they can get past sooner"
    ],
    "correctIndex": 0,
    "explanation": "Speeding up while being overtaken strands the other driver in the oncoming lane. Easing off shortens the manoeuvre far more safely than accelerating ever could.",
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
  },
  {
    "id": "qr5_fd_spray_from_trucks",
    "categoryId": "following_distance",
    "prompt": "Following a large vehicle in heavy rain, the extra problem beyond stopping distance is:",
    "options": [
      "Its spray can blind you completely for several seconds",
      "Its brake lights are mounted too high to see",
      "Its tyres throw water that improves your grip",
      "It blocks the radio signal"
    ],
    "correctIndex": 0,
    "explanation": "The wall of spray arrives faster than the wipers clear it. Dropping well back gets you out of it, which restores the view you need to react to anything at all.",
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
  }
];

export const STARTER_FLASHCARDS: Flashcard[] = [
  {
    "id": "fc2_steep_ascent",
    "categoryId": "signs",
    "image": "/signs/warning/warning-027-05.png",
    "front": "Steep ascent warning — what to expect?",
    "back": "Slow vehicles ahead. Choose a lower gear early to hold momentum; overtake only where legal and clear.",
    "difficulty": 2
  },
  {
    "id": "fcd_q4_mark_barrier_side",
    "categoryId": "signs",
    "front": "The centre of the road has a solid line and a broken line side by side. Which applies to you?",
    "back": "The line nearest to your side of the road — Combination lines are read from your own lane: solid on your side = no crossing for you; broken on your side = you may cross when safe, even while oncoming traffic may not.",
    "difficulty": 2
  },
  {
    "id": "fcd_gen-sign-regulatory-016-02-name",
    "categoryId": "signs",
    "front": "Which sign is this?",
    "back": "This is the regulatory sign \"Dual-carriage freeway begins\". Dual-carriage freeway begins : The following rules apply to all freeways Hand signals are not allowed on freeways, except in an emergency.",
    "difficulty": 2,
    "image": "/signs/regulatory/regulatory-016-02.png"
  },
  {
    "id": "fcd_q6_mark_studs_white",
    "categoryId": "signs",
    "front": "Reflective road studs (cat's eyes) that are WHITE usually mark:",
    "back": "The lane lines / centre of the road — White studs follow the lane and centre lines. Red studs mark the left edge, yellow the right edge — at night they reflect your lights so the road's shape shows up.",
    "difficulty": 3
  },
  {
    "id": "fcd_qs2_sign_placement_distance",
    "categoryId": "signs",
    "front": "Warning signs are placed some distance before the hazard itself so that:",
    "back": "You have time to slow down and adjust before you reach it — The gap is the point: a warning you meet at the hazard is useless. Faster roads get longer approach distances for the same reason.",
    "difficulty": 2
  },
  {
    "id": "fc4_reserved_bus",
    "categoryId": "signs",
    "image": "/signs/regulatory/regulatory-013-01.png",
    "front": "Bus symbol reservation sign over a lane?",
    "back": "Lane reserved exclusively for buses (left of the solid yellow line).",
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
    "id": "fcd_gen-sign-warning-027-01-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "Cattle grid ahead: Motor gate ahead with cattle grid. Pass on the side of the cattle grid.",
    "difficulty": 3,
    "image": "/signs/warning/warning-027-01.png"
  },
  {
    "id": "fcd_gen-sign-warning-038-06-name",
    "categoryId": "signs",
    "front": "Which sign is this?",
    "back": "This is the warning sign \"Trams ahead\". Trams ahead.",
    "difficulty": 2,
    "image": "/signs/warning/warning-038-06.png"
  },
  {
    "id": "fcd_gen-sign-regulatory-021-02-meaning",
    "categoryId": "signs",
    "front": "What does this road sign mean?",
    "back": "This regulatory sign: Goods vehicles must travel at 50km/h or faster.",
    "difficulty": 3,
    "image": "/signs/regulatory/regulatory-021-02.png"
  },
  {
    "id": "fc6_speed_hump_mark",
    "categoryId": "signs",
    "front": "White triangles/bars painted before a hump?",
    "back": "Warning of a speed hump / raised crossing — slow early.",
    "difficulty": 1
  },
  {
    "id": "fcd_q6_mark_studs_red",
    "categoryId": "signs",
    "front": "You notice the reflective studs beside you have turned RED. This warns you that:",
    "back": "You are at the LEFT edge of the road — drifting further left takes you off the roadway — Red studs mark the left edge. Seeing red to your left at night means you're wandering off the road — steer gently back towards the white lane studs.",
    "difficulty": 3
  },
  {
    "id": "fc4_green_boards",
    "categoryId": "signs",
    "front": "Green freeway boards?",
    "back": "Guidance: routes, destinations, exits. Read early, change lanes early.",
    "difficulty": 1
  },
  {
    "id": "fcd_qs2_chevron_board",
    "categoryId": "signs",
    "front": "A board carrying large arrows or chevrons pointing to one side, mounted on the outside of a bend, tells you:",
    "back": "Chevron boards are aimed straight at approaching headlights so the bend reads clearly at night. Several of them stacked through a curve is a warning that it tightens.",
    "difficulty": 2
  },
  {
    "id": "fcd_q4_mark_ped_block",
    "categoryId": "signs",
    "front": "Broad white stripes painted across the road (zebra-style) mark:",
    "back": "A pedestrian crossing — give way to pedestrians on or entering it — At a marked pedestrian crossing, people on foot have right of way. Approach at a speed that lets you stop for someone stepping out.",
    "difficulty": 1
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
    "id": "fcd_q6_mark_yellow_freeway_shoulder",
    "categoryId": "signs",
    "front": "On a freeway, the yellow line on the far left marks the edge of the travelled way. The shoulder beyond it:",
    "back": "The yellow line edges the road; the shoulder is for emergencies and stopped vehicles. Driving in it — to pass traffic or 'help flow' — is illegal and hits stationary cars.",
    "difficulty": 2
  },
  {
    "id": "fcd_gen-sign-warning-038-04-name",
    "categoryId": "signs",
    "front": "Which sign is this?",
    "back": "This is the warning sign \"Elephants ahead\". Elephants ahead.",
    "difficulty": 2,
    "image": "/signs/warning/warning-038-04.png"
  },
  {
    "id": "fcd_qs2_yield_ahead",
    "categoryId": "signs",
    "front": "A warning sign showing a downward-pointing triangle means:",
    "back": "A yield sign is ahead — be ready to give way when you reach it — It gives advance notice, not the instruction itself. The obligation to give way starts at the yield sign or line further on, but the reading of the junction starts here.",
    "difficulty": 2
  },
  {
    "id": "fcd_qs3_temp_loose_stones",
    "categoryId": "signs",
    "front": "At roadworks you pass a yellow sign warning of loose stones. The main reason to slow down is that:",
    "back": "Grip is reduced and your wheels throw stones at other vehicles and windscreens — Loose chippings behave like ball bearings under braking, and speed turns them into projectiles for the vehicle behind and oncoming traffic.",
    "difficulty": 1,
    "image": "/signs/warning/warning-031-03.png"
  },
  {
    "id": "fcd_q_sign_yellow_line",
    "categoryId": "signs",
    "front": "What does a solid yellow line at the edge of the road indicate?",
    "back": "The edge of the roadway / emergency lane — not a normal travelling lane — The yellow line marks the edge of the roadway. It is not a travelling lane, and you may not cross it to overtake on the left.",
    "difficulty": 3
  },
  {
    "id": "fc4_grammar_triangle",
    "categoryId": "signs",
    "front": "Red-bordered triangle?",
    "back": "Warning — hazard or road change ahead. Scan and slow.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_rules_lights_on",
    "categoryId": "rules",
    "front": "Your headlamps, rear lamps and number-plate lamp must be lit:",
    "back": "Lights must be on between sunset and sunrise, and at any time visibility drops so you cannot clearly see a person or vehicle 150 m away (for example in fog or heavy rain).",
    "difficulty": 2
  },
  {
    "id": "fcd_q2_rules_learner_ages",
    "categoryId": "rules",
    "front": "Which learner's licence codes exist, and from what ages?",
    "back": "Learner's licences: Code 1 for motorcycles (from 16 — under 16½ limited to ≤125 cm³), Code 2 for vehicles up to 3 500 kg GVM (from 17), Code 3 for heavier vehicles (from 18).",
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
    "id": "fcd_q_rules_hand_signal",
    "categoryId": "rules",
    "front": "A driver extends their right arm straight out of the window. This hand signal means:",
    "back": "I intend to turn right or move to the right — A straight, extended right arm indicates an intention to turn right or move right. An arm moved up and down indicates slowing/stopping.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_rules_cellphone",
    "categoryId": "rules",
    "front": "Using a cellphone while driving is:",
    "back": "Only allowed with a hands-free kit or headset — You may not hold a cellphone or two-way radio while driving — you must use a hands-free kit or headset so both hands stay on the wheel.",
    "difficulty": 1
  },
  {
    "id": "fmr_seatbelt_rules",
    "categoryId": "rules",
    "front": "The seat-belt rules beyond 'wear one'.",
    "back": "Exception while reversing or parking · a child under 14 sits in the back unless taller than 1,5 m · infants under 3 need an appropriate restraint (not in public transport) · an adult may not take a beltless seat while a belted one is free · fitted belts must work.",
    "difficulty": 3
  },
  {
    "id": "fca_excess_suspension",
    "categoryId": "rules",
    "front": "How long is a licence suspended for exceeding the threshold?",
    "back": "Three months for every point over the limit.",
    "difficulty": 3
  },
  {
    "id": "fcd_q3_rule_learner_age",
    "categoryId": "rules",
    "front": "The minimum age to obtain a learner's licence for a light motor vehicle (Code 8) is:",
    "back": "You can hold a Code 8 learner's licence from 17, and a full light-vehicle driving licence from 18.",
    "difficulty": 1
  },
  {
    "id": "fc_cancel_signal",
    "categoryId": "controls",
    "front": "After a turn or lane change?",
    "back": "Check the indicator has cancelled — switch it off manually if not, so you don't confuse others.",
    "difficulty": 2
  },
  {
    "id": "fm_handbrake_order",
    "categoryId": "controls",
    "front": "Parking brake or neutral first when you stop?",
    "back": "Parking brake first, then neutral — so there is never a moment when nothing is holding the car. To release: lift slightly, press the button fully, lower, release the button last.",
    "difficulty": 3
  },
  {
    "id": "fm_parallel_movements",
    "categoryId": "controls",
    "front": "How many movements does the parallel park allow?",
    "back": "Three — reverse in, forward, straight back until the white dot lines up with your shoulder. Getting in cleanly in one movement is equally acceptable.",
    "difficulty": 2
  },
  {
    "id": "fc2_battery_light",
    "categoryId": "controls",
    "front": "Charging warning light on?",
    "back": "Alternator fault — you're on battery time. Plan a safe stop before the electrics die.",
    "difficulty": 2
  },
  {
    "id": "fcd_qx_ctrl_eyes_on_road_gear",
    "categoryId": "controls",
    "front": "While changing gear, your eyes should stay:",
    "back": "On the road ahead — the gear lever is found by feel — A glance down is a car-length or more travelled blind. Gear changes are learnt by feel precisely so your eyes never leave the road.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_ctrl_engine_braking",
    "categoryId": "controls",
    "front": "On a long descent, selecting a lower gear helps because:",
    "back": "Engine braking helps control speed and reduces strain on the brakes — A lower gear lets engine braking hold your speed on a downhill, so the brakes do not overheat. You should not, however, change down purely to replace braking.",
    "difficulty": 3
  },
  {
    "id": "fc8_stall",
    "categoryId": "controls",
    "front": "Stalled at a robot — recovery?",
    "back": "Handbrake up, neutral, restart, then move off with the full procedure.",
    "difficulty": 2
  },
  {
    "id": "fm_wiper_check",
    "categoryId": "controls",
    "front": "How is a wiper blade checked during the pre-trip inspection?",
    "back": "Lift it, feel the rubber, say aloud that it is not torn or perished, and leave the blade standing up so you know it is done.",
    "difficulty": 3
  },
  {
    "id": "fc11_int_amber",
    "categoryId": "intersections",
    "front": "A steady amber (yellow) light?",
    "back": "Stop before the line if you safely can — red is coming. Continue only if stopping would be dangerous.",
    "difficulty": 1
  },
  {
    "id": "fcd_q2_int_left_position",
    "categoryId": "intersections",
    "front": "The correct position for a left turn at an intersection is:",
    "back": "As close to the left edge as is safe, turning into the nearest lane of the new road — Turn left from the left edge into the left lane. Swinging out first invites vehicles (especially motorcycles) into the gap on your inside.",
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
    "id": "fcd_q2_int_slipway",
    "categoryId": "intersections",
    "front": "Joining a road via a slip lane (a separate curved left-turn lane), you must:",
    "back": "Yield to traffic already on the road you're joining, merging only into a safe gap — A slip lane usually ends in a yield: adjust speed, watch for a safe gap, and merge without forcing traffic on the through road to brake.",
    "difficulty": 2
  },
  {
    "id": "fc7_circle_gap",
    "categoryId": "intersections",
    "front": "Entering a circle with traffic circulating?",
    "back": "Circulating traffic (from your right) has priority — enter only on a safe gap.",
    "difficulty": 2
  },
  {
    "id": "fc3_int_right_turn",
    "categoryId": "intersections",
    "front": "Turning right — yield to whom?",
    "back": "Oncoming traffic (straight or turning left) and pedestrians crossing the road you're entering.",
    "difficulty": 2
  },
  {
    "id": "fc7_stale_green",
    "categoryId": "intersections",
    "front": "Stale (long-standing) green?",
    "back": "About to change — ease off, cover the brake, be ready to stop.",
    "difficulty": 2
  },
  {
    "id": "fc2_glare",
    "categoryId": "hazard_awareness",
    "front": "Dazzled by oncoming main beams?",
    "back": "Look left toward your lane edge, slow down, never retaliate with your own beams.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_haz_scan",
    "categoryId": "hazard_awareness",
    "front": "Good defensive driving means you should:",
    "back": "Defensive driving means actively scanning the whole scene — far ahead, the sides and mirrors — so you anticipate hazards early and always have an escape plan.",
    "difficulty": 1
  },
  {
    "id": "fcd_q_haz_fatigue",
    "categoryId": "hazard_awareness",
    "front": "You start feeling drowsy on a long drive. The safest action is to:",
    "back": "Stop in a safe place and rest before continuing — Fatigue badly impairs reaction time and judgement. The only real fix is to stop somewhere safe and rest; tricks like fresh air only mask the problem briefly.",
    "difficulty": 2
  },
  {
    "id": "fc2_pothole",
    "categoryId": "hazard_awareness",
    "front": "Deep pothole spotted late?",
    "back": "Brake firmly in a straight line; if unavoidable, release brakes just before impact. Don't swerve blind.",
    "difficulty": 3
  },
  {
    "id": "fc2_fog",
    "categoryId": "hazard_awareness",
    "front": "Fog bank ahead?",
    "back": "Slow BEFORE entering, dipped beams (main beam blinds you), bigger gap, never stop on the roadway.",
    "difficulty": 2
  },
  {
    "id": "fc_park_bay",
    "categoryId": "parking",
    "front": "Where must you park when bays are marked?",
    "back": "Within a single demarcated bay — never on a sidewalk or verge.",
    "difficulty": 1
  },
  {
    "id": "fc_park_crossing",
    "categoryId": "parking",
    "front": "How close to a pedestrian crossing may you stop?",
    "back": "No closer than 9 metres on the approach side.",
    "difficulty": 3
  },
  {
    "id": "fc11_park_disabled_bay",
    "categoryId": "parking",
    "front": "Using a bay reserved for disabled persons without a permit?",
    "back": "An offence — reserved bays are only for permit holders displaying the disc.",
    "difficulty": 1
  },
  {
    "id": "fcd_q2_park_kerb_gap",
    "categoryId": "parking",
    "front": "How close to the kerb should you finish a parallel park?",
    "back": "Within about 450 mm, reasonably parallel — Finish close (about 450 mm or less) and parallel, wheels straight — a car sticking out into the traffic lane is a hazard, and in the K53 yard test it costs you points.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_park_bay",
    "categoryId": "parking",
    "front": "Where parking bays are marked, you must:",
    "back": "Park within a single demarcated bay, never on the sidewalk or verge — Always park within a single demarcated bay. Parking on a sidewalk, verge or pavement is not allowed.",
    "difficulty": 1
  },
  {
    "id": "fcd_q2_fd_stopped_hill",
    "categoryId": "following_distance",
    "front": "Stopped behind another vehicle on an uphill, how much gap should you leave?",
    "back": "Seeing the vehicle's rear tyres on the tar is the practical gap check: you're clear of a roll-back on the pull-away and can steer around if it stalls or breaks down.",
    "difficulty": 2
  },
  {
    "id": "fc11_fd_night_range",
    "categoryId": "following_distance",
    "front": "Safe night speed rule?",
    "back": "Keep your speed and gap so you can stop within the distance your headlights light up.",
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
    "id": "fcd_q_fd_measure",
    "categoryId": "following_distance",
    "front": "How do you check your following distance with the two-second rule?",
    "back": "Pick a fixed point; you should reach it at least two seconds after the car ahead — Choose a fixed object ahead. When the vehicle in front passes it, start counting — you should not reach the same point in under two seconds.",
    "difficulty": 2
  },
  {
    "id": "fcd_q_fd_night",
    "categoryId": "following_distance",
    "front": "At night or in fog, your following distance should be:",
    "back": "Increased, because you can see less and need more reaction time — Reduced visibility shortens how far ahead you can see hazards, so increase your gap and reduce speed at night and in fog.",
    "difficulty": 2
  }
];

/** Scenarios are a paid feature (PlanLimits.scenarios is false on free). */
export const STARTER_SCENARIOS: Scenario[] = [];
