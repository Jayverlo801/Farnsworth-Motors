# Farnsworth reconstruction scene

## Current direction — Porsche 911 GT3 RS

The active requirement is now an **accurate replica of the real Porsche 911
GT3 RS**, with a larger, cinematic luxury presentation. See
[the active brief](queue/porsche-gt3-rs-direction.md). Jay's latest instruction
supersedes the inspired interpretation. The subsequent instruction, "Build
something equivalent to that," authorizes original reference-led Blender
modeling. There is no purchase dependency. Reuse the existing pipeline and
studio work while rebuilding the geometry; visual acceptance and homepage
integration remain separate.

The revised model is at `assets/3d/source/gt3rs-study/gt3rs-study.blend`:
58 separate animated components, 655,700 source triangles, a nine-second native
assembly, and 3000 × 1875 studio renders. Length, body width, wheelbase, track,
and nominal tire diameters are calibrated to Porsche's published 992 GT3 RS
data and verified on the mesh. The individual surfaces remain original reference
modeling, not factory CAD. Web assets and their manifest are in
`public/3d/gt3rs-study/`.

| Reference build LOD | Triangles | Bytes |
| --- | ---: | ---: |
| High | 116,550 | 779,956 |
| Medium | 57,032 | 506,164 |
| Low (draft) | 27,645 | 353,960 |

All 58 part names survive compression as stable-pivot parent groups; each LOD
has 155 material draw meshes. Native geometry/animation, packaged asset checks,
and actual Three.js/meshopt decoding pass. **The homepage now loads these Porsche
assets**, following Jay's explicit page-integration approval on 2026-09-09.
The original studio materials are retained, the 58 stable-pivot parent groups
drive assembly from the Blender manifest, and high/medium load directly without
flashing the old coupe or a degraded low LOD. The generic-coupe alignment task
remains paused; process stills/record diagrams are unchanged by this integration.
The low LOD visibly loses paint/wheel surface quality under studio reflections
and needs selective retopology before hero use; it is explicitly marked as a
draft in the public manifest. Decoder/byte-budget success is not visual approval.

### Local homepage integration (2026-09-09)

Run `npm run dev -- --hostname 127.0.0.1 --port 3000`, then open
`http://127.0.0.1:3000/`. Use `?hero=full` to replay the full assembly even after
the versioned visit flag has been saved; `?hero=static` shows the completed
WebGL pose and `?3d=off` exercises the matching still. The page keeps the public
`HeroSceneProps` interface unchanged.

The active still is `public/3d/gt3rs-study/hero-poster.webp`, captured from this
scene by `qa/capture-gt3rs-poster.mjs`. It is cropped to the actual Porsche
envelope; shared aspect-preserving framing keeps the still and live car aligned
on desktop and mobile. The old generic SVG is no longer a homepage fallback.
Low-power/mobile visitors get the high-detail Porsche still without booting
WebGL. `?3d=on` explicitly selects medium for small-viewport QA.

An inner Suspense boundary keeps HDR loading from disconnecting Canvas and
triggering delayed R3F context destruction in development. The first three
presented frames are excluded from steady-state FPS sampling; a single long
graphics stall cannot count as two seconds of sustained slowness. Repeated
low FPS still unmounts WebGL. The visit flag is versioned so an old coupe visit
does not skip a visitor's first Porsche assembly.

`node qa/gt3rs-local.mjs` exercises the actual Next homepage in an isolated
Edge profile. Captures and its report are saved under ignored `qa/shots/gt3rs/`.
Source, timing and budget checks remain in `pipeline/`. The existing production
build succeeds; the full-repository lint command also sees pre-existing CommonJS
import errors in `assets/inventory/us-bestsellers-2018-2024/package-assets.cjs`.
The changed hero and QA files are checked separately.

Verified locally: first/repeat visits, static WebGL, mobile still, forced mobile
medium WebGL, forced fallback, reduced motion, missing WebGL, failed model fetch,
offscreen pause/resume, forced context loss, and induced low FPS. Seven timeline/
health tests and the model budgets pass. Scene code is 84,445 bytes gzip with
Three.js externalized. The actual Codex preview was refreshed and checked as
`data-hero-state="ready"`, `data-hero-model="gt3rs-reference-build"`, with one
live canvas after assembly. GPU-backed Edge checks had no runtime errors;
upstream Clock/ANGLE warnings remain. An isolated agent-browser session hit a
graphics-context failure; the actual preview and the separate Edge suite were
verified independently. Physical Safari/iPhone/M1 testing is still outstanding.

