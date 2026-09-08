import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

export function BeforeAfter() {
  return (
    <section id="before-after" className="sect">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            index="05"
            label="Documentation"
            title={
              <>
                SAME CAR.
                <br />
                DIFFERENT CHAPTER.
              </>
            }
          />
          <Reveal delay={140}>
            <p className="max-w-sm pb-2 text-[15px] leading-relaxed text-muted">
              We document what changed so you understand what you are buying.
              Drag to compare intake against delivery.
            </p>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <div className="mt-16">
            <BeforeAfterSlider />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
