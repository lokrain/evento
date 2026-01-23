import type { CarouselAction } from "../actions/action-types";
import type { CarouselState } from "./state";

import { reduceA11y } from "./reduce/reduce-a11y";
import { reduceAutoplay } from "./reduce/reduce-autoplay";
import { reduceMeasure } from "./reduce/reduce-measure";
import { reduceMotion } from "./reduce/reduce-motion";
import { reduceNavigation } from "./reduce/reduce-navigation";
import { reduceVirtual } from "./reduce/reduce-virtual";

/**
 * Single writer for carousel state.
 * All state changes must go through this reducer.
 */
export function reduceCarousel(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    // measurement
    case "MEASURE/FLUSH":
    case "MEASURE/SET_GAP":
      return reduceMeasure(state, action);

    // navigation
    case "NAV/REQUEST":
    case "NAV/COMMIT_INDEX":
    case "NAV/SET_SLIDE_COUNT":
      return reduceNavigation(state, action);

    // motion/settle lifecycle
    case "MOTION/START":
    case "MOTION/SETTLE_PENDING":
    case "MOTION/SETTLE_COMMIT":
    case "MOTION/CLEAR":
      return reduceMotion(state, action);

    // virtualization
    case "VIRTUAL/SET_WINDOW":
    case "VIRTUAL/PIN":
    case "VIRTUAL/UNPIN":
    case "VIRTUAL/SET_EPOCH":
      return reduceVirtual(state, action);

    // autoplay + gates
    case "GATE/SET":
    case "AUTOPLAY/SET_ENABLED":
    case "AUTOPLAY/SET_INTERVAL":
    case "AUTOPLAY/MANUAL_PAUSE":
      return reduceAutoplay(state, action);

    // a11y
    case "A11Y/SET_LIVE_MODE":
    case "A11Y/SET_ANNOUNCE_ENABLED":
    case "A11Y/ANNOUNCE":
    case "A11Y/CLEAR_ANNOUNCEMENT":
      return reduceA11y(state, action);

    default:
      // Forward compatible by default.
      // If you prefer "dev throw", we can add a guarded throw here.
      return state;
  }
}
