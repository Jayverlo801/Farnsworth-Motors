import { CarSvg } from "@/components/car/CarSvg";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export function FinalCTA() {
  return (
    <section id="contact" className="cta">
      <div className="cta-car" aria-hidden="true">
        <CarSvg idPrefix="cta" shadow={false} />
      </div>
      <div className="wrap relative py-32 text-center">
        <Reveal>
          <p className="eyebrow mb-8">06 / Next</p>
          <h2 className="display">
            FIND YOUR
            <br />
            NEXT CAR.
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button href="/inventory">Explore Inventory</Button>
            <Button
              href="/sell"
              variant="ghost"
            >
              Sell / Trade a Vehicle
            </Button>
          </div>
          <p className="mt-10 font-mono text-[11px] tracking-[0.3em] text-muted uppercase">
            {site.location} · {site.languages}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
