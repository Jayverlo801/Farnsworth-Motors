/** Shared motion vocabulary. Weighted, not animated. */

/** Default physical easing — decelerates like an object, never bounces. */
export const EASE = [0.2, 0, 0, 1] as const;

export const DURATION = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
} as const;

/** Standard reveal variants for whileInView usage. */
export const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay },
  }),
};

export const viewportOnce = { once: true, margin: "0px 0px -10% 0px" } as const;
