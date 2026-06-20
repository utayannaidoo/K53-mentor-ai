import type { Flashcard } from "@/types";

export const FLASHCARDS: Flashcard[] = [
  // Signs
  { id: "fc_stop", categoryId: "signs", sign: "stop", front: "What must you do at a STOP sign?", back: "Come to a complete stop behind the stop line every time, then move off only when it is safe.", difficulty: 1 },
  { id: "fc_yield", categoryId: "signs", sign: "yield", front: "What does a YIELD sign require?", back: "Give right of way to crossing traffic and pedestrians. You need not stop if the way is clear, but must be ready to.", difficulty: 1 },
  { id: "fc_no_entry", categoryId: "signs", sign: "no_entry", front: "Red disc with a white horizontal bar?", back: "No entry — vehicles may not proceed past it in that direction.", difficulty: 1 },
  { id: "fc_triangle", categoryId: "signs", front: "What shape and colour are WARNING signs?", back: "Triangular with a red border. They warn of a hazard ahead (e.g. pedestrians, bends, crossings).", difficulty: 2 },
  { id: "fc_regulatory", categoryId: "signs", front: "What do round, red-bordered signs mean?", back: "They are regulatory signs — they give an order you must obey (speed limits, no overtaking, no entry).", difficulty: 2 },
  { id: "fc_railway", categoryId: "signs", sign: "railway", front: "Approaching a railway crossing?", back: "Slow down, look both ways, be ready to stop. Trains always have right of way.", difficulty: 2 },

  // Rules
  { id: "fc_speed_limits", categoryId: "rules", front: "Default speed limits with no sign?", back: "60 km/h urban · 100 km/h rural public roads · 120 km/h freeways.", difficulty: 1 },
  { id: "fc_alcohol", categoryId: "rules", front: "Legal blood-alcohol limit?", back: "Below 0.05 g/100 ml (0.02 for professional drivers). Safest is zero.", difficulty: 2 },
  { id: "fc_keep_left", categoryId: "rules", front: "Keep-left / pass-right rule?", back: "Travel in the left lane; use lanes to the right only to overtake, then return left.", difficulty: 1 },
  { id: "fc_triangle_distance", categoryId: "rules", front: "Emergency triangle distance on a freeway?", back: "At least 45 metres behind the broken-down vehicle.", difficulty: 3 },
  { id: "fc_tread", categoryId: "rules", front: "Minimum legal tyre tread depth?", back: "1 mm across the full tread width and circumference.", difficulty: 2 },
  { id: "fc_right_arm", categoryId: "rules", front: "Hand signal: right arm extended straight out?", back: "Turning right / moving right.", difficulty: 2 },

  // Controls
  { id: "fc_clutch", categoryId: "controls", front: "Function of the clutch?", back: "Engages and disengages the engine from the gearbox so you can change gear or stop without stalling.", difficulty: 1 },
  { id: "fc_handbrake_start", categoryId: "controls", front: "Handbrake position before starting (K53)?", back: "Fully engaged, so the vehicle cannot roll.", difficulty: 2 },
  { id: "fc_overheat", categoryId: "controls", front: "Temperature gauge in the red?", back: "Engine overheating — stop safely and switch off to cool. Never open a hot radiator cap.", difficulty: 2 },
  { id: "fc_dip", categoryId: "controls", front: "When must you dip your headlights?", back: "Within 150 m of oncoming traffic and when following another vehicle, to avoid dazzling.", difficulty: 2 },
  { id: "fc_mirror_freq", categoryId: "controls", front: "How often to check mirrors?", back: "Every few seconds, and always before signalling, turning, slowing or changing lanes.", difficulty: 2 },

  // Intersections
  { id: "fc_4way", categoryId: "intersections", front: "Right of way at a four-way stop?", back: "First to stop goes first. If simultaneous, the vehicle on the right has priority.", difficulty: 2 },
  { id: "fc_circle", categoryId: "intersections", sign: "traffic_circle", front: "Entering a traffic circle — who gets right of way?", back: "Vehicles already in the circle, approaching from your right. Signal left before exiting.", difficulty: 2 },
  { id: "fc_dead_robot", categoryId: "intersections", front: "Traffic light not working?", back: "Treat the intersection as a four-way stop.", difficulty: 1 },
  { id: "fc_right_turn", categoryId: "intersections", front: "Turning right with oncoming traffic?", back: "Yield to oncoming traffic; only turn in a safe gap.", difficulty: 2 },

  // Parking
  { id: "fc_park_crossing", categoryId: "parking", front: "How close to a pedestrian crossing may you stop?", back: "No closer than 9 metres on the approach side.", difficulty: 3 },
  { id: "fc_park_downhill", categoryId: "parking", front: "Parking facing downhill — wheels?", back: "Turn front wheels toward the kerb; handbrake on, leave in gear.", difficulty: 3 },
  { id: "fc_no_stopping", categoryId: "parking", sign: "no_stopping", front: "No-stopping vs no-parking?", back: "No stopping = may not stop at all. No parking = may stop briefly but not leave it parked.", difficulty: 2 },

  // Following distance
  { id: "fc_two_sec", categoryId: "following_distance", front: "The two-second rule?", back: "You should pass a fixed point at least 2 seconds after the vehicle ahead. It scales with speed.", difficulty: 1 },
  { id: "fc_wet_gap", categoryId: "following_distance", front: "Following distance in the wet?", back: "Increase to at least 3–4 seconds — braking distance is much longer on wet roads.", difficulty: 2 },
  { id: "fc_brake_square", categoryId: "following_distance", front: "How does braking distance change with speed?", back: "It rises with the square of speed — double the speed ≈ four times the braking distance.", difficulty: 3 },

  // Hazard awareness
  { id: "fc_blind_spot", categoryId: "hazard_awareness", front: "Before changing lanes, besides mirrors?", back: "Do a shoulder check of the blind spot the mirrors cannot show.", difficulty: 1 },
  { id: "fc_aquaplane", categoryId: "hazard_awareness", front: "If you start to aquaplane?", back: "Ease off the accelerator, hold the wheel steady, avoid hard braking until grip returns.", difficulty: 3 },
  { id: "fc_fatigue", categoryId: "hazard_awareness", front: "Feeling drowsy while driving?", back: "Stop somewhere safe and rest. Fresh air and coffee only mask fatigue briefly.", difficulty: 2 },
  { id: "fc_scan", categoryId: "hazard_awareness", front: "What is the core of defensive driving?", back: "Scan far ahead, to the sides and mirrors continuously; anticipate hazards and keep an escape route.", difficulty: 1 },
];

export const FLASHCARDS_BY_ID: Record<string, Flashcard> = Object.fromEntries(
  FLASHCARDS.map((f) => [f.id, f]),
);

export function flashcardsByCategory(categoryId: Flashcard["categoryId"]) {
  return FLASHCARDS.filter((f) => f.categoryId === categoryId);
}
