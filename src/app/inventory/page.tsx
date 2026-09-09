import type { Metadata } from "next";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { getAvailableVehicles } from "@/lib/vehicles/source";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Available rebuilt vehicles from Farnsworth Motors — each with a documented history.",
};

export default async function InventoryPage() {
  const inventory = await getAvailableVehicles();

  return (
    <>
      <Navigation />
      <main id="main" className="pt-40 pb-32">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow mb-7">Inventory</p>
            <h1 className="t-headline">On the lot now.</h1>
            <p className="mt-6 font-mono text-[12px] tracking-[0.3em] text-muted uppercase">
              {inventory.length} vehicle{inventory.length === 1 ? "" : "s"} ·
              Salt Lake City, Utah
            </p>
          </Reveal>
          <div className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {inventory.map((v, i) => (
              <Reveal key={v.id} delay={i * 100}>
                <VehicleCard vehicle={v} />
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
