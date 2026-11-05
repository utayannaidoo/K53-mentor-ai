# Fact base — Road signs (Sprint 1 source)

Primary sources: the app's own catalogue `src/lib/content/signs.catalog.json` (439 signs auto-extracted from the official K53 manual, images under /public/signs), SARTSM structure via Dept of Transport ([V2C3 regulatory/warning](https://www.transport.gov.za/wp-content/uploads/2023/02/V2C3.pdf), [V1C4 guidance](https://www.transport.gov.za/wp-content/uploads/2023/02/V1C4.pdf)), [Arrive Alive sign library](https://www.arrivealive.mobi/traffic-signs-of-south-africa), [Wikipedia — Road signs in South Africa](https://en.wikipedia.org/wiki/Road_signs_in_South_Africa).

## Sign system (testable structure)
- Classes: **regulatory** (control signs like stop/yield; command = blue circle; prohibition = red-ringed circle; reservation), **warning** (red-bordered triangle, hazard ahead), **guidance/information** (direction, freeway green, tourism brown), **road markings**, **temporary** (yellow background, same legal force — used at roadworks).
- Shape/colour grammar: red ring circle = prohibition; blue circle = command (must do); red triangle = warning; octagon = stop; inverted triangle = yield.
- Prohibition "de-restriction" variants: the same symbol crossed with diagonal band ends the restriction.

## Verified sign facts used in Batch 4 (id → meaning; hand-checked against manual text)
- regulatory-009-01: Switch headlamps on (command) — lights on dip to see and be seen.
- regulatory-009-04: Pass on the side shown — drive to that side of the obstruction.
- regulatory-009-05 / 009-06: Proceed only in the arrow's direction (here / at next junction).
- regulatory-009-07: Traffic circle command — move clockwise at the junction.
- regulatory-011-01/02: No left / right turn. 011-03/04: same, at the intersection. 011-05: No U-turn.
- regulatory-011-07: No parking at any time (brief stop to load allowed; parking not).
- regulatory-012-01: No overtaking (applies for next 500 m per manual note).
- regulatory-012-02: No overtaking by goods vehicles (next 500 m).
- regulatory-012-03: No excessive noise / hooter restriction past the sign.
- regulatory-013-x: Reservation signs — lane left of the curved/solid yellow line reserved for the class shown (e.g. buses).
- regulatory-022-01/03/04: robot red = stop; steady amber = stop unless too close to stop safely; green = go if clear.
- warning-027-04/05: steep descent / ascent ahead. warning-040-07: railway crossing.
- warning-037-01..04: pedestrian crossing / pedestrians / children / cyclists ahead.

## High-yield confusion pairs (exam favourites)
- Stop vs yield (full stop always vs give way, stop only if needed).
- No-parking vs no-stopping (stopping = not even briefly).
- Warning triangle "traffic circle ahead" vs blue command "circle — go clockwise".
- Permanent (white) vs temporary (yellow) versions of the same sign.
- Regulatory speed limit (must) vs advisory/guidance speed (recommended).

## Road markings (sub-batch)
- Solid line across lane = stop line; broken across = yield line.
- Centre: broken = may cross to overtake when safe; solid (barrier) on your side = may not cross; solid + broken = obey the line nearest you.
- Yellow edge line = no stopping alongside; red-flavoured/urban no-stopping conveyed by signs.
- Painted island (diagonal stripes) = keep off; box junction = don't enter unless exit clear; lane arrows compulsory.

