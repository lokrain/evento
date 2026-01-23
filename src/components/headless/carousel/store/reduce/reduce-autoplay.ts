import type { CarouselAction } from "../../actions/action-types";
import type { CarouselState } from "../state";
import { asMs } from "../../core/brands";

export function reduceAutoplay(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "GATE/SET": {
      const { gate, value } = action.payload;
      if (state.gates[gate] === value) return state;
      return { ...state, gates: { ...state.gates, [gate]: value } };
    }

    case "AUTOPLAY/SET_ENABLED": {
      const enabled = Boolean(action.payload.enabled);
      if (state.autoplay.enabled === enabled) return state;
      return { ...state, autoplay: { ...state.autoplay, enabled } };
    }

    case "AUTOPLAY/SET_INTERVAL": {
      const intervalMs = asMs(Math.max(0, Math.trunc(action.payload.intervalMs)));
      if (state.autoplay.intervalMs === intervalMs) return state;
      return { ...state, autoplay: { ...state.autoplay, intervalMs } };
    }

    case "AUTOPLAY/MANUAL_PAUSE": {
      const paused = Boolean(action.payload.paused);
      if (state.gates.manualPause === paused) return state;
      return { ...state, gates: { ...state.gates, manualPause: paused } };
    }

    default:
      return state;
  }
}
