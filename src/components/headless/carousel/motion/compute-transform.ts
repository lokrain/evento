export function computeTransform(offsetPx: number, axis: "x" | "y") {
  return axis === "x" ? `translate3d(${offsetPx}px, 0, 0)` : `translate3d(0, ${offsetPx}px, 0)`;
}