import type { SnapTarget } from "../../core/types";

export function slideSnap(params: {
  readonly slideStart: number;
  readonly slideSize: number;
  readonly align: SnapTarget;
}): number {
  const start = Number.isFinite(params.slideStart) ? params.slideStart : 0;
  const size = Math.max(0, Number.isFinite(params.slideSize) ? params.slideSize : 0);

  if (params.align === "center") return start + size / 2;
  return params.align === "end" ? start + size : start;
}
