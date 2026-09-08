import type { Vehicle } from "./types";
import type { VehicleSource } from "./source";

/**
 * SAMPLE INVENTORY — placeholder content for design and development.
 * Swap for the Supabase source (see supabase-source.ts) or replace these
 * rows with real vehicles before launch.
 */
const VEHICLES: Vehicle[] = [
  {
    id: "FM-0107",
    slug: "2023-volkswagen-jetta-sel",
    year: 2023,
    make: "Volkswagen",
    model: "Jetta",
    trim: "SEL",
    vin: "3VW7M7BU8PM021042",
    mileage: 29184,
    drivetrain: "FWD",
    engine: "1.5L TSI turbo I4",
    exteriorColor: "Deep Black Pearl",
    interiorColor: "Titan Black leather",
    price: 15900,
    titleStatus: "rebuilt",
    status: "available",
    featured: true,
    description:
      "One-owner Jetta SEL acquired after a right-front impact. Repaired in our own shops with OEM bolt-on components, refinished, and returned to alignment specification. Full intake and repair photo sets are part of the record.",
    features: [
      "Digital Cockpit Pro",
      "Ventilated front seats",
      "BeatsAudio",
      "Adaptive cruise control",
      "Heated steering wheel",
    ],
    location: "Salt Lake City, UT",
    dateListed: "2026-08-14",
    record: {
      acquisition: "Insurance auction — Q1 2026",
      damageClassification: "Right-front impact — bolt-on components",
      structuralAffected: false,
      mechanicalAffected: false,
      repairSummary:
        "Fascia, right fender, and right headlamp assembly replaced with OEM parts. Hood refinished. Suspension inspected; alignment set to factory specification.",
      partsReplaced: [
        { name: "Front fascia", oem: true, partId: "front_bumper" },
        { name: "Right front fender", oem: true, partId: "hood" },
        { name: "Right headlamp assembly", oem: true, partId: "headlight" },
        { name: "Right fender liner", oem: true },
      ],
      inspectionStatus: "Utah rebuilt-title inspection — passed",
      documentation: [
        { label: "Intake photos", url: "#" },
        { label: "Repair photo log", url: "#" },
        { label: "Parts invoices", url: "#" },
      ],
    },
    media: { gallery: [], before: [], repair: [], after: [] },
  },
  {
    id: "FM-0104",
    slug: "2022-toyota-camry-se",
    year: 2022,
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    vin: "4T1G11AK0NU714233",
    mileage: 41260,
    drivetrain: "FWD",
    engine: "2.5L I4",
    exteriorColor: "Celestial Silver",
    interiorColor: "Black SofTex",
    price: 17400,
    titleStatus: "rebuilt",
    status: "available",
    description:
      "Camry SE with rear-quarter damage repaired in our own shops with OEM panels, refinished, and inspected. Drives without fault; records available on request.",
    features: [
      "Toyota Safety Sense 2.5+",
      "Sport-tuned suspension",
      "Apple CarPlay / Android Auto",
      "LED headlights",
    ],
    location: "Salt Lake City, UT",
    dateListed: "2026-07-30",
    record: {
      acquisition: "Insurance auction — Q4 2025",
      damageClassification: "Left-rear quarter impact",
      structuralAffected: false,
      mechanicalAffected: false,
      repairSummary:
        "Quarter panel repaired and refinished; bumper cover and taillamp replaced with OEM parts. Rebuilt-title inspection completed.",
      partsReplaced: [
        { name: "Rear bumper cover", oem: true, partId: "rear_bumper" },
        { name: "Left taillamp assembly", oem: true, partId: "taillight" },
      ],
      inspectionStatus: "Utah rebuilt-title inspection — passed",
      documentation: [
        { label: "Intake photos", url: "#" },
        { label: "Repair photo log", url: "#" },
      ],
    },
    media: { gallery: [], before: [], repair: [], after: [] },
  },
  {
    id: "FM-0102",
    slug: "2021-mazda-cx-5-touring",
    year: 2021,
    make: "Mazda",
    model: "CX-5",
    trim: "Touring AWD",
    vin: "JM3KFBCM0M1308854",
    mileage: 38112,
    drivetrain: "AWD",
    engine: "2.5L Skyactiv-G I4",
    exteriorColor: "Machine Gray Metallic",
    interiorColor: "Black leatherette",
    price: 16800,
    titleStatus: "rebuilt",
    status: "available",
    description:
      "CX-5 Touring AWD acquired with front-end damage limited to bolt-on components. Repaired in our own shops with OEM parts and refinished; all-wheel-drive system inspected and verified.",
    features: [
      "i-Activ AWD",
      "Heated front seats",
      "Blind-spot monitoring",
      "Power liftgate",
    ],
    location: "Salt Lake City, UT",
    dateListed: "2026-07-11",
    record: {
      acquisition: "Dealer trade — Q3 2025",
      damageClassification: "Front impact — bolt-on components",
      structuralAffected: false,
      mechanicalAffected: false,
      repairSummary:
        "Fascia, grille, and hood replaced with OEM components and refinished. Cooling system pressure-tested.",
      partsReplaced: [
        { name: "Front fascia", oem: true, partId: "front_bumper" },
        { name: "Grille", oem: true, partId: "front_bumper" },
        { name: "Hood", oem: true, partId: "hood" },
      ],
      inspectionStatus: "Utah rebuilt-title inspection — passed",
      documentation: [
        { label: "Intake photos", url: "#" },
        { label: "Parts invoices", url: "#" },
      ],
    },
    media: { gallery: [], before: [], repair: [], after: [] },
  },
];

export const staticSource: VehicleSource = {
  async getAll() {
    return VEHICLES;
  },
  async getBySlug(slug: string) {
    return VEHICLES.find((v) => v.slug === slug) ?? null;
  },
};
