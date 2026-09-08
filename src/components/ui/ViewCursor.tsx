"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * Wraps vehicle photography: on fine pointers the cursor becomes a small
 * circular "VIEW" chip that follows the pointer. Desktop only; inert under
 * reduced motion and on touch.
 */
export function ViewCursor({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={ref}
      className={`view-cursor-area${className ? ` ${className}` : ""}`}
      onPointerMove={(e) => {
        if (!enabled()) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onPointerLeave={() => setPos(null)}
    >
      {children}
      {pos && (
        <span
          className="view-cursor"
          style={{ left: pos.x, top: pos.y }}
          aria-hidden="true"
        >
          VIEW
        </span>
      )}
    </div>
  );
}
