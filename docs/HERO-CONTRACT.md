# HERO SCENE INTERFACE — Shared Contract (Section 0)

(The public TypeScript interface below remains unchanged. Jay approved
page-side Porsche integration on 2026-09-09.)

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
src/components/hero/HeroFallback.tsx              non-WebGL hero (matching Porsche still)
src/components/hero/HeroPoster.tsx                shared loading/fallback image
src/components/hero/HeroCopy.tsx
src/components/hero/types.ts                      the types below
src/components/hero/three/HeroScene3D.tsx         live Porsche scene, no longer a stub
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
- The active poster is `public/3d/gt3rs-study/hero-poster.webp` (1317×660), captured from the actual WebGL high-quality static pose and cropped to the vehicle envelope. `HeroPoster` uses the same width/height limits as `frameModel`, without stretching or cropping a desktop composition on mobile. The previous generic-coupe poster is not requested by the homepage.
- The scene animates the 58 stable-pivot parents in `public/3d/gt3rs-study/manifest.json`; their compressed child geometry transforms must remain intact. The page never imports Three.js to interpret the manifest.
- High and medium load their matching Porsche GLB directly. The low GLB remains a visually degraded draft and is not loaded. The page uses the matching still on low-power/mobile devices; the explicit `?3d=on` QA override selects medium on small viewports.
- HDR loading must suspend *inside* Canvas. Suspending the Canvas itself can trigger R3F's delayed renderer cleanup after React development effect reconnection.
