import type { Question } from "@/types";

/**
 * Rules-section sprint. Facts trace to docs/content/facts/rules.md,
 * intersections.md, hazard-parking-following.md and aarto.md.
 *
 * Rules is the binding section for every licence code, so this is where depth
 * actually raises the number of distinct mock papers. Spread across all five
 * categories that feed the section, since the mock draws 28 from the group.
 *
 * Offence *principles* rather than penalty figures: reckless versus negligent
 * driving, refusing a test, the duty to obey an officer, what a roadworthy
 * certificate certifies. Those are stable and heavily examined. Specific fines,
 * demerit values, tread depths and validity periods stay out — the standing
 * rule is that a regulated number needs the regulation open beside it, and the
 * AARTO dates in this bank have already moved twice.
 */
export const RULES_SPRINT_QUESTIONS: Question[] = [
  // ── Rules — offences and duties ─────────────────────────────
  {
    id: "qr4_reckless_vs_negligent",
    categoryId: "rules",
    prompt: "The difference between negligent driving and reckless driving is essentially:",
    options: [
      "Negligent driving falls short of the care a reasonable driver would take; reckless driving shows deliberate disregard for the danger created",
      "Negligent driving happens in town and reckless driving on freeways",
      "Negligent driving involves damage and reckless driving does not",
      "They are two names for the same offence",
    ],
    correctIndex: 0,
    explanation:
      "It is a question of state of mind, not of outcome. Reckless is the graver charge because the driver knew the risk and drove on anyway — which is why no crash needs to happen for it to be proved.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr4_refusing_test",
    categoryId: "rules",
    prompt: "A driver who refuses to provide a breath or blood specimen when lawfully required to:",
    options: [
      "Commits an offence by refusing — you cannot avoid the consequences by declining the test",
      "Is within their rights and cannot be charged",
      "May refuse if they have not been drinking",
      "May insist on being tested only at a hospital of their choice",
    ],
    correctIndex: 0,
    explanation:
      "The refusal is itself the offence. Declining is not a way out of a drink-driving charge — it simply adds a second charge to the first.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_racing_public_road",
    categoryId: "rules",
    prompt: "Racing or performing spinning displays on a public road is:",
    options: [
      "An offence regardless of how empty the road appears to be",
      "Permitted late at night when traffic is light",
      "Permitted if the participants close the road themselves",
      "Only an offence if someone is injured",
    ],
    correctIndex: 0,
    explanation:
      "A public road is public whatever the hour. Racing there is treated seriously precisely because the people at risk never agreed to be part of it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_obey_officer",
    categoryId: "rules",
    prompt: "You are lawfully directed by a traffic officer to stop. Failing to do so:",
    options: [
      "Is an offence in itself, separate from whatever prompted them to stop you",
      "Is only an offence if you were speeding",
      "Is acceptable if you do not recognise them as an officer",
      "Is acceptable if you stop further along at a safer place of your choosing",
    ],
    correctIndex: 0,
    explanation:
      "The instruction stands on its own. If you genuinely doubt the setting is safe, slow, indicate that you have seen them and stop as soon as you reasonably can — but stop.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_produce_licence",
    categoryId: "rules",
    prompt: "When a traffic officer asks to see your driving licence, you must:",
    options: [
      "Produce it — driving without being able to produce a valid licence is an offence",
      "Produce it only if you were committing an offence",
      "Provide your identity number instead",
      "Produce it within seven days at a police station of your choice",
    ],
    correctIndex: 0,
    explanation:
      "The licence is the authority to be driving at all, so being able to produce it is part of the permission. Leaving it at home is not a neutral oversight.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_roadworthy_purpose",
    categoryId: "rules",
    prompt: "A roadworthy certificate certifies that:",
    options: [
      "The vehicle met the required safety standards when it was examined — it is not a guarantee for the future",
      "The vehicle will remain safe for the life of the certificate",
      "The vehicle's licence fees have been paid",
      "The owner is insured",
    ],
    correctIndex: 0,
    explanation:
      "It is a snapshot. Brakes, tyres and lights all deteriorate afterwards, which is why the driver's own duty to keep the vehicle in a safe condition never transfers to the certificate.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_learner_supervision",
    categoryId: "rules",
    prompt: "A learner driver on a public road must be:",
    options: [
      "Accompanied by a person with a valid licence for that class of vehicle, seated where they can assist",
      "Accompanied only when driving at night",
      "Accompanied by any adult passenger",
      "Alone, so that the examiner can assess them fairly",
    ],
    correctIndex: 0,
    explanation:
      "The supervisor is there to intervene, so they must both hold the right licence and be in a position to help. A licensed passenger asleep in the back is not supervision.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_licence_disc_display",
    categoryId: "rules",
    prompt: "The vehicle licence disc must be displayed on the windscreen so that:",
    options: [
      "It can be read from outside the vehicle — an expired or hidden disc is an offence",
      "The driver can check the expiry date while driving",
      "It shields the driver from glare",
      "It proves the vehicle is insured",
    ],
    correctIndex: 0,
    explanation:
      "It is a public record that the vehicle is licensed for the road, so it has to face outward. Keeping a valid one in the cubbyhole is the same as not having it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_obstruction_offence",
    categoryId: "rules",
    prompt: "Driving unreasonably slowly so that you obstruct the normal flow of traffic:",
    options: [
      "Can itself be an offence — obstruction is judged against the conditions, not just against the speed limit",
      "Is always safe, because slower is safer",
      "Is only a problem for heavy vehicles",
      "Is acceptable as long as you keep left",
    ],
    correctIndex: 0,
    explanation:
      "A queue behind a needlessly slow vehicle produces risky overtaking. Driving to the conditions cuts both ways: too slow for them is as much a fault as too fast.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr4_pavement_driving",
    categoryId: "rules",
    prompt: "Driving along a pavement or sidewalk to get past stopped traffic is:",
    options: [
      "An offence — the pavement is for pedestrians, who have no reason to expect a vehicle there",
      "Permitted if you drive slowly",
      "Permitted if the traffic is not moving at all",
      "Permitted for motorcycles only",
    ],
    correctIndex: 0,
    explanation:
      "Pedestrians step onto a pavement without looking because it is the one place a vehicle should never be. That assumption is exactly what makes it dangerous to break.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_reverse_freeway",
    categoryId: "rules",
    prompt: "You realise on a freeway that you have missed your exit. Reversing along the shoulder to reach it is:",
    options: [
      "Prohibited and extremely dangerous — carry on to the next interchange",
      "Acceptable if the shoulder is clear",
      "Acceptable at low speed with hazard lights on",
      "Acceptable if you have not yet passed the off-ramp completely",
    ],
    correctIndex: 0,
    explanation:
      "Nobody joining or leaving a freeway is looking for a vehicle coming backwards. The extra few kilometres to the next interchange cost minutes; this costs lives.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_passengers_goods_area",
    categoryId: "rules",
    prompt: "Carrying passengers in the open goods compartment of a bakkie is restricted mainly because:",
    options: [
      "Occupants there have no restraint and are thrown out in a crash or a hard stop",
      "It makes the vehicle harder to steer",
      "It affects the vehicle's licensing category",
      "It obstructs the driver's rear view",
    ],
    correctIndex: 0,
    explanation:
      "There is nothing to hold anyone in. Even a heavy brake, let alone a collision, ejects an unrestrained person over the side or the tailgate.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_pedestrian_facing_traffic",
    categoryId: "rules",
    prompt: "Walking on a road with no sidewalk, a pedestrian should generally:",
    options: [
      "Walk facing oncoming traffic, so they can see and react to approaching vehicles",
      "Walk with their back to the traffic so drivers see them first",
      "Walk in the centre of the lane to be most visible",
      "Walk on either side — it makes no difference",
    ],
    correctIndex: 0,
    explanation:
      "Facing the traffic means the pedestrian can step aside for a vehicle that is too close. With their back to it, the first warning is the impact.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_cyclist_single_file",
    categoryId: "rules",
    prompt: "Cyclists using a public road are generally required to:",
    options: [
      "Ride in single file where riding abreast would obstruct traffic, and keep as far left as is safe",
      "Ride in the centre of the lane at all times",
      "Ride on the pavement wherever one exists",
      "Ride abreast so that they are more visible",
    ],
    correctIndex: 0,
    explanation:
      "A cyclist is a road user with the same duty not to obstruct. Keeping left and single file where it matters is what makes safe overtaking possible.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_solid_line_crossing",
    categoryId: "rules",
    prompt: "You need to enter a driveway that lies across a solid white centre line. You:",
    options: [
      "May cross it only so far as is necessary to reach the entrance, and only when it is safe",
      "May never cross a solid line for any reason",
      "May cross it freely, since a driveway is not overtaking",
      "Must drive on to a gap in the line and make a U-turn",
    ],
    correctIndex: 0,
    explanation:
      "The barrier line exists to stop overtaking and cross-traffic conflict, not to seal off every property along the road. Access is the recognised exception, and it is still subject to safety.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr4_hooter_at_night",
    categoryId: "rules",
    prompt: "Sounding your hooter in a built-up area late at night is:",
    options: [
      "Limited to warning others of your presence for safety — it is not for greeting or expressing annoyance",
      "Prohibited entirely at all hours",
      "Encouraged as a way to alert sleeping residents to traffic",
      "Unrestricted, since the hooter is a safety device",
    ],
    correctIndex: 0,
    explanation:
      "The hooter is a warning instrument. Using it for anything else is both a nuisance and an offence, and it teaches other drivers to ignore it when it matters.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_aarto_points_mechanic",
    categoryId: "rules",
    prompt: "Under the AARTO demerit system, points are recorded against:",
    options: [
      "The driver's own record, so they follow you between vehicles",
      "The vehicle, so selling it clears them",
      "The registered owner only, whoever was driving",
      "The employer, where the vehicle is a company car",
    ],
    correctIndex: 0,
    explanation:
      "The system targets driver behaviour, so the points travel with the person. Changing cars or job does not reset them.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_aarto_paying_fine",
    categoryId: "rules",
    prompt: "Paying an AARTO infringement notice rather than contesting it:",
    options: [
      "Settles the fine but does not remove the demerit points attached to that infringement",
      "Cancels the infringement entirely, including any points",
      "Doubles the points as an admission",
      "Has no effect on your record either way",
    ],
    correctIndex: 0,
    explanation:
      "Paying is an admission, so the points follow. Drivers who assume a paid fine is the end of it are exactly the ones surprised by a suspension later.",
    difficulty: 3,
    scope: "learners",
  },

  // ── Intersections ───────────────────────────────────────────
  {
    id: "qr4_narrow_bridge_priority",
    categoryId: "intersections",
    prompt: "You reach a single-lane bridge at the same time as an oncoming vehicle, with no sign giving either of you priority. You should:",
    options: [
      "Be prepared to give way — whoever can wait more safely should, rather than both committing",
      "Proceed, since traffic on the left always has priority",
      "Proceed, since the larger vehicle should reverse",
      "Sound your hooter and continue",
    ],
    correctIndex: 0,
    explanation:
      "Where no rule assigns priority, the practical rule is co-operation: the driver with the easier stop or the shorter reverse yields. Two drivers each asserting a right meet in the middle.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr4_emergency_stopped_shoulder",
    categoryId: "intersections",
    prompt: "Passing an emergency vehicle stopped on the shoulder with its lights flashing, you should:",
    options: [
      "Slow down and move over a lane if you safely can, leaving room for people working beside it",
      "Maintain speed, since it is stationary and off the roadway",
      "Stop until it moves off",
      "Sound your hooter to signal that you have seen it",
    ],
    correctIndex: 0,
    explanation:
      "Paramedics and officers work with their backs to fast traffic and no protection at all. Space and reduced speed are the only things standing between them and a passing vehicle.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_flashing_amber_signal",
    categoryId: "intersections",
    prompt: "A traffic signal showing a single flashing amber means:",
    options: [
      "Proceed with caution, giving way as the situation requires",
      "Stop completely, as at a stop sign",
      "The signal is out of order and rules do not apply",
      "You have absolute right of way",
    ],
    correctIndex: 0,
    explanation:
      "A flashing amber hands the judgement back to you. It is a warning to approach ready to yield, not a licence to carry on at speed.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_turn_on_arrow_only",
    categoryId: "intersections",
    prompt: "Your traffic signal shows a red light with a green arrow pointing right. You may:",
    options: [
      "Turn right only, giving way to anything already lawfully in the intersection",
      "Turn right or go straight ahead",
      "Proceed in any direction, since a green arrow overrides the red",
      "Turn right without checking, since the arrow guarantees a clear path",
    ],
    correctIndex: 0,
    explanation:
      "The arrow releases one movement and the red holds the rest. It usually does mean the conflicting streams are stopped — but pedestrians and a vehicle still clearing the box are not.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_uncontrolled_equal_roads",
    categoryId: "intersections",
    prompt: "At an intersection with no signs, signals or markings at all, priority goes to:",
    options: [
      "The vehicle approaching from your right",
      "The vehicle on the wider road",
      "The vehicle that arrives at speed",
      "The larger vehicle",
    ],
    correctIndex: 0,
    explanation:
      "The right-hand rule is the fallback when nothing else assigns priority. It only works if both drivers know it, so approach ready to give way regardless.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_pedestrian_crossing_overtake",
    categoryId: "intersections",
    prompt: "A vehicle ahead of you has stopped at a pedestrian crossing. You should:",
    options: [
      "Stop behind it and not overtake — it has almost certainly stopped for someone you cannot see",
      "Overtake carefully if the crossing looks clear from your position",
      "Sound your hooter and pass",
      "Overtake on the left where there is room",
    ],
    correctIndex: 0,
    explanation:
      "The stopped vehicle is the warning. Overtaking it puts you onto the crossing at speed exactly where the pedestrian it stopped for is walking.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_turning_traffic_yield_straight",
    categoryId: "intersections",
    prompt: "Two vehicles approach an intersection from opposite directions; one is going straight and the other turning across its path. Generally:",
    options: [
      "The turning vehicle gives way to the one going straight",
      "The vehicle going straight gives way to the turning one",
      "Whichever arrives first proceeds, regardless of direction",
      "The larger vehicle proceeds first",
    ],
    correctIndex: 0,
    explanation:
      "Turning across an oncoming stream is the manoeuvre that creates the conflict, so the obligation sits with the driver making it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_stop_line_missing",
    categoryId: "intersections",
    prompt: "At a stop sign where the painted stop line has worn away, you must:",
    options: [
      "Still stop, at the point where the line would be — the sign creates the duty, not the paint",
      "Proceed with caution, since there is no line to stop at",
      "Stop only if traffic is approaching",
      "Treat it as a yield sign",
    ],
    correctIndex: 0,
    explanation:
      "The marking shows where; the sign says whether. Worn paint changes nothing about the obligation to come to a complete stop.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Parking ─────────────────────────────────────────────────
  {
    id: "qr4_park_facing_wrong_night",
    categoryId: "parking",
    prompt: "Parking at night on an unlit public road facing against the traffic is particularly dangerous because:",
    options: [
      "Your rear reflectors and lights face away from approaching traffic, so you are far harder to see",
      "The handbrake works less well in the dark",
      "It drains the battery faster",
      "It is only a problem for unlicensed vehicles",
    ],
    correctIndex: 0,
    explanation:
      "Reflectors are engineered to bounce headlights back to the driver behind. Turned the wrong way they do nothing, and an unlit parked car on a dark road is nearly invisible.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_park_blocking_hydrant",
    categoryId: "parking",
    prompt: "Parking in front of a fire hydrant is prohibited because:",
    options: [
      "It costs the fire service time they may not have — they cannot wait for you to move",
      "Vehicles corrode from the water",
      "Hydrants are municipal property that may not be approached",
      "It is only prohibited during dry seasons",
    ],
    correctIndex: 0,
    explanation:
      "Crews connect to the nearest hydrant on arrival. A car parked over it means either a longer run of hose or a broken window to pass one through.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_park_across_two_bays",
    categoryId: "parking",
    prompt: "Parking so that your vehicle occupies two marked bays is:",
    options: [
      "An offence and an obstruction — bays are marked so the space is shared predictably",
      "Acceptable if your vehicle is a large one",
      "Acceptable if the parking area is not full",
      "Only a problem in paid parking areas",
    ],
    correctIndex: 0,
    explanation:
      "The markings are the agreement about how the space is divided. Taking two because it is easier passes the cost of your convenience to whoever arrives next.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_park_engine_running_unattended",
    categoryId: "parking",
    prompt: "Leaving your vehicle unattended with the engine running is unwise chiefly because:",
    options: [
      "Anyone can drive it away, and a vehicle in gear can move off on its own",
      "It wastes a small amount of fuel",
      "It is hard on the starter motor",
      "It voids the roadworthy certificate",
    ],
    correctIndex: 0,
    explanation:
      "This is the classic hijacking and theft opportunity, and it is also how a car left in Drive ends up rolling across a forecourt with nobody in it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_park_narrow_road_both_sides",
    categoryId: "parking",
    prompt: "On a narrow residential street with vehicles already parked on one side, parking opposite them is:",
    options: [
      "Likely to be an obstruction — what remains must still let traffic, including emergency vehicles, through",
      "Acceptable, since both sides are equally available",
      "Acceptable if you park close to the kerb",
      "Only a problem during the day",
    ],
    correctIndex: 0,
    explanation:
      "A fire engine or ambulance needs a continuous width, not an average one. Streets where residents park both sides are exactly where crews get stuck.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Following distance ──────────────────────────────────────
  {
    id: "qr4_fd_assured_clear_distance",
    categoryId: "following_distance",
    prompt: "The principle that you must always be able to stop within the distance you can see to be clear means that:",
    options: [
      "Your safe speed is set by your sight distance, whatever the posted limit says",
      "You may drive at the limit provided your brakes are in order",
      "It applies only at night",
      "It applies only to heavy vehicles",
    ],
    correctIndex: 0,
    explanation:
      "It is the rule underneath fog, night driving, blind crests and bends. If something stationary sits just beyond your view, this principle is what decides whether you hit it.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr4_fd_two_second_why_time",
    categoryId: "following_distance",
    prompt: "The following-distance rule is expressed in seconds rather than metres because:",
    options: [
      "A time gap automatically scales with speed, whereas a fixed distance does not",
      "Seconds are easier to measure with a watch",
      "Metres vary between vehicle types",
      "It matches the way speed limits are written",
    ],
    correctIndex: 0,
    explanation:
      "The reaction time you need barely changes with speed, but the ground it covers does. Counting seconds gives you the right gap at 60 and at 120 without any arithmetic.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_fd_headlight_overdrive",
    categoryId: "following_distance",
    prompt: "'Overdriving your headlights' means:",
    options: [
      "Travelling so fast that you cannot stop within the distance your lights illuminate",
      "Using main beam when you should be dipped",
      "Driving with one headlight out",
      "Leaving your lights on during the day",
    ],
    correctIndex: 0,
    explanation:
      "On dipped beams at open-road speed most drivers are doing exactly this. Anything unlit ahead — a broken-down truck, a pedestrian — arrives inside your stopping distance.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr4_fd_wet_grip_loss",
    categoryId: "following_distance",
    prompt: "Your following distance should be increased in the wet mainly because:",
    options: [
      "Tyres have less grip, so the braking part of your stopping distance grows",
      "Your reaction time slows down in cold weather",
      "Brake lights are harder to see in rain",
      "Wet roads make the engine less responsive",
    ],
    correctIndex: 0,
    explanation:
      "Reaction time is much the same wet or dry; what changes is how much road the tyres need once you are on the brakes. That is the part the bigger gap has to cover.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Hazard awareness ────────────────────────────────────────
  {
    id: "qr4_hz_fatigue_only_cure",
    categoryId: "hazard_awareness",
    prompt: "The only reliable remedy for driver fatigue is:",
    options: [
      "To stop and rest properly — coffee, fresh air and loud music delay it at best",
      "Opening the windows and turning the radio up",
      "Drinking a caffeinated drink and continuing",
      "Driving faster to finish the journey sooner",
    ],
    correctIndex: 0,
    explanation:
      "The tricks buy minutes and mask how impaired you already are. Micro-sleeps of a few seconds happen without the driver noticing, and at open-road speed that is hundreds of metres unattended.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr4_hz_microsleep",
    categoryId: "hazard_awareness",
    prompt: "The most dangerous thing about a 'micro-sleep' at the wheel is that:",
    options: [
      "The driver is often unaware it happened at all",
      "It always lasts more than a minute",
      "It only occurs after midnight",
      "It affects only professional drivers",
    ],
    correctIndex: 0,
    explanation:
      "You cannot take action against something you did not notice. That is why the warning signs — drifting, missed turns, heavy eyes — matter more than how sleepy you feel.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_hz_medication",
    categoryId: "hazard_awareness",
    prompt: "Prescription or over-the-counter medicine that may cause drowsiness:",
    options: [
      "Can impair you enough to make driving unsafe and unlawful, even though it is legally obtained",
      "Is always safe because it is legal",
      "Only matters if combined with alcohol",
      "Affects only the first dose",
    ],
    correctIndex: 0,
    explanation:
      "The law is about whether you are fit to drive, not about where the substance came from. Read the label and ask a pharmacist before a long trip.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_hz_phone_handsfree",
    categoryId: "hazard_awareness",
    prompt: "Using a hands-free phone while driving:",
    options: [
      "Still divides your attention — the main risk is the conversation, not the handset",
      "Removes the risk entirely, which is why it is permitted",
      "Is more dangerous than holding the phone",
      "Only affects inexperienced drivers",
    ],
    correctIndex: 0,
    explanation:
      "Drivers deep in a call look at hazards without registering them. Legal is not the same as safe, and a passenger conversation differs because the passenger sees the road too.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr4_hz_first_rain_oil",
    categoryId: "hazard_awareness",
    prompt: "The road is at its most slippery:",
    options: [
      "In the first minutes of rain after a long dry spell, when oil and rubber lift off the surface",
      "After several hours of steady rain",
      "Once the rain has stopped and the road is drying",
      "Only when the temperature is near freezing",
    ],
    correctIndex: 0,
    explanation:
      "Dry weather leaves a film of oil, diesel and rubber dust. The first rain floats it rather than washing it away, and grip is worse then than in a downpour an hour later.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr4_hz_aquaplane_response",
    categoryId: "hazard_awareness",
    prompt: "If your steering suddenly goes light and unresponsive in heavy rain, you are probably aquaplaning. You should:",
    options: [
      "Ease off the accelerator, hold the wheel straight, and avoid braking hard until grip returns",
      "Brake firmly to slow down as fast as possible",
      "Steer sharply to find grip",
      "Accelerate to push through the water",
    ],
    correctIndex: 0,
    explanation:
      "The tyres are riding on water and have nothing to grip. Any sudden input lands the instant contact returns — which is when it throws the car. Do nothing abrupt and let speed fall.",
    difficulty: 3,
    scope: "learners",
  },
];
