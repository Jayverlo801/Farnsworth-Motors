import Hero from "@/components/hero/Hero";
import { Navigation } from "@/components/navigation/Navigation";
import { Available } from "@/components/sections/Available";
import { BrandStatement } from "@/components/sections/BrandStatement";
import { FarnsworthPrinciples } from "@/components/sections/FarnsworthPrinciples";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { ProcessStrip } from "@/components/sections/ProcessStrip";
import { RecordTeaser } from "@/components/sections/RecordTeaser";
import { UmbrellaBand } from "@/components/sections/UmbrellaBand";

/**
 * The homepage is the brand story, not the whole site: each chapter is one
 * beat that routes deeper — /process carries the full sequence and the
 * umbrella, the vehicle pages carry the full record and the before/after,
 * /about carries the economics argument.
 *
 * Arc: identity → philosophy → how → proof → product → standard → action.
 */
export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main">
        <Hero />
        <BrandStatement />
        <ProcessStrip />
        <UmbrellaBand />
        <RecordTeaser />
        <Available />
        <FarnsworthPrinciples />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
