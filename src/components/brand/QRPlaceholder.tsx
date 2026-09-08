/**
 * Deterministic QR-style placeholder (NOT scannable). Stands in for the real
 * Vehicle Record QR until record URLs are live — swap for a generated code
 * at print time.
 */
export function QRPlaceholder({ seed = "FM", size = 84 }: { seed?: string; size?: number }) {
  const n = 17;
  let h = 2166136261;
  for (const c of seed) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    cells.push((h & 5) === 5 || (h & 3) === 2);
  }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="5" height="5" fill="currentColor" />
      <rect x={x + 1} y={y + 1} width="3" height="3" fill="var(--bg, #fff)" />
      <rect x={x + 2} y={y + 2} width="1" height="1" fill="currentColor" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} aria-hidden="true">
      {cells.map((on, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        const inFinder =
          (x < 6 && y < 6) || (x > n - 7 && y < 6) || (x < 6 && y > n - 7);
        return on && !inFinder ? (
          <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" />
        ) : null;
      })}
      {finder(0, 0)}
      {finder(n - 5, 0)}
      {finder(0, n - 5)}
    </svg>
  );
}
