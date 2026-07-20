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
