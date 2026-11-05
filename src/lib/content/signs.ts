import type { RoadSign, SignCategory } from "@/types";
import rawCatalog from "./signs.catalog.json";

/**
 * Real South African road signs, extracted from the official K53 manual by
 * scripts/extract_signs.py. The PNG crops live under /public/signs.
 *
 * Auto-extracted meanings are lightly cleaned; the high-traffic and quiz-linked
 * signs in CURATED below get hand-verified names and meanings.
 */
interface RawSign {
  id: string;
  category: SignCategory;
  subcategory: string;
  autoName: string;
  meaning: string;
  image: string;
  page: number;
  /** Intrinsic pixel size of the extracted crop. */
  w?: number;
  h?: number;
}

/**
 * Hand-verified names (and corrected meanings) for common / quiz-linked signs.
 *
 * A `meaning` here is the public page's only unique text, and the answer a
 * generated question shows is its first sentence. So that sentence has to stand
 * alone as an option, and the rest says what the driver must do. Every fact is
 * sourced in docs/content/facts/signs.md ("Sign-page meanings batch").
 *
 * A meaning can't use a word of five letters or more that the sign's appearance
 * text uses (tests/sign-dimensions.test.ts), such as "yellow" on a sign in
 * YELLOW_WARNING_IDS (sign-traits.ts).
 */
