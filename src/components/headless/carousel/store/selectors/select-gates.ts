// src/components/headless/carousel/store/selectors/select-gates.ts

import type { CarouselGatesState, CarouselState } from "../state";

export function selectGates(state: CarouselState): CarouselGatesState {
  return state.gates;
}

export function selectAutoplayEnabled(state: CarouselState): boolean {
  return state.autoplay.enabled;
}
