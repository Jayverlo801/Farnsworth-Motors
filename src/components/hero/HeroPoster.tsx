import Image from "next/image";

/** A still of the same GT3 RS, never the legacy generic coupe. */
export function HeroPoster({ hidden = false, exploded = false, onError }: {
  hidden?: boolean;
  exploded?: boolean;
  onError?: () => void;
}) {
  return <Image
    src={`/3d/gt3rs-study/${exploded ? "exploded" : "hero-poster"}.webp`}
    alt="Silver Porsche 911 GT3 RS visualization"
    width={exploded ? 2400 : 1317}
    height={exploded ? 1500 : 660}
    loading="eager"
    fetchPriority="high"
    unoptimized
    className="hero-poster"
    style={{ opacity: hidden ? 0 : 1 }}
    onError={onError}
  />;
}
