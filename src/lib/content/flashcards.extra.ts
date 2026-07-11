import type { Flashcard } from "@/types";
import { signImg } from "./signs";

/**
 * Second flashcard bank — expands the SRS pool alongside questions.extra so
 * daily review decks stop cycling the same cards. Original wording; facts from
 * the National Road Traffic Act / K53 syllabus.
 */
export const EXTRA_FLASHCARDS: Flashcard[] = [
  // ── Signs ──────────────────────────────────────────────────
  { id: "fc2_one_way_right", categoryId: "signs", image: signImg("one_way_right"), front: "Blue sign, arrow pointing right?", back: "One-way roadway — all traffic travels in the arrow's direction. Never enter against it.", difficulty: 1 },
  { id: "fc2_steep_ascent", categoryId: "signs", image: signImg("steep_ascent"), front: "Steep ascent warning — what to expect?", back: "Slow vehicles ahead. Choose a lower gear early to hold momentum; overtake only where legal and clear.", difficulty: 2 },
  { id: "fc2_temp_signs", categoryId: "signs", front: "Yellow-background road signs?", back: "Temporary signs (roadworks). Same legal force as permanent signs, including temporary speed limits.", difficulty: 1 },
  { id: "fc2_green_boards", categoryId: "signs", front: "Green freeway boards?", back: "Guidance signs: routes, destinations, exits. Read early so you can change lanes in time.", difficulty: 1 },
  { id: "fc2_brown_signs", categoryId: "signs", front: "Brown road signs?", back: "Tourism guidance — attractions and places of interest.", difficulty: 1 },
  { id: "fc2_blue_command", categoryId: "signs", front: "Round blue sign with white arrow?", back: "A command — you MUST do what it shows (e.g. keep left of the island).", difficulty: 2 },
  { id: "fc2_stop_yield_lines", categoryId: "signs", front: "Solid vs broken line ACROSS your lane?", back: "Solid = stop line (stop behind it). Broken = yield line (give way; stop only if not clear).", difficulty: 2 },
  { id: "fc2_painted_island", categoryId: "signs", front: "Diagonal white stripes painted on the tar?", back: "Painted island — keep off it. Cross only in a genuine emergency.", difficulty: 2 },
  { id: "fc2_lane_arrows", categoryId: "signs", front: "Painted arrow in your lane?", back: "Compulsory — in a turn lane you must make that turn, even if you're there by mistake.", difficulty: 2 },
  { id: "fc2_school_patrol", categoryId: "signs", front: "Scholar patrol banner out?", back: "Stop completely and stay stopped until the banner is withdrawn from the road.", difficulty: 1 },
  { id: "fc2_rumble", categoryId: "signs", front: "Rumble strips under your tyres?", back: "An alert — usually slow down for a hazard, tollgate or stop ahead. Look for the reason.", difficulty: 1 },
  { id: "fc2_clearance", categoryId: "signs", front: "'3,7 m' sign on a bridge?", back: "Safe height under the structure. Taller vehicle or load = find another route.", difficulty: 2 },
  { id: "fc2_wild_animals", categoryId: "signs", front: "Wild-animal warning — riskiest times?", back: "Dawn and dusk: animals move and are hardest to see. Slow down and scan the verges.", difficulty: 2 },

  // ── Rules ──────────────────────────────────────────────────
  { id: "fc2_accident_24h", categoryId: "rules", front: "Crash duties?", back: "Stop, help injured, exchange details, report to police within 24 hours.", difficulty: 2 },
  { id: "fc2_tow_rope", categoryId: "rules", front: "Towing with a rope — max speed?", back: "30 km/h. Gap between vehicles max 3,5 m; towed vehicle's steerer must be licensed.", difficulty: 2 },
  { id: "fc2_caravan_people", categoryId: "rules", front: "People in a towed caravan/trailer?", back: "Prohibited — no crash protection, and the combination can sway or detach.", difficulty: 1 },
  { id: "fc2_load_rear", categoryId: "rules", front: "Max rear load projection?", back: "1,8 m beyond the vehicle — marked with a red flag by day, red light at night.", difficulty: 3 },
  { id: "fc2_door", categoryId: "rules", front: "Opening your door on the traffic side?", back: "Only when safe — check mirrors and look back for bikes first. Don't leave it open longer than necessary.", difficulty: 1 },
  { id: "fc2_reversing", categoryId: "rules", front: "Reversing rule?", back: "Only when safe, and no further than necessary.", difficulty: 1 },
  { id: "fc2_coasting", categoryId: "rules", front: "Coasting downhill in neutral?", back: "Don't — no engine braking, brakes overheat, no drive to steer out of trouble. Stay in gear.", difficulty: 2 },
  { id: "fc2_hooter", categoryId: "rules", front: "Legal hooter use?", back: "Only when reasonably necessary for safety — to warn of danger.", difficulty: 1 },
  { id: "fc2_night_parked", categoryId: "rules", front: "Parked on an unlit road at night?", back: "Vehicle must be visible — show parking lamps unless street lighting makes it clearly visible.", difficulty: 3 },
  { id: "fc2_cyclist_1m", categoryId: "rules", front: "Gap when passing a cyclist?", back: "At least 1 metre — more at speed. They may swerve for potholes or wind.", difficulty: 1 },
  { id: "fc2_ped_freeway", categoryId: "rules", front: "Pedestrians on freeways?", back: "Prohibited — but stay alert, people do walk there illegally.", difficulty: 1 },
  { id: "fc2_officer", categoryId: "rules", front: "Officer's signal vs red robot?", back: "The traffic officer overrides robots and signs — obey the officer.", difficulty: 1 },
  { id: "fc2_learner_codes", categoryId: "rules", front: "Learner's licence codes and ages?", back: "Code 1 motorcycles (16) · Code 2 vehicles ≤3 500 kg (17) · Code 3 heavier (18). Valid 24 months.", difficulty: 2 },
  { id: "fc2_prof_limit", categoryId: "rules", front: "Professional drivers' alcohol limit?", back: "Under 0,02 g/100 ml — effectively zero. (Private: under 0,05.)", difficulty: 2 },
  { id: "fc2_bus_100", categoryId: "rules", front: "Bus/minibus max speed?", back: "100 km/h, even on a 120 freeway. Goods vehicles over 9 t: 80 km/h.", difficulty: 2 },

  // ── Controls ───────────────────────────────────────────────
  { id: "fc2_hazard_use", categoryId: "controls", front: "When to use hazard lights?", back: "Stationary vehicle that is a hazard, or a brief warning of danger ahead. Never to legalise bad parking.", difficulty: 1 },
  { id: "fc2_oil_light", categoryId: "controls", front: "Oil-pressure light while driving?", back: "Stop safely and switch off immediately — an unlubricated engine destroys itself in minutes.", difficulty: 2 },
  { id: "fc2_battery_light", categoryId: "controls", front: "Charging warning light on?", back: "Alternator fault — you're on battery time. Plan a safe stop before the electrics die.", difficulty: 2 },
  { id: "fc2_headrest", categoryId: "controls", front: "Correct headrest position?", back: "Top level with the top of your head, close behind it — that's whiplash protection, not a comfort pad.", difficulty: 2 },
  { id: "fc2_ignition_moving", categoryId: "controls", front: "Ignition off while moving?", back: "Never — steering can lock and power assistance for steering/brakes disappears.", difficulty: 2 },
  { id: "fc2_dry_steer", categoryId: "controls", front: "'Dry steering'?", back: "Turning the wheel while stationary — strains the steering and scrubs tyres. Steer while creeping.", difficulty: 3 },

  // ── Intersections ──────────────────────────────────────────
  { id: "fc2_uncontrolled", categoryId: "intersections", front: "Uncontrolled intersection (no signs/robots)?", back: "Slow, be ready to stop, yield to any vehicle in or entering the intersection before you.", difficulty: 2 },
  { id: "fc2_multilane_circle", categoryId: "intersections", front: "Multi-lane circle — lane choice?", back: "Left lane: left/straight. Right lane: right/full circle. Follow the arrows; don't change lanes inside.", difficulty: 2 },
  { id: "fc2_red_arrow", categoryId: "intersections", front: "Steady red arrow?", back: "That movement stops — even if the main light is green.", difficulty: 2 },
  { id: "fc2_left_turn_pos", categoryId: "intersections", front: "Left-turn position?", back: "From the left edge into the nearest lane — no wide swing (bikes fill the gap).", difficulty: 1 },
  { id: "fc2_rail_two_trains", categoryId: "intersections", front: "Train just passed at a multi-track crossing?", back: "Wait — a second train may be hidden behind it. Re-check both ways on every track.", difficulty: 2 },

  // ── Parking ────────────────────────────────────────────────
  { id: "fc2_park_9m_road", categoryId: "parking", front: "Parking beside/opposite another vehicle?", back: "Not where the roadway is narrower than 9 m — moving traffic gets squeezed.", difficulty: 3 },
  { id: "fc2_park_direction", categoryId: "parking", front: "Parking direction on a two-way road?", back: "On the left, facing WITH the traffic flow.", difficulty: 2 },
  { id: "fc2_park_kerb", categoryId: "parking", front: "Parallel-park distance from the kerb?", back: "Close and parallel — within about 450 mm, wheels straight.", difficulty: 2 },
  { id: "fc2_park_bus_stop", categoryId: "parking", front: "Stopping in a marked bus stop?", back: "Prohibited — buses must be able to pull in off the traffic lane.", difficulty: 1 },
  { id: "fc2_double_park", categoryId: "parking", front: "Double parking?", back: "Prohibited — hazards don't legalise blocking a traffic lane.", difficulty: 1 },

  // ── Following distance ─────────────────────────────────────
  { id: "fc2_hill_gap", categoryId: "following_distance", front: "Gap when stopped behind a car on a hill?", back: "See its rear tyres touch the road — roll-back room, and space to pull around if it stalls.", difficulty: 2 },
  { id: "fc2_gravel_gap", categoryId: "following_distance", front: "Following distance on gravel?", back: "At least double — braking takes far longer and dust hides brake lights. Stay out of the dust cloud.", difficulty: 2 },
  { id: "fc2_reaction_28m", categoryId: "following_distance", front: "Distance covered in 1 s at 100 km/h?", back: "About 28 m — before your foot even reaches the brake.", difficulty: 3 },
  { id: "fc2_taxi_gap", categoryId: "following_distance", front: "Following a minibus taxi in town?", back: "Add extra distance — they stop for passengers anywhere, often without warning.", difficulty: 1 },

  // ── Hazard awareness ───────────────────────────────────────
  { id: "fc2_night_peds", categoryId: "hazard_awareness", front: "Biggest night hazard on unlit rural roads?", back: "Dark-clothed pedestrians on the roadway. Slow down; main beam when no traffic; scan the verges.", difficulty: 2 },
  { id: "fc2_pothole", categoryId: "hazard_awareness", front: "Deep pothole spotted late?", back: "Brake firmly in a straight line; if unavoidable, release brakes just before impact. Don't swerve blind.", difficulty: 3 },
  { id: "fc2_blowout", categoryId: "hazard_awareness", front: "Tyre bursts at speed?", back: "Grip the wheel, ease off, keep straight — brake gently only once under control.", difficulty: 3 },
  { id: "fc2_glare", categoryId: "hazard_awareness", front: "Dazzled by oncoming main beams?", back: "Look left toward your lane edge, slow down, never retaliate with your own beams.", difficulty: 2 },
  { id: "fc2_first_rain", categoryId: "hazard_awareness", front: "First rain after a dry spell?", back: "Oil + rubber float up into a greasy film — treat the first minutes like ice.", difficulty: 3 },
  { id: "fc2_fog", categoryId: "hazard_awareness", front: "Fog bank ahead?", back: "Slow BEFORE entering, dipped beams (main beam blinds you), bigger gap, never stop on the roadway.", difficulty: 2 },

  // ── Car-specific (Code 8) ──────────────────────────────────
  { id: "fc2_car_child", categoryId: "rules", codes: ["8"], front: "Child under 3 in a car?", back: "Must be in a proper child restraint — never on a lap or in a plain adult belt.", difficulty: 1 },
  { id: "fc2_car_airbag", categoryId: "rules", codes: ["8"], front: "Rear-facing baby seat position?", back: "Never in front of an active airbag — use the rear seat.", difficulty: 2 },
  { id: "fc2_car_cruise", categoryId: "hazard_awareness", codes: ["8"], front: "Cruise control in rain?", back: "Switch it off — it can hold power through aquaplaning and dulls your throttle response.", difficulty: 3 },

  // ── Motorcycle-specific (Code A / A1) ──────────────────────
  { id: "fc2_mc_headlight", categoryId: "rules", codes: ["A"], front: "Motorcycle headlamp — when on?", back: "Always — day and night. It's also your main 'be seen' tool.", difficulty: 1 },
  { id: "fc2_mc_learner_pillion", categoryId: "rules", codes: ["A"], front: "Pillion on a learner's licence?", back: "Prohibited — motorcycle learners ride alone.", difficulty: 1 },
  { id: "fc2_mc_gear", categoryId: "hazard_awareness", codes: ["A"], front: "Riding gear beyond the helmet?", back: "Gloves, abrasion-resistant jacket, boots, eye protection — tar shreds skin at any speed.", difficulty: 1 },
  { id: "fc2_mc_chain", categoryId: "controls", codes: ["A"], front: "Slack drive chain?", back: "Adjust before riding — a jumping/snapping chain can lock the rear wheel.", difficulty: 2 },
  { id: "fc2_mc_paint", categoryId: "hazard_awareness", codes: ["A"], front: "Wet paint lines & steel plates?", back: "Near-zero grip — cross upright, off the brakes, gentle throttle.", difficulty: 2 },
  { id: "fc2_mc_eyes", categoryId: "hazard_awareness", codes: ["A"], front: "Target fixation?", back: "You steer where you stare — look at the escape gap, not the obstacle.", difficulty: 2 },

  // ── Heavy-specific (Code 10 / 14) ──────────────────────────
  { id: "fc2_hv_arrester", categoryId: "hazard_awareness", codes: ["14"], front: "Brakes failing on a descent, arrester bed ahead?", back: "Commit early and steer positively in — deep gravel stops runaways. Truck damage is irrelevant.", difficulty: 2 },
  { id: "fc2_hv_descent", categoryId: "controls", codes: ["14"], front: "Gear for a long descent?", back: "Low gear selected BEFORE the drop (the gear you'd climb it in) — engine + retarder hold speed, brakes stay in reserve.", difficulty: 2 },
  { id: "fc2_hv_blind", categoryId: "hazard_awareness", codes: ["14"], front: "Truck's worst blind spots?", back: "Directly behind, close along the left side, and just below the windscreen. Long mirror checks before turning left.", difficulty: 2 },
  { id: "fc2_hv_tail_swing", categoryId: "hazard_awareness", codes: ["14"], front: "Tail swing?", back: "Rear overhang swings OUT opposite to your turn — check the outside mirror before committing.", difficulty: 3 },
  { id: "fc2_hv_height", categoryId: "rules", codes: ["14"], front: "Max legal vehicle height?", back: "4,3 m general. Know your real travelling height and route around lower clearances.", difficulty: 3 },
  { id: "fc2_hv_load_recheck", categoryId: "rules", codes: ["14"], front: "Load lashings after departure?", back: "Re-check a short distance into the trip — loads settle and straps loosen.", difficulty: 2 },

  // ═══ Batch 3 — thin-category expansion (universal) ═══
  // ── Parking ────────────────────────────────────────────────
  { id: "fc3_park_450", categoryId: "parking", front: "Parallel parking — how close to the kerb?", back: "Within 450 mm of the kerb/roadway edge, facing the direction of traffic flow.", difficulty: 2 },
  { id: "fc3_park_5m", categoryId: "parking", front: "Parking near an intersection — the limit?", back: "No parking within 5 m of an intersection: a parked car there hides crossing traffic and pedestrians.", difficulty: 2 },
  { id: "fc3_park_two_way", categoryId: "parking", front: "Which side may you park on a two-way road?", back: "Left side only, facing with the traffic. Parking against the flow is prohibited.", difficulty: 1 },
  { id: "fc3_park_unattended", categoryId: "parking", front: "Leaving the car unattended?", back: "Engine off, handbrake set, vehicle secured so it can't move or be driven away.", difficulty: 1 },
  { id: "fc3_park_downhill", categoryId: "parking", front: "Wheels when parked downhill at a kerb?", back: "Turned INTO the kerb (plus handbrake and gear) — the kerb catches a rolling car.", difficulty: 2 },
  { id: "fc3_park_yellow_edge", categoryId: "parking", front: "Solid yellow line along the road edge?", back: "No stopping — except a genuine emergency or where a sign allows it.", difficulty: 2 },

  // ── Following distance ─────────────────────────────────────
  { id: "fc3_fd_count", categoryId: "following_distance", front: "Counting the 2-second rule?", back: "Car ahead passes a fixed point → 'one-thousand-and-one, one-thousand-and-two'. Reach the point early = too close.", difficulty: 1 },
  { id: "fc3_fd_wet4", categoryId: "following_distance", front: "Following distance in rain?", back: "At least 4 seconds — wet braking distances roughly double.", difficulty: 1 },
  { id: "fc3_fd_stopping", categoryId: "following_distance", front: "Total stopping distance =", back: "Reaction distance + braking distance. A tired or distracted brain stretches the first part badly.", difficulty: 2 },
  { id: "fc3_fd_square", categoryId: "following_distance", front: "Double your speed → braking distance?", back: "About 4× longer, not 2× — braking distance grows with the square of speed.", difficulty: 3 },
  { id: "fc3_fd_queue", categoryId: "following_distance", front: "Gap when stopped in a queue?", back: "See the rear tyres of the car ahead touching the tar — enough room to steer out without reversing.", difficulty: 2 },

  // ── Intersections ──────────────────────────────────────────
  { id: "fc3_int_4way", categoryId: "intersections", front: "4-way stop order?", back: "First to stop, first to go. Simultaneous arrival: be ready to yield — never force it.", difficulty: 1 },
  { id: "fc3_int_dead_robot", categoryId: "intersections", front: "Traffic lights out of order?", back: "Treat as a 4-way stop: full stop, proceed in order of arrival, expect others not to.", difficulty: 1 },
  { id: "fc3_int_right_turn", categoryId: "intersections", front: "Turning right — yield to whom?", back: "Oncoming traffic (straight or turning left) and pedestrians crossing the road you're entering.", difficulty: 2 },
  { id: "fc3_int_circle_vs_mini", categoryId: "intersections", front: "Roundabout vs mini-circle priority?", back: "Roundabout: yield to circulating traffic from your right. Mini-circle: first to arrive goes first.", difficulty: 3 },
  { id: "fc3_int_blocked_box", categoryId: "intersections", front: "Green light, blocked intersection?", back: "Wait behind the line until your exit is clear — never trap yourself in the box.", difficulty: 2 },

  // ── Rules — numbers & AARTO ────────────────────────────────
  { id: "fc3_rule_speeds", categoryId: "rules", front: "Default speed limits?", back: "60 km/h urban · 100 km/h rural public roads · 120 km/h freeway. Signs can lower each.", difficulty: 1 },
  { id: "fc3_rule_bac", categoryId: "rules", front: "Blood-alcohol limit?", back: "Under 0,05 g/100 ml (professional drivers 0,02 g). Breath: under 0,24 mg/1000 ml.", difficulty: 2 },
  { id: "fc3_rule_demerits", categoryId: "rules", front: "AARTO demerit thresholds?", back: "Learner: suspension over 6 points. Licensed: over 15. Each point over = 3-month suspension; 1 point expires per clean 3 months.", difficulty: 3 },
  { id: "fc3_rule_ages", categoryId: "rules", front: "Learner's vs driving licence ages (Code 8)?", back: "Learner's licence from 17; full light-vehicle licence from 18. Learners must be supervised by a licensed driver in the car.", difficulty: 1 },
];
