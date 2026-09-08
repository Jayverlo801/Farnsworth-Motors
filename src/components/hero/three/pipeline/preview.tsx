import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { motionValue } from "framer-motion";
import HeroScene3D from "../HeroScene3D";
import type { HeroMode, HeroQuality } from "../../types";

declare global {
  interface Window {
    heroTest: {
      events: { name: string; at: number; reason?: string }[];
      pause: (paused: boolean) => void;
      scroll: (progress: number) => void;
      dispose: () => void;
    };
  }
}
const query = new URLSearchParams(window.location.search);
const mode = (query.get("mode") ?? "static") as HeroMode;
const quality = (query.get("quality") ?? "high") as HeroQuality;
const progress = motionValue(0);
const root = createRoot(document.getElementById("root")!);
// Child effects may report capability failure before Preview's effect runs.
window.heroTest = { events: [], pause: () => {}, scroll: (p) => progress.set(p), dispose: () => root.unmount() };

function Preview() {
  const [paused, pause] = useState(false);
  useEffect(() => {
    window.heroTest.pause = pause;
  }, []);
  const notify = (name: string, reason?: string) => window.heroTest?.events.push({ name, reason, at: performance.now() });
  return <section style={{ position: "absolute", inset: 0 }}>
    <HeroScene3D mode={mode} quality={quality} paused={paused} scrollProgress={progress}
      onReady={() => notify("ready")} onAssembled={() => notify("assembled")}
      onUnavailable={(reason) => notify("unavailable", reason)} />
  </section>;
}
root.render(<Preview />);
