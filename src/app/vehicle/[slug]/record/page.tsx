import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { BeforeAfterSlider } from "@/components/sections/BeforeAfterSlider";
import { RecordCard } from "@/components/ui/RecordCard";
import { RecordDiagram } from "@/components/ui/RecordDiagram";
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
              <RecordDiagram vehicle={v} className="mb-8" />
              <RecordCard vehicle={v} />
            </div>
          </Reveal>

          <Reveal delay={180}>
            <h2 className="t-title mt-16 text-ink">SAME CAR. DIFFERENT CHAPTER.</h2>
            <p className="t-body mt-3 max-w-md text-muted">
              Drag to compare intake against delivery. Photo sets replace the
              drawing as they are digitized for this record.
            </p>
            <div className="mt-8">
              <BeforeAfterSlider />
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
