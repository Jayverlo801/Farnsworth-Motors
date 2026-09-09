"use client";

import { useEffect } from "react";
import { HeroPoster } from "./HeroPoster";

/** Low-power and failed-WebGL visitors see the same Porsche, without a GPU
 * boot or a second assembly animation. The page copy is available immediately. */
export function HeroFallback({ onAssembled, frozen = false }: {
  onAssembled: () => void;
  frozen?: boolean;
}) {
  useEffect(() => { onAssembled(); }, [onAssembled]);
  return <HeroPoster exploded={frozen} />;
}
