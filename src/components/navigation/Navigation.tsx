"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const LINKS = [
  { href: "/inventory", label: "Inventory" },
  { href: "/process", label: "Our Process" },
  { href: "/about", label: "About" },
] as const;

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="wrap flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-[13px] font-semibold tracking-[0.28em] text-ink"
        >
          FARNSWORTH<span className="text-muted"> MOTORS</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
          <a href="/contact" className="nav-link">
            Contact
          </a>
          <Link
            href="/#available"
            className="btn nav-cta !h-9 !px-5 !text-[11px]"
          >
            View Vehicles
          </Link>
        </nav>

        <button
          type="button"
          className="nav-link md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="mnav" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 items-center justify-between">
            <span className="text-[13px] font-semibold tracking-[0.28em] text-ink">
              FARNSWORTH<span className="text-muted"> MOTORS</span>
            </span>
            <button
              type="button"
              className="nav-link"
              onClick={() => setOpen(false)}
              autoFocus
            >
              Close
            </button>
          </div>
          <nav className="mt-10 flex flex-col" aria-label="Mobile">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="mnav-link"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="/contact"
              className="mnav-link"
              onClick={() => setOpen(false)}
            >
              Contact
            </a>
          </nav>
          <p className="mt-auto font-mono text-[11px] tracking-[0.3em] text-muted uppercase">
            {site.location} · {site.languages}
          </p>
        </div>
      )}
    </header>
  );
}
