/** Content model — v2 contract. The homepage consumes this dynamically. */

export type TitleStatus = "rebuilt" | "clean";
export type VehicleStatus = "available" | "pending" | "sold";

export interface PartReplaced {
  name: string;
  oem: boolean;
  partNumber?: string;
  /** Contract part id (docs/HERO-CONTRACT.md) — lights the record diagram. */
  partId?: string;
}

export interface DocumentationItem {
  label: string;
  url: string;
}

/**
 * The Farnsworth Vehicle Record. Only ever populated with documentation the
 * business actually holds — the UI renders what exists and never invents.
 */
export interface VehicleRecord {
  acquisition: string;
  damageClassification: string;
  structuralAffected: boolean;
  mechanicalAffected: boolean;
  repairSummary: string;
  partsReplaced: PartReplaced[];
  inspectionStatus: string;
  documentation: DocumentationItem[];
}

export interface VehicleMedia {
  hero?: string;
  gallery: string[];
  before: string[];
  repair: string[];
  after: string[];
}

export interface Vehicle {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin: string;
  mileage: number;
  drivetrain: string;
  engine: string;
  exteriorColor: string;
  interiorColor: string;
  price: number;
  titleStatus: TitleStatus;
  status: VehicleStatus;
  featured?: boolean;
  description: string;
  features: string[];
  location: string;
  dateListed: string;
  record: VehicleRecord;
  media: VehicleMedia;
}

export function vehicleName(v: Vehicle): string {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
}

/** Public-facing VIN: first 8 characters, then masked, last 4 visible. */
export function maskVin(vin: string): string {
  if (vin.length < 12) return vin;
  return `${vin.slice(0, 8)}•••••${vin.slice(-4)}`;
}

export function titleLabel(v: Vehicle): string {
  return v.titleStatus === "rebuilt" ? "Rebuilt title" : "Clean title";
}
