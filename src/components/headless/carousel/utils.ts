import type { Easing } from "./types";

export function invariant(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function toEasingCss(easing: Easing): string {
  if (typeof easing === "string") return easing;
  const [x1, y1, x2, y2] = easing.cubicBezier;
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
}
