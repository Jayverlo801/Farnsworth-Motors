import Image from "next/image";
import Link from "next/link";
import { CarSvg } from "@/components/car/CarSvg";
import { fmtMiles, fmtPrice } from "@/lib/format";
import { titleLabel, vehicleName, type Vehicle } from "@/lib/vehicles/types";
import { ViewCursor } from "./ViewCursor";

interface VehicleCardProps {
  vehicle: Vehicle;
  /** false renders the typographic card — no art panel. */
  art?: boolean;
}

export function VehicleCard({ vehicle, art = true }: VehicleCardProps) {
  if (!art && !vehicle.media.hero) {
    return (
      <Link href={`/vehicle/${vehicle.slug}`} className="group block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="t-data text-[0.75rem] text-muted">{vehicle.year}</p>
            <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.01em] text-ink group-hover:underline group-hover:underline-offset-4">
              {vehicle.make} {vehicle.model}
              {vehicle.trim ? ` ${vehicle.trim}` : ""}
            </h3>
          </div>
          <span
            className={`badge shrink-0 ${vehicle.titleStatus === "rebuilt" ? "badge-rebuilt" : "badge-neutral"}`}
          >
            {titleLabel(vehicle)}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-4 font-mono text-[12.5px] tracking-wider text-muted">
          <span>
            {fmtMiles(vehicle.mileage)} · {vehicle.drivetrain}
          </span>
          <span className="text-ink">{fmtPrice(vehicle.price)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/vehicle/${vehicle.slug}`} className="vcard group">
      <ViewCursor>
        <div className="vcard-art">
          {vehicle.media.hero ? (
            <Image
              src={vehicle.media.hero}
              alt={vehicleName(vehicle)}
              fill
              sizes="(max-width: 768px) 92vw, 30vw"
              className="object-cover"
            />
          ) : (
            <CarSvg idPrefix={`card-${vehicle.slug}`} shadow={false} />
          )}
        </div>
      </ViewCursor>
      <div className="mt-5 flex items-start justify-between gap-4">
        <h3 className="text-[15px] font-medium tracking-wide text-ink">
          {vehicleName(vehicle)}
        </h3>
        <span
          className={`badge shrink-0 ${vehicle.titleStatus === "rebuilt" ? "badge-rebuilt" : "badge-neutral"}`}
        >
          {titleLabel(vehicle)}
        </span>
      </div>
      <div className="mt-2 flex items-baseline justify-between font-mono text-[12.5px] tracking-wider text-muted">
        <span>{fmtMiles(vehicle.mileage)}</span>
        <span className="text-ink">{fmtPrice(vehicle.price)}</span>
      </div>
      <p className="vcard-meta mt-2 font-mono text-[11px] tracking-widest text-muted uppercase">
        {vehicle.drivetrain} · {vehicle.engine} · {vehicle.location}
      </p>
    </Link>
  );
}
