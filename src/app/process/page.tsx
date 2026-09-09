import type { Metadata } from "next";
import { RestorationProcess } from "@/components/sections/RestorationProcess";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How Farnsworth Motors sources, rebuilds, verifies, and documents every rebuilt-title vehicle — all in-house in Salt Lake City.",
};

export default function ProcessPage() {
  return (
    <>
      <Navigation />
      <main id="main" className="pt-24">
        <RestorationProcess />
      </main>
      <Footer />
    </>
  );
}
