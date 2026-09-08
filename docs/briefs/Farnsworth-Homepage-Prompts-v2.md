# Farnsworth Motors — Homepage Build Prompts v2

Two prompts, one contract. Paste **Prompt A** into Claude Code. Paste **Prompt B** into Codex. They share the interface in **Section 0**, which both prompts include verbatim so the two builds meet cleanly.

The split: Claude Code builds the entire site *and* the hero's non-3D fallback. Codex builds only the 3D scene, as a drop-in component. Neither touches the other's files.

---

## Section 0 — The shared contract (included in both prompts)

```
CONTRACT — HERO SCENE INTERFACE
(Do not change this. Both the page build and the 3D build depend on it.)

File owned by the 3D build (Codex):
  src/components/hero/three/HeroScene3D.tsx        default export: React.FC<HeroSceneProps>
  src/components/hero/three/**                      anything else the 3D scene needs
  public/3d/**                                      models, textures, HDRI, poster stills

Files owned by the page build (Claude Code):
  everything else, including:
  src/components/hero/Hero.tsx                      orchestrator: chooses 3D vs fallback, owns copy, wordmark, scroll cue
  src/components/hero/HeroFallback.tsx              non-WebGL hero (SVG exploded-view assembly + static poster)
  src/components/hero/HeroCopy.tsx
  src/components/hero/types.ts                      the types below
  src/components/hero/three/HeroScene3D.tsx         SHIPS AS A STUB that immediately calls onUnavailable(). Codex replaces it.

// src/components/hero/types.ts
export type HeroQuality = "high" | "medium" | "low";
export type HeroMode = "full" | "short" | "static";
//   full   = first visit: complete 0.75s hold + 5–7s assembly + highlight sweep + recede
//   short  = repeat visit: start ~80% assembled, finish in ≤2s
//   static = reduced-motion or low-end: assembled vehicle, no timeline, idle only

export interface HeroSceneProps {
  mode: HeroMode;
  quality: HeroQuality;            // page decides from deviceMemory / hardwareConcurrency / pointer / viewport
  scrollProgress: MotionValue<number>;  // 0 at top, 1 when hero has fully scrolled off; scene drives camera push-in from it
  paused: boolean;                 // page sets true when tab hidden or hero offscreen; scene must stop its RAF loop
  onReady: () => void;             // model loaded and first frame drawn — page crossfades poster → canvas
  onAssembled: () => void;         // vehicle fully assembled — page starts the wordmark reveal
  onUnavailable: (reason: string) => void; // WebGL missing, model failed, or FPS < 30 for 2s — page swaps to HeroFallback
}

Rules both sides obey:
  - The page never imports three/r3f/drei directly. It only dynamic-imports HeroScene3D with ssr:false.
  - The scene never renders copy, the wordmark, buttons, or the scroll cue. That's the page.
  - The scene never reads localStorage, prefers-reduced-motion, or window size to make decisions. The page decides and passes mode/quality.
  - Design tokens live in src/app/globals.css (page-owned). The scene reads background color from --bg via CSS variable or receives it as a prop; it does not invent colors.
  - The poster image public/3d/hero-poster.webp (2400×1350) is produced by the 3D build and consumed by the page as the LCP element and as the static hero.
```

---

## Prompt A — Claude Code: the site, the page, the fallback (everything except 3D)

