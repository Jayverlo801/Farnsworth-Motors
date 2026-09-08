/**
 * The Farnsworth umbrella: one name over three operations. A rename is one
 * edit here. The umbrella is EXPLAINED only in the umbrella band of the
 * process section — everywhere else the divisions appear only as tags.
 */

export interface Division {
  /** Full lockup name, e.g. "FARNSWORTH COLLISION". */
  name: string;
  /** The division word alone, weight-400 half of the lockup. */
  word: string;
  /** Short tag used on process steps, record rows, footer. */
  tag: string;
  /** Mono descriptor under the lockup. */
  descriptor: string;
}

export const DIVISIONS = {
  motors: {
    name: "FARNSWORTH MOTORS",
    word: "MOTORS",
    tag: "MOTORS",
    descriptor: "Sales & Records",
  },
  collision: {
    name: "FARNSWORTH COLLISION",
    word: "COLLISION",
    tag: "COLLISION",
    descriptor: "Body & Paint",
  },
  service: {
    name: "FARNSWORTH SERVICE",
    word: "SERVICE",
    tag: "SERVICE",
    descriptor: "Mechanical & Inspection",
  },
} as const satisfies Record<string, Division>;

export type DivisionKey = keyof typeof DIVISIONS;

export const DIVISION_ORDER: DivisionKey[] = ["motors", "collision", "service"];

/** Footer line under the entity name. */
export const DIVISION_LINE = "Motors · Collision · Service — Salt Lake City, Utah";

/** Voice system — rendered on /brand; the rules everything is written by. */
export const VOICE = {
  summary:
    "Farnsworth sounds like a precise engineer who is proud of the work and has nothing to hide.",
  rules: [
    "Say the specific thing.",
    "Short sentences.",
    "Lead with the disclosure, then the deal.",
    "Never defensive about rebuilt titles.",
    "Plain English; real terms when they carry proof (OEM, structural, panel gap).",
  ],
  use: [
    "rebuilt",
    "record",
    "cosmetic",
    "structural",
    "OEM",
    "in-house",
    "inspected",
    "documented",
    "selected",
  ],
  never: [
    "salvage (as a selling word)",
    "like new",
    "mint",
    "flawless",
    "cheap",
    "deal",
    "no-haggle",
    "certified (unless a real program exists)",
    "luxury",
    "premium",
    "elite",
  ],
  spanish: "Se habla español.",
} as const;
