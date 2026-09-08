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
  const side = /(_L|_FL|_RL)$/.test(name) ? -1 : 1;
  if (name === "chassis") return [0, .10, 0];
  if (name === "hood") return [1.0, 1.05, .1];
  if (name === "trunk") return [-.8, .70, 0];
  if (name === "roof") return [0, 1.3, 0];
  if (/^door/.test(name)) return [0, .25, side * .92];
  if (/^quarter/.test(name)) return [name.includes("_F") ? .30 : -.30, .36, side * .70];
  if (name === "front_bumper" || name === "trim_F") return [1.10, .12, 0];
  if (name === "rear_bumper" || name === "trim_R") return [-.9, .2, 0];
  if (/^wheel/.test(name)) return [name.includes("_F") ? .23 : -.2, -.1, side * .85];
  if (/^glass/.test(name)) return [0, 1.0, /_[LR]$/.test(name) ? side * .50 : 0];
  if (/^headlight/.test(name)) return [.95, .50, side * .17];
  if (/^taillight/.test(name)) return [-.8, .42, side * .15];
  if (/^mirror/.test(name)) return [.18, .55, side * .8];
  if (/^seat/.test(name)) return [-.1, .8, name === "seat_driver" ? .2 : -.2];
  if (/^(dashboard|steering)/.test(name)) return [.30, .65, 0];
  if (/^subframe/.test(name)) return [name.endsWith("F") ? .45 : -.45, .2, 0];
  return [0, .14, side * .55];
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
  };
});
