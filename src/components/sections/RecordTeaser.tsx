import Link from "next/link";
import { getFeaturedVehicle } from "@/lib/vehicles/source";
import { RecordDiagram } from "@/components/ui/RecordDiagram";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Homepage chapter: the credibility idea in one glance — the diagram, four
 * facts, one link. The full Vehicle Record lives on the vehicle pages.
 */
export async function RecordTeaser() {
  const v = await getFeaturedVehicle();
  const r = v.record;

  const rows: Array<[string, string]> = [
    ["Title status", "Rebuilt — Utah"],
    ["Damage", r.damageClassification],
    ["Parts replaced", `${r.partsReplaced.length} — all OEM`],
    ["Inspection", r.inspectionStatus],
  ];

  return (
    <section id="records" className="sect">
      <div className="wrap grid items-center gap-14 lg:grid-cols-[5fr_6fr] lg:gap-24">
        <div>
          <Reveal>
            <p className="eyebrow mb-7">03 / The Vehicle Record</p>
            <h2 className="t-headline">
              KNOW WHAT
              <br />
              HAPPENED
              <br />
              TO THE CAR.
            </h2>
          </Reveal>
          <Reveal delay={130}>
            <p className="t-lede mt-9 max-w-md">
              Every car we sell carries a record: where it came from, what was
              damaged, what was replaced, and who signed off. We would rather
              show it than hide it.
            </p>
            <Link href={`/vehicle/${v.slug}/record`} className="hero-cta !mt-9">
              See a full record<span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        <Reveal delay={180}>
          <RecordDiagram vehicle={v} />
          <div className="rec mt-6">
            <div>
              {rows.map(([k, val]) => (
                <div className="rec-row" key={k}>
                  <span className="rec-key">{k}</span>
                  <span className="rec-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
