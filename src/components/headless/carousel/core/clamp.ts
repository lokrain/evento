// src/components/headless/carousel/core/clamp.ts

import { asIndex } from "./brands";
import type { LogicalIndex } from "./types";

export function clampIndex(index: LogicalIndex, count: number, loop: boolean): LogicalIndex {
  if (count <= 0) return asIndex(0);

  if (loop) {
    const m = ((index % count) + count) % count;
    return asIndex(m);
  }

  if (index < 0) return asIndex(0);
  if (index >= count) return asIndex(count - 1);

  return index;
}
