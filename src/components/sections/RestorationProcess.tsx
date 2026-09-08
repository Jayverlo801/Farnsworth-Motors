import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Step {
  index: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    index: "01",
    title: "Source",
    body: "We identify vehicles where the damage, market value and repair economics make sense.",
  },
  {
    index: "02",
    title: "Inspect",
    body: "Damage and structural condition are evaluated before restoration begins.",
  },
  {
    index: "03",
    title: "Restore",
    body: "Parts, bodywork and mechanical repairs are completed in our own shops with OEM parts.",
  },
  {
    index: "04",
    title: "Verify",
    body: "Repairs are inspected and required rebuilt-title processes are completed.",
  },
  {
    index: "05",
    title: "Document",
    body: "Previous damage and restoration records remain part of the vehicle's history.",
  },
  {
    index: "06",
    title: "Return to Road",
    body: "The finished vehicle becomes available through Farnsworth Motors.",
  },
];

export function RestorationProcess() {
  return (
    <section id="process" className="sect bg-bg2/40">
      <div className="wrap">
        <SectionHeading
          index="03"
          label="The Process"
          title={
            <>
              FROM ARRIVAL
              <br />
              TO ROAD.
            </>
          }
        />
        <div className="mt-20 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.index} delay={(i % 3) * 110}>
              <div className="border-t border-line pt-7">
                <PhotoFrame
                  slot={`S3-${s.index}-${s.title.split(" ")[0].toUpperCase()}`}
                  ratio="4 / 3"
                  silhouette={false}
                  className="mb-7"
                  sizes="(max-width: 640px) 92vw, 30vw"
                />
                <span className="font-mono text-[11px] tracking-[0.3em] text-muted">
                  {s.index}
                </span>
                <h3 className="mt-4 text-sm font-medium tracking-[0.24em] text-ink uppercase">
                  {s.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
