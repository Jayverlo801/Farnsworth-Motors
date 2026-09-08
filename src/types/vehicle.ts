export type TitleStatus = "Rebuilt" | "Clean" | "Salvage — in restoration";

export type VehicleStatus = "available" | "pending" | "sold" | "in-restoration";

/**
 * The Farnsworth Vehicle Record: only ever populated with documentation the
 * business actually possesses. Fields are optional so nothing is fabricated —
 * the UI renders what exists and stays quiet about what does not.
 */
export interface VehicleRecordInfo {
  acquisitionRecord?: string;
  damageClassification?: string;
  damageSummary?: string;
  repairSummary?: string;
  partsReplaced?: string[];
  inspectionStatus?: string;
  documentation?: string[];
}

export interface Vehicle {
  id: string;
  slug: string;
  /** Farnsworth record number, e.g. "FM-0107". */
  recordNo: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin: string;
  /** Public-facing masked VIN. */
  vinMasked: string;
  mileage: number;
  drivetrain: string;
  engine: string;
  transmission?: string;
  exteriorColor: string;
  interiorColor: string;
  price: number;
  titleStatus: TitleStatus;
  status: VehicleStatus;
  location: string;
  description: string;
  features: string[];
  record: VehicleRecordInfo;
  /** Image paths under /public. Empty until real photography exists. */
  beforeImages: string[];
  repairImages: string[];
  afterImages: string[];
  /** Optional lead photo; cards fall back to the line-art silhouette. */
  heroImage?: string;
  dateListed: string;
  featured?: boolean;
}

export function vehicleName(v: Vehicle): string {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
}
