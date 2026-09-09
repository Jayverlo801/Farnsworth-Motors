import type { DivisionKey } from "./brand";

interface DivisionContact {
  label: string;
  description: string;
  topics: readonly string[];
  preparation: string;
  email: string;
  phone: string;
  phoneHref: string;
}

/** Public contact details confirmed by the owner, kept separate by operation. */
export const CONTACTS: Record<DivisionKey, DivisionContact> = {
  motors: {
    label: "Dealership",
    description:
      "Find your next vehicle. Talk with us about availability, a test drive, or the history behind a car.",
    topics: ["Vehicle sales", "Test drives", "Vehicle records"],
    preparation: "Have a vehicle in mind? Include the listing or stock number.",
    email: "Sales@farnsworthmotors.com",
    phone: "(801) 520-0382",
    phoneHref: "tel:+18015200382",
  },
  collision: {
    label: "Autobody",
    description:
      "Get in touch about body damage, paint work, or a collision repair. We can discuss the next steps.",
    topics: ["Collision repair", "Body & paint", "Repair estimates"],
    preparation: "Include your vehicle’s year, make, model, and photos of the damage.",
    email: "Collision@farnsworthmotors.com",
    phone: "(801) 680-8795",
    phoneHref: "tel:+18016808795",
  },
  service: {
    label: "Mechanic",
    description:
      "Talk to our shop about a mechanical issue, an inspection, or service for your vehicle.",
    topics: ["Mechanical repairs", "Inspections", "Service appointments"],
    preparation: "Include your vehicle’s year, make, model, and what you’re noticing.",
    email: "Service@farnsworthmotors.com",
    phone: "(801) 520-0382",
    phoneHref: "tel:+18015200382",
  },
};
