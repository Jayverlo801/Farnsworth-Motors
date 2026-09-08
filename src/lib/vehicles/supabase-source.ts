import type { Vehicle, VehicleMedia, VehicleRecord } from "./types";
import type { VehicleSource } from "./source";

/**
 * Supabase adapter — talks to PostgREST directly so no SDK dependency is
 * required. Enable with:
 *   VEHICLE_SOURCE=supabase
 *   SUPABASE_URL=https://<project>.supabase.co
 *   SUPABASE_ANON_KEY=<anon key>
 * Schema: supabase/schema.sql
 */

interface VehicleRow {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  vin: string;
  mileage: number;
  drivetrain: string;
  engine: string;
  exterior_color: string;
  interior_color: string;
  price: number;
  title_status: Vehicle["titleStatus"];
  status: Vehicle["status"];
  featured: boolean | null;
  description: string;
  features: string[] | null;
  location: string;
  date_listed: string;
  record: VehicleRecord;
  media: VehicleMedia | null;
}

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[vehicles] VEHICLE_SOURCE=supabase requires ${name} — see src/lib/vehicles/supabase-source.ts`
    );
  }
  return value;
}

function mapRow(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    slug: row.slug,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim ?? undefined,
    vin: row.vin,
    mileage: row.mileage,
    drivetrain: row.drivetrain,
    engine: row.engine,
    exteriorColor: row.exterior_color,
    interiorColor: row.interior_color,
    price: row.price,
    titleStatus: row.title_status,
    status: row.status,
    featured: row.featured ?? undefined,
    description: row.description,
    features: row.features ?? [],
    location: row.location,
    dateListed: row.date_listed,
    record: row.record,
    media: row.media ?? { gallery: [], before: [], repair: [], after: [] },
  };
}

async function rest(path: string): Promise<VehicleRow[]> {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_ANON_KEY");
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`[vehicles] Supabase request failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as VehicleRow[];
}

export const supabaseSource: VehicleSource = {
  async getAll() {
    const rows = await rest("vehicles?select=*&order=date_listed.desc");
    return rows.map(mapRow);
  },
  async getBySlug(slug: string) {
    const rows = await rest(`vehicles?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    return rows.length ? mapRow(rows[0]) : null;
  },
};
