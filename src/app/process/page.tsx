import type { Metadata } from "next";
import { RestorationProcess } from "@/components/sections/RestorationProcess";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How Farnsworth Motors sources, restores, verifies, and documents every rebuilt vehicle.",
};

export default function ProcessPage() {
  return (
    <>
      <Navigation />
      <main id="main" className="pt-40 pb-16">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow mb-7">Our Process</p>
            <h1 className="display">FROM ARRIVAL TO ROAD.</h1>
          </Reveal>
        </div>
        <RestorationProcess />
      </main>
      <Footer />
    </>
  );
}
