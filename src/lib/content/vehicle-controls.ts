/**
 * Per-group control reference for motorcycle (A1/A) and heavy (10/14) learners.
 * `where` = where to find it; `does` = what it does / how to use it. Derived
 * from official SA practical-test material; original wording.
 */
export interface VehicleControlItem {
  name: string;
  where: string;
  does: string;
  /** Part of the K53 "controls of the vehicle" oral check. */
  inTest?: boolean;
}

export const MOTORCYCLE_CONTROLS: VehicleControlItem[] = [
  {
    name: "Clutch lever",
    where: "Left handlebar, squeezed with the left-hand fingers.",
    does: "Disengages drive from the rear wheel for gear changes and smooth, slow-speed control. Feather it to move off without stalling.",
    inTest: true,
  },
  {
    name: "Front brake lever",
    where: "Right handlebar, in front of the throttle grip, squeezed with the right-hand fingers.",
    does: "Applies the front brake — most of the bike's stopping power. Squeeze progressively; grabbing it can lock the front wheel.",
    inTest: true,
  },
  {
    name: "Throttle (accelerator)",
    where: "The right handlebar grip itself.",
    does: "Twist toward you to accelerate, away to slow. It is spring-loaded and returns to idle when released.",
    inTest: true,
  },
  {
    name: "Gear lever",
    where: "Left footpeg, worked with the left toe.",
    does: "Selects gears in a '1 down, rest up' pattern: press down for 1st, lift up through 2nd and beyond.",
    inTest: true,
  },
  {
    name: "Rear brake pedal",
    where: "Right footpeg, pressed with the right foot.",
    does: "Applies the rear brake. Used together with the front brake for a balanced stop, and to steady the bike at low speed.",
    inTest: true,
  },
  {
    name: "Indicator (turn signal) switch",
    where: "Left handlebar switch cluster, worked with the left thumb.",
    does: "Signals your intention to turn; press left or right, and cancel it after the turn (it doesn't always self-cancel).",
    inTest: true,
  },
  {
    name: "Horn (hooter) button",
    where: "Left handlebar switch cluster, near the indicator.",
    does: "A short warning to make others aware of you.",
  },
  {
    name: "Engine cut-off (kill) switch",
    where: "Right handlebar switch cluster, usually red, worked with the right thumb.",
    does: "Stops the engine instantly without the key — a safety cut-out in an emergency or a fall.",
    inTest: true,
  },
  {
    name: "Handlebars",
    where: "Top of the front forks, gripped by both hands.",
    does: "Steer the front wheel and, with body lean and counter-steering, control the bike's direction and balance.",
    inTest: true,
  },
  {
    name: "Mirrors",
    where: "On stalks at each end of the handlebars.",
    does: "Show traffic behind and to the sides — but always add a shoulder (lifesaver) glance, as mirrors leave a large blind spot.",
    inTest: true,
  },
  {
    name: "Speedometer / instruments",
    where: "Above the headlight, in the rider's line of sight.",
    does: "Shows road speed, plus warning lights (neutral, indicators, high beam) and usually fuel and a tachometer.",
  },
];

export const HEAVY_CONTROLS: VehicleControlItem[] = [
  {
    name: "Air-pressure gauge(s)",
    where: "Instrument cluster, directly ahead of the driver (often dual-needle).",
    does: "Show stored air for the brakes. Idle until they reach the safe range before moving; a buzzer/light warns if pressure drops too low.",
    inTest: true,
  },
  {
    name: "Foot brake (treadle) valve",
    where: "Floor of the cab, in the brake-pedal position but wider.",
    does: "Releases air to apply the service brakes on all axles (and the trailer) — it controls air flow, not fluid pressure.",
    inTest: true,
  },
  {
    name: "Parking (spring) brake valve",
    where: "Dashboard, usually a yellow push-pull knob.",
    does: "Push in to release, pull out to apply. It fails to the applied position if air is lost — a built-in safety feature.",
    inTest: true,
  },
  {
    name: "Differential lock",
    where: "Dash or floor switch near the gear lever.",
    does: "Locks both drive wheels to turn together for traction on loose/slippery ground. Disengage before turning on hard, dry roads.",
  },
  {
    name: "Range-change / splitter switch",
    where: "On or beside the gear-lever knob.",
    does: "Selects high/low range (or splits each gear) on a multi-speed gearbox; used with the clutch when changing gear.",
  },
  {
    name: "Exhaust brake / retarder",
    where: "Dash switch near the column or on the gear lever.",
    does: "Adds engine braking on long descents to control speed without overusing — and overheating — the service brakes.",
  },
  {
    name: "Tilt-cab lock lever",
    where: "Lower side of the cab or under the dashboard.",
    does: "Secures the cab over the chassis. Confirm it's locked before driving — the cab tilts forward for engine access.",
    inTest: true,
  },
  {
    name: "Fifth-wheel coupling & release handle",
    where: "Across the rear chassis of the truck-tractor; release handle at the front-left edge.",
    does: "The trailer's kingpin locks into spring-loaded jaws. Confirm the jaws and safety lock-pin are engaged before moving.",
    inTest: true,
  },
  {
    name: "Trailer air lines (red & yellow)",
    where: "Front of the trailer, matched to hoses behind the cab.",
    does: "Red = emergency/supply (keeps the trailer tank charged, applies brakes if it fails); yellow = service (the brake-apply signal).",
    inTest: true,
  },
  {
    name: "Trailer electrical plug",
    where: "Front of the trailer, alongside the air lines.",
    does: "A multi-pin plug for the trailer's indicators, brake, tail and reverse lights. Test each function before moving.",
  },
  {
    name: "Landing gear (support legs)",
    where: "Front section of the trailer, hand-cranked from the left side.",
    does: "Supports the uncoupled trailer. Wind fully up before moving; lower onto firm ground before uncoupling.",
    inTest: true,
  },
  {
    name: "Trailer (hand) brake valve",
    where: "Dashboard, near the parking-brake valve (often red).",
    does: "Applies the trailer's brakes alone — used to hold the trailer for the coupling tug test and when manoeuvring.",
  },
];
