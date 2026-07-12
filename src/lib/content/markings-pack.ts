import type { Flashcard, Question } from "@/types";

/**
 * Sprint 3 — Road markings (deeper) + temporary signs pack. Facts trace to
 * docs/content/facts/signs.md §"Sprint 3". All items sit in the "signs"
 * category (markings and signs share the study surface). Text-first: these
 * concepts are about painted lines and yellow backgrounds rather than a
 * single catalogue glyph.
 */
export const MARKINGS_PACK_QUESTIONS: Question[] = [
  // ── Centre & barrier lines ──────────────────────────────────
  {
    id: "q6_mark_double_solid",
    categoryId: "signs",
    prompt: "The centre of the road is marked with TWO solid lines side by side. This means:",
    options: [
      "The faster lane may cross to overtake",
      "Neither direction may cross the lines — no overtaking or crossing at all",
      "Only heavy vehicles may not cross",
      "It marks the start of a freeway",
    ],
    correctIndex: 1,
    explanation:
      "Double solid lines forbid crossing for both directions — used where a head-on risk is high, like blind curves and rises. Wait for a broken line before overtaking.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q6_mark_cross_barrier_legal",
    categoryId: "signs",
    prompt: "Crossing a solid (barrier) centre line where it applies to you is:",
    options: [
      "A judgement call left to the driver",
      "A traffic offence, not merely inadvisable",
      "Allowed if no traffic is oncoming",
      "Allowed to pass a cyclist",
    ],
    correctIndex: 1,
    explanation:
      "A barrier line is a regulatory marking. Crossing it is an offence in its own right — the empty road doesn't make it legal.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q6_mark_white_edge",
    categoryId: "signs",
    prompt: "A continuous WHITE line along the left edge of your lane is:",
    options: [
      "A no-stopping line",
      "The edge (fog) line marking the left boundary of the travelled lane — useful in poor visibility",
      "A cycle-lane divider",
      "A barrier line you may never cross",
    ],
    correctIndex: 1,
    explanation:
      "The white edge line shows where your lane ends and the shoulder begins. In rain or mist it's a vital reference for staying in lane.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q6_mark_yellow_freeway_shoulder",
    categoryId: "signs",
    prompt: "On a freeway, the yellow line on the far left marks the edge of the travelled way. The shoulder beyond it:",
    options: [
      "Is a slow lane for overtaking",
      "Is NOT a driving or overtaking lane — use it only in a genuine emergency",
      "Is a permanent cycle lane",
      "May be used to skip traffic",
    ],
    correctIndex: 1,
    explanation:
      "The yellow line edges the road; the shoulder is for emergencies and stopped vehicles. Driving in it — to pass traffic or 'help flow' — is illegal and hits stationary cars.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Road studs (cat's eyes) ─────────────────────────────────
  {
    id: "q6_mark_studs_white",
    categoryId: "signs",
    prompt: "Reflective road studs (cat's eyes) that are WHITE usually mark:",
    options: [
      "The right edge of the road",
      "The lane lines / centre of the road",
      "A pedestrian crossing",
      "A no-entry zone",
    ],
    correctIndex: 1,
    explanation:
      "White studs follow the lane and centre lines. Red studs mark the left edge, yellow the right edge — at night they reflect your lights so the road's shape shows up.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q6_mark_studs_red",
    categoryId: "signs",
    prompt: "You notice the reflective studs beside you have turned RED. This warns you that:",
    options: [
      "You are in the correct lane",
      "You are at the LEFT edge of the road — drifting further left takes you off the roadway",
      "A red traffic light is ahead",
      "The road is closed",
    ],
    correctIndex: 1,
    explanation:
      "Red studs mark the left edge. Seeing red to your left at night means you're wandering off the road — steer gently back towards the white lane studs.",
    difficulty: 3,
    scope: "learners",
  },

  // ── Junction / area markings ────────────────────────────────
  {
    id: "q6_mark_box_junction",
    categoryId: "signs",
    prompt: "A yellow criss-cross (box) marking is painted in an intersection. You may enter it only when:",
    options: [
      "Your light is green",
      "Your EXIT beyond the box is clear so you won't stop inside it",
      "There are no pedestrians",
      "You are turning left",
    ],
    correctIndex: 1,
    explanation:
      "The yellow box keeps a busy junction from grid-locking. Green isn't enough — you must be able to clear the box, or you'll trap cross-traffic when their light turns.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q6_mark_keep_clear",
    categoryId: "signs",
    prompt: "'KEEP CLEAR' is painted across a stretch of road (e.g. over a driveway). It means:",
    options: [
      "Extra parking when the road is busy",
      "Leave the area open — do not stop or queue over it, even in slow traffic",
      "Pedestrians only",
      "A loading zone",
    ],
    correctIndex: 1,
    explanation:
      "Keep-clear markings protect an access that must stay open — a fire exit, driveway or side road. Blocking it in a queue defeats the whole point.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q6_mark_stop_line_setback",
    categoryId: "signs",
    prompt: "At a marked pedestrian crossing, the stop line is set back BEFORE the striped area so that:",
    options: [
      "Drivers can park on the stripes",
      "A stopped vehicle leaves the crossing itself clear and doesn't block other drivers' view of pedestrians",
      "Cyclists can filter past",
      "The crossing looks longer",
    ],
    correctIndex: 1,
    explanation:
      "Stopping behind the set-back line keeps the crossing open and lets the next lane's driver see pedestrians. Creeping onto the stripes hides the very people it protects.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q6_mark_lane_reduction",
    categoryId: "signs",
    prompt: "A large painted arrow curves your lane into the next one ahead. This tells you:",
    options: [
      "Overtaking lane starts",
      "Your lane is ending — merge into the adjoining lane in good time",
      "A turn is compulsory here",
      "The road becomes one-way",
    ],
    correctIndex: 1,
    explanation:
      "Lane-reduction arrows warn of a merge. Move over early and smoothly; leaving it to the cone is how last-second swerves and side-swipes happen.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q6_mark_chevron_barrier",
    categoryId: "signs",
    prompt: "A painted island bordered by a SOLID line means:",
    options: [
      "You may drive over it to save time",
      "You may not enter or cross it — treat it as a solid barrier",
      "It is optional guidance",
      "Parking is allowed inside it",
    ],
    correctIndex: 1,
    explanation:
      "A solid border upgrades a painted island to a no-go zone. (A broken border you may cross when it's safe, e.g. to reach a turn lane.)",
    difficulty: 3,
    scope: "learners",
  },

  // ── Temporary signs ─────────────────────────────────────────
  {
    id: "q6_temp_yellow_force",
    categoryId: "signs",
    prompt: "A temporary road sign on a YELLOW background is:",
    options: [
      "Advisory only — obey it if convenient",
      "Fully enforceable — it has the same legal force as a permanent sign, including temporary speed limits",
      "Valid only during daylight",
      "Only for heavy vehicles",
    ],
    correctIndex: 1,
    explanation:
      "Yellow means temporary, not optional. A temporary 40 km/h at roadworks is as enforceable — and as necessary — as any permanent limit.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q6_temp_why_yellow",
    categoryId: "signs",
    prompt: "Why are temporary signs printed on a yellow background?",
    options: [
      "Yellow paint is cheapest",
      "The high-visibility colour instantly flags that conditions have changed from normal — re-assess",
      "To match construction vehicles",
      "It has no particular meaning",
    ],
    correctIndex: 1,
    explanation:
      "Yellow shouts 'something's different here'. The moment you see it, drop your assumptions about the road and read what's changed.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q6_temp_flagperson",
    categoryId: "signs",
    prompt: "At roadworks a flag person turns their board to STOP. You must:",
    options: [
      "Slow down but keep rolling if the road looks clear",
      "Stop completely — the STOP board is a lawful stop instruction",
      "Wave to ask permission and proceed",
      "Ignore it; only officers can stop you",
    ],
    correctIndex: 1,
    explanation:
      "The STOP-GO board carries legal authority at the works. STOP means stop and wait; when it turns to GO you proceed with caution through the site.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q6_temp_speed_zone",
    categoryId: "signs",
    prompt: "A temporary 40 km/h sign stands at roadworks on a normally 120 km/h freeway. You should:",
    options: [
      "Keep to 120 until you see workers",
      "Slow to 40 km/h for the length of the works — the temporary limit applies",
      "Average the two limits",
      "Follow the car ahead's speed",
    ],
    correctIndex: 1,
    explanation:
      "The temporary limit replaces the normal one through the works, protecting workers and coping with narrowed, uneven lanes. It's enforced, often by camera.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q6_temp_cones",
    categoryId: "signs",
    prompt: "Cones and barricades channel traffic into a single lane at roadworks. You may:",
    options: [
      "Move a cone aside if the closed lane is empty",
      "Only follow the coned path — never enter or move the barriers",
      "Use the closed lane to overtake the queue",
      "Drive on the shoulder to skip ahead",
    ],
    correctIndex: 1,
    explanation:
      "The coned-off area may hide workers, equipment or a drop-off. Follow the marked path; moving barriers or using the closed lane is dangerous and illegal.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q6_temp_detour",
    categoryId: "signs",
    prompt: "A temporary DETOUR sign points away from your normal route because the road ahead is closed. You should:",
    options: [
      "Ignore it and push through the closure",
      "Follow the detour — temporary route signs override the normal route while in place",
      "Wait at the closure until it reopens",
      "Reverse and find your own way",
    ],
    correctIndex: 1,
    explanation:
      "Detour signs reroute you around a closure or hazard. They take priority over the usual direction until the situation clears.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q6_temp_vs_permanent",
    categoryId: "signs",
    prompt: "A permanent sign says 100 km/h; a temporary yellow sign at roadworks says 60 km/h. Which applies?",
    options: [
      "The permanent 100 — it's the real limit",
      "The temporary 60 — a temporary sign takes precedence over the permanent one it replaces",
      "Whichever is higher",
      "Neither — use your judgement",
    ],
    correctIndex: 1,
    explanation:
      "Temporary signs exist precisely to override the normal ones for changed conditions. Where they conflict, the temporary sign wins.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q6_temp_workers_end",
    categoryId: "signs",
    prompt: "You pass the last cone at roadworks but haven't seen an 'end of roadworks' or higher-limit sign yet. You should:",
    options: [
      "Immediately accelerate to the normal limit",
      "Stay at the temporary limit until a sign restores the normal one — the restriction holds until lifted",
      "Guess the limit from the road type",
      "Match the car behind you",
    ],
    correctIndex: 1,
    explanation:
      "A temporary limit applies until a sign ends it. Speeding up at the last cone is a classic camera trap — and workers or debris may still be just ahead.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Kerb & speed-hump markings ──────────────────────────────
  {
    id: "q6_mark_speed_hump",
    categoryId: "signs",
    prompt: "White triangles or bars painted on the road ahead of a raised hump warn you to:",
    options: [
      "Speed up over the hump",
      "Slow down for a speed hump / raised crossing ahead",
      "Change lanes",
      "Stop completely",
    ],
    correctIndex: 1,
    explanation:
      "The markings give advance warning of a hump or raised crossing — slow early so you cross gently, protecting your vehicle and any pedestrians using it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q6_mark_kerb_paint",
    categoryId: "signs",
    prompt: "A painted (coloured) kerb generally indicates:",
    options: [
      "Extra-wide parking",
      "A stopping or parking restriction — obey it and any accompanying sign",
      "A cycle lane",
      "A bus-only kerb",
    ],
    correctIndex: 1,
    explanation:
      "Painted kerbs flag stopping/parking rules (exact colour conventions vary by municipality). Read the nearby sign to know the specific restriction.",
    difficulty: 2,
    scope: "learners",
  },
];

export const MARKINGS_PACK_FLASHCARDS: Flashcard[] = [
  // Lines
  { id: "fc6_double_solid", categoryId: "signs", front: "Double solid centre lines?", back: "No crossing or overtaking for EITHER direction.", difficulty: 2 },
  { id: "fc6_barrier_legal", categoryId: "signs", front: "Crossing a barrier (solid) line — how serious?", back: "A traffic offence, not just unwise — even on an empty road.", difficulty: 2 },
  { id: "fc6_white_edge", categoryId: "signs", front: "Continuous white line at the LEFT edge?", back: "Edge (fog) line — the left boundary of your lane; key in poor visibility.", difficulty: 2 },
  { id: "fc6_yellow_shoulder", categoryId: "signs", front: "Yellow line + shoulder on a freeway?", back: "Shoulder is NOT a driving/overtaking lane — emergencies only.", difficulty: 2 },

  // Studs
  { id: "fc6_studs_colours", categoryId: "signs", front: "Cat's-eye stud colours (SA)?", back: "White = lanes/centre · red = left edge · yellow = right edge.", difficulty: 3 },
  { id: "fc6_studs_red", categoryId: "signs", front: "Red studs appear on your left at night?", back: "You're drifting off the left edge — steer back to the white lane studs.", difficulty: 3 },

  // Junction/area
  { id: "fc6_box_junction", categoryId: "signs", front: "Yellow criss-cross box in a junction?", back: "Enter only when your EXIT is clear — green isn't enough.", difficulty: 2 },
  { id: "fc6_keep_clear", categoryId: "signs", front: "'KEEP CLEAR' painted on the road?", back: "Leave it open — never stop or queue over it.", difficulty: 1 },
  { id: "fc6_ped_setback", categoryId: "signs", front: "Why is the stop line set BACK from a pedestrian crossing?", back: "So a stopped car leaves the crossing clear and doesn't hide pedestrians from other drivers.", difficulty: 2 },
  { id: "fc6_lane_reduction", categoryId: "signs", front: "Big arrow curving your lane into the next?", back: "Lane ending — merge in good time, not at the last cone.", difficulty: 2 },
  { id: "fc6_island_border", categoryId: "signs", front: "Painted island with a SOLID border?", back: "No entry — treat as a barrier. Broken border = may cross when safe.", difficulty: 3 },
  { id: "fc6_speed_hump_mark", categoryId: "signs", front: "White triangles/bars painted before a hump?", back: "Warning of a speed hump / raised crossing — slow early.", difficulty: 1 },

  // Temporary
  { id: "fc6_temp_force", categoryId: "signs", front: "Yellow-background sign — enforceable?", back: "Yes, full legal force. Temporary ≠ optional.", difficulty: 1 },
  { id: "fc6_temp_why", categoryId: "signs", front: "Why are temporary signs yellow?", back: "High-visibility 'conditions have changed' flag — re-assess the road.", difficulty: 2 },
  { id: "fc6_temp_flag", categoryId: "signs", front: "Flag person's board turns to STOP?", back: "Stop completely — it's a lawful stop instruction. GO = proceed with caution.", difficulty: 1 },
  { id: "fc6_temp_speed", categoryId: "signs", front: "Temporary 40 at roadworks on a 120 freeway?", back: "Do 40 for the length of the works — often camera-enforced.", difficulty: 1 },
  { id: "fc6_temp_cones", categoryId: "signs", front: "Cones/barricades at roadworks?", back: "Follow the coned path only. Never enter or move the barriers.", difficulty: 1 },
  { id: "fc6_temp_detour", categoryId: "signs", front: "Temporary DETOUR sign?", back: "Follow it — it overrides your normal route until the closure clears.", difficulty: 1 },
  { id: "fc6_temp_priority", categoryId: "signs", front: "Temporary vs permanent sign conflict?", back: "Temporary wins — it exists to override the normal one for changed conditions.", difficulty: 2 },
  { id: "fc6_temp_until_lifted", categoryId: "signs", front: "How long does a temporary limit apply?", back: "Until a sign ends it — don't speed up at the last cone.", difficulty: 2 },
];
