import type { ReactNode } from "react";

/**
 * Farnsworth line-art vehicle — a brand-neutral grand-touring coupe drawn as
 * a side-elevation engineering illustration. v3 geometry: long hood (large
 * dash-to-axle), fastback into a short Kamm tail, wheels pushed to the
 * corners, low greenhouse, two doors, no badges, no recognizable marque.
 *
 * Drawing system (Part 1.3 of the v3 brief):
 *   - one stroke weight (1.2 viewBox units ≈ 1px at 1× render)
 *   - outer silhouette + panel edges in --text-2, structure lines in --text-3
 *   - body fills --bg-2 with a subtle vertical gradient to --bg
 *   - door / hood / quarter cut lines as hairlines
 *   - ground: single fading hairline at the contact patch + 6% radial
 *     contact shadow; no reflection
 *
 * Part groups keep the contract vocabulary (docs/HERO-CONTRACT.md):
 *   structure, hood, door_L, quarter_R, front_bumper, rear_bumper,
 *   wheel_F, wheel_R, headlight, taillight, glass, trim (+ unlabeled
 *   interior so the five-stage choreography matches the 3D scene).
 *
 * Geometry constants: wheel centers (300, 400) and (920, 400), tire r=52,
 * arch r=60 (chord y=404), rocker y=404, beltline ~y=270, roof peak
 * (~600, 166), nose x=1106, tail x=187, ground y=452.
 */

export const CAR_VIEWBOX = "0 0 1200 500";

/** Engineering ink on parchment — outer silhouette and panel edges. */
const OUTER = "#3a2412";
/** Soft ink — structure, cut lines, detail. */
const STRUCT = "#8a775e";
const FAINT = "rgba(58, 36, 18, 0.2)";
/** Body gradient endpoints — warm paper tones. */
const BODY_TOP = "#f1ebd1";
const BODY_BOTTOM = "#e7e0be";
const GLASS = "rgba(32, 14, 1, 0.06)";
const W = 1.2;

const SILHOUETTE = [
  "M 196 400",
  "C 189 396 187 388 187 377",
  "L 187 320",
  "C 187 306 190 295 197 287",
  "C 204 279 212 273 224 269",
  "C 236 264 248 261 262 260",
  "L 310 254",
  "C 370 240 434 222 494 198",
  "C 526 184 556 172 590 168",
  "C 634 163 676 168 710 180",
  "C 740 192 766 214 786 240",
  "C 796 254 806 263 818 268",
  "C 884 277 952 287 1012 295",
  "C 1046 299 1072 303 1088 308",
  "C 1100 312 1106 320 1106 330",
  "L 1106 368",
  "C 1106 382 1097 392 1080 396",
  "C 1054 401 1020 403 980 404",
  "A 60 60 0 1 0 860 404",
  "L 360 404",
  "A 60 60 0 1 0 240 404",
  "L 214 404",
  "C 205 404 199 403 196 400",
  "Z",
].join(" ");

/** Body-in-white upper structure: cowl → A-pillar → roof → fastback → deck. */
const ROOFLINE =
  "M 818 268 C 806 263 796 254 786 240 C 766 214 740 192 710 180 C 676 168 634 163 590 168 C 556 172 526 184 494 198 C 434 222 370 240 310 254";

interface PartDef {
  id: string;
  /** 1 structure · 2 interior · 3 body · 4 identity */
  stage: 1 | 2 | 3 | 4;
  ex: string;
  delay: number;
  label?: { text: string; lx: number; ly: number; tx: number; ty: number };
  node: ReactNode;
}