```
FARNSWORTH MOTORS — HOMEPAGE BUILD (PAGE, SYSTEM, FALLBACK — NOT THE 3D SCENE)

You are a senior frontend engineer and product designer with the taste of a
design lead at Apple, Polestar, or Linear. You are building the homepage and
site foundation for Farnsworth Motors. A separate build (Codex) is producing
the 3D hero scene. You will build everything else, including the hero's
orchestration and its non-3D fallback, against the contract below.

Do NOT build, prototype, or stub-with-real-code any Three.js / React Three
Fiber work. Do not install three, @react-three/fiber, or @react-three/drei.
The 3D build owns those.

────────────────────────────────────────────────────────────────────────
[PASTE SECTION 0 — THE SHARED CONTRACT — HERE, VERBATIM]
────────────────────────────────────────────────────────────────────────

WHO FARNSWORTH IS
Farnsworth Motors (Oceans Auto LLC DBA Farnsworth Motors, Salt Lake City,
Utah) finds vehicles with cosmetic damage and unrealized value, restores them
in its own body and mechanical shops with OEM parts, documents the work, and
sells the finished car with a rebuilt title and its history attached.

Central idea: RECONSTRUCTION. Parts becoming a machine. Damage becoming
restoration. The visitor should feel this before reading a sentence.

The brand communicates: We understand the car. We understand what happened
to it. We understand what it took to rebuild it. And we will show you.

It should feel like a serious automotive company that happens to sell rebuilt
vehicles — not a rebuilt-car lot trying to look expensive. Prestige comes from
restraint, documentation, photography, typography and technical competence,
never from luxury language. Reference Apple, Porsche, Rivian, Polestar,
Nothing, Linear, Arc, and the inventory UX of Carvana (their 360° viewer and
imperfection hotspots are the buyer's mental model; build the premium version).

Treat every "avoid" in this brief as a strong default you may override only
when you can articulate why the result is substantially better. Do not
override the contract, the legal guardrails, or the accessibility/performance
requirements.

STACK
- Next.js (App Router), React, TypeScript, Tailwind CSS v4.
- Motion: Framer Motion for interface + scroll-linked animation (useScroll,
  useTransform, whileInView). Do not add GSAP unless you hit a real limit;
  never ship both doing the same job. Lenis is optional and only if scrolling
  stays responsive and accessible.
- Fonts: Geist (sans) + Geist Mono via next/font. No serif anywhere.
- Deploy target: Cloudflare (Workers/Pages via @opennextjs/cloudflare).
  Configure wrangler and build scripts; verify `next build` passes.
- Data: build a typed data layer with a swappable source. Ship a static JSON
  source now and a Supabase adapter (schema SQL included) for later. The
  homepage must consume inventory dynamically, never hard-coded JSX.
- Images: next/image, AVIF/WebP, responsive sizes, lazy below the fold.

DESIGN TOKENS (put in src/app/globals.css; nothing else in the codebase may
introduce a color or font)
  --bg #0B0B0C    --bg-2 #151517    --surface #1D1D20
  --line #26262A  --line-strong #3A3A40
  --text #F4F4F2  --text-2 #99999F  --text-3 #5F5F66
  --accent #B8BCC4 (muted metallic silver, used sparingly — one accent per
  screen at most)  --accent-warm #CFC6B8 (light sweeps only)
  Easing: cubic-bezier(0.2, 0, 0, 1) as the default; no bounce, no elastic.
  Type scale: display clamp(2.5rem, 7.5vw, 6.5rem); headline
  clamp(2.25rem, 5.5vw, 5rem); tight tracking (-0.03em), weight 600, line-
  height ≤ 1.0 for headlines. Mono for labels, VINs, record data — anything
  in mono is a fact.
  No bright dealership red. No gradients that read as "automotive."

PAGE ARCHITECTURE
  src/app/page.tsx
  src/components/navigation/Navigation.tsx
  src/components/hero/{Hero,HeroFallback,HeroCopy,types}.tsx
  src/components/hero/three/HeroScene3D.tsx     ← STUB ONLY (see contract)
  src/components/sections/{BrandStatement,FeaturedVehicle,RestorationProcess,
    VehicleRecord,BeforeAfter,InventoryPreview,WhyRebuilt,
    FarnsworthPrinciples,FinalCTA}.tsx
  src/components/ui/{Button,VehicleCard,SectionHeading,AnimatedText,
    Reveal,Footer}.tsx
  src/lib/vehicles/{types,source,static-source,supabase-source}.ts
  src/lib/motion.ts (shared easings/variants)
  public/images/**  (placeholders — see PHOTOGRAPHY)
  supabase/schema.sql
  docs/{DEPLOY.md,DECISIONS.md,HERO-CONTRACT.md}

HERO — WHAT YOU BUILD
1. Hero.tsx (orchestrator)
   - Decides mode: first visit → "full"; repeat visit (localStorage key
     fm:hero-seen) → "short"; prefers-reduced-motion → "static".
   - Decides quality from navigator.deviceMemory, hardwareConcurrency,
     pointer type, viewport width, and saveData.
   - Renders the poster (public/3d/hero-poster.webp) immediately as the LCP
     element. Dynamic-imports HeroScene3D with ssr:false AFTER the shell is
     interactive. Crossfades poster → canvas on onReady. On onUnavailable
     (or if the scene has not called onReady within 4s) it swaps to
     HeroFallback with no visible jank.
   - Sets paused=true when the tab is hidden or the hero is offscreen.
   - Owns the wordmark reveal: on onAssembled (or on fallback completion),
     "FARNSWORTH MOTORS" emerges — opacity + 8px rise over 900ms, then
     "BUILT AGAIN." beneath it, then "Explore Vehicles" with a thin
     directional cue. Nothing explodes onto screen.
   - Exposes scrollProgress (MotionValue 0→1 across the hero's scroll
     range) to the scene, and uses the same value to fade the hero copy out
     and bring the Brand Statement in so the transition is one movement.

2. HeroFallback.tsx (this is a real deliverable, not a placeholder)
   Build a beautiful non-WebGL version of the concept: an exploded
   engineering drawing that assembles itself. Implementation: a single
   inline SVG, side elevation of a brand-neutral coupe (long hood, fastback,
   wide stance, no badges, no recognizable marque), drawn in thin
   #99999F strokes with near-black fills. Separate <g> groups with the same
   part names as the 3D model: structure, hood, door_L, quarter_R,
   front_bumper, rear_bumper, wheel_F, wheel_R, headlight, taillight,
   glass, trim. In the exploded state each group is offset along a clean
   axis (hood up-forward, doors out, wheels down, glass up, bumpers fore/
   aft) with faint mono part labels and hairline leader lines. On "full"
   mode the groups travel home in the same five stages as the 3D scene
   (structure → interior → body → identity → completion) over ~5s with the
   physical easing, labels fading as each part seats. A single soft light
   sweep crosses the finished drawing. On "short" it finishes in ≤2s. On
   "static" it renders assembled with labels dimmed. Respect
   prefers-reduced-motion at the CSS level too.
   This fallback must look intentional enough that a visitor who never
   gets WebGL still understands the brand. Design it as a deliverable.

3. HeroScene3D.tsx stub
   export default function HeroScene3D({ onUnavailable }: HeroSceneProps) {
     useEffect(() => onUnavailable("3d-not-installed"), [onUnavailable]);
     return null;
   }
   Nothing else in this file. Add a comment: "Replaced by the 3D build."

HERO UX RULES
- First visit runs full; repeat visits run short; persist locally.
- Never block the page shell behind hero loading.
- After assembly, desktop cursor movement creates ≤ 2° of parallax on the
  fallback (CSS transform); on mobile, scroll only. No configurator.
- Scrolling: the assembled vehicle stays anchored while the camera (or, in
  the fallback, a scale transform) pushes toward the paint; the dark surface
  becomes the background of Section 1 as the brand statement fades in.

SECTIONS (in order; this narrative arc is more important than any single
section: curiosity → recognition → transformation → identity → philosophy →
proof → transparency → product → action)

S1 BRAND STATEMENT
  "SOME CARS ARE FINISHED. OTHERS ARE WAITING TO BE FINISHED AGAIN."
  Body: Farnsworth Motors finds vehicles worth saving, restores them
  intelligently, and brings them back to the road with the history
  documented along the way.
  Then four lines animating in individually on scroll:
  Source intelligently. / Restore deliberately. / Document everything. /
  Price realistically.

S2 FEATURED VEHICLE
  One vehicle owns the viewport. Full-bleed photograph, info column left:
  year make model trim; mileage; REBUILT TITLE; price; "View Vehicle →".
  Restrained metadata row: Mileage · Title · Drivetrain · Location.
  Image scales 1.00→1.06 across its scroll range. Pulls from the data
  layer (featured flag).

S3 FROM ARRIVAL TO ROAD
  Six steps, numbered mono labels, each with macro/detail imagery:
  01 SOURCE — We identify vehicles where the damage, market value and
     repair economics make sense.
  02 INSPECT — Damage and structural condition are evaluated before
     restoration begins.
  03 RESTORE — Parts, bodywork and mechanical repairs are completed in our
     own shops with OEM parts.
  04 VERIFY — Repairs are inspected and required rebuilt-title processes
     are completed.
  05 DOCUMENT — Previous damage and restoration records remain part of the
     vehicle's history.
  06 RETURN TO ROAD — The finished vehicle becomes available through
     Farnsworth Motors.
  Horizontal scroll-snap on desktop is acceptable if it stays accessible;
  otherwise a vertical sequence with sticky imagery.

S4 THE VEHICLE RECORD (the most important section for the brand)
  "KNOW WHAT HAPPENED TO THE CAR."
  "Every rebuilt vehicle has a story. We would rather show it than hide it."
  Render a Farnsworth Vehicle Record as a designed object: mono type,
  hairline rules, rows that illuminate as they scroll into view. Fields:
  VIN · Title status · Acquisition · Damage classification · Repair
  summary · Parts replaced (OEM) · Inspection status · Before / After ·
  Documentation on file. Populate from the featured vehicle's data.
  Transparency is the luxury signal.

S5 BEFORE / AFTER
  "SAME CAR. DIFFERENT CHAPTER."
  "We document what changed so you understand what you are buying."
  Drag comparison slider, pointer + keyboard (arrow keys) + touch. Images
  must be pixel-aligned; ship the component with two aligned placeholder
  frames and a clear slot for real photography. Make this the site's
  signature interaction.

S6 AVAILABLE
  Three vehicles from the data layer. Photography-dominant cards with only:
  Year Make Model · mileage · price · Rebuilt title. Hover: image scale
  1.03, secondary metadata reveals. No heavy card borders; use whitespace.
  Cursor becomes a small circular "VIEW" over vehicle photography (desktop
  only, respects reduced motion).

S7 WHY CONSIDER REBUILT?
  Honest economics, no percentages:
  A rebuilt vehicle can offer substantially more car for the money because
  its title history permanently affects market value — even after it has
  been repaired. That discount creates opportunity. But only when: the
  original damage makes sense · repairs were completed correctly · the
  history is understood · the purchase price reflects the title.
  That is the market Farnsworth Motors specializes in.

S8 THE FARNSWORTH STANDARD (principles, not certification)
  Sequential large statements on scroll, paired with macro imagery:
  DAMAGE SHOULD BE UNDERSTOOD. / REPAIRS SHOULD MAKE ECONOMIC SENSE. /
  HISTORY SHOULD NOT DISAPPEAR. / PRICE SHOULD REFLECT REALITY. /
  A REBUILT TITLE SHOULD NEVER BE A SURPRISE.

S9 FINAL CTA
  Near-full-screen, dark, one finished vehicle. "FIND YOUR NEXT CAR."
  Primary: Explore Inventory. Secondary: Sell / Trade a Vehicle.
  Small: Salt Lake City, Utah · Se habla español.

FOOTER
  Farnsworth Motors · Inventory · Vehicle Records · Our Process · About ·
  Contact · Privacy · Terms · Title Disclosure ·
  Oceans Auto LLC DBA Farnsworth Motors, Salt Lake City, Utah.
  Disciplined. Nothing else.

NAVIGATION
  Transparent over the hero. Left: wordmark. Right: Inventory · Our
  Process · About · Contact, plus an understated "View Vehicles". On
  scroll: thin translucent dark surface with restrained backdrop blur.
  Height ≤ 64px. Full keyboard support; mobile menu is a full-screen
  sheet with the same restraint.

PHOTOGRAPHY
  Real photography does not exist yet. Do not use stock. Generate
  placeholder frames programmatically (dark studio gradient, soft floor
  falloff, faint coupe silhouette, mono caption "PHOTOGRAPHY PENDING") at
  the exact aspect ratios each slot needs, and keep a manifest at
  public/images/MANIFEST.md listing every slot, its ratio, and the
  direction for the eventual shot: neutral architecture, concrete, clean
  studio, dusk, controlled natural light, dark asphalt, soft reflections,
  large negative space. Never: dealership lots, balloons, HDR,
  oversaturation, fake skies.

MOTION SYSTEM
  Weighted, not animated. Opacity, scale, slight translation, masking,
  progressive reveals. Scroll-linked only where it tells the story.
  Nothing bounces, spins, or snaps. Magnetic buttons: ≤ 4px attraction,
  desktop only. Image loading: photographic reveal (opacity + 1.03→1.00
  scale), never gray skeletons.

CONTENT MODEL (src/lib/vehicles/types.ts)
  Vehicle { id, slug, year, make, model, trim, vin, mileage, drivetrain,
  engine, exteriorColor, interiorColor, price, titleStatus: "rebuilt" |
  "clean", status: "available" | "pending" | "sold", featured, description,
  features[], location, dateListed,
  record: { acquisition, damageClassification, structuralAffected: boolean,
  mechanicalAffected: boolean, repairSummary, partsReplaced: [{name, oem:
  boolean, partNumber?}], inspectionStatus, documentation: [{label, url}] },
  media: { hero, gallery[], before[], repair[], after[] } }
  Enforce in the source layer: a vehicle with record.structuralAffected ===
  true cannot be returned as available. That is the Farnsworth Standard in
  code.

ROUTES TO SCAFFOLD (empty shells with correct layout + metadata so the
site expands cleanly): /inventory, /vehicle/[slug], /vehicle/[slug]/record,
/process, /about, /sell, /trade, /contact. Vehicle pages: photography →
price → core info (REBUILT TITLE adjacent, never buried) → history →
restoration → documentation → contact.

LEGAL GUARDRAILS (non-negotiable)
  Never imply certification, inspection standards, warranties, or
  documentation Farnsworth does not actually hold. Never fabricate
  credibility. "OEM" means OEM. Rebuilt title is stated plainly in every
  listing title.

ACCESSIBILITY
  Semantic HTML, logical heading order, full keyboard navigation, visible
  focus, contrast ≥ 4.5:1 for text, descriptive alt text, reduced-motion
  support everywhere, accessible form labels, ARIA only where needed.

PERFORMANCE
  Lighthouse 90+ mobile with the 3D stub (i.e. fallback path); Core Web
  Vitals green. Poster is the LCP element. Lazy everything below the fold.
  No animation library duplicates. Pause all RAF/scroll work when hidden.

DELIVERABLE
  A running, production-quality homepage with: navigation, hero
  orchestrator, hero fallback (fully designed), 3D stub, all nine sections,
  footer, responsive mobile, reduced-motion path, performance fallbacks,
  data layer with static + Supabase adapters, route shells, Cloudflare
  deploy config, docs/HERO-CONTRACT.md (copy of the contract), docs/
  DECISIONS.md (every place you overrode this brief and why).
  Do not stop at a mockup. Implement the experience. Verify `next build`,
  `next lint`, and take desktop + mobile screenshots of every section
  before declaring done.

DESIGN PRINCIPLE
  At every element ask: can this be removed while preserving the message?
  If yes, remove it. Negative space, silence, photography and typography
  are the design.
```