const CURATED: Record<string, { name: string; meaning?: string }> = {
  "regulatory-006-01": {
    name: "Stop",
    meaning:
      "Come to a complete stop behind the stop line every time — even if the road is empty — then move off only when it is safe.",
  },
  "regulatory-006-02": {
    name: "Yield",
    meaning:
      "Give way to all cross-traffic and to pedestrians crossing or about to cross. You need not stop if the way is clear, but must be ready to.",
  },
  "regulatory-006-05": {
    name: "Pedestrian crossing (yield)",
    meaning:
      "Give way to any pedestrians on, or about to enter, the pedestrian crossing on your side of the road.",
  },
  "regulatory-007-03": {
    name: "Traffic circle ahead",
    meaning:
      "A mini-circle or roundabout is ahead, and you must be ready to yield when you reach it. Slow down, give way to vehicles already in the circle and to any that will cross their yield line before you cross yours, and travel clockwise around it.",
  },
  "regulatory-007-04": {
    name: "Pedestrian priority",
    meaning:
      "The area is set aside for pedestrians. Vehicles may enter only to load/offload or for an emergency, must yield to pedestrians, and may not exceed 15 km/h.",
  },
  "regulatory-008-01": {
    name: "No entry",
    meaning:
      "No vehicles may enter this road in this direction at any time. You will usually meet it at the end of a one-way street or off-ramp, where traffic would be coming towards you, so find another route rather than turning in.",
  },
  "regulatory-008-02": { name: "One-way roadway (left)" },
  "regulatory-008-03": { name: "One-way roadway (right)" },
  "regulatory-009-03": {
    name: "Speed limit",
    meaning:
      "The maximum speed, in km/h, at which you may drive past this sign. Exceeding it is an offence.",
  },
  "regulatory-011-01": {
    name: "No left turn",
    meaning:
      "Vehicles may not turn left here, but you may go straight on or turn right. The arrow inside the red ring shows which turn is banned, and its twin with the arrow pointing right bans the right turn instead.",
  },
  "regulatory-011-02": {
    name: "No right turn",
    meaning:
      "Vehicles may not turn right here, but you may go straight on or turn left. A yellow disc in place of the white one marks a temporary version, and it binds you just the same.",
  },
  "regulatory-011-05": {
    name: "No U-turn",
    meaning:
      "You may not turn your vehicle around here to face the opposite direction. Carry on to a place where turning is allowed. A plate below the sign can limit the ban to certain times, such as at night.",
  },
  "regulatory-011-07": {
    name: "No parking",
    meaning:
      "You may not park here at any time. (Stricter than it sounds — you may briefly stop to load or set down, but not leave the vehicle parked.)",
  },
  "regulatory-012-01": {
    name: "No overtaking",
    meaning:
      "You may not overtake any vehicle for the next 500 m past this sign, or for the distance on a plate below it. Stay in line behind the vehicle ahead, however slowly it is moving, until the restriction has ended.",
  },
  "regulatory-022-01": {
    name: "Traffic signal — red",
    meaning:
      "Steady red: stop behind the stop line and stay stopped until the signal changes. A green arrow showing with it lets you go in that direction only, provided the intersection is clear.",
  },
  "regulatory-022-03": {
    name: "Traffic signal — amber",
    meaning:
      "Steady amber: stop, unless you are too close to stop safely. Slow down as soon as it shows and wait behind the line for green. Drive through only if you could not stop safely before the line, never to beat the red.",
  },
  "regulatory-022-04": {
    name: "Traffic signal — green",
    meaning:
      "Steady green: you may proceed if the way is clear. You may go in any direction, subject to any road signs, but first give way to vehicles and pedestrians still crossing. Green gives you permission to go, not priority over them.",
  },
  "warning-027-02": {
    name: "Gate / railway boom ahead",
    meaning:
      "The road ahead may be closed by a gate, or a railway crossing with gates, booms or barriers is coming up. Slow down and be ready to stop if the gate or boom is closing or already closed.",
  },
  "warning-027-04": {
    name: "Steep descent ahead",
    meaning:
      "A steep downhill stretch is ahead, which can be a particular hazard for heavy vehicles. Change to a lower gear before you start down if necessary, to protect your brakes from overheating, and allow a longer stopping distance, especially when heavily laden.",
  },
  "warning-027-05": { name: "Steep ascent ahead" },
  "warning-037-01": {
    name: "Pedestrian crossing ahead",
    meaning:
      "A marked pedestrian crossing is coming up, and people may be on it when you arrive. Slow down and give way to anyone on it or about to enter it. Never overtake a vehicle that has stopped at the crossing.",
  },
  "warning-037-02": {
    name: "Pedestrians ahead",
    meaning:
      "More people than usual may be crossing or walking beside the road ahead, with no marked crossing. Slow down and keep watching for the next 2 km, as someone can step or run onto the road with little warning.",
  },
  "warning-037-03": {
    name: "Children ahead",
    meaning:
      "Children may be on or near the road ahead, close to a school, playground or sports field. Slow right down and cover the brake. Children can cross unexpectedly or even be playing in the road, and one can run out from between parked cars without looking.",
  },
  "warning-037-04": {
    name: "Cyclists ahead",
    meaning:
      "Cyclists may be riding along or crossing the road ahead. Slow down, watch for them for the next 2 km and pass only when you can give them room. Before any left turn, check your left mirror and blind spot, because a rider may be beside you.",
  },
  "warning-040-07": {
    name: "Railway crossing",
    meaning:
      "Railway lines cross the road here, so reduce speed and take extreme care. A second, lower cross shows two or more tracks, where one train can hide another. Look both ways, and if a train is coming, stop clear of the tracks and outside the railway reserve.",
  },

  // Batch 5 — names taken from the catalogue meanings, which state the sign
  // unambiguously for these ("Speed humps ahead.", "To prohibit hawkers…").
  // Method spot-checked against the rendered images for a sample spanning both
  // categories (slippery road, speed hump, no-left-at-intersection, end of
  // residential area) — all four matched. Naming a sign is what the generated
  // `name` questions quiz, so only signs whose identity is beyond doubt belong
  // here; anything needing a judgement call about which sign it is was left out.
  "warning-027-01": {
    name: "Cattle grid ahead",
    meaning:
      "A motor gate with a cattle grid is ahead, on the side of the road the arrow shows. Slow down and pass through on that side, and make sure no oncoming vehicle is about to use the same gate.",
  },
  "warning-027-03": {
    name: "Tunnel ahead",
    meaning:
      "A tunnel is coming up on the road ahead, and you may need your headlights to see in it. Slow down, switch them on dipped before you enter and do not overtake. You may not stop inside it or within 6 m of it.",
  },
  "warning-027-06": { name: "Slow-moving vehicles ahead" },
  "warning-028-01": { name: "Gravel road begins" },
  "warning-028-02": {
    name: "Tarred road begins",
    meaning:
      "The gravel road you are on changes to a tarred surface ahead. Slow down for the change and look out for ditches or potholes at the join, which often breaks up, and keep your distance until you are clear of flying stones.",
  },
  "warning-028-03": {
    name: "Uneven road ahead",
    meaning:
      "The road surface ahead is temporarily uneven, with a dip, a ridge or potholes. This is a changed condition rather than the normal state of the road, so slow down early and steer around potholes only where that does not endanger other traffic.",
  },
  "warning-028-04": {
    name: "Speed humps ahead",
    meaning:
      "Speed humps have been built across the road ahead to slow traffic down. Slow down enough to cross them without damaging the vehicle or losing control, release the brake before each hump, and obey any speed limit sign posted with them.",
  },
  "warning-028-05": {
    name: "Road narrows from both sides",
    meaning:
      "The road ahead narrows from both sides, and stays narrower for some distance. Slow down and keep well to the left, because oncoming vehicles will pass close to you.",
  },
  "warning-028-06": {
    name: "Road narrows from one side",
    meaning:
      "The road ahead narrows from one side only, and stays narrower for some distance. Slow down and adjust your position, keeping well to the left, and if the narrowing is on your side, check your mirrors before moving across.",
  },
  "warning-028-07": {
    name: "Road narrows at a bridge",
    meaning:
      "The road gets narrower for a short stretch at a bridge ahead. Slow down and approach with caution, and try not to cross at the same time as an oncoming vehicle. You may not stop on the bridge or within 6 m of it.",
  },
  "warning-029-01": {
    name: "Slippery road ahead",
    meaning:
      "The road ahead can be unusually slippery, especially when wet. Slow down, because sudden braking or harsh steering can start a skid sooner than usual for about the next 2 km. If the vehicle skids, ease off and steer gently where you want to go.",
  },
  "warning-029-02": {
    name: "Falling rocks ahead",
    meaning:
      "Rocks or stones can fall onto the road ahead from a cutting, especially after rain. Slow down, watch the rock face as well as the surface, and be ready to stop for broken rock lying in your lane.",
  },
  "regulatory-007-01": { name: "Stop / Go (manually operated)" },
  "regulatory-008-04": { name: "One-way roadway (straight ahead)" },
  "regulatory-009-07": {
    name: "Proceed clockwise at the junction",
    meaning:
      "You must travel clockwise around the junction ahead, keeping the centre on your right. This blue disc is a command rather than a warning. Yield to vehicles approaching from your right in the roundabout when they are close enough to be a danger.",
  },
  "regulatory-010-02": { name: "Buses and minibuses only" },
  "regulatory-010-05": { name: "Goods vehicles only" },
  "regulatory-010-06": { name: "Pedestrians only" },
  "regulatory-010-07": { name: "Cyclists and pedestrians only" },
  "regulatory-011-03": {
    name: "No left turn at intersection",
    meaning:
      "You may not turn left at the intersection ahead. The bent arrow shows the ban applies at the junction, so get into a lane for another direction before you reach it and take a different route.",
  },
  "regulatory-011-04": {
    name: "No right turn at intersection",
    meaning:
      "You may not turn right at the intersection ahead. The yellow background marks a temporary version, which binds you just the same, so stay out of any right-turn lane and take another route.",
  },
  "regulatory-012-05": {
    name: "No motorcycles",
    meaning:
      "Motorcycles may not use this part of the carriageway, for safety reasons. Riders must stay out, and on a freeway they must leave at the first exit. The yellow background marks a temporary version with the same force as a permanent sign.",
  },
  "regulatory-012-06": {
    name: "No hawkers",
    meaning:
      "Hawkers may not trade in this area at any time of the day or night. Drivers may not stop or park for hawkers here either, because this sign is used where the road is narrow or a parked vehicle could block other drivers' view.",
  },
  "regulatory-012-07": { name: "No pedestrians" },
  "regulatory-014-03": {
    name: "Parking for people with disabilities",
    meaning:
      "Parking here is only for a vehicle carrying people with disabilities. The wheelchair symbol below the P shows who it is kept for, and the same symbol may be painted in the bay itself.",
  },
  "regulatory-014-05": {
    name: "Parking for authorised vehicles",
    meaning:
      "Only authorised vehicles, such as diplomatic cars, may park in this area, as the marking below the P shows. Everyone else must find parking elsewhere, however empty the space looks.",
  },
  "regulatory-014-07": {
    name: "Parking for police vehicles",
    meaning:
      "Only police vehicles may park in this area. The blue sign with a P marks a parking reservation, and the police badge below the P shows who it is kept for.",
  },
  "regulatory-017-02": {
    name: "End of headlights-on requirement",
    meaning:
      "You no longer have to keep your headlights on from this sign onwards. It cancels only the earlier instruction, so you still need lights between sunset and sunrise and whenever visibility drops below 150 m. Motorcyclists keep theirs on at all times.",
  },
  "regulatory-017-05": {
    name: "End of dual-carriage freeway",
    meaning:
      "This dual-carriage freeway ends here, and freeway rules no longer apply beyond the sign. Expect road users a freeway keeps out, such as pedestrians, cyclists and tractors, and check the speed limit now in force.",
  },
  "regulatory-017-06": {
    name: "End of single-carriage freeway",
    meaning:
      "This single-carriage freeway ends here, and freeway rules no longer apply beyond the sign. The freeway bans on stopping and on hand signals fall away, so watch for vehicles slowing or stopping at the roadside.",
  },
  "regulatory-017-07": {
    name: "End of residential area",
    meaning:
      "The residential area ends here, and its special rules stop applying. The 30 km/h limit no longer holds, so check for the speed limit now in force. Pedestrians may still be about, so keep watching for them.",
  },

  // Batch 6 — junction-priority, dimension-warning, temporary and reservation
  // families. Same method as batch 5: the catalogue meaning names the sign
  // outright. Spot-checked against the rendered PNGs for one sign from each
  // family new to this batch — crossroad priority, drift, bus-lane reservation
  // and the height-restriction *warning* triangle — all four matched.
  //
  // The 031-xx entries are the temporary (yellow) twins of the 030-xx warnings.
  // Naming both is deliberate: permanent-vs-temporary is a listed high-yield
  // confusion pair, and the backgrounds differ clearly, so the image answers it.
  "warning-029-04": {
    name: "Jetty or river bank ahead",
    meaning:
      "The road ahead leads to a jetty edge or river bank, so there may be water just beyond the road. Slow down and look out for where the road ends, so that you can stop in time.",
  },
  "warning-029-05": { name: "Drift ahead" },
  "warning-029-06": {
    name: "Reduced visibility ahead",
    meaning:
      "Mist, fog or smoke often cuts visibility on the road ahead. Slow down considerably, switch your headlights on and look out for slow-moving vehicles hidden in it.",
  },
  "warning-029-07": {
    name: "Narrow structure ahead",
    meaning:
      "A bridge or other structure less than 5 m wide is ahead, with room for only one vehicle at a time. Slow down, and if there is oncoming traffic, stop at least 6 m from the structure and yield.",
  },
  "warning-030-01": {
    name: "Length restriction ahead",
    meaning:
      "A legal limit on vehicle length applies on the road ahead, at the figure shown in metres. The road layout leaves long vehicles too little clearance there. This triangle is only the warning and the red-ringed sign is the ban itself, so if your vehicle and any trailer are longer, turn off before you reach it.",
  },
  "warning-030-02": {
    name: "Height restriction ahead",
    meaning:
      "An overhead structure or height gauge ahead limits vehicle height to the figure shown in metres. Check your vehicle and load against it now, because this triangle only warns you and passing the red-ringed limit sign while too tall is the offence.",
  },
  "warning-030-03": {
    name: "Width restriction ahead",
    meaning:
      "The road ahead is restricted in width, and vehicles as wide as the figure in metres or wider may be banned. Measure your vehicle with its load against that figure, and find another route before you reach the red-ringed limit sign if it will not fit.",
  },
  "warning-030-05": { name: "Crosswinds ahead" },
  "warning-031-01": {
    name: "Surface step ahead (temporary)",
    meaning:
      "The level of the road surface changes suddenly ahead, usually where one section has been resurfaced. Slow down and avoid straddling the step, because the vehicle can pull to one side or react suddenly as a wheel climbs it. Do not jerk the steering.",
  },
  "warning-031-02": {
    name: "Soft shoulder ahead (temporary)",
    meaning:
      "The shoulder at the edge of the road ahead is softer than you would expect, which makes pulling off dangerous. Do not drive or stop on it. If you have no choice, for example to avoid a collision, slow down as much as possible, because the soft edge will pull the vehicle towards it.",
  },
  "warning-031-03": {
    name: "Loose stones ahead (temporary)",
    meaning:
      "Loose stones or gravel lie on the road surface ahead, often after fresh resealing. Slow down, because stones thrown up by other vehicles can damage windscreens and paintwork, and your braking and steering will be affected too.",
  },
  "warning-031-04": {
    name: "Width restriction ahead (temporary)",
    meaning:
      "A temporary width limit applies on the road ahead, at the figure shown in metres. It carries the same force as the white version, so a vehicle at or over that width, load included, needs another route.",
  },
  "warning-031-05": {
    name: "Length restriction ahead (temporary)",
    meaning:
      "A temporary limit on vehicle length applies on the road ahead, at the figure shown in metres. Signs like this flag that conditions have changed from normal, so check your vehicle and any trailer against it even on a road you know well.",
  },
  "warning-031-06": { name: "Height restriction ahead (temporary)" },
  "warning-035-02": {
    name: "Priority road with crossroad ahead",
    meaning:
      "A lesser road crosses your priority road ahead, so crossing traffic should give way to you. The thick line on the sign is your road. Right of way is given, not taken, so ease off and be ready in case a vehicle pulls out anyway.",
  },
  "warning-035-03": {
    name: "Priority crossroad ahead",
    meaning:
      "You are on the lesser road, and a priority road crosses it ahead. The thick bar across the sign is the other road, so approach cautiously and yield to its traffic from the left and right.",
  },
  "warning-035-06": {
    name: "Side road junction ahead",
    meaning:
      "A side road joins yours ahead, on the side the sign shows, and traffic may turn in or out there. Your view into it may be limited, so ease off and watch for vehicles pulling out or slowing to turn.",
  },
  "warning-035-07": {
    name: "Staggered junctions ahead",
    meaning:
      "Two side roads join yours ahead, close together and on opposite sides but not directly across from each other. Traffic can join or leave from either side within a short distance, which makes this a poor place to overtake.",
  },
  "warning-038-07": {
    name: "Agricultural vehicles ahead",
    meaning:
      "Tractors or other slow farm vehicles regularly cross or enter the road ahead. Slow down near farm gates and junctions, and overtake only where the markings allow and you can see the road is clear.",
  },
  "regulatory-009-04": { name: "Pass on the side shown" },
  "regulatory-009-05": { name: "Proceed in the direction shown" },
  "regulatory-012-02": {
    name: "No overtaking by goods vehicles",
    meaning:
      "Drivers of heavy motor vehicles may not overtake another heavy vehicle for the next 500 m past this sign. The lorries in the symbol show who the ban is aimed at, so other vehicles may still overtake where road markings and conditions allow it.",
  },
  "regulatory-012-03": { name: "No hooter" },
  "regulatory-013-01": { name: "Bus lane reservation" },
  "regulatory-014-01": {
    name: "Parking reservation",
    meaning:
      "This area is set aside for parking, as the white P on the blue sign shows. It is meant for vehicles under 3 500 kg, so park inside the marked bay and pay any fee that applies. A symbol or plate may limit it further.",
  },
  "regulatory-014-06": {
    name: "Time-limited parking",
    meaning:
      "You may park here only for the time shown on the sign, such as 60 minutes. Pay any fee that applies, note when you arrive and move the vehicle before the limit is up.",
  },
  "regulatory-017-03": {
    name: "End of mass restriction",
    meaning:
      "The vehicle mass limit posted earlier stops applying at this sign. Only the figure inside the crossed-out ring is lifted, so a new limit further on would apply in full.",
  },
  "regulatory-017-04": {
    name: "End of lane reservation",
    meaning:
      "The reserved lane ends here, and all vehicles may now use it. Check your mirrors and blind spot before moving across, because other traffic may already be travelling in it.",
  },

  // Batch 7 — danger plates, information signs and the remaining reservation
  // variants. Danger-plate chevrons spot-checked against the rendered PNG.
  //
  // Deliberately left unnamed: the 040-02/03 and 040-05/06 pairs, whose
  // catalogue meanings are word-for-word identical (they are the left/right
  // variants of one marker), and the 013-02..05 reservation set, which differs
  // only by which side of the yellow line the lane sits. Two quiz answers that
  // differ by a detail the meaning does not state make a question a coin toss.
  "warning-029-03": {
    name: "General warning",
    meaning:
      "A hazard of a general or unusual kind is ahead, often explained on a plate below the sign. It covers things like fallen trees or subsidence, so slow down and look out for anything on or beside the road that could make you change speed or direction.",
  },
  "warning-039-03": {
    name: "Construction vehicles ahead",
    meaning:
      "Construction vehicles may enter or cross the road ahead, from the left, the right or both sides. Many are heavy and slow to clear the road, so ease off and watch for anything they have spilt or dropped, such as gravel, sand or water.",
  },
  "warning-040-01": {
    name: "Danger plate — pass this side",
    meaning:
      "Pass the hazard on the side the arrowhead points to. These red and white plates are fixed to obstructions close to the road, such as bridge supports, culvert walls or unprotected posts, so slow down and keep clear.",
  },
  "warning-040-04": {
    name: "Overhead structure marker",
    meaning:
      "This plate marks a bridge or other structure across the road above you. It is fixed where clearance is low, usually beside a height limit sign, so check that your vehicle and load fit before you drive under.",
  },
  "information-043-01": {
    name: "Freeway exit countdown markers",
    meaning:
      "Each white bar on these signs counts down 100 m to the next freeway exit. You pass three bars at 300 m, two at 200 m and one at 100 m. If you are leaving the freeway, you should be in the left-hand lane by the time you reach them.",
  },
  "information-043-03": {
    name: "No through road",
    meaning:
      "The red bar across the top shows that the road ahead is a dead end. Do not turn into it unless you are going to a destination on that road. The yellow version is the temporary form of the same sign.",
  },
  "information-043-05": {
    name: "Priority road",
    meaning:
      "The road you are travelling on has priority at the junction ahead. Do not slow down unnecessarily, but make sure that other traffic is actually yielding before you go through.",
  },
  "information-044-03": { name: "Modal transfer point" },
  "information-044-04": { name: "Information centre" },
  "regulatory-009-02": { name: "Alternative route to toll road" },
  "regulatory-010-04": { name: "Heavy goods vehicles only" },
  "regulatory-013-06": { name: "Reserved stop zone" },
  "regulatory-013-07": { name: "Temporary lane reservation" },
  "regulatory-014-02": {
    name: "Parking for the class shown",
    meaning:
      "Only the class of vehicle shown by the symbol may park in this area. Any other vehicle must stay out, even when the space is empty. A reservation sets a space aside for that class rather than banning it.",
  },
  "regulatory-014-04": {
    name: "Temporary parking reservation",
    meaning:
      "This area is reserved for the class of vehicle shown, but only for a limited period. Its yellow background marks it as temporary, with the same force as a permanent sign, so other vehicles must stay out while it is up.",
  },
  "marking-081-01": { name: "Exclusive parking bay" },

  // Batch 8 — moving-hazard animals, junction layouts, and the stop/command
  // signs. Every name below was confirmed against the rendered PNG rather than
  // taken from the OCR meaning, because several catalogue meanings are captions
  // belonging to a neighbouring sign (see COMPOSITE_IMAGE_IDS).
  //
  // Deliberately left unnamed:
  //  - warning-036-01 / 036-02, a left/right mirror pair whose catalogue
  //    meanings are both exactly "Sharp junction ahead." — same reason as the
  //    040-02/03 pair above.
  //  - The regulatory-022/023 traffic-signal series. Their meanings are caption
  //    fragments ("Steady red man", "Flashing green arrow") and several of the
  //    images are near-identical, so any name question between them is a coin
  //    toss on a detail the meaning never states.
  //  - regulatory-007-05 (red/black arrow pair). The catalogue meaning reads
  //    "two-way traffic ahead" but the pictogram is the yield-to-oncoming
  //    sign; the two have opposite obligations, so it needs a source check
  //    before it can be quizzed either way.
  "warning-035-01": {
    name: "Crossroad ahead",
    meaning:
      "A crossroad is coming up, and this sign gives no indication of which road has priority. Slow down and look for a stop, yield or signal at the junction. If there is none, look right and left and go only when it is safe.",
  },
  "warning-035-04": {
    name: "T-junction ahead",
    meaning:
      "Your road ends at a T-junction ahead, so you will have to turn sharply left or right. Slow down, get into position and signal in good time. You give way to traffic from both directions on the road you are joining.",
  },
  "warning-035-05": {
    name: "Skew T-junction ahead",
    meaning:
      "Your road ends ahead at a T-junction set at an angle, so you will have to turn left or right. Because the roads meet at an angle, one of the turns is much tighter than the other, so slow down early and give way to traffic on the road you are joining.",
  },
  "warning-037-05": {
    name: "Horses and riders ahead",
    meaning:
      "Horses being ridden or led may be on or crossing the road ahead. Slow right down, pass wide and avoid sudden noise, because a horse disturbed by traffic can move into your path whatever its rider wants.",
  },
  "warning-037-06": {
    name: "Horses ahead",
    meaning:
      "Horses with no rider may be straying on or crossing the road ahead. Slow down and be ready to brake firmly without swerving. A horse stands high on its legs, so in a collision it can come over the bonnet and into the windscreen.",
  },
  "warning-037-07": {
    name: "Cattle ahead",
    meaning:
      "Cattle may be crossing or straying on the road ahead, and where you see one, expect more. Slow down and keep watching for the next 2 km. If someone herding them signals you to stop, you must.",
  },
  "warning-038-01": {
    name: "Sheep ahead",
    meaning:
      "Sheep may be crossing or straying on the road ahead, often where fences are missing. Slow down, watch both sides of the road for the next 2 km and brake rather than swerve if one steps out.",
  },
  "warning-038-02": {
    name: "Wild animals ahead",
    meaning:
      "Antelope and other wild animals may stray onto the road ahead. Slow down and look out for them for the next 2 km. Take special care at night and near bush or water, and brake firmly rather than swerve if one jumps out.",
  },
  "warning-038-03": {
    name: "Warthogs ahead",
    meaning:
      "Warthogs are known to stray onto the road in this area. Where one crosses, others may follow, so slow down, scan both verges and brake firmly rather than swerve.",
  },
  "warning-038-04": {
    name: "Elephants ahead",
    meaning:
      "Elephants are known to stray onto the road in this area. Slow right down, stay in your vehicle and keep your distance. Do not rev or hoot, since either can be taken as a challenge, and move slowly away if one looks agitated.",
  },
  "warning-038-05": {
    name: "Hippos ahead",
    meaning:
      "Hippos are known to stray onto the road in this area. Be especially careful near water and after dark. Slow down, stay in your vehicle and give any animal plenty of room.",
  },
  "warning-038-06": {
    name: "Trams ahead",
    meaning:
      "Trams are running on the road ahead, sharing space with other traffic. Slow down and keep out of any lane reserved for trams, because no other vehicle may drive, stop or park in it.",
  },
  "warning-039-01": {
    name: "Road works ahead",
    meaning:
      "Road construction or maintenance is in progress ahead, so the lanes and surface may change. Slow down early, look out for other signs and people directing traffic or crossing the road, and expect workers even if you cannot see them.",
  },
  "warning-039-02": {
    name: "Grader working ahead",
    meaning:
      "A grader is working on the road ahead, on its own or as part of larger road works. Drive slowly past it, because the full width of the road may not be available, and sand or gravel on the surface can affect how your vehicle handles.",
  },
  "regulatory-006-03": {
    name: "Three-way stop",
    meaning:
      "Three approaches to this junction each have a stop sign, so nobody has automatic priority. Stop in line with the sign or behind the line, and the vehicle that stopped first moves off first. If you are unsure who that was, yield to the right.",
  },
  "regulatory-006-04": {
    name: "Four-way stop",
    meaning:
      "Traffic on all four approaches to this junction has to stop, and the order of stopping decides who goes. Stop in line with the sign or behind the line, then wait your turn rather than forcing it. If two of you stopped together, the vehicle on the right goes first.",
  },
  "regulatory-007-02": {
    name: "Stop, or turn left without stopping",
    meaning:
      "Going straight on or turning right, you must stop in line with the sign or behind the line. Turning left, you may keep moving without stopping if it is safe, but you still give way to cross traffic and pedestrians.",
  },
  "regulatory-009-01": {
    name: "Headlights on",
    meaning:
      "You must switch your headlights on from this sign onwards, on dipped beam, so that you can see and be seen. The instruction lasts until a matching sign with a red cross through it.",
  },
  "regulatory-009-06": { name: "Proceed in the direction shown (temporary)" },
  "regulatory-010-01": {
    name: "Taxis only",
    meaning:
      "This road, or the part of it the sign applies to, is set aside for taxis only. A blue command disc like this tells one class of road user which section to use, so every other driver must keep out, even when it looks empty.",
  },
  "regulatory-011-06": {
    name: "No stopping",
    meaning:
      "You may not stop here, not even for a moment to drop someone off. The only exceptions are to obey a traffic light or traffic officer or to avoid a collision. The ban keeps traffic flowing and stops stationary vehicles from blocking other drivers' view.",
  },
  "regulatory-012-04": { name: "No picking up of passengers" },
  "regulatory-017-01": {
    name: "End of toll road",
    meaning:
      "The toll road finishes at this sign, so its toll rules no longer apply. The red cross cancels only the sign it is drawn over, so any speed limit or other sign further on still counts.",
  },

  // Batch 9 — road markings, the comprehensive signs and a few information
  // plates. Each confirmed against the rendered PNG.
  //
  // Road markings are the largest untouched block in the catalogue and their
  // captions read as names already ("Stop line:", "Box junction:"), but the
  // trailing colon fails the meaning gate, so before this batch not one of them
  // could be quizzed at all.
  //
  // Deliberately left unnamed, with reasons:
  //  - marking-079-01/02/03 ("Painted island" three times), 082-01 + 083-01
  //    ("Lane reserved for trams only" twice), 084-05 + 085-01..04 ("Exclusive
  //    use lane symbol" five times), 087-04 + 088-01 ("End of exclusive use
  //    lane"), 089-01/02 ("Arrestor bed ahead"), 090-01..05 ("Gives extra
  //    guidance"): identical catalogue meanings across two or more images.
  //  - marking-081-02, whose meaning duplicates the already-named 081-01.
  //  - marking-078-02 ("direction:") and 080-01 ("Taxis Mini-buses in an only"):
  //    OCR wreckage.
  //  - marking-082-02: a diamond marking captioned "hazardous goods vehicles".
  //    The diamond is the generic exclusive-use symbol here, so the caption may
  //    be misattributed — it needs a SARTSM check before it can be an answer.
  //  - marking-086-02/03/04 (continuity / lane / dividing line). These are
  //    genuinely different markings and a real thing to know, but the captions
  //    run sparsest→densest as continuity→lane→dividing, which is the reverse
  //    of the SARTSM ordering. Rather than teach three names that may be
  //    shuffled, they wait for a source check. See the roadmap.
  //  - marking-087-02 and 088-03: arrow markings whose names ("Mandatory
  //    direction arrows ahead", "Direction of travel indicators") sit too close
  //    to 081-03 to be fair options against it.
  //  - information-045-03/04 ("For the next 12km" / "For the next 5km"): differ
  //    only by a number the thumbnail cannot render legibly.
  "marking-077-01": {
    name: "Stop line",
    meaning:
      "Come to a complete stop behind this solid white line, and move off only when it is safe. Do this every time, even if the road looks empty. Where there is no stop sign, the line on its own has the same force as one.",
  },
  "marking-077-02": {
    name: "Yield line",
    meaning:
      "This broken white line across your lane is where you slow down and give way. Yield to anyone crossing or wanting to cross your path, stopping only if the way is not clear. It binds you even with no yield sign, and it also applies at a railway crossing.",
  },
  "marking-077-03": {
    name: "Pedestrian crossing markings",
    meaning:
      "Two white lines across the road mark the place where pedestrians may cross. Give way to anyone on the crossing or about to enter it on your side of the road, and stop behind your line, never on the crossing itself.",
  },
  "marking-077-04": {
    name: "Block pedestrian crossing",
    meaning:
      "Broad white blocks across the road mark a pedestrian crossing, the zebra-style version. Approach at a speed that lets you stop, give way to anyone on it or stepping onto it, and never overtake a vehicle stopped there.",
  },
  "marking-077-05": {
    name: "No-overtaking line",
    meaning:
      "No part of your vehicle may cross this solid white line, on its own or on your side of a broken line. The only exceptions are to reach or leave an entrance on the other side or to get past a stationary obstruction, and only when it is safe.",
  },
  "marking-078-01": {
    name: "No-crossing double line",
    meaning:
      "Traffic on neither side may cross these two solid white lines. The only exception is to get around a stationary vehicle or obstruction in the road. The pair sometimes has a broken line running between them.",
  },
  "marking-079-04": {
    name: "Parking bay markings",
    meaning:
      "These painted marks show the space you may park in. Keep the whole vehicle inside one marked bay, and never park on the sidewalk or verge.",
  },
  "marking-081-03": {
    name: "Mandatory direction arrows",
    meaning:
      "Yellow arrows in a lane show the direction traffic in that lane must take. They are compulsory, so read them early and move into the lane for your direction before the junction.",
  },
  "marking-081-04": {
    name: "Lane reserved for buses",
    meaning:
      "This lane is for buses only, during the times shown on the sign that goes with it. No other vehicle may drive, stop or park in it then. The word BUS and a broken yellow line beside the lane show where the reservation runs.",
  },
  "marking-082-03": {
    name: "Lane reserved for bicycles",
    meaning:
      "This lane is for bicycles only, so no other vehicle may drive, stop or park in it. A left turn can sweep across it, so check your mirror and blind spot for riders first.",
  },
  "marking-082-04": {
    name: "Box junction",
    meaning:
      "You may not stop inside this yellow box, because a vehicle waiting there blocks other traffic from turning or driving on. Enter only when you can see you will get right through the junction, even if your signal is green.",
  },
  "marking-083-02": {
    name: "No stopping — solid red line",
    meaning:
      "You may not stop on or next to this solid red line at any time, except in an emergency. It is stricter than a yellow line, because even a quick halt to drop someone off is banned.",
  },
  "marking-083-03": {
    name: "No stopping — broken red line",
    meaning:
      "You may not stop here during the times shown on the road sign that goes with this line. Read the sign before you pull over, because the broken red line only applies during those hours.",
  },
  "marking-083-04": {
    name: "No parking — solid yellow line",
    meaning:
      "You may not park on or next to this solid yellow line at any time. You may stop briefly, for no longer than it takes to load or drop off goods or passengers, which is the difference from a solid red line.",
  },
  "marking-084-01": {
    name: "No parking — broken yellow line",
    meaning:
      "You may not park here during the times shown on the road sign that goes with this line. Check the hours on the sign before leaving your vehicle, because the broken yellow line only applies during those times.",
  },
  "marking-084-02": {
    name: "No motorcycles marking",
    meaning:
      "Motorcycles may not go beyond this marking painted across the lane. The yellow ring and diagonal bar work like a prohibition sign drawn on the road, so riders need another route.",
  },
  "marking-084-03": {
    name: "Mini-circle marking",
    meaning:
      "Travel clockwise around the painted centre of this mini-circle. Give way to any vehicle that will cross a yield line before you and is likely to cross your path, since whoever crosses the yield line first has right of way.",
  },
  "marking-084-04": {
    name: "Disabled persons parking bay",
    meaning:
      "This bay is kept for a vehicle carrying a disabled person, and no other vehicle may park in it. Look for the yellow wheelchair symbol painted inside the bay. A blue parking sign with the same symbol gives the same reservation.",
  },
  "marking-086-01": {
    name: "Railway crossing ahead marking",
    meaning:
      "This long white X painted in your lane warns that a railway crossing is coming up. Slow down and look for trains and signals. If signals are flashing, wait until they stop, even with no train in sight, and stay off the tracks and out of the railway reserve.",
  },
  "marking-087-01": {
    name: "Reversible lane double lines",
    meaning:
      "Short double white lines warn that a neighbouring lane carries oncoming traffic during certain periods. Look for the double-headed arrow that marks the reversible lane, and check which way it is running before you use it.",
  },
  "marking-087-03": {
    name: "No-overtaking line ahead",
    meaning:
      "These arrows warn that a solid line you may not cross is coming up in the road. Do not start to overtake here, and if you are already on the right-hand side, move back to the left before the line begins.",
  },
  "marking-088-02": {
    name: "Furcation arrows",
    meaning:
      "The number of lanes increases ahead, in the direction or directions the arrows point. Read them early and move smoothly into the lane for your route, taking care not to straddle the lane markings.",
  },
  "marking-088-04": {
    name: "Cycle crossing",
    meaning:
      "Two broken lines across the road mark a place where cyclists cross. Slow down and look both ways, and be ready to stop for a rider already on the crossing.",
  },
  "marking-088-05": {
    name: "Yield ahead marking",
    meaning:
      "This long white triangle warns that a yield sign or yield line is coming up. It is advance notice only, so ease off now. Your duty to give way starts at the yield line.",
  },
  "marking-089-03": {
    name: "Escape road ahead",
    meaning:
      "Red and white boxes on the road warn that an emergency escape road is ahead. It gives a vehicle that cannot slow down, usually a heavy one, somewhere to leave the road in an emergency, so do not use it for anything else.",
  },
  "regulatory-016-01": {
    name: "Residential area",
    meaning:
      "Access is allowed, but you may not drive through a residential area without stopping to break your journey. Keep to 30 km/h, give way to all pedestrians and watch for children playing in the street. Vehicles over 3 500 kg or with more than 10 passenger seats may enter only for local access or deliveries.",
  },
  "regulatory-016-02": { name: "Dual-carriage freeway begins" },
  "regulatory-016-03": { name: "Single-carriage freeway begins" },
  "information-045-02": {
    name: "Recommended speed plate",
    meaning:
      "This plate gives the maximum speed recommended for the hazard shown on the sign above it. Road engineers calculate the figure for your safety. It is not a regulatory limit, but if you crash while travelling above it you can still face prosecution.",
  },
  "information-045-06": {
    name: "Blind people plate",
    meaning:
      "Fitted below another sign, this plate tells you that blind people may be on or crossing the road ahead. Ease off and be prepared to stop for them. Flashing your lights or waving will not help, so wait until they have finished crossing.",
  },
  "information-045-07": {
    name: "Accident plate (temporary)",
    meaning:
      "This yellow plate below another sign warns of an accident on the road ahead. Slow down and be ready to stop for emergency vehicles and people on the road. Keep your eyes on your own lane, because slowing to look at a crash can cause another one.",
  },
};

