# Porsche 911 GT3 RS — cinematic reconstruction hero

## Authority and status

Jay's latest instruction: replace the hero car with a Porsche 911 GT3 RS and
make its 3D assembly feel massive, beautiful, premium, luxurious, and sleek.
This supersedes the earlier fictional-coupe identity and its silhouette target.
Preserve useful rendering, lifecycle, accessibility, and performance work.

Working assumption, awaiting confirmation: 992-generation GT3 RS, restrained
silver/graphite bodywork with carbon details. No specific model year, factory
paint name, Weissach package, or ownership/inventory claim has been approved.

Updated instruction: Jay explicitly chose **original Blender modeling**, asking
for a similar, high-quality car. The purchasing dependency is removed. A custom
GT3 RS-inspired model is now authored at
`assets/3d/source/gt3rs-study/gt3rs-study.blend`, with 58 animated components,
studio renders, and verified web LODs. This is an artistic interpretation, not
factory CAD or an exact replica. No third-party mesh was purchased or imported.

Homepage integration and user visual acceptance are still pending. Do not
relabel the old generic GLBs, poster, diagrams, or stills. The sourcing notes
below are historical research, not a remaining requirement to buy an asset.

## Visual thesis

A full-scale automotive sculpture emerging from a dark studio: recognizable
GT3 RS geometry, broad controlled reflections, precise assembly, then a quiet
hero pose. The car is the dominant visual object, not a small diagram.

- Compose from a low three-quarter view. Keep the nose, oval headlamps, rear
  haunches, and distinctive swan-neck rear wing readable together.
- Aim for roughly 80–90% desktop viewport width, constrained by the actual
  model's projected height and the page's text-safe regions. This is a new
  target to validate, not an assertion that the old 62%-wide SVG stage matches.
- Fit the full car on mobile; derive framing independently for portrait. Do not
  obtain the mobile pose by cropping a landscape poster with object-fit: cover.
- Keep the existing graphite palette. Use long soft highlights to describe
  silver paint, fine carbon surfaces, glass, rubber, and machined wheels.
- Preserve shadow detail and the contour of the wing. Avoid black-crushed
  bodywork, blown-out paint, heavy fog, neon accents, particles, or aggressive
  bloom. No mirror floor or additional page ornament is requested.
- Give the finished vehicle a substantial hold. Any cursor response is subtle;
  no perpetual turntable or gratuitous camera orbit.

## Assembly direction

Retain the full / short / static modes and existing callbacks. The full visit
remains within the existing 7–9 second envelope; repeat visits finish under two
seconds; reduced-motion shows the assembled car without an assembly timeline.

1. A short readable hold establishes the exploded sculpture and its structure.
2. Structural and interior groups settle, followed by the major body panels.
3. Wheels, lamps, glazing, and aero finish in a deliberate sequence. Give the
   rear wing an explicit animation group; the legacy coupe has no equivalent.
4. Ease into exact panel gaps without bouncing or overshoot. Use coherent
   trajectories and modest rotations, not random flying fragments.
5. A restrained light pass reveals the finished surfaces; settle into the
   large final pose and fire onAssembled after the real assembled frame.

This is artistic assembly, not a representation of Porsche manufacturing or a
particular vehicle's repair history. Do not invent hidden mechanical systems
or inspection evidence to make the sequence seem technically authentic.

## Model intake — historical purchase-path notes

- Prefer an editable .blend, .fbx, or .glb, with all referenced textures.
- Confirm it is the selected GT3 **RS**, not a GT3, GT3 R, older generation, or
  Manthey variant unless Jay selects that specification.
- Inspect separate body panels, wheels/tires, glazing, lamps, wing supports,
  main wing, and upper aero element. A fused sculpture cannot perform the
  requested assembly without substantial remodeling.
- Inspect topology and shading at hero scale: headlamps, wheel arches, hood
  openings, panel gaps, wing profile, wheel detail, and interior visibility.
- Record creator, source URL, license, attribution requirements, and permitted
  commercial web use. Check browser-delivered model distribution separately
  from permission to publish rendered images. A marketplace's royalty-free
  label alone is not confirmation of every intended use.
- Keep purchased/source files out of public GitHub unless the license permits
  redistribution. The earlier request to upload the project does not authorize
  exposing restricted third-party source assets.
- Do not purchase an asset, create an account, accept a license, or bypass a
  download login without the necessary user participation/authorization.

## Sources inspected — candidates, not approved assets

Checked 2026-09-08. Prices, availability, and terms may change.

- [Porsche's GT3 RS reference](https://newsroom.porsche.com/en/2022/products/porsche-911-gt3-rs-world-premiere-29177.html):
  primary visual/design reference. The wing extends above the roof; preserve
  its correct relationship to the body. Reference access is not a model or
  photography reuse license.
- [YONEEKA's 992 GT3 RS](https://www.turbosquid.com/FullPreview/2170013):
  listing describes detailed interior/exterior, opening doors, material labels,
  and a Blender version. Candidate for inspection; price, exact license,
  independently separable aero, and delivered topology need verification.
- [patriccars3d's 992 GT3 RS](https://www.cgtrader.com/3d-models/car/sport-car/porsche-911-gt3-rs-992-63149c23-df47-4af5-9eea-8a70c2e9b37a):
  listed at $19.99 with BLEND/FBX/OBJ and textures, labeled royalty free.
  Separate assembly groups and suitable web distribution rights are unverified.
- [Black Snow's GT3 RS](https://sketchfab.com/3d-models/porsche-gt3-rs-e738eae819c34d19a31dd066c45e0f3d):
  listing advertises a free CC Attribution download. Actual file, provenance,
  component separation, and license details have not been inspected. Not an
  approved production asset.
- [vecarz's 992 GT3 RS](https://sketchfab.com/3d-models/porsche-992-gt3-rs-2024-wwwvecarzcom-68672d105f2c4e3b8550a741e8836b0c):
  listed CC Attribution-NonCommercial-ShareAlike. Do not use for this commercial
  site without separate permission from the rights holder.

## Integration and acceptance after original modeling

Keep docs/HERO-CONTRACT.md and HeroSceneProps unchanged. The model's animation
groups are internal to the scene; they may extend the old 44-name vocabulary
to include real aero components. Do not create fictitious rear doors on a 911
to satisfy legacy names. Maintain data-diagram compatibility explicitly.

Replace silhouette references from the accepted Porsche model, revise framing
from its measured bounds, and coordinate the matching fallback and portrait
poster with the page owner. Page-owned files remain outside the current edit
boundary until integration is authorized.

Optimize and validate all three LODs against the existing triangle/byte budgets.
If the approved visual fidelity cannot fit, report a measured tradeoff before
changing the budget. Regenerate the poster and any same-car stills only from
the accepted model, lighting, and camera setup. Retest the actual assembly,
mobile framing, reduced motion, poster transitions, failed loads, lost WebGL
context, paused frames, and disposal. Physical-device targets remain untested
until those devices are available.

The local v3 generic stills remain drafts. Known pending issues include text
glyph coverage, the primer macro framing, and page-side asset wiring. They are
not Porsche deliverables and should not be published as completed v3 work.
