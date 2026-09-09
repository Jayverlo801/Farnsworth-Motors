import type { ReactNode } from "react";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/sections/Footer";
import { Reveal } from "./Reveal";

interface PageShellProps {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
  /** Full-bleed content rendered after the wrapped column (own sections). */
  afterWrap?: ReactNode;
}

/** Consistent shell for secondary routes so the site expands cleanly. */
export function PageShell({ eyebrow, title, intro, children, afterWrap }: PageShellProps) {
  return (
    <>
      <Navigation />
      <main id="main" className="pt-40 pb-32">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow mb-7">{eyebrow}</p>
            <h1 className="t-headline">{title}</h1>
            {intro && (
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">{intro}</p>
            )}
          </Reveal>
          {children}
        </div>
        {afterWrap}
      </main>
      <Footer />
    </>
  );
}
