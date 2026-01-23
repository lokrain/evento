import type { LogicalIndex, VirtualWindow, WindowSize } from "../../core/types";
import { asIndex, asWindowSize } from "../../core/brands";

/**
 * Virtualization window computation.
 *
 * Invariants:
 * - Returns an inclusive [start, end] window in "virtual position space".
 * - In loop mode, start/end may be outside [0..count-1]. Rendering maps positions to logical indices.
 * - In non-loop mode, start/end are clamped within [0..count-1].
 * - Pinned indices are always included by expanding the window if necessary.
 */
export interface ComputeWindowInput {
  readonly slideCount: number;
  readonly loop: boolean;

  readonly index: LogicalIndex;

  /**
   * Base desired window size (number of slides). Best as an odd number.
   */
  readonly windowSize: WindowSize;

  /**
   * Additional slides to render on each side.
   */
  readonly overscan: number;

  /**
   * Indices that must remain mounted (e.g. focus-within).
   */
  readonly pinned: ReadonlySet<number>;
}

export interface ComputeWindowResult {
  readonly window: VirtualWindow | null;

  /**
   * A deterministic "seam bucket" integer for loop mode (or 0 for non-loop).
   * Used by loop keying to keep DOM identity stable when shifting across seams.
   */
  readonly seamBucket: number;
}

export function computeVirtualWindow(input: ComputeWindowInput): ComputeWindowResult {
  const count = Math.max(0, Math.trunc(input.slideCount));
  if (count === 0) {
    return { window: null, seamBucket: 0 };
  }

  const loop = input.loop;
  const base = Math.max(1, Math.trunc(input.windowSize as unknown as number));
  const overscan = Math.max(0, Math.trunc(input.overscan));

  // Effective size includes overscan on both sides.
  const effective = makeOdd(base + overscan * 2);

  const center = Math.trunc(input.index as unknown as number);
  const half = Math.floor(effective / 2);

  let startPos = center - half;
  let endPos = startPos + effective - 1;

  // Include pinned slides by expanding window if necessary.
  // In loop mode, choose the pinned position representation closest to current center.
  if (input.pinned.size > 0) {
    let minPinnedPos = startPos;
    let maxPinnedPos = endPos;

    for (const logical of input.pinned) {
      const logicalIdx = clampNonNegInt(logical);
      const pos = loop
        ? nearestLoopPosition(logicalIdx, center, count)
        : logicalIdx;

      if (pos < minPinnedPos) minPinnedPos = pos;
      if (pos > maxPinnedPos) maxPinnedPos = pos;
    }

    if (minPinnedPos < startPos) startPos = minPinnedPos;
    if (maxPinnedPos > endPos) endPos = maxPinnedPos;
  }

  // Non-loop must clamp within bounds.
  if (!loop) {
    const span = endPos - startPos + 1;

    if (span >= count) {
      startPos = 0;
      endPos = count - 1;
    } else {
      if (startPos < 0) {
        endPos += -startPos;
        startPos = 0;
      }
      if (endPos > count - 1) {
        const diff = endPos - (count - 1);
        startPos -= diff;
        endPos = count - 1;
        if (startPos < 0) startPos = 0;
      }
    }
  }

  const size = endPos - startPos + 1;
  const window: VirtualWindow = {
    start: asIndex(startPos),
    end: asIndex(endPos),
    size: asWindowSize(size),
  };

  const seamBucket = loop ? computeSeamBucket(startPos, count) : 0;

  return { window, seamBucket };
}

function clampNonNegInt(n: number): number {
  const i = Math.trunc(n);
  return i < 0 ? 0 : i;
}

function makeOdd(n: number): number {
  const i = Math.max(1, Math.trunc(n));
  return i % 2 === 1 ? i : i + 1;
}

/**
 * In loop mode, a given logical index corresponds to infinite positions:
 *   ... i-count, i, i+count, i+2count, ...
 * Choose the representation closest to the center position.
 */
export function nearestLoopPosition(logicalIndex: number, centerPos: number, count: number): number {
  if (count <= 0) return logicalIndex;

  const c = Math.trunc(centerPos);
  const base = Math.trunc(logicalIndex);

  // k such that base + k*count is near center.
  const k = Math.round((c - base) / count);
  return base + k * count;
}

/**
 * Seam bucket is a coarse measure of which "lap" startPos is on:
 * - startPos in [0..count-1] -> 0
 * - startPos in [count..2count-1] -> 1
 * - startPos in [-count..-1] -> -1, etc.
 *
 * Used for stable keying when moving across loop seams.
 */
export function computeSeamBucket(startPos: number, count: number): number {
  if (count <= 0) return 0;
  // floor division for negatives:
  // e.g., -1 / 5 -> -1 bucket, -6 / 5 -> -2 bucket
  const s = Math.trunc(startPos);
  if (s >= 0) return Math.floor(s / count);
  return -Math.ceil((-s) / count);
}
