"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ScrollScaleProps {
  children: ReactNode;
  /** Scale range across the element's scroll journey. */
  from?: number;
  to?: number;
  className?: string;
}

/** Photographic scroll behavior: the image scales gently across its range. */
export function ScrollScale({ children, from = 1, to = 1.06, className }: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [from, to]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <div ref={ref} className={`overflow-hidden${className ? ` ${className}` : ""}`}>
      <motion.div style={{ scale }}>{children}</motion.div>
    </div>
  );
}