## Sprint 3 — road markings (deeper) + temporary signs
Sources: official K53 manual road-markings section; SARTSM temporary-signs chapter; [Arrive Alive road markings](https://www.arrivealive.mobi/traffic-signs-of-south-africa); standard SA driving-school convention for road studs.
- **Double solid centre lines**: neither direction may cross — total no-overtaking/no-crossing.
- **Regulatory continuous line**: crossing a solid (barrier) line is an offence, not merely inadvisable.
- **White edge (fog) line**: marks the left edge of the travelled lane; keep left of it, useful in poor visibility.
- **Yellow (shoulder) line on freeways**: marks the edge of the travelled way / start of the shoulder — the shoulder is not a driving or overtaking lane.
- **Road studs (cat's eyes), SA convention**: white = lane/centre lines; red = left edge (crossing them = leaving the road on the left); yellow = right edge (median side); reflect your lights back at night.
- **Box/yellow criss-cross junction**: do not enter until your exit is clear, even on green.
- **"KEEP CLEAR" markings**: leave the area open (e.g. across a driveway/entrance) — don't queue over it.
- **Turn-lane arrows / diagrammatic arrows**: compulsory direction; a lane-reduction arrow warns a lane is ending — merge in good time.
- **Pedestrian-crossing markings**: stop line set back before the crossing; stop behind it, never on the stripes.
- **Speed-hump / raised-crossing markings**: usually white triangles or bars warning to slow.
- **Kerb markings**: painted kerbs indicate stopping/parking restrictions (colour conventions vary by municipality; obey accompanying signs).

### Temporary signs
- **Yellow background = temporary** (roadworks, incidents). Same legal force as permanent white/other signs, including temporary speed limits.
- Temporary warning signs keep the warning-triangle shape but on yellow; temporary regulatory (e.g. speed) as posted.
- **Flag person / STOP-GO board**: obey it absolutely — turning the board to STOP is a lawful stop instruction; GO means proceed with caution.
- **Cones, barricades, delineators**: mark the closed area — do not enter or move them; follow the coned path.
- **Detour / temporary route** signs override the normal route for the duration.
- Reason yellow is used: high-visibility colour that instantly flags "conditions have changed from normal" so drivers re-assess.

## Hazard, dimension and command signs batch

Added to lift the signs pool after the generated pack was cut back on quality grounds
(the catalogue is exhausted at our quality bar, so further depth is hand-authored).
Signs described in words rather than shown, matching the existing text-based sign items.

- **Warning — geometry**: single sharp curve; series of curves (winding symbol); hairpin; dip (grounds a low vehicle, hides oncoming traffic); uneven/rough surface; two-way traffic resumes (end of one-way or divided section).
- **Warning — surface/weather**: slippery road (car with skid marks); falling rocks (watch the cutting, not just the surface); crosswind (windsock); low-water bridge/causeway (do not enter water of unknown depth); loose stones/chippings.
- **Warning — other users**: farm animals (cow silhouette, herd may follow); cyclists; traffic signals ahead (placed where the robot is hidden); yield ahead (advance notice, obligation starts at the yield line); tunnel (lights on, no overtaking).
- **Regulatory — dimension/mass**: height, width (includes the load), length (includes any trailer), mass (protects structures). All red-ringed = prohibition, driver's responsibility.
- **Regulatory — command/prohibition**: blue circle with speed = **minimum** speed; keep left/right at an obstruction; no towing; no pedestrians; no dangerous goods; compulsory straight ahead.
- **Information**: no-through road (red bar); hospital (H); rest area; freeway emergency telephone; route markers identify the road, destination boards say where it goes.
- **Reading the system**: blue circle commands / red ring prohibits (both compulsory); warning = adjust, regulatory = enforceable; warnings sit back from the hazard on purpose; supplementary plates qualify the main sign (times, distance, vehicle class); a traffic officer outranks signage; a faded sign still binds.
- **Delineation**: chevron boards on the outside of a bend; black-and-yellow hazard markers at obstructions; reflective marker posts trace the road at night.
- **Level crossings**: X-shaped cross marks the crossing itself; flashing red = stop and wait even with no train visible (a second train may follow).
- **Freeway/lane**: freeway-ends sign means the protections end; overhead red X closes that lane; climbing/passing lane ahead removes the reason to force a pass; exit numbers are unambiguous where place names aren't; distance boards.
- **Restrictions**: a struck-through repeat cancels that restriction; otherwise a restriction runs until cancelled; a speed limit is a maximum for ideal conditions, never a target.

## Junction-priority, restriction-warning, temporary and reservation batch

Sources unchanged (SARTSM May 2012 is still current — re-checked July 2026, no new sign
regulations). Items written from the catalogue meanings in `signs.catalog.json`; sign
names newly verified for this batch were spot-checked against the rendered PNGs.

- **Junction priority**: on a junction-warning triangle the *thicker* limb is the priority road. Thick-through-yours = you have priority with a lesser road crossing; thick-across = the crossing road has priority and you must be ready to give way. Also: side-road junction ahead, staggered junctions (two side roads close together, not opposite — a poor place to overtake).
- **Warning of a restriction vs the restriction**: a red *triangle* carrying a height/width/length figure warns that a restriction is coming; the red *ring* is the prohibition itself and passing it is the offence. The manual treats them as separate signs.
- **Temporary (yellow) twins**: the catalogue carries yellow versions of the surface-step, soft-shoulder, loose-stones and dimension warnings. Same legal force as the white version; yellow signals that conditions have changed from normal.
- **Reservation signs**: a large **R** beside a vehicle symbol = that road, lane or area is *set aside for* the class shown (not prohibited to it). The yellow line drawn on the sign shows which side of the real line the reserved lane lies. Parking reservations may carry a time limit on the plate.
- **De-restriction**: a struck-through repeat cancels the restriction (mass restriction ends, lane reservation ends). Restrictions otherwise run until cancelled.
- **Other surface/visibility warnings**: drift (water across the road — cross slowly, test brakes after), reduced visibility/mist, narrow structure (bridge too narrow to pass freely), jetty or river bank close to the road, agricultural vehicles.
- **Class-specific prohibitions**: no overtaking *by goods vehicles* (the symbol says who the restriction is aimed at); no hooter (protects hospitals and residential areas).

## Sign-page meanings batch (November 2026)

Written for the `meaning` field of 81 signs in `CURATED` (`src/lib/content/signs.ts`), whose public pages were noindexed as thin after the AdSense "low-value content" rejection of 2026-11-01. Wording is original; these notes are paraphrase. Researched 2026-11-05.

Source keys:
- **[K53M p.N]**: the iDriving School K53 manual (`iDriving-School-K53_optimized.pdf`), the PDF `scripts/extract_signs.py` builds the catalogue from. Its text layer drops most body copy, which is why the catalogue held stubs like "Stop line:" and cut-offs like "…indicated on the". Pages were rendered and read visually for this batch.
- **[RTSM §N]**: [SADC Road Traffic Signs Manual Vol 1 Ch 3, Warning Signs, May 2012](https://www.transport.gov.za/wp-content/uploads/2023/02/V1C3.pdf).
- **[MOTUS]**: `motus-manual-11ed.md`, plus sheets 23 and 31 of the scan for the supplementary plates and marking codes.
- **[AA-ANIMALS]**: [Arrive Alive, avoiding animals on the road](https://www.arrivealive.co.za/avoiding-animals-on-the-road). **[AA-SAFARI]**: [Arrive Alive, driving in a nature reserve](https://www.arrivealive.co.za/guide-to-safety-and-driving-on-safari-driving-in-the-nature-reserve). **[AA-WORKS]**: [Arrive Alive, roadworks](https://www.arrivealive.co.za/roadworks-and-road-safety). **[AA-GRAVEL]**: [Arrive Alive, gravel roads](https://www.arrivealive.mobi/driving-on-gravel-roads). **[AA-ARREST]**: [Arrive Alive, arrestor beds](https://www.arrivealive.mobi/arrestor-beds-and-road-safety).
- **Bank**: a fact already recorded earlier in this file or in `rules.md` / `intersections.md`.

The SARTSM regulatory and road-marking chapters (`V1C2.pdf`, `V1C7.pdf`) are over the fetch limit and were **not** re-read, so regulatory signs and markings rest on the K53 manual and Motus.

### Control, command and prohibition
- **regulatory-006-03 / 006-04, three-way and four-way stop**: stop in line with the sign or before the line; first to stop goes first [K53M p.6]. If uncertain, yield to the right [MOTUS pp.138-140]. The figure gives the number of approaches that stop (Bank: `motus-signs-pack`).
- **regulatory-007-02, stop or turn left**: straight on or right, stop; left, may continue without stopping if safe, giving way to cross traffic and pedestrians [K53M p.7].
- **regulatory-007-03, traffic circle**: clockwise round a mini-circle or roundabout [RTSM §3.3.1]; yield to the right and to vehicles already in the circle [MOTUS pp.58-59].
- **regulatory-009-01, headlights on**: dip position, to see and be seen [K53M p.9]; cancelled by the crossed-out twin [K53M p.17].
- **regulatory-010-01, taxis only**: road or part of it set aside for taxis [K53M p.10]; command signs name a class of user that must use a section others may not [K53M p.9].
- **regulatory-011-01 / 011-02, no left / right turn**: turn prohibited [K53M p.11]; arrow direction from the images; yellow disc = temporary version [K53M p.11], same force (Bank: temporary signs).
- **regulatory-011-06, no stopping**: protects traffic flow and drivers' view [K53M p.11]; bans even a brief halt (Bank: confusion pairs).
- **regulatory-014-07, police parking**: reserved for police vehicles [K53M p.14].
- **regulatory-016-01, residential area**: all figures and rules from [K53M p.16]: no through driving without stopping to break the journey; 30 km/h; pedestrians have right of way; over 3 500 kg or more than 10 passenger seats only for local access to load or offload.
- **regulatory-017-01 / 017-03 / 017-05 / 017-06, de-restriction**: a red cross means the restriction, command or set of rules no longer applies [K53M p.17]. Road users barred from a freeway, and the bans on stopping and hand signals [K53M p.16; MOTUS p.64].
- **regulatory-022-01, steady red**: stop behind the line [MOTUS pp.138-140]; a green arrow gives right of way if the intersection is clear [MOTUS pp.138-140].

### Warning signs: road situations
- **warning-027-02, gate / boom**: road may be closed by a gate, or a railway crossing with gates, booms or barriers [RTSM §3.4.12]. Stop at least 5 m from the nearest rail [MOTUS pp.138-140].
- **warning-028-02, tar begins**: the change of surface may need less speed, and the join commonly breaks up and can become a hazard [RTSM §3.4.20]. Flying stones on gravel [AA-GRAVEL].
- **warning-028-03, uneven road**: depression, ridge or potholes that call for less speed [RTSM §3.4.25]; yellow version [K53M p.28]. Firm grip on loose or uneven surfaces [AA-WORKS].
- **warning-029-02, falling rocks**: rocks or stones in loose rock cuttings [RTSM §3.4.28]; especially after rain [K53M p.29]; watch the cutting (Bank: hazard batch).
- **warning-029-04, jetty or river bank**: the road leads to one [RTSM §3.4.39], close to the road [K53M p.29].
- **warning-030-01..03, 031-04, 031-05, dimension warnings**: the limit [K53M pp.30-31; RTSM §§3.4.16, 3.4.17, 3.4.48]. Long vehicles lack clearance on that layout [RTSM §3.4.17]. Triangle warns, red ring prohibits, passing it is the offence; width includes the load and length any trailer (Bank).
- **warning-031-01, surface step**: sudden change of level, usually from resurfacing, often on the old lane line [RTSM §3.4.33]. Firm grip, smooth inputs [AA-WORKS].
- **warning-031-02, soft shoulder**: softer than expected, a hazard to anyone pulling off [RTSM §3.4.34]. Keep to the surfaced lane (Bank: `signs-junctions-pack`).
- **warning-031-03, loose stones**: fresh resealing, stones thrown up can damage vehicles [RTSM §3.4.31]; windscreens and paintwork [K53M p.28].

### Warning signs: junctions
- **warning-035-01, crossroad**: this version does not need to show priority, e.g. a four-way stop [RTSM §3.2.1]. With no control, look right and left and go when safe [MOTUS pp.138-140].
- **warning-035-02 / 035-03, priority crossroads**: thick limb = priority road (Bank); the second warns of approaches controlled by stop or yield signs [RTSM §3.2.1]; right of way is given, never taken (Bank: `rules.md`).
- **warning-035-04 / 035-05, T and skew T**: traffic must turn sharply or acutely left or right [RTSM §3.2.2]; at a T-junction your road ends, so give way both ways (Bank: `rules.md`).
- **warning-035-06, side road**: joining or leaving traffic, or limited sight distance [RTSM §3.2.3].
- **warning-035-07, staggered**: closely spaced side-road junctions, same dangers [RTSM §3.2.4]; poor place to overtake (Bank).

### Warning signs: moving hazards
- **warning-037-01, pedestrian crossing**: marked crossing ahead [RTSM §3.4.6]. Give way, and never overtake a vehicle stopped at it [MOTUS p.62].
- **warning-037-02, pedestrians**: above-average numbers where no crossing is marked [RTSM §3.4.7].
- **warning-037-03, children**: near schools, playgrounds, sports fields [RTSM §3.4.8]; between parked cars (Bank: `rules.md`).
- **warning-037-04, cyclists**: crossing or travelling along the road [RTSM §3.4.9]; left mirror and blind spot before a left turn (Bank: `intersections.md`).
- **warning-037-05, horses and riders**: ridden or led, a hazard if disturbed by traffic [RTSM §3.4.47]; pass wide, slow and quiet (Bank: `rules.md`).
- **warning-037-06 / 037-07 / 038-01, horses, cattle, sheep**: crossing or straying [RTSM §3.4.10]. Expect more than one; missing fences; brake rather than swerve; tall hoofed animals come over the bonnet [AA-ANIMALS]. Stop if a herder signals [MOTUS p.60].
- **warning-038-02..05, wild animals, warthog, elephant, hippo**: straying; the species signs are used where that animal is the specific problem [RTSM §3.4.11]. Night, woods and water, high beam, do not swerve [AA-ANIMALS]. Stay in the vehicle; others may follow; do not rev or hoot; back away from an agitated elephant [AA-SAFARI].
- **warning-038-06, trams**: operating in the roadway [RTSM §3.4.50]; no other vehicle may drive, stop or park in a tram lane [K53M p.82].
- **warning-038-07, agricultural vehicles**: tractors and other slow vehicles cross or enter, typically at a junction or farm access [RTSM §3.4.43].
- **warning-039-01, road works**: construction or maintenance in progress [RTSM §3.4.29]. Slow early, expect unseen workers [AA-WORKS]; a flag person's board is a lawful instruction (Bank).
- **warning-039-02, grader**: working on its own or as part of a wider site [RTSM §3.4.30]. Moving work and loose gravel damage [AA-WORKS].
- **warning-039-03, construction vehicles**: enter or cross from left or right, particularly heavy vehicles [RTSM §3.4.36].

### Supplementary plates
- **information-045-02, recommended speed**: a maximum recommended for the hazard, set by road engineers. Not regulatory, but exceeding it can lead to prosecution after an incident [MOTUS sheet 23].
- **information-045-06, blind people**: a text plate below the main sign [MOTUS sheet 23; K53M p.45]; visual signals are useless, so wait (Bank: `rules.md`).
- **information-045-07, accident**: an accident site attended by emergency services [RTSM §3.4.44]; slowing to look causes crashes (Bank: `rules.md`).

### Road markings
- **marking-077-01, stop line**: stop before it, go when safe [K53M p.77]; rolling at the line is not a stop, and is an instant fail on the road test [MOTUS, instant failures on the road test]. The meaning omits the test detail because learner-scoped content may not mention the road test.
- **marking-077-02, yield line**: give way to cross traffic and pedestrians; also at railway crossings [K53M p.77].
- **marking-077-03 / 077-04, pedestrian crossings**: give way to anyone on or about to enter [K53M p.77]; stop behind the line, not on the stripes (Bank).
- **marking-077-05, no-overtaking line**: no part of the vehicle may cross, except to reach a property or pass a stationary obstruction [K53M p.77].
- **marking-078-01, no-crossing double line**: no crossing at any time; sometimes a broken line between [K53M p.78].
- **marking-079-04, parking bay**: inside the demarcated area, not on sidewalk or verge [K53M p.79].
- **marking-081-03, mandatory arrows**: yellow arrows [K53M p.81; MOTUS RM-8]; compulsory (Bank).
- **marking-081-04 / 082-03, bus and bicycle lanes**: no other vehicle may drive, stop or park there [K53M pp.81-82]; a left turn sweeps across a cycle lane (Bank: `rules.md`).
- **marking-082-04, box junction**: may not stop on it unless entering from the side to turn [K53M p.82]; keep-clear zone [MOTUS RM-10]; enter only when the exit is clear, even on green (Bank).
- **marking-083-02 / 083-03, red lines**: no stopping at any time / during the times on the accompanying sign [K53M p.83].
- **marking-083-04 / 084-01, yellow lines**: no parking at any time / during the times on the accompanying sign [K53M pp.83-84]; a brief halt is not parking (Bank: confusion pairs).
- **marking-084-02, no motorcycles**: may not proceed beyond it [K53M p.84].
- **marking-084-03, mini-circle**: clockwise; give way to a vehicle that will cross a yield line first [K53M p.84; MOTUS pp.58-59].
- **marking-084-04, disabled parking**: reserved, no other vehicle may park [K53M p.84]; matching sign [K53M p.14].
- **marking-086-01, railway crossing ahead**: [K53M p.86]; flashing signals mean wait (Bank); 5 m from the rail [MOTUS pp.138-140].
- **marking-087-01, reversible lane**: the double-arrow lane carries oncoming traffic at set periods [K53M p.87].
- **marking-087-03, no-overtaking line ahead**: solid line ahead, do not attempt to overtake [K53M p.87].
- **marking-088-02, furcation arrows**: more lanes ahead in the arrows' direction [K53M p.88].
- **marking-088-04, cycle crossing**: cyclists cross at the broken lines [K53M p.88]. The source gives no priority rule, so the meaning says only to slow and be ready to stop.
- **marking-088-05, yield ahead**: warns of a yield sign or marking [K53M p.88]; the duty starts at the line (Bank).
- **marking-089-03, escape road**: for emergencies [K53M p.89]; refuge for vehicles, mostly heavy, that cannot slow [AA-ARREST, which describes arrestor beds, the same purpose].

### Conflicts found while sourcing (not changed by this batch)
- **Solid yellow line**: the K53 manual's kerbside line is *no parking* [K53M p.83], and p.78 treats the yellow left edge line separately. `questions.extra.ts` ("A solid yellow line painted along the edge of the roadway") and `flashcards.extra.ts` (`fc3_park_yellow_edge`) teach the edge line as *no stopping*, as does the "Road markings" note above. Needs a read of SARTSM `V1C7.pdf`.
- **marking-084-05**: the K53 manual pairs a bicycle symbol with a caption about vehicles carrying disabled people [K53M p.84]. It stays unnamed.

### Temporary warning signs are yellow triangles
All temporary advance warning signs are a black symbol on a yellow background with a red triangular border [RTSM §3.1.5]. Each sign's colour table repeats this [RTSM §3.2.1 onward], and the chapter has no diamond-shaped sign. `traitsFor()` used to call them yellow diamonds, and the road-signs guide listed diamonds as a warning shape. Both are corrected.

The signs on a yellow background are `warning-028-03`, `warning-031-01..06` and `warning-039-01..04` [K53M pp.28, 31, 39], which is 11 of the 59 warning triangles. Road works and grader working are temporary signs in their own right [RTSM §§3.4.29-3.4.30, signs TW336 and TW337], though the manual's captions never use the word. `warning-031-06` is a composite crop whose second sign is white [K53M p.31]. `warning-030-04` is a white sign with a yellow lamp in it, not a yellow-backed one [K53M p.30]. `tests/sign-traits.test.ts` checks this list against the crops' pixels.

### The two real diamonds
Exactly two signs in the catalogue are diamonds, and neither is a warning. `regulatory-007-04` Pedestrian priority is a red diamond [K53M p.7; [SA Dept of Transport, Road Traffic Signs manual, June 2012](https://www.arrivealive.co.za/documents/presentations/2%20manual%20on%20road%20traffic%20signs%20jun%202012%20final.pdf), printed p.2], and `information-043-05` Priority road is a yellow diamond on a white one [K53M p.43]. A geometric scan of all 439 crops, checked by eye, found no others. The library's Diamond filter now returns these two.
