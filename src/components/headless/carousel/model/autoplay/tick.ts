export function autoplayTick(_delayMs: number, _cb: () => void): number {
  return window.setTimeout(_cb, _delayMs);
}
