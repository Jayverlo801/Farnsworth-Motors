import type { Vehicle } from "@/types/vehicle";

/**
 * SAMPLE INVENTORY — placeholder content for design and development.
 * Replace with real vehicles (or wire to a database) before launch.
 * The homepage consumes this dynamically; nothing is hard-coded in sections.
 */
export const vehicles: Vehicle[] = [
  {
    id: "fm-0107",
    slug: "2023-volkswagen-jetta-sel",
    recordNo: "FM-0107",
    year: 2023,
    make: "Volkswagen",
    model: "Jetta",
    trim: "SEL",
    vin: "3VW7M7BU8PM000000",
    vinMasked: "3VW7M7BU•••••0000",
    mileage: 29184,
    drivetrain: "FWD",
    engine: "1.5L TSI turbo I4",
    transmission: "8-speed automatic",
    exteriorColor: "Deep Black Pearl",
    interiorColor: "Titan Black leather",
    price: 15900,
    titleStatus: "Rebuilt",
    status: "available",
    location: "Salt Lake City, UT",
    description:
      "One-owner Jetta SEL acquired after a right-front impact. Repaired with OEM bolt-on components, refinished, and returned to alignment specification. Full intake and repair photo sets are part of the record.",
    features: [
      "Digital Cockpit Pro",
      "Ventilated front seats",
      "BeatsAudio",
      "Adaptive cruise control",
      "Heated steering wheel",
    ],
    record: {
      acquisitionRecord: "Insurance auction — Q1 2026",
      damageClassification: "Right-front impact",
      damageSummary:
        "Right-front corner damage: fascia, fender, and lamp assembly. No airbag deployment noted at intake.",
      repairSummary:
        "Fascia, right fender, and right headlamp assembly replaced. Hood refinished. Suspension inspected; alignment set to factory specification.",
      partsReplaced: [
        "Front fascia",
        "Right front fender",
        "Right headlamp assembly",
        "Right fender liner",
      ],
      inspectionStatus: "Utah rebuilt-title inspection — passed",
      documentation: ["Intake photos", "Repair photo log", "Parts invoices"],
    },
    beforeImages: [],
    repairImages: [],
    afterImages: [],
    dateListed: "2026-08-14",
    featured: true,
  },
  {
    id: "fm-0104",
    slug: "2022-toyota-camry-se",
    recordNo: "FM-0104",
    year: 2022,
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    vin: "4T1G11AK0NU000000",
    vinMasked: "4T1G11AK•••••0000",
    mileage: 41260,
    drivetrain: "FWD",
    engine: "2.5L I4",
    transmission: "8-speed automatic",
    exteriorColor: "Celestial Silver",
    interiorColor: "Black SofTex",
    price: 17400,
    titleStatus: "Rebuilt",
    status: "available",
    location: "Salt Lake City, UT",
    description:
      "Camry SE with rear-quarter damage repaired using OEM panels, refinished, and inspected. Drives without fault; records available on request.",
    features: [
      "Toyota Safety Sense 2.5+",
      "Sport-tuned suspension",
      "Apple CarPlay / Android Auto",
      "LED headlights",
    ],
    record: {
      acquisitionRecord: "Insurance auction — Q4 2025",
      damageClassification: "Left-rear quarter impact",
      damageSummary:
        "Left-rear quarter and bumper cover damage. No structural rail involvement noted at intake.",
      repairSummary:
        "Quarter panel repaired and refinished; bumper cover and taillamp replaced. Rebuilt-title inspection completed.",
      partsReplaced: ["Rear bumper cover", "Left taillamp assembly"],
      inspectionStatus: "Utah rebuilt-title inspection — passed",
      documentation: ["Intake photos", "Repair photo log"],
    },
    beforeImages: [],
    repairImages: [],
    afterImages: [],
    dateListed: "2026-07-30",
  },
  {
    id: "fm-0102",
    slug: "2021-mazda-cx-5-touring",
    recordNo: "FM-0102",
    year: 2021,
    make: "Mazda",
    model: "CX-5",
    trim: "Touring AWD",
    vin: "JM3KFBCM0M0000000",
    vinMasked: "JM3KFBCM•••••0000",
    mileage: 38112,
    drivetrain: "AWD",
    engine: "2.5L Skyactiv-G I4",
    transmission: "6-speed automatic",
    exteriorColor: "Machine Gray Metallic",
    interiorColor: "Black leatherette",
    price: 16800,
    titleStatus: "Rebuilt",
    status: "available",
    location: "Salt Lake City, UT",
    description:
      "CX-5 Touring AWD acquired with front-end damage limited to bolt-on components. Repaired with OEM parts and refinished; all-wheel-drive system inspected and verified.",
    features: [
      "i-Activ AWD",
      "Heated front seats",
      "Blind-spot monitoring",
      "Power liftgate",
    ],
    record: {
      acquisitionRecord: "Dealer trade — Q3 2025",
      damageClassification: "Front impact — bolt-on components",
      damageSummary:
        "Front fascia, grille, and hood damage. Radiator support intact at intake.",
      repairSummary:
        "Fascia, grille, and hood replaced with OEM components and refinished. Cooling system pressure-tested.",
      partsReplaced: ["Front fascia", "Grille", "Hood"],
      inspectionStatus: "Utah rebuilt-title inspection — passed",
      documentation: ["Intake photos", "Parts invoices"],
    },
    beforeImages: [],
    repairImages: [],
    afterImages: [],
    dateListed: "2026-07-11",
  },
];

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}

export function getFeatured(): Vehicle {
  return vehicles.find((v) => v.featured) ?? vehicles[0];
}

export function getAvailable(): Vehicle[] {
  return vehicles.filter((v) => v.status === "available");
}
