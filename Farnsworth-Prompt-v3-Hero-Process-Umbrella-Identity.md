# Farnsworth Motors — Prompt v3: Hero Fixes · Our Process · The Umbrella · Brand Identity

Paste the block below into Claude Code as a follow-up to the v2 build. It assumes the v2 page, tokens, and hero contract already exist. It does not touch the 3D scene (Codex).

---

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
  - docs/DECISIONS.md updated with every override.
  - Do not stop at mockups. Ship the working experience.
```

---

## Notes for Jay

**What I'd change on the screenshot, in one breath:** the wordmark is sitting on the car, the tracking is too wide, the car is the wrong car (a sedan, not the coupe the 3D brief specifies), the nav pill is brighter than your name, and there's a stray 1px caret at the bottom. Part 1 fixes each with specific numbers so Claude Code can't interpret its way back to the same result.

**On the umbrella:** don't build an "our companies" section. Nobody cares about your org chart. What they care about is that the same building did every step. So the divisions show up as small tags on the six process steps, and only at the very end does a quiet band say "Three shops. Zero handoffs." and show the three lockups once. That's the whole umbrella. Naming: I've gone with Farnsworth Collision and Farnsworth Service instead of Autobody and Mechanic, because that's how BMW and Mercedes name their own departments, and it's the register you're borrowing. If you want different names, they're constants in one file.

**On identity:** the mark concept is an F with a panel-gap shut line running through it, which is the one visual idea that belongs to you and nobody else in this market. Part 3 forces the system to prove itself off-screen (window sticker, record cover sheet, plate frame, shop signs), because a brand that only exists on a homepage isn't one.

**Two disagreements to expect from Claude Code:** it may want to add more colors or a fourth motion curve. Say no; the restraint is the brand.
