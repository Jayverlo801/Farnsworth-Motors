"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CarArt, CAR_VIEWBOX } from "@/components/car/carArt";
import type { HeroMode } from "./types";

export interface HeroFallbackHandle {
  /** Jump to the assembled state immediately (skip / scroll intent). */
  finish: () => void;
}

interface HeroFallbackProps {
  mode: HeroMode;
  /** Assembly complete — the page starts the wordmark reveal. */
  onAssembled: () => void;
}

/** ms offsets for "full": structure, interior, body, identity. */
const FULL_TIMES = [950, 1850, 2750, 3850];
const FULL_COMPLETE = 5350;
/** "short" starts ~80% assembled (body on) and finishes fast. */
const SHORT_FINAL = 350;
const SHORT_COMPLETE = 1000;

/**
 * The non-WebGL hero: an exploded engineering drawing that assembles itself
 * in the same five stages as the 3D scene. This is a designed deliverable —
 * the brand must read completely even where WebGL never runs.
 */
export const HeroFallback = forwardRef<HeroFallbackHandle, HeroFallbackProps>(
  function HeroFallback({ mode, onAssembled }, ref) {
    const [stage, setStage] = useState(mode === "static" ? 5 : mode === "short" ? 3 : 0);
    const [instant, setInstant] = useState(mode !== "full");
    const timers = useRef<number[]>([]);
    const done = useRef(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const complete = stage >= 5;

    const finish = () => {
      if (done.current) return;
      done.current = true;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      setStage(5);
      onAssembled();
    };

    useImperativeHandle(ref, () => ({ finish }));

    /* Timeline per mode */
    useEffect(() => {
      if (mode === "static") {
        finish();
        return;
      }
      if (mode === "short") {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setInstant(false))
        );
        timers.current.push(window.setTimeout(() => setStage(4), SHORT_FINAL));
        timers.current.push(window.setTimeout(finish, SHORT_COMPLETE));
      } else {
        FULL_TIMES.forEach((t, i) =>
          timers.current.push(window.setTimeout(() => setStage(i + 1), t))
        );
        timers.current.push(window.setTimeout(finish, FULL_COMPLETE));
      }
      return () => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    /* ≤2° pointer parallax after assembly — fine pointers only */
    useEffect(() => {
      if (!complete) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = rootRef.current;
      if (!el) return;
      let raf = 0;
      const onMove = (e: PointerEvent) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          el.style.transform = `perspective(1400px) rotateY(${(nx * 2).toFixed(2)}deg) rotateX(${(-ny * 1.2).toFixed(2)}deg)`;
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        el.style.transform = "";
      };
    }, [complete]);

    return (
      <div ref={rootRef} className="car-root" style={{ willChange: "transform" }}>
        <svg
          className={`car-svg${complete ? " is-complete" : ""}${complete && mode !== "static" ? " do-sweep" : ""}${instant ? " no-anim" : ""}`}
          viewBox={CAR_VIEWBOX}
          role="img"
          aria-label="Exploded engineering drawing of a vehicle assembling into a completed car"
        >
          <CarArt
            idPrefix="hero"
            assembledStage={stage}
            sweep
            showLabels
            labelsDimmed={mode === "static"}
          />
        </svg>
      </div>
    );
  }
);
