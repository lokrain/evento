import type { Px } from "../../core/types";
import type { CarouselAction } from "../action-types";
import { toNonNegInt, toNonNegPx, toNullableNonNegPx } from "../action-validate";

/**
 * Build a gap update action.
 */
export function buildMeasureSetGap(gapPx: unknown): CarouselAction {
  const gap = toNonNegInt(gapPx, "gapPx");
  return {
    type: "MEASURE/SET_GAP",
    payload: { gapPx: gap },
  };
}

/**
 * Build a measurement flush action.
 *
 * slideSizes input can be:
 * - ReadonlyArray<number> indexed by logical index
 * - ReadonlyMap<number, number>
 *
 * Output is a Map<number, Px> with non-negative sizes.
 */
export function buildMeasureFlush(params: {
  readonly viewportMainPx: unknown;
  readonly slideSizes: ReadonlyArray<unknown> | ReadonlyMap<number, unknown>;
}): CarouselAction {
  const viewportMainPx = toNullableNonNegPx(params.viewportMainPx, "viewportMainPx");

  const out = new Map<number, Px>();

  if (Array.isArray(params.slideSizes)) {
    const arr = params.slideSizes;
    for (let i = 0; i < arr.length; i += 1) {
      const size = toNonNegPx(arr[i], `slideSizes[${i}]`);
      out.set(i, size);
    }
  } else {
    for (const [k, v] of params.slideSizes.entries()) {
      const idx = toNonNegInt(k, "slideSizes key");
      const size = toNonNegPx(v, `slideSizes.get(${idx})`);
      out.set(idx, size);
    }
  }

  return {
    type: "MEASURE/FLUSH",
    payload: {
      viewportMainPx: viewportMainPx === null ? null : (viewportMainPx as unknown as number),
      slideSizeByIndex: out,
    },
  };
}
