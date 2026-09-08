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
              <p className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-line py-9 last:border-b">
                <span className="font-mono text-[11px] tracking-[0.3em] text-muted">
                  0{i + 1}
                </span>
                <span className="display-sm !font-semibold">{s}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