function Wheel({ cx }: { cx: number }) {
  const cy = 400;
  return (
    <g>
      <circle cx={cx} cy={cy} r="52" fill="#2e1c0e" stroke={OUTER} strokeWidth={W} />
      <circle cx={cx} cy={cy} r="30" fill="none" stroke="#c9b98d" strokeWidth={W} />
      <circle cx={cx} cy={cy} r="4.5" fill="none" stroke="#c9b98d" strokeWidth={W} />
      {[0, 72, 144, 216, 288].map((a) => (
        <line
          key={a}
          x1={cx}
          y1={cy - 8}
          x2={cx}
          y2={cy - 26}
          stroke="#c9b98d"
          strokeWidth={W}
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
    </g>
  );
}

function Coil({ cx }: { cx: number }) {
  const d = [
    `M ${cx} 304 L ${cx} 314`,
    `M ${cx - 13} 314 L ${cx + 13} 322 L ${cx - 13} 330 L ${cx + 13} 338 L ${cx - 13} 346 L ${cx + 13} 354 L ${cx - 13} 362`,
    `M ${cx} 362 L ${cx} 372`,
  ].join(" ");
  return (
    <g>
      <path d={d} fill="none" stroke={STRUCT} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={`M ${cx - 56} 392 L ${cx - 2} 402 M ${cx + 56} 392 L ${cx + 2} 402`}
        fill="none"
        stroke={STRUCT}
        strokeWidth={W}
        strokeLinecap="round"
      />
    </g>
  );
}

const bodyFill = (idPrefix: string) => `url(#${idPrefix}-body)`;

function panelProps(idPrefix: string) {
  return {
    fill: bodyFill(idPrefix),
    stroke: OUTER,
    strokeWidth: W,
    strokeLinejoin: "round",
  } as const;
}

function buildParts(idPrefix: string): PartDef[] {
  const panel = panelProps(idPrefix);
  return [
    {
      id: "structure",
      stage: 1,
      ex: "translate(0px, 104px)",
      delay: 0,
      label: { text: "STRUCTURE", lx: 92, ly: 452, tx: 250, ty: 448 },
      node: (
        <g>
          <Coil cx={300} />
          <Coil cx={920} />
        </g>
      ),
    },
    {
      id: "interior",
      stage: 2,
      ex: "translate(0px, -80px)",
      delay: 0,
      node: (
        <g fill="none" stroke={STRUCT} strokeWidth={W} strokeLinecap="round">
          <path d="M 664 336 C 657 314 655 292 660 272" />
          <rect x="650" y="248" width="24" height="15" rx="7" transform="rotate(-8 662 255)" />
          <rect x="614" y="334" width="70" height="15" rx="7.5" />
          <path d="M 800 276 C 786 284 770 289 754 291 M 800 276 L 800 318" strokeLinejoin="round" />
          <ellipse cx="742" cy="296" rx="5" ry="15" transform="rotate(-14 742 296)" />
          <path d="M 748 290 L 770 280" />
        </g>
      ),
    },
    {
      id: "door_L",
      stage: 3,
      ex: "translate(0px, 132px)",
      delay: 0,
      label: { text: "DOOR L", lx: 606, ly: 496, tx: 662, ty: 476 },
      node: (
        <g>
          <path
            d="M 508 266 L 792 272 C 800 273 804 277 804 284 L 806 400 L 520 400 C 513 400 508 395 508 388 Z"
            {...panel}
          />
          <rect x="740" y="288" width="32" height="6" rx="3" fill="none" stroke={STRUCT} strokeWidth={W} />
        </g>
      ),
    },
    {
      id: "quarter_R",
      stage: 3,
      ex: "translate(-84px, -6px)",
      delay: 120,
      label: { text: "QUARTER R", lx: 62, ly: 250, tx: 152, ty: 290 },
      node: (
        <g>
          <path
            d="M 244 276 C 250 270 256 264 262 260 L 310 254 C 370 240 434 222 470 210 C 471 215 474 220 480 224 C 490 227 499 229 508 230 L 508 404 L 360 404 A 60 60 0 1 0 240 404 Z"
            {...panel}
          />
          <path d="M 508 266 C 430 267 360 269 306 272" fill="none" stroke={STRUCT} strokeWidth={W} />
        </g>
      ),
    },
    {
      id: "hood",
      stage: 3,
      ex: "translate(52px, -118px) rotate(4deg)",
      delay: 240,
      label: { text: "HOOD", lx: 1052, ly: 116, tx: 1002, ty: 144 },
      node: (
        <path
          d="M 818 268 C 884 277 952 287 1012 295 C 1034 298 1054 301 1070 305 L 1032 307 L 1026 404 C 1010 404 995 404 980 404 A 60 60 0 1 1 860 404 L 840 404 L 838 282 C 830 278 824 273 818 268 Z"
          {...panel}
        />
      ),
    },
    {
      id: "front_bumper",
      stage: 3,
      ex: "translate(110px, 6px) rotate(2deg)",
      delay: 360,
      label: { text: "FRONT BUMPER", lx: 1102, ly: 442, tx: 1122, ty: 408 },
      node: (
        <path
          d="M 1032 307 C 1058 310 1080 315 1092 321 C 1102 327 1106 334 1106 343 L 1106 368 C 1106 382 1097 392 1080 396 C 1064 400 1046 402 1026 404 Z"
          {...panel}
        />
      ),
    },
    {
      id: "rear_bumper",
      stage: 3,
      ex: "translate(-110px, 6px) rotate(-2deg)",
      delay: 460,
      label: { text: "REAR BUMPER", lx: 30, ly: 442, tx: 62, ty: 406 },
      node: (
        <path
          d="M 244 276 L 214 280 C 202 283 194 290 190 300 C 188 306 187 310 187 316 L 187 377 C 187 389 192 397 202 401 C 209 404 216 404 224 404 L 240 404 Z"
          {...panel}
        />
      ),
    },
    {
      id: "wheel_F",
      stage: 4,
      ex: "translate(0px, 120px)",
      delay: 0,
      label: { text: "WHEEL F", lx: 972, ly: 528, tx: 934, ty: 512 },
      node: <Wheel cx={920} />,
    },
    {
      id: "wheel_R",
      stage: 4,
      ex: "translate(0px, 120px)",
      delay: 110,
      label: { text: "WHEEL R", lx: 208, ly: 528, tx: 284, ty: 512 },
      node: <Wheel cx={300} />,
    },
    {
      id: "headlight",
      stage: 4,
      ex: "translate(92px, -36px)",
      delay: 240,
      label: { text: "HEADLIGHT", lx: 1148, ly: 240, tx: 1148, ty: 268 },
      node: (
        <g>
          <path
            d="M 1038 309 L 1080 316 C 1085 318 1086 322 1082 324 L 1038 318 C 1034 316 1034 311 1038 309 Z"
            fill={GLASS}
            stroke={OUTER}
            strokeWidth={W}
            strokeLinejoin="round"
          />
          <path d="M 1042 313 L 1076 319" stroke={STRUCT} strokeWidth={W} />
        </g>
      ),
    },
    {
      id: "taillight",
      stage: 4,
      ex: "translate(-88px, -46px)",
      delay: 320,
      label: { text: "TAILLIGHT", lx: 46, ly: 190, tx: 132, ty: 216 },
      node: (
        <path
          d="M 256 258 L 216 264 C 211 266 210 271 214 274 L 256 268 C 261 266 261 260 256 258 Z"
          fill={GLASS}
          stroke={OUTER}
          strokeWidth={W}
          strokeLinejoin="round"
        />
      ),
    },
    {
      id: "glass",
      stage: 4,
      ex: "translate(0px, -140px)",
      delay: 430,
      label: { text: "GLASS", lx: 470, ly: 26, tx: 500, ty: 46 },
      node: (
        <g>
          <path
            d="M 810 264 C 792 240 770 216 748 198 L 732 192 C 754 214 776 240 794 266 Z"
            fill={GLASS}
            stroke={STRUCT}
            strokeWidth={W}
            strokeLinejoin="round"
          />
          <path
            d="M 720 194 C 668 182 620 180 580 186 C 546 192 514 202 488 216 L 478 224 L 496 230 C 570 252 656 262 728 264 C 734 240 730 216 720 194 Z"
            fill={GLASS}
            stroke={STRUCT}
            strokeWidth={W}
            strokeLinejoin="round"
          />
          <path d="M 508 222 L 508 266" stroke={STRUCT} strokeWidth={W} />
        </g>
      ),
    },
    {
      id: "trim",
      stage: 4,
      ex: "translate(0px, 52px)",
      delay: 560,
      label: { text: "TRIM", lx: 320, ly: 470, tx: 392, ty: 446 },
      node: <path d="M 380 399 L 830 399" stroke={STRUCT} strokeWidth={W} strokeLinecap="round" />,
    },
  ];
}

/** Parts visually altered in the "before" (damage documentation) rendering. */
const DAMAGE_CLASSES: Record<string, string> = {
  hood: "car-dmg-shift car-dmg-tint",
  front_bumper: "car-dmg-shift2 car-dmg-tint",
  headlight: "car-dmg-missing car-dmg-tint",
};

export interface CarArtProps {
  idPrefix: string;
  assembledStage?: number;
  damaged?: boolean;
  showShadow?: boolean;
  sweep?: boolean;
  showLabels?: boolean;
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
  const bodyId = `${idPrefix}-body`;
  const groundId = `${idPrefix}-ground`;
  const shadowId = `${idPrefix}-shadow`;
  const parts = buildParts(idPrefix);

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={SILHOUETTE} />
        </clipPath>
        {/* body reads as a solid object, not a wire */}
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BODY_TOP} />
          <stop offset="1" stopColor={BODY_BOTTOM} />
        </linearGradient>
        <linearGradient id={groundId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={STRUCT} stopOpacity="0" />
          <stop offset="0.3" stopColor={STRUCT} stopOpacity="0.55" />
          <stop offset="0.7" stopColor={STRUCT} stopOpacity="0.55" />
          <stop offset="1" stopColor={STRUCT} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={shadowId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.06" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {sweep && (
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5b0202" stopOpacity="0" />
            <stop offset="0.5" stopColor="#5b0202" stopOpacity="0.08" />
            <stop offset="1" stopColor="#5b0202" stopOpacity="0" />
          </linearGradient>
        )}
      </defs>

      {showShadow && (
        <g className="car-shadow">
          <ellipse cx="610" cy="452" rx="400" ry="16" fill={`url(#${shadowId})`} />
          <rect x="240" y="451.5" width="840" height="1" fill={`url(#${groundId})`} />
        </g>
      )}

      {/* Ghost silhouette — the drawing underlay for the exploded state */}
      <g className="car-ghost" aria-hidden="true">
        <path d={SILHOUETTE} fill="none" stroke={FAINT} strokeWidth="1" strokeDasharray="4 7" />
      </g>

      {/* Chassis / body-in-white — present from the first frame. Carries the
          structure part id so record diagrams can tint it (never animated —
          only entries in the parts array move). */}
      <g data-part="structure" fill="none" strokeLinecap="round">
        <path d={ROOFLINE} stroke={OUTER} strokeWidth={W} />
        <g stroke={STRUCT} strokeWidth={W}>
          <path d="M 250 380 L 1000 380 M 250 388 L 1000 388" />
          <path d="M 420 380 L 420 388 M 580 380 L 580 388 M 740 380 L 740 388" />
          <path d="M 806 272 L 806 380" />
          <path d="M 320 280 L 320 380" />
          <path d="M 920 344 L 920 322 M 300 344 L 300 322" />
        </g>
      </g>

      {parts.map((p) => {
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
        <g aria-hidden="true" fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="2.2">
          {parts
            .filter((p) => p.label)
            .map((p) => {
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
                    x1={L.lx + (L.tx > L.lx ? 12 : -12)}
                    y1={L.ly - 4}
                    x2={L.tx}
                    y2={L.ty}
                    stroke="rgba(138, 119, 94, 0.55)"
                    strokeWidth="1"
                  />
                  <text x={L.lx} y={L.ly} fill={STRUCT} textAnchor={L.tx > L.lx ? "start" : "end"}>
                    {L.text}
                  </text>
                </g>
              );
            })}
        </g>
      )}

      {damaged && (
        <g aria-hidden="true">
          <g fill="none" stroke="var(--accent-replaced, #8a4a3e)" strokeWidth="1.2">
            <circle cx="1010" cy="352" r="16" />
            <circle cx="1010" cy="352" r="24" strokeDasharray="3 5" opacity="0.7" />
            <path d="M 1010 330 L 1010 344 M 1010 360 L 1010 374 M 988 352 L 1002 352 M 1018 352 L 1032 352" />
            <circle cx="930" cy="286" r="12" />
            <circle cx="930" cy="286" r="19" strokeDasharray="3 5" opacity="0.7" />
          </g>
          <g fontFamily="var(--font-mono)" fontSize="12.5" letterSpacing="1.5" fill="var(--accent-replaced, #8a4a3e)">
            <text x="46" y="60">01 · RF IMPACT — FASCIA / FENDER / LAMP</text>
            <text x="46" y="84" fill={STRUCT}>02 · HOOD REFINISHED</text>
          </g>
          <text x="1010" y="322" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--accent-replaced, #8a4a3e)" textAnchor="middle">01</text>
          <text x="930" y="262" fontFamily="var(--font-mono)" fontSize="11.5" fill={STRUCT} textAnchor="middle">02</text>
        </g>
      )}

      {sweep && (
        <g clipPath={`url(#${clipId})`}>
          <g className="car-sweep">
            <rect x="-40" y="130" width="150" height="330" fill={`url(#${gradId})`} transform="skewX(-16)" />
          </g>
        </g>
      )}
    </>
  );
}
