import type { CarouselAction } from "../../actions/action-types";
import type { CarouselState } from "../state";

/**
 * A11y policy state is intentionally small and boundary-driven.
 * - Store does not compute text; it only stores what model/policy decides.
 * - Live announcements should be updated on settle boundaries, not per scroll frame.
 */
export function reduceA11y(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "A11Y/SET_LIVE_MODE": {
      const next = action.payload.mode;
      if (state.a11y.liveMode === next) return state;
      return { ...state, a11y: { ...state.a11y, liveMode: next } };
    }

    case "A11Y/SET_ANNOUNCE_ENABLED": {
      const enabled = Boolean(action.payload.enabled);
      if (state.a11y.announceEnabled === enabled) return state;
      return { ...state, a11y: { ...state.a11y, announceEnabled: enabled } };
    }

    case "A11Y/ANNOUNCE": {
      const text = action.payload.text ?? null;
      if (state.a11y.lastAnnouncement === text) return state;
      return { ...state, a11y: { ...state.a11y, lastAnnouncement: text } };
    }

    case "A11Y/CLEAR_ANNOUNCEMENT": {
      if (state.a11y.lastAnnouncement === null) return state;
      return { ...state, a11y: { ...state.a11y, lastAnnouncement: null } };
    }

    default:
      return state;
  }
}
