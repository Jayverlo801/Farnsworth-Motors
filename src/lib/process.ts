import type { DivisionKey } from "./brand";

export interface ProcessStep {
  index: string;
  title: string;
  tags: DivisionKey[];
  body: string;
  slot: string;
}

/**
 * OUR PROCESS — six steps, one name on every one of them. Shared between the
 * homepage strip (titles + tags) and the full sticky sequence on /process.
 * Copy is final per the v3 brief.
 */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "01",
    title: "Source",
    tags: ["motors"],
    body: "We look for vehicles where the damage, the market value, and the repair economics all make sense. Most don't. Those we pass on.",
    slot: "S3-01-SOURCE",
  },
  {
    index: "02",
    title: "Inspect",
    tags: ["collision", "service"],
    body: "Structure and mechanicals are evaluated before any work begins. If the frame was involved, the car does not move forward.",
    slot: "S3-02-INSPECT",
  },
  {
    index: "03",
    title: "Restore",
    tags: ["collision"],
    body: "Body, paint, and panel work is done in our own shop with OEM parts — the same shop that does collision work for franchise brands.",
    slot: "S3-03-RESTORE",
  },
  {
    index: "04",
    title: "Verify",
    tags: ["service"],
    body: "Mechanical inspection, road test, and the rebuilt-title inspection Utah requires. Nothing is signed off by someone who didn't do the work.",
    slot: "S3-04-VERIFY",
  },
  {
    index: "05",
    title: "Document",
    tags: ["motors"],
    body: "What was damaged, what was replaced, what was inspected. It becomes the Vehicle Record that travels with the car.",
    slot: "S3-05-DOCUMENT",
  },
  {
    index: "06",
    title: "Return to Road",
    tags: ["motors"],
    body: "Priced for what it is: a rebuilt title, done right. Listed with the record attached.",
    slot: "S3-06-ROAD",
  },
];
