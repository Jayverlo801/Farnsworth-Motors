import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Farnsworth Motors — Salt Lake City, Utah. Se habla español.",
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title={
        <>
          TALK TO
          <br />
          FARNSWORTH.
        </>
      }
    >
      <Reveal delay={120}>
        <div className="mt-12 grid max-w-3xl gap-10 border-t border-line pt-10 sm:grid-cols-3">
          <div>
            <p className="eyebrow mb-4">Email</p>
            <a
              href={`mailto:${site.email}`}
              className="font-mono text-sm text-silver hover:text-ink"
            >
              {site.email}
            </a>
          </div>
          <div>
            <p className="eyebrow mb-4">Location</p>
            <p className="text-sm text-muted">{site.location}</p>
          </div>
          <div>
            <p className="eyebrow mb-4">Languages</p>
            <p className="text-sm text-muted">English · Español</p>
          </div>
        </div>
        <div className="mt-12">
          <Button href={`mailto:${site.email}`}>Email us</Button>
        </div>
      </Reveal>
    </PageShell>
  );
}