---

## Prompt B — Codex: the 3D hero scene only

```
FARNSWORTH MOTORS — 3D HERO SCENE (SCENE ONLY — NOT THE PAGE)

You are a 3D interaction designer and senior WebGL engineer. You are
building one thing: the real-time hero scene for the Farnsworth Motors
homepage, delivered as a drop-in React component. The page, copy,
wordmark, navigation, sections, fallback, and all UX decisions (first
visit, reduced motion, device quality) already exist and are owned by a
separate build. You do not touch them. You replace one stub file and add
your own files under the paths the contract gives you.

────────────────────────────────────────────────────────────────────────
[PASTE SECTION 0 — THE SHARED CONTRACT — HERE, VERBATIM]
────────────────────────────────────────────────────────────────────────

THE CONCEPT — RECONSTRUCTION
An automobile rebuilding itself from an exploded engineering composition
into a finished vehicle. Precision, not destruction. It should feel like
an automotive engineering film, not a game. Reference the restraint of
Apple product films, Porsche and Polestar configurators, and Rivian's
warmth. Prioritize sophistication over spectacle.

THE VEHICLE
A brand-neutral grand-touring coupe: long hood, fastback roofline, wide
stance, clean surfaces, no badges, no wordmarks, no recognizable marque
trade dress (not a 911, not a Model 3, not anything identifiable).
Silhouette, reflections and hero composition matter; interior detail
does not — a dark cavity with a simple dashboard, two seats and a
steering wheel is enough.

ASSET PIPELINE
Produce the model in Blender (AI text-to-3D such as Meshy/Tripo is
acceptable as a base, then retopologize and clean; a CC-BY/royalty-free
generic coupe is acceptable if its license permits commercial web use —
keep the license file in public/3d/LICENSES/). Never use a trademarked
vehicle model.
Separate into independently addressable objects with EXACTLY these names
(the page's SVG fallback uses the same vocabulary):
  chassis, subframe_F, subframe_R, suspension_FL, suspension_FR,
  suspension_RL, suspension_RR, brake_FL, brake_FR, brake_RL, brake_RR,
  seat_driver, seat_passenger, dashboard, steering_wheel,
  hood, trunk, door_FL, door_FR, door_RL, door_RR, quarter_FL, quarter_FR,
  quarter_RL, quarter_RR, roof, front_bumper, rear_bumper,
  glass_windshield, glass_rear, glass_L, glass_R,
  headlight_L, headlight_R, taillight_L, taillight_R,
  wheel_FL, wheel_FR, wheel_RL, wheel_RR, trim_F, trim_R, mirror_L, mirror_R
Budgets: ≤ 120k triangles high, ≤ 60k medium, ≤ 30k low (three LODs or
one model with parts dropped at lower quality). Textures ≤ 2048², KTX2/
Basis with WebP fallback, baked AO. Export GLB with meshopt (or Draco) via
gltf-transform. Wire size: high ≤ 2.5 MB, medium ≤ 1.5 MB, low ≤ 0.8 MB.
Materials: PBR. Paint satin mid-gray (#9A9C9E, roughness ~0.45, metallic
~0.6, clearcoat 1.0, clearcoat roughness 0.1). Glass, rubber, brushed
aluminum, dark interior fabric. No red paint, no chrome flare.
Also render and ship public/3d/hero-poster.webp (2400×1350) — the
assembled car in the final lighting, ¾ front, dark studio. The page uses
it as the LCP element and the static hero. Match the WebGL look exactly.

ENVIRONMENT & LIGHTING (lit as automotive photography)
Deep graphite / warm charcoal studio, not pure black — read --bg from the
CSS variable and set scene background and fog to it. Key: one large
rectangular area light above/front. Edge: rear three-quarter light
outlining the silhouette. Fill: low soft environment (a neutral 1k studio
HDRI or drei's studio preset; no visible HDRI in reflections). One
animated highlight sweep for the completion beat. No point-light farms.
Darkness is part of the design; surfaces reveal gradually. Soft contact
shadow only; no glossy floor reflections.

COMPOSITION & TIMELINE (mode = "full")
t=0        Camera slightly forward and above, subtle ¾ angle. The chassis
           is partially lit, suspended centered. Parts hover in organized
           space — an exploded engineering drawing translated into 3D,
           each part offset along a clean axis from its home position.
           Extremely slow camera drift. Hold 0.75–1.0 s.
t=1–7 s    Assembly in five stages with staggered starts (do not move
           everything at once):
           1 STRUCTURE  subframes, suspension, brakes lock in
           2 INTERIOR   seats, dashboard, steering wheel settle
           3 BODY       doors, hood, trunk, quarters, roof, bumpers
           4 IDENTITY   lights, wheels, trim, mirrors, glass
           5 COMPLETION the vehicle settles; silence
           Each part: curved trajectory (quadratic bezier from offset to
           home with a slight arc), 5–15° of rotation that resolves to
           zero, easing that decelerates like a physical object
           (cubic-bezier(0.2,0,0,1) or a critically damped spring), lands
           precisely, never overshoots. A few parts pass near the camera
           for depth; never enough to cause discomfort.
t=7–9 s    Pause. Lighting shifts: the highlight sweep travels across the
           paint; environment darkens slightly; vehicle yaws 5–8° OR the
           camera arcs the same amount (choose one). Then the vehicle
           recedes into shadow (exposure + fog, not a fade to black).
           Call onAssembled() at the START of this beat so the page can
           bring in the wordmark while the car recedes.
mode = "short"   Start with everything ≥ 80% home; finish in ≤ 2 s; same
           completion beat, shortened.
mode = "static"  Render assembled in final lighting; idle only (≤ 0.5°/s
           yaw drift, or none). No timeline.

AFTER ASSEMBLY (all modes)
Desktop: pointer position drives ≤ 2° of camera parallax; reflections
respond. Mobile: none of that — scroll only. Do not build a configurator.
scrollProgress (0→1) drives a slow camera push toward the paint so the
dark body fills the frame as the hero scrolls out; the page uses the same
value to bring in its next section. Keep the last 20% of the push almost
still so the handoff to the page is calm.

ENGINEERING REQUIREMENTS
- Stack: three + @react-three/fiber + @react-three/drei, TypeScript. Tree-
  shake drei. Keep the scene's JS ≤ 250 kB gzipped excluding three itself.
- Load progressively: shell → low LOD → swap to the quality LOD the page
  requested. Call onReady() after the first frame with any LOD; never
  block on the high model.
- Respect `paused`: stop the RAF loop, release nothing, resume cleanly.
- Adaptive DPR (drei AdaptiveDpr or manual), max 2 on high, 1.5 medium,
  1 low. Monitor FPS; if < 30 for 2 s, call onUnavailable("low-fps") and
  dispose everything. Also call it for no WebGL, context loss, or model
  fetch failure. After onUnavailable, render nothing.
- Dispose geometries, materials, textures on unmount. No leaks across
  route changes.
- Never read localStorage, matchMedia, or window size to make behavior
  decisions — the page passes mode and quality. You may read size for
  aspect/DPR only.
- No copy, no UI, no wordmark, no buttons, no scroll cue inside the scene.
- No colors outside the tokens (background from --bg; paint as specified;
  the warm sweep #CFC6B8 at low intensity).

ACCEPTANCE
- Replace src/components/hero/three/HeroScene3D.tsx; add nothing outside
  src/components/hero/three/** and public/3d/**.
- ≥ 60 fps on an M1 MacBook Air at quality "high"; ≥ 30 fps on an iPhone
  12 at "medium"; the page's fallback engages automatically otherwise.
- All 43 part names present and independently animatable.
- Full timeline 7–9 s; short ≤ 2 s; static renders immediately.
- Poster matches the WebGL final frame closely enough that the crossfade
  is invisible.
- No trademarked vehicle design, badge, or logo anywhere.
- Document choices in src/components/hero/three/README.md: model source
  and license, LOD budgets actually hit, and any place you deviated from
  this brief and why.

CREATIVE AUTHORITY
You may improve composition, choreography, timing, and lighting beyond
these instructions whenever the result is substantially better. Preserve
the central concept, the contract, and the budgets. Sophistication over
spectacle. Product over decoration. Clarity over cleverness.
```

