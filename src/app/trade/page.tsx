import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trade a Vehicle",
  description:
    "Trade your current vehicle toward a documented rebuilt vehicle from Farnsworth Motors.",
};

export default function TradePage() {
  return (
    <PageShell
      eyebrow="Trade"
      title={
        <>
          TRADE TOWARD
          <br />
          YOUR NEXT CAR.
        </>
      }
      intro="Put your current vehicle toward any car in our inventory. Tell us what you drive and which vehicle you are considering."
    >
      <Reveal delay={140}>
        <div className="mt-12 flex flex-wrap gap-4">
          <Button
            href={`mailto:${site.email}?subject=${encodeURIComponent("Trade inquiry")}`}
          >
            Start a trade inquiry
          </Button>
          <Button href="/inventory" variant="ghost">
            Browse inventory
          </Button>
        </div>
      </Reveal>
    </PageShell>
  );
}
