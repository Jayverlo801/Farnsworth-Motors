import Link from "next/link";
import { fmtMiles, fmtPrice } from "@/lib/format";
import { getAvailableVehicles, getFeaturedVehicle } from "@/lib/vehicles/source";
import { titleLabel, vehicleName } from "@/lib/vehicles/types";
import { Reveal } from "@/components/ui/Reveal";
import { StudioCar } from "@/components/ui/StudioCar";
import { VehicleCard } from "@/components/ui/VehicleCard";

/**
 * Homepage chapter: the product. One featured vehicle carries the section;
 * the rest of the lot is a quiet typographic row and a link to /inventory.
 */
export async function Available() {
  const featured = await getFeaturedVehicle();
  const others = (await getAvailableVehicles())
    .filter((v) => v.slug !== featured.slug)
    .slice(0, 2);

  const meta: Array<[string, string]> = [
    ["Mileage", fmtMiles(featured.mileage)],
    ["Title", titleLabel(featured)],
    ["Drivetrain", featured.drivetrain],
    ["Location", featured.location],
  ];

  return (
    <section id="available" className="sect bg-bg2/40">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Reveal>
            <p className="eyebrow mb-6">Inventory</p>
            <h2 className="t-headline">On the lot now.</h2>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/inventory" className="hero-cta !mt-0">
              Every car, with its record<span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        {/* the featured vehicle owns the viewport */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="t-data text-sm text-muted">{featured.year}</p>
              <h3 className="display-sm mt-3">
                {featured.make} {featured.model}
                {featured.trim ? ` ${featured.trim}` : ""}
              </h3>
            </Reveal>
            <Reveal delay={110}>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="text-2xl font-semibold text-ink">{fmtPrice(featured.price)}</span>
                <span className={`badge ${featured.titleStatus === "rebuilt" ? "badge-rebuilt" : "badge-neutral"}`}>
                  {titleLabel(featured)}
                </span>
              </div>
              <Link href={`/vehicle/${featured.slug}`} className="hero-cta !mt-8">
                View this car<span aria-hidden="true">→</span>
              </Link>
            </Reveal>
            <Reveal delay={200}>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-7 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {meta.map(([k, val]) => (
                  <div key={k}>
                    <dt className="t-data text-[10.5px] tracking-[0.14em] text-muted uppercase">{k}</dt>
                    <dd className="mt-2 text-sm text-ink">{val}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <StudioCar idPrefix="featured" />
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="t-data text-[10.5px] text-muted">
                Illustration — studio photography of this car is in progress.
              </p>
              <p className="t-data shrink-0 text-[10.5px] tracking-[0.14em] text-muted uppercase">
                {featured.id} · {vehicleName(featured)}
              </p>
            </div>
          </Reveal>
        </div>

        {/* the rest of the lot, quietly */}
        {others.length > 0 && (
          <div className="mt-20 grid gap-x-12 gap-y-10 border-t border-line pt-12 sm:grid-cols-2">
            {others.map((v, i) => (
              <Reveal key={v.id} delay={i * 110}>
                <VehicleCard vehicle={v} art={false} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