/**
 * Catalogue entries whose image contains **more than one sign**.
 *
 * scripts/extract_signs.py slices sign images out of the manual's page scans by
 * bounding box, and where the manual stacks two or three related signs in one
 * column the slicer takes them as a single image. The catalogue then pairs that
 * multi-sign picture with only one of their meanings — and in warning-027-06's
 * case, with a meaning belonging to neither of the two signs shown.
 *
 * That is fine for a library thumbnail and fatal for a quiz: "what does THIS
 * sign mean?" has no answer when the picture holds three of them. So these are
 * excluded from question generation entirely.
 *
 * Found by rendering every quizzable image with an unusual aspect ratio and
 * looking at it; aspect ratio alone is not the test, since plenty of legitimate
 * signs (road-marking strips, traffic-signal heads) are tall and narrow.
 *
 * The real fix is re-extracting these six from the source pages, which is
 * scripts/extract_signs.py work rather than content work — until then this set
 * keeps them out of the bank.
 */
export const COMPOSITE_IMAGE_IDS: ReadonlySet<string> = new Set([
  "warning-027-06", // steep descent + level crossing; meaning says "slow moving vehicles"
  "warning-030-05", // crosswind + low-flying aircraft + electric hazard
  "warning-031-06", // height restriction + queuing traffic
  "warning-036-03", // four junction-layout variants in one strip
  "warning-039-04", // collision + queuing traffic
  "marking-089-04", // speed-hump marking + kerb strip
  // Found during the batch-9 naming sweep, by looking at every remaining
  // unnamed image rather than only the tall ones. Both of these carry meanings
  // long enough to clear the gate, so unlike the six above they were being
  // asked about.
  "information-043-04", // two no-through-road signs (left variant + right variant)
  "information-044-02", // a "3 PHASE" signal sign + the park-and-ride sign
]);

