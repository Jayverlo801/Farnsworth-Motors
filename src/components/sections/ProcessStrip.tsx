import Link from "next/link";
import { PROCESS_STEPS } from "@/lib/process";
import { OperationTag } from "@/components/ui/OperationTag";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Homepage chapter: the process in one strip — six names, six tags, one
 * link. The full sticky sequence and the umbrella band live on /process.
 */
export function ProcessStrip() {
  return (
    <section id="process" className="sect bg-bg2/40">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Reveal>
            <p className="eyebrow mb-7">02 / Our Process</p>
            <h2 className="t-headline">
              FROM ARRIVAL
              <br />
              TO ROAD.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="t-lede max-w-sm pb-2">
              Six steps. One name on every one of them — sourcing, body, paint,
              and mechanical, all in-house.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {PROCESS_STEPS.map((s, i) => (
            <Reveal key={s.index} delay={i * 70}>
              <div className="border-t border-line pt-5">
                <p className="t-data text-[0.75rem] text-muted">{s.index}</p>
                <h3 className="mt-3 text-sm font-semibold tracking-[0.06em] text-ink uppercase">
                  {s.title}
                </h3>
                <OperationTag divisions={s.tags} className="mt-3 flex" />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <Link href="/process" className="hero-cta !mt-14">
            The full process<span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
