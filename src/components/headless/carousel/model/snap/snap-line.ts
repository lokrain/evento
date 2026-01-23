import type { SnapTarget } from "../../core/types";

export function snapLine(params: { readonly viewportSize: number; readonly align: SnapTarget }): number {
  const size = Math.max(0, Math.trunc(params.viewportSize));
  if (params.align === "center") return size / 2;
  return params.align === "end" ? size : 0;
}