export function hasCompositeImage(sign: { id: string }): boolean {
  return COMPOSITE_IMAGE_IDS.has(sign.id);
}

/** Intrinsic dimensions of every extracted crop, keyed by its public path.
 *  GENERATED in ./signs-dimensions — deriving them here kept the whole
 *  catalogue JSON glued to every importer of this function, which is how
 *  ~140KB of sign names and meanings rode along into routes that only wanted
 *  "how wide is this image". */
export { signImageDimensions } from "./signs-dimensions";

function deriveName(raw: RawSign): string {
  const c = CURATED[raw.id];
  if (c) return c.name;
  let n = (raw.autoName || raw.subcategory || "Road sign").trim();
  n = n.replace(/^To\s+(indicate|prohibit|give|apply|warn)\b/i, (_m, v) =>
    v.toLowerCase() === "prohibit" ? "No" : "",
  );
  n = n.replace(/\s+/g, " ").replace(/[.;:]+$/, "").trim();
  n = n.charAt(0).toUpperCase() + n.slice(1);
  return n.length > 64 ? n.slice(0, 61).trimEnd() + "…" : n || "Road sign";
}

export const SIGNS: RoadSign[] = (rawCatalog as RawSign[]).map((raw) => ({
  id: raw.id,
  category: raw.category,
  subcategory: raw.subcategory,
  name: deriveName(raw),
  meaning: CURATED[raw.id]?.meaning ?? raw.meaning,
  image: raw.image,
  page: raw.page,
}));

