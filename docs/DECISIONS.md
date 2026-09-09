# DECISIONS — where this build deviates from the brief, and why

The brief (Farnsworth-Homepage-Prompts-v2.md, Prompt A) treats every "avoid"
as a strong default. These are the places we overrode a default or made a
call the brief left open. The contract, legal guardrails, accessibility, and
performance requirements were not overridden anywhere.

1. **Line-art coupe carries the placeholder system.** The brief asks for
   programmatic placeholder frames with a "faint coupe silhouette". We built
   the silhouette as a full engineering elevation with the same part
   vocabulary as the 3D scene, and reuse it in the hero fallback, the
   before/after slider, cards, and the CTA. One drawing system instead of
   two keeps the reconstruction idea coherent site-wide before photography
   exists.

2. **Before/after slider uses the drawing, not photo placeholders.** The
   brief requires pixel-aligned frames. Two renders of the same SVG geometry
   (damage-documentation variant vs. finished) are aligned by construction,
   and the slot swaps to real photo pairs via `media.before/after` when they
   exist (see public/images/MANIFEST.md, BA-BEFORE/BA-AFTER).

3. **S3 process is a vertical grid, not horizontal scroll-snap.** The brief
   allows either; scroll-snap regions are the highest-risk pattern for
   keyboard/AT users and for trackpad momentum. Six steps fit a scannable
   3×2 grid with imagery slots. Revisit when real macro photography lands.

4. **A "Skip" affordance exists during the full cinematic** (plus
   scroll/keydown completes it instantly). The brief says never block the
   page; an explicit skip is the honest version of that rule.

5. **Extra `interior` group in the fallback SVG.** The contract's fallback
   part list has no interior parts, but the five-stage choreography includes
   an INTERIOR beat. An unlabeled `interior` group keeps the fallback's
   timing identical to the 3D scene without changing the contract.

6. **`/inventory` and `/vehicle/[slug]` are functional, not just shells.**
   They consume the same data layer the homepage uses; building them real
   cost little and proves the content model end-to-end. Other routes
   (/process, /about, /sell, /trade, /contact, /vehicle/[slug]/record) ship
   as designed shells per the brief.

7. **Footer legal items** were inert text until the legal routes shipped —
   superseded; see #22.

8. **Poster absent until the 3D build ships it.** Hero renders the poster
   `<img>` optimistically and hides it on error; the SVG fallback is the
   LCP experience meanwhile. No layout shift either way.

9. **Lenis omitted.** Native scrolling is responsive and accessible; the
   brief makes Lenis optional and conditional on exactly that.

10. **`images.unoptimized` in next.config.** Workers has no default Next
    image optimizer and all current imagery is local SVG/placeholder. See
    docs/DEPLOY.md for the swap when photography lands.

11. **Sample inventory uses real makes/models.** The data layer is the
    placeholder (three demonstration vehicles marked as samples in
    static-source.ts); the brand-neutral rule applies to the hero vehicle
    design, not to inventory the business will actually sell.

12. **VIN masking in UI.** Full VINs live in the data; public surfaces mask
    the middle (maskVin) until a disclosure policy is decided.

---

## v3 additions (hero refinement · process/umbrella · identity system)

13. **Wordmark band composition.** Part 1 offered center-band or bottom-left
    compositions; we shipped the centered band (12–40svh) over the drawing
    (ground line 82svh) — at 16:9 and 19.5:9 the centered lockup balances the
    long side elevation better than a corner lockup. Measured boxes exported
    to public/3d/reference/hero-composition.json.
14. **Tagline case.** Tested "BUILT AGAIN." vs "Built again." — sentence
    case shipped; upper-case at weight 500 fought the wordmark.
15. **Low-quality devices skip WebGL entirely.** The page (which owns
    device decisions per the contract) routes quality:"low" straight to the
    designed SVG fallback; ?3d=on overrides for testing. This is what took
    Lighthouse mobile from 65 (TBT 7.2s parsing three.js on a mid-tier
    phone emulation) to 95+. Medium/high devices load the scene as before.
