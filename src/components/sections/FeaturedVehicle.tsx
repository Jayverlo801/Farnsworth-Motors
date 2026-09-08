import Link from "next/link";
import { getFeatured } from "@/data/vehicles";
import { fmtMiles, fmtPrice } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { StudioCar } from "@/components/ui/StudioCar";
import { vehicleName } from "@/types/vehicle";

export function FeaturedVehicle() {
  const v = getFeatured();

  const meta: Array<[string, string]> = [
    ["Mileage", fmtMiles(v.mileage)],
    ["Title", v.titleStatus],
    ["Drivetrain", v.drivetrain],
    ["Location", v.location],
  ];

  return (
    <section id="featured" className="sect">
      <div className="wrap grid items-center gap-14 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow mb-7">02 / Featured Vehicle</p>
            <p className="font-mono text-sm tracking-[0.3em] text-muted">{v.year}</p>
            <h2 className="display-sm mt-3">
              {v.make} {v.model}
              {v.trim ? ` ${v.trim}` : ""}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-2xl font-semibold text-ink">{fmtPrice(v.price)}</span>
              <span className={`badge ${v.titleStatus === "Rebuilt" ? "badge-rebuilt" : "badge-neutral"}`}>
                {v.titleStatus} title
              </span>
            </div>
            <Link
              href={`/vehicle/${v.slug}`}
              className="hero-cta !mt-9"
            >
              View Vehicle<span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <Reveal delay={220}>
            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
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
          <StudioCar idPrefix="featured" />
          <p className="mt-4 text-right font-mono text-[10.5px] tracking-[0.24em] text-muted/70 uppercase">
            {v.recordNo} · {vehicleName(v)}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