The refinement pass reshapes the body and greenhouse, lowers and narrows the
wing, adds forged-section Y-spoke wheels and molded tire detail, and replaces
the lamps with recessed projector assemblies. Surface-conforming GT3 RS
graphics, rear lettering, fuel-flap detail, shaped bucket seats, cabin cards,
and a headliner are modeled. Painted skins have independent thickness so trim
and decals do not inflate. The studio uses controlled narrow light cards and
a matte infinity cove. The motion preview is 1280 × 800 at 30 fps. These visual
changes are inspected in actual Blender renders; automated checks are not
treated as proof of photorealism.

The measurements and implementation notes below describe the historical **v2
checkpoint**, not the current Porsche integration or its visual acceptance.

## V2 checkpoint

Local v2 implementation against the unchanged `HeroSceneProps` in `../types.ts`.
`HeroScene3D.tsx` is the default-exported, client-only drop-in. The page continues
to own copy, visit/accessibility decisions, quality selection, and fallback UI.

## Delivered assets

Original fictional grand-touring study made in Blender 4.5, with no imported
vehicle mesh, stock image, badge, or branded CAD source. The mesh and generated
assets use this repository's MIT license; provenance is in
`public/3d/LICENSES/Farnsworth-coupe.txt`. This is an illustration, not an actual
inventory vehicle or repair record.

The editable `pipeline/hero-coupe.blend` contains the high-detail source and
packed ambient-occlusion image. `pipeline/build_coupe.py` reproduces the mesh,
1024-square AO bake, and three LOD exports. Intermediate GLBs stay under
`pipeline/source/` and are ignored; they are not public downloads.

| LOD | Triangles | GLB bytes, including AO | Brief limits |
| --- | ---: | ---: | --- |
| High | 85,560 | 712,224 | 120,000 / 2,500,000 bytes |
| Medium | 44,442 | 537,344 | 60,000 / 1,500,000 bytes |
| Low | 20,486 | 391,884 | 30,000 / 800,000 bytes |

All LODs preserve **44 independently addressable part names**. The v2 brief says
43, but its explicit list contains 44; none were dropped. Its `door_RL` and
`door_RR` names are retained as fixed rear coach panels on the coupe.

The three GLBs use meshopt compression, quantization, clearcoat, and embedded
WebP AO. A high visit downloads low + high (1,104,108 model bytes total), while
medium downloads low + medium (929,228 bytes). Static also starts with low.
There is no external environment-map request.

`public/3d/hero-poster.webp` is 2400 × 1350, 22,784 bytes. It is captured directly
from the high-quality WebGL static/final pose with the same camera, palette,
fog and lighting, not independently lit in Blender. Re-render it after changes
to the model or scene. It matches the assembled pose, not the intentionally
exploded first frame of full mode; that mode necessarily changes silhouette
during the page's crossfade. Low/high detail and GPU-driver differences can
also create small pixel differences.

## Runtime behavior

- Full: 0.9-second hold; staggered structure, interior, body, identity; assembled
  callback at 7 active seconds; sweep, seven-degree vehicle yaw and shadow
  recession complete at 9 seconds.
- Short: every part starts 80% home; assembled callback at 1.18 active seconds;
  entire completion beat finishes at 1.95 seconds.
- Static: assembled/final lighting from the first drawn model frame; ready and
  assembled callbacks occur in that frame. Demand rendering, no idle timeline.
- Scroll: approaches a continuous hood patch. The last 20% of input traverses
  only 1% of camera distance, avoiding a seam/cabin intersection at the handoff.
- Mouse events provide at most 1.5 degrees of parallax after assembly. Touch
  events do not provide parallax; static mode also has none.
- Paused: `frameloop="never"`, no drawing; retains the model and playback time.
  Resuming resets timing/health samples instead of counting the pause as a stall.
- Loads low first and calls ready only after a real draw, then fetches and warms
  the requested upgrade. No shared `useGLTF` resource cache.
- DPR caps: high 2, medium 1.5, low 1; reduces toward 0.8 on slow frames.
  Sustained sub-30 FPS for two seconds reports `low-fps` and unmounts the scene.
- WebGL absence, context loss, fetch/parse failure, missing parts, missing color
  tokens and scene errors report unavailability once, then render nothing.
- Abort/dispose ownership covers fetched models, textures/image bitmaps,
  materials and geometries. R3F owns the Canvas renderer and declarative
  lights/environment/shadow resources. The low model is retained until unmount.

