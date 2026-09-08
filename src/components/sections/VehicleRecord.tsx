import type { ReactNode } from "react";
import { getFeaturedVehicle } from "@/lib/vehicles/source";
import { RecordCard } from "@/components/ui/RecordCard";
import { RecordDiagram } from "@/components/ui/RecordDiagram";
import { Reveal } from "@/components/ui/Reveal";

/**
 * S4 — the credibility mechanism. Accepts an optional `diagram` (SVG string
 * or component with contract part ids) so the 3D build can supply a top-view
 * version; defaults to the side-elevation coupe.
 */
export async function VehicleRecord({ diagram }: { diagram?: ReactNode | string }) {
  const v = await getFeaturedVehicle();

  return (
    <section id="records" className="sect">
      <div className="wrap grid items-start gap-16 lg:grid-cols-[5fr_6fr] lg:gap-24">
        <div className="lg:sticky lg:top-28">
          <Reveal>
            <p className="eyebrow mb-7">04 / The Vehicle Record</p>
            <h2 className="t-headline">
              KNOW WHAT
              <br />
              HAPPENED
              <br />
              TO THE CAR.
            </h2>
          </Reveal>
          <Reveal delay={130}>
            <p className="t-lede mt-10 max-w-md">
              Every rebuilt vehicle has a story. We would rather show it than
              hide it — so each car carries a record of where it came from,
              what was damaged, and what it took to bring it back.
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              Transparency is the luxury signal.
            </p>
          </Reveal>
        </div>

        <div>
          <Reveal delay={160}>
            <RecordDiagram vehicle={v} diagram={diagram} className="mb-8" />
          </Reveal>
          <Reveal delay={220}>
            <RecordCard vehicle={v} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
