// src/components/headless/carousel/store/reduce/reduce-motion.ts

import type { CarouselAction } from "../../actions/action-types";
import type { CarouselState } from "../state";

export function reduceMotion(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "MOTION/START": {
      // new token for a new motion request
      const nextToken = state.motion.token + 1;
      return {
        ...state,
        motion: {
          token: nextToken,
          pendingToken: nextToken,
          isAnimating: action.payload.isAnimating,
        },
        // policy: motion implies not dragging (if caller starts motion after drag end)
        isDragging: state.isDragging,
      };
    }

    case "MOTION/SETTLE_PENDING": {
      // mark which token we are waiting to settle
      const pending = action.payload.token;
      if (state.motion.pendingToken === pending) return state;
      return {
        ...state,
        motion: {
          ...state.motion,
          pendingToken: pending,
        },
      };
    }

    case "MOTION/SETTLE_COMMIT": {
      // exactly-one-settle: only commit if token matches pendingToken
      if (state.motion.pendingToken === null) return state;
      if (action.payload.token !== state.motion.pendingToken) return state;

      return {
        ...state,
        motion: {
          ...state.motion,
          pendingToken: null,
          isAnimating: false,
        },
      };
    }

    case "MOTION/CLEAR": {
      if (state.motion.pendingToken === null && state.motion.isAnimating === false) return state;
      return {
        ...state,
        motion: { ...state.motion, pendingToken: null, isAnimating: false },
      };
    }

    default:
      return state;
  }
}
