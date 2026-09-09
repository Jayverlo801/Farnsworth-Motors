import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the Farnsworth Motors website.",
};

const SECTIONS: Array<[string, React.ReactNode]> = [
  [
    "What this site is",
    <>
      This site presents vehicles offered by {site.legalName}, doing business
      as Farnsworth Motors, in Salt Lake City, Utah. It is informational. A
      listing is an invitation to come look at a car, not a contract.
    </>,
  ],
  [
    "Listings and pricing",
    <>
      Every vehicle is subject to prior sale. We work to keep specifications,
      mileage, and pricing accurate, but errors happen; the vehicle itself,
      its title, and its written Vehicle Record control over anything on this
      site. Confirm price and availability before you drive over.
    </>,
  ],
  [
    "Vehicle Records",
    <>
      Records reflect the documentation in our possession for each vehicle —
      nothing more is implied. See{" "}
      <Link className="text-silver underline-offset-4 hover:text-ink hover:underline" href="/legal/title-disclosure">
        Title Disclosure
      </Link>{" "}
      for how we handle rebuilt titles.
    </>,
  ],
  [
    "No warranty by website",
    <>
      Nothing on this site creates a warranty. Any warranty or service terms
      that apply to a purchase are the ones in the signed paperwork for that
      purchase, as Utah law provides.
    </>,
  ],
  [
    "Questions",
    <>
      <a className="text-silver underline-offset-4 hover:text-ink hover:underline" href={`mailto:${site.email}`}>
        {site.email}
      </a>
    </>,
  ],
];

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms"
      title={
        <>
          Plain terms,
          <br />
          plainly stated.
        </>
      }
    >
      <Reveal delay={120}>
        <div className="mt-14 max-w-2xl">
          {SECTIONS.map(([heading, body]) => (
            <div key={heading as string} className="border-t border-line py-8 last:border-b">
              <h2 className="t-title text-ink">{heading}</h2>
              <p className="t-body mt-4 text-muted">{body}</p>
            </div>
          ))}
          <p className="t-data mt-10 text-[0.7rem] text-muted">LAST UPDATED — SEPTEMBER 2026</p>
        </div>
      </Reveal>
    </PageShell>
  );
}
