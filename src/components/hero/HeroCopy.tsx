"use client";

interface HeroCopyProps {
  /** Assembly finished — begin the emergence. */
  visible: boolean;
  /** Repeat visit: compressed stagger so everything is in place ≤1.5s. */
  fast?: boolean;
}

/**
 * The wordmark band. Emergence order: wordmark (900ms rise + fade), tagline
 * (+300ms), cue (+600ms) — staged via CSS transition delays; nothing
 * explodes onto screen. Two-tone lockup matches the nav.
 */
export function HeroCopy({ visible, fast = false }: HeroCopyProps) {
  const d = (full: number) => `${fast ? Math.round(full / 2) : full}ms`;
  return (
    <div className={`hero-copy${visible ? " is-visible" : ""}`}>
      <h1 className="hero-wordmark hero-rise">
        FARNSWORTH <span>MOTORS</span>
      </h1>
      <p className="hero-tag hero-rise" style={{ transitionDelay: d(300) }}>
        Built again.
      </p>
      <div className="hero-rise" style={{ transitionDelay: d(600) }}>
        <a className="hero-cta" href="#statement">
          Explore vehicles<span aria-hidden="true">↓</span>
        </a>
        <span className="hero-cta-line" aria-hidden="true" />
      </div>
    </div>
  );
}
