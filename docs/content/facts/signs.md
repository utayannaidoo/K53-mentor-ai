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
