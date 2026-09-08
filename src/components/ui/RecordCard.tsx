import {
  maskVin,
  type Vehicle,
} from "@/lib/vehicles/types";

interface RecordCardProps {
  vehicle: Vehicle;
  className?: string;
}

/**
 * The Farnsworth Vehicle Record. Renders only documentation that exists on
 * the vehicle object — absent fields are omitted, never invented.
 */
export function RecordCard({ vehicle, className }: RecordCardProps) {
  const r = vehicle.record;
  const rows: Array<[string, React.ReactNode]> = [];

  rows.push(["VIN", maskVin(vehicle.vin)]);
  rows.push(["Title status", `${vehicle.titleStatus === "rebuilt" ? "Rebuilt" : "Clean"} — Utah`]);
  if (r.acquisition) rows.push(["Acquisition", r.acquisition]);
  if (r.damageClassification) rows.push(["Damage classification", r.damageClassification]);
  rows.push([
    "Structure / mechanical",
    `${r.structuralAffected ? "Structural repair" : "No structural involvement"} · ${r.mechanicalAffected ? "mechanical repair" : "no mechanical repair"}`,
  ]);
  if (r.repairSummary) rows.push(["Repair summary", r.repairSummary]);
  if (r.partsReplaced.length)
    rows.push([
      "Parts replaced",
      <span key="parts">
        {r.partsReplaced.map((p, i) => (
          <span key={p.name}>
            {i > 0 && " · "}
            {p.name}
            {p.oem && <span className="rec-oem"> OEM</span>}
          </span>
        ))}
      </span>,
    ]);
  if (r.inspectionStatus) rows.push(["Inspection status", r.inspectionStatus]);
  const ba = vehicle.media.before.length + vehicle.media.after.length;
  rows.push([
    "Before / after",
    ba > 0
      ? `${vehicle.media.before.length} intake · ${vehicle.media.after.length} delivery photos`
      : "Photo sets attached to the record",
  ]);
  if (r.documentation.length)
    rows.push(["Documentation on file", r.documentation.map((d) => d.label).join(" · ")]);

  return (
    <div className={`rec${className ? ` ${className}` : ""}`}>
      <div className="rec-head">
        <span>Vehicle Record</span>
        <span>{vehicle.id}</span>
      </div>
      <div>
        {rows.map(([key, val]) => (
          <div className="rec-row" key={key}>
            <span className="rec-key">{key}</span>
            <span className="rec-val">{val}</span>
          </div>
        ))}
      </div>
      <p className="rec-foot">
        Records reflect the documentation in our possession for this vehicle —
        nothing more is implied. Full file available in person.
      </p>
    </div>
  );
}
