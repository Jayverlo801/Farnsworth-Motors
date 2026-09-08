import Image from "next/image";
import Link from "next/link";
import { CarSvg } from "@/components/car/CarSvg";
import { fmtMiles, fmtPrice } from "@/lib/format";
import { vehicleName, type Vehicle } from "@/types/vehicle";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link href={`/vehicle/${vehicle.slug}`} className="vcard group">
      <div className="vcard-art">
        {vehicle.heroImage ? (
          <Image
            src={vehicle.heroImage}
            alt={vehicleName(vehicle)}
            fill
            sizes="(max-width: 768px) 92vw, 30vw"
            className="object-cover"
          />
        ) : (
          <CarSvg idPrefix={`card-${vehicle.slug}`} shadow={false} />
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <h3 className="text-[15px] font-medium tracking-wide text-ink">
          {vehicleName(vehicle)}
        </h3>
        <span
          className={`badge shrink-0 ${vehicle.titleStatus === "Rebuilt" ? "badge-rebuilt" : "badge-neutral"}`}
        >
          {vehicle.titleStatus}
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
