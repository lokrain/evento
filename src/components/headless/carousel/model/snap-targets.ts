// Resolve nearest snap target index given current offset and snap points.
export function resolveSnapTarget(offset: number, snapPoints: number[]): number {
  if (snapPoints.length === 0) return 0;
  let nearest = 0;
  let best = Math.abs(offset - snapPoints[0]);
  for (let i = 1; i < snapPoints.length; i += 1) {
    const dist = Math.abs(offset - snapPoints[i]);
    if (dist < best) {
      best = dist;
      nearest = i;
    }
  }
  return nearest;
}