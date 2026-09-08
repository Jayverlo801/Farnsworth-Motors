import { DIVISIONS, type DivisionKey } from "@/lib/brand";
import { Mark } from "./Mark";

/**
 * Wordmark lockups. "FARNSWORTH" carries weight 600 in --text; the division
 * word drops to weight 400 in --text-2 — the two-tone treatment used in the
 * nav, the hero, and every off-screen application.
 */

interface WordmarkProps {
  division?: DivisionKey;
  className?: string;
  /** rem size of the text line. */
  size?: number;
}

export function Wordmark({ division = "motors", className, size = 1.125 }: WordmarkProps) {
  const d = DIVISIONS[division];
  return (
    <span
      className={`inline-flex items-baseline gap-[0.45em] whitespace-nowrap${className ? ` ${className}` : ""}`}
      style={{ fontSize: `${size}rem`, letterSpacing: "-0.02em" }}
    >
      <span className="font-semibold text-ink">FARNSWORTH</span>
      <span className="font-normal text-muted">{d.word}</span>
    </span>
  );
}

interface LockupProps {
  division?: DivisionKey;
  /** mark + wordmark side by side, or stacked. */
  layout?: "horizontal" | "stacked";
  size?: number;
  withDescriptor?: boolean;
  className?: string;
}

export function Lockup({
  division = "motors",
  layout = "horizontal",
  size = 1.125,
  withDescriptor = false,
  className,
}: LockupProps) {
  const d = DIVISIONS[division];
  const mark = <Mark size={Math.round(size * 22)} className="text-ink" />;
  if (layout === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-3${className ? ` ${className}` : ""}`}>
        {mark}
        <Wordmark division={division} size={size} />
        {withDescriptor && (
          <span className="t-data !text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
            {d.descriptor}
          </span>
        )}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-[0.7em]${className ? ` ${className}` : ""}`}>
      {mark}
      <span className="inline-flex flex-col">
        <Wordmark division={division} size={size} />
        {withDescriptor && (
          <span className="t-data mt-1 !text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
            {d.descriptor}
          </span>
        )}
      </span>
    </span>
  );
}