Background, fog, rubber, glass, fabric, metal and lighting use page CSS tokens.
Only the expressly allowed paint value is scene-defined: `#9A9C9E`, roughness
0.45, metalness 0.6, clearcoat 1, clearcoat roughness 0.1. Three neutral softboxes
provide the environment; rectangular key/rim lights and a warm completion
sweep provide lighting. One analytic soft shadow replaces real-time shadow maps.

## Verification and limitations

Verified locally on Windows with GPU-backed headless Edge / NVIDIA RTX 3060:

- Six unit tests cover the exact names, timelines, easing, scroll clamping and
  sustained-low-FPS detection.
- Each optimized GLB passes part-name, triangle, byte, meshopt and AO checks.
- Standalone scene bundle: **81,203 bytes gzip**, against a 250,000-byte limit.
  Measurement externalizes only `three` and `three/*`; React, R3F and used Drei
  dependencies are included. This is not the full page's JavaScript budget.
- Browser tests pass full/short/static callbacks, low-to-high swap, pause/resume,
  demand rendering, disposal/unmount, failed fetch, no WebGL, forced context loss,
  and deliberately induced low FPS. Latest short-medium assembly: 1,149 ms.
  Desktop GPU samples varied roughly 60–109 FPS; these are local checks, not
  target-device benchmarks.
- Page integration passed desktop, mobile-sized, forced fallback, and reduced
  motion overriding `?hero=full`, with no browser errors or horizontal overflow.
  Each path stopped drawing when the hero left view.
- `npm run build` and lint passed during this handoff.

**Not yet accepted against every v2 requirement:**

1. KTX2/Basis textures are not delivered. This pass ships embedded WebP AO, not
   a KTX2 primary plus WebP fallback. A native encoder installation was canceled
   and was not retried. Wire budgets pass, but GPU texture compression remains
   a follow-up; do not describe this as full texture-pipeline compliance.
2. No physical M1 MacBook Air or iPhone 12 was available. Mobile viewport tests
   on desktop hardware are not evidence of iPhone performance. Safari/iOS,
   real mobile memory behavior, and hardware FPS acceptance remain open.
3. The original procedural car is a stylized engineering study. Final visual
   approval, including any v3 composition match, remains separate from runtime
   correctness. Claude is concurrently changing page-owned hero layout/copy;
   integration captures describe the tested v2 layout, not a finalized v3 page.
4. Development output includes an upstream R3F `THREE.Clock` deprecation warning
   and an ANGLE shader precision warning on this GPU. Neither caused a render
   or test failure; no dependency patch or warning suppression was applied.

Small page-owned repairs were made under Jay's later instruction to build on
and fix the existing work: contract-token aliases, poster/canvas crossfade,
visibility/timeout handling, deferred QA-switch state, and a `ScrollScale`
hydration fix that keeps its scroll target mounted under reduced motion.
No shared interface changes, deployment, push, or broad rewrite were performed.

## Reproduce

Run from the repository root. Runtime dependencies are already in the existing
package manifest. Build-only tools used: Blender 4.5.0, glTF Transform CLI 4.5.0,
esbuild 0.28.2, Playwright and Sharp. Keep optional pipeline tools in a separate
tool directory if not already installed; do not replace the project's lockfile.
`FM_ESBUILD` and `FM_PLAYWRIGHT` accept absolute module paths.

```powershell
blender --background --python src/components/hero/three/pipeline/build_coupe.py

foreach ($lod in @('high', 'medium', 'low')) {
  gltf-transform optimize "src/components/hero/three/pipeline/source/coupe-$lod-raw.glb" "public/3d/coupe-$lod.glb" --compress meshopt --flatten false --join false --instance false --palette false --simplify false --texture-compress webp --texture-size 1024
}

node src/components/hero/three/pipeline/check-code.cjs
node src/components/hero/three/pipeline/check-models.cjs
npm run lint
npm run build
```

Never flatten/join the model: animation depends on its named nodes.

In a retained terminal, run `node src/components/hero/three/pipeline/serve-preview.cjs`
to serve the isolated scene on 127.0.0.1:4310. Restart this test server after
scene changes because it bundles once on startup. In another terminal, run:

```powershell
node src/components/hero/three/pipeline/browser-tests.cjs
```

This also regenerates the poster from the static high-quality scene. With the
normal Next development server running, run
`node src/components/hero/three/pipeline/integration-tests.cjs` for page checks.
`FM_PREVIEW_URL` can point that test at another local server. Reports, test
bundles and screenshots are under ignored `pipeline/verification/`.
