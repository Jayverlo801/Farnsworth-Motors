"use client";

interface HeroCopyProps {
  /** Assembly finished — begin the emergence. */
  visible: boolean;
}

/**
 * The wordmark reveal: "FARNSWORTH MOTORS" emerges (opacity + 8px rise over
 * 900ms), then "BUILT AGAIN.", then the explore cue — staged via CSS
 * transition delays. Nothing explodes onto screen.
 */
export function HeroCopy({ visible }: HeroCopyProps) {
  return (
    <div className={`hero-copy${visible ? " is-visible" : ""}`}>
      <h1 className="hero-wordmark hero-rise">FARNSWORTH MOTORS</h1>
      <p className="hero-tag hero-rise" style={{ transitionDelay: "450ms" }}>
        Built Again.
      </p>
      <div className="hero-rise" style={{ transitionDelay: "850ms" }}>
        <a className="hero-cta" href="#statement">
          Explore Vehicles<span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>
  );
}
