# 3D build queue

## Previous: v2 build snapshot

Uploaded as d732b47. Remaining acceptance limitations are recorded in README.md;
unavailable physical-device testing is not treated as passed.

## Current: Porsche 911 GT3 RS hero replacement

Jay's latest instruction replaces the fictional coupe with a Porsche 911 GT3 RS
and makes the hero substantially larger, cinematic, sleek, and luxurious.

Active direction: [queue/porsche-gt3-rs-direction.md](queue/porsche-gt3-rs-direction.md).

Status, 2026-09-08: Jay now requests **"Build something equivalent to that"**
after reviewing a detailed GT3 RS model candidate. Proceed with original
reference-led Blender modeling, not a purchase dependency. The revision is now
built for review, using published Porsche dimensions and visual references.
The editable source retains the 58-part animation structure and studio
pipeline. Its source, renders, animation, and optimized web models are checked
together. Numeric checks are not user visual acceptance.
The full-detail source and native movie are ready for review. The smallest web
LOD remains a draft because of visible surface degradation; selective retopology
is required before homepage use.

Update, 2026-09-09: Jay explicitly approved connecting the Porsche to the page
and starting the local server. The homepage now loads the reference-led GT3 RS,
animates its actual 58-part manifest, retains authored materials, and uses a
matching WebGL-captured still for fallback. The low LOD stays out of production.
See `qa/gt3rs-local.mjs` for repeatable homepage verification. This is not factory
CAD or a verified exact replica; final visual approval remains with Jay.

## Paused: v3 generic-coupe alignment and stills

Full supplied prompt: [queue/v3-prompt.md](queue/v3-prompt.md).

Preserve the local work as a checkpoint. Its generic-coupe silhouette and
exploded-position targets are superseded for the new hero. Do not spend further
render time polishing the generic car. Process stills and record diagrams must
be revisited after the Porsche asset is selected if they are to depict the same
vehicle. The current local stills are draft assets, not accepted deliverables.

Keep the shared HeroSceneProps interface unchanged. Page-side integration was
approved for this Porsche replacement; preserve unrelated page/record work.
