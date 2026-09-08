import Hero from "@/components/hero/Hero";
import { Navigation } from "@/components/navigation/Navigation";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { BrandStatement } from "@/components/sections/BrandStatement";
import { FarnsworthPrinciples } from "@/components/sections/FarnsworthPrinciples";
import { FeaturedVehicle } from "@/components/sections/FeaturedVehicle";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { InventoryPreview } from "@/components/sections/InventoryPreview";
import { RestorationProcess } from "@/components/sections/RestorationProcess";
import { VehicleRecord } from "@/components/sections/VehicleRecord";
import { WhyRebuilt } from "@/components/sections/WhyRebuilt";

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main">
        <Hero />
        <BrandStatement />
        <FeaturedVehicle />
        <RestorationProcess />
        <VehicleRecord />
        <BeforeAfter />
        <InventoryPreview />
        <WhyRebuilt />
        <FarnsworthPrinciples />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
