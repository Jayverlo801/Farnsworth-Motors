import type { ReactNode } from "react";

/**
 * Farnsworth line-art vehicle — a brand-neutral grand-touring coupe (long
 * hood, fastback, wide stance; no badges, no recognizable marque) drawn as a
 * side-elevation engineering illustration.
 *
 * Part groups use the fallback vocabulary from docs/HERO-CONTRACT.md:
 *   structure, hood, door_L, quarter_R, front_bumper, rear_bumper,
 *   wheel_F, wheel_R, headlight, taillight, glass, trim
 * (plus an unlabeled `interior` group so the five-stage choreography of the
 * 3D scene — structure → interior → body → identity → completion — reads
 * identically here).
 *
 * Geometry: wheel centers (330, 428) and (900, 428), tire r=54, arch r=62
 * (chord at y=434), body lower edge y=434, beltline ~y=298, roof peak
 * (545, 192), nose x=1092, tail x=178.
 */

export const CAR_VIEWBOX = "0 0 1200 560";

const INK = "rgba(201, 202, 207, 0.9)";
const MID = "rgba(201, 202, 207, 0.42)";
const FAINT = "rgba(201, 202, 207, 0.14)";
const PANEL = "#121215";
const GLASS = "rgba(244, 244, 242, 0.05)";

const SILHOUETTE = [
  "M 186 430",
  "C 180 426 178 416 178 404",
  "L 178 356",
  "C 178 340 184 328 196 320",
  "C 206 313 218 308 232 305",
  "C 242 302 252 300 262 298",
  "C 300 250 380 206 480 195",
  "C 502 192 524 192 545 192",
  "C 585 192 625 196 655 204",
  "C 690 224 730 262 770 290",
  "C 850 302 950 316 1020 324",
  "C 1048 327 1066 330 1078 333",
  "C 1088 338 1092 346 1092 358",
  "L 1092 402",
  "C 1092 418 1081 430 1062 433",
  "L 961.7 434",
  "A 62 62 0 1 0 838.3 434",
  "L 391.7 434",
  "A 62 62 0 1 0 268.3 434",
  "L 210 434",
  "C 200 434 192 433 186 430",
  "Z",
].join(" ");

/** Body-in-white upper structure: cowl → A-pillar → roof → fastback → deck. */
const ROOFLINE =
  "M 770 290 C 730 262 690 224 655 204 C 625 196 585 192 545 192 C 524 192 502 192 480 195 C 380 206 300 250 262 298";

interface PartDef {
  id: string;
  /** 1 structure · 2 interior · 3 body · 4 identity */
  stage: 1 | 2 | 3 | 4;
  /** Exploded-state transform (engineering elevation offsets). */
  ex: string;
  /** Assembly stagger within the stage, ms. */
  delay: number;
  /** Exploded-state annotation: mono label + hairline leader. */
  label?: { text: string; lx: number; ly: number; tx: number; ty: number };
  node: ReactNode;
}

