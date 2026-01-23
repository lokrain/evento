export function pickTarget(params: {
  readonly current: number;
  readonly delta: number;
  readonly targets: ReadonlyArray<number>;
}): number {
  if (params.targets.length === 0) return params.current;

  const desired = params.current + params.delta;
  let best = params.targets[0];
  let bestDist = Math.abs(best - desired);

  for (let i = 1; i < params.targets.length; i += 1) {
    const candidate = params.targets[i];
    const dist = Math.abs(candidate - desired);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }

  return best;
}
