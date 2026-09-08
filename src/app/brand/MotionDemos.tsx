"use client";

import { useState } from "react";
import { seat, settle, sweep } from "@/lib/motion";

/** Live demos of the three motions. Replay to inspect; nothing else exists. */
export function MotionDemos() {
  const [seatKey, setSeatKey] = useState(0);
  const [sweepKey, setSweepKey] = useState(0);

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="demo-cell">
        <div key={seatKey} className="demo-seat rec !rounded-xl p-6">
          <p className="t-data text-[0.7rem] text-muted">SEAT</p>
          <p className="mt-2 text-sm text-ink">Arrives like a part seating.</p>
        </div>
        <button type="button" className="demo-btn" onClick={() => setSeatKey((k) => k + 1)}>
          Replay
        </button>
        <p className="demo-spec">
          cubic-bezier({seat.ease.join(", ")}) · {seat.duration.min}–{seat.duration.max}ms ·{" "}
          {seat.travel.min}–{seat.travel.max}px · no overshoot
        </p>
      </div>

      <div className="demo-cell">
        <div key={sweepKey} className="demo-sweep rec !rounded-xl p-6">
          <p className="t-data text-[0.7rem] text-muted">SWEEP</p>
          <p className="mt-2 text-sm text-ink">One highlight pass, then silence.</p>
        </div>
        <button type="button" className="demo-btn" onClick={() => setSweepKey((k) => k + 1)}>
          Replay
        </button>
        <p className="demo-spec">
          {sweep.duration / 1000}s · accent-warm ≤ {sweep.maxOpacity * 100}% opacity
        </p>
      </div>

      <div className="demo-cell">
        <div className="demo-settle rec !rounded-xl p-6" tabIndex={0}>
          <p className="t-data text-[0.7rem] text-muted">SETTLE</p>
          <p className="mt-2 text-sm text-ink">Hover / press micro-motion.</p>
        </div>
        <p className="demo-btn-spacer" aria-hidden="true" />
        <p className="demo-spec">
          {settle.duration}ms · scale {settle.scale.rest.toFixed(2)}→{settle.scale.max.toFixed(2)} max
        </p>
      </div>
    </div>
  );
}
