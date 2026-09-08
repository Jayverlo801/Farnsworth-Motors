# Photography Manifest

Real photography does not exist yet. Every imagery slot renders a designed
placeholder (dark studio gradient, soft floor falloff, faint coupe
silhouette, mono caption) at the exact ratio the final shot needs — see
`src/components/ui/PhotoFrame.tsx`. Replace a slot by setting `src` (or the
vehicle's `media.*` fields) to a file under `public/images/`.

**Global direction:** neutral architecture, concrete, clean studio, dusk,
controlled natural light, dark asphalt, soft reflections, large negative
space. Vehicles photographed like designed objects.
**Never:** dealership lots, balloons, HDR, oversaturation, fake skies, stock.

| Slot | Ratio | Where | Direction for the shot |
| --- | --- | --- | --- |
| S2-FEATURED | 16:10 | Homepage — featured vehicle | ¾ front, low key studio or dusk concrete; car fills right two-thirds, negative space left |
| S3-01-SOURCE | 4:3 | Process — Source | Auction lot at dawn, long lens, single car isolated; no signage |
| S3-02-INSPECT | 4:3 | Process — Inspect | Macro: paint-depth gauge or panel gap under raking light |
| S3-03-RESTORE | 4:3 | Process — Restore | Body shop detail: clamped panel, weld prep, gloved hands; dark background |
| S3-04-VERIFY | 4:3 | Process — Verify | Alignment rack readout or torque wrench on lug, shallow depth |
| S3-05-DOCUMENT | 4:3 | Process — Document | Overhead: printed record, VIN plate, camera tethered; hard shadows |
| S3-06-ROAD | 4:3 | Process — Return to Road | Rear ¾ rolling shot at dusk on dark asphalt, soft reflections |
| S8-01 … S8-05 | 4:3 | Principles rail | Macro fragments: headlamp edge, brushed trim, tread block, badgeless grille, stitching |
| VEHICLE-{id}-HERO | 21:9 | Vehicle detail hero | Side profile on seamless studio floor, soft top light |
| RECORD-{id}-BEFORE | 4:3 | Record page — intake | Honest intake condition, neutral light, no drama |
| RECORD-{id}-AFTER | 4:3 | Record page — delivery | Same angle as BEFORE, pixel-aligned framing |
| BA-BEFORE / BA-AFTER | 1200:560 | Homepage before/after slider | Matched tripod position; identical focal length and height — must align to the pixel |
| CARD-{slug} | 4:2.6 | Inventory cards | Front ¾, consistent angle and height across all inventory |
| CTA-FINAL | free | Final CTA background | Single finished vehicle receding into shadow, dark studio |

Until slots fill, the line-art coupe carries the visual system deliberately —
it is the same part vocabulary as the 3D hero (docs/HERO-CONTRACT.md).
