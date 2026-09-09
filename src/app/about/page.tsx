import type { Metadata } from "next";
import { WhyRebuilt } from "@/components/sections/WhyRebuilt";
import { PageShell } from "@/components/ui/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Farnsworth Motors — Oceans Auto LLC, Salt Lake City. We find vehicles with unrealized value, restore them intelligently, and document the work.",
};

export default function AboutPage() {
  return (
    <PageShell
      afterWrap={<WhyRebuilt />}
      eyebrow="About"
      title={
        <>
          We sell the cars
          <br />
          we rebuild.
        </>
      }
      intro={site.description}
    >
      <Reveal delay={140}>
        <div className="mt-16 grid max-w-3xl gap-10 border-t border-line pt-10 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Who we are</p>
            <p className="text-[15px] leading-relaxed text-muted">
              {site.legalName}, doing business as Farnsworth Motors, based in{" "}
              {site.location}. We buy vehicles with cosmetic damage and
              unrealized value, restore them in our own body and mechanical
              shops with OEM parts, and sell the finished car with a rebuilt
              title and its history attached.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-4">What we believe</p>
            <p className="text-[15px] leading-relaxed text-muted">
              We understand the car. We understand what happened to it. We
              understand what it took to rebuild it. And we will show you —
              transparency is the luxury signal.
            </p>
          </div>
        </div>
      </Reveal>
    </PageShell>
  );
}
