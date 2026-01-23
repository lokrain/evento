// src/components/headless/carousel/store/reduce/reduce-measure.ts

import type { CarouselAction } from "../../actions/action-types";
import { asPx } from "../../core/brands";
import type { CarouselState } from "../state";

function cloneMapIfChanged<K, V>(
  prev: ReadonlyMap<K, V>,
  next: ReadonlyMap<K, V>,
): ReadonlyMap<K, V> {
  // If the builder already returned a new Map instance, keep it.
  return prev === next ? prev : next;
}

type MeasureSetGapAction = Extract<CarouselAction, { type: "MEASURE/SET_GAP" }>;
type MeasureFlushAction = Extract<CarouselAction, { type: "MEASURE/FLUSH" }>;

export function reduceMeasure(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "MEASURE/SET_GAP": {
      const { gapPx } = (action as MeasureSetGapAction).payload;
      const gap = asPx(Math.max(0, gapPx));
      if (state.measure.gap === gap) return state;
      return {
        ...state,
        measure: { ...state.measure, gap },
      };
    }

    case "MEASURE/FLUSH": {
      const { viewportMainPx, slideSizeByIndex } = (action as MeasureFlushAction).payload;
      const viewportMain =
        viewportMainPx === null
          ? null
          : asPx(Math.max(0, viewportMainPx));
      const clonedSlideSizeByIndex = cloneMapIfChanged(
        state.measure.slideSizeByIndex,
        slideSizeByIndex,
      );

      const sameViewport = state.measure.viewportMain === viewportMain;
      const sameMap = state.measure.slideSizeByIndex === clonedSlideSizeByIndex;
      if (sameViewport && sameMap) return state;

      return {
        ...state,
        measure: {
          ...state.measure,
          viewportMain,
          slideSizeByIndex: clonedSlideSizeByIndex,
        },
      };
    }

    default:
      return state;
  }
}
