import Link from "next/link";
import { fmtMiles, fmtPrice } from "@/lib/format";
import { getAvailableVehicles, getFeaturedVehicle } from "@/lib/vehicles/source";
import { titleLabel, vehicleName } from "@/lib/vehicles/types";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollScale } from "@/components/ui/ScrollScale";
import { VehicleCard } from "@/components/ui/VehicleCard";

/**
 * Homepage chapter: the product. One featured vehicle carries the section;
 * the rest of the lot is a quiet row beneath it and a link to /inventory.
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
            <p className="eyebrow mb-7">04 / Available</p>
            <h2 className="t-headline">AVAILABLE</h2>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/inventory" className="hero-cta !mt-0">
              All vehicles<span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        {/* the featured vehicle owns the viewport */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="font-mono text-sm tracking-[0.3em] text-muted">{featured.year}</p>
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
                View Vehicle<span aria-hidden="true">→</span>
              </Link>
            </Reveal>
            <Reveal delay={200}>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-7 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {meta.map(([k, val]) => (
                  <div key={k}>
                    <dt className="font-mono text-[10.5px] tracking-[0.24em] text-muted uppercase">{k}</dt>
                    <dd className="mt-2 text-sm text-ink">{val}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <ScrollScale className="rounded-[18px]">
              <PhotoFrame
                slot="S2-FEATURED"
                ratio="16 / 10"
                src={featured.media.hero}
                alt={vehicleName(featured)}
                sizes="(max-width: 1024px) 92vw, 58vw"
              />
            </ScrollScale>
            <p className="mt-4 text-right font-mono text-[10.5px] tracking-[0.24em] text-muted uppercase">
              {featured.id} · {vehicleName(featured)}
            </p>
          </Reveal>
        </div>

        {/* the rest of the lot, quietly */}
        {others.length > 0 && (
          <div className="mt-20 grid gap-x-8 gap-y-14 border-t border-line pt-14 sm:grid-cols-2">
            {others.map((v, i) => (
              <Reveal key={v.id} delay={i * 110}>
                <VehicleCard vehicle={v} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
