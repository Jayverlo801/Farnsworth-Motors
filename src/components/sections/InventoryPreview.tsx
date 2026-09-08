import Link from "next/link";
import { getAvailable } from "@/data/vehicles";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleCard } from "@/components/ui/VehicleCard";

export function InventoryPreview() {
  const inventory = getAvailable().slice(0, 3);

  return (
    <section id="available" className="sect bg-bg2/40">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading index="06" label="Inventory" title="AVAILABLE" />
          <Reveal delay={120}>
            <Link href="/inventory" className="hero-cta !mt-0">
              All vehicles<span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {inventory.map((v, i) => (
            <Reveal key={v.id} delay={i * 120}>
              <VehicleCard vehicle={v} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
