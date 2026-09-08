import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { RecordCard } from "@/components/ui/RecordCard";
import { Reveal } from "@/components/ui/Reveal";
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
    title: `Vehicle Record — ${vehicleName(v)} (${titleLabel(v)})`,
    description: `The documented history of ${vehicleName(v)}: acquisition, damage, repair, and inspection.`,
  };
}

export default async function VehicleRecordPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) notFound();

  return (
    <>
      <Navigation />
      <main id="main" className="pt-36 pb-32">
        <div className="wrap max-w-4xl">
          <Reveal>
            <Link href={`/vehicle/${v.slug}`} className="hero-cta !mt-0">
              <span aria-hidden="true">←</span>
              {vehicleName(v)}
            </Link>
            <h1 className="display-sm mt-10">
              VEHICLE RECORD
            </h1>
            <p className="mt-4 font-mono text-[12px] tracking-[0.3em] text-muted uppercase">
              {v.id} · {vehicleName(v)} · {titleLabel(v)}
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-14">
              <RecordCard vehicle={v} />
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-5">Intake</p>
                <PhotoFrame
                  slot={`RECORD-${v.id}-BEFORE`}
                  ratio="4 / 3"
                  src={v.media.before[0]}
                  alt={`${vehicleName(v)} at intake`}
                  sizes="(max-width: 640px) 92vw, 45vw"
                />
              </div>
              <div>
                <p className="eyebrow mb-5">Delivery</p>
                <PhotoFrame
                  slot={`RECORD-${v.id}-AFTER`}
                  ratio="4 / 3"
                  src={v.media.after[0]}
                  alt={`${vehicleName(v)} at delivery`}
                  sizes="(max-width: 640px) 92vw, 45vw"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
