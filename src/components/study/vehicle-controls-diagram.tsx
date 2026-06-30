/**
 * Schematic, labelled control diagrams for motorcycle and heavy-vehicle
 * learners — on-brand SVGs (not photos), drawn from the controls' described
 * positions. Colours use the app's theme variables so they track light/dark.
 */

const FG = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted) / 0.7)";
const MUTEDFG = "hsl(var(--muted-foreground))";
const BORDER = "hsl(var(--border))";
const PRIMARY = "hsl(var(--primary))";
const WARNING = "hsl(var(--warning))";
const DANGER = "hsl(var(--danger))";

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.5} fill={PRIMARY} />;
}

function Label({
  toX,
  toY,
  x,
  y,
  anchor = "start",
  title,
  sub,
}: {
  toX: number;
  toY: number;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  title: string;
  sub?: string;
}) {
  return (
    <g>
      <line x1={toX} y1={toY} x2={x} y2={sub ? y - 5 : y} stroke={BORDER} strokeWidth={1.5} />
      <Dot x={toX} y={toY} />
      <text x={x} y={y} textAnchor={anchor} fontSize={13} fontWeight={600} fill={FG}>
        {title}
      </text>
      {sub && (
        <text x={x} y={y + 15} textAnchor={anchor} fontSize={11.5} fill={MUTEDFG}>
          {sub}
        </text>
      )}
    </g>
  );
}

export function MotorcycleDiagram() {
  return (
    <svg viewBox="0 0 640 400" className="mx-auto w-full max-w-2xl" role="img"
      aria-label="Schematic of a motorcycle's controls: clutch and front-brake levers, throttle, gear lever, rear brake, indicator, kill switch, mirrors and speedometer">
      {/* Handlebar */}
      <line x1="305" y1="152" x2="123" y2="160" stroke={FG} strokeOpacity={0.55} strokeWidth={10} strokeLinecap="round" />
      <line x1="335" y1="152" x2="517" y2="160" stroke={FG} strokeOpacity={0.55} strokeWidth={10} strokeLinecap="round" />
      <rect x="305" y="120" width="30" height="40" rx="6" fill={MUTED} stroke={BORDER} />

      {/* Instrument cluster */}
      <rect x="282" y="64" width="76" height="46" rx="10" fill={MUTED} stroke={BORDER} />
      <line x1="320" y1="100" x2="320" y2="78" stroke={FG} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="320" cy="100" r="2.5" fill={FG} />

      {/* Grips */}
      <rect x="92" y="147" width="56" height="26" rx="13" fill={MUTED} stroke={BORDER} />
      <rect x="492" y="147" width="56" height="26" rx="13" fill={MUTED} stroke={BORDER} />

      {/* Levers */}
      <line x1="108" y1="150" x2="66" y2="138" stroke={FG} strokeWidth={6} strokeLinecap="round" />
      <line x1="532" y1="150" x2="574" y2="138" stroke={FG} strokeWidth={6} strokeLinecap="round" />

      {/* Mirrors */}
      <line x1="116" y1="147" x2="108" y2="116" stroke={BORDER} strokeWidth={3} />
      <ellipse cx="108" cy="110" rx="14" ry="9" fill={MUTED} stroke={BORDER} />
      <line x1="524" y1="147" x2="532" y2="116" stroke={BORDER} strokeWidth={3} />
      <ellipse cx="532" cy="110" rx="14" ry="9" fill={MUTED} stroke={BORDER} />

      {/* Switch clusters */}
      <rect x="118" y="177" width="34" height="14" rx="4" fill={MUTED} stroke={BORDER} />
      <rect x="488" y="177" width="34" height="14" rx="4" fill={MUTED} stroke={BORDER} />

      {/* Foot controls */}
      <rect x="150" y="300" width="46" height="10" rx="5" fill={MUTED} stroke={BORDER} />
      <rect x="444" y="300" width="46" height="10" rx="5" fill={MUTED} stroke={BORDER} />

      {/* Callouts */}
      <Label toX={320} toY={64} x={320} y={36} anchor="middle" title="Speedometer & lights" />
      <Label toX={66} toY={138} x={20} y={96} title="Clutch lever" sub="left hand" />
      <Label toX={574} toY={138} x={620} y={96} anchor="end" title="Front brake lever" sub="right hand" />
      <Label toX={548} toY={160} x={620} y={150} anchor="end" title="Throttle" sub="twist the grip" />
      <Label toX={118} toY={184} x={20} y={196} title="Indicator · Horn" />
      <Label toX={522} toY={184} x={620} y={196} anchor="end" title="Engine kill switch" />
      <Label toX={173} toY={310} x={173} y={335} anchor="middle" title="Gear lever" sub="left foot" />
      <Label toX={467} toY={310} x={467} y={335} anchor="middle" title="Rear brake" sub="right foot" />
    </svg>
  );
}

