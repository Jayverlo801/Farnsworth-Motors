import Image from "next/image";
import { CarSvg } from "@/components/car/CarSvg";

interface PhotoFrameProps {
  /** Slot id from public/images/MANIFEST.md, e.g. "S2-FEATURED". */
  slot: string;
  /** CSS aspect-ratio value, e.g. "16 / 10". */
  ratio: string;
  /** Real photograph path once it exists — replaces the placeholder. */
  src?: string;
  alt?: string;
  /** Show the faint coupe silhouette in the placeholder. */
  silhouette?: boolean;
  className?: string;
  sizes?: string;
}

/**
 * Photography slot. Until real photography exists it renders a designed
 * placeholder — dark studio gradient, soft floor falloff, faint coupe
 * silhouette, mono caption — at the exact ratio the final shot needs.
 * Every slot is catalogued in public/images/MANIFEST.md with direction
 * for the eventual shoot. No stock, ever.
 */
export function PhotoFrame({
  slot,
  ratio,
  src,
  alt = "",
  silhouette = true,
  className,
  sizes = "100vw",
}: PhotoFrameProps) {
  return (
    <div
      className={`photo-frame${className ? ` ${className}` : ""}`}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <>
          {silhouette && (
            <div className="photo-frame-car" aria-hidden="true">
              <CarSvg idPrefix={`pf-${slot.toLowerCase()}`} shadow={false} />
            </div>
          )}
          <span className="photo-frame-tag" aria-hidden="true">
            PHOTOGRAPHY PENDING · {slot}
          </span>
        </>
      )}
    </div>
  );
}