export const SIGNS_BY_ID: Record<string, RoadSign> = Object.fromEntries(
  SIGNS.map((s) => [s.id, s]),
);

/**
 * Signs whose *name* is hand-verified above rather than derived from OCR.
 *
 * deriveName() falls back to the manual's caption text, which is frequently a
 * fragment rather than a name ("Or under certain conditions", "Examples",
 * "May not"). Fine as a library label, useless as a quiz answer — so anything
 * that asks the learner to name a sign must draw only from this set.
 */
export const VERIFIED_NAME_IDS: ReadonlySet<string> = new Set(Object.keys(CURATED));

export function hasVerifiedName(sign: { id: string }): boolean {
  return VERIFIED_NAME_IDS.has(sign.id);
}

/**
 * The subset safe to publish on an indexed, signed-out page.
 *
 * Same standard as quiz generation, and for the same reason: a derived name is
 * often an OCR fragment ("Or under certain conditions", "as pedestrians
 * crossing or waiting to cross your path"), and a composite crop shows two or
 * three signs under one caption. Either is tolerable behind a login as a
 * browsing aid next to the real meaning — both are damaging on a public page
 * whose entire pitch is that this content is verified.
 */
export const VERIFIED_SIGNS: RoadSign[] = SIGNS.filter(
  (s) => hasVerifiedName(s) && !hasCompositeImage(s),
);

