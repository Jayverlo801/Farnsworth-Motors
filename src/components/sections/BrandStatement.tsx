import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The opening chapter. No eyebrow, no slogan — the whole company in one
 * sentence, then the four claims that back it up. Grammar varies on
 * purpose; facts carry the weight.
 */
const CLAIMS = [
  "Bought at auction, chosen by repair economics — most cars we look at, we pass on.",
  "Body, paint, and mechanical work done in our own shops with OEM parts.",
  "Utah's rebuilt-title inspection, prepped and passed before a car is listed.",
  "A written record of all of it, attached to the car.",
] as const;

export function BrandStatement() {
  return (
    <section id="statement" className="sect">
      <div className="wrap grid gap-14 lg:grid-cols-[7fr_5fr] lg:gap-24">
        <div>
          <AnimatedText
            className="t-headline !text-[clamp(2.1rem,4.4vw,4.1rem)]"
            lines={[
              "We buy damaged cars,",
              "rebuild them in-house,",
              "and show you exactly",
              "what was done.",
            ]}
          />
        </div>
        <div className="lg:pt-3">
          <Reveal delay={120}>
            <p className="t-lede">
              A rebuilt title takes thousands off a car&rsquo;s price, and the
              discount never expires. That&rsquo;s the opportunity — and the
              risk. It&rsquo;s only a good deal if the repair behind it was
              done right.
            </p>
          </Reveal>
          <ul className="mt-10">
            {CLAIMS.map((c, i) => (
              <li key={c} className="border-t border-line last:border-b">
                <Reveal delay={i * 90}>
                  <p className="t-body py-4 text-muted">{c}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
