import type { CarouselA11yLiveMode } from "../../store/state";
import type { CarouselAction } from "../action-types";
import { mustBeBoolean, mustBeStringOrNull } from "../action-validate";

export function buildA11ySetLiveMode(params: {
  readonly mode: CarouselA11yLiveMode;
  readonly source: "policy" | "api";
}): CarouselAction {
  return {
    type: "A11Y/SET_LIVE_MODE",
    payload: { mode: params.mode, source: params.source },
  };
}

export function buildA11ySetAnnounceEnabled(params: {
  readonly enabled: unknown;
  readonly source: "policy" | "api";
}): CarouselAction {
  const enabled = mustBeBoolean(params.enabled, "enabled");
  return {
    type: "A11Y/SET_ANNOUNCE_ENABLED",
    payload: { enabled, source: params.source },
  };
}

export function buildA11yAnnounce(params: {
  readonly text: unknown;
  readonly source: "policy" | "api";
}): CarouselAction {
  const text = mustBeStringOrNull(params.text, "text");
  return {
    type: "A11Y/ANNOUNCE",
    payload: { text, source: params.source },
  };
}

export function buildA11yClearAnnouncement(source: "policy" | "api"): CarouselAction {
  return {
    type: "A11Y/CLEAR_ANNOUNCEMENT",
    payload: { source },
  };
}
