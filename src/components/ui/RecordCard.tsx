import type { Vehicle } from "@/types/vehicle";

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
  const rows: Array<[string, string]> = [];

  rows.push(["VIN", vehicle.vinMasked]);
  rows.push(["Title", `${vehicle.titleStatus} — Utah`]);
  if (r.acquisitionRecord) rows.push(["Acquired", r.acquisitionRecord]);
  if (r.damageClassification) rows.push(["Classification", r.damageClassification]);
  if (r.damageSummary) rows.push(["Damage", r.damageSummary]);
  if (r.repairSummary) rows.push(["Repair", r.repairSummary]);
  if (r.partsReplaced?.length) rows.push(["Parts replaced", r.partsReplaced.join(" · ")]);
  if (r.inspectionStatus) rows.push(["Inspection", r.inspectionStatus]);
  if (r.documentation?.length) rows.push(["On file", r.documentation.join(" · ")]);

  return (
    <div className={`rec${className ? ` ${className}` : ""}`}>
      <div className="rec-head">
        <span>Vehicle Record</span>
        <span>{vehicle.recordNo}</span>
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
