import { CarArt, CAR_VIEWBOX } from "./carArt";

interface CarSvgProps {
  /** Unique per page instance — namespaces SVG defs ids. */
  idPrefix: string;
  damaged?: boolean;
  shadow?: boolean;
  className?: string;
}

/** Static, fully assembled rendering of the Farnsworth line-art vehicle. */
export function CarSvg({ idPrefix, damaged = false, shadow = true, className }: CarSvgProps) {
  return (
    <svg
      className={`car-svg is-complete${className ? ` ${className}` : ""}`}
      viewBox={CAR_VIEWBOX}
      aria-hidden="true"
      focusable="false"
    >
      <CarArt idPrefix={idPrefix} damaged={damaged} showShadow={shadow} />
    </svg>
  );
}