function Wheel({ cx }: { cx: number }) {
  const cy = 428;
  return (
    <g>
      <circle cx={cx} cy={cy} r="54" fill="#0e0e10" stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="32" fill="none" stroke={MID} strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="5" fill="none" stroke={MID} strokeWidth="1.5" />
      {[0, 72, 144, 216, 288].map((a) => (
        <line
          key={a}
          x1={cx}
          y1={cy - 9}
          x2={cx}
          y2={cy - 28}
          stroke={MID}
          strokeWidth="1.5"
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
    </g>
  );
}

function Coil({ cx }: { cx: number }) {
  const d = [
    `M ${cx} 328 L ${cx} 340`,
    `M ${cx - 14} 340 L ${cx + 14} 348 L ${cx - 14} 356 L ${cx + 14} 364 L ${cx - 14} 372 L ${cx + 14} 380 L ${cx - 14} 388`,
    `M ${cx} 388 L ${cx} 398`,
  ].join(" ");
  return (
    <g>
      <path d={d} fill="none" stroke={MID} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={`M ${cx - 62} 422 L ${cx - 2} 432 M ${cx + 62} 422 L ${cx + 2} 432`}
        fill="none"
        stroke={MID}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
}

const panel = { fill: PANEL, fillOpacity: 0.92, stroke: INK, strokeWidth: 1.6 } as const;

const PARTS: PartDef[] = [
  {
    id: "structure",
    stage: 1,
    ex: "translate(0px, 116px)",
    delay: 0,
    label: { text: "STRUCTURE", lx: 92, ly: 478, tx: 288, ty: 474 },
    node: (
      <g>
        <Coil cx={330} />
        <Coil cx={900} />
      </g>
    ),
  },
  {
    id: "interior",
    stage: 2,
    ex: "translate(0px, -90px)",
    delay: 0,
    node: (
      <g fill="none" stroke={MID} strokeWidth="1.7" strokeLinecap="round">
        <path d="M 662 366 C 654 340 651 316 656 294" />
        <rect x="646" y="268" width="26" height="16" rx="7" transform="rotate(-8 659 276)" />
        <rect x="612" y="362" width="72" height="16" rx="8" />
        <path d="M 760 306 C 746 314 730 320 714 322 M 760 306 L 760 352" strokeLinejoin="round" />
        <ellipse cx="694" cy="326" rx="5.5" ry="17" transform="rotate(-16 694 326)" />
        <path d="M 700 320 L 726 308" />
      </g>
    ),
  },
  {
    id: "door_L",
    stage: 3,
    ex: "translate(0px, 148px)",
    delay: 0,
    label: { text: "DOOR L", lx: 598, ly: 556, tx: 672, ty: 528 },
    node: (
      <g>
        <path
          d="M 566 298 L 800 306 C 806 307 808 311 808 317 L 810 432 L 578 432 C 571 432 566 427 566 420 Z"
          {...panel}
          strokeLinejoin="round"
        />
        <rect x="748" y="322" width="34" height="6.5" rx="3.2" fill="none" stroke={MID} strokeWidth="1.3" />
      </g>
    ),
  },
  {
    id: "quarter_R",
    stage: 3,
    ex: "translate(-92px, -6px)",
    delay: 120,
    label: { text: "QUARTER R", lx: 58, ly: 330, tx: 142, ty: 352 },
    node: (
      <path
        d="M 566 298 L 262 300 C 250 301 238 304 230 308 L 230 434 L 268.3 434 A 62 62 0 1 1 391.7 434 L 566 434 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "hood",
    stage: 3,
    ex: "translate(56px, -136px) rotate(4deg)",
    delay: 240,
    label: { text: "HOOD", lx: 1054, ly: 140, tx: 1000, ty: 168 },
    node: (
      <path
        d="M 770 290 C 850 302 950 316 1020 324 C 1048 327 1066 330 1078 333 L 1024 334 L 1020 434 L 961.7 434 A 62 62 0 1 1 838.3 434 L 812 434 L 810 310 C 796 303 782 296 770 290 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "front_bumper",
    stage: 3,
    ex: "translate(120px, 6px) rotate(2deg)",
    delay: 360,
    label: { text: "FRONT BUMPER", lx: 1104, ly: 472, tx: 1140, ty: 438 },
    node: (
      <path
        d="M 1024 334 C 1050 338 1072 344 1082 352 C 1090 358 1092 366 1092 376 L 1092 402 C 1092 418 1081 430 1062 433 L 1020 434 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "rear_bumper",
    stage: 3,
    ex: "translate(-120px, 6px) rotate(-2deg)",
    delay: 460,
    label: { text: "REAR BUMPER", lx: 26, ly: 472, tx: 64, ty: 436 },
    node: (
      <path
        d="M 230 308 L 214 310 C 200 314 190 322 184 334 C 180 342 178 350 178 360 L 178 404 C 178 416 183 426 192 431 C 198 434 206 434 214 434 L 230 434 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "wheel_F",
    stage: 4,
    ex: "translate(0px, 140px)",
    delay: 0,
    label: { text: "WHEEL F", lx: 954, ly: 594, tx: 916, ty: 578 },
    node: <Wheel cx={900} />,
  },
  {
    id: "wheel_R",
    stage: 4,
    ex: "translate(0px, 140px)",
    delay: 110,
    label: { text: "WHEEL R", lx: 236, ly: 594, tx: 314, ty: 578 },
    node: <Wheel cx={330} />,
  },
  {
    id: "headlight",
    stage: 4,
    ex: "translate(100px, -40px)",
    delay: 240,
    label: { text: "HEADLIGHT", lx: 1130, ly: 262, tx: 1144, ty: 294 },
    node: (
      <g>
        <path
          d="M 1028 337 L 1072 344 C 1077 346 1078 350 1074 352 L 1028 346 C 1024 344 1024 339 1028 337 Z"
          fill={GLASS}
          stroke={INK}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M 1032 341 L 1068 347" stroke={MID} strokeWidth="1.2" />
      </g>
    ),
  },
  {
    id: "taillight",
    stage: 4,
    ex: "translate(-96px, -52px)",
    delay: 320,
    label: { text: "TAILLIGHT", lx: 48, ly: 214, tx: 124, ty: 242 },
    node: (
      <path
        d="M 260 294 L 220 300 C 215 302 214 307 218 310 L 260 305 C 265 303 265 296 260 294 Z"
        fill={GLASS}
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "glass",
    stage: 4,
    ex: "translate(0px, -160px)",
    delay: 430,
    label: { text: "GLASS", lx: 498, ly: 26, tx: 514, ty: 46 },
    node: (
      <g>
        <path
          d="M 762 288 C 736 262 706 232 678 212 L 662 208 C 690 232 722 262 748 290 Z"
          fill={GLASS}
          stroke={MID}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M 648 214 C 560 206 480 210 410 234 C 380 246 356 256 340 262 L 356 268 C 420 288 520 296 640 300 C 650 272 654 242 648 214 Z"
          fill={GLASS}
          stroke={MID}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M 566 210 L 566 297" stroke={MID} strokeWidth="1.4" />
      </g>
    ),
  },
  {
    id: "trim",
    stage: 4,
    ex: "translate(0px, 56px)",
    delay: 560,
    label: { text: "TRIM", lx: 306, ly: 524, tx: 396, ty: 497 },
    node: <path d="M 400 439 L 820 439" stroke={MID} strokeWidth="2" strokeLinecap="round" />,
  },
];

/** Parts visually altered in the "before" (damage documentation) rendering. */
const DAMAGE_CLASSES: Record<string, string> = {
  hood: "car-dmg-shift car-dmg-tint",
  front_bumper: "car-dmg-shift2 car-dmg-tint",
  headlight: "car-dmg-missing car-dmg-tint",
};

export interface CarArtProps {
  /** Unique prefix for SVG defs ids — required when several cars share a page. */
  idPrefix: string;
  /** Highest assembled stage; 99 renders fully assembled. */
  assembledStage?: number;
  /** Render the damage-documentation ("before") variant. */
  damaged?: boolean;
  showShadow?: boolean;
  /** Include the sweep-highlight layer (hero only). */
  sweep?: boolean;
  /** Render exploded-state part labels + leader lines (hero fallback). */
  showLabels?: boolean;
  /** Static mode: keep labels visible but dimmed. */
  labelsDimmed?: boolean;
}

export function CarArt({
  idPrefix,
  assembledStage = 99,
  damaged = false,
  showShadow = true,
  sweep = false,
  showLabels = false,
  labelsDimmed = false,
}: CarArtProps) {
  const clipId = `${idPrefix}-carclip`;
  const gradId = `${idPrefix}-sweepgrad`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={SILHOUETTE} />
        </clipPath>
        {sweep && (
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#cfc6b8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#cfc6b8" stopOpacity="0.15" />
            <stop offset="1" stopColor="#cfc6b8" stopOpacity="0" />
          </linearGradient>
        )}
      </defs>

      {showShadow && (
        <g className="car-shadow">
          <ellipse cx="635" cy="490" rx="440" ry="13" fill="#000" opacity="0.35" />
          <ellipse cx="635" cy="488" rx="310" ry="9" fill="#000" opacity="0.4" />
        </g>
      )}

      {/* Ghost silhouette + engineering dimensions — the drawing underlay */}
      <g className="car-ghost" aria-hidden="true">
        <path
          d={SILHOUETTE}
          fill="none"
          stroke={FAINT}
          strokeWidth="1"
          strokeDasharray="4 7"
        />
        <g stroke={FAINT} strokeWidth="1">
          <line x1="178" y1="508" x2="1092" y2="508" />
          <line x1="178" y1="502" x2="178" y2="514" />
          <line x1="1092" y1="502" x2="1092" y2="514" />
          <line x1="330" y1="500" x2="330" y2="516" />
          <line x1="900" y1="500" x2="900" y2="516" />
        </g>
        <text
          x="635"
          y="532"
          textAnchor="middle"
          fill={FAINT}
          fontFamily="var(--font-mono)"
          fontSize="11"
          letterSpacing="3"
        >
          4640
        </text>
      </g>

      {/* Chassis / body-in-white — present from the first frame */}
      <g fill="none" strokeLinecap="round">
        <path d={ROOFLINE} stroke={INK} strokeWidth="1.6" />
        <g stroke={MID} strokeWidth="1.6">
          <path d="M 250 408 L 1010 408 M 250 416 L 1010 416" />
          <path d="M 420 408 L 420 416 M 560 408 L 560 416 M 700 408 L 700 416" strokeWidth="1.2" />
          <path d="M 766 292 L 766 408" />
          <path d="M 340 292 L 340 408" />
          <path d="M 900 368 L 900 344 M 330 368 L 330 344" strokeWidth="1.3" />
        </g>
      </g>

      {PARTS.map((p) => {
        const assembled = p.stage <= assembledStage;
        const dmg = damaged ? DAMAGE_CLASSES[p.id] : undefined;
        return (
          <g
            key={p.id}
            data-part={p.id}
            className={`car-part${dmg ? ` ${dmg}` : ""}`}
            style={
              dmg
                ? undefined
                : {
                    transform: assembled ? undefined : p.ex,
                    transitionDelay: `${p.delay}ms`,
                  }
            }
          >
            {p.node}
          </g>
        );
      })}

      {showLabels && (
        <g aria-hidden="true" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2.5">
          {PARTS.filter((p) => p.label).map((p) => {
            const assembled = p.stage <= assembledStage;
            const o = labelsDimmed ? 0.4 : assembled ? 0 : 1;
            const L = p.label!;
            return (
              <g
                key={p.id + "-label"}
                className="car-label"
                style={{ opacity: o, transitionDelay: `${p.delay + 250}ms` }}
              >
                <line
                  x1={L.lx + (L.tx > L.lx ? 14 : -14)}
                  y1={L.ly - 4}
                  x2={L.tx}
                  y2={L.ty}
                  stroke="rgba(153, 153, 159, 0.38)"
                  strokeWidth="1"
                />
                <text x={L.lx} y={L.ly} fill="#99999f" textAnchor={L.tx > L.lx ? "start" : "end"}>
                  {L.text}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {damaged && (
        <g aria-hidden="true">
          {/* impact markers */}
          <g fill="none" stroke="rgba(184, 188, 196, 0.8)" strokeWidth="1.3">
            <circle cx="1014" cy="378" r="17" />
            <circle cx="1014" cy="378" r="26" strokeDasharray="3 5" opacity="0.7" />
            <path d="M 1014 354 L 1014 368 M 1014 388 L 1014 402 M 990 378 L 1004 378 M 1024 378 L 1038 378" />
            <circle cx="900" cy="304" r="13" />
            <circle cx="900" cy="304" r="21" strokeDasharray="3 5" opacity="0.7" />
          </g>
          {/* legend, top-left clear zone */}
          <g
            fontFamily="var(--font-mono)"
            fontSize="13"
            letterSpacing="1.5"
            fill="rgba(184, 188, 196, 0.85)"
          >
            <text x="46" y="66">01 · RF IMPACT — FASCIA / FENDER / LAMP</text>
            <text x="46" y="92" fill="rgba(153, 153, 159, 0.85)">
              02 · HOOD REFINISHED
            </text>
          </g>
          <text x="1014" y="346" fontFamily="var(--font-mono)" fontSize="12" fill="rgba(184, 188, 196, 0.85)" textAnchor="middle">01</text>
          <text x="900" y="278" fontFamily="var(--font-mono)" fontSize="12" fill="rgba(153, 153, 159, 0.85)" textAnchor="middle">02</text>
        </g>
      )}

      {sweep && (
        <g clipPath={`url(#${clipId})`}>
          <g className="car-sweep">
            <rect x="-40" y="140" width="150" height="340" fill={`url(#${gradId})`} transform="skewX(-16)" />
          </g>
        </g>
      )}
    </>
  );
}
