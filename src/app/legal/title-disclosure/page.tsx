import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Title Disclosure",
  description:
    "How Farnsworth Motors discloses rebuilt titles: stated in every listing, documented in every Vehicle Record.",
};

const SECTIONS: Array<[string, React.ReactNode]> = [
  [
    "What a rebuilt title is",
    <>
      A rebuilt title means the vehicle was previously branded salvage —
      usually after an insurance total loss — then repaired and passed the
      inspection the State of Utah requires before it can be registered and
      driven again. The brand stays on the title permanently. It is part of
      the car&rsquo;s history, and we treat it that way.
    </>,
  ],
  [
    "How we disclose it",
    <>
      Every rebuilt vehicle we list says so in the listing title — not in a
      footnote. Each one carries a Vehicle Record: where the car came from,
      the damage classification, what was replaced, and the inspection it
      passed. Review the record before you buy; the full file is available in
      person.
    </>,
  ],
  [
    "Our structural rule",
    <>
      If our inspection finds structural involvement, the car does not move
      forward and is never listed as available. That rule is written into our
      inventory system, not just our policy.
    </>,
  ],
  [
    "What buyers should verify",
    <>
      A rebuilt brand permanently affects market value — that is why the
      price is lower, and the price you pay should reflect it. Insurance and
      financing terms for rebuilt-title vehicles vary by provider; confirm
      coverage and terms with yours before purchase. Bring your own
      inspector if you like. We would rather you know than wonder.
    </>,
  ],
];

export default function TitleDisclosurePage() {
  return (
    <PageShell
      eyebrow="Title Disclosure"
      title={
        <>
          A rebuilt title should
          <br />
          never be a surprise.
        </>
      }
      intro="This page describes what a rebuilt title means and how we disclose it. It is informational, not legal or insurance advice."
    >
      <Reveal delay={120}>
        <div className="mt-14 max-w-2xl">
          {SECTIONS.map(([heading, body]) => (
            <div key={heading as string} className="border-t border-line py-8 last:border-b">
              <h2 className="t-title text-ink">{heading}</h2>
              <p className="t-body mt-4 text-muted">{body}</p>
            </div>
          ))}
          <p className="t-body mt-8 text-muted">
            Questions about a specific vehicle&rsquo;s history?{" "}
            <a className="text-silver underline-offset-4 hover:text-ink hover:underline" href={`mailto:${site.email}`}>
              Ask for the record
            </a>{" "}
            or see{" "}
            <Link className="text-silver underline-offset-4 hover:text-ink hover:underline" href="/process">
              our process
            </Link>
            .
          </p>
          <p className="t-data mt-10 text-[0.7rem] text-muted">LAST UPDATED — SEPTEMBER 2026</p>
        </div>
      </Reveal>
    </PageShell>
  );
}