---

## Notes for Jay (not part of either prompt)

1. **Section 0 is the whole trick.** Both builds compile against the same `types.ts`, so Codex's scene drops into Claude Code's page without either side reading the other's code. If either builder proposes changing the contract, say no unless both prompts get updated together.
2. **The fallback is now a real design deliverable**, not a poster. That was the biggest weakness in the original prompt: it told Claude to build the 3D scene and mentioned fallback as an afterthought. Now the non-3D hero is spec'd as its own exploded-view animation using the same part vocabulary, so the brand works on day one before Codex delivers, and on every device Codex's scene can't run on.
3. **Kept from your original:** reconstruction concept, five-stage choreography, "BUILT AGAIN.", the nine-section arc, the vehicle record as the credibility mechanism, no fabricated certification, dark graphite palette, grotesk type, Oceans Auto LLC footer.
4. **Changed from your original:** removed "Volkswagen Jetta" as example copy (let the data layer supply real vehicles); replaced GSAP+Framer with Framer only unless a real limit appears; added the `structuralAffected` rule to the data layer; added the poster as a Codex deliverable so the LCP image matches the scene; made the part-name list exact and shared.
5. **This palette and type direction supersede the brand book I wrote earlier today** (which had oxide red and a serif). I'll reconcile the brand book to this direction when you say go.
