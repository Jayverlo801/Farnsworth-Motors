import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this site collects, and what it doesn't.",
};

const SECTIONS: Array<[string, string]> = [
  [
    "What this site collects",
    "As little as it can. There are no accounts, no ad pixels, and no third-party analytics scripts on this site. Our hosting provider keeps standard server logs (IP address, request time, pages requested) for security and reliability; we do not use them to profile visitors.",
  ],
  [
    "What you send us",
    "If you email us about a vehicle, a sale, or a trade, we receive what you choose to send — your address and message. We use it to respond and to conduct the transaction you asked about. We do not sell personal information, and we do not add you to marketing lists you didn't ask for.",
  ],
  [
    "Transactions",
    "Buying or selling a vehicle involves paperwork required by Utah law — titling, registration, and tax documents. That information goes where the law requires it and nowhere else.",
  ],
  [
    "Changes and questions",
    "If our practices change, this page changes with them. Questions belong in your inbox and ours — email us.",
  ],
];

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title={
        <>
          We document cars,
          <br />
          not visitors.
        </>
      }
    >
      <Reveal delay={120}>
        <div className="mt-14 max-w-2xl">
          {SECTIONS.map(([heading, body]) => (
            <div key={heading} className="border-t border-line py-8 last:border-b">
              <h2 className="t-title text-ink">{heading}</h2>
              <p className="t-body mt-4 text-muted">{body}</p>
            </div>
          ))}
          <p className="t-body mt-8 text-muted">
            <a className="text-silver underline-offset-4 hover:text-ink hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p className="t-data mt-10 text-[0.7rem] text-muted">LAST UPDATED — SEPTEMBER 2026</p>
        </div>
      </Reveal>
    </PageShell>
  );
}
