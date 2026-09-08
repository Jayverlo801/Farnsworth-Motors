FARNSWORTH MOTORS — 3D BUILD V3: SCENE ALIGNMENT, PROCESS STILLS, RECORD DIAGRAM

You are the 3D interaction designer and WebGL engineer on the Farnsworth
Motors site. You own src/components/hero/three/** and public/3d/** and
nothing else. The page build (Claude Code) has refined the hero
composition, rebuilt the Our Process section, and created the brand
identity. Your job in v3 is to make the 3D layer match that work exactly
and to supply the rendered assets the page now has slots for.

Read first, in this order:
  docs/HERO-CONTRACT.md                        (unchanged — do not alter)
  public/3d/reference/coupe-side.svg           the coupe you must match
  public/3d/reference/coupe-side-exploded.svg  the exploded offsets
  public/3d/reference/hero-composition.json    the box the car must fill
  public/images/MANIFEST.md                    the still slots to render
  src/app/globals.css                          tokens; no other colors

If any of those files is missing, stop and report it; do not guess.

════════════════════════════════════════════════════════════════════════
PART 1 — ALIGN THE SCENE TO THE PAGE
════════════════════════════════════════════════════════════════════════
1. PROPORTIONS. The model's side silhouette must match coupe-side.svg:
   overlay a render of the model (orthographic side view) on the SVG and
   iterate until the roofline, hood length, wheelbase, overhangs, and
   greenhouse height deviate by < 2% of body length. Put the overlay
   comparison in src/components/hero/three/README.md.

2. FRAMING. At every mode, the assembled car's screen-space bounding box
   must sit inside carBox from hero-composition.json (±3%), with the tire
   contact line at groundlineY. Nothing from the scene may enter
   wordmarkBand — the page draws the wordmark there. Derive the camera
   from these numbers rather than hand-tuning; recompute on resize.

3. CHOREOGRAPHY. The exploded start positions must correspond to the
   offsets in coupe-side-exploded.svg (same part, same axis, scaled to
   3D). The page's fallback and your scene should look like the same
   film shot two ways. Stage order and timings stay as in the contract.

4. LIGHT HIERARCHY. The page has demoted the nav CTA and added a light
   sweep token (--accent-warm at ≤10%). Your completion-beat sweep uses
   that color and intensity. Background and fog read --bg at runtime.

5. GROUND. Match the fallback: one hairline at the contact patch fading
   over 30% of its length each side, plus a soft elliptical contact
   shadow. No reflective floor.

6. POSTER. Re-render public/3d/hero-poster.webp (2400×1350) from the new
   camera so it is pixel-compatible with the fallback layout; verify the
   crossfade poster → canvas is invisible at 1440×900 and 390×844.

════════════════════════════════════════════════════════════════════════
PART 2 — RENDER THE PROCESS STILLS (replace "PHOTOGRAPHY PENDING")
════════════════════════════════════════════════════════════════════════
Real photography does not exist yet. Render the six Our Process frames
from the same model, materials, and studio, at the exact slot sizes in
MANIFEST.md, into public/images/process/01..06.{avif,webp} (2× and 1×).
Stay macro and controlled — one subject per frame, large negative space,
dark studio, no people. Direction per frame:
  01 SOURCE   — a VIN-plate-style stamped tag on the door jamb, raking
                light, 60% of frame empty
  02 INSPECT  — a measurement point on the subframe with a thin
                --accent-intact indicator line and a mono readout
  03 RESTORE  — the RH quarter panel in matte primer meeting satin paint
                at a masked edge, shallow depth of field
  04 VERIFY   — a lift arm at a control point under the sill, single key
                light
  05 DOCUMENT — a printed record sheet on a brushed-steel bench, mono
                type legible, --accent-replaced and --accent-intact
                markers visible on a small diagram
  06 RETURN   — the finished coupe, ¾ rear, dusk exposure, dark asphalt,
                car in the lower third
Also render S1–S6 from the earlier handoff if not yet delivered
(featured-vehicle header, structure-only, OEM panel, record card, dark
front-on, three-state loop) into public/images/brand/.
Every still: same HDRI, same camera rig file, same color pipeline.
Ship the .blend or scene files under assets/3d/source/ (not deployed).

════════════════════════════════════════════════════════════════════════
PART 3 — THE VEHICLE RECORD DIAGRAM
════════════════════════════════════════════════════════════════════════
The page's VehicleRecord component accepts a `diagram` SVG whose element
ids match the contract part names and colors them from record data
(replaced → --accent-replaced, structural/verified → --accent-intact).
Produce public/3d/diagram/coupe-top.svg and coupe-side.svg from the
model: orthographic line drawings, single stroke weight, no fills except
--bg-2 on the body, every panel and structural member as its own element
with its contract id (hood, door_FL, quarter_RR, subframe_F, chassis…).
Keep each under 40 kB. Test by rendering the record with partsReplaced
= [quarter_RR, rear_bumper] and confirm only those two tint.
Do not restyle the record; only supply the diagrams.

════════════════════════════════════════════════════════════════════════
PART 4 — PERFORMANCE RE-CHECK AFTER THE CHANGES
════════════════════════════════════════════════════════════════════════
  - Budgets unchanged: high ≤ 2.5 MB / 120k tris, medium ≤ 1.5 MB /
    60k, low ≤ 0.8 MB / 30k; scene JS ≤ 250 kB gz excluding three.
  - ≥ 60 fps M1 Air at high; ≥ 30 fps iPhone 12 at medium; onUnavailable
    fires correctly on low-fps, no WebGL, context loss, fetch failure.
  - paused stops the RAF loop; dispose on unmount; no leaks across
    route changes (test by navigating / → /brand → / three times).

════════════════════════════════════════════════════════════════════════
DELIVERABLE
════════════════════════════════════════════════════════════════════════
  Updated HeroScene3D.tsx and helpers; new poster; six process stills;
  S1–S6 brand stills; two record diagrams; README with the silhouette
  overlay, the framing math, LOD budgets actually hit, model source and
  license, and every deviation from this brief with a reason.
  Touch nothing outside src/components/hero/three/**, public/3d/**,
  public/images/process/**, public/images/brand/**, assets/3d/source/**.
  Do not stop at renders; wire the scene and verify the crossfade.
