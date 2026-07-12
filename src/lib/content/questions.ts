import type { Question } from "@/types";
import { signImg } from "./signs";
import { VEHICLE_QUESTIONS } from "./questions.vehicle";
import { EXTRA_QUESTIONS } from "./questions.extra";
import { VEHICLE_EXTRA_QUESTIONS } from "./vehicle-extra";
import { SIGNS_PACK_QUESTIONS } from "./signs-pack";
import { RULES_PACK_QUESTIONS } from "./rules-pack";
import { MARKINGS_PACK_QUESTIONS } from "./markings-pack";

/**
 * K53-aligned question bank, structured around the official South African K53
 * manual (rules of the road, road signs & markings, vehicle controls). Sign
 * images are the real signs extracted from the manual (see lib/content/signs).
 *
 * Counts are sized so a full 64-question mock (signs 28 / rules-group 28 /
 * controls 8) can be drawn without repeating a question.
 * Not affiliated with or endorsed by the RTMC.
 */
const CORE_QUESTIONS: Question[] = [
  // ── ROAD SIGNS, SIGNALS & MARKINGS ─────────────────────────
  {
    id: "q_sign_stop",
    categoryId: "signs",
    image: signImg("stop"),
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
    image: signImg("yield"),
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
    id: "q_sign_yield_ped",
    categoryId: "signs",
    image: signImg("yield_pedestrian"),
    prompt: "What must you do at this sign?",
    options: [
      "Sound your hooter to warn pedestrians",
      "Give way to pedestrians on, or about to enter, the crossing on your side",
      "Stop only if a pedestrian is already in the road",
      "Proceed — pedestrians must wait for vehicles",
    ],
    correctIndex: 1,
    explanation:
      "This sign warns of a pedestrian crossing where you must give way to any pedestrians on, or about to step onto, the crossing on your side of the road.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_ped_priority",
    categoryId: "signs",
    image: signImg("pedestrian_priority"),
    prompt: "This sign marks a pedestrian-priority area. Inside it you may:",
    options: [
      "Drive normally as long as you hoot",
      "Enter only to load/offload or for an emergency, give way to pedestrians, and not exceed 15 km/h",
      "Never enter under any circumstances",
      "Park for up to 30 minutes",
    ],
    correctIndex: 1,
    explanation:
      "A pedestrian-priority zone is set aside for people on foot. Vehicles may enter only to load/offload or in an emergency, must yield to pedestrians, and may not exceed 15 km/h unless a sign allows more.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_sign_circle",
    categoryId: "signs",
    image: signImg("traffic_circle"),
    prompt: "This triangular sign warns that ahead there is a:",
    options: [
      "Sharp left bend",
      "Traffic circle (mini-circle or roundabout)",
      "No-entry zone",
      "Railway crossing",
    ],
    correctIndex: 1,
    explanation:
      "This warning sign tells you a traffic circle is ahead. Approach ready to give way to traffic already in the circle, which comes from your right.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_no_entry",
    categoryId: "signs",
    image: signImg("no_entry"),
    prompt: "What does this red disc with a white horizontal bar mean?",
    options: [
      "No stopping",
      "No entry — vehicles may not proceed past it in this direction",
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
    id: "q_sign_one_way",
    categoryId: "signs",
    image: signImg("one_way_left"),
    prompt: "This blue sign with a white arrow indicates:",
    options: [
      "You must turn left at the next junction",
      "A one-way roadway — traffic flows only in the direction of the arrow",
      "Keep left to allow overtaking",
      "A detour to the left",
    ],
    correctIndex: 1,
    explanation:
      "A white arrow on a blue rectangle marks a one-way roadway; all traffic travels only in the direction the arrow points.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_no_left",
    categoryId: "signs",
    image: signImg("no_left_turn"),
    prompt: "This sign means:",
    options: [
      "Left turn ahead",
      "No left turn",
      "Keep left",
      "One-way to the left",
    ],
    correctIndex: 1,
    explanation:
      "A red circle with a black left arrow crossed out prohibits turning left at that point.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_no_uturn",
    categoryId: "signs",
    image: signImg("no_u_turn"),
    prompt: "What does this sign prohibit?",
    options: [
      "Right turns",
      "Making a U-turn",
      "Overtaking",
      "Three-point turns only",
    ],
    correctIndex: 1,
    explanation:
      "This regulatory sign prohibits making a U-turn (turning the vehicle to face the opposite direction) at that point.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_no_parking",
    categoryId: "signs",
    image: signImg("no_parking"),
    prompt: "This sign means:",
    options: [
      "No stopping at all",
      "No parking — you may not leave the vehicle parked here",
      "Reserved parking only",
      "Free parking",
    ],
    correctIndex: 1,
    explanation:
      "A 'no parking' sign means you may not leave a vehicle parked there. You may briefly stop to drop off or pick up — unlike a 'no stopping' sign, which forbids stopping at all.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_no_overtaking",
    categoryId: "signs",
    image: signImg("no_overtaking"),
    prompt: "This sign showing two cars in a red circle means:",
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
    id: "q_sign_speed_limit",
    categoryId: "signs",
    image: signImg("speed_limit"),
    prompt: "A number inside a red circle, like this, indicates:",
    options: [
      "A recommended cruising speed",
      "The maximum legal speed in km/h",
      "The minimum speed",
      "The distance to the next town",
    ],
    correctIndex: 1,
    explanation:
      "A number in a red circle is a regulatory speed-limit sign showing the maximum speed allowed. Exceeding it is an offence.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_robot_red",
    categoryId: "signs",
    image: signImg("robot_red"),
    prompt: "A steady red traffic signal (robot) means:",
    options: [
      "Proceed with caution",
      "Stop and wait behind the line until it turns green",
      "Stop only if pedestrians are crossing",
      "Slow down but you may continue",
    ],
    correctIndex: 1,
    explanation:
      "A steady red signal means stop behind the stop line and wait. You may not proceed until the signal turns green and the way is clear.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_robot_amber",
    categoryId: "signs",
    image: signImg("robot_amber"),
    prompt: "A steady amber (yellow) traffic signal means:",
    options: [
      "Speed up to clear the intersection",
      "Stop, unless you are so close that stopping cannot be done safely",
      "The light is faulty — ignore it",
      "Give way to the left only",
    ],
    correctIndex: 1,
    explanation:
      "Amber means stop. You should only continue if you are so close to the line that stopping suddenly would be unsafe. It is a warning that red is next, not a cue to accelerate.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_flashing_red",
    categoryId: "signs",
    prompt: "A single flashing red traffic signal must be treated as:",
    options: [
      "A green light",
      "A stop sign — stop, then proceed when safe",
      "A yield sign you can roll through",
      "An instruction to turn around",
    ],
    correctIndex: 1,
    explanation:
      "A flashing red signal has the same meaning as a stop sign: come to a complete stop, then proceed only when it is safe.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_ped_warn",
    categoryId: "signs",
    image: signImg("pedestrians"),
    prompt: "This red triangular sign showing a person walking warns that:",
    options: [
      "Pedestrians are prohibited",
      "Pedestrians may be in or near the road ahead",
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
    id: "q_sign_ped_crossing",
    categoryId: "signs",
    image: signImg("pedestrian_crossing"),
    prompt: "This warning sign tells you that ahead there is a:",
    options: [
      "Bus stop",
      "Marked pedestrian crossing",
      "Place where pedestrians are banned",
      "Picnic site",
    ],
    correctIndex: 1,
    explanation:
      "The sign warns of a marked pedestrian crossing ahead. Slow down and be prepared to give way to people crossing.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_children",
    categoryId: "signs",
    image: signImg("children"),
    prompt: "This sign showing running children warns of:",
    options: [
      "A playground that is closed",
      "Children ahead, e.g. near a school — be ready for them to enter the road",
      "No children allowed",
      "A pedestrian-only mall",
    ],
    correctIndex: 1,
    explanation:
      "This warns of children ahead, often near a school or play area. Reduce speed and watch for children who may run into the road unexpectedly.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_cyclists",
    categoryId: "signs",
    image: signImg("cyclists"),
    prompt: "This triangular warning sign means:",
    options: [
      "Cycling is prohibited",
      "Cyclists may be on the road ahead",
      "A bicycle repair shop ahead",
      "A dedicated cycle path you must use",
    ],
    correctIndex: 1,
    explanation:
      "A red triangle with a bicycle warns that cyclists may be on or crossing the road ahead. Give them room and be ready to slow down.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_gate_boom",
    categoryId: "signs",
    image: signImg("gate_boom"),
    prompt: "This warning sign indicates that ahead there is a:",
    options: [
      "Toll plaza",
      "Gate, railway boom or barrier",
      "Weighbridge",
      "Border post",
    ],
    correctIndex: 1,
    explanation:
      "The sign warns of a gate, railway boom or barrier ahead. Approach slowly and be ready to stop.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_railway",
    categoryId: "signs",
    image: signImg("railway"),
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
  {
    id: "q_sign_steep_descent",
    categoryId: "signs",
    image: signImg("steep_descent"),
    prompt: "This warning sign means a steep descent is ahead. The best response is to:",
    options: [
      "Coast in neutral to save fuel",
      "Select a lower gear before the descent so the engine helps control your speed",
      "Brake hard continuously all the way down",
      "Speed up to get it over with",
    ],
    correctIndex: 1,
    explanation:
      "On a steep downhill, change to a lower gear so engine braking helps control speed. Riding the brakes the whole way can overheat and fade them.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_reg_shape",
    categoryId: "signs",
    prompt: "Round signs with a red border give you:",
    options: [
      "A warning of a hazard ahead",
      "A regulatory order you must obey",
      "Tourist information",
      "Directions to a town",
    ],
    correctIndex: 1,
    explanation:
      "Round, red-bordered signs are regulatory — they give an order you must obey, such as speed limits, no entry or no overtaking.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_warn_shape",
    categoryId: "signs",
    prompt: "What shape and colour are warning signs?",
    options: [
      "Round and blue",
      "Triangular with a red border",
      "Rectangular and green",
      "Octagonal and red",
    ],
    correctIndex: 1,
    explanation:
      "Warning signs are triangular with a red border and warn of a hazard ahead, such as a bend, crossing or pedestrians.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_info_colour",
    categoryId: "signs",
    prompt: "Blue rectangular signs are generally used to:",
    options: [
      "Prohibit an action",
      "Give information or a positive instruction, such as a one-way or parking area",
      "Warn of danger ahead",
      "Mark the national speed limit",
    ],
    correctIndex: 1,
    explanation:
      "Blue is used for information and command signs — for example one-way roadways, parking areas and lanes reserved for particular vehicles.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_default_urban",
    categoryId: "signs",
    prompt: "With no sign stating otherwise, the default maximum speed in an urban area is:",
    options: ["40 km/h", "60 km/h", "80 km/h", "100 km/h"],
    correctIndex: 1,
    explanation:
      "Where no sign states otherwise, the general speed limit is 60 km/h in urban areas, 100 km/h on public roads outside urban areas, and 120 km/h on freeways.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_sign_default_rural",
    categoryId: "signs",
    prompt: "On a public road outside an urban area, with no sign shown, the default speed limit is:",
    options: ["80 km/h", "100 km/h", "120 km/h", "There is no limit"],
    correctIndex: 1,
    explanation:
      "Outside urban areas the default limit is 100 km/h unless a sign shows otherwise; on a freeway it is 120 km/h.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_broken_white",
    categoryId: "signs",
    prompt: "A broken white line painted along the centre of the road means:",
    options: [
      "You may never cross it",
      "You may cross it to overtake when it is safe and legal to do so",
      "It marks the edge of the road",
      "Parking is allowed on the line",
    ],
    correctIndex: 1,
    explanation:
      "A broken centre line may be crossed when it is safe — for example to overtake. A solid centre line may not be crossed.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_solid_white",
    categoryId: "signs",
    prompt: "A solid white line along the centre of the road means:",
    options: [
      "You may cross it freely",
      "You may not cross or straddle it to overtake",
      "It is only advisory",
      "Overtaking is encouraged",
    ],
    correctIndex: 1,
    explanation:
      "A solid (no-overtaking) line may not be crossed or straddled. It is used where overtaking would be dangerous, such as bends and blind rises.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_yellow_line",
    categoryId: "signs",
    prompt: "What does a solid yellow line at the edge of the road indicate?",
    options: [
      "The edge of the roadway / emergency lane — not a normal travelling lane",
      "A dedicated overtaking lane",
      "A bus-only lane at all times",
      "The centre of the road",
    ],
    correctIndex: 0,
    explanation:
      "The yellow line marks the edge of the roadway. It is not a travelling lane, and you may not cross it to overtake on the left.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_sign_red_line_kerb",
    categoryId: "signs",
    prompt: "A solid red line painted next to the kerb means:",
    options: [
      "Loading zone",
      "No stopping at any time alongside it",
      "Reserved parking",
      "Bus lane",
    ],
    correctIndex: 1,
    explanation:
      "A solid red kerb line marks a no-stopping zone — you may not stop there at all. A yellow kerb line indicates no parking.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_sign_box_junction",
    categoryId: "signs",
    prompt: "Yellow criss-cross lines painted in a box at an intersection mean:",
    options: [
      "Park inside the box",
      "Do not enter the box unless your exit is clear",
      "Stop inside the box and wait",
      "Pedestrian crossing",
    ],
    correctIndex: 1,
    explanation:
      "A yellow box junction must be kept clear: do not enter it unless your exit is clear, so you never block cross-traffic.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_sign_green_route",
    categoryId: "signs",
    prompt: "Large green signs with white lettering on major routes are:",
    options: [
      "Warning signs",
      "Guidance / direction signs showing routes and destinations",
      "Prohibition signs",
      "Speed-limit signs",
    ],
    correctIndex: 1,
    explanation:
      "Green guidance signs direct you to routes, towns and freeways. They help you plan your route, not warn or instruct.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_sign_de_restriction",
    categoryId: "signs",
    prompt: "A sign with a diagonal line (or grey bars) through a previous regulatory sign means:",
    options: [
      "The restriction has been doubled",
      "The previous restriction now ends / no longer applies",
      "Roadworks ahead",
      "A new speed limit begins",
    ],
    correctIndex: 1,
    explanation:
      "A de-restriction sign cancels a previous regulatory instruction — for example, ending a no-overtaking zone or a speed restriction.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_sign_freeway_start",
    categoryId: "signs",
    prompt: "A sign showing a freeway begins tells you that from that point:",
    options: [
      "Pedestrians and pedal cycles are welcome",
      "Freeway rules apply — no pedestrians, animals, learner drivers alone, or very slow vehicles",
      "There is no speed limit",
      "Hand signals are compulsory",
    ],
    correctIndex: 1,
    explanation:
      "Where a freeway begins, freeway rules apply: no pedestrians, animals, pedal cycles or certain slow vehicles, and a learner may only drive if accompanied by a licensed driver.",
    difficulty: 2,
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
    id: "q_ctrl_accelerator",
    categoryId: "controls",
    prompt: "The accelerator pedal is used to:",
    options: [
      "Reduce speed or stop",
      "Increase or decrease the engine's power and the vehicle's speed",
      "Disengage the gears",
      "Hold the vehicle stationary",
    ],
    correctIndex: 1,
    explanation:
      "The accelerator controls how much power the engine delivers, increasing or easing the vehicle's speed. The foot brake reduces speed; the parking brake holds it still.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_ctrl_footbrake",
    categoryId: "controls",
    prompt: "When using the foot (service) brake, you should:",
    options: [
      "Stamp on it hard with your left foot",
      "Apply it smoothly and progressively with your right foot, keeping both hands on the wheel",
      "Pump it rapidly at all times",
      "Use it only together with the handbrake",
    ],
    correctIndex: 1,
    explanation:
      "Brake smoothly and progressively with the right foot, ideally on a straight course, without locking the wheels, while keeping both hands on the steering wheel for control.",
    difficulty: 2,
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
    id: "q_ctrl_handbrake_motion",
    categoryId: "controls",
    prompt: "The parking brake (handbrake) should generally not be applied:",
    options: [
      "When parked on a hill",
      "While the vehicle is in motion, except if the service brake fails",
      "When stopped for any length of time",
      "When there is a risk of rolling",
    ],
    correctIndex: 1,
    explanation:
      "Apply the handbrake whenever the vehicle is parked or stopped for a while, but not while moving — the only exception is a service-brake failure.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_ctrl_clutch_control",
    categoryId: "controls",
    prompt: "'Clutch control' (finding the biting point) means:",
    options: [
      "Pressing the clutch flat to the floor",
      "Releasing the clutch to the point where it starts to take up drive without rolling",
      "Revving hard with the clutch up",
      "Using the clutch as a footrest",
    ],
    correctIndex: 1,
    explanation:
      "The biting point is where the clutch just starts to transmit power and the vehicle neither rolls forward nor back. It is essential for smooth hill starts and slow manoeuvres.",
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
      "Regularly — every few seconds and before any manoeuvre",
      "Only at intersections",
      "Once at the start of the trip",
    ],
    correctIndex: 1,
    explanation:
      "Mirrors should be scanned frequently and always before signalling, changing lanes, slowing or turning, so you keep a live picture of the traffic around you.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_ctrl_steering",
    categoryId: "controls",
    prompt: "While driving normally, your hands should be:",
    options: [
      "One hand on the wheel, the other resting",
      "Both hands on the steering wheel in a balanced position",
      "On the gear lever ready to change",
      "On the handbrake",
    ],
    correctIndex: 1,
    explanation:
      "Keep both hands on the wheel for full control, removing one only briefly to change gear or signal. This is assessed throughout the K53 test.",
    difficulty: 1,
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
      "You must dip your lights for oncoming traffic and when following another vehicle, so you do not dazzle other drivers. Main beam must let you see at least 100 m; dipped beam at least 45 m.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_ctrl_indicator",
    categoryId: "controls",
    prompt: "After completing a turn or lane change, you should:",
    options: [
      "Leave the indicator on as a courtesy",
      "Make sure the indicator has cancelled, and cancel it yourself if it has not",
      "Switch on your hazards",
      "Flash your headlights",
    ],
    correctIndex: 1,
    explanation:
      "An indicator left flashing confuses other road users and can cause a collision. Always confirm it has cancelled, and switch it off manually if it has not.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_ctrl_engine_braking",
    categoryId: "controls",
    prompt: "On a long descent, selecting a lower gear helps because:",
    options: [
      "It saves fuel by switching the engine off",
      "Engine braking helps control speed and reduces strain on the brakes",
      "It makes the car go faster",
      "It is required by law on all hills",
    ],
    correctIndex: 1,
    explanation:
      "A lower gear lets engine braking hold your speed on a downhill, so the brakes do not overheat. You should not, however, change down purely to replace braking.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_ctrl_fuel_warning",
    categoryId: "controls",
    prompt: "A glowing fuel warning light means:",
    options: [
      "The engine is overheating",
      "Fuel is low and you should refuel soon",
      "The handbrake is on",
      "A door is open",
    ],
    correctIndex: 1,
    explanation:
      "The fuel warning light shows the tank is low. Refuel soon — running out can leave you stranded in a dangerous spot.",
    difficulty: 1,
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
    id: "q_rules_seatbelt_moving",
    categoryId: "rules",
    prompt: "When are seatbelts compulsory?",
    options: [
      "Only on freeways",
      "Whenever you are in a moving vehicle and a seatbelt is fitted",
      "Only for the driver",
      "Only at night",
    ],
    correctIndex: 1,
    explanation:
      "Seatbelts must be worn whenever you are in a moving vehicle where they are fitted. A child between 3 and 14 (and under 1.5 m) must use an appropriate restraint.",
    difficulty: 1,
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
      "A straight, extended right arm indicates an intention to turn right or move right. An arm moved up and down indicates slowing/stopping.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_hand_freeway",
    categoryId: "rules",
    prompt: "Hand signals:",
    options: [
      "Must always be used instead of indicators",
      "May not be used on a freeway, except in an emergency",
      "Are illegal everywhere",
      "Replace brake lights",
    ],
    correctIndex: 1,
    explanation:
      "Hand signals may not be used on a freeway except in an emergency. Elsewhere they back up your indicators when needed.",
    difficulty: 3,
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
    id: "q_rules_divided_solid",
    categoryId: "rules",
    prompt: "A solid line or barrier divides the road. You may:",
    options: [
      "Cross it whenever traffic is light",
      "Not cross it — stay on the left of the division",
      "Cross it to reach a shop on the right",
      "Cross it only at night",
    ],
    correctIndex: 1,
    explanation:
      "On a divided road you must stay left of the division. Crossing a solid dividing line is a rule violation; a broken line may be crossed only to overtake or make a legal U-turn.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_overtake_blind",
    categoryId: "rules",
    prompt: "You may not overtake:",
    options: [
      "On a straight, clear road",
      "On a blind rise, a curve, or where your view ahead is limited",
      "When a broken line allows it and the road is clear",
      "On a one-way street",
    ],
    correctIndex: 1,
    explanation:
      "Never overtake on a blind rise, bend or anywhere your view of oncoming traffic is limited, or where a sign or solid line prohibits it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_overtake_left",
    categoryId: "rules",
    prompt: "Overtaking on the left is permitted when:",
    options: [
      "You are in a hurry",
      "The vehicle ahead is turning right (or has signalled right), or the road is a one-way",
      "There is a solid yellow edge line",
      "It is never permitted",
    ],
    correctIndex: 1,
    explanation:
      "You may pass on the left when the vehicle ahead is turning or signalling right, or on a one-way road — but never by crossing the yellow left edge line.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_rules_being_overtaken",
    categoryId: "rules",
    prompt: "Another vehicle is overtaking you. You should:",
    options: [
      "Speed up so they cannot pass",
      "Keep left, hold a steady speed and do not accelerate until they have passed",
      "Brake hard to let them in",
      "Move to the right",
    ],
    correctIndex: 1,
    explanation:
      "When being overtaken, move safely to the left, keep a steady speed and do not accelerate until the other vehicle has passed.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_turn_right_position",
    categoryId: "rules",
    prompt: "When turning right from one two-way road into another, you should:",
    options: [
      "Cut the corner to save time",
      "Keep close to the centre line and turn into the left side of the road you are entering",
      "Swing wide to the left first",
      "Turn into the right side of the new road",
    ],
    correctIndex: 1,
    explanation:
      "Indicate early, move close to the centre line, and turn so you end up on the correct (left) side of the road you enter, giving way to oncoming traffic first.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_emergency_triangle",
    categoryId: "rules",
    prompt: "If you break down on a public road, where should the emergency warning triangle be placed?",
    options: [
      "Directly behind the vehicle",
      "At least 45 metres behind the vehicle",
      "On the roof of the vehicle",
      "Triangles are not required",
    ],
    correctIndex: 1,
    explanation:
      "The warning triangle must be displayed at least 45 metres behind a broken-down or stationary vehicle so approaching traffic has time to react.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_tread",
    categoryId: "rules",
    prompt: "The minimum legal tyre tread depth is:",
    options: ["1 mm across the tread", "3 mm", "Smooth tyres are legal", "5 mm"],
    correctIndex: 0,
    explanation:
      "A tyre is illegal once the tread is less than 1 mm deep across the full width and circumference. Worn tyres greatly increase stopping distance, especially in the wet.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_lights_on",
    categoryId: "rules",
    prompt: "Your headlamps, rear lamps and number-plate lamp must be lit:",
    options: [
      "Only when it is fully dark",
      "Between sunset and sunrise, or whenever you cannot clearly see persons or vehicles 150 m ahead",
      "Only on freeways",
      "Only when other cars have theirs on",
    ],
    correctIndex: 1,
    explanation:
      "Lights must be on between sunset and sunrise, and at any time visibility drops so you cannot clearly see a person or vehicle 150 m away (for example in fog or heavy rain).",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_cellphone",
    categoryId: "rules",
    prompt: "Using a cellphone while driving is:",
    options: [
      "Allowed if you hold it to your ear",
      "Only allowed with a hands-free kit or headset",
      "Allowed at traffic lights",
      "Always allowed",
    ],
    correctIndex: 1,
    explanation:
      "You may not hold a cellphone or two-way radio while driving — you must use a hands-free kit or headset so both hands stay on the wheel.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_rules_ped_collision",
    categoryId: "rules",
    prompt: "If a vehicle collides with a pedestrian, the driver:",
    options: [
      "Is never at fault if the pedestrian jaywalked",
      "Will be prosecuted, irrespective of who had right of way",
      "Only faces a fine if speeding",
      "Has no responsibility",
    ],
    correctIndex: 1,
    explanation:
      "The law gives pedestrians strong protection: if a vehicle hits a pedestrian, the driver can be prosecuted regardless of who had right of way. Always drive defensively around people on foot.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_rules_emergency_vehicle",
    categoryId: "rules",
    prompt: "An ambulance approaches with lights and siren. You must:",
    options: [
      "Stop dead immediately wherever you are",
      "Give way by moving left and slowing or stopping when it is safe",
      "Race ahead to clear the road",
      "Ignore it unless it hoots",
    ],
    correctIndex: 1,
    explanation:
      "You are required to give way to emergency vehicles. Move to the left and slow or stop where it is safe — without making a dangerous or illegal manoeuvre.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_freeway_stop",
    categoryId: "rules",
    prompt: "Stopping on a freeway is:",
    options: [
      "Always allowed in any lane",
      "Prohibited except in an emergency or a designated stopping area",
      "Allowed to answer your phone",
      "Allowed to let passengers out",
    ],
    correctIndex: 1,
    explanation:
      "You may not stop on a freeway except for an emergency or in a designated stopping area. Pedestrians, animals and pedal cycles are also not allowed on freeways.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_learner_freeway",
    categoryId: "rules",
    prompt: "A learner driver on a freeway:",
    options: [
      "May never use a freeway",
      "May drive on a freeway only if accompanied by a properly licensed driver",
      "May drive alone if over 18",
      "May drive alone at any time",
    ],
    correctIndex: 1,
    explanation:
      "A learner may drive on a freeway only when accompanied by a person who holds a valid licence for that class of vehicle.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_rules_unattended",
    categoryId: "rules",
    prompt: "Before leaving your vehicle unattended you must:",
    options: [
      "Leave the engine running",
      "Apply the parking brake (and take steps to stop it moving) and switch off the engine",
      "Leave it in neutral with the engine on",
      "Leave the keys in the ignition",
    ],
    correctIndex: 1,
    explanation:
      "You may not leave a vehicle unattended without setting the parking brake or otherwise preventing it from moving, and you may not leave the engine running unattended.",
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
      "At a four-way stop, vehicles proceed in the order they arrived and stopped. If two stop at the same time, the vehicle on the right has priority.",
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
    image: signImg("traffic_circle"),
    prompt: "When entering a traffic circle (roundabout), you must give way to:",
    options: [
      "Traffic approaching from your left",
      "Traffic already in the circle, approaching from your right",
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
      "The vehicle on the left",
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
  {
    id: "q_int_yield_sign",
    categoryId: "intersections",
    image: signImg("yield"),
    prompt: "You reach a junction controlled by this sign. You must:",
    options: [
      "Always come to a complete stop",
      "Give way to traffic on the through road and proceed only when clear",
      "Take right of way over the through road",
      "Stop only if a vehicle is within 50 m",
    ],
    correctIndex: 1,
    explanation:
      "A yield sign means give way: slow down, be ready to stop, and only enter the through road when there is a safe gap. You need not stop if it is already clear.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_int_green_arrow",
    categoryId: "intersections",
    prompt: "A green arrow shown at a traffic signal means:",
    options: [
      "You may go only in the direction of the arrow, when safe",
      "All traffic may proceed",
      "Stop and wait",
      "Pedestrians have right of way over the arrow",
    ],
    correctIndex: 0,
    explanation:
      "A green arrow gives right of way to move in the direction it points, provided the way is clear. Other movements must still wait for their signal.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_int_t_junction",
    categoryId: "intersections",
    prompt: "You are on the road that ends at a T-junction (the stem of the T). You must:",
    options: [
      "Continue — you have priority",
      "Give way to traffic on the through road (the top of the T)",
      "Expect through traffic to stop",
      "Stop only at night",
    ],
    correctIndex: 1,
    explanation:
      "Traffic on the terminating road of a T-junction must give way to traffic on the continuous through road, unless signs or signals say otherwise.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_int_emergency_intersection",
    categoryId: "intersections",
    prompt: "You are crossing an intersection on green when an emergency vehicle approaches with sirens. You should:",
    options: [
      "Stop immediately in the middle of the intersection",
      "Clear the intersection, then pull over and give way where it is safe",
      "Reverse out of the intersection",
      "Ignore it — you have green",
    ],
    correctIndex: 1,
    explanation:
      "Do not stop in the intersection. Continue through, then move left and stop where it is safe so the emergency vehicle can pass.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_int_ped_crossing",
    categoryId: "intersections",
    prompt: "You are turning at an intersection and pedestrians are crossing the road you are entering. You must:",
    options: [
      "Hoot so they hurry",
      "Give way to the pedestrians and let them finish crossing",
      "Turn around them quickly",
      "Carry on — vehicles have priority",
    ],
    correctIndex: 1,
    explanation:
      "Turning traffic must give way to pedestrians already crossing the road being entered. Wait for them to clear before completing the turn.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_int_blocked",
    categoryId: "intersections",
    prompt: "The traffic light is green but the intersection ahead is blocked with traffic. You should:",
    options: [
      "Move in anyway because it is green",
      "Wait behind the line until you can clear the intersection without blocking it",
      "Hoot until cars move",
      "Use the pavement to get around",
    ],
    correctIndex: 1,
    explanation:
      "Never enter an intersection you cannot clear, even on green. Stopping in the box blocks cross-traffic when their light goes green and causes gridlock.",
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
      "You may not stop within 9 metres of a pedestrian crossing on the approach side, because it blocks other drivers' view of pedestrians.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_park_intersection",
    categoryId: "parking",
    prompt: "You may not park within how many metres of an intersection?",
    options: ["1 metre", "5 metres", "20 metres", "There is no limit"],
    correctIndex: 1,
    explanation:
      "Parking is not allowed within 5 metres of an intersection, as it obstructs visibility and the movement of turning traffic.",
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
      "Park as near as possible to the left edge of the roadway, facing the direction of travel, within a demarcated bay where one is provided.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_park_bay",
    categoryId: "parking",
    prompt: "Where parking bays are marked, you must:",
    options: [
      "Park across two bays for safety",
      "Park within a single demarcated bay, never on the sidewalk or verge",
      "Park on the pavement to leave the road clear",
      "Park wherever there is shade",
    ],
    correctIndex: 1,
    explanation:
      "Always park within a single demarcated bay. Parking on a sidewalk, verge or pavement is not allowed.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_park_hydrant",
    categoryId: "parking",
    prompt: "Parking next to a fire hydrant is:",
    options: [
      "Allowed for up to 10 minutes",
      "Prohibited — emergency services need unobstructed access",
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
    id: "q_park_bridge",
    categoryId: "parking",
    prompt: "Stopping your vehicle on or under a bridge, or on a narrow (constricted) section of road, is:",
    options: [
      "Always fine",
      "A no-stopping situation — you may not stop there",
      "Allowed if briefly",
      "Allowed with hazards on",
    ],
    correctIndex: 1,
    explanation:
      "These are no-stopping places: on or near a bridge and on a constricted part of the road, because they obstruct traffic and sightlines.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_park_incline_down",
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
    id: "q_park_incline_up",
    categoryId: "parking",
    prompt: "When parking facing uphill next to a kerb, you should turn your front wheels:",
    options: [
      "Toward the kerb",
      "Away from the kerb (so a roll-back is caught by the kerb)",
      "Straight ahead",
      "Fully to the right always",
    ],
    correctIndex: 1,
    explanation:
      "Facing uphill, turn the wheels away from the kerb so that if the car rolls back the wheels catch the kerb. Apply the handbrake and leave it in gear.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_park_no_stopping",
    categoryId: "parking",
    prompt: "A 'no stopping' restriction (red circle / red kerb line) means:",
    options: [
      "You may stop briefly to drop off passengers",
      "You may not stop at all, even momentarily, in that zone",
      "You may park for under 5 minutes",
      "You may stop only to load goods",
    ],
    correctIndex: 1,
    explanation:
      "No stopping prohibits stopping for any reason in the zone — stricter than no parking, which only prohibits leaving the vehicle parked.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_park_disabled",
    categoryId: "parking",
    prompt: "A bay marked with the wheelchair symbol may be used by:",
    options: [
      "Anyone for a short time",
      "Only vehicles carrying a person with a disability and displaying the permit",
      "Delivery vehicles",
      "Anyone after hours",
    ],
    correctIndex: 1,
    explanation:
      "Disabled bays are reserved for vehicles carrying a person with a disability and displaying the correct permit. Misuse carries a fine.",
    difficulty: 1,
    scope: "learners",
  },

  // ── FOLLOWING DISTANCE ─────────────────────────────────────
  {
    id: "q_fd_two_second",
    categoryId: "following_distance",
    prompt: "In good conditions, the recommended minimum following distance for a light vehicle is:",
    options: [
      "Half a second",
      "About a two-second gap (the K53 minimum)",
      "Ten car lengths regardless of speed",
      "As close as possible to save fuel",
    ],
    correctIndex: 1,
    explanation:
      "The two-second rule is the K53 minimum and scales with speed: you should pass a fixed point at least two seconds after the vehicle ahead. Three seconds is the recommended safe gap.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q_fd_measure",
    categoryId: "following_distance",
    prompt: "How do you check your following distance with the two-second rule?",
    options: [
      "Guess the number of car lengths",
      "Pick a fixed point; you should reach it at least two seconds after the car ahead",
      "Count the white lines only",
      "Match the speed of the car ahead exactly",
    ],
    correctIndex: 1,
    explanation:
      "Choose a fixed object ahead. When the vehicle in front passes it, start counting — you should not reach the same point in under two seconds.",
    difficulty: 2,
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
    id: "q_fd_truck",
    categoryId: "following_distance",
    prompt: "Following a heavy goods vehicle, the recommended safe gap is roughly:",
    options: [
      "The same two seconds as a car",
      "Larger — around six seconds — because it blocks your view and needs more room to stop",
      "Less, because trucks brake slowly",
      "Zero — tuck in behind it",
    ],
    correctIndex: 1,
    explanation:
      "A heavy vehicle blocks your view and needs more distance to stop, so keep a larger gap — about six seconds — and pull back so you can see past it.",
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
    id: "q_fd_thinking",
    categoryId: "following_distance",
    prompt: "Total stopping distance is made up of:",
    options: [
      "Braking distance only",
      "Your reaction (thinking) distance plus the braking distance",
      "Only the time the brakes are applied",
      "The distance to the next sign",
    ],
    correctIndex: 1,
    explanation:
      "Stopping distance = thinking distance (while you react) + braking distance. Tiredness, alcohol and distraction lengthen the thinking part; speed and wet roads lengthen the braking part.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_fd_night",
    categoryId: "following_distance",
    prompt: "At night or in fog, your following distance should be:",
    options: [
      "Reduced so you can see tail lights",
      "Increased, because you can see less and need more reaction time",
      "Unchanged",
      "Set to one second",
    ],
    correctIndex: 1,
    explanation:
      "Reduced visibility shortens how far ahead you can see hazards, so increase your gap and reduce speed at night and in fog.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_fd_downhill",
    categoryId: "following_distance",
    prompt: "When following another vehicle down a long, steep hill, you should:",
    options: [
      "Close the gap to use their slipstream",
      "Increase the gap, because stopping distances are longer downhill",
      "Switch off the engine",
      "Keep exactly two seconds regardless",
    ],
    correctIndex: 1,
    explanation:
      "Gravity lengthens stopping distance downhill, so leave a bigger gap and use a lower gear to help control your speed.",
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
      "Mirrors leave a blind spot beside and behind the vehicle. A quick shoulder check before changing lanes catches a vehicle the mirrors cannot show. Keep your wheels straight while you check.",
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
  {
    id: "q_haz_ball",
    categoryId: "hazard_awareness",
    prompt: "A ball bounces into the road from between parked cars ahead. You should:",
    options: [
      "Carry on — it is only a ball",
      "Slow down and cover the brake; a child may run out after it",
      "Swerve into the oncoming lane",
      "Speed up past the gap",
    ],
    correctIndex: 1,
    explanation:
      "Where a ball goes, a child often follows. Reading the clue early — slowing and covering the brake — buys you the time to stop safely.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_haz_skid",
    categoryId: "hazard_awareness",
    prompt: "Your rear wheels begin to skid to the right. You should:",
    options: [
      "Brake as hard as you can",
      "Ease off the accelerator and steer gently in the direction the rear is sliding",
      "Steer sharply the opposite way",
      "Pull the handbrake",
    ],
    correctIndex: 1,
    explanation:
      "To correct a skid, ease off the power and steer gently into the slide (the direction the rear is going) to regain alignment. Harsh braking or steering makes it worse.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_haz_sun_glare",
    categoryId: "hazard_awareness",
    prompt: "You are driving into low, blinding sun. The safest response is to:",
    options: [
      "Speed up to get out of it",
      "Slow down, use the sun visor and increase your following distance",
      "Close your eyes briefly",
      "Switch on your brights",
    ],
    correctIndex: 1,
    explanation:
      "Glare hides hazards and other road users. Slow down, use the visor, keep your windscreen clean and leave extra space until you can see clearly.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_haz_animal_night",
    categoryId: "hazard_awareness",
    prompt: "Driving on an unlit rural road at night, you should be especially alert for:",
    options: [
      "Tourist attractions",
      "Animals, pedestrians and stationary vehicles that may appear in your lights with little warning",
      "Speed cameras only",
      "Nothing different from daytime",
    ],
    correctIndex: 1,
    explanation:
      "Rural roads at night hide pedestrians, animals and unlit vehicles until they are close. Drive at a speed that lets you stop within the distance your lights show.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_haz_brake_fail",
    categoryId: "hazard_awareness",
    prompt: "Your foot brake suddenly fails while driving. Your first actions should be:",
    options: [
      "Switch off the engine and steer hard",
      "Pump the brake, change to a lower gear and use the handbrake gently while steering to safety",
      "Jump out of the vehicle",
      "Accelerate to a service station",
    ],
    correctIndex: 1,
    explanation:
      "If the service brake fails, pump the pedal, change down for engine braking and apply the handbrake gradually (not violently) while steering to a safe stop and warning others.",
    difficulty: 3,
    scope: "learners",
  },
];

/** Core (universal) questions plus the vehicle-code–specific and extra banks. */
export const QUESTIONS: Question[] = [...CORE_QUESTIONS, ...VEHICLE_QUESTIONS, ...EXTRA_QUESTIONS, ...VEHICLE_EXTRA_QUESTIONS, ...SIGNS_PACK_QUESTIONS, ...RULES_PACK_QUESTIONS, ...MARKINGS_PACK_QUESTIONS];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export function questionsByCategory(categoryId: Question["categoryId"]) {
  return QUESTIONS.filter((q) => q.categoryId === categoryId);
}
