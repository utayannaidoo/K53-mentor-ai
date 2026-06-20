-- ============================================================================
-- K53 Mentor AI — seed content
-- Categories and licence modules are seeded in full. A representative set of
-- questions/flashcards/scenarios is included; the complete content set lives in
-- src/lib/content/* (source of truth for the MVP) and can be exported here via
-- a generator script for a fully DB-backed deployment.
-- ============================================================================

insert into public.categories (id, name, short, description, scope, icon) values
  ('signs','Road signs','Signs','Regulatory, warning and information signs and road markings.','learners','Signpost'),
  ('rules','Rules of the road','Rules','Right of way, speed limits, signalling and legal requirements.','learners','Scale'),
  ('controls','Vehicle controls','Controls','The function of every control and instrument in the vehicle.','learners','Gauge'),
  ('intersections','Intersections','Intersections','Four-way stops, traffic circles and yielding at junctions.','learners','TrafficCone'),
  ('parking','Parking & stopping','Parking','Where you may and may not park or stop a vehicle.','learners','SquareParking'),
  ('following_distance','Following distance','Following','Safe gaps, the two-second rule and braking distances.','learners','Ruler'),
  ('hazard_awareness','Hazard awareness','Hazards','Reading the road, anticipating risk and defensive driving.','learners','ShieldAlert')
on conflict (id) do nothing;

insert into public.licence_modules (id, name, summary, difficulty, est_minutes, common_faults) values
  ('parallel_parking','Parallel parking','Reverse neatly into a kerbside bay between two markers.',2,12,'["Rolling more than ~30 cm","Not checking blind spots","Mounting the kerb"]'),
  ('alley_docking','Alley docking','Reverse into a 90° bay and drive out within the lines.',3,14,'["Touching a pole","Excessive shunting","Turning the wheel too early on exit"]'),
  ('three_point_turn','Three-point turn','Turn to face the opposite direction in a narrow road.',2,10,'["Touching either kerb","Not observing before each change","Stalling repeatedly"]'),
  ('incline_start','Hill / incline start','Pull away uphill without rolling back.',2,8,'["Rolling back over the margin","Releasing the clutch too fast","Forgetting to observe"]'),
  ('vehicle_inspection','Pre-trip vehicle inspection','The K53 pre-drive checks you must point out.',1,7,'["Skipping the seatbelt before starting","Missing a defect","Starting in gear without the clutch in"]'),
  ('mirror_blindspot','Mirror & blind-spot routine','The observation discipline before every manoeuvre.',1,6,'["Moving off without a blind-spot check","Signalling too late","Staring at mirrors and drifting"]')
on conflict (id) do nothing;

insert into public.licence_procedure_steps (module_id, step_number, title, instruction, tip) values
  ('parallel_parking',1,'Set up','Pull up level with the front marker, about half a metre out, parallel to the kerb.','Your back bumper should line up with the front marker.'),
  ('parallel_parking',2,'Observe','Do a full 360° observation — mirrors and both blind spots — and select reverse.','Examiners watch closely for blind-spot checks.'),
  ('parallel_parking',3,'Reverse & steer','Reverse slowly; as your rear marker reaches the front pole, steer fully toward the kerb.','Go slow at clutch biting point.'),
  ('parallel_parking',4,'Swing in','At ~45°, straighten briefly, then steer away from the kerb to bring the front in.','Glance at the kerb-side mirror.'),
  ('parallel_parking',5,'Straighten & centre','Straighten the wheels and adjust so the car sits centred and parallel.','Aim for within ~30 cm of the kerb.'),
  ('parallel_parking',6,'Secure','Handbrake on, neutral, final observation.','Securing the vehicle is itself marked.')
on conflict (module_id, step_number) do nothing;

insert into public.questions (id, category_id, prompt, options, correct_index, explanation, difficulty, scope, sign) values
  ('q_sign_stop','signs','You approach a STOP sign. What are you legally required to do?',
    '["Slow down and proceed if clear","Come to a complete stop behind the stop line, then proceed when safe","Stop only if other vehicles are present","Give way to traffic from the left only"]',
    1,'A stop sign requires a full stop behind the stop line every time, even if the road is empty.',1,'learners','stop'),
  ('q_rules_freeway_speed','rules','The general maximum speed limit on a South African freeway is:',
    '["100 km/h","110 km/h","120 km/h","140 km/h"]',2,'Unless a sign states otherwise, the maximum speed on a freeway is 120 km/h.',1,'learners',null),
  ('q_fd_two_second','following_distance','In good conditions, the recommended minimum following distance is:',
    '["Half a second","The two-second rule","Ten car lengths regardless of speed","As close as possible to save fuel"]',
    1,'The two-second rule scales with speed and gives you time to react. Increase it in poor conditions.',1,'learners',null),
  ('q_int_circle','intersections','When entering a traffic circle, you must give way to:',
    '["Traffic approaching from your left","Traffic already in the circle and approaching from your right","Nobody","Only large vehicles"]',
    1,'Yield to vehicles already in the circle, which approach from your right. Signal left before exiting.',2,'learners','traffic_circle'),
  ('q_park_crossing','parking','You may not stop within how many metres of a pedestrian crossing?',
    '["3 metres","9 metres","15 metres","No restriction"]',1,'You may not stop within 9 metres of a pedestrian crossing on the approach side.',3,'learners',null),
  ('q_ctrl_clutch','controls','What is the main function of the clutch in a manual vehicle?',
    '["To brake the vehicle","To engage and disengage the engine from the gearbox when changing gears","To increase fuel flow","To operate the indicators"]',
    1,'The clutch disconnects engine power from the gearbox so you can change gear or stop without stalling.',1,'learners',null)
on conflict (id) do nothing;

insert into public.flashcards (id, category_id, front, back, difficulty, sign) values
  ('fc_speed_limits','rules','Default speed limits with no sign?','60 km/h urban · 100 km/h rural · 120 km/h freeways.',1,null),
  ('fc_4way','intersections','Right of way at a four-way stop?','First to stop goes first. If simultaneous, the vehicle on the right has priority.',2,null),
  ('fc_two_sec','following_distance','The two-second rule?','Pass a fixed point at least 2 seconds after the vehicle ahead. It scales with speed.',1,null),
  ('fc_stop','signs','What must you do at a STOP sign?','Come to a complete stop behind the line every time, then move off when safe.',1,'stop')
on conflict (id) do nothing;

insert into public.scenarios (id, category_id, title, situation, prompt, choices, debrief, sign) values
  ('sc_circle','intersections','The busy traffic circle',
   'You approach a single-lane traffic circle. A car is already in the circle, approaching from your right.',
   'What do you do?',
   '[{"id":"a","text":"Enter quickly before they reach you","correct":false,"consequence":"You cut off a vehicle with right of way — an immediate failure and a collision risk."},{"id":"b","text":"Yield, wait, then enter on a safe gap","correct":true,"consequence":"Correct — traffic already in the circle has right of way."},{"id":"c","text":"Stop and wait for the circle to be empty","correct":false,"consequence":"Over-cautious — you only yield to traffic from the right."}]',
   'At a circle, yield to vehicles already in it (from your right), enter on a safe gap, and signal left before you exit.','traffic_circle')
on conflict (id) do nothing;
