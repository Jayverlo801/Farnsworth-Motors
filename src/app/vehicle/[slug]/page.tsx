import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/Button";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { RecordCard } from "@/components/ui/RecordCard";
import { Reveal } from "@/components/ui/Reveal";
import { fmtMiles, fmtPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { getAllVehicles, getVehicleBySlug } from "@/lib/vehicles/source";
import { titleLabel, vehicleName } from "@/lib/vehicles/types";

interface Params {
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  return (await getAllVehicles()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) return {};
  return {
    // Rebuilt title stated plainly in every listing title — the Standard.
    title: `${vehicleName(v)} — ${titleLabel(v)}`,
    description: v.description,
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) notFound();

  const specs: Array<[string, string]> = [
    ["Mileage", fmtMiles(v.mileage)],
    ["Drivetrain", v.drivetrain],
    ["Engine", v.engine],
    ["Exterior", v.exteriorColor],
    ["Interior", v.interiorColor],
    ["Location", v.location],
    ["Listed", v.dateListed],
  ];

  return (
    <>
      <Navigation />
      <main id="main" className="pt-36 pb-32">
        <div className="wrap">
          <Reveal>
            <Link href="/inventory" className="hero-cta !mt-0">
              <span aria-hidden="true">←</span>Inventory
            </Link>
            <div className="mt-10 flex flex-wrap items-start justify-between gap-8">
              <div>
                <p className="font-mono text-sm tracking-[0.3em] text-muted">{v.year}</p>
                <h1 className="display-sm mt-3">
                  {v.make} {v.model}
                  {v.trim ? ` ${v.trim}` : ""}
                </h1>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <span className="text-2xl font-semibold text-ink">{fmtPrice(v.price)}</span>
                  <span
                    className={`badge ${v.titleStatus === "rebuilt" ? "badge-rebuilt" : "badge-neutral"}`}
                  >
                    {titleLabel(v)}
                  </span>
                  <span className="badge badge-neutral">{v.id}</span>
                </div>
              </div>
              <Button
                href={`mailto:${site.email}?subject=${encodeURIComponent(`Inquiry — ${vehicleName(v)} (${v.id})`)}`}
              >
                Inquire
              </Button>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-16">
              <PhotoFrame
                slot={`VEHICLE-${v.id}-HERO`}
                ratio="21 / 9"
                src={v.media.hero}
                alt={vehicleName(v)}
              />
            </div>
          </Reveal>

          <div className="mt-20 grid gap-16 lg:grid-cols-[6fr_5fr] lg:gap-24">
            <div>
              <Reveal>
                <p className="eyebrow mb-6">Overview</p>
                <p className="max-w-xl text-lg leading-relaxed text-muted">{v.description}</p>
              </Reveal>
              <Reveal delay={100}>
                <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-line pt-9 sm:grid-cols-3">
                  {specs.map(([k, val]) => (
                    <div key={k}>
                      <dt className="font-mono text-[10.5px] tracking-[0.24em] text-muted uppercase">
                        {k}
                      </dt>
                      <dd className="mt-2 text-sm text-ink">{val}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
              {v.features.length > 0 && (
                <Reveal delay={160}>
                  <p className="eyebrow mt-14 mb-6">Equipment</p>
                  <ul className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {v.features.map((feat) => (
                      <li key={feat} className="border-t border-line pt-3 text-sm text-muted">
                        {feat}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>

            <Reveal delay={200}>
              <RecordCard vehicle={v} />
              <Link
                href={`/vehicle/${v.slug}/record`}
                className="hero-cta !mt-8"
              >
                Full record<span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
