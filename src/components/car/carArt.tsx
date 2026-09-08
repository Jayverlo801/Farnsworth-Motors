import type { ReactNode } from "react";

/**
 * Farnsworth line-art vehicle — a side-elevation sedan drawn as an
 * engineering illustration, split into independently addressable parts that
 * mirror the 3D asset naming in docs/3D-INTEGRATION.md.
 *
 * Stages (matches the hero timeline and the future 3D scene):
 *   0 chassis + ghost (always visible)   3 body panels
 *   1 suspension                         4 identity (wheels, lights, glass…)
 *   2 interior
 *
 * Geometry constants: ground plane y=422 (body lower edge), wheel centers
 * (352, 430) and (872, 430), tire r=52, arch r=60 (chord endpoints ±59 at
 * y=422), beltline ~y=300, roof ~y=204, nose x=1082, tail x=188.
 */

export const CAR_VIEWBOX = "0 0 1200 560";

const INK = "rgba(201, 202, 207, 0.9)";
const MID = "rgba(201, 202, 207, 0.42)";
const FAINT = "rgba(201, 202, 207, 0.14)";
const PANEL = "#121215";
const GLASS = "rgba(244, 244, 242, 0.05)";

const SILHOUETTE = [
  "M 196 434",
  "C 190 430 188 420 188 408",
  "L 188 352",
  "C 188 336 194 324 206 316",
  "C 216 309 228 305 240 303",
  "C 268 297 298 288 322 283",
  "C 354 240 394 213 442 207",
  "C 502 201 562 201 618 209",
  "C 652 214 684 240 708 268",
  "C 716 277 726 285 742 290",
  "C 820 299 900 309 968 317",
  "C 1010 322 1044 328 1062 336",
  "C 1076 342 1082 352 1082 366",
  "L 1082 412",
  "C 1082 428 1072 436 1054 438",
  "L 931.5 438",
  "A 60 60 0 1 0 812.5 438",
  "L 411.5 438",
  "A 60 60 0 1 0 292.5 438",
  "L 214 438",
  "C 204 438 198 437 196 434",
  "Z",
].join(" ");

/** Body-in-white upper structure: cowl → A-pillar → roof → C-pillar → deck. */
const ROOFLINE =
  "M 736 292 C 726 286 716 278 708 268 C 684 240 652 214 618 209 C 562 201 502 201 442 207 C 394 213 354 240 322 283";

interface PartDef {
  id: string;
  stage: 1 | 2 | 3 | 4;
  /** Exploded-state annotation: mono label + hairline leader. */
  label?: { text: string; lx: number; ly: number; tx: number; ty: number };
  /** Exploded-state transform (engineering elevation offsets). */
  ex: string;
  /** Assembly stagger within the stage, ms. */
  delay: number;
  node: ReactNode;
}

