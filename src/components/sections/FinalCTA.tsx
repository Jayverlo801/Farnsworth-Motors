import { getAvailableVehicles } from "@/lib/vehicles/source";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

export async function FinalCTA() {
  const count = (await getAvailableVehicles()).length;
  const n = count < WORDS.length ? WORDS[count] : String(count);

  return (
    <section id="contact" className="cta !min-h-[70vh]">
      <div className="wrap relative py-28 text-center">
        <Reveal>
          <h2 className="t-headline">
            {n} car{count === 1 ? "" : "s"} on the
            <br />
            lot right now.
          </h2>
          <p className="t-lede mx-auto mt-6 max-w-md">
            Each one rebuilt here, inspected here, and sold with its record.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Button href="/inventory">Browse the inventory</Button>
            <Button href="/sell" variant="ghost">
              Sell us your car
            </Button>
          </div>
          <p className="t-data mt-10 text-[11px] tracking-[0.18em] text-muted uppercase">
            {site.location} · {site.languages}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
