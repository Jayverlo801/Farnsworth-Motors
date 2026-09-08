"use client";

import { useState } from "react";
import { CarSvg } from "@/components/car/CarSvg";

/**
 * Signature interaction: drag (or arrow-key) a divider between the damage
 * documentation and the finished vehicle. Both layers share the exact same
 * geometry, so alignment is perfect by construction.
 */
export function BeforeAfterSlider() {
  const [pos, setPos] = useState(58);

  return (
    <div className="ba" style={{ ["--pos" as string]: `${pos}%` }}>
      <div className="ba-frame">
        <div className="ba-layer ba-after">
          <CarSvg idPrefix="ba-after" shadow={false} />
        </div>
        <div className="ba-layer ba-before" aria-hidden="true">
          <CarSvg idPrefix="ba-before" damaged shadow={false} />
        </div>

        <div className="ba-divider" aria-hidden="true">
          <span className="ba-handle">
            <span>‹</span>
            <span>›</span>
          </span>
        </div>

        <span className="ba-tag ba-tag-before" aria-hidden="true">
          Before
        </span>
        <span className="ba-tag ba-tag-after" aria-hidden="true">
          After
        </span>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          className="ba-range"
          aria-label="Reveal the before and after comparison"
        />
      </div>
    </div>
  );
}
