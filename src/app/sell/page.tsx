import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sell Your Vehicle",
  description:
    "Sell a damaged or running vehicle to Farnsworth Motors, Salt Lake City.",
};

export default function SellPage() {
  return (
    <PageShell
      eyebrow="Sell"
      title={
        <>
          Sell us
          <br />
          your car.
        </>
      }
      intro="Damaged, running, or somewhere in between — if the economics make sense, we buy it. Send the basics and we respond with a real number."
    >
      <Reveal delay={140}>
        <div className="mt-12 flex flex-wrap gap-4">
          <Button
            href={`mailto:${site.email}?subject=${encodeURIComponent("Sell my vehicle")}`}
          >
            Start with an email
          </Button>
          <Button href="/trade" variant="ghost">
            Trading instead?
          </Button>
        </div>
        <p className="mt-8 max-w-md font-mono text-[11px] leading-relaxed tracking-[0.18em] text-muted uppercase">
          Include year · make · model · mileage · condition · photos
        </p>
      </Reveal>
    </PageShell>
  );
}
