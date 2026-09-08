import type { MotionValue } from "framer-motion";

/**
 * HERO SCENE INTERFACE — shared contract between the page build and the 3D
 * build. Do not change without updating docs/HERO-CONTRACT.md and both
 * builds together.
 */

export type HeroQuality = "high" | "medium" | "low";
export type HeroMode = "full" | "short" | "static";
//   full   = first visit: complete 0.75s hold + 5–7s assembly + highlight sweep + recede
//   short  = repeat visit: start ~80% assembled, finish in ≤2s
//   static = reduced-motion or low-end: assembled vehicle, no timeline, idle only

export interface HeroSceneProps {
  mode: HeroMode;
  /** page decides from deviceMemory / hardwareConcurrency / pointer / viewport */
  quality: HeroQuality;
  /** 0 at top, 1 when hero has fully scrolled off; scene drives camera push-in from it */
  scrollProgress: MotionValue<number>;
  /** page sets true when tab hidden or hero offscreen; scene must stop its RAF loop */
  paused: boolean;
  /** model loaded and first frame drawn — page crossfades poster → canvas */
  onReady: () => void;
  /** vehicle fully assembled — page starts the wordmark reveal */
  onAssembled: () => void;
  /** WebGL missing, model failed, or FPS < 30 for 2s — page swaps to HeroFallback */
  onUnavailable: (reason: string) => void;
}
