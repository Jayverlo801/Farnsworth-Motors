# Farnsworth reconstruction scene

## Current direction — Porsche 911 GT3 RS

The hero direction is now a **Porsche 911 GT3 RS-inspired model**, with a larger,
cinematic luxury presentation. See [the active brief](queue/porsche-gt3-rs-direction.md).
Jay chose original Blender modeling instead of acquiring a marketplace model.

The new editable source is at `assets/3d/source/gt3rs-study/gt3rs-study.blend`:
58 separate animated components, 514,368 source triangles, a nine-second native
assembly, and 3000 × 1875 studio renders. Geometry is an artistic interpretation,
not factory CAD. New web assets and their manifest are in `public/3d/gt3rs-study/`.

| New study LOD | Triangles | Bytes |
| --- | ---: | ---: |
| High | 117,126 | 744,324 |
| Medium | 57,584 | 473,052 |
| Low | 27,563 | 321,856 |

All 58 part names survive compression as stable-pivot parent groups; each LOD
has 134 material draw meshes. Native geometry/animation, packaged asset checks,
and actual Three.js/meshopt decoding pass. **The homepage has not switched to these assets yet.** Its
current GLBs/poster and older v3 draft stills remain the fictional coupe. New
model binding, web lighting/AO, fallback/poster parity, and runtime/device tests
are separate integration work. The generic-coupe alignment task remains paused.

The refinement pass reshapes the hood/fender relationship, tapers the hood,
curves the door seams, cuts real air openings with recessed duct geometry,
slims the wing/diffuser, and adds transmissive glazing and seals. The studio
now has a curved infinity cove. The higher-resolution motion preview is
1280 × 800 at 30 fps. These visual changes are inspected in the actual Blender
renders; automated checks are not treated as proof of photorealism.

The measurements and implementation notes below describe the committed **v2
checkpoint**, not completed Porsche work or acceptance of the local v3 changes.

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
