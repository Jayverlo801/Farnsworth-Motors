"use client";

import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import type { HeroSceneProps } from "../types";
import { readPalette, type Palette } from "./model";
import { Reconstruction } from "./Reconstruction";

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Scene-only boundary. Device, visit and accessibility decisions belong to Hero. */
export default function HeroScene3D(props: HeroSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const failed = useRef(false);
  const callbacks = useRef(props);
  useEffect(() => { callbacks.current = props; });
  const fail = useCallback((reason: string) => {
    if (failed.current) return;
    failed.current = true;
    if (process.env.NODE_ENV === "development") console.warn(`[Farnsworth hero] ${reason}`);
    setUnavailable(true);
    callbacks.current.onUnavailable(reason);
  }, []);
  const sceneError = useCallback(() => fail("scene-error"), [fail]);

  useEffect(() => {
    if (!host.current) return;
    // Canvas's fallback is HTML content inside <canvas>, not a capability signal.
    // Probe WebGL2 explicitly and immediately release this temporary context.
    const probe = document.createElement("canvas");
    try {
      const context = probe.getContext("webgl2");
      if (!context) { fail("no-webgl"); return; }
      context.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { fail("no-webgl"); return; }
    try { setPalette(readPalette(host.current)); }
    catch { fail("missing-design-tokens"); }
  }, [fail]);

  if (unavailable) return null;
  return (
    <div ref={host} aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {palette && (
        <SceneBoundary onError={sceneError}>
          <Canvas
            orthographic
            frameloop={props.paused ? "never" : props.mode === "static" ? "demand" : "always"}
            dpr={1}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            camera={{ position: [4, 2.4, 10], near: .025, far: 80 }}
            style={{ pointerEvents: "none" }}
          >
            {/* Keep HDR loading inside the existing canvas. Suspending Canvas
                itself disconnects its effects; R3F's delayed cleanup can then
                destroy the resumed renderer during development. */}
            <Suspense fallback={null}>
              <Reconstruction {...props} palette={palette} fail={fail} />
            </Suspense>
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
