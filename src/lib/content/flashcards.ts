import type { Flashcard } from "@/types";
import { signImg } from "./signs";
import { VEHICLE_FLASHCARDS } from "./flashcards.vehicle";
import { EXTRA_FLASHCARDS } from "./flashcards.extra";
import { VEHICLE_EXTRA_FLASHCARDS } from "./vehicle-extra";
import { SIGNS_PACK_FLASHCARDS } from "./signs-pack";
import { RULES_PACK_FLASHCARDS } from "./rules-pack";

/**
 * Spaced-repetition flashcards covering the K53 learner's syllabus. Sign cards
 * carry the real road-sign image extracted from the official manual.
 */
const CORE_FLASHCARDS: Flashcard[] = [
  // ── Signs ──────────────────────────────────────────────────
  { id: "fc_stop", categoryId: "signs", image: signImg("stop"), front: "What must you do at this sign?", back: "STOP: come to a complete stop behind the line every time, then move off only when it is safe.", difficulty: 1 },
  { id: "fc_yield", categoryId: "signs", image: signImg("yield"), front: "What does this sign require?", back: "YIELD: give right of way to crossing traffic and pedestrians. You need not stop if clear, but must be ready to.", difficulty: 1 },
  { id: "fc_yield_ped", categoryId: "signs", image: signImg("yield_pedestrian"), front: "What does this sign mean?", back: "Give way to pedestrians on, or about to enter, the crossing on your side of the road.", difficulty: 2 },
  { id: "fc_ped_priority", categoryId: "signs", image: signImg("pedestrian_priority"), front: "What does this sign mean?", back: "Pedestrian-priority zone: enter only to load/offload or for emergencies, yield to pedestrians, max 15 km/h.", difficulty: 3 },
  { id: "fc_no_entry", categoryId: "signs", image: signImg("no_entry"), front: "What does this sign mean?", back: "No entry — vehicles may not proceed past it in that direction.", difficulty: 1 },
  { id: "fc_one_way", categoryId: "signs", image: signImg("one_way_left"), front: "What does this blue arrow sign mean?", back: "One-way roadway — all traffic travels only in the direction of the arrow.", difficulty: 2 },
  { id: "fc_no_left", categoryId: "signs", image: signImg("no_left_turn"), front: "What does this sign prohibit?", back: "No left turn at this point.", difficulty: 1 },
  { id: "fc_no_right", categoryId: "signs", image: signImg("no_right_turn"), front: "What does this sign prohibit?", back: "No right turn at this point.", difficulty: 1 },
  { id: "fc_no_uturn", categoryId: "signs", image: signImg("no_u_turn"), front: "What does this sign prohibit?", back: "No U-turn (you may not turn to face the opposite direction here).", difficulty: 1 },
  { id: "fc_no_parking", categoryId: "signs", image: signImg("no_parking"), front: "What does this sign mean?", back: "No parking — you may not leave the vehicle parked here (brief stops to load/set down are allowed).", difficulty: 2 },
  { id: "fc_no_overtaking", categoryId: "signs", image: signImg("no_overtaking"), front: "What does this sign mean?", back: "No overtaking until you pass the sign that ends the restriction.", difficulty: 2 },
  { id: "fc_speed", categoryId: "signs", image: signImg("speed_limit"), front: "What does a number in a red circle mean?", back: "The maximum legal speed, in km/h. Exceeding it is an offence.", difficulty: 1 },
  { id: "fc_robot_red", categoryId: "signs", image: signImg("robot_red"), front: "Steady red robot?", back: "Stop behind the line and wait until it turns green and the way is clear.", difficulty: 1 },
  { id: "fc_robot_amber", categoryId: "signs", image: signImg("robot_amber"), front: "Steady amber robot?", back: "Stop — unless you are so close that stopping cannot be done safely. It warns that red is next.", difficulty: 2 },
  { id: "fc_robot_green", categoryId: "signs", image: signImg("robot_green"), front: "Steady green robot?", back: "You may proceed if the way is clear and you can do so safely.", difficulty: 1 },
  { id: "fc_ped_warn", categoryId: "signs", image: signImg("pedestrians"), front: "What does this warning sign mean?", back: "Pedestrians may be in or near the road ahead — slow down and be ready to stop.", difficulty: 1 },
  { id: "fc_children", categoryId: "signs", image: signImg("children"), front: "What does this warning sign mean?", back: "Children ahead (often near a school) — watch for them running into the road.", difficulty: 1 },
  { id: "fc_railway", categoryId: "signs", image: signImg("railway"), front: "Approaching this sign / a railway crossing?", back: "Slow down, look both ways, be ready to stop. Trains always have right of way.", difficulty: 2 },
  { id: "fc_steep_down", categoryId: "signs", image: signImg("steep_descent"), front: "What does this warning sign mean?", back: "Steep descent ahead — select a lower gear so engine braking helps control your speed.", difficulty: 2 },
  { id: "fc_triangle", categoryId: "signs", front: "What shape and colour are WARNING signs?", back: "Triangular with a red border. They warn of a hazard ahead (bends, crossings, pedestrians).", difficulty: 1 },
  { id: "fc_regulatory", categoryId: "signs", front: "What do round, red-bordered signs mean?", back: "Regulatory signs — they give an order you must obey (speed limits, no overtaking, no entry).", difficulty: 1 },
  { id: "fc_blue_signs", categoryId: "signs", front: "What do blue rectangular signs usually do?", back: "Give information or a positive instruction (one-way, parking, reserved lanes).", difficulty: 2 },
  { id: "fc_solid_line", categoryId: "signs", front: "Solid vs broken centre line?", back: "Broken line = may cross to overtake when safe. Solid line = may not cross or straddle.", difficulty: 2 },
  { id: "fc_yellow_edge", categoryId: "signs", front: "Solid yellow line at the road edge?", back: "Marks the edge of the roadway / emergency lane — not a travelling lane; don't cross it to overtake.", difficulty: 2 },
  { id: "fc_flashing_red", categoryId: "signs", front: "A single flashing red robot?", back: "Treat it exactly like a stop sign: stop, then go when safe.", difficulty: 2 },

  // ── Rules ──────────────────────────────────────────────────
  { id: "fc_speed_limits", categoryId: "rules", front: "Default speed limits with no sign?", back: "60 km/h urban · 100 km/h rural public roads · 120 km/h freeways.", difficulty: 1 },
  { id: "fc_alcohol", categoryId: "rules", front: "Legal blood-alcohol limit?", back: "Below 0.05 g/100 ml (0.02 for professional drivers). Safest is zero.", difficulty: 2 },
  { id: "fc_keep_left", categoryId: "rules", front: "Keep-left / pass-right rule?", back: "Travel in the left lane; use lanes to the right only to overtake, then return left.", difficulty: 1 },
  { id: "fc_divided", categoryId: "rules", front: "Crossing a road's dividing line?", back: "Stay left of it. Never cross a solid division; cross a broken one only to overtake or make a legal U-turn.", difficulty: 2 },
  { id: "fc_triangle_distance", categoryId: "rules", front: "Emergency triangle distance?", back: "At least 45 metres behind the broken-down or stationary vehicle.", difficulty: 2 },
  { id: "fc_tread", categoryId: "rules", front: "Minimum legal tyre tread depth?", back: "1 mm across the full tread width and circumference.", difficulty: 2 },
  { id: "fc_right_arm", categoryId: "rules", front: "Hand signal: right arm extended straight out?", back: "Turning right / moving right. (Hand signals may not be used on a freeway.)", difficulty: 2 },
  { id: "fc_lights_on", categoryId: "rules", front: "When must your lights be on?", back: "Sunset to sunrise, or whenever you can't clearly see a person/vehicle 150 m ahead (fog, heavy rain).", difficulty: 2 },
  { id: "fc_beams", categoryId: "rules", front: "Main beam vs dipped beam reach?", back: "Main beam must light objects ≥100 m ahead; dipped beam ≥45 m. Dip for oncoming and when following.", difficulty: 3 },
  { id: "fc_cellphone", categoryId: "rules", front: "Cellphone while driving?", back: "Only with a hands-free kit or headset — you may not hold the phone.", difficulty: 1 },
  { id: "fc_seatbelt", categoryId: "rules", front: "When are seatbelts compulsory?", back: "Whenever you're in a moving vehicle and a belt is fitted. The driver is responsible for child restraints.", difficulty: 1 },
  { id: "fc_ped_rights", categoryId: "rules", front: "Hit a pedestrian — who is prosecuted?", back: "The driver, irrespective of who had right of way. Drive defensively around pedestrians.", difficulty: 3 },
  { id: "fc_being_overtaken", categoryId: "rules", front: "When another car overtakes you?", back: "Keep left, hold a steady speed and don't accelerate until they've passed.", difficulty: 2 },
  { id: "fc_freeway_who", categoryId: "rules", front: "Who/what is not allowed on a freeway?", back: "Pedestrians, animals, pedal cycles and very slow vehicles. Learners only if accompanied by a licensed driver.", difficulty: 2 },

  // ── Controls ───────────────────────────────────────────────
  { id: "fc_clutch", categoryId: "controls", front: "Function of the clutch?", back: "Engages/disengages the engine from the gearbox so you can change gear or stop without stalling.", difficulty: 1 },
  { id: "fc_accelerator", categoryId: "controls", front: "Function of the accelerator?", back: "Controls engine power to increase or ease the vehicle's speed.", difficulty: 1 },
  { id: "fc_footbrake", categoryId: "controls", front: "How should you use the foot brake?", back: "Smoothly and progressively with the right foot, on a straight course, both hands on the wheel, without locking up.", difficulty: 2 },
  { id: "fc_handbrake_start", categoryId: "controls", front: "Handbrake position before starting (K53)?", back: "Fully engaged, so the vehicle cannot roll.", difficulty: 2 },
  { id: "fc_handbrake_motion", categoryId: "controls", front: "May you use the handbrake while moving?", back: "No — except if the service brake fails. Apply it when parked or stopped for any length of time.", difficulty: 2 },
  { id: "fc_clutch_control", categoryId: "controls", front: "What is the clutch 'biting point'?", back: "Where the clutch just starts to take up drive and the car won't roll — key for hill starts and slow control.", difficulty: 2 },
  { id: "fc_overheat", categoryId: "controls", front: "Temperature gauge in the red?", back: "Engine overheating — stop safely and switch off to cool. Never open a hot radiator cap.", difficulty: 2 },
  { id: "fc_dip", categoryId: "controls", front: "When must you dip your headlights?", back: "For oncoming traffic and when following another vehicle, to avoid dazzling drivers.", difficulty: 2 },
  { id: "fc_mirror_freq", categoryId: "controls", front: "How often to check mirrors?", back: "Every few seconds, and always before signalling, turning, slowing or changing lanes.", difficulty: 2 },
  { id: "fc_cancel_signal", categoryId: "controls", front: "After a turn or lane change?", back: "Check the indicator has cancelled — switch it off manually if not, so you don't confuse others.", difficulty: 2 },

  // ── Intersections ──────────────────────────────────────────
  { id: "fc_4way", categoryId: "intersections", front: "Right of way at a four-way stop?", back: "First to stop goes first. If simultaneous, the vehicle on the right has priority.", difficulty: 2 },
  { id: "fc_circle", categoryId: "intersections", image: signImg("traffic_circle"), front: "Entering a traffic circle — who has right of way?", back: "Vehicles already in the circle, approaching from your right. Signal left before exiting.", difficulty: 2 },
  { id: "fc_dead_robot", categoryId: "intersections", front: "Traffic light not working?", back: "Treat the intersection as a four-way stop.", difficulty: 1 },
  { id: "fc_right_turn", categoryId: "intersections", front: "Turning right with oncoming traffic?", back: "Yield to oncoming traffic; only turn in a safe gap.", difficulty: 2 },
  { id: "fc_green_arrow", categoryId: "intersections", front: "A green arrow at a robot?", back: "You may go in the arrow's direction when clear; other movements still wait.", difficulty: 2 },
  { id: "fc_t_junction", categoryId: "intersections", front: "On the terminating road at a T-junction?", back: "Give way to traffic on the continuous through road.", difficulty: 2 },
  { id: "fc_box_clear", categoryId: "intersections", front: "Green light but the intersection is blocked?", back: "Wait behind the line — never enter an intersection you can't clear.", difficulty: 2 },
  { id: "fc_turn_ped", categoryId: "intersections", front: "Turning while pedestrians cross the road you're entering?", back: "Give way and let them finish crossing before you complete the turn.", difficulty: 2 },

  // ── Parking ────────────────────────────────────────────────
  { id: "fc_park_crossing", categoryId: "parking", front: "How close to a pedestrian crossing may you stop?", back: "No closer than 9 metres on the approach side.", difficulty: 3 },
  { id: "fc_park_intersection", categoryId: "parking", front: "How close to an intersection may you park?", back: "No closer than 5 metres.", difficulty: 3 },
  { id: "fc_park_downhill", categoryId: "parking", front: "Parking facing downhill — wheels?", back: "Turn front wheels toward the kerb; handbrake on, leave in gear.", difficulty: 3 },
  { id: "fc_park_uphill", categoryId: "parking", front: "Parking facing uphill — wheels?", back: "Turn front wheels away from the kerb so a roll-back is caught; handbrake on, in gear.", difficulty: 3 },
  { id: "fc_no_stopping", categoryId: "parking", front: "No-stopping vs no-parking?", back: "No stopping = may not stop at all. No parking = may stop briefly but not leave it parked.", difficulty: 2 },
  { id: "fc_park_bay", categoryId: "parking", front: "Where must you park when bays are marked?", back: "Within a single demarcated bay — never on a sidewalk or verge.", difficulty: 1 },
  { id: "fc_park_hydrant", categoryId: "parking", front: "Parking next to a fire hydrant?", back: "Prohibited — emergency services need unobstructed access.", difficulty: 2 },

  // ── Following distance ─────────────────────────────────────
  { id: "fc_two_sec", categoryId: "following_distance", front: "The two-second rule?", back: "Pass a fixed point at least 2 s after the car ahead (K53 minimum). 3 s is the recommended safe gap.", difficulty: 1 },
  { id: "fc_wet_gap", categoryId: "following_distance", front: "Following distance in the wet?", back: "Increase to at least 3–4 seconds — braking distance is much longer on wet roads.", difficulty: 2 },
  { id: "fc_truck_gap", categoryId: "following_distance", front: "Following a heavy truck?", back: "Leave a bigger gap (about 6 s) — it blocks your view and needs more room to stop.", difficulty: 2 },
  { id: "fc_brake_square", categoryId: "following_distance", front: "How does braking distance change with speed?", back: "It rises with the square of speed — double the speed ≈ four times the braking distance.", difficulty: 3 },
  { id: "fc_stopping_parts", categoryId: "following_distance", front: "What makes up total stopping distance?", back: "Thinking (reaction) distance + braking distance. Fatigue and alcohol lengthen the thinking part.", difficulty: 2 },
  { id: "fc_night_gap", categoryId: "following_distance", front: "Following distance at night or in fog?", back: "Increase it — you can see less and need more time to react.", difficulty: 2 },

  // ── Hazard awareness ───────────────────────────────────────
  { id: "fc_blind_spot", categoryId: "hazard_awareness", front: "Before changing lanes, besides mirrors?", back: "Do a shoulder check of the blind spot the mirrors can't show (wheels straight).", difficulty: 1 },
  { id: "fc_aquaplane", categoryId: "hazard_awareness", front: "If you start to aquaplane?", back: "Ease off the accelerator, hold the wheel steady, avoid hard braking until grip returns.", difficulty: 3 },
  { id: "fc_fatigue", categoryId: "hazard_awareness", front: "Feeling drowsy while driving?", back: "Stop somewhere safe and rest. Fresh air and coffee only mask fatigue briefly.", difficulty: 2 },
  { id: "fc_scan", categoryId: "hazard_awareness", front: "What is the core of defensive driving?", back: "Scan far ahead, the sides and mirrors continuously; anticipate hazards and keep an escape route.", difficulty: 1 },
  { id: "fc_ball", categoryId: "hazard_awareness", front: "A ball rolls into the road?", back: "A child may follow — slow down and cover the brake.", difficulty: 2 },
  { id: "fc_skid", categoryId: "hazard_awareness", front: "Rear wheels start to skid?", back: "Ease off the power and steer gently into the slide; avoid harsh braking or steering.", difficulty: 3 },
];

/** Core (universal) flashcards plus the vehicle-code–specific and extra cards. */
export const FLASHCARDS: Flashcard[] = [...CORE_FLASHCARDS, ...VEHICLE_FLASHCARDS, ...EXTRA_FLASHCARDS, ...VEHICLE_EXTRA_FLASHCARDS, ...SIGNS_PACK_FLASHCARDS, ...RULES_PACK_FLASHCARDS];

export const FLASHCARDS_BY_ID: Record<string, Flashcard> = Object.fromEntries(
  FLASHCARDS.map((f) => [f.id, f]),
);

export function flashcardsByCategory(categoryId: Flashcard["categoryId"]) {
  return FLASHCARDS.filter((f) => f.categoryId === categoryId);
}
