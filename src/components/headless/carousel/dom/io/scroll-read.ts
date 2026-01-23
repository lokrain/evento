import type { Axis } from "../../core/types";

export function readScrollOffset(element: HTMLElement | null, axis: Axis): number {
  if (!element) return 0;
  return axis === "x" ? element.scrollLeft : element.scrollTop;
}
