# Original GT3 RS-inspired study

`high.glb`, `medium.glb`, and `low.glb` retain 58 separately addressable components.
They require meshopt decoding. See `manifest.json` for exact counts, bytes,
part transforms, assembly timing, and render paths.

The files load assembled. Each named component is a stable-pivot parent group;
animate that group and retain its children's dequantization transforms. Each
LOD has 130 material draw meshes. `web-verification.json` in the source folder
records real Three.js decoding, geometry, pivot, and compression-bound checks.

These are new assets, not replacements for the active `coupe-*.glb` URLs yet.
The existing hero loader's 44-name check must be adapted before use. No rear
doors were invented to satisfy the old schema.

Editable source and provenance: `assets/3d/source/gt3rs-study/README.md`.
The render WebPs are produced in Blender from that source. Geometry is original,
GT3 RS-inspired, and not factory CAD or an exact replica. Web lighting/fallback
parity, baked AO, and physical-device performance remain separate work.
