import manifest from "../../../../public/3d/gt3rs-study/manifest.json";

export type Vec3 = readonly [number, number, number];
export type Stage = "structure" | "interior" | "body" | "identity";

/** Blender's semantic parent nodes own the motion. Never animate their
 * quantized mesh children: their local transforms are part of the geometry. */
export const PARTS = manifest.parts.map((part) => ({
  name: part.name,
  stage: part.stage as Stage,
  home: part.home as unknown as Vec3,
  offset: part.offset as unknown as Vec3,
  start: part.startSeconds,
  duration: part.durationSeconds,
}));

export const PART_NAMES = PARTS.map((part) => part.name);
