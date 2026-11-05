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
- regulatory-013-x: Reservation signs — lane left of the broken yellow line (or starting at the curved one) reserved for the class shown (e.g. buses). The painted line is RM9, also broken; see "Lines along the road".
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
- Yellow left edge line = stay off the shoulder beyond it; yellow line beside the kerb = no parking; red line = no stopping. Sourced below.
- Painted island (diagonal stripes) = keep off; box junction = don't enter unless exit clear; lane arrows compulsory.

## Lines along the road: yellow, red and white edge lines (settled 2026-11-05)

The bank used to teach a solid yellow edge line as "no stopping". No source says that. A solid yellow line is one of two different markings, RM4.1 and RM13, and neither bans stopping. The no-stopping line is red.

Source keys:
- **[RTSM7 §N]**: SADC Road Traffic Signs Manual Vol 1 Ch 7, Road Markings, May 2012. Read from the [copy hosted by SARTSMA](https://www.sartsma.co.za/_files/ugd/4f7773_c4e3f39ec22848b08d31fff846ce53ed.pdf), the road-sign manufacturers' trade association. The Department of Transport's own [`V1C7.pdf`](https://www.transport.gov.za/wp-content/uploads/2023/02/V1C7.pdf) is the same chapter by name but was not opened, so the two have not been compared.
- **[Regs N]**: National Road Traffic Regulations, 2000, as reproduced by [Acts Online](https://source.acts.co.za/national-road-traffic-act-1996/r225_298a__prohibition_on_driv.php).
- **[NRTA s1]**: [National Road Traffic Act 93 of 1996, section 1](https://source.acts.co.za/national-road-traffic-act-1996/1_definitions.php).
- **[AARTO code]**: [AARTO Schedule 3 chargebook, July 2008](https://beeratings.com/wp-content/uploads/2019/10/027_AARTO-Chargebook-July-2008.pdf). Used for the wording of the charges only, not their amounts, because the schedule may have been updated since.
- **[DOT p.N]**: [SA Learner Driver Manual, Road Traffic Signs, v1.00, June 2012](https://www.arrivealive.co.za/documents/presentations/2%20manual%20on%20road%20traffic%20signs%20jun%202012%20final.pdf), compiled by the Department of Transport. Printed page numbers. Its text gives each marking's meaning but not its colour, which comes from RTSM7 and K53M.
- **[K53M p.N]**: the iDriving School K53 manual, rendered pages.

**Not read:** Schedule 1 to the Regulations, which gives each marking its legal meaning [Regs 285(2A)]. Acts Online does not reproduce it and refers readers to the Department. The RTSM wording, the AARTO charges and both manuals agree on what each line bans, so nothing suggests it differs.

Each marking and its rule:
- **Left edge line, RM4.1: continuous solid yellow, at least 100 mm wide** [RTSM7 §7.2.8.2]. On a road with more than one lane in either direction, you may not drive on the shoulder to its left or use the shoulder to overtake, and in an emergency stop you must make every reasonable effort to get the whole vehicle to its left [RTSM7 §7.2.8.1]. If you break down, stop as far left of it as possible with your hazard lights on [DOT p.49]. It may run on any rural or urban road with a surfaced shoulder, and on freeways [RTSM7 §§7.1.9, 7.2.8.10]. Driving left of it is a charge [AARTO 4053].
  - *Shoulder exception:* on a road with one lane each way, between sunrise and sunset, you may drive on the shoulder while being overtaken, if that endangers nobody and people and vehicles are visible for at least 150 m [Regs 298A(2); DOT p.49; K53M p.78]. It is allowed, not compulsory [DOT p.49]. Otherwise driving on the shoulder is prohibited [Regs 298A(1)].
  - *Passing on the left:* even where allowed, it may never be done on the shoulder or verge [Regs 298(1)]. Doing so is a charge in its own right (AARTO Schedule 3, Reg. 298(1)).
- **No parking line, RM13: yellow.** Solid = no parking alongside at any time. Broken = no parking during the times on the accompanying sign [RTSM7 §§7.2.17.1-2; K53M pp.83-84]. You may still stop for short periods [DOT p.51]. Parking on one is a charge [AARTO 4073].
  - It may be marked only on an urban road under the general urban limit, never on a freeway, parallel to the kerb and 150 mm to 2,5 m from it [RTSM7 §§7.2.17.3-4]. The learner manual says more loosely that it is found on any road [DOT p.51]; the RTSM is the rule road authorities mark to, so it is followed here.
  - A brief halt is not parking: to park is to stay longer than loading or unloading people or goods reasonably takes [NRTA s1; DOT p.51].
- **No stopping line, RM12: red.** Solid (at least 150 mm) = no stopping alongside at any time. Broken = during the times on the sign [RTSM7 §§7.2.16.1-2; DOT p.51; K53M p.83]. The only exception is an emergency [DOT p.51]. It may be painted on the kerb itself [RTSM7 §7.2.16.3]. Stopping alongside one is a charge [AARTO 4071]. The chargebook has no charge for stopping beside a yellow line.
- **Stopping in general:** a road marking is a road traffic sign [Regs 285(2)]. You may not stop on the roadway against one, unless it is to avoid an accident, on a traffic officer's direction, or for a cause beyond your control [Regs 304, 304(d)]. Other no-stopping rules still apply beside a yellow line, such as on a freeway (see `motus-manual-11ed.md`).
- **Right edge line, RM4.2: continuous solid white.** Marks the right edge of a one-way carriageway beside a median; you may not cross it [RTSM7 §§7.2.8.1, 7.2.8.5-6; DOT p.49]. U-turns over it on a freeway are not permitted [K53M p.78]. Driving right of it is a charge [AARTO 4055]. There is no white left edge line: the chapter's left edge line is yellow only, and a continuous white line within a carriageway is a channelising line that may not be crossed [K53M p.78].
- **Exclusive use lane line, RM9: broken yellow, not solid** [RTSM7 §7.2.13.3; K53M p.13].
- **Centre lines are white, not yellow:** no overtaking line RM1 is solid white [RTSM7 §7.2.5.6], the no crossing line RM2 is two solid white lines [RTSM7 §7.2.6.2], and the dividing line WM3 is broken white [RTSM7 §7.3.3.2].

**Telling the two solid yellow lines apart:** on a freeway or rural road it should only be the edge line, because the RTSM confines a no-parking line to urban roads. On an urban road, no source states a visual test. The K53 manual draws the edge line with a strip of shoulder beyond it and the no-parking line against the verge [K53M pp.78, 83], but a no-parking line may legally sit up to 2,5 m out, so position alone does not settle it. The bank therefore tests each one with its context stated in the prompt (edge of the road with a shoulder, or beside the kerb in town).

**Painted kerbs:** red and yellow mean the same nationally, so they do not "vary by municipality". The only other kerb paint in the chapter is black-and-white kerbface marking GM8, which is guidance rather than a restriction [RTSM7 §7.4.8].

## Sprint 3 — road markings (deeper) + temporary signs
Sources: official K53 manual road-markings section; SARTSM temporary-signs chapter; [Arrive Alive road markings](https://www.arrivealive.mobi/traffic-signs-of-south-africa); standard SA driving-school convention for road studs.
- **Double solid centre lines**: neither direction may cross — total no-overtaking/no-crossing.
- **Regulatory continuous line**: crossing a solid (barrier) line is an offence, not merely inadvisable.
- **White right edge line**: marks the right edge of a one-way carriageway beside the median; you may not cross to its right. Sourced under "Lines along the road".
- **Yellow (shoulder) line on freeways**: marks the edge of the travelled way / start of the shoulder — the shoulder is not a driving or overtaking lane.
- **Road studs (cat's eyes), SA convention**: white = lane/centre lines; red = left edge (crossing them = leaving the road on the left); yellow = right edge (median side); reflect your lights back at night.
- **Box/yellow criss-cross junction**: do not enter until your exit is clear, even on green.
- **"KEEP CLEAR" markings**: leave the area open (e.g. across a driveway/entrance) — don't queue over it.
- **Turn-lane arrows / diagrammatic arrows**: compulsory direction; a lane-reduction arrow warns a lane is ending — merge in good time.
- **Pedestrian-crossing markings**: stop line set back before the crossing; stop behind it, never on the stripes.
- **Speed-hump / raised-crossing markings**: usually white triangles or bars warning to slow.
- **Kerb markings**: red = no stopping, yellow = no parking; solid applies at all times, broken during the hours on the accompanying sign. Sourced under "Lines along the road".

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

Written for the `meaning` field of signs in `CURATED` (`src/lib/content/signs.ts`): first the 81 whose public pages were noindexed as thin after the AdSense "low-value content" rejection of 2026-11-01, then the 37 older pages under 15 words. Wording is original; these notes are paraphrase. Researched 2026-11-05.

**Which source wins:** where sources differ, the Department of Transport manual [DOT] takes precedence over the K53 and Motus manuals, because it is the department's own text. Differences are listed under "Conflicts" below.

Source keys:
- **[DOT p.N]**: [SA Learner Driver Manual, Road Traffic Signs, v1.00, June 2012](https://www.arrivealive.co.za/documents/presentations/2%20manual%20on%20road%20traffic%20signs%20jun%202012%20final.pdf), compiled by the Department of Transport. Page numbers are the printed ones. It gives name, place, purpose and driver action per sign, and its text layer is clean. The natis.gov.za copy returned 404 on 2026-11-05.
- **[K53M p.N]**: the iDriving School K53 manual (`iDriving-School-K53_optimized.pdf`), the PDF `scripts/extract_signs.py` builds the catalogue from. Its text layer drops most body copy, which is why the catalogue held stubs like "Stop line:" and cut-offs like "…indicated on the". Pages were rendered and read visually for this batch.
- **[RTSM §N]**: [SADC Road Traffic Signs Manual Vol 1 Ch 3, Warning Signs, May 2012](https://www.transport.gov.za/wp-content/uploads/2023/02/V1C3.pdf).
- **[MOTUS]**: `motus-manual-11ed.md`, plus sheets 23 and 31 of the scan for the supplementary plates and marking codes.
- **[AA-ANIMALS]**: [Arrive Alive, avoiding animals on the road](https://www.arrivealive.co.za/avoiding-animals-on-the-road). **[AA-SAFARI]**: [Arrive Alive, driving in a nature reserve](https://www.arrivealive.co.za/guide-to-safety-and-driving-on-safari-driving-in-the-nature-reserve). **[AA-WORKS]**: [Arrive Alive, roadworks](https://www.arrivealive.co.za/roadworks-and-road-safety). **[AA-GRAVEL]**: [Arrive Alive, gravel roads](https://www.arrivealive.mobi/driving-on-gravel-roads). **[AA-ARREST]**: [Arrive Alive, arrestor beds](https://www.arrivealive.mobi/arrestor-beds-and-road-safety).
- **Bank**: a fact already recorded earlier in this file or in `rules.md` / `intersections.md`.

The SARTSM regulatory and road-marking chapters (`V1C2.pdf`, `V1C7.pdf`) are over the fetch limit and were **not** read, so regulatory signs and markings rest on [DOT], the K53 manual and Motus. Chapter 7 was read afterwards for the edge, no-parking and no-stopping lines; see "Lines along the road".

All 118 meanings were checked against [DOT], which corrected several first drafts. The notes in the first sections below record where each fact first came from; the section "Checked against the Department of Transport manual" records the [DOT] page and what it changed.

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
- **warning-027-02, gate / boom**: road may be closed by a gate, or a railway crossing with gates, booms or barriers [RTSM §3.4.12]. Be ready to stop if it is closing or closed [DOT p.28].
- **warning-028-02, tar begins**: the change of surface may need less speed, and the join commonly breaks up and can become a hazard [RTSM §3.4.20]. Flying stones on gravel [AA-GRAVEL].
- **warning-028-03, uneven road**: depression, ridge or potholes that call for less speed [RTSM §3.4.25]; the temporary yellow version [K53M p.28]. Slow down to avoid potholes without endangering other traffic [DOT p.29].
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
- **marking-078-01, no-crossing double line**: no crossing except around a stationary vehicle or obstruction [DOT p.48]; sometimes a broken line between [K53M p.78].
- **marking-079-04, parking bay**: inside the demarcated area, not on sidewalk or verge [K53M p.79].
- **marking-081-03, mandatory arrows**: yellow arrows [K53M p.81; MOTUS RM-8]; compulsory (Bank).
- **marking-081-04 / 082-03, bus and bicycle lanes**: no other vehicle may drive, stop or park there [K53M pp.81-82]; a left turn sweeps across a cycle lane (Bank: `rules.md`).
- **marking-082-04, box junction**: may not stop in the box, and enter only if you can drive through [DOT p.51]; keep-clear zone [MOTUS RM-10]; enter only when the exit is clear, even on green (Bank).
- **marking-083-02 / 083-03, red lines**: no stopping at any time / during the times on the accompanying sign [K53M p.83].
- **marking-083-04 / 084-01, yellow lines**: no parking at any time / during the times on the accompanying sign [K53M pp.83-84]; a brief halt is not parking (Bank: confusion pairs).
- **marking-084-02, no motorcycles**: may not proceed beyond it [K53M p.84].
- **marking-084-03, mini-circle**: clockwise; give way to a vehicle that will cross a yield line first [K53M p.84; MOTUS pp.58-59].
- **marking-084-04, disabled parking**: reserved, no other vehicle may park [K53M p.84]; matching sign [K53M p.14].
- **marking-086-01, railway crossing ahead**: [K53M p.86]; flashing signals mean wait (Bank); stay out of the railway reserve [DOT pp.28, 34].
- **marking-087-01, reversible lane**: the double-arrow lane carries oncoming traffic at set periods [K53M p.87].
- **marking-087-03, no-overtaking line ahead**: solid line ahead, do not attempt to overtake [K53M p.87].
- **marking-088-02, furcation arrows**: more lanes ahead in the arrows' direction [K53M p.88].
- **marking-088-04, cycle crossing**: cyclists cross at the broken lines [K53M p.88]. The source gives no priority rule, so the meaning says only to slow and be ready to stop.
- **marking-088-05, yield ahead**: warns of a yield sign or marking [K53M p.88]; the duty starts at the line (Bank).
- **marking-089-03, escape road**: for emergencies [K53M p.89]; refuge for vehicles, mostly heavy, that cannot slow [AA-ARREST, which describes arrestor beds, the same purpose].

### The 37 older pages under 15 words
- **regulatory-008-01, no entry**: usually at the end of a one-way street or off-ramp [DOT p.5].
- **regulatory-009-07, roundabout**: clockwise; yield to vehicles from the right within it when close enough to be a danger [DOT p.10].
- **regulatory-011-03 / 011-04, turn ahead prohibited**: do not turn at the intersection [DOT p.12]; the 011-04 crop is the yellow version [K53M p.11].
- **regulatory-011-05, no U-turn**: [DOT p.12]; the night-time plate [DOT p.21; catalogue `regulatory-020-02`].
- **regulatory-012-01, no overtaking**: any vehicle, next 500 m [DOT p.12]; a distance plate is a listed combination [DOT p.21].
- **regulatory-012-02, no overtaking by heavy vehicles**: a heavy motor vehicle may not overtake another heavy vehicle [DOT p.12].
- **regulatory-012-05, no motorcycles**: may not enter; on a freeway, leave at the first exit [DOT p.13].
- **regulatory-012-06, no hawkers**: used on narrow roads, near intersections or where parked vehicles impair vision; do not stop or park for hawkers [DOT p.15].
- **regulatory-014-01 / 014-06, parking**: vehicles under 3 500 kg, a fee may apply; time-limited bays, do not exceed the time shown [DOT p.16].
- **regulatory-014-02 / 014-03 / 014-04 / 014-05, reservations**: for the class shown [K53M p.14; DOT pp.17-18]; authorised vehicles, such as the diplomatic corps [DOT p.18]; yellow = temporary [DOT p.3]; wheelchair symbol in the bay [K53M p.84].
- **regulatory-017-02 / 017-04 / 017-07, de-restriction**: [K53M p.17; DOT p.22]; lights between sunset and sunrise, under 150 m visibility, and always for motorcycles [MOTUS p.66].
- **regulatory-022-03 / 022-04, amber and green**: [DOT p.56; K53M p.22; MOTUS pp.138-140]; green gives way to those still crossing [K53M p.22; `intersections.md`].
- **warning-027-01, cattle grid**: motor gate to the left, right or middle; check no oncoming vehicle is about to use it [DOT p.28; RTSM §3.4.13].
- **warning-027-03, tunnel**: headlights on dipped [DOT p.28]; do not overtake [K53M p.27]; no stopping within 6 m [MOTUS p.60].
- **warning-027-04, steep descent**: hazard for heavy vehicles [RTSM §3.4.18]; longer stopping distance [DOT p.28]; lower gear protects the brakes from overheating [DOT p.44].
- **warning-028-04, speed humps**: slow enough not to damage the vehicle or lose control [DOT p.30]; release the brake before the hump [DOT p.53].
- **warning-028-05 / 028-06, road narrows**: stays narrower for some distance [RTSM §§3.4.23, 3.4.24]; oncoming vehicles pass close, adjust position [DOT p.29]; keep left [K53M p.28].
- **warning-028-07, narrow bridge**: avoid crossing with an oncoming vehicle [DOT p.29]; no stopping within 6 m [MOTUS p.60].
- **warning-029-01, slippery road**: sudden braking or harsh steering can start a skid, next 2 km [DOT p.30]; skid recovery (Bank: `controls-yard.md`).
- **warning-029-03, general warning**: danger of some kind, look out for anything on or beside the road [DOT p.30]; fallen trees, subsidence [RTSM §3.4.32]; explanatory plate [K53M p.29].
- **warning-029-06, reduced visibility**: fog, mist or smoke [RTSM §3.4.45]; slow-moving vehicles [DOT p.32].
- **warning-029-07, narrow structure**: under 5 m [K53M p.29; RTSM §3.4.22]; stop at least 6 m from it and yield to oncoming traffic [DOT p.29].
- **warning-040-01, danger plate**: arrowhead side [K53M p.40]; bridge abutments, culvert walls, unprotected posts [RTSM §3.5.1].
- **warning-040-04, overhead plate**: mounted beside the height limit sign where clearance is low [RTSM §3.5.9; K53M p.40].
- **warning-040-07, railway crossing**: one or more tracks; slow down, and stop if a train is coming, not on the track or in the reserve [DOT pp.28, 34]; extreme caution [RTSM §3.5]; one train can hide another (Bank: `rules.md`).
- **information-043-01, countdown signs**: 300, 200 and 100 m [DOT p.46; MOTUS sheet 23]; be in the left lane by then [DOT p.42].
- **information-043-03, cul-de-sac**: do not turn in unless going to a destination on that road [DOT p.46]; yellow = temporary [DOT p.3].
- **information-043-05, right of way**: do not slow unnecessarily, but make sure other traffic yields [DOT p.46; MOTUS sheet 23].

### Checked against the Department of Transport manual
These first drafts changed after [DOT] was read:
- **regulatory-012-02**: the K53 manual reads as "any vehicle"; [DOT p.12] limits it to a heavy vehicle overtaking another heavy vehicle.
- **regulatory-012-06**: the draft said drivers were unaffected; [DOT p.15] says not to stop or park for hawkers.
- **regulatory-011-01 / 011-02**: added that you may go straight on or take the other turn [DOT p.12].
- **regulatory-011-06**: added the exceptions: a traffic light, a traffic officer or avoiding a collision [DOT p.12].
- **regulatory-007-03**: yield to vehicles in the circle or that will cross their yield line first [DOT p.5].
- **warning-031-01 / 031-02 / 031-03**: straddling the step, not driving or stopping on the shoulder, and stones affecting braking and turning [DOT pp.30-31].
- **warning-039-02 / 039-03**: full width may be unavailable; spilt gravel, sand or water [DOT pp.30-31].
- **warning-037-02, 037-04, 037-07, 038-01, 038-02, 029-01**: "for the next 2 km" [DOT pp.27-28, 30].
- **marking-077-01 / 077-02**: the line alone has the force of the sign [DOT p.48].
- **marking-077-05**: exceptions are an entrance on the other side, or a stationary obstruction, if safe [DOT p.48].
- **marking-078-01**: one exception, a stationary vehicle or obstruction [DOT p.48].
- **marking-081-04**: the bus lane applies during the times on the sign [DOT p.50].
- **marking-082-04**: see the box junction conflict below [DOT p.51].
- **marking-083-02 / 083-04**: emergency exception, and the definition of parking as longer than it takes to load or offload [DOT p.51].
- **marking-087-03**: move back left before the line starts [DOT p.53].
- **marking-088-02**: do not straddle the lane markings [DOT p.54].

### Conflicts found while sourcing
Meanings follow [DOT] where it speaks. Items marked *open* were not changed by this batch.
- **Box junction**: [K53M p.82] allows stopping when entering from the side to turn; [DOT p.51] has no such exception, so the meaning omits it.
- **Double no-crossing line**: [K53M p.78] says "at any time"; [DOT p.48] allows passing a stationary vehicle or obstruction. The meaning follows [DOT].
- **No overtaking**: older text said it runs until a sign ends it. [DOT p.12] and [K53M p.12] say the next 500 m, so `q_sign_no_overtaking` and `fc_no_overtaking` were corrected with this batch. The "Restrictions" note above ("runs until cancelled") is too broad for this sign.
- **Railway stopping distance** (*open*): [MOTUS pp.138-140] says at least 5 m from the nearest rail; [DOT p.34] says no closer than 3 m. No meaning states a figure, and no question should until the regulations are checked.
- **Goods-vehicle overtaking wording** (*open*): `signs-pack.ts` (`q4_sign_no_ot_trucks`, `fc4_no_ot_trucks`) and `signs-junctions-pack.ts` say goods vehicles may not overtake, without [DOT p.12]'s "another heavy vehicle".
- **Road studs** (*open*): `markings-pack.ts` and the Sprint 3 note above teach red studs on the left edge and yellow studs on the right. The chapter pairs red with the right edge, no-overtaking and no-crossing lines and with wrong-way warnings, and yellow with yellow markings, which puts yellow on the left edge [RTSM7 §7.5.2].
- **marking-084-05**: the K53 manual pairs a bicycle symbol with a caption about vehicles carrying disabled people [K53M p.84]. It stays unnamed.

### Temporary warning signs are yellow triangles
All temporary advance warning signs are a black symbol on a yellow background with a red triangular border [RTSM §3.1.5; DOT p.3 on what yellow means]. Each sign's colour table repeats this [RTSM §3.2.1 onward], and the chapter has no diamond-shaped sign. `traitsFor()` used to call them yellow diamonds, and the road-signs guide listed diamonds as a warning shape. Both are corrected.

The signs on a yellow background are `warning-028-03`, `warning-031-01..06` and `warning-039-01..04` [K53M pp.28, 31, 39], which is 11 of the 59 warning triangles. Road works and grader working are temporary signs in their own right [RTSM §§3.4.29-3.4.30, signs TW336 and TW337], though the manual's captions never use the word. `warning-031-06` is a composite crop whose second sign is white [K53M p.31]. `warning-030-04` is a white sign with a yellow lamp in it, not a yellow-backed one [K53M p.30]. `tests/sign-traits.test.ts` checks this list against the crops' pixels.

### The two real diamonds
Exactly two signs in the catalogue are diamonds, and neither is a warning. `regulatory-007-04` Pedestrian priority is a red diamond [K53M p.7; DOT p.2], and `information-043-05` Priority road is a yellow diamond on a white one [K53M p.43]. A geometric scan of all 439 crops, checked by eye, found no others. The library's Diamond filter now returns these two.
