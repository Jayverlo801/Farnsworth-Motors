# HERO SCENE INTERFACE — Shared Contract (Section 0)

(Do not change this. Both the page build and the 3D build depend on it.)

File owned by the 3D build:

```
src/components/hero/three/HeroScene3D.tsx        default export: React.FC<HeroSceneProps>
src/components/hero/three/**                      anything else the 3D scene needs
public/3d/**                                      models, textures, HDRI, poster stills
```

Files owned by the page build (Claude Code):

```
everything else, including:
src/components/hero/Hero.tsx                      orchestrator: chooses 3D vs fallback, owns copy, wordmark, scroll cue
src/components/hero/HeroFallback.tsx              non-WebGL hero (SVG exploded-view assembly + static poster)
src/components/hero/HeroCopy.tsx
src/components/hero/types.ts                      the types below
src/components/hero/three/HeroScene3D.tsx         SHIPS AS A STUB that immediately calls onUnavailable(). The 3D build replaces it.
```

```ts
// src/components/hero/types.ts
export type HeroQuality = "high" | "medium" | "low";
export type HeroMode = "full" | "short" | "static";
//   full   = first visit: complete 0.75s hold + 5–7s assembly + highlight sweep + recede
//   short  = repeat visit: start ~80% assembled, finish in ≤2s
//   static = reduced-motion or low-end: assembled vehicle, no timeline, idle only

export interface HeroSceneProps {
  mode: HeroMode;
  quality: HeroQuality;            // page decides from deviceMemory / hardwareConcurrency / pointer / viewport
  scrollProgress: MotionValue<number>;  // 0 at top, 1 when hero has fully scrolled off; scene drives camera push-in from it
  paused: boolean;                 // page sets true when tab hidden or hero offscreen; scene must stop its RAF loop
  onReady: () => void;             // model loaded and first frame drawn — page crossfades poster → canvas
  onAssembled: () => void;         // vehicle fully assembled — page starts the wordmark reveal
  onUnavailable: (reason: string) => void; // WebGL missing, model failed, or FPS < 30 for 2s — page swaps to HeroFallback
}
```

Rules both sides obey:

- The page never imports three/r3f/drei directly. It only dynamic-imports HeroScene3D with ssr:false.
- The scene never renders copy, the wordmark, buttons, or the scroll cue. That's the page.
- The scene never reads localStorage, prefers-reduced-motion, or window size to make decisions. The page decides and passes mode/quality.
- Design tokens live in src/app/globals.css (page-owned). The scene reads background color from --bg via CSS variable or receives it as a prop; it does not invent colors.
- The poster image public/3d/hero-poster.webp (2400×1350) is produced by the 3D build and consumed by the page as the LCP element and as the static hero.
