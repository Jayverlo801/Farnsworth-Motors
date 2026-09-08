import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Step {
  index: string;
  title: string;
  body: string;
  glyph: ReactNode;
}

const g = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const STEPS: Step[] = [
  {
    index: "01",
    title: "Source",
    body: "We identify vehicles where the damage, market value, and repair economics make sense.",
    glyph: (
      <svg viewBox="0 0 28 28" {...g}>
        <circle cx="12.5" cy="12.5" r="7.5" />
        <path d="M 18 18 L 24 24" />
      </svg>
    ),
  },
  {
    index: "02",
    title: "Inspect",
    body: "Damage and structural condition are evaluated before restoration begins.",
    glyph: (
      <svg viewBox="0 0 28 28" {...g}>
        <path d="M 14 3 A 11 11 0 1 1 3 14" />
        <path d="M 14 8 L 14 14 L 19 16" />
      </svg>
    ),
  },
  {
    index: "03",
    title: "Restore",
    body: "Parts, bodywork, and mechanical repairs are completed with a focus on returning the vehicle to proper condition.",
    glyph: (
      <svg viewBox="0 0 28 28" {...g}>
        <path d="M 17 4 a 7 7 0 1 0 7 7 l -5 0 -2 -2 0 -5 Z" />
      </svg>
    ),
  },
  {
    index: "04",
    title: "Verify",
    body: "Repairs are inspected and required rebuilt-title processes are completed.",
    glyph: (
      <svg viewBox="0 0 28 28" {...g}>
        <path d="M 14 3 L 24 7 V 14 C 24 20 19 24 14 25 C 9 24 4 20 4 14 V 7 Z" />
        <path d="M 9.5 14 L 12.5 17 L 18.5 11" />
      </svg>
    ),
  },
  {
    index: "05",
    title: "Document",
    body: "Whenever available, previous damage and restoration records remain part of the vehicle history.",
    glyph: (
      <svg viewBox="0 0 28 28" {...g}>
        <path d="M 7 3 H 17 L 22 8 V 25 H 7 Z M 17 3 V 8 H 22" />
        <path d="M 10.5 14 H 18.5 M 10.5 18.5 H 18.5" />
      </svg>
    ),
  },
  {
    index: "06",
    title: "Return to Road",
    body: "The finished vehicle becomes available through Farnsworth Motors.",
    glyph: (
      <svg viewBox="0 0 28 28" {...g}>
        <path d="M 9 25 L 13 3 M 19 25 L 15 3" />
        <path d="M 14 8 V 11 M 14 15 V 18 M 14 22 V 24" strokeDasharray="0.1 4" />
      </svg>
    ),
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
        <div className="mt-20 grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.index} delay={(i % 3) * 110}>
              <div className="border-t border-line pt-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-muted">
                    {s.index}
                  </span>
                  <span className="h-7 w-7 text-silver/70" aria-hidden="true">
                    {s.glyph}
                  </span>
                </div>
                <h3 className="mt-6 text-sm font-medium tracking-[0.24em] text-ink uppercase">
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
