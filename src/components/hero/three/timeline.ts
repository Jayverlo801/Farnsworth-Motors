import { PARTS } from "./parts";

export type TimelineMode = "full" | "short" | "static";
export const FULL_ASSEMBLED = 7;
export const FULL_END = 9;
export const SHORT_ASSEMBLED = 1.18;
export const SHORT_END = 1.95;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

/** Inverts the X curve of cubic-bezier(.2,0,0,1); monotonic, no overshoot. */
export function physicalEase(x: number): number {
  x = clamp01(x);
  let lo = 0, hi = 1, t = x;
  for (let i = 0; i < 14; i++) {
    const bx = .6 * (1 - t) * (1 - t) * t + t * t * t;
    if (bx < x) lo = t; else hi = t;
    t = (lo + hi) * .5;
  }
  return x === 0 || x === 1 ? x : 3 * (1 - t) * t * t + t * t * t;
}

export function partProgress(index: number, time: number, mode: TimelineMode): number {
  if (mode === "static") return 1;
  const part = PARTS[index];
  if (mode === "short") {
    const start = (part.start - .9) * .08;
    return .80 + .20 * physicalEase((time - start) / .72);
  }
  return physicalEase((time - part.start) / part.duration);
}

export function completionProgress(time: number, mode: TimelineMode): number {
  if (mode === "static") return 1;
  const start = mode === "full" ? FULL_ASSEMBLED : SHORT_ASSEMBLED;
  const end = mode === "full" ? FULL_END : SHORT_END;
  return clamp01((time - start) / (end - start));
}

/** Reaches the paint by 80%, then travels only another 1%. */
export function pushProgress(scroll: number): number {
  const s = clamp01(Number.isFinite(scroll) ? scroll : 0);
  return s <= .8 ? .99 * smoothstep(s / .8) : .99 + .01 * smoothstep((s - .8) / .2);
}

/** Two consecutive seconds below 30 FPS; reset after pauses or shader compilation. */
export class FrameHealth {
  private elapsed = 0;
  private frames = 0;
  private slowTime = 0;
  reset() { this.elapsed = 0; this.frames = 0; this.slowTime = 0; }
  sample(delta: number): { fps: number; unavailable: boolean } | undefined {
    if (!Number.isFinite(delta) || delta <= 0) return;
    this.elapsed += delta;
    this.frames++;
    if (this.elapsed < .5) return;
    const fps = this.frames / this.elapsed;
    this.slowTime = fps < 30 ? this.slowTime + this.elapsed : 0;
    this.elapsed = 0; this.frames = 0;
    return { fps, unavailable: this.slowTime >= 2 };
  }
}
