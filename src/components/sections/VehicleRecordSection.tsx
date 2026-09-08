import { getFeaturedVehicle } from "@/lib/vehicles/source";
import { RecordCard } from "@/components/ui/RecordCard";
import { Reveal } from "@/components/ui/Reveal";

export async function VehicleRecordSection() {
  const v = await getFeaturedVehicle();

  return (
    <section id="records" className="sect">
      <div className="wrap grid items-start gap-16 lg:grid-cols-[5fr_6fr] lg:gap-24">
        <div className="lg:sticky lg:top-28">
          <Reveal>
            <p className="eyebrow mb-7">04 / The Vehicle Record</p>
            <h2 className="display">
              KNOW WHAT
              <br />
              HAPPENED
              <br />
              TO THE CAR.
            </h2>
          </Reveal>
          <Reveal delay={130}>
            <p className="mt-10 max-w-md text-lg leading-relaxed text-muted">
              Every rebuilt vehicle has a story. We would rather show it than
              hide it — so each car carries a record of where it came from,
              what was damaged, and what it took to bring it back.
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted/70">
              Transparency is the luxury signal.
            </p>
          </Reveal>
        </div>

        <Reveal delay={180}>
          <RecordCard vehicle={v} />
        </Reveal>
      </div>
    </section>
  );
}
