import type { Axis, Px } from "../../core/types";
import { asPx } from "../../core/brands";

/**
 * Hot-path-safe scroll listener.
 *
 * Requirements:
 * - No allocations per event
 * - No React state updates
 * - No "decisions" (snapping, index, windowing) inside the handler
 *
 * This handler ONLY writes the latest scroll offset to a caller-provided sink.
 */

export interface ScrollWriteSink {
  write(px: Px): void;
}

/**
 * Creates a scroll handler bound to a specific viewport element.
 * The closure is created once; per-event work is constant and allocation-free.
 */
export function createScrollHandler(params: {
  readonly axis: Axis;
  readonly viewport: HTMLElement;
  readonly sink: ScrollWriteSink;
}): () => void {
  const isX = params.axis === "x";
  const el = params.viewport;
  const sink = params.sink;

  return () => {
    // Reading scrollLeft/scrollTop is cheap; still avoid any extra branching work.
    const raw = isX ? el.scrollLeft : el.scrollTop;
    // Normalize -0 and NaN defensively.
    const px = Number.isFinite(raw) ? raw : 0;
    sink.write(asPx(px));
  };
}
