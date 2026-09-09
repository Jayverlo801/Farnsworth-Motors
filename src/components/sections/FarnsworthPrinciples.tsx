import { Reveal } from "@/components/ui/Reveal";

const STATEMENTS = [
  "DAMAGE SHOULD BE UNDERSTOOD.",
  "REPAIRS SHOULD MAKE ECONOMIC SENSE.",
  "HISTORY SHOULD NOT DISAPPEAR.",
  "PRICE SHOULD REFLECT REALITY.",
  "A REBUILT TITLE SHOULD NEVER BE A SURPRISE.",
] as const;

/**
 * Homepage chapter: the Standard, as five lines — a fast typographic beat,
 * not a gallery. Macro imagery for these lives with the /about argument.
 */
export function FarnsworthPrinciples() {
  return (
    <section id="principles" className="sect">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow mb-12">The standard</p>
        </Reveal>
        <div>
          {STATEMENTS.map((s, i) => (
            <Reveal key={s} delay={60}>
              <p className="flex flex-wrap items-baseline gap-x-7 gap-y-2 border-t border-line py-6 last:border-b">
                <span className="t-data text-[0.75rem] text-muted">0{i + 1}</span>
                <span className="t-title !font-semibold text-ink">{s}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