16. **Operation tags render in --text-2, not --text-3.** The brief specifies
    text-3 for tags but also mandates ≥4.5:1 contrast; #5F5F66 on #0B0B0C is
    ~2.6:1. The 6px accent square carries the quiet register; the text stays
    legible. Same change for record keys and umbrella descriptors.
17. **Sticky-process reduced-motion path** renders the stacked list with
    instant step swaps (no rise, no rule transition) via the same CSS media
    block as the rest of the site.
18. **QR on the window sticker is a labeled placeholder pattern** (not
    scannable) until record URLs exist — swapped at print time.
19. **Brand asset SVG lockups reference the Geist family by name** rather
    than embedding outlined paths; print vendors receive font files. The
    mark SVGs are pure geometry and final.
20. **Part 4 reference files live under public/3d/reference/** — inside the
    3D build's directory by explicit v3 instruction; they are additive and
    generated by qa/export-reference.mjs, and no Codex-owned file is
    touched.

21. **Poster serves short/static modes only.** The 3D build's poster is
    captured from the assembled pose; showing it before a first-visit
    cinematic would open on the ending. Full mode opens on the dark stage
    instead. Page-side policy; scene untouched.
22. **Legal routes carry real practice descriptions, not boilerplate.**
    Title Disclosure is substantive (it is brand-core); Privacy and Terms
    describe what the site actually does. All three are practice
    descriptions pending counsel review, and say so by carrying a
    last-updated line rather than a DRAFT banner.
23. **The build briefs moved to docs/briefs/.** Working prompts don't
    belong at the root of a company repository.

24. **Homepage restructured as the story, per Jay.** Each chapter is one
    beat that routes deeper: the process is a six-name strip linking
    /process (which keeps the sticky sequence and the umbrella), the
    record is a diagram + four facts linking the full record page (which
    now carries the before/after slider), the product is one featured car
    plus a quiet row linking /inventory, and the economics argument moved
    to /about. The v2 nine-section homepage is superseded; the sections
    still exist where their content lives. VehicleRecord.tsx (the
    diagram-prop contract surface from Part 4d) is retained for the
    vehicle pages and the 3D build's top-view diagram.

25. **The umbrella joined the homepage, per Jay** — rewritten from the
    buyer's side (strangers' hands vs. one door; accountability as the
    close) and extracted to a shared UmbrellaBand used by the homepage
    and the /process finale, so the v3 "explained once" rule becomes
    "explained one way." Sentence case, matching the voice pass.

26. **Golden Luxe palette, per Jay (supersedes graphite).** Parchment
    ground #EDE7C7, espresso ink #200E01, oxblood accent #8B0000 with
    #5B0202 as the sweep — from Jay's reference. This overrides the v2/v3
    "no dealership red" default: the red here is an oxblood accent
    thread (cue line, tag squares, focus, replaced-parts), never a
    background or a button. Espresso survives as two punch bands (the
    umbrella and the footer) via .band-dark scoped-token inversion; the
    drawing became engineering ink on paper. Fonts stay @theme inline
    (next/font runtime vars); colors moved to plain @theme so utilities
    reference var() and bands can invert descendants.

27. **Frost & Monolith, per Jay (replaces Golden Luxe — "i hate gold theme").**
    Studio frost #F5F5F7 base held solid per the 60-30-10 rule (decorative
    radials behind panels removed); white cards + Apple-gray hairlines as
    the structural 30%; electric slate #4361EE strictly surgical — primary
    CTAs, the scrolled nav pill, the hero cue, focus, selection. Spec
    badges, tags, and progress feedback are structural charcoal, not
    accent. Punch bands (umbrella, footer) are monolith #1D1D1F via the
    same .band-dark scoped tokens. Record diagram: replaced = #C62828,
    intact = green — semantic, record-only. The drawing is charcoal ink
    on white with dark tires.
