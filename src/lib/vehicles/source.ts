import type { Vehicle } from "./types";

/**
 * Swappable inventory source. The site talks only to this module — the
 * static JSON source ships today; the Supabase adapter takes over by setting
 * VEHICLE_SOURCE=supabase (see supabase-source.ts and supabase/schema.sql).
 */
export interface VehicleSource {
  getAll(): Promise<Vehicle[]>;
  getBySlug(slug: string): Promise<Vehicle | null>;
}

/**
 * The Farnsworth Standard, in code: a vehicle whose record shows structural
 * damage is never offered as available, regardless of what the source says.
 */
export function enforceStandard(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.filter((v) => {
    if (v.status === "available" && v.record.structuralAffected) {
      console.warn(
        `[vehicles] ${v.id} (${v.slug}) is structurally affected and cannot be listed as available — withheld.`
      );
      return false;
    }
    return true;
  });
}

async function resolveSource(): Promise<VehicleSource> {
  if (process.env.VEHICLE_SOURCE === "supabase") {
    const { supabaseSource } = await import("./supabase-source");
    return supabaseSource;
  }
  const { staticSource } = await import("./static-source");
  return staticSource;
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  const source = await resolveSource();
  return enforceStandard(await source.getAll());
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  return (await getAllVehicles()).filter((v) => v.status === "available");
}

export async function getFeaturedVehicle(): Promise<Vehicle> {
  const all = await getAvailableVehicles();
  const featured = all.find((v) => v.featured) ?? all[0];
  if (!featured) throw new Error("[vehicles] no available vehicles in source");
  return featured;
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const source = await resolveSource();
  const v = await source.getBySlug(slug);
  if (!v) return null;
  return enforceStandard([v])[0] ?? null;
}
