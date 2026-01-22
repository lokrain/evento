export function computeTransition(durationMs: number, easing: string) {
  return `transform ${durationMs}ms ${easing}`;
}