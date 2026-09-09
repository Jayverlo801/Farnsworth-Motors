import type { Metadata } from "next";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Mark } from "@/components/brand/Mark";
import { Lockup } from "@/components/brand/Lockup";
import {
  Artboard,
  BusinessCards,
  PlateFrame,
  RecordCoverSheet,
  ShopSign,
  SocialSet,
  WindowSticker,
} from "@/components/brand/artboards";
import { MotionDemos } from "./MotionDemos";
import { VOICE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Brand System",
  description: "The Farnsworth Motors identity system — internal reference.",
  robots: { index: false, follow: false },
};

const COLORS: Array<[string, string, string]> = [
  ["--bg", "#F5F5F7", "Parchment ground. Every page starts here."],
  ["--bg-2", "#E4DCB6", "Raised cream bands."],
  ["--surface", "#F4EFDA", "Cards and record chrome."],
  ["--line / --line-strong", "#D3C9A2 / #B3A67A", "Hairlines; ghost borders."],
  ["--text", "#1D1D1F", "Espresso ink — text and the wordmark."],
  ["--text-2", "#6E6E73", "Secondary text; the division word."],
  ["--text-3", "#98989D", "Structure lines, quiet labels. Decorative only."],
  ["--accent", "#8B0000", "Oxblood. One accent per screen, at most."],
  ["--accent-warm", "#5B0202", "The sweep. Nothing else."],
  ["--accent-intact", "#2F6B4F", "Record/diagram only: verified untouched."],
  ["--accent-replaced", "#8B0000", "Record/diagram only: replaced/repaired."],
  ["#1D1D1F band", "#1D1D1F", "Espresso punch bands: the umbrella and the footer."],
];

const TYPE_STYLES: Array<[string, string, string]> = [
  ["t-display", "Display — the hero wordmark and nothing else.", "FARNSWORTH MOTORS"],
  ["t-headline", "Headline — one per section.", "THREE SHOPS. ZERO HANDOFFS."],
  ["t-title", "Title — step and card headings.", "Restore"],
  ["t-lede", "Lede — the sentence under a headline.", "Six steps. One name on every one of them."],
  ["t-body", "Body — everything explanatory.", "Structure and mechanicals are evaluated before any work begins."],
  ["t-label", "Label — mono section eyebrows.", "OUR PROCESS"],
  ["t-data", "Data — VINs, mileage, prices, part numbers, dates. Facts are mono.", "3VW7M7BU•••••1042 · 29,184 mi · $15,900"],
];

const RULES = [
  "The umbrella is explained once — in the umbrella band. Everywhere else, tags only.",
  "Green and oxide exist only inside the record and its diagrams. Never on buttons, headlines, or backgrounds.",
  "Anything in mono is a fact. If it isn't a fact, it isn't mono.",
  "One accent per screen, at most.",
  "Three motions: seat, sweep, settle. A fourth means the design is wrong.",
  "Rebuilt title is stated plainly in every listing title. Lead with the disclosure, then the deal.",
  "Never: " + VOICE.never.join(" · ") + ".",
  "No stock photography. Macro, controlled, one subject per frame.",
];

