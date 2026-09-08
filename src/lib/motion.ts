/**
 * The Farnsworth motion signature. Three motions. If a component needs a
 * fourth, it doesn't.
 *
 *   seat   — how anything arrives: decelerates like a part seating into
 *            place. Buttons, cards, section headers, record rows.
 *   sweep  — the one-time highlight pass (hero completion, record reveal).
 *   settle — hover/press micro-motion.
 */

export const seat = {
  /** cubic-bezier(0.2, 0, 0, 1) — physical deceleration, no overshoot. */
  ease: [0.2, 0, 0, 1] as const,
  cssEase: "cubic-bezier(0.2, 0, 0, 1)",
  /** ms; pick within range by element weight. */
  duration: { min: 600, max: 900, default: 700 },
  /** px of travel; never more. */
  travel: { min: 8, max: 12, default: 10 },
} as const;

export const sweep = {
  duration: 2400,
  /** --accent-warm at ≤10% opacity. */
  color: "var(--accent-warm)",
  maxOpacity: 0.1,
} as const;

export const settle = {
  duration: 200,
  cssEase: "cubic-bezier(0.2, 0, 0, 1)",
  scale: { rest: 1.0, max: 1.02 },
} as const;

/* ---- legacy aliases (v2 call sites) ---- */

/** @deprecated use seat.ease */
export const EASE = seat.ease;

export const DURATION = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
} as const;

export const viewportOnce = { once: true, margin: "0px 0px -10% 0px" } as const;
