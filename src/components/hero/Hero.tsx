"use client";

import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroCopy } from "./HeroCopy";
import { HeroFallback } from "./HeroFallback";
import { HeroPoster } from "./HeroPoster";
import type { HeroMode, HeroQuality } from "./types";

const HeroScene3D = dynamic(() => import("./three/HeroScene3D"), {
  ssr: false,
});

const SEEN_KEY = "fm:hero-seen:gt3rs-v1";
const READY_TIMEOUT_MS = 12000;

type SceneState = "loading" | "ready" | "unavailable";

function decideQuality(): HeroQuality {
  if (typeof navigator === "undefined") return "medium";
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const wide = window.innerWidth >= 1024;
  if (nav.connection?.saveData || mem <= 4 || window.innerWidth < 768) return "low";
  if (mem >= 8 && cores >= 8 && fine && wide) return "high";
  return "medium";
}

/**
 * The Porsche owns the lower viewport; the wordmark keeps its upper band.
 * Visit/device/accessibility policy stays here, not inside the 3D scene.
 */
export default function Hero() {
  const [mode, setMode] = useState<HeroMode | null>(null);
  const [quality, setQuality] = useState<HeroQuality>("medium");
  const [scene, setScene] = useState<SceneState>("loading");
  const [force3DOff, setForce3DOff] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);

  /* scrollProgress: 0 at top, 1 when the hero has fully scrolled off */
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end start"],
  });
  /* Part 1.7: one motion — the drawing scales 1→1.18, drops 8vh, fades out */
  const carScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const carY = useTransform(scrollYProgress, [0, 1], ["0svh", "8svh"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -48]);

  /* paused when tab hidden or hero offscreen */
  const inView = useInView(pinRef, { amount: 0.05 });
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  const paused = hidden || !inView;

  /* Mode + quality resolution (client-only decisions live here, never in the scene) */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("hero");
    // QA switch for integration: ?3d=off exercises the fallback path.
    const force3D = params.get("3d") === "on";
    const disable3D = params.get("3d") === "off" || q === "exploded";
    const prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let m: HeroMode = "full";
    try {
      if (localStorage.getItem(SEEN_KEY)) m = "short";
    } catch {
      /* private mode */
    }
    if (q === "full") m = "full";
    if (q === "skip") m = "short";
    if (q === "static") m = "static";
    if (prm) m = "static";
    // Design/reference state: the exploded drawing, frozen, labels on.
    if (q === "exploded") m = "static";
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const quality = decideQuality();
      // Page-side policy: low-end devices never pay the WebGL boot cost —
      // they get the designed fallback (docs/DECISIONS.md). ?3d=on overrides
      // for testing the scene on small viewports.
      if (disable3D || (quality === "low" && !force3D)) {
        setForce3DOff(true);
        setScene("unavailable");
        if (q !== "exploded") m = "static";
      }
      if (q === "exploded") setFrozen(true);
      setMode(m);
      setQuality(force3D && quality === "low" ? "medium" : quality);
    });
    return () => { cancelled = true; };
  }, []);

  /* If the scene never reports ready, treat it as unavailable */
  useEffect(() => {
    if (scene !== "loading" || !mode || paused) return;
    const t = window.setTimeout(
      () => setScene((s) => (s === "loading" ? "unavailable" : s)),
      READY_TIMEOUT_MS
    );
    return () => window.clearTimeout(t);
  }, [scene, mode, paused]);

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const handleAssembled = useCallback(() => {
    setAssembled(true);
    markSeen();
  }, []);

  /* Usability: scroll intent or keys complete the cinematic instantly */
  useEffect(() => {
    if (mode !== "full" || assembled) return;
    const skip = () => setMode("static");
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "End", " "].includes(e.key)) skip();
    };
    window.addEventListener("wheel", skip, { passive: true, once: true });
    window.addEventListener("touchmove", skip, { passive: true, once: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, [mode, assembled]);

  const showFallback = scene === "unavailable";
  /* The poster is captured from the assembled pose. In full mode the scene
     opens exploded, so the poster would spoil the reconstruction — serve it
     only where the pose matches (short / static). DECISIONS #21. */
  const showPoster = posterOk && !showFallback && mode !== "full";

  return (
    <div ref={wrapRef} className="hero-wrap" id="top">
      <section
        ref={pinRef}
        className="hero-pin"
        aria-label="Farnsworth Motors — Porsche 911 GT3 RS assembly"
        data-hero-model="gt3rs-reference-build"
        data-hero-state={scene}
        data-hero-mode={mode ?? "loading"}
        data-hero-quality={quality}
      >
        <motion.div className="hero-inner" style={{ opacity: heroOpacity }}>
          {/* ---- lower band: the vehicle ---- */}
          <div className={`hero-visual${mode ? " is-mounted" : ""}${assembled ? " is-brand" : ""}`}>
            {/* Poster — LCP element; produced by the 3D build. Hidden if absent. */}
            {showPoster && (
              <HeroPoster
                hidden={scene === "ready"}
                onError={() => setPosterOk(false)}
              />
            )}

            {/* Both layers stay mounted through the poster-to-canvas crossfade. */}
            {mode && scene !== "unavailable" && !force3DOff && (
              <div className={`hero-canvas${scene === "ready" ? " is-ready" : ""}`}>
                <HeroScene3D
                  mode={mode}
                  quality={quality}
                  scrollProgress={scrollYProgress}
                  paused={paused}
                  onReady={() => setScene("ready")}
                  onAssembled={handleAssembled}
                  onUnavailable={() => setScene("unavailable")}
                />
              </div>
            )}

            {/* Designed non-WebGL experience, anchored to the ground line */}
            {mode && showFallback && (
              <motion.div className="hero-fallback" style={mode === "static" ? undefined : { scale: carScale, y: carY }}>
                <HeroFallback
                  frozen={frozen}
                  onAssembled={handleAssembled}
                />
              </motion.div>
            )}
          </div>

          {/* ---- upper band: the wordmark ---- */}
          <motion.div style={{ y: copyY }} className="hero-band">
            <HeroCopy visible={assembled} fast={mode !== "full"} />
          </motion.div>

          {mode === "full" && !assembled && (
            <button
              type="button"
              className="hero-skip"
              onClick={() => setMode("static")}
            >
              Skip
            </button>
          )}

          <p className="sr-only" role="status">
            {assembled ? "Vehicle assembly complete." : "Vehicle assembling."}
          </p>
        </motion.div>
      </section>
    </div>
  );
}
