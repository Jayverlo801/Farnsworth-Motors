/**
 * The Farnsworth mark: an F built from two pieces separated by a hairline —
 * the panel gap. Two parts that fit precisely, like a hood shut line.
 * Geometric, single stroke weight, no gradients.
 *
 * Optical sizes: the gap widens as the mark shrinks so it survives at 16px,
 * and tightens at large sizes so it stays a hairline at 2m.
 */

export type MarkOptical = "small" | "medium" | "large";

/** viewBox 0 0 64 64 · bar weight 10 · gap by optical size. */
const GAP: Record<MarkOptical, number> = { small: 5, medium: 3.5, large: 2.25 };

interface MarkProps {
  /** Rendered size in px (drives optical gap unless `optical` is set). */
  size?: number;
  optical?: MarkOptical;
  className?: string;
  /** Fill color; defaults to currentColor so text utilities tint it. */
  color?: string;
  title?: string;
}

export function opticalFor(size: number): MarkOptical {
  if (size <= 24) return "small";
  if (size <= 96) return "medium";
  return "large";
}

export function MarkPaths({ optical = "medium", color = "currentColor" }: { optical?: MarkOptical; color?: string }) {
  const g = GAP[optical];
  return (
    <>
      {/* stem */}
      <rect x="16" y="8" width="10" height="48" fill={color} />
      {/* top arm — separated by the shut line */}
      <rect x={26 + g} y="8" width={22 - g} height="10" fill={color} />
      {/* mid arm */}
      <rect x={26 + g} y="27" width={16 - g} height="10" fill={color} />
    </>
  );
}

export function Mark({ size = 32, optical, className, color = "currentColor", title }: MarkProps) {
  const o = optical ?? opticalFor(size);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
    >
      {title && <title>{title}</title>}
      <MarkPaths optical={o} color={color} />
    </svg>
  );
}