function Wheel({ cx }: { cx: number }) {
  const cy = 430;
  return (
    <g>
      <circle cx={cx} cy={cy} r="52" fill="#0e0e10" stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="30" fill="none" stroke={MID} strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="5" fill="none" stroke={MID} strokeWidth="1.5" />
      {[0, 72, 144, 216, 288].map((a) => (
        <line
          key={a}
          x1={cx}
          y1={cy - 9}
          x2={cx}
          y2={cy - 26}
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
    `M ${cx} 330 L ${cx} 342`,
    `M ${cx - 14} 342 L ${cx + 14} 350 L ${cx - 14} 358 L ${cx + 14} 366 L ${cx - 14} 374 L ${cx + 14} 382 L ${cx - 14} 390`,
    `M ${cx} 390 L ${cx} 400`,
  ].join(" ");
  return (
    <g>
      <path d={d} fill="none" stroke={MID} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={`M ${cx - 62} 424 L ${cx - 2} 434 M ${cx + 62} 424 L ${cx + 2} 434`}
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
    id: "susp_front",
    stage: 1,
    ex: "translate(0px, 116px)",
    delay: 0,
    node: <Coil cx={872} />,
  },
  {
    id: "susp_rear",
    label: { text: "STRUCTURE", lx: 96, ly: 484, tx: 286, ty: 480 },
    stage: 1,
    ex: "translate(0px, 116px)",
    delay: 130,
    node: <Coil cx={352} />,
  },
  {
    id: "seat_driver",
    stage: 2,
    ex: "translate(-10px, -96px)",
    delay: 0,
    node: (
      <g fill="none" stroke={MID} strokeWidth="1.7" strokeLinecap="round">
        <path d="M 606 362 C 597 338 593 314 598 292" />
        <rect x="588" y="266" width="26" height="16" rx="7" transform="rotate(-8 601 274)" />
        <rect x="558" y="360" width="70" height="16" rx="8" />
      </g>
    ),
  },
  {
    id: "seat_passenger",
    stage: 2,
    ex: "translate(-16px, -92px)",
    delay: 110,
    node: (
      <g fill="none" stroke={MID} strokeWidth="1.7" strokeLinecap="round">
        <path d="M 486 362 C 478 340 476 318 480 298" />
        <rect x="468" y="274" width="24" height="15" rx="7" transform="rotate(-6 480 281)" />
        <rect x="434" y="362" width="58" height="14" rx="7" />
      </g>
    ),
  },
  {
    id: "dashboard",
    stage: 2,
    ex: "translate(20px, -92px)",
    delay: 210,
    node: (
      <path
        d="M 730 306 C 716 314 702 320 686 322 M 730 306 L 730 350"
        fill="none"
        stroke={MID}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "steering_wheel",
    stage: 2,
    ex: "translate(24px, -98px)",
    delay: 290,
    node: (
      <g fill="none" stroke={MID} strokeWidth="1.7" strokeLinecap="round">
        <ellipse cx="664" cy="326" rx="5.5" ry="17" transform="rotate(-16 664 326)" />
        <path d="M 670 320 L 696 308" />
      </g>
    ),
  },
  {
    id: "door_FL",
    label: { text: "DOOR L", lx: 608, ly: 560, tx: 690, ty: 532 },
    stage: 3,
    ex: "translate(0px, 150px)",
    delay: 0,
    node: (
      <g>
        <path
          d="M 620 300 L 786 308 C 791 309 793 313 793 319 L 794 436 L 632 436 C 625 436 620 431 620 424 Z"
          {...panel}
          strokeLinejoin="round"
        />
        <rect x="744" y="324" width="32" height="6.5" rx="3.2" fill="none" stroke={MID} strokeWidth="1.3" />
      </g>
    ),
  },
  {
    id: "door_RL",
    stage: 3,
    ex: "translate(0px, 136px)",
    delay: 110,
    node: (
      <g>
        <path
          d="M 460 296 L 614 300 L 614 425 C 614 431 610 436 604 436 L 474 436 C 467 436 463 432 462 425 Z"
          {...panel}
          strokeLinejoin="round"
        />
        <rect x="566" y="322" width="32" height="6.5" rx="3.2" fill="none" stroke={MID} strokeWidth="1.3" />
      </g>
    ),
  },
  {
    id: "hood",
    label: { text: "HOOD", lx: 1046, ly: 138, tx: 978, ty: 164 },
    stage: 3,
    ex: "translate(64px, -144px) rotate(5deg)",
    delay: 220,
    node: (
      <path
        d="M 742 290 C 820 299 900 309 968 317 C 1006 321 1038 327 1062 336 L 1010 336 C 928 321 836 309 744 302 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "quarter_RL",
    label: { text: "QUARTER R", lx: 96, ly: 240, tx: 236, ty: 322 },
    stage: 3,
    ex: "translate(-96px, -6px)",
    delay: 330,
    node: (
      <path
        d="M 458 298 L 262 307 C 258 307 256 309 256 312 L 256 438 L 292.5 438 A 60 60 0 1 1 411.5 438 L 458 438 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "quarter_FL",
    stage: 3,
    ex: "translate(96px, -10px)",
    delay: 440,
    node: (
      <path
        d="M 796 306 C 868 313 944 322 1010 336 L 1002 438 L 931.5 438 A 60 60 0 1 1 812.5 438 L 796 438 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "trunk",
    stage: 3,
    ex: "translate(-56px, -120px) rotate(-4deg)",
    delay: 550,
    node: (
      <path
        d="M 322 283 C 298 288 268 297 240 303 C 228 306 218 309 210 314 L 215 319 L 256 313 L 262 307 C 292 300 312 295 324 291 C 327 288 325 284 322 283 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "wheel_FL",
    label: { text: "WHEEL F", lx: 928, ly: 594, tx: 888, ty: 576 },
    stage: 4,
    ex: "translate(0px, 140px)",
    delay: 0,
    node: <Wheel cx={872} />,
  },
  {
    id: "wheel_RL",
    label: { text: "WHEEL R", lx: 232, ly: 594, tx: 336, ty: 576 },
    stage: 4,
    ex: "translate(0px, 140px)",
    delay: 120,
    node: <Wheel cx={352} />,
  },
  {
    id: "headlight_R",
    label: { text: "HEADLIGHT", lx: 1122, ly: 260, tx: 1132, ty: 288 },
    stage: 4,
    ex: "translate(110px, -44px)",
    delay: 250,
    node: (
      <g>
        <path
          d="M 1014 339 L 1056 347 C 1061 349 1062 353 1058 355 L 1014 348 C 1010 346 1010 341 1014 339 Z"
          fill={GLASS}
          stroke={INK}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M 1018 343 L 1052 350" stroke={MID} strokeWidth="1.2" />
      </g>
    ),
  },
  {
    id: "taillight_L",
    label: { text: "TAILLIGHT", lx: 48, ly: 214, tx: 122, ty: 242 },
    stage: 4,
    ex: "translate(-102px, -54px)",
    delay: 330,
    node: (
      <path
        d="M 258 295 L 216 302 C 211 304 210 309 214 312 L 258 306 C 263 304 263 297 258 295 Z"
        fill={GLASS}
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "glass",
    label: { text: "GLASS", lx: 498, ly: 26, tx: 520, ty: 46 },
    stage: 4,
    ex: "translate(0px, -168px)",
    delay: 430,
    node: (
      <g>
        <path
          d="M 700 280 C 686 254 670 233 650 218 C 596 209 536 207 480 211 C 442 216 408 232 384 252 C 366 264 354 273 348 280 L 372 285 C 480 293 600 295 686 296 Z"
          fill={GLASS}
          stroke={MID}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M 618 212 L 618 296" stroke={MID} strokeWidth="1.4" />
        <path d="M 404 240 L 384 283" stroke={MID} strokeWidth="1.4" />
      </g>
    ),
  },
  {
    id: "mirror",
    stage: 4,
    ex: "translate(18px, -60px)",
    delay: 520,
    node: (
      <g fill="none" stroke={MID} strokeWidth="1.5">
        <rect x="762" y="284" width="22" height="13" rx="4" />
        <path d="M 772 297 L 776 306" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "front_bumper",
    label: { text: "FRONT BUMPER", lx: 1092, ly: 474, tx: 1150, ty: 432 },
    stage: 4,
    ex: "translate(150px, 8px) rotate(2deg)",
    delay: 580,
    node: (
      <path
        d="M 1010 336 C 1040 342 1062 350 1074 358 C 1080 363 1082 368 1082 376 L 1082 412 C 1082 428 1072 436 1054 438 L 1002 438 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "rear_bumper",
    label: { text: "REAR BUMPER", lx: 30, ly: 474, tx: 66, ty: 432 },
    stage: 4,
    ex: "translate(-148px, 8px) rotate(-2deg)",
    delay: 680,
    node: (
      <path
        d="M 256 312 L 214 316 C 202 319 194 328 190 340 C 188 346 188 352 188 360 L 188 408 C 188 420 193 430 202 435 C 208 438 216 438 224 438 L 256 438 Z"
        {...panel}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "trim",
    label: { text: "TRIM", lx: 316, ly: 532, tx: 424, ty: 506 },
    stage: 4,
    ex: "translate(0px, 60px)",
    delay: 780,
    node: <path d="M 420 443 L 806 443" stroke={MID} strokeWidth="2" strokeLinecap="round" />,
  },
];

/** Parts visually altered in the "before" (damage documentation) rendering. */
const DAMAGE_CLASSES: Record<string, string> = {
  quarter_FL: "car-dmg-shift car-dmg-tint",
  front_bumper: "car-dmg-shift2 car-dmg-tint",
  headlight_R: "car-dmg-missing car-dmg-tint",
  hood: "car-dmg-tint",
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
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#cfc6b8" stopOpacity="0.15" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        )}
      </defs>

      {showShadow && (
        <g className="car-shadow">
          <ellipse cx="620" cy="488" rx="420" ry="13" fill="#000" opacity="0.35" />
          <ellipse cx="620" cy="486" rx="300" ry="9" fill="#000" opacity="0.4" />
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
          <line x1="188" y1="508" x2="1082" y2="508" />
          <line x1="188" y1="502" x2="188" y2="514" />
          <line x1="1082" y1="502" x2="1082" y2="514" />
          <line x1="352" y1="500" x2="352" y2="516" />
          <line x1="872" y1="500" x2="872" y2="516" />
        </g>
        <text
          x="620"
          y="532"
          textAnchor="middle"
          fill={FAINT}
          fontFamily="var(--font-mono)"
          fontSize="11"
          letterSpacing="3"
        >
          4486
        </text>
      </g>

      {/* Chassis / body-in-white — present from the first frame */}
      <g fill="none" strokeLinecap="round">
        <path d={ROOFLINE} stroke={INK} strokeWidth="1.6" />
        <g stroke={MID} strokeWidth="1.6">
          <path d="M 260 406 L 1000 406 M 260 414 L 1000 414" />
          <path d="M 420 406 L 420 414 M 560 406 L 560 414 M 700 406 L 700 414" strokeWidth="1.2" />
          <path d="M 736 292 L 736 406" />
          <path d="M 330 286 L 330 406" />
          <path d="M 872 366 L 872 342 M 352 366 L 352 342" strokeWidth="1.3" />
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
                style={{ opacity: o, transitionDelay: (p.delay + 250) + "ms" }}
              >
                <line x1={L.lx + (L.tx > L.lx ? 14 : -14)} y1={L.ly - 4} x2={L.tx} y2={L.ty} stroke="rgba(153, 153, 159, 0.38)" strokeWidth="1" />
                <text x={L.lx} y={L.ly} fill="#99999f" textAnchor={L.tx > L.lx ? "start" : "end"}>{L.text}</text>
              </g>
            );
          })}
        </g>
      )}

      {damaged && (
        <g aria-hidden="true">
          {/* impact markers */}
          <g fill="none" stroke="rgba(184, 188, 196, 0.8)" strokeWidth="1.3">
            <circle cx="1005" cy="378" r="17" />
            <circle cx="1005" cy="378" r="26" strokeDasharray="3 5" opacity="0.7" />
            <path d="M 1005 354 L 1005 368 M 1005 388 L 1005 402 M 981 378 L 995 378 M 1015 378 L 1029 378" />
            <circle cx="880" cy="302" r="13" />
            <circle cx="880" cy="302" r="21" strokeDasharray="3 5" opacity="0.7" />
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
          <text x="1005" y="346" fontFamily="var(--font-mono)" fontSize="12" fill="rgba(184, 188, 196, 0.85)" textAnchor="middle">01</text>
          <text x="880" y="276" fontFamily="var(--font-mono)" fontSize="12" fill="rgba(153, 153, 159, 0.85)" textAnchor="middle">02</text>
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
