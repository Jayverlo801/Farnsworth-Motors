# Photography Manifest

Real photography does not exist yet. Every imagery slot renders a designed
placeholder (dark studio gradient, soft floor falloff, faint coupe
silhouette, mono caption) at the exact ratio the final shot needs — see
`src/components/ui/PhotoFrame.tsx`. Replace a slot by setting `src` (or the
vehicle's `media.*` fields) to a file under `public/images/`.

**Global direction:** neutral architecture, concrete, clean studio, dusk,
controlled natural light, dark asphalt, soft reflections, large negative
space. Vehicles photographed like designed objects.
**Never:** dealership lots, balloons, HDR, oversaturation, fake skies, stock,
mechanics smiling at camera, wide shop shots. Macro, controlled, one subject
per frame.

| Slot | Ratio | Where | Direction for the shot |
| --- | --- | --- | --- |
| S2-FEATURED | 16:10 | Homepage — featured vehicle | ¾ front, low key studio or dusk concrete; car fills right two-thirds, negative space left |
| S3-01-SOURCE | 4:3 | Process — Source (MOTORS) | A VIN plate or auction tag under raking light |
| S3-02-INSPECT | 4:3 | Process — Inspect (COLLISION · SERVICE) | A paint-depth gauge or frame-measurement point |
| S3-03-RESTORE | 4:3 | Process — Restore (COLLISION) | Primer-gray quarter panel meeting fresh paint at a masked edge |
| S3-04-VERIFY | 4:3 | Process — Verify (SERVICE) | A hand on a torque wrench, or a lift arm at a control point |
| S3-05-DOCUMENT | 4:3 | Process — Document (MOTORS) | A printed record sheet on a steel bench, mono type visible |
| S3-06-ROAD | 4:3 | Process — Return to Road (MOTORS) | The finished car, ¾ rear, dusk, dark asphalt, large negative space |
| S8-01 … S8-05 | 4:3 | Principles rail | Macro fragments: headlamp edge, brushed trim, tread block, badgeless grille, stitching |
| VEHICLE-{id}-HERO | 21:9 | Vehicle detail hero | Side profile on seamless studio floor, soft top light |
| RECORD-{id}-BEFORE | 4:3 | Record page — intake | Honest intake condition, neutral light, no drama |
| RECORD-{id}-AFTER | 4:3 | Record page — delivery | Same angle as BEFORE, pixel-aligned framing |
| RECORD-DIAGRAM | 1200:500 | Vehicle Record diagram | 3D build renders a top-view part diagram with contract part ids (side elevation ships as default) |
| BA-BEFORE / BA-AFTER | 1200:560 | Homepage before/after slider | Matched tripod position; identical focal length and height — must align to the pixel |
| CARD-{slug} | 4:2.6 | Inventory cards | Front ¾, consistent angle and height across all inventory |
| CTA-FINAL | free | Final CTA background | Single finished vehicle receding into shadow, dark studio |

Until slots fill, the line-art coupe carries the visual system deliberately —
it is the same part vocabulary as the 3D hero (docs/HERO-CONTRACT.md).
