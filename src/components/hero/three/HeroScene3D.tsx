"use client";

import { useEffect } from "react";
import type { HeroSceneProps } from "../types";

// Replaced by the 3D build.
export default function HeroScene3D({ onUnavailable }: HeroSceneProps) {
  useEffect(() => onUnavailable("3d-not-installed"), [onUnavailable]);
  return null;
}
