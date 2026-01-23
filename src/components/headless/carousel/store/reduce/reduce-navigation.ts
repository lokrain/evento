// src/components/headless/carousel/store/reduce/reduce-navigation.ts

import type { CarouselAction } from "../../actions/action-types";
import { asIndex } from "../../core/brands"; 
import { clampIndex } from "../../core/clamp";
import type { CarouselState } from "../state";

export function reduceNavigation(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "NAV/SET_SLIDE_COUNT": {
      const nextCount = Math.max(0, Math.trunc(action.payload.slideCount));
      if (nextCount === state.slideCount) return state;

      const nextIndex = clampIndex(state.index, nextCount, state.loop);

      return {
        ...state,
        slideCount: nextCount,
        index: nextIndex,
      };
    }

    /**
     * NAV/REQUEST does not commit index; it marks intent (handled by motion/snap in other layers).
     * Store keeps it no-op for index, but we may track flags later (e.g., desiredIndex).
     */
    case "NAV/REQUEST": {
      return state;
    }

    /**
     * Only commit index at boundary (settle).
     */
    case "NAV/COMMIT_INDEX": {
      const next = clampIndex(asIndex(action.payload.index), state.slideCount, state.loop);
      if (next === state.index) return state;
      return { ...state, index: next };
    }

    default:
      return state;
  }
}