export function signsByCategory(category: SignCategory): RoadSign[] {
  return SIGNS.filter((s) => s.category === category);
}

export { SIGN_CATEGORIES } from "./sign-categories";

/** Friendly keys → catalogue id, for attaching real images to study content. */
const SIGN_KEY_TO_ID = {
  stop: "regulatory-006-01",
  yield: "regulatory-006-02",
  yield_pedestrian: "regulatory-006-05",
  pedestrian_priority: "regulatory-007-04",
  traffic_circle: "regulatory-007-03",
  no_entry: "regulatory-008-01",
  one_way_left: "regulatory-008-02",
  one_way_right: "regulatory-008-03",
  speed_limit: "regulatory-009-03",
  no_left_turn: "regulatory-011-01",
  no_right_turn: "regulatory-011-02",
  no_u_turn: "regulatory-011-05",
  no_parking: "regulatory-011-07",
  no_overtaking: "regulatory-012-01",
  robot_red: "regulatory-022-01",
  robot_amber: "regulatory-022-03",
  robot_green: "regulatory-022-04",
  gate_boom: "warning-027-02",
  steep_descent: "warning-027-04",
  steep_ascent: "warning-027-05",
  pedestrian_crossing: "warning-037-01",
  pedestrians: "warning-037-02",
  children: "warning-037-03",
  cyclists: "warning-037-04",
  railway: "warning-040-07",
  // Batch 4 — meanings hand-verified against the manual text in the catalogue.
  headlights_on: "regulatory-009-01",
  pass_side: "regulatory-009-04",
  proceed_direction: "regulatory-009-05",
  circle_clockwise: "regulatory-009-07",
  no_left_intersection: "regulatory-011-03",
  no_right_intersection: "regulatory-011-04",
  no_overtaking_trucks: "regulatory-012-02",
  no_hooter: "regulatory-012-03",
  reserved_lane_bus: "regulatory-013-01",
  // Batch 8 — qualifier ("selective restriction") plates and the main signs
  // they hang under. These images are the whole point of the sign-plus-plate
  // questions in motus-signs-pack.ts: the plate is what changes the meaning,
  // so the learner has to see both together.
  qual_uturn_night: "regulatory-020-02",
  qual_right_turn_times: "regulatory-020-03",
  qual_speed_motorcycles: "regulatory-020-04",
  qual_no_right_buses: "regulatory-021-01",
  qual_min_speed_goods: "regulatory-021-02",
  qual_no_overtaking_2km: "regulatory-021-03",
  qual_max_15: "regulatory-019-03",
  qual_pay_parking: "regulatory-019-04",
  qual_local_access: "regulatory-019-06",
  qual_for_5km: "regulatory-019-07",
  qual_daytime: "regulatory-018-06",
  qual_night: "regulatory-018-07",
  three_way_stop: "regulatory-006-03",
  four_way_stop: "regulatory-006-04",
  stop_go_left: "regulatory-007-02",
  taxis_only: "regulatory-010-01",
  no_stopping: "regulatory-011-06",
  no_passenger_pickup: "regulatory-012-04",
  end_toll_road: "regulatory-017-01",
  crossroad_ahead: "warning-035-01",
  t_junction_ahead: "warning-035-04",
  cattle_ahead: "warning-037-07",
  wild_animals_ahead: "warning-038-02",
  road_works_ahead: "warning-039-01",
} as const;

export type SignImgKey = keyof typeof SIGN_KEY_TO_ID;

/** Resolve a friendly sign key to its public image path (empty string if missing). */
export function signImg(key: SignImgKey): string {
  return SIGNS_BY_ID[SIGN_KEY_TO_ID[key]]?.image ?? "";
}