export function HeavyDiagram() {
  return (
    <svg viewBox="0 0 640 390" className="mx-auto w-full max-w-2xl" role="img"
      aria-label="Schematic of a heavy vehicle's dashboard: air-pressure gauges, parking and trailer brake valves, diff-lock, retarder, gear lever with splitter and the treadle foot-brake">
      {/* Dash fascia */}
      <rect x="40" y="118" width="560" height="150" rx="16" fill={MUTED} stroke={BORDER} />

      {/* Steering wheel */}
      <circle cx="470" cy="200" r="66" fill="none" stroke={FG} strokeOpacity={0.6} strokeWidth={9} />
      <circle cx="470" cy="200" r="15" fill={MUTED} stroke={BORDER} />
      <line x1="470" y1="200" x2="470" y2="138" stroke={FG} strokeOpacity={0.6} strokeWidth={7} />
      <line x1="470" y1="200" x2="418" y2="232" stroke={FG} strokeOpacity={0.6} strokeWidth={7} />
      <line x1="470" y1="200" x2="522" y2="232" stroke={FG} strokeOpacity={0.6} strokeWidth={7} />

      {/* Air gauges */}
      <circle cx="372" cy="158" r="22" fill="hsl(var(--card))" stroke={BORDER} />
      <line x1="372" y1="158" x2="358" y2="148" stroke={FG} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="420" cy="158" r="22" fill="hsl(var(--card))" stroke={BORDER} />
      <line x1="420" y1="158" x2="434" y2="148" stroke={DANGER} strokeWidth={2.5} strokeLinecap="round" />

      {/* Brake valves */}
      <circle cx="110" cy="170" r="15" fill={WARNING} stroke={BORDER} />
      <circle cx="158" cy="170" r="15" fill={DANGER} stroke={BORDER} />

      {/* Switches */}
      <rect x="93" y="212" width="34" height="16" rx="4" fill="hsl(var(--card))" stroke={BORDER} />
      <rect x="141" y="212" width="34" height="16" rx="4" fill="hsl(var(--card))" stroke={BORDER} />

      {/* Gear lever + splitter */}
      <line x1="300" y1="300" x2="300" y2="226" stroke={FG} strokeOpacity={0.7} strokeWidth={7} strokeLinecap="round" />
      <circle cx="300" cy="220" r="13" fill={MUTED} stroke={BORDER} />
      <rect x="294" y="206" width="12" height="9" rx="2" fill={PRIMARY} />

      {/* Treadle foot brake */}
      <rect x="300" y="330" width="74" height="16" rx="4" fill={MUTED} stroke={BORDER} />

      {/* Callouts */}
      <Label toX={396} toY={150} x={350} y={64} anchor="middle" title="Air-pressure gauges" />
      <Label toX={110} toY={155} x={24} y={120} title="Parking brake" sub="yellow knob" />
      <Label toX={158} toY={155} x={210} y={120} anchor="end" title="Trailer brake" sub="red knob" />
      <Label toX={110} toY={228} x={24} y={262} title="Diff-lock" />
      <Label toX={158} toY={228} x={210} y={262} anchor="end" title="Retarder" />
      <Label toX={300} toY={206} x={300} y={324} anchor="middle" title="Gear lever + splitter" />
      <Label toX={374} toY={338} x={620} y={338} anchor="end" title="Foot brake (treadle)" />
      <Label toX={536} toY={200} x={620} y={200} anchor="end" title="Steering wheel" />
    </svg>
  );
}
