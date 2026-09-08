import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { Reveal } from "@/components/ui/Reveal";

const STATEMENTS = [
  "DAMAGE SHOULD BE UNDERSTOOD.",
  "REPAIRS SHOULD MAKE ECONOMIC SENSE.",
  "HISTORY SHOULD NOT DISAPPEAR.",
  "PRICE SHOULD REFLECT REALITY.",
  "A REBUILT TITLE SHOULD NEVER BE A SURPRISE.",
] as const;

export function FarnsworthPrinciples() {
  return (
    <section id="principles" className="sect bg-bg2/40">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow mb-16">08 / The Farnsworth Standard</p>
        </Reveal>
        <div>
          {STATEMENTS.map((s, i) => (
            <Reveal key={s} delay={80}>
              <div className="grid items-center gap-x-12 gap-y-6 border-t border-line py-9 last:border-b md:grid-cols-[1fr_200px]">
                <p className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-muted">
                    0{i + 1}
                  </span>
                  <span className="display-sm !font-semibold">{s}</span>
                </p>
                <PhotoFrame
                  slot={`S8-0${i + 1}`}
                  ratio="4 / 3"
                  silhouette={false}
                  className="hidden md:block"
                  sizes="200px"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
