"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

interface HeroCopyProps {
  /** Assembly finished — begin the emergence. */
  visible: boolean;
}

/**
 * The wordmark reveal: "FARNSWORTH MOTORS" emerges (opacity + 8px rise over
 * 900ms), then "BUILT AGAIN.", then the explore cue. Nothing explodes onto
 * screen.
 */
export function HeroCopy({ visible }: HeroCopyProps) {
  const reduced = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: visible ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <div className={`hero-copy${visible ? " is-visible" : ""}`}>
      <motion.h1 className="hero-wordmark" {...rise(0)}>
        FARNSWORTH MOTORS
      </motion.h1>
      <motion.p className="hero-tag" {...rise(0.45)}>
        Built Again.
      </motion.p>
      <motion.div {...rise(0.85)}>
        <a className="hero-cta" href="#statement">
          Explore Vehicles<span aria-hidden="true">↓</span>
        </a>
      </motion.div>
    </div>
  );
}
