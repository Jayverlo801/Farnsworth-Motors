import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CONDITIONS = [
  "the original damage makes sense",
  "repairs were completed correctly",
  "the history is understood",
  "the purchase price reflects the title",
] as const;

export function WhyRebuilt() {
  return (
    <section id="why-rebuilt" className="sect">
      <div className="wrap grid gap-16 lg:grid-cols-[6fr_5fr] lg:gap-24">
        <div>
          <SectionHeading index="07" label="The Economics" title="WHY CONSIDER REBUILT?" />
          <Reveal delay={120}>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted">
              A rebuilt vehicle can offer substantially more car for the money
              because its title history permanently affects market value — even
              after it has been repaired. That discount creates opportunity.
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink">
              But only when:
            </p>
          </Reveal>
          <ul className="mt-8 max-w-xl">
            {CONDITIONS.map((c, i) => (
              <li key={c} className="border-t border-line">
                <Reveal delay={i * 100}>
                  <span className="flex items-baseline gap-5 py-4">
                    <span className="font-mono text-[11px] tracking-[0.3em] text-muted">
                      0{i + 1}
                    </span>
                    <span className="text-[15px] text-ink">{c}</span>
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal delay={200}>
            <p className="mt-10 max-w-xl text-lg font-medium text-ink">
              That is the market Farnsworth Motors specializes in.
            </p>
          </Reveal>
        </div>

        <Reveal delay={220} className="self-center">
          <div>
            <div>
              <p className="font-mono text-[10.5px] tracking-[0.24em] text-muted uppercase">
                Comparable clean-title car
              </p>
              <div className="val-track mt-3">
                <div className="val-fill" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="mt-8">
              <p className="font-mono text-[10.5px] tracking-[0.24em] text-muted uppercase">
                Same car — rebuilt title
              </p>
              <div className="val-track mt-3">
                <div className="val-fill val-fill-fm" style={{ width: "63%" }} />
                <div className="val-gap" style={{ left: "63%", right: 0 }}>
                  The opportunity
                </div>
              </div>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              Illustrative — every car is priced on its own damage, repair, and
              history. We put the numbers on the record, not in the marketing.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
