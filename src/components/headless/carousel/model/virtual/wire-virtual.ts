import type { LogicalIndex, VirtualWindow, WindowSize } from "../../core/types";
import { asIndex } from "../../core/brands";
import { computeVirtualWindow } from "./compute-window";
import { computeVirtualSlots } from "./loop-keys";

export interface ComputeVirtualUpdateInput {
  /**
   * Total number of logical slides. Must be >= 0.
   * If 0, computeVirtualWindow returns { window: null, seamBucket: 0 }.
   */
  readonly slideCount: number;

  /**
   * Loop mode enabled.
   */
  readonly loop: boolean;

  /**
   * Current logical index as stored (or derived) in state.
   * Note: this is NOT the public Controllable config.
   */
  readonly index: LogicalIndex;

  /**
   * Virtual window size and overscan.
   * These are branded in core/types but are runtime numbers.
   */
  readonly windowSize: WindowSize;
  readonly overscan: number;

  /**
   * Indices that must remain mounted (e.g., focus-pinned).
   * Use a Set for O(1) membership and de-duplication.
   */
  readonly pinned: ReadonlySet<number>;

  /**
   * Current store epoch (state.virtual.epoch).
   */
  readonly prevEpoch: number;

  /**
   * Last seam bucket observed by the orchestrator (ref-owned).
   */
  readonly prevSeamBucket: number;
}

export interface ComputeVirtualUpdateResult {
  /**
   * Computed window to dispatch into store.
   */
  readonly window: VirtualWindow | null;

  /**
   * Seam bucket from computeVirtualWindow in loop mode; 0 in non-loop mode.
   */
  readonly seamBucket: number;

  /**
   * If non-null, orchestrator must dispatch buildVirtualSetEpoch(nextEpoch, "loop-seam").
   */
  readonly nextEpoch: number | null;

  /**
   * Value the orchestrator should store into its seamBucket ref after the update.
   */
  readonly nextSeamBucket: number;
}

/**
 * Compute virtualization window and loop seam behavior.
 *
 * Enterprise contract:
 * - PURE: no DOM, no timers, no store access.
 * - Encodes epoch bump policy for loop seams:
 *   - In loop mode, if seamBucket changes, nextEpoch = prevEpoch + 1
 *   - In non-loop mode, seamBucket is forced to 0 and nextEpoch is null
 *
 * Orchestrator responsibilities:
 * - dispatch buildVirtualSetWindow(result.window)
 * - if result.nextEpoch != null:
 *     - persist seam bucket ref: result.nextSeamBucket
 *     - dispatch buildVirtualSetEpoch(result.nextEpoch, "loop-seam")
 * - else:
 *     - persist seam bucket ref: result.nextSeamBucket (still required to keep ref consistent)
 */
export function computeVirtualUpdate(input: ComputeVirtualUpdateInput): ComputeVirtualUpdateResult {
  const res = computeVirtualWindow({
    slideCount: input.slideCount,
    loop: input.loop,
    index: input.index,
    windowSize: input.windowSize,
    overscan: input.overscan,
    pinned: input.pinned,
  });

  if (!input.loop) {
    return {
      window: res.window,
      seamBucket: 0,
      nextEpoch: null,
      nextSeamBucket: 0,
    };
  }

  const seamChanged = res.seamBucket !== input.prevSeamBucket;

  return {
    window: res.window,
    seamBucket: res.seamBucket,
    nextEpoch: seamChanged ? input.prevEpoch + 1 : null,
    nextSeamBucket: res.seamBucket,
  };
}

export interface DeriveRenderSlotsInput {
  readonly window: NonNullable<VirtualWindow>;
  readonly slideCount: number;
  readonly loop: boolean;
  readonly epoch: number;
}

export interface RenderSlot {
  readonly key: string;
  readonly logicalIndex: number;
}

/**
 * Derive render slots for React rendering from a computed window.
 *
 * Note:
 * - computeVirtualSlots is the only module that understands how to map
 *   "virtual position space" (window.start/end) into logical indices under loop.
 */
export function deriveRenderSlots(input: DeriveRenderSlotsInput): ReadonlyArray<RenderSlot> {
  const items = computeVirtualSlots({
    window: input.window,
    slideCount: input.slideCount,
    loop: input.loop,
    epoch: input.epoch,
  });

  return items.map((x) => ({ key: x.key, logicalIndex: x.logicalIndex }));
}

/**
 * Convenience helper for orchestrators that hold `index` as a number.
 * Ensures we always pass a LogicalIndex into computeVirtualUpdate.
 *
 * This keeps brand construction localized and avoids `as unknown as LogicalIndex` patterns.
 */
export function asLogicalIndex(index: number): LogicalIndex {
  return asIndex(index);
}
