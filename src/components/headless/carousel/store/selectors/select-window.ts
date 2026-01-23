// src/components/headless/carousel/store/selectors/select-window.ts

import type { VirtualWindow } from "../../core/types";
import type { CarouselState } from "../state";

export function selectVirtualWindow(state: CarouselState): VirtualWindow | null {
  return state.virtual.window;
}

export function selectPinnedIndices(state: CarouselState): ReadonlySet<number> {
  return state.virtual.pinned;
}

export function selectVirtualEpoch(state: CarouselState): number {
  return state.virtual.epoch;
}
