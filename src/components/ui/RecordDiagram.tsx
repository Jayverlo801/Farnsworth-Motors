import type { ReactNode } from "react";
import { CarSvg } from "@/components/car/CarSvg";
import type { Vehicle } from "@/lib/vehicles/types";

/**
 * Damage/repair diagram for the Vehicle Record. Part ids follow the shared
 * contract vocabulary; parts listed in record.partsReplaced light in
 * --accent-replaced, and the structure lights in --accent-intact when the
 * record shows no structural involvement. These two colors exist ONLY here
 * and in the record — never on buttons, headlines, or backgrounds.
 *
 * The default diagram is the side-elevation coupe; the 3D build can supply
 * a top view via the `diagram` prop (SVG string or component) using the
 * same data-part ids.
 */
export function RecordDiagram({
  vehicle,
  diagram,
  className,
}: {
  vehicle: Vehicle;
  diagram?: ReactNode | string;
  className?: string;
}) {
  const scope = `rdiag-${vehicle.slug.replace(/[^a-z0-9-]/gi, "")}`;
  const replaced = vehicle.record.partsReplaced
    .map((p) => p.partId)
    .filter((id): id is string => Boolean(id));
  const intact = vehicle.record.structuralAffected ? [] : ["structure"];

  const css = [
    ...replaced.map(
      (id) =>
        `.${scope} [data-part="${id}"] :is(path, rect, circle, line, ellipse) { stroke: var(--accent-replaced); }`
    ),
    ...intact.map(
      (id) =>
        `.${scope} [data-part="${id}"] :is(path, rect, circle, line, ellipse) { stroke: var(--accent-intact); }`
    ),
  ].join("\n");

  return (
    <figure className={`rdiag ${scope}${className ? ` ${className}` : ""}`}>
      <style>{css}</style>
      <div className="rdiag-stage">
        {typeof diagram === "string" ? (
          <div dangerouslySetInnerHTML={{ __html: diagram }} />
        ) : (
          diagram ?? <CarSvg idPrefix={`rd-${vehicle.slug}`} shadow={false} />
        )}
      </div>
      <figcaption className="rdiag-legend">
        <span>
          <i style={{ background: "var(--accent-intact)" }} aria-hidden="true" />
          Structure — verified, untouched
        </span>
        <span>
          <i style={{ background: "var(--accent-replaced)" }} aria-hidden="true" />
          Replaced with OEM parts
        </span>
      </figcaption>
    </figure>
  );
}
