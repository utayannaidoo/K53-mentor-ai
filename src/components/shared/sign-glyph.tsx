import * as React from "react";
import type { SignKey } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Inline SVG renditions of common South African road signs so the question /
 * flashcard content has real visuals without shipping image assets. Sign reds
 * and blues are intentionally the literal traffic-sign colours.
 */

const RED = "#D32F2F";
const BLUE = "#1565C0";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" role="img">
      {children}
    </svg>
  );
}

const GLYPHS: Record<SignKey, React.ReactNode> = {
  stop: (
    <Frame>
      <polygon
        points="20,4 44,4 60,20 60,44 44,60 20,60 4,44 4,20"
        fill={RED}
        stroke={WHITE}
        strokeWidth="3"
      />
      <text x="32" y="38" textAnchor="middle" fill={WHITE} fontSize="14" fontWeight="700" fontFamily="sans-serif">
        STOP
      </text>
    </Frame>
  ),
  yield: (
    <Frame>
      <polygon points="32,58 4,8 60,8" fill={WHITE} stroke={RED} strokeWidth="6" />
    </Frame>
  ),
  no_entry: (
    <Frame>
      <circle cx="32" cy="32" r="28" fill={RED} />
      <rect x="14" y="27" width="36" height="10" rx="2" fill={WHITE} />
    </Frame>
  ),
  no_overtaking: (
    <Frame>
      <circle cx="32" cy="32" r="28" fill={WHITE} stroke={RED} strokeWidth="5" />
      <rect x="16" y="24" width="13" height="20" rx="2" fill={DARK} />
      <rect x="35" y="24" width="13" height="20" rx="2" fill={RED} />
      <line x1="12" y1="52" x2="52" y2="12" stroke={RED} strokeWidth="5" />
    </Frame>
  ),
  speed_60: (
    <Frame>
      <circle cx="32" cy="32" r="28" fill={WHITE} stroke={RED} strokeWidth="6" />
      <text x="32" y="41" textAnchor="middle" fill={DARK} fontSize="24" fontWeight="700" fontFamily="sans-serif">
        60
      </text>
    </Frame>
  ),
  speed_120: (
    <Frame>
      <circle cx="32" cy="32" r="28" fill={WHITE} stroke={RED} strokeWidth="6" />
      <text x="32" y="40" textAnchor="middle" fill={DARK} fontSize="19" fontWeight="700" fontFamily="sans-serif">
        120
      </text>
    </Frame>
  ),
  pedestrian: (
    <Frame>
      <polygon points="32,6 60,56 4,56" fill={WHITE} stroke={RED} strokeWidth="5" />
      <circle cx="32" cy="26" r="3.4" fill={DARK} />
      <path d="M32 30 L32 42 M32 34 L26 40 M32 34 L38 40 M32 42 L28 52 M32 42 L36 52" stroke={DARK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </Frame>
  ),
  traffic_circle: (
    <Frame>
      <circle cx="32" cy="32" r="28" fill={BLUE} />
      <g fill="none" stroke={WHITE} strokeWidth="3.4" strokeLinecap="round">
        <path d="M32 16 A16 16 0 0 1 46 38" />
        <path d="M46 38 A16 16 0 0 1 20 44" />
        <path d="M20 44 A16 16 0 0 1 32 16" />
      </g>
      <polygon points="30,12 38,17 30,22" fill={WHITE} />
    </Frame>
  ),
  t_junction: (
    <Frame>
      <polygon points="32,6 60,56 4,56" fill={WHITE} stroke={RED} strokeWidth="5" />
      <path d="M18 44 H46 M32 44 V24" stroke={DARK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </Frame>
  ),
  robot: (
    <Frame>
      <rect x="22" y="6" width="20" height="52" rx="6" fill={DARK} />
      <circle cx="32" cy="18" r="6" fill={RED} />
      <circle cx="32" cy="32" r="6" fill="#E0A526" />
      <circle cx="32" cy="46" r="6" fill="#2E9E5B" />
    </Frame>
  ),
  railway: (
    <Frame>
      <polygon points="32,6 60,56 4,56" fill={WHITE} stroke={RED} strokeWidth="5" />
      <path d="M18 46 L46 18 M18 18 L46 46" stroke={DARK} strokeWidth="4.5" strokeLinecap="round" />
    </Frame>
  ),
  no_stopping: (
    <Frame>
      <circle cx="32" cy="32" r="28" fill={BLUE} stroke={RED} strokeWidth="6" />
      <path d="M14 14 L50 50 M50 14 L14 50" stroke={RED} strokeWidth="6" strokeLinecap="round" />
    </Frame>
  ),
};

export function SignGlyph({
  sign,
  className,
}: {
  sign: SignKey;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex aspect-square h-16 w-16 items-center justify-center", className)}>
      {GLYPHS[sign]}
    </span>
  );
}
