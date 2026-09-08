import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PRINCIPLES = [
  "Source intelligently.",
  "Restore deliberately.",
  "Document everything.",
  "Price realistically.",
] as const;

export function BrandStatement() {
  return (
    <section id="statement" className="sect">
      <div className="wrap">
        <SectionHeading
          index="01"
          label="Philosophy"
          title={
            <>
              SOME CARS ARE FINISHED.
              <br />
              OTHERS ARE WAITING TO BE
              <br />
              FINISHED AGAIN.
            </>
          }
        />
        <Reveal delay={120}>
          <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted">
            Farnsworth Motors finds vehicles worth saving, restores them
            intelligently, and brings them back to the road with the history
            documented along the way.
          </p>
        </Reveal>

        <div className="mt-24 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p} delay={i * 110}>
              <div className="border-t border-line pt-6">
                <span className="font-mono text-[11px] tracking-[0.3em] text-muted">
                  0{i + 1}
                </span>
                <p className="mt-4 text-xl font-medium text-ink md:text-2xl">{p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
