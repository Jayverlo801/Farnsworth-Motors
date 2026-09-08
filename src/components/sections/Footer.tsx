import Link from "next/link";
import { site } from "@/lib/site";

const SITE_LINKS = [
  { href: "/inventory", label: "Inventory" },
  { href: "/#records", label: "Vehicle Records" },
  { href: "/process", label: "Our Process" },
  { href: "/about", label: "About" },
] as const;

/** Legal pages ship later — rendered inert until they exist. */
const LEGAL = ["Privacy", "Terms", "Title Disclosure"] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="wrap grid gap-14 py-20 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.28em] text-ink">
            FARNSWORTH<span className="text-muted"> MOTORS</span>
          </p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
            {site.description}
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-6 inline-block font-mono text-[12px] tracking-wider text-silver hover:text-ink"
          >
            {site.email}
          </a>
        </div>

        <nav aria-label="Site">
          <p className="font-mono text-[10.5px] tracking-[0.3em] text-muted uppercase">Site</p>
          <ul className="mt-5 space-y-3">
            {SITE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="text-sm text-muted transition-colors hover:text-ink">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="font-mono text-[10.5px] tracking-[0.3em] text-muted uppercase">Legal</p>
          <ul className="mt-5 space-y-3">
            {LEGAL.map((l) => (
              <li key={l} className="text-sm text-muted/60">
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-6 font-mono text-[10.5px] tracking-[0.22em] text-muted/70 uppercase">
          <span>
            © {year} {site.legalName} · {site.dba}
          </span>
          <span>{site.location}</span>
        </div>
      </div>
    </footer>
  );
}
