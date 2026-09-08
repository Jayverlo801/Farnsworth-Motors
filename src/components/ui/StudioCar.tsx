import { CarSvg } from "@/components/car/CarSvg";

interface StudioCarProps {
  idPrefix: string;
  className?: string;
}

/** A vehicle presented on a dark studio floor with a soft reflection. */
export function StudioCar({ idPrefix, className }: StudioCarProps) {
  return (
    <div className={`studio${className ? ` ${className}` : ""}`}>
      <div className="studio-inner">
        <CarSvg idPrefix={idPrefix} shadow={false} className="studio-car" />
        <div aria-hidden="true">
          <CarSvg idPrefix={`${idPrefix}-r`} shadow={false} className="studio-reflect" />
        </div>
      </div>
    </div>
  );
}
