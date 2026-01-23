export function computeAnchorLock(current: number, target: number): number {
  const cur = Number.isFinite(current) ? current : 0;
  const next = Number.isFinite(target) ? target : cur;
  return next;
}
