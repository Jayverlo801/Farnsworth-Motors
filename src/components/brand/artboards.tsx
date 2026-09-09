import { DIVISIONS, DIVISION_LINE, type DivisionKey } from "@/lib/brand";
import { fmtMiles, fmtPrice } from "@/lib/format";
import { getFeaturedVehicle } from "@/lib/vehicles/source";
import { maskVin, titleLabel, vehicleName } from "@/lib/vehicles/types";
import { Mark } from "./Mark";
import { Lockup, Wordmark } from "./Lockup";
import { QRPlaceholder } from "./QRPlaceholder";

/**
 * Off-screen applications, rendered at real proportions. These prove the
 * system works beyond the site: negative space, one idea, mono for facts.
 */

export function Artboard({
  title,
  note,
  children,
  wide = false,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <figure className={wide ? "col-span-full" : ""}>
      <div className="artboard">{children}</div>
      <figcaption className="mt-4">
        <span className="t-data text-[0.6875rem] tracking-[0.14em] text-muted uppercase">{title}</span>
        {note && <span className="ml-3 text-xs text-muted/60">{note}</span>}
      </figcaption>
    </figure>
  );
}

/* a) Vehicle window sticker — 8.5×11 */
export async function WindowSticker() {
  const v = await getFeaturedVehicle();
  return (
    <div className="sheet" style={{ aspectRatio: "8.5 / 11" }}>
      <div className="flex items-start justify-between">
        <Lockup size={0.95} />
        <span className="t-data text-[0.65rem] text-muted">{v.id}</span>
      </div>
      <div className="mt-auto">
        <p className="t-data text-[0.7rem] text-muted">{v.year}</p>
        <p className="mt-1 text-[1.35rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
          {v.make} {v.model} {v.trim}
        </p>
        <p className="mt-2 t-data text-[0.75rem] text-accent-soft" style={{ color: "#8b0000" }}>
          REBUILT TITLE — STATED PLAINLY, DOCUMENTED FULLY
        </p>
        <p className="mt-5 t-data text-[1.6rem] text-ink">{fmtPrice(v.price)}</p>
        <p className="mt-1 t-data text-[0.7rem] text-muted">
          {fmtMiles(v.mileage)} · {v.drivetrain} · VIN {maskVin(v.vin)}
        </p>
      </div>
      <div className="mt-7 flex items-end justify-between border-t border-line pt-5">
        <div className="text-ink">
          <QRPlaceholder seed={v.vin} size={72} />
          <p className="mt-2 t-data text-[0.6rem] text-muted">SCAN — VEHICLE RECORD</p>
        </div>
        <p className="t-data text-right text-[0.6rem] leading-relaxed text-text3" style={{ color: "#8a775e" }}>
          {DIVISION_LINE}
        </p>
      </div>
    </div>
  );
}

/* b) Vehicle Record cover sheet — 8.5×11 */
export async function RecordCoverSheet() {
  const v = await getFeaturedVehicle();
  const rows: Array<[string, string]> = [
    ["VIN", maskVin(v.vin)],
    ["Title", `${titleLabel(v)} — Utah`],
    ["Acquisition", v.record.acquisition],
    ["Damage", v.record.damageClassification],
    ["Repair", "See pages 2–4 — parts, invoices, photo log"],
    ["Inspection", v.record.inspectionStatus],
  ];
  return (
    <div className="sheet" style={{ aspectRatio: "8.5 / 11" }}>
      <div className="flex items-start justify-between">
        <Mark size={26} className="text-ink" />
        <span className="t-data text-[0.65rem] text-muted">VEHICLE RECORD · {v.id}</span>
      </div>
      <p className="mt-10 text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
        {vehicleName(v)}
      </p>
      <p className="mt-1 t-data text-[0.7rem] text-muted">
        The documented history of this vehicle. It travels with the car.
      </p>
      <div className="mt-8 border-t border-line">
        {rows.map(([k, val]) => (
          <div key={k} className="grid grid-cols-[88px_1fr] gap-3 border-b border-line py-2.5">
            <span className="t-data text-[0.6rem] text-text3 uppercase" style={{ color: "#8a775e" }}>{k}</span>
            <span className="t-data text-[0.68rem] text-ink">{val}</span>
          </div>
        ))}
      </div>
      <p className="mt-auto t-data text-[0.58rem] leading-relaxed text-text3" style={{ color: "#8a775e" }}>
        {DIVISION_LINE}
      </p>
    </div>
  );
}

/* c) License plate frame */
export function PlateFrame() {
  return (
    <div
      className="relative mx-auto rounded-[10px] border-[6px] border-[#d3c9a2] bg-transparent"
      style={{ aspectRatio: "12 / 6.4", maxWidth: 420 }}
    >
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <span className="mt-[2px] flex items-center gap-2">
          <Mark size={13} className="text-ink" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <span className="t-data mb-[3px] text-[0.55rem] tracking-[0.22em] text-ink">
          FARNSWORTH MOTORS · SALT LAKE CITY
        </span>
      </div>
      <div className="absolute inset-[10px] grid place-items-center rounded border border-line/50">
        <span className="t-data text-[0.6rem] text-text3" style={{ color: "#8a775e" }}>PLATE</span>
      </div>
    </div>
  );
}

/* d) Shop sign lockups — wide format */
export function ShopSign({ division }: { division: DivisionKey }) {
  return (
    <div className="flex items-center justify-center gap-5 border border-line bg-[#f4efda] px-10 py-12">
      <Mark size={34} className="text-ink" optical="large" />
      <span className="inline-flex items-baseline gap-[0.45em] text-[1.6rem] tracking-[-0.02em] whitespace-nowrap">
        <span className="font-semibold text-ink">FARNSWORTH</span>
        <span className="font-normal text-muted">{DIVISIONS[division].word}</span>
      </span>
    </div>
  );
}

/* e) Social avatar + 1:1 post */
export function SocialSet() {
  return (
    <div className="grid grid-cols-[96px_1fr] items-start gap-6">
      <div className="grid aspect-square w-24 place-items-center rounded-full bg-[#f4efda] outline outline-1 outline-line">
        <Mark size={40} className="text-ink" optical="small" />
      </div>
      <div className="sheet !p-8" style={{ aspectRatio: "1 / 1" }}>
        <Mark size={20} className="text-ink" />
        <p className="mt-auto text-[1.3rem] leading-[1.05] font-semibold tracking-[-0.025em] text-ink">
          A REBUILT TITLE
          <br />
          SHOULD NEVER BE
          <br />
          A SURPRISE.
        </p>
        <p className="mt-4 t-data text-[0.6rem] text-muted">
          THE FARNSWORTH STANDARD · 05
        </p>
      </div>
    </div>
  );
}

/* f) Business card, front and back — 3.5×2 */
export function BusinessCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="sheet !justify-between !p-6" style={{ aspectRatio: "3.5 / 2" }}>
        <Mark size={20} className="text-ink" />
        <Wordmark size={0.95} />
      </div>
      <div className="sheet !justify-between !p-6" style={{ aspectRatio: "3.5 / 2" }}>
        <p className="t-data text-[0.62rem] leading-relaxed text-muted">
          SALT LAKE CITY, UTAH
          <br />
          SE HABLA ESPAÑOL
        </p>
        <p className="t-data text-[0.58rem] leading-relaxed text-text3" style={{ color: "#8a775e" }}>
          MOTORS · COLLISION · SERVICE
        </p>
      </div>
    </div>
  );
}
