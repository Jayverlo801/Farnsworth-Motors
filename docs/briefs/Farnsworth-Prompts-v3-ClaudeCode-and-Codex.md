# Farnsworth Motors — v3 Prompts (split)

Two prompts. **Prompt A** goes to Claude Code (page, process, umbrella, identity, plus the reference files Codex needs). **Prompt B** goes to Codex (scene alignment, rendered stills, record diagrams). Run A first; B reads files A exports.

---

## Prompt A — Claude Code

```
FARNSWORTH MOTORS — V3: HERO REFINEMENT, OUR PROCESS, THE UMBRELLA, BRAND IDENTITY SYSTEM

You are the creative director and lead engineer on the Farnsworth Motors
site. The v2 homepage exists. Do not rebuild it. Do not touch
src/components/hero/three/** or public/3d/** (owned by the 3D build).
Everything below is refinement and extension of what is already there.
Read docs/HERO-CONTRACT.md and src/app/globals.css before writing code.
Every color and font still comes from the tokens; you may ADD tokens only
in Part 3 and only as specified.

Treat every "avoid" as a strong default you may override only when you can
write one sentence in docs/DECISIONS.md explaining why the result is
substantially better.

════════════════════════════════════════════════════════════════════════
PART 1 — HERO REFINEMENT (the fallback hero, as currently shipped)
════════════════════════════════════════════════════════════════════════

Current problems, in priority order. Fix all of them.

1. COLLISION. The wordmark sits on top of the car drawing. Two hero
   elements are fighting for the same pixels, so neither reads.
   Fix: give them separate territory. Preferred composition:
   - Car drawing occupies the lower 55% of the viewport, centered,
     baseline at ~82% of viewport height, width ~62% of viewport on
     desktop (max 1100px), ~92% on mobile.
   - Wordmark + tagline + cue occupy the upper band, vertically centered
     in the space above the roofline, never overlapping the drawing.
   - Alternative if it composes better at your aspect ratios: wordmark
     bottom-left, drawing right, both aligned to the same baseline grid.
     Pick one, commit, document.

2. TRACKING. The wordmark is letter-spaced ~0.3em. That reads as a 2012
   luxury template, not Apple/Linear. Set the wordmark at -0.03em
   tracking, weight 600, at display size. "MOTORS" may drop to weight 400
   and --text-2 to create the two-tone lockup already used in the nav.
   "BUILT AGAIN." moves to weight 500, -0.01em, size ~1.25rem, --text-2,
   sentence case is acceptable ("Built again.") — test both and pick.
   The scroll cue keeps mono uppercase but at 0.10em, not 0.3em.

3. THE DRAWING. The current silhouette is a soft four-door sedan with an
   undersized trunk, uneven line weights, and a double outline on the
   roof. It does not match the 3D brief (brand-neutral GT coupe: long
   hood, fastback, wide stance, two doors). Redraw it:
   - Side elevation, two-door coupe, fastback roofline into a short
     Kamm-style tail, hood roughly 1.15× cabin length, wheels pushed to
     the corners, low greenhouse, no badges, no recognizable marque.
   - One stroke weight (1px at 1×, 1.5px at 2×), color --text-3 for
     structure lines and --text-2 for the outer silhouette. Fills at
     --bg-2 with a 10% vertical gradient to --bg so the body reads as a
     solid object, not a wire.
   - Part groups keep the contract names; make the door, hood, and
     quarter panel cut lines visible as hairlines so the exploded state
     reads as an engineering drawing when the parts separate.
   - Ground: a single 1px hairline at the tire contact patch, fading out
     to both sides over 30% of its length, plus a very soft elliptical
     contact shadow (radial gradient, 6% opacity). No reflection.

4. HIERARCHY OF LIGHT. Right now the "VIEW VEHICLES" pill in the nav is
   the brightest object on screen and pulls the eye off the wordmark.
   In the hero state, render that pill as a ghost button (1px --line-
   strong border, --text-2 text). It becomes filled only after the nav
   switches to its scrolled state.

5. THE STRAY CARET. There is a 1px vertical artifact centered near the
   bottom of the viewport (likely the scroll cue's line or a focus
   outline). Find it and either make it intentional (a 24px hairline
   under the cue that draws in over 800ms) or remove it.

6. TIMING. On first visit the drawing should assemble over ~5s, then
   the wordmark emerges (900ms rise + fade), then the tagline (300ms
   later), then the cue. On repeat visits everything is in place within
   1.5s. Verify with a screen recording that the sequence reads
   curiosity → recognition → identity, not everything-at-once.

7. AFTER THE HERO. As the user scrolls, the drawing scales 1.0 → 1.18
   and translates down 8vh while its opacity goes 1 → 0 across the
   hero's scroll range, and the Brand Statement headline rises into the
   band the wordmark just vacated. One motion, not two.

════════════════════════════════════════════════════════════════════════
PART 2 — OUR PROCESS + THE UMBRELLA (one section, one idea)
════════════════════════════════════════════════════════════════════════

THE INSIGHT
Farnsworth is one name over three operations: a dealership, a collision
and paint shop, and a mechanical shop. Most rebuilt-title sellers buy a
car someone else fixed. Farnsworth does every step itself. Do not present
the three operations as a separate "our companies" section with three
cards. Reveal them THROUGH the process: each step is tagged with the
operation that performs it, and by the end the visitor has met all three
without being introduced to any of them.

NAMING (use these unless Jay renames them; keep them as constants in
src/lib/brand.ts so a rename is one edit)
  FARNSWORTH MOTORS       — sales, documentation, the consumer brand
  FARNSWORTH COLLISION    — body, paint, structural evaluation
  FARNSWORTH SERVICE      — mechanical inspection, repair, verification
  Short labels for tags: MOTORS · COLLISION · SERVICE
  Do not use "Autobody" or "Mechanic" as brand names; they describe a
  trade, not a division. "Collision" and "Service" are how the premier
  brands name their own departments, which is the register we want.

SECTION STRUCTURE — src/components/sections/RestorationProcess.tsx
(rebuild it; the v2 version is a placeholder)

Header
  label: OUR PROCESS
  headline: FROM ARRIVAL TO ROAD.
  lede: Six steps. One name on every one of them.

Desktop: sticky-scroll sequence. Left column (40%) is sticky and holds
the current step's number, name, operation tag, and copy. Right column
(60%) is a tall scroll track of six full-height image frames; as each
frame crosses the viewport center, the left column's content crossfades
to that step (opacity + 12px rise, 500ms, physical easing). A thin
vertical progress rule between the columns fills as the user moves
through the six steps, with six tick marks. Mobile: vertical stack,
image above copy, no sticky, the progress rule becomes a horizontal
row of six ticks pinned under the nav.

The six steps (copy is final unless you can make it shorter)
  01  SOURCE                                        tag: MOTORS
      We look for vehicles where the damage, the market value, and the
      repair economics all make sense. Most don't. Those we pass on.
  02  INSPECT                                       tag: COLLISION · SERVICE
      Structure and mechanicals are evaluated before any work begins.
      If the frame was involved, the car does not move forward.
  03  RESTORE                                       tag: COLLISION
      Body, paint, and panel work is done in our own shop with OEM
      parts — the same shop that does collision work for franchise
      brands.
  04  VERIFY                                        tag: SERVICE
      Mechanical inspection, road test, and the rebuilt-title
      inspection Utah requires. Nothing is signed off by someone who
      didn't do the work.
  05  DOCUMENT                                      tag: MOTORS
      What was damaged, what was replaced, what was inspected. It
      becomes the Vehicle Record that travels with the car.
  06  RETURN TO ROAD                                tag: MOTORS
      Priced for what it is: a rebuilt title, done right. Listed with
      the record attached.

The operation tag
  Mono, 0.6875rem, 0.12em tracking, --text-3, preceded by a 6px square
  in --accent at 60% opacity. Two tags on a step are separated by a
  middle dot. As the user passes each step, the tags they have seen
  accumulate in a small legend at the bottom of the sticky column, so
  by step 06 all three names sit there together.

The umbrella lockup — the section's closing beat
  After step 06, a full-width band (min-height 60vh, --bg-2) with:
    label: ONE NAME
    headline: THREE SHOPS. ZERO HANDOFFS.
    then a single horizontal lockup, centered, hairline above and below:
      FARNSWORTH  MOTORS     ·     FARNSWORTH  COLLISION     ·     FARNSWORTH  SERVICE
      with one mono descriptor under each: Sales & Records · Body & Paint · Mechanical & Inspection
    Wordmark treatment: "FARNSWORTH" weight 600 --text, the division
    word weight 400 --text-2, same size (~1.125rem), -0.02em tracking.
    On mobile the three stack vertically with 32px gaps.
    One sentence beneath, --text-2, max 52ch:
      The car you buy from Farnsworth Motors was inspected by Farnsworth
      Service and rebuilt by Farnsworth Collision. Same building. Same
      people. Same name on the sign.
  This band is the ONLY place the umbrella is explained. Everywhere else
  the divisions appear only as tags (process steps, vehicle record rows,
  footer). Keep it that quiet.

Imagery for the six frames
  Same placeholder system as v2 (dark studio frames, "PHOTOGRAPHY
  PENDING" mono caption) but each frame's manifest entry now specifies
  the eventual macro shot:
  01 a VIN plate or auction tag under raking light
  02 a paint-depth gauge or frame-measurement point
  03 a primer-gray quarter panel meeting fresh paint at a masked edge
  04 a hand on a torque wrench, or a lift arm at a control point
  05 a printed record sheet on a steel bench, mono type visible
  06 the finished car, ¾ rear, dusk, dark asphalt, large negative space
  No mechanics smiling at camera. No wide shop shots. Macro, controlled,
  one subject per frame.

Also: add the operation tags to VehicleRecord.tsx rows (Inspection →
SERVICE, Repair summary → COLLISION, Documentation → MOTORS) and to the
footer as a single mono line under the entity name:
  Motors · Collision · Service — Salt Lake City, Utah

════════════════════════════════════════════════════════════════════════
PART 3 — BRAND IDENTITY SYSTEM (make it real, make it reusable)
════════════════════════════════════════════════════════════════════════

Build the identity as code and as a living page at /brand (noindex),
so every future page, ad, and document derives from one source.

3.1 THE MARK
Design a monogram mark to sit beside the wordmark in tight spaces
(favicon, plate frame, window sticker, social avatar). Constraints:
  - Built from the letter F and one idea from the brand: the panel gap.
    Concept to execute: an F whose horizontal strokes are separated
    from the vertical by a hairline gap, exactly like a hood or door
    shut line — two pieces that fit precisely. Geometric, single stroke
    weight, no gradients, no shield, no wings, no wrench, no road.
  - Must survive at 16px (favicon) and at 2m (shop sign). Provide SVG
    at three optical sizes (small: gap widens; large: gap tightens).
  - Provide: mark alone, mark + wordmark horizontal lockup, mark +
    wordmark stacked lockup, and the three division lockups (Motors,
    Collision, Service) in horizontal form.
  - Export all as SVG into public/brand/ and expose them as React
    components in src/components/brand/.
  - Replace the favicon and the OG image with the new mark/lockup.

3.2 TOKENS — additions only
  Add to globals.css, nothing else changes:
    --accent-intact  #2F6B4F   /* verified / untouched — record + diagrams only */
    --accent-replaced #8A4A3E  /* replaced / repaired — record + diagrams only,
                                  desaturated so it never reads as "sale red" */
  These two colors exist for one job: in the Vehicle Record and any
  damage diagram, green means verified untouched, muted oxide means
  replaced. They never appear on buttons, headlines, or backgrounds.
  Document this rule on the /brand page.

3.3 TYPE SYSTEM — formalize what v2 started
  Display / Headline / Title / Body / Lede / Label / Data — seven
  styles, each with size (clamp), weight, tracking, line-height, and
  the one rule for when to use it. Data is always Geist Mono and is the
  only style allowed for VINs, mileage, prices in records, part numbers,
  and dates. Show every style on /brand with a real Farnsworth sentence.

3.4 MOTION SIGNATURE
  Name it and ship it as src/lib/motion.ts exports:
    seat      — the "part seating" easing used everywhere something
                arrives: cubic-bezier(0.2, 0, 0, 1), 600–900ms, 8–12px
                travel, no overshoot. Buttons, cards, section headers,
                record rows all use seat.
    sweep     — the one-time highlight pass (hero completion, record
                reveal): 2.4s, --accent-warm at ≤10% opacity.
    settle    — hover/press micro-motion: 200ms, scale 1.00→1.02 max.
  Nothing else. If a component needs a fourth motion, it doesn't.

3.5 VOICE — one card on /brand
  Farnsworth sounds like a precise engineer who is proud of the work and
  has nothing to hide. Rules: say the specific thing; short sentences;
  lead with the disclosure, then the deal; never defensive about rebuilt
  titles; plain English, real terms when they carry proof (OEM,
  structural, panel gap).
  Use: rebuilt, record, cosmetic, structural, OEM, in-house, inspected,
  documented, selected.
  Never: salvage (as a selling word), like new, mint, flawless, cheap,
  deal, no-haggle, certified (unless a real program exists), luxury,
  premium, elite.
  Add a Spanish line to the system: "Se habla español." lives in the
  footer and the contact page; if a Spanish-language page is ever built,
  the same voice rules apply, translated, not transliterated.

3.6 APPLICATIONS — render these on /brand as designed artboards
  (static, at real proportions, using the components above):
    a) Vehicle window sticker (8.5×11): lockup, year/make/model, REBUILT
       TITLE stated on line two, price in Data style, a QR to the
       Vehicle Record, the three-division line at the foot.
    b) Vehicle Record cover sheet (8.5×11): the record as a printed
       document — this is the thing a buyer takes home.
    c) License plate frame: mark + "FARNSWORTH MOTORS · SALT LAKE CITY".
    d) Shop sign lockup for Collision and for Service (wide format).
    e) Social avatar (mark) and a 1:1 post template with one headline
       from the Farnsworth Standard.
    f) Business card, front and back.
  These prove the system works off-screen. Keep each artboard to the
  same restraint as the site: negative space, one idea, mono for facts.

3.7 THE /brand PAGE
  Route: /brand, noindex, no nav link. Sections in order: Mark ·
  Lockups · Color · Type · Motion (live demos of seat/sweep/settle) ·
  Voice · Applications · Rules (a short list of "never" items pulled
  from this brief). Build it with the same section components as the
  homepage so it is itself an example of the system. Add a "Download
  all assets" link that zips public/brand/.

════════════════════════════════════════════════════════════════════════
PART 4 — HANDOFF ARTIFACTS FOR THE 3D BUILD (Codex consumes these)
════════════════════════════════════════════════════════════════════════
  The 3D build must match your redrawn coupe and your hero composition.
  Export, and do not skip:
  a) public/3d/reference/coupe-side.svg — the final assembled side
     elevation from HeroFallback, parts as named <g> groups, 1200×500
     viewBox, plus coupe-side-exploded.svg with the parts at their
     exploded offsets. These are the proportion and choreography
     reference for the model.
  b) public/3d/reference/hero-composition.json —
     { "viewport": {"w":1440,"h":900}, "carBox": {"x":0.19,"y":0.45,
       "w":0.62,"h":0.37}, "wordmarkBand": {"y0":0.12,"y1":0.40},
       "groundlineY": 0.82 } — the exact box the car must occupy so the
     WebGL frame and the fallback frame are interchangeable. Fill in the
     real numbers from your final layout.
  c) public/images/MANIFEST.md updated with the six process frames
     (Part 2) and the record diagram slot, each with aspect ratio and
     the shot direction, so the 3D build can render stills into those
     exact slots.
  d) src/components/sections/VehicleRecord.tsx must accept an optional
     `diagram` prop: an SVG (string or component) with part ids matching
     the contract names; the record colors ids listed in
     record.partsReplaced with --accent-replaced and structural ids with
     --accent-intact. Ship it working with the coupe-side.svg as the
     default diagram; the 3D build will supply a top-view version.

════════════════════════════════════════════════════════════════════════
DELIVERABLE + VERIFICATION
════════════════════════════════════════════════════════════════════════
  - Hero fixed per Part 1, verified with desktop (1440×900) and mobile
    (390×844) screenshots at t=0, t=3s, t=6s, and after first scroll.
  - RestorationProcess rebuilt per Part 2 with the umbrella band; tags
    added to VehicleRecord and Footer; src/lib/brand.ts holds names.
  - Identity per Part 3: mark SVGs, lockup components, tokens, motion
    exports, /brand page with all applications, favicon and OG updated.
  - `next build` and `next lint` pass. Lighthouse mobile ≥ 90 on / and
    /brand. Reduced-motion path verified for the new process section.
  - Part 4 reference files exported and committed.
  - docs/DECISIONS.md updated with every override.
  - Do not stop at mockups. Ship the working experience.
```

---

## Prompt B — Codex

```
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
```

---

## Order of operations

1. Claude Code runs Prompt A. When it finishes, confirm `public/3d/reference/` has the two SVGs and the composition JSON, and `public/images/MANIFEST.md` lists the six process slots.
2. Codex runs Prompt B against the same repo. It replaces the stub scene, the poster, and the placeholder stills.
3. If either builder asks to change `docs/HERO-CONTRACT.md`, say no unless both prompts are updated together.
