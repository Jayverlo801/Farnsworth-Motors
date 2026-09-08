"use client";

import { useEffect, useRef, useState } from "react";
import { DIVISIONS, DIVISION_ORDER, type DivisionKey } from "@/lib/brand";
import { OperationTag } from "@/components/ui/OperationTag";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Wordmark } from "@/components/brand/Lockup";

interface Step {
  index: string;
  title: string;
  tags: DivisionKey[];
  body: string;
  slot: string;
}

/**
 * OUR PROCESS — six steps, one name on every one of them. The three
 * operations are revealed THROUGH the steps (tags accumulate in the
 * legend); the umbrella band at the end is the only place they are
 * explained. Copy is final per the v3 brief.
 */
const STEPS: Step[] = [
  {
    index: "01",
    title: "Source",
    tags: ["motors"],
    body: "We look for vehicles where the damage, the market value, and the repair economics all make sense. Most don't. Those we pass on.",
    slot: "S3-01-SOURCE",
  },
  {
    index: "02",
    title: "Inspect",
    tags: ["collision", "service"],
    body: "Structure and mechanicals are evaluated before any work begins. If the frame was involved, the car does not move forward.",
    slot: "S3-02-INSPECT",
  },
  {
    index: "03",
    title: "Restore",
    tags: ["collision"],
    body: "Body, paint, and panel work is done in our own shop with OEM parts — the same shop that does collision work for franchise brands.",
    slot: "S3-03-RESTORE",
  },
  {
    index: "04",
    title: "Verify",
    tags: ["service"],
    body: "Mechanical inspection, road test, and the rebuilt-title inspection Utah requires. Nothing is signed off by someone who didn't do the work.",
    slot: "S3-04-VERIFY",
  },
  {
    index: "05",
    title: "Document",
    tags: ["motors"],
    body: "What was damaged, what was replaced, what was inspected. It becomes the Vehicle Record that travels with the car.",
    slot: "S3-05-DOCUMENT",
  },
  {
    index: "06",
    title: "Return to Road",
    tags: ["motors"],
    body: "Priced for what it is: a rebuilt title, done right. Listed with the record attached.",
    slot: "S3-06-ROAD",
  },
];

function seenDivisions(active: number): DivisionKey[] {
  const seen = new Set<DivisionKey>();
  STEPS.slice(0, active + 1).forEach((s) => s.tags.forEach((t) => seen.add(t)));
  return DIVISION_ORDER.filter((d) => seen.has(d));
}

function StepCopy({ step, active }: { step: Step; active: number }) {
  return (
    <div key={step.index} className="proc-copy">
      <p className="t-data text-[0.8125rem] text-muted">{step.index} / 06</p>
      <h3 className="t-title mt-5 text-ink uppercase tracking-[-0.01em]">{step.title}</h3>
      <div className="mt-3">
        <OperationTag divisions={step.tags} />
      </div>
      <p className="t-body mt-6 max-w-[44ch] text-muted">{step.body}</p>
      <div className="proc-legend" aria-hidden="true">
        {seenDivisions(active).map((d) => (
          <span key={d}>{DIVISIONS[d].tag}</span>
        ))}
      </div>
    </div>
  );
}

export function RestorationProcess() {
  const [active, setActive] = useState(0);
  const frameRefs = useRef<Array<HTMLDivElement | null>>([]);

  /* A frame crossing the viewport center drives the sticky column. */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.step);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 }
    );
    frameRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="process" className="sect bg-bg2/40 !pb-0">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow mb-7">Our Process</p>
          <h2 className="t-headline">FROM ARRIVAL TO ROAD.</h2>
          <p className="t-lede mt-6">Six steps. One name on every one of them.</p>
        </Reveal>
      </div>

      {/* mobile progress ticks, pinned under the nav */}
      <div className="proc-ticks-m lg:hidden" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s.index} className={i <= active ? "is-on" : ""} />
        ))}
      </div>

      {/* desktop: sticky copy | rule | frame track — mobile: stacked */}
      <div className="wrap mt-14 lg:mt-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,38%)_1px_minmax(0,1fr)] lg:gap-x-14">
          {/* sticky column */}
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-screen flex-col justify-center">
              <StepCopy step={STEPS[active]} active={active} />
            </div>
          </div>

          {/* progress rule */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="absolute inset-0 w-px bg-line" />
            <div
              className="proc-rule-fill absolute top-0 w-px"
              style={{ height: `${((active + 1) / STEPS.length) * 100}%` }}
            />
            {STEPS.map((s, i) => (
              <span
                key={s.index}
                className={`proc-tick${i <= active ? " is-on" : ""}`}
                style={{ top: `${((i + 0.5) / STEPS.length) * 100}%` }}
              />
            ))}
          </div>

          {/* frame track */}
          <div>
            {STEPS.map((s, i) => (
              <div
                key={s.index}
                data-step={i}
                ref={(el) => {
                  frameRefs.current[i] = el;
                }}
                className="proc-frame"
              >
                <PhotoFrame
                  slot={s.slot}
                  ratio="4 / 3"
                  silhouette={false}
                  sizes="(max-width: 1024px) 92vw, 56vw"
                />
                {/* mobile copy under each frame */}
                <div className="mt-7 lg:hidden">
                  <p className="t-data text-[0.8125rem] text-muted">{s.index} / 06</p>
                  <h3 className="t-title mt-4 text-ink uppercase">{s.title}</h3>
                  <div className="mt-3">
                    <OperationTag divisions={s.tags} />
                  </div>
                  <p className="t-body mt-5 text-muted">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- the umbrella band — the ONLY place this is explained ---- */}
      <div className="umbrella">
        <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <Reveal>
            <p className="eyebrow mb-7">One Name</p>
            <h2 className="t-headline">
              THREE SHOPS.
              <br />
              ZERO HANDOFFS.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="umbrella-lockups">
              {DIVISION_ORDER.map((d, i) => (
                <div key={d} className="umbrella-item">
                  {i > 0 && <span className="umbrella-dot" aria-hidden="true">·</span>}
                  <span className="inline-flex flex-col items-center gap-2">
                    <Wordmark division={d} size={1.125} />
                    <span className="t-data !text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
                      {DIVISIONS[d].descriptor}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={220}>
            <p className="t-body mx-auto mt-10 max-w-[52ch] text-muted">
              The car you buy from Farnsworth Motors was inspected by Farnsworth
              Service and rebuilt by Farnsworth Collision. Same building. Same
              people. Same name on the sign.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
