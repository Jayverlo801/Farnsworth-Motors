export const PART_NAMES = [
  "chassis", "subframe_F", "subframe_R", "suspension_FL", "suspension_FR",
  "suspension_RL", "suspension_RR", "brake_FL", "brake_FR", "brake_RL", "brake_RR",
  "seat_driver", "seat_passenger", "dashboard", "steering_wheel",
  "hood", "trunk", "door_FL", "door_FR", "door_RL", "door_RR", "quarter_FL", "quarter_FR",
  "quarter_RL", "quarter_RR", "roof", "front_bumper", "rear_bumper",
  "glass_windshield", "glass_rear", "glass_L", "glass_R",
  "headlight_L", "headlight_R", "taillight_L", "taillight_R",
  "wheel_FL", "wheel_FR", "wheel_RL", "wheel_RR", "trim_F", "trim_R", "mirror_L", "mirror_R",
] as const;

export type PartName = (typeof PART_NAMES)[number];
export type Vec3 = readonly [number, number, number];
export type Stage = "structure" | "interior" | "body" | "identity";

export function stageFor(name: PartName): Stage {
  if (/^(chassis|subframe|suspension|brake)/.test(name)) return "structure";
  if (/^(seat|dashboard|steering)/.test(name)) return "interior";
  if (/^(hood|trunk|door|quarter|roof|front_bumper|rear_bumper)/.test(name)) return "body";
  return "identity";
}

/** Offsets are in glTF's Y-up space; the nose points toward +X. */
export function offsetFor(name: PartName): Vec3 {
  const s = 4.68 / 919;
  const svg = (x: number, y: number): Vec3 => [x * s, -y * s, 0];
  // Literal translation columns from coupe-side-exploded.svg. Its grouped
  // vocabulary expands to the unchanged 44-node scene contract.
  if (name === "chassis" || name === "roof") return svg(0, 0);
  if (/^(subframe|suspension|brake)/.test(name)) return svg(0, 104);
  if (/^(seat|dashboard|steering)/.test(name)) return svg(0, -80);
  if (/^door/.test(name)) return svg(0, 132);
  if (name === "trunk" || /^quarter_R/.test(name)) return svg(-84, -6);
  if (name === "hood" || /^quarter_F/.test(name)) return svg(52, -118);
  if (name === "front_bumper") return svg(110, 6);
  if (name === "rear_bumper") return svg(-110, 6);
  if (/^wheel/.test(name)) return svg(0, 120);
  if (/^headlight/.test(name)) return svg(92, -36);
  if (/^taillight/.test(name)) return svg(-88, -46);
  if (/^(glass|mirror)/.test(name)) return svg(0, -140);
  return svg(0, 52);
}

const stageStarts = { structure: .90, interior: 2.0, body: 3.15, identity: 4.9 };
export const PARTS = PART_NAMES.map((name, index, names) => {
  const stage = stageFor(name);
  const ordinal = names.slice(0, index).filter((part) => stageFor(part) === stage).length;
  return {
    name,
    stage,
    offset: offsetFor(name),
    start: stageStarts[stage] + ordinal * (stage === "identity" ? .055 : .065),
    duration: stage === "body" ? 1.45 : 1.10,
    rotation: [(index % 2 ? 1 : -1) * .11, (index % 3 - 1) * .13, .09] as Vec3,
    referenceRotation: name === "hood" || /^quarter_F/.test(name) ? -4 : name === "front_bumper" ? -2 : name === "rear_bumper" ? 2 : 0,
  };
});
