"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}

/** Buttons carry ≤4px magnetic attraction on fine pointers; none elsewhere. */
export function Button({ href, children, variant = "primary", className }: ButtonProps) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * 8;
    el.style.transform = `translate(${Math.max(-4, Math.min(4, dx))}px, ${Math.max(-4, Math.min(4, dy))}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const cls = `btn ${variant === "primary" ? "btn-primary" : "btn-ghost"}${className ? ` ${className}` : ""}`;
  const external = href.startsWith("mailto:") || href.startsWith("http");

  if (external) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        className={cls}
        href={href}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      ref={ref as React.RefObject<HTMLAnchorElement>}
      className={cls}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </Link>
  );
}