export default function BrandPage() {
  return (
    <>
      <Navigation />
      <main id="main" className="pt-40 pb-32">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow mb-7">Identity System</p>
            <h1 className="t-headline">
              ONE SOURCE.
              <br />
              EVERY SURFACE.
            </h1>
            <p className="t-lede mt-8 max-w-xl">
              The Farnsworth identity as code. Every future page, ad, and
              document derives from the components on this page — internal
              reference, not linked from the site.
            </p>
            <a href="/brand/farnsworth-brand-assets.zip" className="hero-cta !mt-8" download>
              Download all assets<span aria-hidden="true">↓</span>
            </a>
          </Reveal>

          {/* ---- Mark ---- */}
          <Section label="Mark" title="THE PANEL GAP F.">
            <p className="t-body max-w-[52ch] text-muted">
              An F built from two pieces separated by a hairline — a hood shut
              line. Two parts that fit precisely. The gap widens as the mark
              shrinks (16px favicon) and tightens at scale (2m sign).
            </p>
            <div className="mt-10 flex flex-wrap items-end gap-12 border border-line rounded-2xl bg-[#ffffff] p-10">
              <MarkDemo px={16} optical="small" />
              <MarkDemo px={32} optical="small" />
              <MarkDemo px={64} optical="medium" />
              <MarkDemo px={128} optical="large" />
            </div>
          </Section>

          {/* ---- Lockups ---- */}
          <Section label="Lockups" title="ONE NAME, THREE WORDS.">
            <div className="grid gap-10 rounded-2xl border border-line bg-[#ffffff] p-10">
              <Lockup size={1.4} />
              <Lockup layout="stacked" size={1.15} className="justify-self-start" />
              <div className="flex flex-wrap gap-x-14 gap-y-6 border-t border-line pt-8">
                <Lockup division="motors" withDescriptor />
                <Lockup division="collision" withDescriptor />
                <Lockup division="service" withDescriptor />
              </div>
            </div>
          </Section>

          {/* ---- Color ---- */}
          <Section label="Color" title="GRAPHITE, THEN FACTS.">
            <div className="overflow-hidden rounded-2xl border border-line">
              {COLORS.map(([token, hex, rule]) => (
                <div
                  key={token}
                  className="grid grid-cols-[44px_1fr] items-center gap-5 border-t border-line/60 bg-[#ffffff] px-6 py-4 first:border-t-0 sm:grid-cols-[44px_220px_140px_1fr]"
                >
                  <span
                    className="h-8 w-11 rounded border border-line"
                    style={{ background: hex.split(" / ")[0] }}
                    aria-hidden="true"
                  />
                  <span className="t-data text-[0.75rem] text-ink">{token}</span>
                  <span className="t-data hidden text-[0.7rem] text-muted sm:block">{hex}</span>
                  <span className="col-span-2 text-[0.8rem] text-muted sm:col-span-1">{rule}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ---- Type ---- */}
          <Section label="Type" title="SEVEN STYLES. ONE JOB EACH.">
            <div className="grid gap-0 overflow-hidden rounded-2xl border border-line">
              {TYPE_STYLES.map(([cls, rule, sample]) => (
                <div key={cls} className="border-t border-line/60 bg-[#ffffff] px-7 py-7 first:border-t-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="t-data text-[0.7rem] text-muted">.{cls}</span>
                    <span className="text-[0.75rem] text-muted/70">{rule}</span>
                  </div>
                  <p className={`${cls} mt-4 ${cls === "t-display" || cls === "t-headline" ? "!text-[clamp(1.6rem,3.5vw,2.6rem)]" : ""} text-ink`}>
                    {sample}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ---- Motion ---- */}
          <Section label="Motion" title="SEAT · SWEEP · SETTLE.">
            <MotionDemos />
          </Section>

          {/* ---- Voice ---- */}
          <Section label="Voice" title="A PRECISE ENGINEER, PROUD OF THE WORK.">
            <div className="grid gap-10 rounded-2xl border border-line bg-[#ffffff] p-9 lg:grid-cols-3">
              <div>
                <p className="t-label mb-5">Rules</p>
                <ul className="space-y-2.5">
                  {VOICE.rules.map((r) => (
                    <li key={r} className="t-body text-muted">{r}</li>
                  ))}
                </ul>
                <p className="t-body mt-6 text-muted">{VOICE.spanish} The same voice, translated — never transliterated.</p>
              </div>
              <div>
                <p className="t-label mb-5">Use</p>
                <ul className="flex flex-wrap gap-2">
                  {VOICE.use.map((w) => (
                    <li key={w} className="t-data rounded border border-line px-2.5 py-1 text-[0.72rem] text-ink">{w}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="t-label mb-5">Never</p>
                <ul className="flex flex-wrap gap-2">
                  {VOICE.never.map((w) => (
                    <li key={w} className="t-data rounded border border-line/60 px-2.5 py-1 text-[0.72rem] text-muted line-through decoration-[1px]">{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* ---- Applications ---- */}
          <Section label="Applications" title="OFF-SCREEN, SAME RESTRAINT.">
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-2">
              <Artboard title="Window sticker · 8.5×11" note="QR is a placeholder pattern until record URLs are live">
                <WindowSticker />
              </Artboard>
              <Artboard title="Vehicle Record cover sheet · 8.5×11" note="what a buyer takes home">
                <RecordCoverSheet />
              </Artboard>
              <Artboard title="License plate frame">
                <div className="grid min-h-[220px] place-items-center">
                  <PlateFrame />
                </div>
              </Artboard>
              <Artboard title="Social — avatar + 1:1 post">
                <SocialSet />
              </Artboard>
              <Artboard title="Shop sign — Collision" wide>
                <ShopSign division="collision" />
              </Artboard>
              <Artboard title="Shop sign — Service" wide>
                <ShopSign division="service" />
              </Artboard>
              <Artboard title="Business card · 3.5×2 · front / back" wide>
                <BusinessCards />
              </Artboard>
            </div>
          </Section>

          {/* ---- Rules ---- */}
          <Section label="Rules" title="THE NEVER LIST.">
            <ol className="max-w-3xl">
              {RULES.map((r, i) => (
                <li key={r} className="flex gap-6 border-t border-line py-5 last:border-b">
                  <span className="t-data text-[0.75rem] text-muted">0{i + 1}</span>
                  <span className="t-body text-ink">{r}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-28">
      <Reveal>
        <p className="eyebrow mb-5">{label}</p>
        <h2 className="t-title mb-9 text-ink">{title}</h2>
        {children}
      </Reveal>
    </section>
  );
}

function MarkDemo({ px, optical }: { px: number; optical: "small" | "medium" | "large" }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Mark size={px} optical={optical} className="text-ink" />
      <span className="t-data text-[0.65rem] text-muted">
        {px}px · {optical}
      </span>
    </div>
  );
}
