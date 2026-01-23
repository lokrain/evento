import type { CarouselA11yLiveMode, CarouselA11yState, CarouselState } from "../state";

export function selectA11y(state: CarouselState): CarouselA11yState {
  return state.a11y;
}

export function selectLiveMode(state: CarouselState): CarouselA11yLiveMode {
  return state.a11y.liveMode;
}

export function selectAnnounceEnabled(state: CarouselState): boolean {
  return state.a11y.announceEnabled;
}

export function selectLastAnnouncement(state: CarouselState): string | null {
  return state.a11y.lastAnnouncement;
}
