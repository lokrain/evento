import { asIndex } from "../../core/brands";
import { clampIndex } from "../../core/clamp";
import type { VirtualWindow } from "../../core/types";

/**
 * Loop-safe keying and index mapping for virtual windows.
 *
 * We render a window of "positions" start..end inclusive.
 * Each position maps to a logical index via modulo (loop) or identity (non-loop).
 *
 * Keys must be based on position + epoch/bucket to avoid DOM identity reuse
 * when the same logical index appears at different loop positions.
 */

export interface VirtualSlot {
  readonly position: number;
  readonly logicalIndex: number;
  readonly key: string;
}

export function computeVirtualSlots(params: {
  readonly window: VirtualWindow;
  readonly slideCount: number;
  readonly loop: boolean;

  /**
   * A stable integer that changes when shifting across loop seams.
   * Recommended: store.virtual.epoch OR model seamBucket-based epoch.
   */
  readonly epoch: number;
}): ReadonlyArray<VirtualSlot> {
  const count = Math.max(0, Math.trunc(params.slideCount));
  if (count === 0) return [];

  const start = Math.trunc(params.window.start as unknown as number);
  const end = Math.trunc(params.window.end as unknown as number);

  const out: VirtualSlot[] = [];
  for (let pos = start; pos <= end; pos += 1) {
    const logical = params.loop
      ? (clampIndex(asIndex(pos), count, true) as unknown as number)
      : pos;

    // Key uses epoch + position, not logical index, to keep identity stable.
    // If you want fully stable keys across all shifts, include start as well,
    // but epoch already captures seam changes.
    const key = `c:${params.epoch}:${pos}`;

    out.push({
      position: pos,
      logicalIndex: logical,
      key,
    });
  }
  return out;
}
