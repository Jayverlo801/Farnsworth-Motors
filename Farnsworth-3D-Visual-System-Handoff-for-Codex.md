# Farnsworth Motors — 3D & Visual System Handoff (for Codex)

*Read `Farnsworth-Motors-Brand-Book-v1.md` first. This document tells you what to build; that one tells you why. Where this doc says "decided," don't reopen it. Where it says "Codex decides," use judgment and document the choice in `/docs/decisions.md`.*

---

## 0. Decisions already made

| Question | Decision | Why |
|---|---|---|
| Real-time 3D or pre-rendered? | **Both, by layer.** Real-time (WebGL) for one hero object on the homepage and one optional "Reveal" module. Pre-rendered stills/video for everything else (inventory marketing, social, ads, section art). | One real-time scene is affordable and impressive; five are slow and fragile on phones. Pre-rendered is cheaper, sharper, and reusable in ads. |
| Hero vehicle | **Not a Porsche.** A brand-neutral grand-touring coupe designed for Farnsworth: long hood, fastback, wide stance, 911-class proportions, zero badges, no trademarked trade dress. | Porsche's design is protected trade dress; using it as the brand's face on a commercial site invites a takedown and, worse, promises Porsches on a lot that sells BMW/Mercedes/Toyota. The *feel* of a 911 (proportion, restraint) is what Jay wants; the badge is not. |
| Hero concept | **"The Reveal."** One vehicle, one studio, one light. A clipping plane sweeps through the car on scroll; body panels dissolve to reveal the structure. Untouched structure = intact green. Replaced panels = oxide red outline + mono label. Ends on the finished car. | Answers the buyer's first three questions visually. It *is* "shown completely." |
| The trust object | **The intact structure (unibody/frame) shown green.** Secondary objects: the OEM part (boxed, labeled) and the Rebuild Record (a mono-type document card). | Research on the buyer says the fear is hidden structural damage. The object that says "trust" is the frame, visibly untouched — not a badge, not a handshake. |
| Look | Apple/Polestar studio minimalism. Two grounds: warm white (#F5F4F1) and near-black (#0E0E0F). Satin paint, matte primer, bare aluminum. Soft contact shadow. No floor reflections, no flares, no wireframe, no clay-render gimmicks. | Precision and sophistication read as restraint, not effects. |
| Car paint | Satin mid-gray (Nardo-style, ~#9A9C9E, roughness 0.45). Primer state: matte light gray (#C9C8C4). Bare metal state: brushed aluminum. | Oxide red is reserved for damage markers and CTAs. A red car would destroy that meaning. |
| Hosting | Cloudflare (Pages/Workers via OpenNext for Next.js). Assets on Cloudflare R2 behind Cloudflare Images/CDN. | Jay's decision. |
| Budget | ≤ $2,000 total; prefer near-zero recurring. | Jay's decision. Target spend for 3D assets: under $150. |
| Photography | AI-generated/3D for brand layer now. Real inventory photos later, same studio rules. | Jay's decision; brand book §8 keeps them consistent. |

## 1. Visual references (study, don't copy)

Four given by Jay, three added. What to take from each:

1. **Porsche (porsche.com configurator)** — proportion, restraint, the car alone in space, camera that never rushes.
2. **Apple (product pages)** — one object, one idea per screen, scroll-driven reveal, type that does the talking, white/black alternation.
3. **Rivian** — warm minimalism; proof that a car brand can be calm and still premium.
4. **Tesla** — dark studio hero, spec numbers as design elements, mono-type data.
5. **Polestar** *(added)* — the closest match to "precision and sophistication." Flat light, exploded/sectioned views, Scandinavian grid. Study their "transparency" pages — they publish sustainability data the way Farnsworth will publish rebuild records.
6. **Singer Vehicle Design** *(added)* — restoration presented as luxury craft. Photography of parts, bare metal, and process as beautiful objects. The emotional register Farnsworth Collision should hit.
7. **Carvana 360° vehicle viewer** *(added, for inventory UX only)* — the buyer's mental model for "seeing the whole car online," including their hotspot annotations of imperfections. Farnsworth's listing viewer should be the premium version of this: same interaction, our studio, our red/green annotation system.

Anti-references (brand book §5): AutoSavvy, buy-here-pay-here lots, Marketplace listings.

## 2. Asset list

### A. Real-time (WebGL) — one model, three states

`hero-coupe.glb` — the Farnsworth coupe.

- Poly budget: ≤ 80k triangles total, ≤ 60k preferred. Exterior only; interior can be a dark cavity with a simple dashboard silhouette.
- Compressed with **meshopt** (or Draco); target ≤ 1.5 MB on the wire, hard cap 2.5 MB.
- Textures: 2048² max, KTX2/Basis where supported, WebP fallback. Baked AO in a separate channel.
- **Mesh naming is mandatory** — the Reveal depends on it:
  - `body_*` — every exterior panel, one mesh each (`body_hood`, `body_door_L`, `body_quarter_R`, `body_bumper_F`, …)
  - `structure_*` — unibody/frame, crash rails, A/B/C pillars, floor
  - `glass_*`, `wheel_*`, `light_*`, `trim_*`
- Materials: PBR. Paint (satin gray), primer (matte), aluminum, glass, rubber. Each panel must accept a material swap at runtime (finished → primer → bare) via a `state` uniform or material array; don't bake the paint into the texture.
- Tag two panels as "replaced" for the demo: `body_quarter_R` and `body_bumper_R`. These get the oxide red outline + label in the Reveal.

Also export:
- `hero-coupe-poster.webp` (2400×1350, dark studio) — poster/fallback for `prefers-reduced-motion`, low-end devices, and LCP.
- `hero-coupe-env.hdr` (1k, neutral studio) — lighting environment. Or use drei's built-in `studio` preset and skip the file.

### B. Pre-rendered stills (WebP/AVIF, 2×)

All from the same model and studio so the site reads as one world.

| ID | Subject | Ground | Use |
|---|---|---|---|
| S1 | Coupe, ¾ front, finished | white | Inventory section header, OG image |
| S2 | Coupe, ¾ rear, RH quarter in primer, rest finished | white | Pillar 1 ("Chosen, not scavenged") |
| S3 | Structure only, green highlight, black background | black | Pillar 2 / Reveal end-frame |
| S4 | Single OEM quarter panel on white, boxed with mono label | white | Pillar 2 ("the shop the brands use") |
| S5 | Rebuild Record card, mono type, on black | black | Pillar 3 ("Shown completely") |
| S6 | Coupe, front-on, dark studio, single key light | black | About / Collision entity header |
| S7–S9 | Three loop stills: as-received (subtle dent) → primer → finished, same camera | white | Process strip; also social carousel |

### C. Video (optional, phase 2)

`reveal-loop.mp4/webm` — 8–10 s loop of the Reveal, 1920×1080, for social and as a fallback where WebGL is disabled. Render from the same scene.

### D. UI/diagram assets (SVG, built in code)

- Red/green annotation system: marker dot, leader line, mono label. One React component, used in the Reveal and in every listing.
- Rebuild Record card component (mono type, hairline rules).
- Entity marks for Farnsworth Motors / Collision / Service — text-based lockups in Bitter until a real logo exists. Don't invent a logo yet.

## 3. Production pipeline (cheap end)

1. **Generate the base coupe.** Options in order of preference:
   - AI text-to-3D (Meshy or Tripo, ~$20/mo tier): prompt for "brand-neutral grand touring coupe, long hood, fastback, wide stance, clean surfaces, no badges, studio product-render style." Generate 6–10 candidates, pick one, retopologize.
   - Or a CC-BY / royalty-free generic sports coupe from Sketchfab/CGTrader (check license permits commercial web use; keep the license file in `/assets/3d/LICENSES/`). Do **not** use a Porsche/BMW/etc. model.
2. **Clean up in Blender** (free): decimate to budget, split into named panels per §2A, UV, bake AO, set PBR materials, add a simple structure mesh (extruded rails + pillars is enough — it's a symbol, not a CAD drawing).
3. **Export glTF** with meshopt via `gltf-transform` CLI: `gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp`.
4. **Render stills** in Blender (Cycles, 256 samples, denoise) from a single saved camera rig so all stills match. Same HDRI as the web scene.
5. **AI stills as a stopgap.** For S4/S5/S7–S9 you can generate with an image model (Jay is paying for Google AI) using the brand's prompt block (§7) — acceptable for marketing layer, never for actual inventory listings.

Estimated spend: $0–60.

## 4. Web implementation

### Stack

- Next.js (App Router) → Cloudflare via `@opennextjs/cloudflare`.
- `three` + `@react-three/fiber` + `@react-three/drei`. Load the hero with `dynamic(() => import(...), { ssr: false })`.
- Scroll: Lenis or native + `useScroll` from drei; the Reveal is a scroll-scrubbed timeline, not autoplay.
- Data: Supabase (Postgres + Storage) *or* Cloudflare D1 + R2. Codex decides; Supabase is already connected to Jay's tooling and is the lower-friction choice.
- Images: Cloudflare Images or `next/image` with R2 origin. AVIF/WebP, responsive.

### Hero component spec — `<RevealHero />`

States driven by scroll progress `p ∈ [0,1]`:

| p | What happens |
|---|---|
| 0.00 | Finished coupe, dark studio, slow 2°/s idle yaw. Headline: "Rebuilt right." |
| 0.15 | Camera drifts to ¾ rear. Replaced panels get a hairline oxide-red outline and mono labels fade in. Headline: "Cosmetic damage. Two panels." |
| 0.35–0.65 | Clipping plane sweeps front→rear. `body_*` meshes fade to 8% opacity or clip; `structure_*` revealed with intact-green emissive (low, ~0.6). Labels: "Structure — never touched." |
| 0.65–0.85 | Panels return in *primer* material, then seat into paint (material lerp 400 ms each, staggered 80 ms). Labels update: "RH quarter — OEM — refinished in-house." |
| 1.00 | Finished car, white studio (background lerps #0E0E0F → #F5F4F1). Headline: "Shown completely." CTA (oxide red): "See the inventory." |

Rules: no bounce easing (use `cubic-bezier(0.2, 0, 0, 1)`), no camera shake, lettering never overlaps the car, 60 fps on an M1 MacBook and ≥ 30 fps on an iPhone 12; below that, swap to the poster + CSS-only animation.

### Fallbacks (mandatory)

- `prefers-reduced-motion`: poster image + static labels.
- No WebGL / `navigator.deviceMemory < 4` / `saveData`: poster image.
- Model load > 3 s: show poster, hydrate model behind it, crossfade.

### Inventory page — `<VehicleViewer />`

Phase 1 (now): image gallery with the red/green annotation overlay. Each listing has ordered images plus an `annotations[]` array (x, y as % of image, type `replaced | verified`, label). Same component the hero uses.
Phase 2: 36-frame 360° spin from real photos (Carvana-style), same overlay. Design the data model for it now.

### Data model (minimum)

```
vehicles
  id, vin, year, make, model, trim, mileage, price, title_status ("rebuilt"),
  status (available | pending | sold), created_at
vehicle_media
  id, vehicle_id, kind (image | spin_frame | video), url, sort, alt
vehicle_annotations
  id, media_id, x_pct, y_pct, type (replaced | verified), label
rebuild_records
  id, vehicle_id, damage_summary, structural_affected (bool, must be false to list),
  mechanical_affected (bool), parts (jsonb: [{name, oem:true, part_no}]),
  inspected_by, completed_at, notes
```

`structural_affected = true` should block publishing. That's the Farnsworth Standard enforced in code.

### Folder structure

```
/public/3d/hero-coupe.glb
/public/3d/hero-coupe-poster.webp
/public/img/stills/S1..S9.avif|webp
/src/components/three/RevealHero.tsx
/src/components/three/CoupeModel.tsx      # loads glb, exposes panel refs by name
/src/components/Annotation.tsx            # red/green marker system
/src/components/RebuildRecord.tsx
/src/components/VehicleViewer.tsx
/assets/3d/source/                        # .blend, HDRI, LICENSES/ (not deployed)
/docs/decisions.md
```

## 5. Style tokens (single source of truth)

```
--ground-light: #F5F4F1;  --ground-dark: #0E0E0F;  --ink: #1A1A1A;
--steel: #8E8E8A;  --oxide: #B33A26;  --intact: #2F6B4F;
--paint: #9A9C9E (roughness .45, metallic .6);  --primer: #C9C8C4 (roughness .9);
font-display: "Bitter";  font-ui: "Archivo";  font-mono: "IBM Plex Mono";
easing: cubic-bezier(.2,0,0,1);  durations: 400ms material, 1200ms camera moves
```

## 6. Performance budgets

- Homepage LCP ≤ 2.5 s on 4G (poster is the LCP element, not the canvas).
- Hero glb ≤ 1.5 MB, total 3D payload ≤ 2.5 MB, JS for three ≤ 250 kB gz (tree-shake drei).
- Lighthouse ≥ 90 mobile with WebGL disabled; ≥ 75 with it enabled.

## 7. Prompt block for AI image/3D generation

Use verbatim as the base for every generation so the world stays consistent:

> Studio product photograph of a brand-neutral grand touring coupe, long hood, fastback roofline, wide stance, satin mid-gray paint, no badges or logos, on a seamless warm-white studio background, single large soft key light from upper left, soft contact shadow, no floor reflection, no lens flare, matte and restrained, Apple/Polestar product-photography style, 50 mm lens, ¾ front view, 8k.

Variants: swap `warm-white` → `near-black` for dark; add `right rear quarter panel in matte light-gray primer` for process shots; `isolated OEM rear quarter panel, boxed, on warm-white` for S4. Never add: red paint, chrome, garage, lot, sunset, people, badges.

## 8. Acceptance checklist

- [ ] Hero runs ≥ 30 fps on an iPhone 12 and falls back cleanly with WebGL off.
- [ ] Every `body_*` panel can be individually outlined, labeled, and material-swapped.
- [ ] The Reveal reads without any copy: a stranger can tell red = replaced, green = untouched.
- [ ] No trademarked vehicle design, badge, or logo anywhere in the model or stills.
- [ ] All stills share one camera rig, one HDRI, one ground pair.
- [ ] `rebuild_records.structural_affected = true` prevents a listing from publishing.
- [ ] Tokens in §5 are the only colors and fonts in the codebase.

## 9. What Jay still owes Codex

- Real names for the Collision and Service entities.
- Whether a warranty/inspection guarantee exists (changes the hero end-frame copy).
- Financing partner names for the listing page.
- Sign-off on the brand-neutral coupe instead of a Porsche.
