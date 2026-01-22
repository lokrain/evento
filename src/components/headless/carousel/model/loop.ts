// Normalize offset into center band [-snap/2, snap/2) for looped tracks.
export function normalizeLoop(offset: number, snapSpacing: number): number {
  if (snapSpacing === 0) return offset;
  const band = snapSpacing;
  // Bring into [0, band)
  const normalized = ((offset % band) + band) % band;
  // Shift into [-band/2, band/2)
  return normalized >= band / 2 ? normalized - band : normalized;
}