# 3D build queue

## Previous: v2 build snapshot

Uploaded as d732b47. Remaining acceptance limitations are recorded in README.md;
unavailable physical-device testing is not treated as passed.

## Current: Porsche 911 GT3 RS hero replacement

Jay's latest instruction replaces the fictional coupe with a Porsche 911 GT3 RS
and makes the hero substantially larger, cinematic, sleek, and luxurious.

Active direction: [queue/porsche-gt3-rs-direction.md](queue/porsche-gt3-rs-direction.md).

Status: Jay chose original Blender modeling. A custom GT3 RS-inspired model now
exists at `assets/3d/source/gt3rs-study/gt3rs-study.blend`, with 58 animated
components, 2400 × 1500 inspection renders, and three verified web LODs under
`public/3d/gt3rs-study/`. See that source folder's README and verification report.

The active homepage still loads the earlier coupe. Next is hero integration:
bind the new 58-part manifest, match lighting/poster/fallback, map record IDs,
and retest runtime behavior. Do not describe the model deliverable as a finished
homepage replacement. The new geometry is an artistic interpretation, not CAD.

## Paused: v3 generic-coupe alignment and stills

Full supplied prompt: [queue/v3-prompt.md](queue/v3-prompt.md).

Preserve the local work as a checkpoint. Its generic-coupe silhouette and
exploded-position targets are superseded for the new hero. Do not spend further
render time polishing the generic car. Process stills and record diagrams must
be revisited after the Porsche asset is selected if they are to depict the same
vehicle. The current local stills are draft assets, not accepted deliverables.

Keep the shared HeroSceneProps interface unchanged and respect the existing
page/scene ownership boundary. Page-side integration approval remains pending.
