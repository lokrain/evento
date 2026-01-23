import type { VirtualWindow } from "../../core/types";
import { nearestLoopPosition } from "./compute-window";

/**
 * Focus pinning policy helpers.
 *
 * Store owns pinned sets. These helpers are used by the DOM focus-within layer
 * and the virtual window computation to behave deterministically.
 */

/**
 * Decide whether an index should be pinned given an event target that
 * is within a slide. The DOM layer should pass the logical index.
 *
 * The policy is intentionally minimal: focus pins, blur unpins.
 * Any "sticky pin" behavior should be explicit (custom reason).
 */
export function shouldPinOnFocus(): boolean {
  return true;
}

export function shouldUnpinOnBlur(): boolean {
  return true;
}

/**
 * Determines whether a window currently includes a logical index.
 *
 * In loop mode, the window is expressed in virtual position space and must be
 * checked using the nearest positional representation of the logical index.
 */
export function windowIncludesLogicalIndex(params: {
  readonly window: VirtualWindow;
  readonly logicalIndex: number;
  readonly slideCount: number;
  readonly loop: boolean;
  readonly centerIndex: number;
}): boolean {
  const start = params.window.start as unknown as number;
  const end = params.window.end as unknown as number;

  const idx = Math.trunc(params.logicalIndex);
  if (params.slideCount <= 0) return false;

  if (!params.loop) {
    return idx >= start && idx <= end;
  }

  const pos = nearestLoopPosition(idx, params.centerIndex, params.slideCount);
  return pos >= start && pos <= end;
}
