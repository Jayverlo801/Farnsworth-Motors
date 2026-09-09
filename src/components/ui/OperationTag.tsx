import { DIVISIONS, type DivisionKey } from "@/lib/brand";

/**
 * The division tag: a 6px accent square + mono label. This is how the three
 * operations appear everywhere except the umbrella band — quiet, factual.
 */
export function OperationTag({
  divisions,
  className,
}: {
  divisions: DivisionKey[];
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.12em] text-muted uppercase${className ? ` ${className}` : ""}`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-[6px] w-[6px] shrink-0"
        style={{ background: "rgba(29, 29, 31, 0.5)" }}
      />
      {divisions.map((k, i) => (
        <span key={k}>
          {i > 0 && <span className="mx-1">·</span>}
          {DIVISIONS[k].tag}
        </span>
      ))}
    </span>
  );
}
