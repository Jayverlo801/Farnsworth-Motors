"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedTextProps {
  /** Lines revealed sequentially with a masked rise. */
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "p";
}

/**
 * Editorial line-by-line reveal: each line rises out of a mask on scroll.
 * CSS-driven; prefers-reduced-motion renders static via the stylesheet.
 */
export function AnimatedText({ lines, className, as: Tag = "h2" }: AnimatedTextProps) {
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`atext${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
    >
      {lines.map((line, i) => (
        <span key={line} className="atext-mask">
          <span className="atext-line" style={{ transitionDelay: `${i * 90}ms` }}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
