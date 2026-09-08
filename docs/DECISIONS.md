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

7. **Footer legal items (Privacy, Terms, Title Disclosure) are inert text.**
   No legal copy exists yet; dead links would be worse. They activate when
   counsel-approved pages exist.

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
