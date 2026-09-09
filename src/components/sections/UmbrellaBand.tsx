import { DIVISIONS, DIVISION_ORDER } from "@/lib/brand";
import { Reveal } from "@/components/ui/Reveal";
import { Wordmark } from "@/components/brand/Lockup";

/**
 * The umbrella, sold from the buyer's side: most rebuilt cars pass through
 * strangers' hands before the lot — here, one door. Shared by the homepage
 * and the /process finale so the story never drifts.
 */
export function UmbrellaBand() {
  return (
    <div className="umbrella band-dark">
      <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <Reveal>
          <p className="eyebrow mb-6">One name</p>
          <h2 className="t-headline">
            Three shops.
            <br />
            Zero handoffs.
          </h2>
          <p className="t-lede mx-auto mt-7 max-w-[56ch]">
            Most rebuilt cars pass through three or four hands before they
            reach a lot — an auction, a body shop you&rsquo;ll never meet, a
            wholesaler. Ours pass through one door.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="umbrella-lockups">
            {DIVISION_ORDER.map((d, i) => (
              <div key={d} className="umbrella-item">
                {i > 0 && (
                  <span className="umbrella-dot" aria-hidden="true">
                    ·
                  </span>
                )}
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
          <p className="t-body mx-auto mt-10 max-w-[52ch] text-ink">
            The car you buy from Farnsworth Motors was inspected by Farnsworth
            Service and rebuilt by Farnsworth Collision. Same building. Same
            people. Same name on the sign.
          </p>
          <p className="t-body mx-auto mt-4 max-w-[52ch] text-muted">
            When a repair needs answering for, there&rsquo;s one place to
            come. We built it that way on purpose.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
